const Notification = require('./notification.model');

const create = (data) => Notification.create(data);

const findAllForUser = ({ userId, skip = 0, limit = 20, unreadOnly = false }) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  return Notification.find(filter).sort('-createdAt').skip(skip).limit(limit);
};

const countForUser = (userId, unreadOnly = false) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  return Notification.countDocuments(filter);
};

const markAsRead = (id, userId) =>
  Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

const markAllAsRead = (userId) =>
  Notification.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });

module.exports = { create, findAllForUser, countForUser, markAsRead, markAllAsRead };
