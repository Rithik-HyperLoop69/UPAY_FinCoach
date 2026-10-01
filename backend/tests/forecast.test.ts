import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Cash-Flow Forecasting Engine Integration Tests', () => {
  let token = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should generate complete cash flow forecast with multi-horizon points', async () => {
    const res = await request(app)
      .get('/api/forecast')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const forecast = res.body.data;
    expect(forecast.confidenceScore).toBeGreaterThanOrEqual(50);
    expect(forecast.dataMonthsCount).toBeGreaterThan(0);
    expect(forecast.expectedMonthlyIncome).toBeGreaterThan(0);
    expect(forecast.expectedMonthlyExpense).toBeGreaterThan(0);

    // 7-Day Horizon
    expect(forecast.sevenDays.points.length).toBe(7);
    expect(forecast.sevenDays.endingBalance).toBeDefined();

    // 30-Day Horizon
    expect(forecast.thirtyDays.points.length).toBe(30);
    expect(forecast.thirtyDays.endingBalance).toBeDefined();

    // 90-Day Horizon
    expect(forecast.ninetyDays.points.length).toBeGreaterThan(0);

    // Detected Recurring Obligations
    expect(forecast.recurringObligations).toBeInstanceOf(Array);
    expect(forecast.recurringObligations.length).toBeGreaterThan(0);
    const rentOrBill = forecast.recurringObligations.find(
      (o: any) => o.category === 'Rent & Housing' || o.category === 'Internet & Mobile' || o.category === 'Bills & Utilities'
    );
    expect(rentOrBill).toBeDefined();

    // Assumptions
    expect(forecast.assumptions.length).toBeGreaterThan(0);
  });

  it('should retrieve detected cash-flow risks', async () => {
    const res = await request(app)
      .get('/api/forecast/risks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.risks).toBeInstanceOf(Array);
    expect(res.body.data.recurringObligations).toBeInstanceOf(Array);
  });
});
