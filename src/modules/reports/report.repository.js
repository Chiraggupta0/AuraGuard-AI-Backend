const Report = require('./report.model');

const create = (data) => Report.create(data);

const findById = (id) =>
  Report.findById(id)
    .populate('reportedBy', 'name email')
    .populate('reportedUser', 'name email')
    .populate('handledBy', 'name email');

const findAll = ({ filter = {}, skip = 0, limit = 20, sort = '-createdAt' } = {}) =>
  Report.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('reportedBy', 'name email')
    .populate('reportedUser', 'name email');

const count = (filter = {}) => Report.countDocuments(filter);

const updateById = (id, updates) =>
  Report.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

module.exports = { create, findById, findAll, count, updateById };
