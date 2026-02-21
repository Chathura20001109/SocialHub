const { STATUS_CODES } = require('../utils/constants');
const { createErrorResponse } = require('../utils/helpers');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = STATUS_CODES.BAD_REQUEST;
    message = 'Invalid ID format';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = STATUS_CODES.CONFLICT;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = STATUS_CODES.BAD_REQUEST;
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json(
    createErrorResponse(message, process.env.NODE_ENV === 'development' ? err.stack : null)
  );
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = STATUS_CODES.NOT_FOUND;
  next(error);
};

module.exports = { errorHandler, notFound };
