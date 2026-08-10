const Room = require('./room.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

// Generate a unique room code
const generateRoomCode = () => {
  const adjectives = ['Aurora', 'Quantum', 'Nexus', 'Prism', 'Apex', 'Zenith'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNum = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${randomAdj}-${randomNum}`;
};

// Create a new room
const createRoom = async (userId, userEmail) => {
  try {
    let roomCode;
    let roomExists = true;

    // Generate unique room code
    while (roomExists) {
      roomCode = generateRoomCode();
      const existing = await Room.findOne({ roomCode });
      roomExists = !!existing;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const room = new Room({
      roomCode,
      roomName: roomCode,
      hostId: userId,
      hostEmail: userEmail,
      status: 'ACTIVE',
      expiresAt,
      participants: [
        {
          userId,
          email: userEmail,
        },
      ],
    });

    await room.save();

    logger.info('[ROOM] Room created', {
      roomCode,
      hostId: userId,
      expiresAt,
    });

    return {
      roomCode,
      roomName: room.roomName,
      hostEmail: userEmail,
      status: room.status,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
    };
  } catch (error) {
    logger.error('[ROOM] Error creating room', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

// Escape regex metacharacters so a user-supplied code can never act as a pattern.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Validate and get room. The lookup is case-insensitive because users retype
// codes by hand (and the Join form uppercases them), while stored codes are
// mixed case (e.g. "Nexus-SUPDMU").
const getRoomByCode = async (roomCode) => {
  try {
    const room = await Room.findOne({
      roomCode: new RegExp(`^${escapeRegex(String(roomCode).trim())}$`, 'i'),
    });

    if (!room) {
      logger.warn('[ROOM] Room not found', { roomCode });
      throw ApiError.notFound('Room not found');
    }

    if (room.status !== 'ACTIVE') {
      logger.warn('[ROOM] Room is not active', {
        roomCode,
        status: room.status,
      });
      throw ApiError.badRequest('Room is no longer active');
    }

    if (new Date() > room.expiresAt) {
      logger.warn('[ROOM] Room has expired', { roomCode });
      throw ApiError.badRequest('Room has expired');
    }

    return room;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('[ROOM] Error getting room', {
      error: error.message,
      roomCode,
    });
    throw error;
  }
};

// Add participant to room
const addParticipantToRoom = async (roomCode, userId, userEmail) => {
  try {
    const room = await getRoomByCode(roomCode);

    // Check if participant already in room
    const participantExists = room.participants.some(
      (p) => p.userId?.toString() === userId.toString()
    );

    if (!participantExists) {
      room.participants.push({
        userId,
        email: userEmail,
      });
      await room.save();

      logger.info('[ROOM] Participant added', {
        roomCode,
        userId,
        participantCount: room.participants.length,
      });
    }

    return room;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('[ROOM] Error adding participant', {
      error: error.message,
      roomCode,
      userId,
    });
    throw error;
  }
};

// End room
const endRoom = async (roomCode) => {
  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    room.status = 'ENDED';
    await room.save();

    logger.info('[ROOM] Room ended', { roomCode });

    return room;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('[ROOM] Error ending room', {
      error: error.message,
      roomCode,
    });
    throw error;
  }
};

module.exports = {
  createRoom,
  getRoomByCode,
  addParticipantToRoom,
  endRoom,
  generateRoomCode,
};
