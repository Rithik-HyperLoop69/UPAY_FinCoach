import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { aiUsageManager } from '../src/modules/ai-coach/aiUsageManager';

describe('AI/ML System Evaluation & Telemetry Integration Tests', () => {
  let token = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should retrieve comprehensive Model Cards registry with backtested metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/model-card')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);

    const forecasterCard = res.body.data.find((m: any) => m.modelId === 'fincoach-forecaster-v1');
    expect(forecasterCard).toBeDefined();
    expect(forecasterCard.metrics['Mean Absolute Percentage Error (MAPE)']).toBeDefined();
    expect(forecasterCard.metrics['Mean Absolute Error (MAE)']).toBeDefined();

    const anomalyCard = res.body.data.find((m: any) => m.modelId === 'fincoach-anomaly-v1');
    expect(anomalyCard).toBeDefined();
    expect(anomalyCard.metrics['F1 Score']).toBeDefined();
  });

  it('should retrieve System Evaluation Report with aggregate metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/evaluation')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.aggregateSummary).toBeDefined();
    expect(res.body.data.aggregateSummary.totalProprietaryEngines).toBeGreaterThanOrEqual(4);
    expect(res.body.data.aggregateSummary.forecastMape).toBeDefined();
    expect(res.body.data.aggregateSummary.anomalyF1Score).toBeDefined();
  });

  it('should retrieve AI Coach Usage and Telemetry metrics', async () => {
    const res = await request(app)
      .get('/api/coach/usage')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activeModel).toBeDefined();
    expect(res.body.data.totalRequests).toBeDefined();
  });

  it('should verify prompt caching in AIUsageManager', () => {
    const sampleResponse = {
      message: 'Test message',
      observed: 'Observed fact',
      forecast: 'Forecast point',
      suggestion: 'Save 20%',
      provider: 'gemini' as const,
    };

    aiUsageManager.setCache('user-123', 'how much spent', 'ctx-hash-1', sampleResponse);
    const cached = aiUsageManager.getCached('user-123', 'how much spent', 'ctx-hash-1');

    expect(cached).toBeDefined();
    expect(cached?.provider).toBe('cached');
    expect(cached?.observed).toBe('Observed fact');
  });
});
