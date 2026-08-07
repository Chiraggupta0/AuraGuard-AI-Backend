const { z } = require('zod');
const { MODERATION_ACTION_TYPES } = require('../../constants/domain');

const createModerationActionSchema = z.object({
  meeting: z.string().min(1),
  targetUser: z.string().min(1),
  violation: z.string().optional(),
  actionType: z.enum(Object.values(MODERATION_ACTION_TYPES)),
  reason: z.string().max(500).optional(),
});

const listModerationActionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  meeting: z.string().optional(),
  targetUser: z.string().optional(),
  actionType: z.enum(Object.values(MODERATION_ACTION_TYPES)).optional(),
});

module.exports = { createModerationActionSchema, listModerationActionsQuerySchema };
