const Violation = require('./violation.model');

const create = (data) => Violation.create(data);

const findById = (id) =>
  Violation.findById(id).populate('user', 'name email').populate('meeting', 'roomId title');

const findAll = ({ filter = {}, skip = 0, limit = 20, sort = '-createdAt' } = {}) =>
  Violation.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('meeting', 'roomId title');

const count = (filter = {}) => Violation.countDocuments(filter);

const updateById = (id, updates) =>
  Violation.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const countByUser = (userId) => Violation.countDocuments({ user: userId });

module.exports = { create, findById, findAll, count, updateById, countByUser };
