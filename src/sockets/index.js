const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../modules/users/user.model');
const SOCKET_EVENTS = require('../constants/events');
const logger = require('../config/logger');
const registerMeetingHandlers = require('./handlers/meeting.handler');
const registerModerationHandlers = require('./handlers/moderation.handler');
const registerNotificationHandlers = require('./handlers/notification.handler');

// Socket-level auth: every connection must present a valid access token
// (mirrors src/middlewares/auth.middleware.js but for the handshake phase).
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) return next(new Error('Authentication token missing'));

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password');
    if (!user || !user.isActive) return next(new Error('Invalid or inactive user'));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

const registerSocketHandlers = (io) => {
  io.use(socketAuthMiddleware);

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.user.id})`);

    registerNotificationHandlers(io, socket);
    registerMeetingHandlers(io, socket);
    registerModerationHandlers(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      logger.info(`Socket disconnected: ${socket.id} (user: ${socket.user.id})`);
    });
  });
};

module.exports = registerSocketHandlers;
