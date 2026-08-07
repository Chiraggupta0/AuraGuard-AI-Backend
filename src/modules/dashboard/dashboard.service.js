const Meeting = require('../meetings/meeting.model');
const Violation = require('../violations/violation.model');
const ModerationAction = require('../moderation/moderationAction.model');
const User = require('../users/user.model');
const { MEETING_STATUS, VIOLATION_STATUS } = require('../../constants/domain');
const { startOfDay } = require('../../helpers/date.helper');

// Aggregates cross-module counts for the moderator/admin dashboard overview.
// Kept read-only and side-effect free — this module owns no data of its own.
const getOverviewStats = async () => {
  const today = startOfDay(new Date());

  const [
    totalUsers,
    activeMeetings,
    totalMeetingsToday,
    pendingViolations,
    totalViolations,
    moderationActionsToday,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Meeting.countDocuments({ status: MEETING_STATUS.ONGOING }),
    Meeting.countDocuments({ createdAt: { $gte: today } }),
    Violation.countDocuments({ status: VIOLATION_STATUS.PENDING }),
    Violation.countDocuments(),
    ModerationAction.countDocuments({ createdAt: { $gte: today } }),
  ]);

  return {
    totalUsers,
    activeMeetings,
    totalMeetingsToday,
    pendingViolations,
    totalViolations,
    moderationActionsToday,
  };
};

const getViolationsBreakdown = async () => {
  const breakdown = await Violation.aggregate([
    { $group: { _id: { type: '$type', severity: '$severity' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return breakdown.map((item) => ({
    type: item._id.type,
    severity: item._id.severity,
    count: item.count,
  }));
};

const getRecentActivity = async (limit = 10) => {
  const [recentViolations, recentActions] = await Promise.all([
    Violation.find()
      .sort('-createdAt')
      .limit(limit)
      .populate('user', 'name')
      .populate('meeting', 'roomId'),
    ModerationAction.find().sort('-createdAt').limit(limit).populate('targetUser', 'name'),
  ]);

  return { recentViolations, recentActions };
};

module.exports = { getOverviewStats, getViolationsBreakdown, getRecentActivity };
