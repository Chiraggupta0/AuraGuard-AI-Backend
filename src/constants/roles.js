// Role-Based Access Control (RBAC) roles used across the platform.
const ROLES = Object.freeze({
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

// Ordered from least to most privileged. Useful for "at least this role" checks.
const ROLE_HIERARCHY = [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];

module.exports = { ROLES, ROLE_HIERARCHY };
