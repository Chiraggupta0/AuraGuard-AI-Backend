const { z } = require('zod');

const generateTokenSchema = z.object({
  roomName: z.string().min(1).max(128),
  displayName: z.string().min(1).max(128).optional(),
});

const createRoomSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
});

const joinRoomSchema = z.object({
  roomCode: z.string().min(1).max(128),
  displayName: z.string().min(1).max(128).optional(),
});

module.exports = {
  generateTokenSchema,
  createRoomSchema,
  joinRoomSchema,
};
