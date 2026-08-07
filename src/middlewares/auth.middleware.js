const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../modules/users/user.model');
const MESSAGES = require('../constants/messages');

// Verifies the access token from the Authorization header (or `accessToken`
// cookie as a fallback) and attaches the authenticated user to `req.user`.
const authenticate = catchAsync(async (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_MISSING);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
  }

  const user = await User.findById(payload.sub).select('-password');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
  }

  req.user = user;
  next();
});

module.exports = authenticate;
