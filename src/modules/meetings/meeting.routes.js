const express = require('express');
const meetingController = require('./meeting.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  createMeetingSchema,
  updateMeetingSchema,
  joinMeetingSchema,
} = require('./meeting.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createMeetingSchema), meetingController.createMeeting);
router.get('/', meetingController.listMeetings);
router.get('/:id', meetingController.getMeeting);
router.patch('/:id', validate(updateMeetingSchema), meetingController.updateMeeting);
router.patch('/:id/start', meetingController.startMeeting);
router.patch('/:id/end', meetingController.endMeeting);
router.post('/:id/join', validate(joinMeetingSchema), meetingController.joinMeeting);
router.post('/:id/leave', meetingController.leaveMeeting);

module.exports = router;
