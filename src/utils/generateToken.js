const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

const generateAuthTokens = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateAuthTokens,
};
