import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Financial Data Layer Integration Tests', () => {
  let token = '';
  let createdTransactionId = '';
  let createdGoalId = '';

  beforeAll(async () => {
    // Login as demo user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  it('should retrieve paginated transactions with meta', async () => {
    const res = await request(app)
      .get('/api/transactions?limit=10&page=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions).toBeInstanceOf(Array);
    expect(res.body.data.transactions.length).toBeGreaterThan(0);
    expect(res.body.data.pagination.total).toBeGreaterThan(0);
  });

  it('should create a new transaction with simulated upay metadata', async () => {
    const newTx = {
      type: 'EXPENSE',
      amount: 1250,
      category: 'Dining Out & Cafes',
      description: 'Business Lunch at Gulshan Cafe',
      date: new Date().toISOString(),
      merchant: 'Gulshan Artisan Bistro',
      paymentMethod: 'upay',
    };

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(newTx);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(1250);
    expect(res.body.data.metadata).toContain('UPAY');
    createdTransactionId = res.body.data.id;
  });

  it('should update the created transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1350 });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(1350);
  });

  it('should delete the transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should retrieve categories for user', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(5);
  });

  it('should retrieve monthly budget with computed actual spent amounts', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const res = await request(app)
      .get(`/api/budgets?month=${currentMonth}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data) {
      expect(res.body.data.totalLimit).toBeGreaterThan(0);
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.items[0]).toHaveProperty('percentageUsed');
    }
  });

  it('should create and deposit funds into a savings goal', async () => {
    const newGoal = {
      name: 'Automated Test Savings Reserve',
      targetAmount: 25000,
      currentAmount: 5000,
      category: 'Emergency',
    };

    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send(newGoal);

    expect(res.status).toBe(201);
    createdGoalId = res.body.data.id;

    // Deposit ৳2,500
    const depositRes = await request(app)
      .post(`/api/goals/${createdGoalId}/deposit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 2500 });

    expect(depositRes.status).toBe(200);
    expect(depositRes.body.data.currentAmount).toBe(7500);

    // Clean up
    await request(app)
      .delete(`/api/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${token}`);
  });
});
