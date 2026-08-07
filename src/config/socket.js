const { Server } = require('socket.io');
const env = require('./env');

let io;

// Creates the Socket.IO server and attaches it to the given HTTP server.
// Kept separate from src/sockets/index.js so config (CORS, adapters, etc.)
// stays isolated from event/handler wiring.
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
    pingTimeout: 30000,
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet');
  }
  return io;
};

module.exports = { initSocket, getIO };
