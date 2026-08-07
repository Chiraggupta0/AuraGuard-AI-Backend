const express = require('express');
const moderationController = require('./moderation.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const {
  createModerationActionSchema,
  listModerationActionsQuerySchema,
} = require('./moderation.validator');

const router = express.Router();

router.use(authenticate, authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/', validate(createModerationActionSchema), moderationController.applyAction);
router.get(
  '/',
  validate(listModerationActionsQuerySchema, 'query'),
  moderationController.listActions
);
router.get('/:id', moderationController.getAction);

module.exports = router;
