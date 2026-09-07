const { getIO } = require('../../config/socket');
const logger = require('../../config/logger');

// Socket.IO room names used on the '/admission' namespace. Kept here so the
// socket handler and the REST controller (both of which can mutate a
// JoinRequest) push identical events through one path.
const hostRoom = (roomCode) => `admission:host:${roomCode}`;
const requestRoom = (requestId) => `admission:req:${requestId}`;

// Best-effort push — the DB write already happened, so a socket hiccup here
// must never fail the HTTP/socket request that triggered it.
const safeEmit = (fn) => {
  try {
    fn();
  } catch (error) {
    logger.warn('[ADMISSION] Realtime notify failed', { error: error.message });
  }
};

const notifyHostOfRequest = (roomCode, requestPayload) => {
  safeEmit(() =>
    getIO().of('/admission').to(hostRoom(roomCode)).emit('join_request_received', requestPayload)
  );
};

const notifyParticipantApproved = (requestId, roomCode) => {
  safeEmit(() =>
    getIO().of('/admission').to(requestRoom(requestId)).emit('admission_approved', {
      requestId,
      roomCode,
    })
  );
};

const notifyParticipantRejected = (requestId, roomCode, reason = 'host_rejected') => {
  safeEmit(() =>
    getIO().of('/admission').to(requestRoom(requestId)).emit('admission_rejected', {
      requestId,
      roomCode,
      reason,
    })
  );
};

module.exports = {
  hostRoom,
  requestRoom,
  notifyHostOfRequest,
  notifyParticipantApproved,
  notifyParticipantRejected,
};
