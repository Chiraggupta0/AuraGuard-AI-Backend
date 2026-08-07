const AuditLog = require('./auditLog.model');

const create = (data) => AuditLog.create(data);

const findAll = ({ filter = {}, skip = 0, limit = 20 } = {}) =>
  AuditLog.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('actor', 'name email');

const count = (filter = {}) => AuditLog.countDocuments(filter);

module.exports = { create, findAll, count };
