const express = require('express');
const reportController = require('./report.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const {
  createReportSchema,
  resolveReportSchema,
  listReportsQuerySchema,
} = require('./report.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createReportSchema), reportController.fileReport);
router.get(
  '/',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(listReportsQuerySchema, 'query'),
  reportController.listReports
);
router.get(
  '/:id',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  reportController.getReport
);
router.patch(
  '/:id/resolve',
  authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(resolveReportSchema),
  reportController.resolveReport
);

module.exports = router;
