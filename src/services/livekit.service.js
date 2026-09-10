const { AccessToken, RoomServiceClient, TrackType } = require('livekit-server-sdk');
const env = require('../config/env');
const logger = require('../config/logger');

let roomServiceClient = null;
const getRoomServiceClient = () => {
  if (!roomServiceClient) {
    roomServiceClient = new RoomServiceClient(env.livekitUrl, env.livekitApiKey, env.livekitApiSecret);
  }
  return roomServiceClient;
};

// A room's LiveKit identity is `${firebaseUid}-${randomSuffix}` (see
// room.controller.js#joinRoom) — a fresh suffix per session, so callers that
// only know the stable Firebase UID (e.g. the Violation Engine) need to
// resolve the participant's CURRENT identity before they can be muted or
// removed. Returns null if that UID isn't currently in the room (e.g. they
// already left) rather than throwing, since that's an expected race, not a
// server error.
const findParticipantIdentity = async (roomName, firebaseUid) => {
  const participants = await getRoomServiceClient().listParticipants(roomName);
  const match = participants.find((p) => p.identity === firebaseUid || p.identity.startsWith(`${firebaseUid}-`));
  return match ? match.identity : null;
};

// Mutes the participant's published microphone track server-side — enforced
// by LiveKit itself, not just hidden in the host's UI.
const muteParticipantAudio = async (roomName, identity) => {
  const participant = await getRoomServiceClient().getParticipant(roomName, identity);
  const audioTrack = participant.tracks.find((t) => t.type === TrackType.AUDIO);
  if (!audioTrack) {
    logger.warn('Mute requested but participant has no published audio track', { roomName, identity });
    return null;
  }
  return getRoomServiceClient().mutePublishedTrack(roomName, identity, audioTrack.sid, true);
};

const removeParticipant = async (roomName, identity) => getRoomServiceClient().removeParticipant(roomName, identity);

const generateRoomToken = async (roomName, userId, displayName, extraMetadata = {}) => {
  try {
    if (!env.livekitUrl || !env.livekitApiKey || !env.livekitApiSecret) {
      throw new Error('LiveKit credentials are not configured');
    }

    // The installed livekit-server-sdk (0.4.x) has no `name` option — passing one
    // is silently dropped, which is why remote tiles had no label. It does support
    // `metadata`, so the display name travels there instead.
    const token = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
      identity: userId,
      metadata: JSON.stringify({ displayName, ...extraMetadata }),
      ttl: 3600, // 1 hour
    });

    // Grant permissions to publish audio/video and subscribe to others
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    return {
      token: jwt,
      serverUrl: env.livekitUrl,
    };
  } catch (error) {
    logger.error('Error generating LiveKit token', {
      error: error.message,
      roomName,
      userId,
    });
    throw error;
  }
};

module.exports = {
  generateRoomToken,
  findParticipantIdentity,
  muteParticipantAudio,
  removeParticipant,
};
