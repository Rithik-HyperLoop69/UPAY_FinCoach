import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('AI Financial Coach Integration Tests', () => {
  let token = '';
  let conversationId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should generate structured context preview without exposing raw database queries', async () => {
    const res = await request(app)
      .get('/api/coach/context-preview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const ctx = res.body.data;
    expect(ctx.monthlyIncome).toBeGreaterThan(0);
    expect(ctx.monthlyExpenses).toBeGreaterThan(0);
    expect(ctx.savingsRate).toBeDefined();
    expect(ctx.financialHealthScore).toBeDefined();
    expect(ctx.topSpendingCategories).toBeInstanceOf(Array);
    expect(ctx.forecast).toBeDefined();
    expect(ctx.goals).toBeInstanceOf(Array);
  });

  it('should interact with AI coach and receive structured response adhering to Observed/Forecast/Suggestion', async () => {
    const res = await request(app)
      .post('/api/coach/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Where am I spending the most this month?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const coachRes = res.body.data;
    expect(coachRes.message).toBeDefined();
    expect(coachRes.observed).toBeDefined();
    expect(coachRes.forecast).toBeDefined();
    expect(coachRes.suggestion).toBeDefined();
    expect(coachRes.provider).toBeDefined();
    expect(coachRes.conversationId).toBeDefined();
    conversationId = coachRes.conversationId;
  });

  it('should continue an existing conversation maintaining session continuity', async () => {
    const res = await request(app)
      .post('/api/coach/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Can I safely save more next month?',
        conversationId,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.conversationId).toBe(conversationId);
  });

  it('should retrieve conversation history and messages', async () => {
    const res = await request(app)
      .get(`/api/coach/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.messages.length).toBeGreaterThanOrEqual(2);
  });
});
