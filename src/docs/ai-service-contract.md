# AuraGuard-AI-Service HTTP Contract

This backend never performs AI inference itself. It calls out to the separate
**AuraGuard-AI-Service** repo (FastAPI + Python) through
[`src/clients/aiService.client.js`](../clients/aiService.client.js), configured via
[`src/config/aiService.js`](../config/aiService.js) / `AI_SERVICE_*` env vars.

The AI Service owns: OpenCV processing, YOLO object detection, Whisper
speech-to-text, Gemini/OpenAI prompts, OCR, NSFW/face/violence detection,
image/audio analysis, and the actual moderation decision. Node only forwards
media and stores/broadcasts the result.

## Auth

`Authorization: Bearer <AI_SERVICE_API_KEY>` on every request, if configured.

## `POST /api/v1/analyze/frame`

Request:

```json
{
  "meetingId": "string",
  "userId": "string",
  "image": "base64-encoded JPEG/PNG"
}
```

## `POST /api/v1/analyze/audio`

Request:

```json
{
  "meetingId": "string",
  "userId": "string",
  "audio": "base64-encoded raw audio chunk"
}
```

The AI Service is responsible for running Whisper transcription internally —
Node forwards raw audio bytes, never pre-transcribed text, for this endpoint.

## `POST /api/v1/analyze/text`

Request:

```json
{
  "meetingId": "string",
  "userId": "string",
  "text": "string"
}
```

## Response shape (all three endpoints)

```json
{
  "flagged": true,
  "type": "nudity | violence | hate_speech | harassment | abusive_language | weapon_detected | self_harm | other",
  "severity": "low | medium | high | critical",
  "confidence": 0.87,
  "details": { "...": "provider-specific data, stored as-is in Violation.metadata.raw" }
}
```

`type` and `severity` must match the enums in
[`src/constants/domain.js`](../constants/domain.js) (`VIOLATION_TYPES`,
`VIOLATION_SEVERITY`) — that file is the source of truth both repos should
stay in sync with. Unknown values are coerced to `other` / `low` by
`aiService.client.js` rather than rejected, so a contract drift degrades
gracefully instead of crashing the request.

## `GET /health`

Plain liveness check, no auth required. Used by
`aiServiceClient.checkHealth()` for diagnostics — not called on the hot path.

## Failure handling

If the AI Service times out, is unreachable, or returns 5xx, the client
retries (`AI_SERVICE_MAX_RETRIES`, linear backoff) and then **fails open**:
returns `{ flagged: false, degraded: true }` rather than throwing. A single
AI Service outage never blocks a live meeting; it's logged via Winston for
visibility instead. 4xx responses are not retried (the request itself is
malformed) and also fail open after being logged.
