const { sendMail } = require('../helpers/email.helper');

// Templated, domain-level emails. Controllers/services call these instead of
// touching the low-level mail helper directly.

const sendWelcomeEmail = async (user) => {
  return sendMail({
    to: user.email,
    subject: 'Welcome to AuraGuard AI',
    html: `<p>Hi ${user.name},</p><p>Welcome to AuraGuard AI. Your account has been created successfully.</p>`,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  // TODO: point this at the actual frontend reset-password route.
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your AuraGuard AI password',
    html: `<p>Hi ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  });
};

const sendViolationAlertEmail = async (user, violation) => {
  return sendMail({
    to: user.email,
    subject: 'AuraGuard AI — Policy Violation Detected',
    html: `<p>Hi ${user.name},</p><p>A ${violation.severity} severity violation ("${violation.type}") was detected in your recent meeting. Please review our community guidelines.</p>`,
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendViolationAlertEmail };
