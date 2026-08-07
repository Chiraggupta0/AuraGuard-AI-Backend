const Meeting = require('./meeting.model');

const create = (data) => Meeting.create(data);

const findById = (id) => Meeting.findById(id).populate('host', 'name email');

const findByRoomId = (roomId) => Meeting.findOne({ roomId }).populate('host', 'name email');

const findAll = ({ filter = {}, skip = 0, limit = 20, sort = '-createdAt' } = {}) =>
  Meeting.find(filter).sort(sort).skip(skip).limit(limit).populate('host', 'name email');

const count = (filter = {}) => Meeting.countDocuments(filter);

const updateById = (id, updates) =>
  Meeting.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const addParticipant = (id, participant) =>
  Meeting.findByIdAndUpdate(id, { $push: { participants: participant } }, { new: true });

const markParticipantLeft = (id, userId) =>
  Meeting.findOneAndUpdate(
    { _id: id, 'participants.user': userId },
    { $set: { 'participants.$.leftAt': new Date() } },
    { new: true }
  );

const incrementViolationCount = (id) =>
  Meeting.findByIdAndUpdate(id, { $inc: { violationCount: 1 } }, { new: true });

const deleteById = (id) => Meeting.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findByRoomId,
  findAll,
  count,
  updateById,
  addParticipant,
  markParticipantLeft,
  incrementViolationCount,
  deleteById,
};
