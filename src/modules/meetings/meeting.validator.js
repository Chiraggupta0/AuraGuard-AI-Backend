const { z } = require('zod');

const createMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  scheduledAt: z.coerce.date().optional(),
  isModerationEnabled: z.boolean().optional(),
});

const updateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isModerationEnabled: z.boolean().optional(),
});

const joinMeetingSchema = z.object({
  isVerifiedAdultMode: z.boolean().optional(),
});

module.exports = { createMeetingSchema, updateMeetingSchema, joinMeetingSchema };
