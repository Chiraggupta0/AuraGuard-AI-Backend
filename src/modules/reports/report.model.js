const mongoose = require('mongoose');
const { REPORT_STATUS } = require('../../constants/domain');

const { Schema } = mongoose;

// User-filed report against another participant, distinct from an
// AI-detected Violation — this is a human flagging behavior for review.
const reportSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedViolation: {
      type: Schema.Types.ObjectId,
      ref: 'Violation',
      default: null,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.OPEN,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });

module.exports = mongoose.model('Report', reportSchema);
