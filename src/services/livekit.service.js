const { AccessToken } = require('livekit-server-sdk');
const env = require('../config/env');
const logger = require('../config/logger');

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
};
