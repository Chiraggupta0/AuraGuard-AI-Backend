const express = require('express');

const authRoutes = require('../../modules/auth/auth.routes');
const userRoutes = require('../../modules/users/user.routes');
const meetingRoutes = require('../../modules/meetings/meeting.routes');
const aiMonitoringRoutes = require('../../modules/aiMonitoring/aiMonitoring.routes');
const violationRoutes = require('../../modules/violations/violation.routes');
const moderationRoutes = require('../../modules/moderation/moderation.routes');
const reportRoutes = require('../../modules/reports/report.routes');
const notificationRoutes = require('../../modules/notifications/notification.routes');
const dashboardRoutes = require('../../modules/dashboard/dashboard.routes');
const adminRoutes = require('../../modules/admin/admin.routes');
const settingRoutes = require('../../modules/settings/setting.routes');
const auditLogRoutes = require('../../modules/auditLogs/auditLog.routes');

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/users', route: userRoutes },
  { path: '/meetings', route: meetingRoutes },
  { path: '/ai-monitoring', route: aiMonitoringRoutes },
  { path: '/violations', route: violationRoutes },
  { path: '/moderation', route: moderationRoutes },
  { path: '/reports', route: reportRoutes },
  { path: '/notifications', route: notificationRoutes },
  { path: '/dashboard', route: dashboardRoutes },
  { path: '/admin', route: adminRoutes },
  { path: '/settings', route: settingRoutes },
  { path: '/audit-logs', route: auditLogRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

module.exports = router;
