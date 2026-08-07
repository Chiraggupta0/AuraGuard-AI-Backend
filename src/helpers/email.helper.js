const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return transporter;
};

// Low-level mail sender. Higher-level, templated emails (welcome, violation
// alert, etc.) live in src/services/email.service.js.
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await getTransporter().sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendMail, getTransporter };
