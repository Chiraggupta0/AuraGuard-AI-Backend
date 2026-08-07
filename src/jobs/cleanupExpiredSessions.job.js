const MonitoringSession = require('../modules/aiMonitoring/aiMonitoring.model');
const logger = require('../config/logger');

const STALE_SESSION_HOURS = 6;

// Closes monitoring sessions that were never explicitly ended (e.g. client
// crashed / lost connection) so they don't linger as "active" forever.
const cleanupExpiredSessions = async () => {
  const staleThreshold = new Date(Date.now() - STALE_SESSION_HOURS * 60 * 60 * 1000);

  const result = await MonitoringSession.updateMany(
    { isActive: true, updatedAt: { $lt: staleThreshold } },
    { isActive: false, endedAt: new Date() }
  );

  if (result.modifiedCount > 0) {
    logger.info(`Cleaned up ${result.modifiedCount} stale monitoring session(s)`);
  }
};

module.exports = cleanupExpiredSessions;
