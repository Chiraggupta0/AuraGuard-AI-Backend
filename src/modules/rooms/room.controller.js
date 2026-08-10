const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const liveKitService = require('../../services/livekit.service');
const roomService = require('./room.service');
const { generateTokenSchema, createRoomSchema, joinRoomSchema } = require('./room.validator');
const logger = require('../../config/logger');

// Create a new room
const createRoom = catchAsync(async (req, res) => {
  const { displayName } = await createRoomSchema.parseAsync(req.body);

  // Firebase user already authenticated by middleware
  const userId = req.user._id;  // Firebase UID
  const userEmail = req.user.email;

  console.log('[ROOM CONTROLLER] Creating room for Firebase user:', { userId, userEmail });
  logger.info('[ROOM] Creating room', { userId, userEmail });

  const roomInfo = await roomService.createRoom(userId, userEmail);

  logger.info('[ROOM] Room created successfully', {
    roomCode: roomInfo.roomCode,
    userId,
  });

  new ApiResponse(201, 'Room created successfully', roomInfo).send(res);
});

// Join an existing room and get LiveKit token
const joinRoom = catchAsync(async (req, res) => {
  const { roomCode, displayName } = await joinRoomSchema.parseAsync(req.body);
  const userId = req.user._id;
  const userEmail = req.user.email;

  logger.info('[ROOM] Joining room', { roomCode, userId });

  // Validate room exists and is active
  const room = await roomService.getRoomByCode(roomCode);

  // Always use the stored code from here on. Lookup is case-insensitive, so two
  // users typing different casing must still be granted the SAME LiveKit room —
  // granting the raw input would silently place them in separate rooms.
  const canonicalRoomCode = room.roomCode;

  logger.info('[ROOM] Room validation successful', {
    requestedRoomCode: roomCode,
    canonicalRoomCode,
    status: room.status,
  });

  // Add participant to room
  await roomService.addParticipantToRoom(canonicalRoomCode, userId, userEmail);

  // Identity is derived from the Firebase UID so a participant is traceable to a
  // real account. The random suffix keeps it unique per session — LiveKit evicts
  // an existing participant when a new one joins with the same identity, which
  // would otherwise make two tabs of one account kick each other.
  const sessionSuffix = Math.random().toString(36).slice(2, 8);
  const livekitUserId = `${req.user.uid}-${sessionSuffix}`;
  const finalDisplayName = displayName || req.user.name || userEmail.split('@')[0] || 'Guest';

  logger.info('[LIVEKIT] Generating token', {
    roomCode: canonicalRoomCode,
    livekitUserId,
    displayName: finalDisplayName,
  });

  const { token, serverUrl } = await liveKitService.generateRoomToken(
    canonicalRoomCode,
    livekitUserId,
    finalDisplayName,
    { email: userEmail, uid: req.user.uid }
  );

  logger.info('[LIVEKIT] Token generated successfully', {
    roomCode: canonicalRoomCode,
    livekitUserId,
  });

  new ApiResponse(200, 'Token generated successfully', {
    token,
    serverUrl,
    roomCode: canonicalRoomCode,
    roomName: room.roomName,
  }).send(res);
});

// Validate room exists
const validateRoom = catchAsync(async (req, res) => {
  const { roomCode } = req.params;

  logger.info('[ROOM] Validating room', { roomCode });

  const room = await roomService.getRoomByCode(roomCode);

  logger.info('[ROOM] Room validation successful', { roomCode });

  new ApiResponse(200, 'Room is valid', {
    roomCode: room.roomCode,
    status: room.status,
    expiresAt: room.expiresAt,
  }).send(res);
});

// Legacy endpoint - generates token with any room (for backward compatibility during transition)
const generateToken = catchAsync(async (req, res) => {
  const { roomName, displayName } = await generateTokenSchema.parseAsync(req.body);

  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const finalDisplayName = displayName || `Guest-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  logger.warn('[LIVEKIT] Legacy token generation endpoint used', { roomName });

  const { token, serverUrl } = await liveKitService.generateRoomToken(roomName, userId, finalDisplayName);

  new ApiResponse(200, 'Token generated successfully', { token, serverUrl, roomName }).send(res);
});

module.exports = {
  createRoom,
  joinRoom,
  validateRoom,
  generateToken,
};
