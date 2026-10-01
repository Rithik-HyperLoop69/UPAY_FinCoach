import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Alerts & Notifications Integration Tests', () => {
  let token = '';
  let alertId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should retrieve list of financial alerts for user', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    alertId = res.body.data[0].id;
  });

  it('should create an automated alert', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'BUDGET_WARNING',
        title: 'Dining Budget Warning',
        message: 'Dining expenses reached 85% of monthly threshold.',
        severity: 'WARNING',
        actionUrl: '/budgets',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Dining Budget Warning');
  });

  it('should mark a specific alert as read', async () => {
    const res = await request(app)
      .put(`/api/alerts/${alertId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);
  });

  it('should mark all alerts as read', async () => {
    const res = await request(app)
      .put('/api/alerts/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
