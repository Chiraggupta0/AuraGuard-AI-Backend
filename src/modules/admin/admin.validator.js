const { z } = require('zod');
const { ROLES } = require('../../constants/roles');

const banUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

const changeRoleSchema = z.object({
  role: z.enum(Object.values(ROLES)),
});

module.exports = { banUserSchema, changeRoleSchema };
