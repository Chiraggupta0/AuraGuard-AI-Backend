const ApiError = require('../utils/ApiError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// Validates `req[part]` (body/query/params) against a Zod schema.
// Usage: router.post('/', validate(createUserSchema), controller.create)
const validate =
  (schema, part = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', details));
    }

    req[part] = result.data;
    next();
  };

module.exports = validate;
