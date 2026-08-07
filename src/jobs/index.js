const cron = { schedule: null };
try {
  // node-cron isn't in package.json dependencies yet (add it when jobs go live);
  // this guard keeps the app bootable without it in the meantime.
  Object.assign(cron, require('node-cron'));
} catch (_error) {
  cron.schedule = null;
}

const cleanupExpiredSessions = require('./cleanupExpiredSessions.job');
const logger = require('../config/logger');

// Registers all scheduled jobs. Called once from src/server.js after the DB
// connects. No-ops safely if `node-cron` hasn't been installed yet.
const registerJobs = () => {
  if (!cron.schedule) {
    logger.warn('node-cron not installed — scheduled jobs are disabled');
    return;
  }

  // Every hour, on the hour.
  cron.schedule('0 * * * *', () => {
    cleanupExpiredSessions().catch((err) =>
      logger.error(`cleanupExpiredSessions job failed: ${err.message}`)
    );
  });

  logger.info('Scheduled jobs registered');
};

module.exports = registerJobs;
