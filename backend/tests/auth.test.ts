import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Auth Module Integration Tests', () => {
  const testUser = {
    email: `test-${Date.now()}@upay.com`,
    password: 'Password123!',
    fullName: 'Test Automation User',
    monthlyIncome: 50000,
  };

  let accessToken = '';

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined(); // ensure password hash not leaked
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should login with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@upay.com');
    expect(res.body.data.tokens.accessToken).toBeDefined();
    accessToken = res.body.data.tokens.accessToken;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'WrongPassword999' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should fail accessing /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should access /api/auth/me with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('demo@upay.com');
    expect(res.body.data.profile).toBeDefined();
  });
});
