const violationService = require('./violation.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const createViolation = catchAsync(async (req, res) => {
  const violation = await violationService.recordViolation(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Violation recorded', violation).send(res);
});

const getViolation = catchAsync(async (req, res) => {
  const violation = await violationService.getViolationById(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Violation fetched', violation).send(res);
});

const listViolations = catchAsync(async (req, res) => {
  const { violations, meta } = await violationService.listViolations(req.query);
  new ApiResponse(HTTP_STATUS.OK, 'Violations fetched', violations, meta).send(res);
});

const updateViolationStatus = catchAsync(async (req, res) => {
  const violation = await violationService.updateViolationStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );
  new ApiResponse(HTTP_STATUS.OK, 'Violation status updated', violation).send(res);
});

module.exports = { createViolation, getViolation, listViolations, updateViolationStatus };
