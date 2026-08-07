const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Centralized, typed access to environment variables so the rest of the
// codebase never touches `process.env` directly.
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  mongo: {
    uri:
      process.env.NODE_ENV === 'test'
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auraguard_ai',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'AuraGuard AI <no-reply@auraguard.ai>',
  },

  // AuraGuard-AI-Service is a separate FastAPI repo — the Node backend only
  // ever talks to it over HTTP via src/clients/aiService.client.js. No AI
  // provider keys (OpenAI/Gemini/etc.) live here anymore.
  aiService: {
    baseUrl: process.env.AI_SERVICE_BASE_URL || 'http://localhost:8000',
    apiKey: process.env.AI_SERVICE_API_KEY || null,
    timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 5000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES, 10) || 2,
    retryDelayMs: parseInt(process.env.AI_SERVICE_RETRY_DELAY_MS, 10) || 300,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
