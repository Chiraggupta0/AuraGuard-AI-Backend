# API Documentation

OpenAPI/Swagger is generated from JSDoc `@openapi` annotations placed directly
above each route definition in `src/modules/*/*.routes.js` (see `src/config/swagger.js`
for the `swagger-jsdoc` configuration).

Served at `GET /api/v1/docs` when the app is running (see `src/app.js`).

Drop any hand-written `.yaml` fragments in this folder — they're picked up
automatically via the `apis` glob in `src/config/swagger.js`.

See [`ai-service-contract.md`](./ai-service-contract.md) for the HTTP contract
this backend expects from the separate AuraGuard-AI-Service (FastAPI) repo.
