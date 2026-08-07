const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { ROLES } = require('../../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/overview', dashboardController.getOverview);
router.get('/violations-breakdown', dashboardController.getViolationsBreakdown);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
