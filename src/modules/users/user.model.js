const mongoose = require('mongoose');
const { ROLES } = require('../../constants/roles');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerifiedAdult: {
      type: Boolean,
      default: false,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordChangedAt;
  delete obj.avatarPublicId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
