const crypto = require('crypto');
const userRepository = require('../users/user.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateAuthTokens, verifyRefreshToken } = require('../../utils/generateToken');
const ApiError = require('../../utils/ApiError');
const MESSAGES = require('../../constants/messages');
const emailService = require('../../services/email.service');
const logger = require('../../config/logger');

const register = async ({ name, email, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw ApiError.conflict(MESSAGES.USER.ALREADY_EXISTS);

  const hashedPassword = await hashPassword(password);
  const user = await userRepository.create({ name, email, password: hashedPassword });

  emailService
    .sendWelcomeEmail(user)
    .catch((err) => logger.error(`Welcome email failed: ${err.message}`));

  const tokens = generateAuthTokens(user);
  return { user, tokens };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user) throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);

  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateAuthTokens(user);
  return { user, tokens };
};

const refreshTokens = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_MISSING);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);

  return generateAuthTokens(user);
};

const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  // Always resolve successfully to avoid leaking which emails are registered.
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  // TODO: persist a hashed version of resetToken + expiry on the user record
  // once a PasswordReset model/field is introduced.
  await emailService.sendPasswordResetEmail(user, resetToken);
};

const resetPassword = async (_token, _newPassword) => {
  // TODO: look up the user by hashed reset token, verify expiry, then update password.
  throw ApiError.internal('resetPassword is not yet implemented — pending PasswordReset model');
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId, { withPassword: true });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save({ validateBeforeSave: false });
};

module.exports = {
  register,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword,
};
