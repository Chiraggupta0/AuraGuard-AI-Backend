const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { MEETING_STATUS } = require('../../constants/domain');

const { Schema } = mongoose;

const participantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
    isVerifiedAdultMode: { type: Boolean, default: false },
  },
  { _id: false }
);

const meetingSchema = new Schema(
  {
    roomId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Meeting',
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [participantSchema],
    status: {
      type: String,
      enum: Object.values(MEETING_STATUS),
      default: MEETING_STATUS.SCHEDULED,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    isModerationEnabled: {
      type: Boolean,
      default: true,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

meetingSchema.index({ host: 1, status: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
