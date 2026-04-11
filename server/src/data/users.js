import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generate a deterministic RSA key pair from a seed.
 * For demo purposes, we pre-generate one pair per user.
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

// Pre-hash the password "Password1" for all demo users
// bcryptjs.hashSync is used at module load time (one-time cost)
const defaultPasswordHash = bcrypt.hashSync('Password1', 12);

// Generate key pairs for each user
const keyPairs = Array.from({ length: 10 }, () => generateKeyPair());

/**
 * 10 hardcoded demo users
 * All passwords: Password1
 */
const users = [
  {
    _id: 'usr_001',
    username: 'alice',
    email: 'alice@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[0].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-15T08:00:00Z'),
    updatedAt: new Date('2026-01-15T08:00:00Z'),
  },
  {
    _id: 'usr_002',
    username: 'bob',
    email: 'bob@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[1].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-16T09:00:00Z'),
    updatedAt: new Date('2026-01-16T09:00:00Z'),
  },
  {
    _id: 'usr_003',
    username: 'charlie',
    email: 'charlie@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[2].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-17T10:00:00Z'),
    updatedAt: new Date('2026-01-17T10:00:00Z'),
  },
  {
    _id: 'usr_004',
    username: 'diana',
    email: 'diana@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[3].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-18T11:00:00Z'),
    updatedAt: new Date('2026-01-18T11:00:00Z'),
  },
  {
    _id: 'usr_005',
    username: 'ethan',
    email: 'ethan@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[4].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-19T12:00:00Z'),
    updatedAt: new Date('2026-01-19T12:00:00Z'),
  },
  {
    _id: 'usr_006',
    username: 'fiona',
    email: 'fiona@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[5].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-20T13:00:00Z'),
    updatedAt: new Date('2026-01-20T13:00:00Z'),
  },
  {
    _id: 'usr_007',
    username: 'george',
    email: 'george@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[6].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-21T14:00:00Z'),
    updatedAt: new Date('2026-01-21T14:00:00Z'),
  },
  {
    _id: 'usr_008',
    username: 'hannah',
    email: 'hannah@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[7].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-22T15:00:00Z'),
    updatedAt: new Date('2026-01-22T15:00:00Z'),
  },
  {
    _id: 'usr_009',
    username: 'isaac',
    email: 'isaac@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[8].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-23T16:00:00Z'),
    updatedAt: new Date('2026-01-23T16:00:00Z'),
  },
  {
    _id: 'usr_010',
    username: 'julia',
    email: 'julia@securemail.com',
    password: defaultPasswordHash,
    publicKey: keyPairs[9].publicKey,
    avatar: null,
    createdAt: new Date('2026-01-24T17:00:00Z'),
    updatedAt: new Date('2026-01-24T17:00:00Z'),
  },
];

/**
 * In-memory User store
 * Mimics the Mongoose model API so controllers/services don't need to change much.
 */
const UserStore = {
  _users: [...users],

  _sanitize(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },

  _getAvatar(user) {
    if (user.avatar) return user.avatar;
    const initials = user.username.substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=0ea5e9&color=fff&bold=true`;
  },

  findById(id) {
    const user = this._users.find(u => u._id === id);
    return user ? { ...user } : null;
  },

  findByEmail(email) {
    const user = this._users.find(u => u.email === email.toLowerCase());
    return user ? { ...user } : null;
  },

  findByEmailWithPassword(email) {
    return this._users.find(u => u.email === email.toLowerCase()) || null;
  },

  findByUsername(username) {
    const user = this._users.find(u => u.username === username);
    return user ? { ...user } : null;
  },

  findByEmailOrUsername(email, username) {
    return this._users.find(u => u.email === email.toLowerCase() || u.username === username) || null;
  },

  search(query, excludeId, limit = 10) {
    const q = query.toLowerCase();
    return this._users
      .filter(u => u._id !== excludeId)
      .filter(u => u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
      .slice(0, limit)
      .map(u => ({
        _id: u._id,
        username: u.username,
        email: u.email,
        avatar: this._getAvatar(u),
      }));
  },

  getAll() {
    return this._users.map(u => this._sanitize(u));
  },

  async comparePassword(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password);
  },
};

export default UserStore;
export { users, keyPairs };
