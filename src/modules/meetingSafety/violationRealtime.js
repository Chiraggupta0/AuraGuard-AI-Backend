const { getIO } = require('../../config/socket');
const logger = require('../../config/logger');

// Socket.IO room names on the '/violations' namespace. Mirrors
// modules/rooms/admission.realtime.js's pattern exactly, kept in its own
// module so the socket handler and any future REST-triggered path push
// identical events through one place.
const hostRoom = (roomCode) => `violations:host:${roomCode}`;

const safeEmit = (fn) => {
  try {
    fn();
  } catch (error) {
    logger.warn('[VIOLATION] Realtime notify failed', { error: error.message });
  }
};

const notifyHostOfViolation = (roomCode, violationPayload) => {
  safeEmit(() =>
    getIO().of('/violations').to(hostRoom(roomCode)).emit('violation_detected', violationPayload)
  );
};

// Host dismissed, muted, or removed — pushed back to the host's OTHER open
// tabs/sessions so the card disappears everywhere, not just where the click
// happened.
const notifyHostViolationUpdated = (roomCode, violationPayload) => {
  safeEmit(() =>
    getIO().of('/violations').to(hostRoom(roomCode)).emit('violation_updated', violationPayload)
  );
};

module.exports = {
  hostRoom,
  notifyHostOfViolation,
  notifyHostViolationUpdated,
};
