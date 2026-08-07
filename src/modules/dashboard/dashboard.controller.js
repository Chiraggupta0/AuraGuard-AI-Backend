const dashboardService = require('./dashboard.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const getOverview = catchAsync(async (_req, res) => {
  const stats = await dashboardService.getOverviewStats();
  new ApiResponse(HTTP_STATUS.OK, 'Dashboard overview fetched', stats).send(res);
});

const getViolationsBreakdown = catchAsync(async (_req, res) => {
  const breakdown = await dashboardService.getViolationsBreakdown();
  new ApiResponse(HTTP_STATUS.OK, 'Violations breakdown fetched', breakdown).send(res);
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const activity = await dashboardService.getRecentActivity(limit);
  new ApiResponse(HTTP_STATUS.OK, 'Recent activity fetched', activity).send(res);
});

module.exports = { getOverview, getViolationsBreakdown, getRecentActivity };
