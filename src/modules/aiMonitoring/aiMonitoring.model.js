const mongoose = require('mongoose');

const { Schema } = mongoose;

// One document per participant, per meeting — tracks the running state of
// the AI monitoring pipeline (frames/audio analyzed, last check-in, etc.)
// rather than every single frame, which would be far too high-volume for Mongo.
const monitoringSessionSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    framesAnalyzed: {
      type: Number,
      default: 0,
    },
    audioChunksAnalyzed: {
      type: Number,
      default: 0,
    },
    violationsFlagged: {
      type: Number,
      default: 0,
    },
    lastAnalyzedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

monitoringSessionSchema.index({ meeting: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('MonitoringSession', monitoringSessionSchema);
