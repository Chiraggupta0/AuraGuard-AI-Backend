const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const violationEngine = require('./violationEngine.service');
const livekitService = require('../../services/livekit.service');
const logger = require('../../config/logger');

// Host-only: current active violations for a room — mainly a reconciliation
// fallback for the live '/violations' socket namespace (see
// sockets/violationEngine.socket.js), same role as the admission feature's
// equivalent REST endpoints.
const listActive = catchAsync(async (req, res) => {
  const { roomCode } = req.params;
  const active = await violationEngine.listActive(roomCode, req.user._id);
  new ApiResponse(200, 'Active violations fetched', active).send(res);
});

const dismiss = catchAsync(async (req, res) => {
  const { roomCode, violationId } = req.params;
  const violation = await violationEngine.dismiss(roomCode, violationId, req.user._id);
  new ApiResponse(200, 'Violation dismissed', violation).send(res);
});

// Mute/remove both re-verify host status server-side (assertIsHost inside
// violationEngine, checked against room.hostId) before touching LiveKit at
// all — the host is never trusted from a frontend flag.
// LiveKit calls (findParticipantIdentity/mutePublishedTrack/removeParticipant)
// hit a real external service — the room may not exist there yet (created in
// Mongo before anyone connected), may have already ended, or the network
// call itself may fail. None of that should surface as a raw 500 with an SDK
// stack trace; the host action is still recorded either way, since the
// host's decision is the source of truth, not whether LiveKit could be
// reached at this exact instant.
const resolveLiveKitIdentity = async (roomCode, participantId) => {
  try {
    return await livekitService.findParticipantIdentity(roomCode, participantId);
  } catch (error) {
    logger.warn('[VIOLATION] LiveKit lookup failed', { roomCode, participantId, error: error.message });
    return null;
  }
};

const mute = catchAsync(async (req, res) => {
  const { roomCode, violationId } = req.params;
  const doc = await violationEngine.assertIsHost(roomCode, req.user._id).then(() =>
    violationEngine.recordAction(roomCode, violationId, req.user._id, 'muted')
  );

  const identity = await resolveLiveKitIdentity(roomCode, doc.participantId);
  if (!identity) {
    logger.warn('[VIOLATION] Mute requested but participant is not currently reachable on LiveKit', {
      roomCode,
      participantId: doc.participantId,
    });
  } else {
    try {
      await livekitService.muteParticipantAudio(roomCode, identity);
    } catch (error) {
      logger.warn('[VIOLATION] LiveKit mute call failed', { roomCode, identity, error: error.message });
    }
  }

  new ApiResponse(200, 'Participant muted', violationEngine.toPublicViolation(doc)).send(res);
});

const remove = catchAsync(async (req, res) => {
  const { roomCode, violationId } = req.params;
  const doc = await violationEngine.assertIsHost(roomCode, req.user._id).then(() =>
    violationEngine.recordAction(roomCode, violationId, req.user._id, 'removed')
  );

  const identity = await resolveLiveKitIdentity(roomCode, doc.participantId);
  if (!identity) {
    throw ApiError.notFound('Participant is not currently in the meeting');
  }
  await livekitService.removeParticipant(roomCode, identity);

  new ApiResponse(200, 'Participant removed', violationEngine.toPublicViolation(doc)).send(res);
});

module.exports = { listActive, dismiss, mute, remove };
