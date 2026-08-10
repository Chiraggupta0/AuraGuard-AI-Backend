const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const registerSocketHandlers = require('./sockets');
const registerJobs = require('./jobs');

// Initialize Firebase Admin SDK before anything else
require('./config/firebase-admin');

const httpServer = http.createServer(app);

const startServer = async () => {
  await connectDB();

  const io = initSocket(httpServer);
  registerSocketHandlers(io);
  registerJobs();

  httpServer.listen(env.port, () => {
    logger.info(`AuraGuard AI backend running on port ${env.port} [${env.nodeEnv}]`);
  });
};

// ---- Graceful shutdown ----
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await disconnectDB();
    process.exit(0);
  });

  // Force-exit if shutdown hangs (e.g. a socket refuses to close).
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`);
  process.exit(1);
});

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
