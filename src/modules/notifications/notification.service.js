const notificationRepository = require('./notification.repository');
const ApiError = require('../../utils/ApiError');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');
const socketService = require('../../services/socket.service');

// Persists a notification and pushes it to the user in realtime. Other
// modules (violations, moderation, reports) call this to notify users.
const notifyUser = async ({ user, type, title, message, relatedEntity, relatedEntityModel }) => {
  const notification = await notificationRepository.create({
    user,
    type,
    title,
    message,
    relatedEntity,
    relatedEntityModel,
  });

  socketService.emitNotification(user, notification);

  return notification;
};

const listNotifications = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [notifications, total] = await Promise.all([
    notificationRepository.findAllForUser({ userId, skip, limit, unreadOnly: query.unreadOnly }),
    notificationRepository.countForUser(userId, query.unreadOnly),
  ]);

  return { notifications, meta: buildPaginationMeta({ page, limit, total }) };
};

const markAsRead = async (id, userId) => {
  const notification = await notificationRepository.markAsRead(id, userId);
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
};

const markAllAsRead = async (userId) => notificationRepository.markAllAsRead(userId);

module.exports = { notifyUser, listNotifications, markAsRead, markAllAsRead };
