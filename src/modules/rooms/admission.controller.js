const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const admissionService = require('./admission.service');

// Host-only: list pending join requests. Mainly used to reconcile the host's
// UI after a page reload — live updates otherwise arrive over the
// '/admission' socket namespace.
const listPending = catchAsync(async (req, res) => {
  const { roomCode } = req.params;
  const requests = await admissionService.listPending(roomCode, req.user._id);
  new ApiResponse(200, 'Pending join requests fetched', requests).send(res);
});

const getStatus = catchAsync(async (req, res) => {
  const { roomCode, requestId } = req.params;
  const request = await admissionService.getStatus(roomCode, requestId, req.user._id);
  new ApiResponse(200, 'Join request status fetched', request).send(res);
});

const admit = catchAsync(async (req, res) => {
  const { roomCode, requestId } = req.params;
  const request = await admissionService.decide(roomCode, requestId, req.user._id, 'approved');
  new ApiResponse(200, 'Participant admitted', request).send(res);
});

const reject = catchAsync(async (req, res) => {
  const { roomCode, requestId } = req.params;
  const request = await admissionService.decide(roomCode, requestId, req.user._id, 'rejected');
  new ApiResponse(200, 'Participant rejected', request).send(res);
});

module.exports = {
  listPending,
  getStatus,
  admit,
  reject,
};
