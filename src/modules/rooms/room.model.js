const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    hostId: {
      type: String,  // Firebase UID (string, not ObjectId)
      required: true,
      index: true,
    },
    hostEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ENDED'],
      default: 'ACTIVE',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    participants: [
      {
        userId: String,  // Firebase UID (string, not ObjectId)
        email: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for finding active rooms
roomSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Room', roomSchema);
