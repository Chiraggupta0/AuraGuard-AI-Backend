const express = require('express');
const auditLogController = require('./auditLog.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { ROLES } = require('../../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', auditLogController.listLogs);

module.exports = router;
