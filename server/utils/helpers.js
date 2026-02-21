// utils/helpers.js
/**
 * Helper utility functions
 */

/**
 * Create standardized API response
 */
const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data && { data })
  };
};

/**
 * Create error response
 */
const createErrorResponse = (message, errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors })
  };
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

/**
 * Calculate pagination metadata
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  createResponse,
  createErrorResponse,
  sanitizeUser,
  getPaginationMeta
};