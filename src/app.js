const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const notFoundHandler = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');
const ApiResponse = require('./utils/ApiResponse');
const HTTP_STATUS = require('./constants/httpStatusCodes');
const v1Routes = require('./routes/v1');

const app = express();

// Behind a reverse proxy (nginx, load balancer) in production — needed for
// correct req.ip / rate limiting and secure cookies.
app.set('trust proxy', 1);

// ---- Security & parsing middleware ----
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(requestLogger);
app.use(apiLimiter);

// ---- Health check (unversioned, for load balancers / uptime monitors) ----
app.get('/health', (_req, res) => {
  new ApiResponse(HTTP_STATUS.OK, 'Service is healthy', {
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  }).send(res);
});

// ---- API docs ----
app.use(`/api/${env.apiVersion}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Versioned API routes ----
app.use(`/api/${env.apiVersion}`, v1Routes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
