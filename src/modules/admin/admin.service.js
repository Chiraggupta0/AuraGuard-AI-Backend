const userRepository = require('../users/user.repository');
const auditLogService = require('../auditLogs/auditLog.service');
const dashboardService = require('../dashboard/dashboard.service');
const ApiError = require('../../utils/ApiError');
const MESSAGES = require('../../constants/messages');

// Thin orchestration layer for admin-only operations. Delegates persistence
// to each domain's own repository/service and records an audit trail entry
// for every action performed here.

const banUser = async (adminId, targetUserId, reason, ipAddress) => {
  const user = await userRepository.updateById(targetUserId, { isActive: false });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);

  await auditLogService.logAction({
    actor: adminId,
    action: 'user.ban',
    targetType: 'User',
    targetId: targetUserId,
    metadata: { reason },
    ipAddress,
  });

  return user;
};

const unbanUser = async (adminId, targetUserId, ipAddress) => {
  const user = await userRepository.updateById(targetUserId, { isActive: true });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);

  await auditLogService.logAction({
    actor: adminId,
    action: 'user.unban',
    targetType: 'User',
    targetId: targetUserId,
    ipAddress,
  });

  return user;
};

const changeUserRole = async (adminId, targetUserId, role, ipAddress) => {
  const user = await userRepository.updateById(targetUserId, { role });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);

  await auditLogService.logAction({
    actor: adminId,
    action: 'user.role_change',
    targetType: 'User',
    targetId: targetUserId,
    metadata: { newRole: role },
    ipAddress,
  });

  return user;
};

const getSystemOverview = async () => dashboardService.getOverviewStats();

module.exports = { banUser, unbanUser, changeUserRole, getSystemOverview };
