const adminService = require('./admin.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const banUser = catchAsync(async (req, res) => {
  const user = await adminService.banUser(req.user.id, req.params.id, req.body.reason, req.ip);
  new ApiResponse(HTTP_STATUS.OK, 'User banned', user.toSafeJSON()).send(res);
});

const unbanUser = catchAsync(async (req, res) => {
  const user = await adminService.unbanUser(req.user.id, req.params.id, req.ip);
  new ApiResponse(HTTP_STATUS.OK, 'User unbanned', user.toSafeJSON()).send(res);
});

const changeUserRole = catchAsync(async (req, res) => {
  const user = await adminService.changeUserRole(req.user.id, req.params.id, req.body.role, req.ip);
  new ApiResponse(HTTP_STATUS.OK, 'User role updated', user.toSafeJSON()).send(res);
});

const getSystemOverview = catchAsync(async (_req, res) => {
  const overview = await adminService.getSystemOverview();
  new ApiResponse(HTTP_STATUS.OK, 'System overview fetched', overview).send(res);
});

module.exports = { banUser, unbanUser, changeUserRole, getSystemOverview };
