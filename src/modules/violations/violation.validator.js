const { z } = require('zod');
const { VIOLATION_TYPES, VIOLATION_SEVERITY, VIOLATION_STATUS } = require('../../constants/domain');

const createViolationSchema = z.object({
  meeting: z.string().min(1),
  user: z.string().min(1),
  type: z.enum(Object.values(VIOLATION_TYPES)),
  severity: z.enum(Object.values(VIOLATION_SEVERITY)).optional(),
  source: z.enum(['video', 'audio', 'text']),
  confidence: z.number().min(0).max(1).optional(),
  description: z.string().max(1000).optional(),
  evidenceUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateViolationStatusSchema = z.object({
  status: z.enum(Object.values(VIOLATION_STATUS)),
});

const listViolationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(Object.values(VIOLATION_STATUS)).optional(),
  severity: z.enum(Object.values(VIOLATION_SEVERITY)).optional(),
  meeting: z.string().optional(),
  user: z.string().optional(),
});

module.exports = { createViolationSchema, updateViolationStatusSchema, listViolationsQuerySchema };
