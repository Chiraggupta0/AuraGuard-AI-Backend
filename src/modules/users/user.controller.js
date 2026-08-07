const userService = require('./user.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');
const MESSAGES = require('../../constants/messages');

const getMe = catchAsync(async (req, res) => {
  new ApiResponse(HTTP_STATUS.OK, 'Current user fetched', req.user.toSafeJSON()).send(res);
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'User fetched', user.toSafeJSON()).send(res);
});

const listUsers = catchAsync(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Users fetched',
    users.map((u) => u.toSafeJSON()),
    meta
  ).send(res);
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.USER.UPDATED, user.toSafeJSON()).send(res);
});

const updateUserRole = catchAsync(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.USER.UPDATED, user.toSafeJSON()).send(res);
});

const deactivateUser = catchAsync(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'User deactivated', user.toSafeJSON()).send(res);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.USER.DELETED).send(res);
});

module.exports = {
  getMe,
  getUserById,
  listUsers,
  updateProfile,
  updateUserRole,
  deactivateUser,
  deleteUser,
};
