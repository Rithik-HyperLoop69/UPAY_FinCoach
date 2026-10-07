import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Phase 2 Advanced Judge Feedback Features', () => {
  let authToken: string;

  beforeAll(async () => {
    // Authenticate with seeded demo account
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'demo@upay.com',
      password: 'Password123!',
    });
    authToken = loginRes.body.data.tokens.accessToken;
  });

  describe('1. Proactive Financial Coaching Nudges Engine', () => {
    it('should generate prioritized proactive coaching nudges based on user financial state', async () => {
      const res = await request(app)
        .get('/api/coach/nudges')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        const nudge = res.body.data[0];
        expect(nudge).toHaveProperty('id');
        expect(nudge).toHaveProperty('title');
        expect(nudge).toHaveProperty('message');
        expect(nudge).toHaveProperty('priority');
        expect(nudge).toHaveProperty('actionLabel');
        expect(nudge).toHaveProperty('actionRoute');
        expect(nudge).toHaveProperty('confidenceScore');
      }
    });
  });

  describe('2. Zero-Cloud / Air-Gapped Privacy Mode', () => {
    it('should execute coaching in local airgap mode with zero third party data transmission', async () => {
      const res = await request(app)
        .post('/api/coach/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Can I afford to dine out with friends this weekend?',
          privacyMode: 'local_airgap',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBeDefined();
      expect(res.body.data.privacyMetadata).toBeDefined();
      expect(res.body.data.privacyMetadata.mode).toBe('LOCAL_AIRGAP_ENGINE');
      expect(res.body.data.privacyMetadata.thirdPartyBytesSent).toBe(0);
      expect(res.body.data.privacyMetadata.privacyGuarantee).toContain('Zero bytes sent to 3rd party');
    });
  });

  describe('3. Localized Empirical User Survey & 30-Day Pilot Impact Report', () => {
    it('should publicly retrieve empirical survey (N=250) and pilot metrics (N=120) without auth', async () => {
      const res = await request(app).get('/api/analytics/pilot-impact');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.survey.sampleSize).toBe(250);
      expect(data.survey.keyPainPoints.length).toBeGreaterThanOrEqual(4);
      expect(data.pilotStudy.cohortSize).toBe(120);
      expect(data.pilotStudy.prePostComparison.length).toBeGreaterThanOrEqual(4);
      expect(data.pilotStudy.userSavingsImpact.medianMonthlyFeeSavedBDT).toBeGreaterThan(0);
    });
  });

  describe('4. Sandboxed Upay Wallet Gateway Integration', () => {
    let sessionToken: string;
    let trxId: string;
    let signature: string;
    let amount: number;
    let fee: number;

    it('should initiate a sandboxed merchant payment and generate HMAC signature', async () => {
      const res = await request(app)
        .post('/api/payments/upay/sandbox/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1500,
          type: 'MERCHANT_PAY',
          recipientOrMerchant: 'Shwapno Superstore Gulshan',
          clientMobile: '01812345678',
          reference: 'GROCERIES-WEEK-1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const session = res.body.data;
      expect(session.sessionToken).toBeDefined();
      expect(session.trxId).toMatch(/^UPAY/);
      expect(session.signature).toBeDefined();
      expect(session.amount).toBe(1500);

      sessionToken = session.sessionToken;
      trxId = session.trxId;
      signature = session.signature;
      amount = session.amount;
      fee = session.fee;
    });

    it('should execute payment, verify HMAC signature, and synchronize transaction into relational ledger', async () => {
      const res = await request(app)
        .post('/api/payments/upay/sandbox/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionToken,
          trxId,
          amount,
          fee,
          recipientOrMerchant: 'Shwapno Superstore Gulshan',
          type: 'MERCHANT_PAY',
          signature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUCCESS');
      expect(res.body.data.ledgerSynchronized).toBe(true);
    });

    it('should verify payment transaction status by TrxID via public gateway verification route', async () => {
      const res = await request(app).get(`/api/payments/upay/sandbox/verify/${trxId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.found).toBe(true);
      expect(res.body.data.status).toBe('SUCCESS');
      expect(res.body.data.amount).toBe(1500);
    });
  });
});
