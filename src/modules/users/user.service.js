const userRepository = require('./user.repository');
const ApiError = require('../../utils/ApiError');
const MESSAGES = require('../../constants/messages');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');

const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  return user;
};

const listUsers = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };

  const [users, total] = await Promise.all([
    userRepository.findAll({ filter, skip, limit }),
    userRepository.count(filter),
  ]);

  return { users, meta: buildPaginationMeta({ page, limit, total }) };
};

const updateProfile = async (userId, updates) => {
  const user = await userRepository.updateById(userId, updates);
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  return user;
};

const updateUserRole = async (userId, role) => {
  const user = await userRepository.updateById(userId, { role });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  return user;
};

const deactivateUser = async (userId) => {
  const user = await userRepository.updateById(userId, { isActive: false });
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  return user;
};

const deleteUser = async (userId) => {
  const user = await userRepository.deleteById(userId);
  if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  return user;
};

module.exports = {
  getUserById,
  listUsers,
  updateProfile,
  updateUserRole,
  deactivateUser,
  deleteUser,
};
