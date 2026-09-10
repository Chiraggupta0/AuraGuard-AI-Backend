const MeetingViolation = require('./violationEvent.model');
const roomService = require('../rooms/room.service');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');
const { notifyHostOfViolation, notifyHostViolationUpdated } = require('./violationRealtime');

// ---------------------------------------------------------------------------
// Detection != Violation. The existing detectors (YOLO/NudeNet/camera
// visibility, and Whisper + the local prohibited-word filter) run
// continuously and report raw OBSERVATIONS — this module is the one place
// that decides whether a sequence of observations becomes a confirmed
// VIOLATION worth interrupting the host for, and suppresses repeat
// notifications while that violation is still active. It owns no detection
// logic of its own; it only consumes the existing detectors' already-shaped
// output.
// ---------------------------------------------------------------------------

// Video: requires this many CONSECUTIVE positive samples (frontend samples
// ~every 3s) before a low-severity condition is confirmed — a single noisy
// frame must never trigger a host popup. Explicit content skips this: the
// Python NudeNet classifier already gates on its own confidence threshold
// before returning flagged=true, so by the time it reaches here it's already
// a meaningfully confident result worth acting on immediately.
const VIDEO_CONFIRM_THRESHOLD = {
  phone_usage: 2,
  camera_covered: 2,
};
// After this many consecutive MISSES, an active video violation resolves —
// so if the same condition reappears later, it's treated as a new violation
// rather than staying (or reopening) silently.
const VIDEO_RESOLVE_THRESHOLD = 2;

const VIDEO_SEVERITY = {
  phone_usage: 'low',
  camera_covered: 'low',
  explicit_content: 'high',
};

// Audio chunks are discrete 5s events, not a continuous presence like video —
// a single flagged chunk already reflects a real instance of prohibited
// language, so it confirms immediately. What needs suppressing is chunk
// overlap/repetition: the same participant repeating similar speech (or the
// same sentence spanning adjacent chunks) must not spam a new popup every
// ~5 seconds. A simple per-(participant, type) cooldown handles this without
// any extra ML — exactly the "state management, not clever inference" this
// engine is meant to be.
const AUDIO_COOLDOWN_MS = 45_000;

const warningMessages = {
  phone_usage: 'Please avoid using your phone during the meeting.',
  camera_covered: 'Your camera appears to be covered. Please make sure your camera is visible.',
  explicit_content: 'Explicit or inappropriate content was detected. Please stop.',
  audio_default: 'Inappropriate language was detected. Please maintain respectful communication.',
};

const warningFor = (source, type) =>
  source === 'video' ? warningMessages[type] || warningMessages.audio_default : warningMessages.audio_default;

// In-memory tracking state, one process's worth — matches the same scope and
// justification as modules/rooms/admission.socket.js's `hostSubscriptions`
// Map: this is liveness/debounce bookkeeping, not the source of truth (Mongo
// is), so losing it on a restart just means the next detection starts a
// fresh confirmation sequence rather than silently missing something.
const videoState = new Map(); // key -> { hits, misses, violationId }
const audioCooldowns = new Map(); // key -> last confirmed timestamp (ms)

const videoKey = (roomCode, participantId, type) => `${roomCode}::${participantId}::${type}`;

const toPublicViolation = (doc) => ({
  violationId: doc._id.toString(),
  roomCode: doc.roomCode,
  participantId: doc.participantId,
  participantName: doc.participantName,
  source: doc.source,
  type: doc.type,
  severity: doc.severity,
  confidence: doc.confidence,
  reason: doc.reason,
  status: doc.status,
  hostAcknowledged: doc.hostAcknowledged,
  actionTaken: doc.actionTaken,
  createdAt: doc.createdAt,
});

const createViolation = async ({ roomCode, hostId, participantId, participantName, source, type, severity, confidence, reason }) => {
  const doc = await MeetingViolation.create({
    roomCode,
    hostId,
    participantId,
    participantName,
    source,
    type,
    severity,
    confidence,
    reason,
    status: 'active',
  });

  logger.info('[VIOLATION] Confirmed', { roomCode, participantId, source, type, severity });

  notifyHostOfViolation(roomCode, toPublicViolation(doc));

  return doc;
};

