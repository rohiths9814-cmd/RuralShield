import app from './src/app.js';
import env from './src/config/env.js';

const startServer = async () => {
  try {
    // No database needed — using in-memory storage with hardcoded users

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║     🔐 Quantum-Secure Mail API Server           ║
║──────────────────────────────────────────────────║
║  Port:        ${String(env.PORT).padEnd(35)}║
║  Environment: ${String(env.NODE_ENV).padEnd(35)}║
║  Storage:     In-Memory (10 demo users)${' '.repeat(10)}║
║  API URL:     http://localhost:${String(env.PORT).padEnd(19)}║
╚══════════════════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
