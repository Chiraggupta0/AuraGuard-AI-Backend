# ---- Base ----
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci --omit=dev

# ---- Release ----
FROM node:18-alpine AS release
ENV NODE_ENV=production
WORKDIR /usr/src/app

RUN addgroup -S nodejs && adduser -S auraguard -G nodejs

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER auraguard

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
