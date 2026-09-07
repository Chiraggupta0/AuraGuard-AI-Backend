const { admin } = require('../config/firebase-admin');
const logger = require('../config/logger');
const admissionService = require('../modules/rooms/admission.service');
const { hostRoom, requestRoom } = require('../modules/rooms/admission.realtime');

// Isolated Socket.IO namespace for the room-admission ("knock to enter")
// feature. Deliberately separate from the default namespace registered in
// sockets/index.js: that one authenticates with the app's own JWT (see
// middlewares/auth.middleware.js) for the meetings/violations workstream,
// while the Rooms/LiveKit flow this feature extends is Firebase-authenticated
// (see middlewares/firebase-auth.middleware.js). Mirrors that middleware's
// token verification for the socket handshake.
const firebaseSocketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token missing'));

    const decoded = await admin.auth().verifyIdToken(token);
    socket.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email?.split('@')[0],
    };
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

// socket.id -> roomCode, for hosts currently subscribed to a room's requests.
// Used only to know which room to clean up on disconnect; every actual
// authorization decision is re-checked against the DB, never against this map.
const hostSubscriptions = new Map();

const registerAdmissionNamespace = (io) => {
  const nsp = io.of('/admission');
  nsp.use(firebaseSocketAuth);

  nsp.on('connection', (socket) => {
    logger.info(`[ADMISSION] Socket connected: ${socket.id} (uid: ${socket.user.uid})`);

    // Host subscribes to receive live join requests for a room they host.
    // Rejected (not acknowledged as host) if the caller isn't the room's
    // hostId — the socket layer never trusts a client-asserted host flag.
    socket.on('host:subscribe', async ({ roomCode } = {}, ack) => {
      try {
        const pending = await admissionService.listPending(roomCode, socket.user.uid);
        socket.join(hostRoom(roomCode));
        hostSubscriptions.set(socket.id, roomCode);
        if (typeof ack === 'function') ack({ ok: true, pending });
      } catch (error) {
        logger.warn('[ADMISSION] host:subscribe failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    // Participant requests to join a room.
    socket.on('join_request', async ({ roomCode, displayName } = {}, ack) => {
      try {
        const name = displayName || socket.user.name || socket.user.email?.split('@')[0] || 'Guest';
        const request = await admissionService.createOrReuseRequest(
          roomCode,
          socket.user.uid,
          socket.user.email,
          name
        );
        socket.join(requestRoom(request.requestId));
        if (typeof ack === 'function') ack({ ok: true, ...request });
      } catch (error) {
        logger.warn('[ADMISSION] join_request failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    // Host admits/rejects. Authorization is re-verified server-side against
    // room.hostId inside admissionService.decide — a participant emitting
    // these events for a room they don't host gets a 403-equivalent failure.
    socket.on('admit_participant', async ({ roomCode, requestId } = {}, ack) => {
      try {
        const request = await admissionService.decide(
          roomCode,
          requestId,
          socket.user.uid,
          'approved'
        );
        if (typeof ack === 'function') ack({ ok: true, ...request });
      } catch (error) {
        logger.warn('[ADMISSION] admit_participant failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    socket.on('reject_participant', async ({ roomCode, requestId } = {}, ack) => {
      try {
        const request = await admissionService.decide(
          roomCode,
          requestId,
          socket.user.uid,
          'rejected'
        );
        if (typeof ack === 'function') ack({ ok: true, ...request });
      } catch (error) {
        logger.warn('[ADMISSION] reject_participant failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    // Host-leaves edge case: if this was the host's last connected socket for
    // that room, nobody is left to decide pending requests, so auto-reject
    // them instead of leaving participants waiting forever. This only fires
    // while a host's admission socket was actually open (i.e. they had the
    // meeting page loaded) — a hard server crash or silent network death
    // between requests can still leave a request pending until the host
    // (or room expiry) resolves it. That's the deliberately small, documented
    // scope of this handling; a full reaper job is out of scope here.
    socket.on('disconnect', async () => {
      const roomCode = hostSubscriptions.get(socket.id);
      hostSubscriptions.delete(socket.id);
      if (!roomCode) return;

      try {
        const remaining = await nsp.in(hostRoom(roomCode)).fetchSockets();
        if (remaining.length === 0) {
          await admissionService.rejectAllPendingForRoom(roomCode, 'host_left');
        }
      } catch (error) {
        logger.warn('[ADMISSION] disconnect cleanup failed', { error: error.message });
      }
    });
  });

  return nsp;
};

module.exports = registerAdmissionNamespace;
