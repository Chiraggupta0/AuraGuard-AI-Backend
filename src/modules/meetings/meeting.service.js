const meetingRepository = require('./meeting.repository');
const ApiError = require('../../utils/ApiError');
const { MEETING_STATUS } = require('../../constants/domain');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');

const createMeeting = async (hostId, data) => meetingRepository.create({ ...data, host: hostId });

const getMeetingById = async (id) => {
  const meeting = await meetingRepository.findById(id);
  if (!meeting) throw ApiError.notFound('Meeting not found');
  return meeting;
};

const getMeetingByRoomId = async (roomId) => {
  const meeting = await meetingRepository.findByRoomId(roomId);
  if (!meeting) throw ApiError.notFound('Meeting not found');
  return meeting;
};

const listMeetings = async (query, requestingUser) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  // Non-privileged users only see meetings they hosted or joined.
  if (!['admin', 'super_admin', 'moderator'].includes(requestingUser.role)) {
    filter.$or = [{ host: requestingUser.id }, { 'participants.user': requestingUser.id }];
  }

  const [meetings, total] = await Promise.all([
    meetingRepository.findAll({ filter, skip, limit }),
    meetingRepository.count(filter),
  ]);

  return { meetings, meta: buildPaginationMeta({ page, limit, total }) };
};

const updateMeeting = async (id, updates) => {
  const meeting = await meetingRepository.updateById(id, updates);
  if (!meeting) throw ApiError.notFound('Meeting not found');
  return meeting;
};

const startMeeting = async (id) =>
  meetingRepository.updateById(id, { status: MEETING_STATUS.ONGOING, startedAt: new Date() });

const endMeeting = async (id) =>
  meetingRepository.updateById(id, { status: MEETING_STATUS.ENDED, endedAt: new Date() });

const joinMeeting = async (id, userId, options = {}) =>
  meetingRepository.addParticipant(id, {
    user: userId,
    isVerifiedAdultMode: options.isVerifiedAdultMode || false,
  });

const leaveMeeting = async (id, userId) => meetingRepository.markParticipantLeft(id, userId);

module.exports = {
  createMeeting,
  getMeetingById,
  getMeetingByRoomId,
  listMeetings,
  updateMeeting,
  startMeeting,
  endMeeting,
  joinMeeting,
  leaveMeeting,
};
