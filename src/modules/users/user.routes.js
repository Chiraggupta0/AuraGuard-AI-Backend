const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const {
  updateProfileSchema,
  updateUserRoleSchema,
  listUsersQuerySchema,
} = require('./user.validator');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(listUsersQuerySchema, 'query'),
  userController.listUsers
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  userController.getUserById
);
router.patch(
  '/:id/role',
  authorize(ROLES.SUPER_ADMIN),
  validate(updateUserRoleSchema),
  userController.updateUserRole
);
router.patch(
  '/:id/deactivate',
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  userController.deactivateUser
);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), userController.deleteUser);

module.exports = router;
