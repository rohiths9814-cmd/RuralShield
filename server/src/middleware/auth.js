import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header, verifies it,
 * and attaches the user object to req.user
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access denied. Invalid token format.');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized('User not found. Token may be invalid.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid token.'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Token expired. Please login again.'));
    } else {
      next(error);
    }
  }
};

export default auth;
