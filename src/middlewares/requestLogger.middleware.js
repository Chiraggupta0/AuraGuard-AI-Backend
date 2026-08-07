const morgan = require('morgan');
const logger = require('../config/logger');

// Pipes Morgan's HTTP access log lines into Winston so all logging goes
// through one place (console + rotating files).
const stream = {
  write: (message) => (logger.http ? logger.http(message.trim()) : logger.info(message.trim())),
};

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream,
});

module.exports = requestLogger;
