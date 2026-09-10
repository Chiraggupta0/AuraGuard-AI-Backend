const { admin } = require('../config/firebase-admin');
const logger = require('../config/logger');
const violationEngine = require('../modules/meetingSafety/violationEngine.service');
const { hostRoom } = require('../modules/meetingSafety/violationRealtime');

// Isolated '/violations' namespace — same reasoning as
// sockets/admission.socket.js: this Rooms/LiveKit-adjacent flow is
// Firebase-authenticated, unlike the default namespace's legacy JWT auth
// (sockets/index.js), so it needs its own handshake verification. Duplicated
// rather than imported from admission.socket.js on purpose, to avoid
// touching that already-verified, isolated feature's file at all.
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

const registerViolationNamespace = (io) => {
  const nsp = io.of('/violations');
  nsp.use(firebaseSocketAuth);

  nsp.on('connection', (socket) => {
    logger.info(`[VIOLATION] Socket connected: ${socket.id} (uid: ${socket.user.uid})`);

    // Host subscribes to receive live violation notifications for a room
    // they host. Server re-verifies host status against room.hostId — never
    // trusts a client-asserted flag.
    socket.on('host:subscribe', async ({ roomCode } = {}, ack) => {
      try {
        const active = await violationEngine.listActive(roomCode, socket.user.uid);
        socket.join(hostRoom(roomCode));
        if (typeof ack === 'function') ack({ ok: true, active });
      } catch (error) {
        logger.warn('[VIOLATION] host:subscribe failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    // Any participant's browser reports one detection sample from the
    // EXISTING vision/speech pipelines. This does not add a new detector —
    // it forwards output that useVisionDetection.js / useSpeechCapture.js
    // already computed. socket.user.uid (Firebase-verified) is always used
    // as the participant identity; a client cannot report on someone else's
    // behalf.
    socket.on('report_detection', async ({ roomCode, source, detections, result, participantName } = {}, ack) => {
      try {
        const name = participantName || socket.user.name || socket.user.email?.split('@')[0] || 'Participant';
        let outcome = null;

        if (source === 'video') {
          const results = await violationEngine.evaluateVideoDetection({
            roomCode,
            participantId: socket.user.uid,
            participantName: name,
            detections,
          });
          outcome = results?.find((r) => r.confirmed) || null;
        } else if (source === 'audio') {
          outcome = await violationEngine.evaluateAudioDetection({
            roomCode,
            participantId: socket.user.uid,
            participantName: name,
            result,
          });
        }

        if (typeof ack === 'function') ack({ ok: true, confirmed: Boolean(outcome), warning: outcome?.warning || null });
      } catch (error) {
        logger.warn('[VIOLATION] report_detection failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    // Host-only actions — authorization is re-verified server-side inside
    // violationEngine (assertIsHost against room.hostId) regardless of what
    // the client claims.
    socket.on('dismiss_violation', async ({ roomCode, violationId } = {}, ack) => {
      try {
        const violation = await violationEngine.dismiss(roomCode, violationId, socket.user.uid);
        if (typeof ack === 'function') ack({ ok: true, violation });
      } catch (error) {
        logger.warn('[VIOLATION] dismiss_violation failed', { error: error.message });
        if (typeof ack === 'function') ack({ ok: false, message: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[VIOLATION] Socket disconnected: ${socket.id}`);
    });
  });

  return nsp;
};

module.exports = registerViolationNamespace;
