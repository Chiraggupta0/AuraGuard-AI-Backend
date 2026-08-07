const auditLogRepository = require('./auditLog.repository');
const logger = require('../../config/logger');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');

// Fire-and-forget logging helper — other modules call this after a
// sensitive action completes. Never throws, so a logging failure can't take
// down the primary request.
const logAction = async ({ actor, action, targetType, targetId, metadata, ipAddress }) => {
  try {
    await auditLogRepository.create({ actor, action, targetType, targetId, metadata, ipAddress });
  } catch (error) {
    logger.error(`Failed to write audit log for action "${action}": ${error.message}`);
  }
};

const listLogs = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.actor) filter.actor = query.actor;
  if (query.action) filter.action = query.action;

  const [logs, total] = await Promise.all([
    auditLogRepository.findAll({ filter, skip, limit }),
    auditLogRepository.count(filter),
  ]);

  return { logs, meta: buildPaginationMeta({ page, limit, total }) };
};

module.exports = { logAction, listLogs };
