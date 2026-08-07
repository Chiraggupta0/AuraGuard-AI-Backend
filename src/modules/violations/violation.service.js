const violationRepository = require('./violation.repository');
const meetingRepository = require('../meetings/meeting.repository');
const userRepository = require('../users/user.repository');
const ApiError = require('../../utils/ApiError');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');
const socketService = require('../../services/socket.service');
const { VIOLATION_STATUS } = require('../../constants/domain');

// Called by the AI moderation pipeline (or manually by a moderator) whenever
// a policy violation is detected. Persists the record, bumps counters, and
// notifies clients in the meeting in realtime.
const recordViolation = async (data) => {
  const violation = await violationRepository.create(data);

  await Promise.all([
    meetingRepository.incrementViolationCount(data.meeting),
    userRepository.updateById(data.user, { $inc: { violationCount: 1 } }),
  ]);

  socketService.emitViolationDetected(data.meeting, violation);

  return violation;
};

const getViolationById = async (id) => {
  const violation = await violationRepository.findById(id);
  if (!violation) throw ApiError.notFound('Violation not found');
  return violation;
};

const listViolations = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.severity) filter.severity = query.severity;
  if (query.meeting) filter.meeting = query.meeting;
  if (query.user) filter.user = query.user;

  const [violations, total] = await Promise.all([
    violationRepository.findAll({ filter, skip, limit }),
    violationRepository.count(filter),
  ]);

  return { violations, meta: buildPaginationMeta({ page, limit, total }) };
};

const updateViolationStatus = async (id, status, reviewerId) => {
  const updates = { status };
  if (status !== VIOLATION_STATUS.PENDING) {
    updates.reviewedBy = reviewerId;
    updates.reviewedAt = new Date();
  }

  const violation = await violationRepository.updateById(id, updates);
  if (!violation) throw ApiError.notFound('Violation not found');
  return violation;
};

module.exports = { recordViolation, getViolationById, listViolations, updateViolationStatus };
