// Domain-level enums shared by multiple modules/models.
//
// VIOLATION_TYPES and VIOLATION_SEVERITY double as the shared vocabulary
// contract with the AuraGuard-AI-Service (FastAPI): its /analyze/* responses
// are expected to use these exact string values. See src/clients/aiService.client.js
// and src/docs/ai-service-contract.md. Keep both repos in sync when changing these.
const VIOLATION_TYPES = Object.freeze({
  NUDITY: 'nudity',
  VIOLENCE: 'violence',
  HATE_SPEECH: 'hate_speech',
  HARASSMENT: 'harassment',
  ABUSIVE_LANGUAGE: 'abusive_language',
  WEAPON_DETECTED: 'weapon_detected',
  SELF_HARM: 'self_harm',
  OTHER: 'other',
});

const VIOLATION_SEVERITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const VIOLATION_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  DISMISSED: 'dismissed',
  ESCALATED: 'escalated',
});

const MODERATION_ACTION_TYPES = Object.freeze({
  WARNING: 'warning',
  VIDEO_BLUR: 'video_blur',
  AUDIO_MUTE: 'audio_mute',
  KICK_FROM_MEETING: 'kick_from_meeting',
  BAN_USER: 'ban_user',
  REPORT_FILED: 'report_filed',
});

const MEETING_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
});

const NOTIFICATION_TYPES = Object.freeze({
  VIOLATION_WARNING: 'violation_warning',
  MODERATION_ACTION: 'moderation_action',
  SYSTEM: 'system',
  REPORT_UPDATE: 'report_update',
});

const REPORT_STATUS = Object.freeze({
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
});

module.exports = {
  VIOLATION_TYPES,
  VIOLATION_SEVERITY,
  VIOLATION_STATUS,
  MODERATION_ACTION_TYPES,
  MEETING_STATUS,
  NOTIFICATION_TYPES,
  REPORT_STATUS,
};
