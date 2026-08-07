const reportRepository = require('./report.repository');
const ApiError = require('../../utils/ApiError');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/pagination');
const { REPORT_STATUS } = require('../../constants/domain');

const fileReport = async (reporterId, data) =>
  reportRepository.create({ ...data, reportedBy: reporterId });

const getReportById = async (id) => {
  const report = await reportRepository.findById(id);
  if (!report) throw ApiError.notFound('Report not found');
  return report;
};

const listReports = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.status) filter.status = query.status;

  const [reports, total] = await Promise.all([
    reportRepository.findAll({ filter, skip, limit }),
    reportRepository.count(filter),
  ]);

  return { reports, meta: buildPaginationMeta({ page, limit, total }) };
};

const resolveReport = async (id, handlerId, { status, resolutionNotes }) => {
  const updates = { status, resolutionNotes, handledBy: handlerId };
  if (status === REPORT_STATUS.RESOLVED || status === REPORT_STATUS.REJECTED) {
    updates.resolvedAt = new Date();
  }

  const report = await reportRepository.updateById(id, updates);
  if (!report) throw ApiError.notFound('Report not found');
  return report;
};

module.exports = { fileReport, getReportById, listReports, resolveReport };
