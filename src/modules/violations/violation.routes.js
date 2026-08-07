const express = require('express');
const violationController = require('./violation.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const {
  createViolationSchema,
  updateViolationStatusSchema,
  listViolationsQuerySchema,
} = require('./violation.validator');

const router = express.Router();

router.use(authenticate);

// Created internally by the AI moderation pipeline, but exposed for manual
// reporting/testing too — restricted to moderators and above.
router.post(
  '/',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(createViolationSchema),
  violationController.createViolation
);
router.get(
  '/',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(listViolationsQuerySchema, 'query'),
  violationController.listViolations
);
router.get(
  '/:id',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  violationController.getViolation
);
router.patch(
  '/:id/status',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(updateViolationStatusSchema),
  violationController.updateViolationStatus
);

module.exports = router;
