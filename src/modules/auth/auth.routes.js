const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.validator');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
