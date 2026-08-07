const User = require('./user.model');

// Data-access layer for users. Services call this instead of touching the
// Mongoose model directly, keeping persistence concerns isolated.

const create = (data) => User.create(data);

const findById = (id, { withPassword = false } = {}) => {
  const query = User.findById(id);
  return withPassword ? query.select('+password') : query;
};

const findByEmail = (email, { withPassword = false } = {}) => {
  const query = User.findOne({ email: email.toLowerCase() });
  return withPassword ? query.select('+password') : query;
};

const findAll = ({ filter = {}, skip = 0, limit = 20, sort = '-createdAt' } = {}) =>
  User.find(filter).sort(sort).skip(skip).limit(limit);

const count = (filter = {}) => User.countDocuments(filter);

const updateById = (id, updates) =>
  User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const deleteById = (id) => User.findByIdAndDelete(id);

module.exports = { create, findById, findByEmail, findAll, count, updateById, deleteById };
