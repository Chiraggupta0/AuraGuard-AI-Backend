const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');
const MESSAGES = require('../../constants/messages');
const env = require('../../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
};

const setAuthCookies = (res, tokens) => {
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setAuthCookies(res, tokens);
  new ApiResponse(HTTP_STATUS.CREATED, MESSAGES.AUTH.REGISTER_SUCCESS, {
    user: user.toSafeJSON(),
    ...tokens,
  }).send(res);
});

const login = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  setAuthCookies(res, tokens);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.AUTH.LOGIN_SUCCESS, {
    user: user.toSafeJSON(),
    ...tokens,
  }).send(res);
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.AUTH.TOKEN_REFRESHED, tokens).send(res);
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.AUTH.LOGOUT_SUCCESS).send(res);
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  new ApiResponse(HTTP_STATUS.OK, 'If that email exists, a reset link has been sent').send(res);
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  new ApiResponse(HTTP_STATUS.OK, 'Password reset successfully').send(res);
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  new ApiResponse(HTTP_STATUS.OK, 'Password changed successfully').send(res);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
