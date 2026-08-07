const ModerationAction = require('./moderationAction.model');
const ApiError = require('../../utils/ApiError');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');
const socketService = require('../../services/socket.service');
const SOCKET_EVENTS = require('../../constants/events');
const { MODERATION_ACTION_TYPES } = require('../../constants/domain');

// Applies a moderation action (blur video, mute audio, kick, ban, etc.),
// records it for audit purposes, and notifies the meeting room in realtime
// so clients can enforce it locally (e.g. actually blur the video element).
const applyAction = async ({
  meeting,
  targetUser,
  violation = null,
  actionType,
  performedBy = null,
  reason = '',
}) => {
  const action = await ModerationAction.create({
    meeting,
    targetUser,
    violation,
    actionType,
    performedBy,
    isAutomatic: !performedBy,
    reason,
  });

  const eventMap = {
    [MODERATION_ACTION_TYPES.VIDEO_BLUR]: SOCKET_EVENTS.MODERATION_VIDEO_BLURRED,
    [MODERATION_ACTION_TYPES.AUDIO_MUTE]: SOCKET_EVENTS.MODERATION_AUDIO_MUTED,
  };
  const event = eventMap[actionType] || SOCKET_EVENTS.MODERATION_ACTION_TAKEN;

  socketService.emitToMeeting(meeting, event, {
    targetUser,
    actionType,
    reason,
    actionId: action._id,
  });

  return action;
};

const getActionById = async (id) => {
  const action = await ModerationAction.findById(id)
    .populate('targetUser', 'name email')
    .populate('performedBy', 'name email');
  if (!action) throw ApiError.notFound('Moderation action not found');
  return action;
};

const listActions = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.meeting) filter.meeting = query.meeting;
  if (query.targetUser) filter.targetUser = query.targetUser;
  if (query.actionType) filter.actionType = query.actionType;

  const [actions, total] = await Promise.all([
    ModerationAction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('targetUser', 'name email')
      .populate('performedBy', 'name email'),
    ModerationAction.countDocuments(filter),
  ]);

  return { actions, meta: buildPaginationMeta({ page, limit, total }) };
};

module.exports = { applyAction, getActionById, listActions };
