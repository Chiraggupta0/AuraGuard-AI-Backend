const mongoose = require('mongoose');

// Admission ("knock to enter") request for a Room. Deliberately a separate
// collection from Room so this admission feature never has to touch
// room.model.js.
const joinRequestSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    hostId: {
      type: String, // Firebase UID of the room's host at request time
      required: true,
    },
    participantId: {
      type: String, // Firebase UID of the person requesting to join
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
    },
    participantName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One pending lookup per (room, participant) is the hot path — dedupe checks
// and the joinRoom authorization guard both query this shape.
joinRequestSchema.index({ roomCode: 1, participantId: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
