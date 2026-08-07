// Shared, human-readable response messages kept in one place for consistency
// and to make future i18n easier.
const MESSAGES = Object.freeze({
  AUTH: {
    REGISTER_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_REFRESHED: 'Access token refreshed',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    TOKEN_MISSING: 'Authentication token is missing',
    TOKEN_INVALID: 'Authentication token is invalid or expired',
  },
  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'A user with this email already exists',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
  },
  GENERIC: {
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    SERVER_ERROR: 'Something went wrong, please try again later',
    RATE_LIMITED: 'Too many requests, please try again later',
  },
});

module.exports = MESSAGES;
