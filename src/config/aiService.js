const env = require('./env');

// Purely declarative connection settings for the external AuraGuard-AI-Service
// (FastAPI repo). Kept separate from src/clients/aiService.client.js so
// "what to connect to" (config) stays independent of "how to connect"
// (client behavior — axios instance, retries, parsing).
module.exports = {
  baseUrl: env.aiService.baseUrl,
  apiKey: env.aiService.apiKey,
  timeoutMs: env.aiService.timeoutMs,
  maxRetries: env.aiService.maxRetries,
  retryDelayMs: env.aiService.retryDelayMs,

  endpoints: {
    analyzeFrame: '/api/v1/analyze/frame',
    analyzeAudio: '/api/v1/analyze/audio',
    analyzeText: '/api/v1/analyze/text',
    health: '/health',
  },
};