// Called once per video detection sample for one participant (the frontend
// already samples ~every 3s via useVisionDetection — this is not a new
// polling loop, just where that existing cadence gets evaluated).
// `detections` is the EXISTING /detect response shape, used as-is:
//   { personCount, phoneDetected, cameraCovered: {status,...}, explicitContent: {flagged,...} }
const evaluateVideoDetection = async ({ roomCode, participantId, participantName, detections }) => {
  if (!detections) return null;

  const room = await roomService.getRoomByCode(roomCode);
  const results = [];

  const samples = [
    { type: 'phone_usage', present: Boolean(detections.phoneDetected), confidence: detections.phoneConfidence ?? 0.6 },
    {
      type: 'camera_covered',
      present: detections.cameraCovered?.status === 'covered',
      confidence: detections.cameraCovered?.confidence ?? 0.6,
    },
    {
      type: 'explicit_content',
      present: Boolean(detections.explicitContent?.flagged),
      confidence: detections.explicitContent?.confidence ?? 0.6,
      immediate: true,
    },
  ];

  for (const sample of samples) {
    const key = videoKey(roomCode, participantId, sample.type);
    const state = videoState.get(key) || { hits: 0, misses: 0, violationId: null };

    if (sample.present) {
      state.hits += 1;
      state.misses = 0;

      const threshold = sample.immediate ? 1 : VIDEO_CONFIRM_THRESHOLD[sample.type];

      if (!state.violationId && state.hits >= threshold) {
        // eslint-disable-next-line no-await-in-loop -- sequential is fine; at most 3 small samples per call
        const doc = await createViolation({
          roomCode,
          hostId: room.hostId,
          participantId,
          participantName,
          source: 'video',
          type: sample.type,
          severity: VIDEO_SEVERITY[sample.type],
          confidence: sample.confidence,
          reason: `${sample.type.replace('_', ' ')} detected`,
        });
        state.violationId = doc._id.toString();
        results.push({ confirmed: true, type: sample.type, warning: warningFor('video', sample.type) });
      }
      // Already active: intentionally no new event — this is the
      // "same active violation, no new popup" requirement.
    } else {
      state.hits = 0;
      if (state.violationId) {
        state.misses += 1;
        if (state.misses >= VIDEO_RESOLVE_THRESHOLD) {
          // eslint-disable-next-line no-await-in-loop
          await MeetingViolation.updateOne(
            { _id: state.violationId },
            { status: 'resolved', resolvedAt: new Date() }
          );
          state.violationId = null;
          state.misses = 0;
        }
      }
    }

    videoState.set(key, state);
  }

  return results;
};

// Called once per audio chunk result for one participant — the existing
// Python /api/v1/analyze/audio response, used as-is:
//   { flagged, type, severity, confidence, reason, text, ... }
// No new Gemini/LLM call is made here or anywhere in this module; whatever
// that response already contains (today: local keyword filter only, per the
// project's current configuration) is treated as the audio detection result.
const evaluateAudioDetection = async ({ roomCode, participantId, participantName, result }) => {
  if (!result?.flagged) return null;

  const room = await roomService.getRoomByCode(roomCode);
  const type = result.type || 'other';
  const key = videoKey(roomCode, participantId, `audio:${type}`);
  const lastConfirmed = audioCooldowns.get(key) || 0;

  if (Date.now() - lastConfirmed < AUDIO_COOLDOWN_MS) {
    return null; // suppressed — same participant+type still in cooldown
  }

  audioCooldowns.set(key, Date.now());

  await createViolation({
    roomCode,
    hostId: room.hostId,
    participantId,
    participantName,
    source: 'audio',
    type,
    severity: result.severity && result.severity !== 'none' ? result.severity : 'medium',
    confidence: result.confidence ?? 0,
    reason: result.reason || 'Prohibited language detected',
  });

  return { confirmed: true, type, warning: warningFor('audio', type) };
};

const assertIsHost = async (roomCode, requesterUid) => {
  const room = await roomService.getRoomByCode(roomCode);
  if (room.hostId !== requesterUid) {
    throw ApiError.forbidden('Only the room host can perform this action');
  }
  return room;
};

// "Active" here means "still needs the host's attention": status=active
// (the underlying condition is still detected) AND not yet acknowledged or
// actioned — a dismissed-but-still-ongoing violation stays `status: active`
// by design (see violationEvent.model.js), so it must be excluded here
// explicitly rather than relying on callers to filter it out themselves.
const listActive = async (roomCode, requesterUid) => {
  await assertIsHost(roomCode, requesterUid);
  const docs = await MeetingViolation.find({
    roomCode,
    status: 'active',
    hostAcknowledged: false,
    actionTaken: null,
  }).sort({ createdAt: 1 });
  return docs.map(toPublicViolation);
};

// UI-only acknowledgment — deliberately does NOT touch `status`. A still-
// visible phone is still an active violation even after the host closes the
// popup card; see violationEvent.model.js's hostAcknowledged field.
const dismiss = async (roomCode, violationId, requesterUid) => {
  await assertIsHost(roomCode, requesterUid);
  const doc = await MeetingViolation.findOneAndUpdate(
    { _id: violationId, roomCode },
    { hostAcknowledged: true },
    { new: true }
  );
  if (!doc) {
    throw ApiError.notFound('Violation not found');
  }
  notifyHostViolationUpdated(roomCode, toPublicViolation(doc));
  return toPublicViolation(doc);
};

const recordAction = async (roomCode, violationId, requesterUid, actionTaken) => {
  await assertIsHost(roomCode, requesterUid);
  const doc = await MeetingViolation.findOneAndUpdate(
    { _id: violationId, roomCode },
    { actionTaken },
    { new: true }
  );
  if (!doc) {
    throw ApiError.notFound('Violation not found');
  }
  notifyHostViolationUpdated(roomCode, toPublicViolation(doc));
  return doc;
};

module.exports = {
  evaluateVideoDetection,
  evaluateAudioDetection,
  assertIsHost,
  listActive,
  dismiss,
  recordAction,
  toPublicViolation,
};
