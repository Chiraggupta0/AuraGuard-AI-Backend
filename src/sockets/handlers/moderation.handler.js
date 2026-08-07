const SOCKET_EVENTS = require('../../constants/events');
const aiMonitoringService = require('../../modules/aiMonitoring/aiMonitoring.service');
const logger = require('../../config/logger');

// Streams continuous monitoring data (video frames, raw audio chunks) from
// the client to the AI Service via aiMonitoringService. This handler stays
// AI-implementation-agnostic — it never talks to the AI Service directly.
const registerModerationHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.MONITORING_FRAME, async ({ meetingId, frame }) => {
    try {
      // `frame` is expected to be a base64-encoded JPEG/PNG buffer from the client.
      const buffer = Buffer.from(frame, 'base64');
      await aiMonitoringService.analyzeFrame(meetingId, socket.user.id, buffer);
    } catch (error) {
      logger.error(`monitoring:frame failed: ${error.message}`);
    }
  });

  socket.on(SOCKET_EVENTS.MONITORING_AUDIO_CHUNK, async ({ meetingId, audio }) => {
    try {
      // `audio` is a base64-encoded raw audio chunk; the AI Service runs
      // Whisper transcription internally, so Node forwards bytes, not text.
      const buffer = Buffer.from(audio, 'base64');
      await aiMonitoringService.analyzeAudio(meetingId, socket.user.id, buffer);
    } catch (error) {
      logger.error(`monitoring:audio_chunk failed: ${error.message}`);
    }
  });
};

module.exports = registerModerationHandlers;
