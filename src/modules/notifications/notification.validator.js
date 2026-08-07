const { z } = require('zod');

const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  unreadOnly: z.coerce.boolean().optional(),
});

module.exports = { listNotificationsQuerySchema };
