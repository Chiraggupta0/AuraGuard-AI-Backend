const express = require('express');
const settingController = require('./setting.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const { upsertSettingSchema } = require('./setting.validator');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', settingController.getAllSettings);
router.get('/:key', settingController.getSetting);
router.put('/', validate(upsertSettingSchema), settingController.upsertSetting);

module.exports = router;
