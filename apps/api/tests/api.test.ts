import request from 'supertest';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/ims';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-should-be-long-1234567890';

import app from '../src/app';

describe('Health endpoints', () => {
  it('returns ok for /api/healthz', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.headers['x-request-id']).toBeDefined();
  });
});
