const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/v1/auth/register', () => {
  const validUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects an invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
