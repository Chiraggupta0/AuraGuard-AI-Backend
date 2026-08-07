const mongoose = require('mongoose');

const { Schema } = mongoose;

// Immutable trail of sensitive/administrative actions (role changes, account
// deactivation, settings updates, etc.) for compliance and debugging.
const auditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system-generated
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      trim: true,
      default: null,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
