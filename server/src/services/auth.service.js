import jwt from 'jsonwebtoken';
import UserStore from '../data/users.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const authService = {
  /**
   * Register — disabled in demo mode (users are hardcoded)
   */
  async register({ username, email, password }) {
    throw ApiError.badRequest(
      'Registration is disabled in demo mode. Please use one of the 10 pre-created accounts. Email: alice@securemail.com, Password: Password1'
    );
  },

  /**
   * Login an existing user
   */
  async login({ email, password }) {
    const user = UserStore.findByEmailWithPassword(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare password
    const isMatch = await UserStore.comparePassword(user, password);

    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
        avatar: UserStore._getAvatar(user),
        createdAt: user.createdAt,
      },
    };
  },

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const user = UserStore.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      publicKey: user.publicKey,
      avatar: UserStore._getAvatar(user),
      createdAt: user.createdAt,
    };
  },

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  },
};

export default authService;
