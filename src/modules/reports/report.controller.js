const reportService = require('./report.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const fileReport = catchAsync(async (req, res) => {
  const report = await reportService.fileReport(req.user.id, req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Report filed', report).send(res);
});

const getReport = catchAsync(async (req, res) => {
  const report = await reportService.getReportById(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Report fetched', report).send(res);
});

const listReports = catchAsync(async (req, res) => {
  const { reports, meta } = await reportService.listReports(req.query);
  new ApiResponse(HTTP_STATUS.OK, 'Reports fetched', reports, meta).send(res);
});

const resolveReport = catchAsync(async (req, res) => {
  const report = await reportService.resolveReport(req.params.id, req.user.id, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Report updated', report).send(res);
});

module.exports = { fileReport, getReport, listReports, resolveReport };
