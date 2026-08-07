const aiMonitoringService = require('./aiMonitoring.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const startSession = catchAsync(async (req, res) => {
  const session = await aiMonitoringService.startSession(req.body.meeting, req.user.id);
  new ApiResponse(HTTP_STATUS.CREATED, 'Monitoring session started', session).send(res);
});

const endSession = catchAsync(async (req, res) => {
  const session = await aiMonitoringService.endSession(req.body.meeting, req.user.id);
  new ApiResponse(HTTP_STATUS.OK, 'Monitoring session ended', session).send(res);
});

// Text moderation exposed over REST for chat messages; frame/audio analysis
// is primarily driven over Socket.IO (see src/sockets/handlers) since it's
// continuous streaming data.
const analyzeText = catchAsync(async (req, res) => {
  const result = await aiMonitoringService.analyzeText(
    req.body.meeting,
    req.user.id,
    req.body.text
  );
  new ApiResponse(HTTP_STATUS.OK, 'Text analyzed', result).send(res);
});

module.exports = { startSession, endSession, analyzeText };
