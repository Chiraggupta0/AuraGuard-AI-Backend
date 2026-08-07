const mongoose = require('mongoose');

const { Schema } = mongoose;

// Singleton-style key/value store for platform-wide configuration that
// admins can tune without a redeploy (moderation thresholds, feature flags).
const settingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
