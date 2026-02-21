const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const { STATUS_CODES, ERROR_MESSAGES } = require('../utils/constants');
const { createErrorResponse } = require('../utils/helpers');

/**
 * Protect routes - Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        createErrorResponse(ERROR_MESSAGES.TOKEN_MISSING)
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by id from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        createErrorResponse(ERROR_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(STATUS_CODES.FORBIDDEN).json(
        createErrorResponse('Account is deactivated')
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json(
      createErrorResponse(ERROR_MESSAGES.TOKEN_INVALID)
    );
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json(
        createErrorResponse(ERROR_MESSAGES.PERMISSION_DENIED)
      );
    }
    next();
  };
};

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
