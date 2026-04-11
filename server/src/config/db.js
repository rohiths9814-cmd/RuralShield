import mongoose from 'mongoose';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import env from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Spawns a standalone mongod process directly using the binary
 * that mongodb-memory-server downloads, with WiredTiger storage
 * engine for persistent data storage.
 */
async function startStandaloneMongod(dbPath, port) {
  // Get the binary path from mongodb-memory-server's binary management
  const { MongoBinary } = await import('mongodb-memory-server-core/lib/util/MongoBinary.js');
  const mongodPath = await MongoBinary.getPath();

  return new Promise((resolvePromise, reject) => {
    const args = [
      '--port', String(port),
      '--dbpath', dbPath,
      '--storageEngine', 'wiredTiger',
      '--bind_ip', '127.0.0.1',
      '--noauth',
      '--quiet', // suppress verbose log output that causes JSON parse issues
    ];

    const mongodProcess = spawn(mongodPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        reject(new Error('mongod failed to start within 15 seconds'));
        mongodProcess.kill();
      }
    }, 15000);

    let stderrOutput = '';

    mongodProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (/waiting for connections/i.test(output) && !started) {
        started = true;
        clearTimeout(timeout);
        resolvePromise({ process: mongodProcess, port });
      }
    });

    mongodProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrOutput += output;
      if (/waiting for connections/i.test(output) && !started) {
        started = true;
        clearTimeout(timeout);
        resolvePromise({ process: mongodProcess, port });
      }
    });

    mongodProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    mongodProcess.on('close', (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`mongod exited with code ${code} before becoming ready. stderr: ${stderrOutput}`));
      }
    });
  });
}

/**
 * Find an available port by trying the desired port first
 */
async function getAvailablePort(desiredPort) {
  const { createServer } = await import('net');
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(desiredPort, '127.0.0.1', () => {
      server.close(() => resolve(desiredPort));
    });
    server.on('error', () => {
      // Port is in use, try a random port
      const server2 = createServer();
      server2.listen(0, '127.0.0.1', () => {
        const port = server2.address().port;
        server2.close(() => resolve(port));
      });
    });
  });
}

const connectDB = async () => {
  let uri = env.MONGODB_URI;

  // ── Production: connect directly to the configured URI (Atlas) ──
  if (env.NODE_ENV === 'production') {
    try {
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      setupListeners();
      return conn;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  // ── Development: try configured URI first, then fall back to local mongod ──
  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    setupListeners();
    return conn;
  } catch (error) {
    console.warn(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('🔄 Starting local persistent MongoDB (development mode)...');

    try {
      const dbPath = resolve(__dirname, '..', '..', 'data', 'db');
      mkdirSync(dbPath, { recursive: true });

      const port = await getAvailablePort(27018);
      const { process: mongodProcess } = await startStandaloneMongod(dbPath, port);

      uri = `mongodb://127.0.0.1:${port}/quantum-secure-mail`;

      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
      });

      console.log(`✅ Persistent MongoDB started on port ${port}`);
      console.log(`📁 Data stored at: ${dbPath}`);
      console.log('✅ User data WILL persist across server restarts.');
      setupListeners();

      const shutdown = () => {
        if (mongodProcess && !mongodProcess.killed) {
          mongodProcess.kill('SIGTERM');
        }
      };
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      process.on('exit', shutdown);

      return conn;
    } catch (memError) {
      console.error('❌ Failed to start persistent MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

function setupListeners() {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected.');
  });
}

export default connectDB;
