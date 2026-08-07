const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const MESSAGES = require('../constants/messages');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// General-purpose limiter applied to the whole API.
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: MESSAGES.GENERIC.RATE_LIMITED },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

// Stricter limiter for sensitive auth endpoints (login, register, forgot password).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: MESSAGES.GENERIC.RATE_LIMITED },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

module.exports = { apiLimiter, authLimiter };
