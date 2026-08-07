const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('returns 200 and service status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('db');
  });
});

describe('GET /api/v1/unknown-route', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
