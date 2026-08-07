const MonitoringSession = require('./aiMonitoring.model');
const aiServiceClient = require('../../clients/aiService.client');
const violationService = require('../violations/violation.service');
const socketService = require('../../services/socket.service');
const logger = require('../../config/logger');

// Orchestrates AI-assisted monitoring for a meeting: tracks per-participant
// session state in Mongo, forwards media to the AuraGuard-AI-Service via
// aiServiceClient, and turns a flagged result into a stored Violation +
// realtime warning. It owns none of the actual detection logic — that's the
// AI Service's job — only the Node-side bookkeeping and side effects.

const startSession = async (meetingId, userId) =>
  MonitoringSession.findOneAndUpdate(
    { meeting: meetingId, user: userId },
    { $setOnInsert: { startedAt: new Date() }, $set: { isActive: true, endedAt: null } },
    { new: true, upsert: true }
  );

const endSession = async (meetingId, userId) =>
  MonitoringSession.findOneAndUpdate(
    { meeting: meetingId, user: userId },
    { isActive: false, endedAt: new Date() },
    { new: true }
  );

// Sends a single video frame to the AI Service. If flagged, records a
// violation and pushes a realtime warning to the meeting room.
const analyzeFrame = async (meetingId, userId, frameBuffer) => {
  const result = await aiServiceClient.analyzeFrame(frameBuffer, { meetingId, userId });
  await MonitoringSession.updateOne(
    { meeting: meetingId, user: userId },
    { $inc: { framesAnalyzed: 1 }, $set: { lastAnalyzedAt: new Date() } }
  );

  if (result.flagged) {
    await handleFlaggedContent(meetingId, userId, 'video', result);
  }

  return result;
};

// Sends a raw audio chunk to the AI Service — Whisper transcription and
// abusive-speech detection both happen there, not in Node.
const analyzeAudio = async (meetingId, userId, audioBuffer) => {
  const result = await aiServiceClient.analyzeAudio(audioBuffer, { meetingId, userId });
  await MonitoringSession.updateOne(
    { meeting: meetingId, user: userId },
    { $inc: { audioChunksAnalyzed: 1 }, $set: { lastAnalyzedAt: new Date() } }
  );

  if (result.flagged) {
    await handleFlaggedContent(meetingId, userId, 'audio', result);
  }

  return result;
};

// Sends live chat/text content to the AI Service for moderation.
const analyzeText = async (meetingId, userId, text) => {
  const result = await aiServiceClient.analyzeText(text, { meetingId, userId });

  if (result.flagged) {
    await handleFlaggedContent(meetingId, userId, 'text', result);
  }

  return result;
};

const handleFlaggedContent = async (meetingId, userId, source, result) => {
  logger.warn(`Flagged ${source} content in meeting ${meetingId} from user ${userId}`);

  await MonitoringSession.updateOne(
    { meeting: meetingId, user: userId },
    { $inc: { violationsFlagged: 1 } }
  );

  const violation = await violationService.recordViolation({
    meeting: meetingId,
    user: userId,
    type: result.type,
    severity: result.severity,
    source,
    confidence: result.confidence,
    metadata: { raw: result.raw },
  });

  socketService.emitModerationWarning(meetingId, {
    userId,
    violationId: violation._id,
    severity: result.severity,
    message: 'Your recent activity may violate community guidelines.',
  });

  return violation;
};

module.exports = { startSession, endSession, analyzeFrame, analyzeAudio, analyzeText };
