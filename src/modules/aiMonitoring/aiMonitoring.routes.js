const express = require('express');
const aiMonitoringController = require('./aiMonitoring.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { startSessionSchema, analyzeTextSchema } = require('./aiMonitoring.validator');

const router = express.Router();

router.use(authenticate);

router.post('/sessions/start', validate(startSessionSchema), aiMonitoringController.startSession);
router.post('/sessions/end', validate(startSessionSchema), aiMonitoringController.endSession);
router.post('/analyze/text', validate(analyzeTextSchema), aiMonitoringController.analyzeText);

module.exports = router;
