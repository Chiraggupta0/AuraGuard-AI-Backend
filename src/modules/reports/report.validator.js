const { z } = require('zod');
const { REPORT_STATUS } = require('../../constants/domain');

const createReportSchema = z.object({
  meeting: z.string().min(1),
  reportedUser: z.string().min(1),
  relatedViolation: z.string().optional(),
  reason: z.string().min(5).max(1000),
});

const resolveReportSchema = z.object({
  status: z.enum(Object.values(REPORT_STATUS)),
  resolutionNotes: z.string().max(1000).optional(),
});

const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(Object.values(REPORT_STATUS)).optional(),
});

module.exports = { createReportSchema, resolveReportSchema, listReportsQuerySchema };
