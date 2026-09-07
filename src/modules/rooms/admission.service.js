const JoinRequest = require('./joinRequest.model');
const roomService = require('./room.service');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');
const {
  notifyHostOfRequest,
  notifyParticipantApproved,
  notifyParticipantRejected,
} = require('./admission.realtime');

const toPublicRequest = (request) => ({
  requestId: request._id.toString(),
  roomCode: request.roomCode,
  participantId: request.participantId,
  participantEmail: request.participantEmail,
  participantName: request.participantName,
  status: request.status,
  createdAt: request.createdAt,
});

// The backend is the only source of truth for who may enter a room: the
// caller here is always re-derived from the authenticated request (Firebase
// UID), never from a client-supplied "isHost"/"approved" flag.
const assertIsHost = (room, requesterUid) => {
  if (room.hostId !== requesterUid) {
    throw ApiError.forbidden('Only the room host can perform this action');
  }
};

// Participant asks to join. Idempotent: a second call while a request is
// still pending returns the SAME request instead of creating a duplicate.
const createOrReuseRequest = async (roomCode, participantId, participantEmail, participantName) => {
  const room = await roomService.getRoomByCode(roomCode);
  const canonicalRoomCode = room.roomCode;

  if (room.hostId === participantId) {
    throw ApiError.badRequest('The host does not need to request admission');
  }

  const existingPending = await JoinRequest.findOne({
    roomCode: canonicalRoomCode,
    participantId,
    status: 'pending',
  });

  const request =
    existingPending ||
    (await JoinRequest.create({
      roomCode: canonicalRoomCode,
      hostId: room.hostId,
      participantId,
      participantEmail,
      participantName,
      status: 'pending',
    }));

  if (!existingPending) {
    logger.info('[ADMISSION] Join request created', {
      roomCode: canonicalRoomCode,
      participantId,
      requestId: request._id.toString(),
    });
    notifyHostOfRequest(canonicalRoomCode, toPublicRequest(request));
  }

  return toPublicRequest(request);
};

// Host-only: current pending requests for a room (used for the live socket
// push AND for reconciling the host's UI after a page reload).
const listPending = async (roomCode, requesterUid) => {
  const room = await roomService.getRoomByCode(roomCode);
  assertIsHost(room, requesterUid);

  const requests = await JoinRequest.find({ roomCode: room.roomCode, status: 'pending' }).sort({
    createdAt: 1,
  });

  return requests.map(toPublicRequest);
};

// Host-only: admit or reject a single pending request.
const decide = async (roomCode, requestId, deciderUid, decision) => {
  const room = await roomService.getRoomByCode(roomCode);
  assertIsHost(room, deciderUid);

  const request = await JoinRequest.findOne({ _id: requestId, roomCode: room.roomCode });
  if (!request) {
    throw ApiError.notFound('Join request not found');
  }

  if (request.status !== 'pending') {
    // Already decided (e.g. double-click) — treat as a no-op success rather
    // than an error so the UI doesn't need special-case handling.
    return toPublicRequest(request);
  }

  request.status = decision;
  request.decidedAt = new Date();
  await request.save();

  logger.info('[ADMISSION] Join request decided', {
    roomCode: room.roomCode,
    requestId,
    decision,
    deciderUid,
  });

  if (decision === 'approved') {
    notifyParticipantApproved(requestId, room.roomCode);
  } else {
    notifyParticipantRejected(requestId, room.roomCode, 'host_rejected');
  }

  return toPublicRequest(request);
};

// Status check — usable by the requesting participant (to reconcile after a
// reconnect) or the host.
const getStatus = async (roomCode, requestId, requesterUid) => {
  const room = await roomService.getRoomByCode(roomCode);
  const request = await JoinRequest.findOne({ _id: requestId, roomCode: room.roomCode });
  if (!request) {
    throw ApiError.notFound('Join request not found');
  }

  const isOwner = request.participantId === requesterUid;
  const isHost = room.hostId === requesterUid;
  if (!isOwner && !isHost) {
    throw ApiError.forbidden('Not authorized to view this join request');
  }

  return toPublicRequest(request);
};

// Called from room.controller.js#joinRoom right after room validation, before
// a LiveKit token is ever issued. The host always passes; anyone else must
// have an approved request on file.
const assertJoinAuthorized = async (room, uid) => {
  if (room.hostId === uid) return;

  const approved = await JoinRequest.findOne({
    roomCode: room.roomCode,
    participantId: uid,
    status: 'approved',
  }).sort({ decidedAt: -1 });

  if (!approved) {
    throw ApiError.forbidden('Join request not approved yet. Please wait for the host to admit you.');
  }
};

// Host-left cleanup (see sockets/admission.socket.js) — no participant should
// be left waiting forever once the host is gone.
const rejectAllPendingForRoom = async (roomCode, reason) => {
  const pending = await JoinRequest.find({ roomCode, status: 'pending' });
  if (pending.length === 0) return;

  await JoinRequest.updateMany(
    { roomCode, status: 'pending' },
    { status: 'rejected', decidedAt: new Date() }
  );

  logger.info('[ADMISSION] Auto-rejected pending requests', {
    roomCode,
    reason,
    count: pending.length,
  });

  pending.forEach((request) =>
    notifyParticipantRejected(request._id.toString(), roomCode, reason)
  );
};

module.exports = {
  createOrReuseRequest,
  listPending,
  decide,
  getStatus,
  assertJoinAuthorized,
  rejectAllPendingForRoom,
};
