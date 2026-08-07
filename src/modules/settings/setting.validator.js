const { z } = require('zod');

const upsertSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
  description: z.string().max(500).optional(),
});

module.exports = { upsertSettingSchema };
