const ApiError = require('../utils/ApiError');
const MESSAGES = require('../constants/messages');

// Usage: router.delete('/:id', authenticate, authorize('admin', 'super_admin'), handler)
// Must run after the `authenticate` middleware so `req.user` is populated.
const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(MESSAGES.GENERIC.FORBIDDEN));
    }

    next();
  };

module.exports = authorize;
