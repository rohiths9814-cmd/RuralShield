import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import keyService from './key.service.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const authService = {
  /**
   * Register a new user
   * Generates RSA keypair, stores public key, returns private key to user
   */
  async register({ username, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict('Email already registered');
      }
      throw ApiError.conflict('Username already taken');
    }

    // Generate key pair
    const { publicKey, privateKey } = keyService.generateKeyPair();

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      publicKey,
    });

    // Generate JWT
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
        avatar: user.getAvatar(),
        createdAt: user.createdAt,
      },
      // Private key returned ONCE — user must save it
      privateKey,
    };
  },

  /**
   * Login an existing user
   */
  async login({ email, password }) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

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
        avatar: user.getAvatar(),
        createdAt: user.createdAt,
      },
    };
  },

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      publicKey: user.publicKey,
      avatar: user.getAvatar(),
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
