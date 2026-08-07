const SOCKET_EVENTS = require('../../constants/events');
const { meetingRoom } = require('../../services/socket.service');
const meetingService = require('../../modules/meetings/meeting.service');
const aiMonitoringService = require('../../modules/aiMonitoring/aiMonitoring.service');
const logger = require('../../config/logger');

// Wires meeting join/leave lifecycle events for a single connected socket.
// `socket.user` is attached by the socket-level auth middleware in sockets/index.js.
const registerMeetingHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.MEETING_JOIN, async ({ meetingId }) => {
    try {
      socket.join(meetingRoom(meetingId));
      await meetingService.joinMeeting(meetingId, socket.user.id);
      await aiMonitoringService.startSession(meetingId, socket.user.id);

      socket.to(meetingRoom(meetingId)).emit(SOCKET_EVENTS.MEETING_PARTICIPANT_JOINED, {
        userId: socket.user.id,
        name: socket.user.name,
      });
    } catch (error) {
      logger.error(`meeting:join failed: ${error.message}`);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join meeting' });
    }
  });

  socket.on(SOCKET_EVENTS.MEETING_LEAVE, async ({ meetingId }) => {
    try {
      socket.leave(meetingRoom(meetingId));
      await meetingService.leaveMeeting(meetingId, socket.user.id);
      await aiMonitoringService.endSession(meetingId, socket.user.id);

      socket.to(meetingRoom(meetingId)).emit(SOCKET_EVENTS.MEETING_PARTICIPANT_LEFT, {
        userId: socket.user.id,
      });
    } catch (error) {
      logger.error(`meeting:leave failed: ${error.message}`);
    }
  });
};

module.exports = registerMeetingHandlers;
