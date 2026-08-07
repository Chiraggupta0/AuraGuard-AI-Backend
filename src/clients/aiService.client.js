const axios = require('axios');
const aiServiceConfig = require('../config/aiService');
const logger = require('../config/logger');
const { withRetry } = require('../utils/retry');
const { VIOLATION_TYPES, VIOLATION_SEVERITY } = require('../constants/domain');

// Single HTTP entry point to the AuraGuard-AI-Service (FastAPI). Every AI
// capability — CV/YOLO, Whisper, NSFW/face/violence detection, Gemini/OpenAI
// prompts, OCR — lives in that repo. This client only knows how to reach it;
// it has no model logic and makes no moderation decisions itself.
const http = axios.create({
  baseURL: aiServiceConfig.baseUrl,
  timeout: aiServiceConfig.timeoutMs,
  headers: aiServiceConfig.apiKey ? { Authorization: `Bearer ${aiServiceConfig.apiKey}` } : {},
});

// A 4xx means the request itself was malformed — retrying won't help.
// Only network errors, timeouts, and 5xx are transient and worth retrying.
const isRetryableError = (error) => !error.response || error.response.status >= 500;

// Returned when the AI Service is unreachable after all retries. Fails
// "open" (not flagged) so a single AI Service outage never blocks a live
// meeting — callers can still branch on `degraded` to surface a banner
// ("moderation temporarily unavailable") if desired.
const FALLBACK_RESULT = Object.freeze({
  flagged: false,
  type: null,
  severity: null,
  confidence: 0,
  raw: null,
  degraded: true,
});

const VALID_TYPES = new Set(Object.values(VIOLATION_TYPES));
const VALID_SEVERITIES = new Set(Object.values(VIOLATION_SEVERITY));

// Normalizes the AI Service's response into AuraGuard's internal shape. The
// AI Service owns the actual decision (type/severity/confidence) — this only
// validates and defends against contract drift between the two repos.
const parseAnalysisResponse = (data = {}) => ({
  flagged: Boolean(data.flagged),
  type: VALID_TYPES.has(data.type) ? data.type : VIOLATION_TYPES.OTHER,
  severity: VALID_SEVERITIES.has(data.severity) ? data.severity : VIOLATION_SEVERITY.LOW,
  confidence: typeof data.confidence === 'number' ? data.confidence : 0,
  raw: data.details ?? data,
});

const postToAIService = async (endpoint, payload, label) => {
  try {
    const response = await withRetry(() => http.post(endpoint, payload), {
      retries: aiServiceConfig.maxRetries,
      delayMs: aiServiceConfig.retryDelayMs,
      shouldRetry: isRetryableError,
      onRetry: (error, attempt) =>
        logger.warn(
          `AI Service ${label} retry ${attempt}/${aiServiceConfig.maxRetries}: ${error.message}`
        ),
    });
    return parseAnalysisResponse(response.data);
  } catch (error) {
    logger.error(`AI Service ${label} call failed, falling back to non-flagged: ${error.message}`);
    return FALLBACK_RESULT;
  }
};

// `frameBuffer` is a decoded JPEG/PNG Buffer for a single video frame.
const analyzeFrame = (frameBuffer, meta = {}) =>
  postToAIService(
    aiServiceConfig.endpoints.analyzeFrame,
    { ...meta, image: frameBuffer.toString('base64') },
    'analyzeFrame'
  );

// `audioBuffer` is a raw audio chunk Buffer — the AI Service runs Whisper
// STT internally before moderating, so Node never handles transcription.
const analyzeAudio = (audioBuffer, meta = {}) =>
  postToAIService(
    aiServiceConfig.endpoints.analyzeAudio,
    { ...meta, audio: audioBuffer.toString('base64') },
    'analyzeAudio'
  );

// Plain text (chat messages, or a transcript already produced upstream).
const analyzeText = (text, meta = {}) =>
  postToAIService(aiServiceConfig.endpoints.analyzeText, { ...meta, text }, 'analyzeText');

// Lets callers (e.g. an admin diagnostics endpoint) check connectivity
// without going through the retry/fallback machinery meant for analysis calls.
const checkHealth = async () => {
  try {
    const response = await http.get(aiServiceConfig.endpoints.health);
    return { healthy: response.status === 200, data: response.data };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

module.exports = { analyzeFrame, analyzeAudio, analyzeText, checkHealth };
