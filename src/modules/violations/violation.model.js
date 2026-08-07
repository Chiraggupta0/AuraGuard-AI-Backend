const mongoose = require('mongoose');
const { VIOLATION_TYPES, VIOLATION_SEVERITY, VIOLATION_STATUS } = require('../../constants/domain');

const { Schema } = mongoose;

const violationSchema = new Schema(
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
    type: {
      type: String,
      enum: Object.values(VIOLATION_TYPES),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(VIOLATION_SEVERITY),
      default: VIOLATION_SEVERITY.LOW,
    },
    status: {
      type: String,
      enum: Object.values(VIOLATION_STATUS),
      default: VIOLATION_STATUS.PENDING,
    },
    source: {
      type: String,
      enum: ['video', 'audio', 'text'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    evidenceUrl: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

violationSchema.index({ meeting: 1, createdAt: -1 });
violationSchema.index({ user: 1, createdAt: -1 });
violationSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('Violation', violationSchema);
