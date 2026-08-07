const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const { banUserSchema, changeRoleSchema } = require('./admin.validator');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/overview', adminController.getSystemOverview);
router.patch('/users/:id/ban', validate(banUserSchema), adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.patch(
  '/users/:id/role',
  authorize(ROLES.SUPER_ADMIN),
  validate(changeRoleSchema),
  adminController.changeUserRole
);

module.exports = router;
