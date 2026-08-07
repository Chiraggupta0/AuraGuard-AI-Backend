const ApiError = require('../../src/utils/ApiError');
const { getPaginationParams, buildPaginationMeta } = require('../../src/utils/pagination');

describe('ApiError', () => {
  it('builds a notFound error with the right status code', () => {
    const error = ApiError.notFound('Thing not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Thing not found');
    expect(error.isOperational).toBe(true);
  });
});

describe('pagination utils', () => {
  it('falls back to sane defaults for missing/invalid query params', () => {
    expect(getPaginationParams({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('caps limit at the maximum allowed value', () => {
    expect(getPaginationParams({ page: '2', limit: '9999' })).toEqual({
      page: 2,
      limit: 100,
      skip: 100,
    });
  });

  it('computes pagination meta correctly', () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10, total: 25 });
    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});
