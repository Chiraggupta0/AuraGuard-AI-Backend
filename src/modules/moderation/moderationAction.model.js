const mongoose = require('mongoose');
const { MODERATION_ACTION_TYPES } = require('../../constants/domain');

const { Schema } = mongoose;

// Records every moderation action taken, whether triggered automatically by
// the AI pipeline or manually by a moderator/admin. Doubles as an audit
// trail for "what happened to this user in this meeting".
const moderationActionSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    violation: {
      type: Schema.Types.ObjectId,
      ref: 'Violation',
      default: null,
    },
    actionType: {
      type: String,
      enum: Object.values(MODERATION_ACTION_TYPES),
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = performed automatically by the AI system
    },
    isAutomatic: {
      type: Boolean,
      default: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

moderationActionSchema.index({ meeting: 1, createdAt: -1 });
moderationActionSchema.index({ targetUser: 1, createdAt: -1 });

module.exports = mongoose.model('ModerationAction', moderationActionSchema);
