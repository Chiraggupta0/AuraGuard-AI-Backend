const settingService = require('./setting.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const getAllSettings = catchAsync(async (_req, res) => {
  const settings = await settingService.getAllSettings();
  new ApiResponse(HTTP_STATUS.OK, 'Settings fetched', settings).send(res);
});

const getSetting = catchAsync(async (req, res) => {
  const value = await settingService.getSetting(req.params.key);
  new ApiResponse(HTTP_STATUS.OK, 'Setting fetched', { key: req.params.key, value }).send(res);
});

const upsertSetting = catchAsync(async (req, res) => {
  const setting = await settingService.upsertSetting(
    req.body.key,
    req.body.value,
    req.body.description,
    req.user.id
  );
  new ApiResponse(HTTP_STATUS.OK, 'Setting updated', setting).send(res);
});

module.exports = { getAllSettings, getSetting, upsertSetting };
