// Wraps async route handlers/controllers so rejected promises are forwarded
// to Express's `next(err)` instead of needing a try/catch in every controller.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
