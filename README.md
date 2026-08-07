# AuraGuard AI — Backend

Privacy and safety layer for video conferencing platforms: authentication, meeting
lifecycle, realtime delivery, and moderation orchestration. This service does **not**
run any AI inference itself — it's a client of the separate
[AuraGuard-AI-Service](../AuraGuard-AI-Service) (FastAPI + Python) repo, which owns all
computer vision, speech-to-text, and LLM-based detection. This backend forwards media to
that service, stores the AI-produced results, and pushes realtime updates over Socket.IO.

## Tech Stack

Node.js, Express.js, MongoDB + Mongoose, Socket.IO, JWT, bcrypt, Multer, Cloudinary,
Nodemailer, Winston, Zod, Helmet, CORS, express-rate-limit, Axios (AI Service client).

## Architecture

Modular, feature-based ("module per domain") structure under `src/modules`. Each module
keeps its own routes, controller, service, model, repository, and validator so multiple
developers can work on separate modules without stepping on each other.

```
src/
├── config/          # env, db, cloudinary, socket, logger, swagger, AI Service settings
├── constants/        # roles, http status codes, messages, socket events, domain enums
├── middlewares/       # auth, rbac, error handler, validation, rate limit, upload
├── utils/            # ApiError, ApiResponse, catchAsync, token helpers, pagination, retry
├── helpers/           # email, cloudinary, date helpers
├── services/          # cross-cutting services (email, socket) — no AI logic
├── clients/           # aiService.client.js — the ONLY thing that talks to the AI Service
├── modules/           # feature modules (auth, users, meetings, violations, ...)
├── sockets/           # Socket.IO namespace + event handlers (AI-implementation-agnostic)
├── routes/v1/         # API v1 route aggregator
├── jobs/              # scheduled/cron jobs
├── docs/              # OpenAPI/Swagger definitions + ai-service-contract.md
├── app.js             # Express app (middleware pipeline, routes)
└── server.js          # HTTP + Socket.IO bootstrap, graceful shutdown
```

### AI Service integration

`src/clients/aiService.client.js` is the single boundary between this backend and
AuraGuard-AI-Service. It:

- Sends video frames / audio chunks / text to the AI Service over HTTP (Axios).
- Retries transient failures (network errors, timeouts, 5xx) with linear backoff via
  `src/utils/retry.js`; does not retry 4xx (malformed request).
- Normalizes every response into AuraGuard's internal `{ flagged, type, severity,
  confidence, raw }` shape.
- **Fails open** if the AI Service is unreachable after retries — returns a non-flagged,
  `degraded: true` result instead of throwing, so an AI Service outage never blocks a
  live meeting.

See [`src/docs/ai-service-contract.md`](./src/docs/ai-service-contract.md) for the full
request/response contract both repos need to stay in sync on.

## Modules

Authentication, Users, Meetings, AI Monitoring, Violations, Moderation, Reports,
Notifications, Dashboard, Admin, Settings, Audit Logs.

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

API base URL: `http://localhost:5000/api/v1`
Health check: `http://localhost:5000/health`
Swagger docs: `http://localhost:5000/api/v1/docs`

## Scripts

| Command                | Description                        |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start with nodemon (auto-reload)    |
| `npm start`              | Start in production mode            |
| `npm test`               | Run Jest test suite                 |
| `npm run lint`           | Lint the codebase                   |
| `npm run format`         | Format with Prettier                |

## Docker

```bash
docker compose up --build
```

## License

UNLICENSED — private project.
