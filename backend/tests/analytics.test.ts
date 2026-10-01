import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Financial Analytics Engine Integration Tests', () => {
  let token = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should calculate accurate financial summary KPIs', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const summary = res.body.data;
    expect(summary.totalIncome).toBeGreaterThan(0);
    expect(summary.totalExpenses).toBeGreaterThan(0);
    expect(summary.savingsRate).toBeDefined();
    expect(summary.currency).toBe('BDT');
    expect(summary.averageDailySpending).toBeGreaterThan(0);
  });

  it('should calculate category spending breakdown with percentages', async () => {
    const res = await request(app)
      .get('/api/analytics/spending-breakdown')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);

    const first = res.body.data[0];
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('amount');
    expect(first).toHaveProperty('percentage');
    expect(first).toHaveProperty('transactionCount');
  });

  it('should generate monthly income vs expense trends', async () => {
    const res = await request(app)
      .get('/api/analytics/trends')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(1);
    expect(res.body.data[0]).toHaveProperty('month');
    expect(res.body.data[0]).toHaveProperty('income');
    expect(res.body.data[0]).toHaveProperty('expense');
  });

  it('should evaluate transparent 0-100 Financial Health Score with factor breakdown', async () => {
    const res = await request(app)
      .get('/api/analytics/health-score')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const health = res.body.data;
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(['Excellent', 'Strong', 'Moderate', 'Needs Attention']).toContain(health.tier);
    expect(health.factors.savingsBehavior.max).toBe(25);
    expect(health.factors.budgetAdherence.max).toBe(25);
    expect(health.factors.cashFlowStability.max).toBe(25);
    expect(health.factors.goalProgress.max).toBe(25);
    expect(health.disclaimer).toBeDefined();
  });
});
