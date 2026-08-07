const moderationService = require('./moderation.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const applyAction = catchAsync(async (req, res) => {
  const action = await moderationService.applyAction({ ...req.body, performedBy: req.user.id });
  new ApiResponse(HTTP_STATUS.CREATED, 'Moderation action applied', action).send(res);
});

const getAction = catchAsync(async (req, res) => {
  const action = await moderationService.getActionById(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Moderation action fetched', action).send(res);
});

const listActions = catchAsync(async (req, res) => {
  const { actions, meta } = await moderationService.listActions(req.query);
  new ApiResponse(HTTP_STATUS.OK, 'Moderation actions fetched', actions, meta).send(res);
});

module.exports = { applyAction, getAction, listActions };
