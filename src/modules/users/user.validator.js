const { z } = require('zod');
const { ROLES } = require('../../constants/roles');

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(ROLES)),
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(Object.values(ROLES)).optional(),
  search: z.string().optional(),
});

module.exports = { updateProfileSchema, updateUserRoleSchema, listUsersQuerySchema };
