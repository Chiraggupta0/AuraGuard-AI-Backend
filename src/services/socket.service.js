const { getIO } = require('../config/socket');
const SOCKET_EVENTS = require('../constants/events');

// Thin wrapper other modules/services use to push realtime events without
// importing socket.io directly or knowing about room naming conventions.

const meetingRoom = (meetingId) => `meeting:${meetingId}`;
const userRoom = (userId) => `user:${userId}`;

const emitToMeeting = (meetingId, event, payload) => {
  getIO().to(meetingRoom(meetingId)).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  getIO().to(userRoom(userId)).emit(event, payload);
};

const emitModerationWarning = (meetingId, payload) => {
  emitToMeeting(meetingId, SOCKET_EVENTS.MODERATION_WARNING, payload);
};

const emitViolationDetected = (meetingId, payload) => {
  emitToMeeting(meetingId, SOCKET_EVENTS.VIOLATION_DETECTED, payload);
};

const emitNotification = (userId, payload) => {
  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, payload);
};

module.exports = {
  meetingRoom,
  userRoom,
  emitToMeeting,
  emitToUser,
  emitModerationWarning,
  emitViolationDetected,
  emitNotification,
};
