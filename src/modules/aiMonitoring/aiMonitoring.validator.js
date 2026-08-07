const { z } = require('zod');

const startSessionSchema = z.object({
  meeting: z.string().min(1),
});

const analyzeTextSchema = z.object({
  meeting: z.string().min(1),
  text: z.string().min(1).max(5000),
});

module.exports = { startSessionSchema, analyzeTextSchema };
