const mongoose = require('mongoose');

// A confirmed safety violation for a LiveKit-based Room meeting. Deliberately
// a NEW collection/module, not the existing modules/violations/violation.model.js
// (Violation) — that model is keyed by Mongo `Meeting`/`User` ObjectId refs,
// a different, unrelated identity model from this app's actual Firebase-UID +
// Room.roomCode world (see modules/rooms/room.model.js). Reusing it would
// require fabricating Meeting/User documents that don't exist for LiveKit
// rooms today. This mirrors the pattern modules/rooms/joinRequest.model.js
// already established for the same reason.
const violationEventSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    hostId: {
      type: String, // Firebase UID of the room's host at detection time
      required: true,
    },
    participantId: {
      type: String, // Firebase UID of the participant who triggered this
      required: true,
      index: true,
    },
    participantName: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['video', 'audio'],
      required: true,
    },
    // Video: 'phone_usage' | 'camera_covered' | 'explicit_content' — exactly
    // what the existing YOLO/NudeNet/camera-visibility detectors report today.
    // Audio: passed through verbatim from the existing Python speech
    // service's own `type` field (see AuraGuard-AI-Python/speech/schemas.py
    // ViolationType) rather than inventing a second taxonomy.
    type: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    reason: {
      type: String,
      default: '',
    },
    // Detection-driven, not UI-driven — see hostAcknowledged below for the
    // separate "host clicked Dismiss" concept.
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // Dismissing the host popup or the participant warning is a UI action —
    // it must NOT resolve the violation (still-active phone usage is still
    // active even after the host closes the card). Tracked separately.
    hostAcknowledged: {
      type: Boolean,
      default: false,
    },
    actionTaken: {
      type: String,
      enum: [null, 'muted', 'removed'],
      default: null,
    },
  },
  { timestamps: true }
);

violationEventSchema.index({ roomCode: 1, participantId: 1, source: 1, type: 1, status: 1 });
violationEventSchema.index({ roomCode: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('MeetingViolation', violationEventSchema);
