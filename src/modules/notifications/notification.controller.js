const notificationService = require('./notification.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const listNotifications = catchAsync(async (req, res) => {
  const { notifications, meta } = await notificationService.listNotifications(
    req.user.id,
    req.query
  );
  new ApiResponse(HTTP_STATUS.OK, 'Notifications fetched', notifications, meta).send(res);
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  new ApiResponse(HTTP_STATUS.OK, 'Notification marked as read', notification).send(res);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  new ApiResponse(HTTP_STATUS.OK, 'All notifications marked as read').send(res);
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
