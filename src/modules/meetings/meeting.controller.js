const meetingService = require('./meeting.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const createMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.createMeeting(req.user.id, req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Meeting created', meeting).send(res);
});

const getMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.getMeetingById(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Meeting fetched', meeting).send(res);
});

const listMeetings = catchAsync(async (req, res) => {
  const { meetings, meta } = await meetingService.listMeetings(req.query, req.user);
  new ApiResponse(HTTP_STATUS.OK, 'Meetings fetched', meetings, meta).send(res);
});

const updateMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.updateMeeting(req.params.id, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Meeting updated', meeting).send(res);
});

const startMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.startMeeting(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Meeting started', meeting).send(res);
});

const endMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.endMeeting(req.params.id);
  new ApiResponse(HTTP_STATUS.OK, 'Meeting ended', meeting).send(res);
});

const joinMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.joinMeeting(req.params.id, req.user.id, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Joined meeting', meeting).send(res);
});

const leaveMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.leaveMeeting(req.params.id, req.user.id);
  new ApiResponse(HTTP_STATUS.OK, 'Left meeting', meeting).send(res);
});

module.exports = {
  createMeeting,
  getMeeting,
  listMeetings,
  updateMeeting,
  startMeeting,
  endMeeting,
  joinMeeting,
  leaveMeeting,
};
