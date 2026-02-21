const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../utils/constants');
const { createErrorResponse } = require('../utils/helpers');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    if (process.env.NODE_ENV === 'development') {
      console.error('Validation Error:', extractedErrors);
    }

    return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(
      createErrorResponse('Validation failed', extractedErrors)
    );
  }

  next();
};

module.exports = { validate };
