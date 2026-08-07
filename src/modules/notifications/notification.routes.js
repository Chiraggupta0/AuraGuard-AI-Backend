const express = require('express');
const notificationController = require('./notification.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { listNotificationsQuerySchema } = require('./notification.validator');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  validate(listNotificationsQuerySchema, 'query'),
  notificationController.listNotifications
);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
