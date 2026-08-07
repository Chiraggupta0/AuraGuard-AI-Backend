// Socket.IO event name constants, shared between server handlers and (via the
// docs) the frontend client so event names never drift out of sync.
const SOCKET_EVENTS = Object.freeze({
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  MEETING_JOIN: 'meeting:join',
  MEETING_LEAVE: 'meeting:leave',
  MEETING_PARTICIPANT_JOINED: 'meeting:participant_joined',
  MEETING_PARTICIPANT_LEFT: 'meeting:participant_left',

  MONITORING_FRAME: 'monitoring:frame',
  MONITORING_AUDIO_CHUNK: 'monitoring:audio_chunk',

  MODERATION_WARNING: 'moderation:warning',
  MODERATION_ACTION_TAKEN: 'moderation:action_taken',
  MODERATION_VIDEO_BLURRED: 'moderation:video_blurred',
  MODERATION_AUDIO_MUTED: 'moderation:audio_muted',

  VIOLATION_DETECTED: 'violation:detected',

  NOTIFICATION_NEW: 'notification:new',

  ERROR: 'error',
});

module.exports = SOCKET_EVENTS;
