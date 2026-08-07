const auditLogService = require('./auditLog.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const HTTP_STATUS = require('../../constants/httpStatusCodes');

const listLogs = catchAsync(async (req, res) => {
  const { logs, meta } = await auditLogService.listLogs(req.query);
  new ApiResponse(HTTP_STATUS.OK, 'Audit logs fetched', logs, meta).send(res);
});

module.exports = { listLogs };
