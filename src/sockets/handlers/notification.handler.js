const { userRoom } = require('../../services/socket.service');

// Every authenticated socket auto-joins its own private notification room so
// src/services/socket.service.js#emitToUser can reach it by userId alone.
const registerNotificationHandlers = (io, socket) => {
  socket.join(userRoom(socket.user.id));
};

module.exports = registerNotificationHandlers;
