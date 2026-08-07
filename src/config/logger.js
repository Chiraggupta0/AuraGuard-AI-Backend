const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `[${ts}] ${level}: ${stack || message}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
  new DailyRotateFile({
    dirname: path.join(process.cwd(), 'logs'),
    filename: 'auraguard-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: env.logLevel,
  transports,
  exitOnError: false,
});

module.exports = logger;
