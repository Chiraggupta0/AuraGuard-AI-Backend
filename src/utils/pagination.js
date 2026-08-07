const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Normalizes `?page=&limit=` query params into safe Mongoose skip/limit values.
const getPaginationParams = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Builds a standard pagination meta object for list responses.
const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { getPaginationParams, buildPaginationMeta };
