const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../utils/constants');

const isDev = process.env.NODE_ENV === 'development';

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: isDev ? 10000 : RATE_LIMIT.MAX_REQUESTS, // Much higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100, // Higher for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for creating posts
 */
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 100, // Higher for development
  message: {
    success: false,
    message: 'Post limit reached, please try again later'
  },
});

module.exports = { apiLimiter, authLimiter, postLimiter };