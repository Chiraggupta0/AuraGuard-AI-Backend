const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// Normalizes known error shapes (Mongoose, JWT, ApiError) into a consistent
// ApiError before the final handler serializes the response.
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const details = Object.values(err.errors).map((e) => e.message);
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', details);
  }

  if (err.name === 'CastError') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid value for field "${err.path}"`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return new ApiError(HTTP_STATUS.CONFLICT, `${field || 'Field'} already exists`);
  }

  if (err.name === 'JsonWebTokenError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication token expired');
  }

  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    err.message || 'Internal server error',
    null,
    false
  );
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  if (!error.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message,
    details: error.details || undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
