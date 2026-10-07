import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { mfsEngine } from '../src/modules/transactions/mfs/mfsEngine';
import { normalizeBanglaSms } from '../src/modules/transactions/mfs/banglaNumeralNormalizer';

describe('Multi-Provider MFS & Bengali Intelligence Engine Tests', () => {
  let token = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@upay.com', password: 'Password123!' });
    token = res.body.data.tokens.accessToken;
  });

  describe('Bangla Numeral & Linguistic Normalization', () => {
    it('should accurately convert Bengali numerals (০-৯) to Arabic numerals', () => {
      const bnSms = 'আপনার অ্যাকাউন্টে ১৫০০ টাকা ক্যাশ ইন সফল হয়েছে। ব্যালেন্স ৪২৫০ টাকা।';
      const result = normalizeBanglaSms(bnSms);

      expect(result.hadBanglaNumerals).toBe(true);
      expect(result.detectedLanguage).toBe('bn');
      expect(result.normalizedText).toContain('1500');
      expect(result.normalizedText).toContain('4250');
      expect(result.normalizedText).toContain('received');
      expect(result.normalizedText).toContain('Balance');
    });

    it('should detect Banglish colloquial language', () => {
      const banglishSms = 'Apnar account theke taka 500 kete neya hoyeche Shwapno te payment er jonno.';
      const result = normalizeBanglaSms(banglishSms);

      expect(result.detectedLanguage).toBe('banglish');
      expect(result.normalizedText).toContain('500');
    });
  });

  describe('Multi-Provider MFS SMS Parsing', () => {
    it('should parse official upay SMS with fee and balance', () => {
      const sms = 'Payment of Tk 1,250 to Shwapno successful. Fee Tk 0.00. Balance Tk 8,750.00. TrxID UPAY9872134';
      const parsed = mfsEngine.parseSms(sms);

      expect(parsed.provider).toBe('upay');
      expect(parsed.type).toBe('EXPENSE');
      expect(parsed.amount).toBe(1250);
      expect(parsed.fee).toBe(0);
      expect(parsed.balanceAfter).toBe(8750);
      expect(parsed.trxId).toBe('UPAY9872134');
      expect(parsed.category).toBe('Food & Groceries');
      expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should parse bKash merchant payment SMS with automated category inference', () => {
      const sms = 'Payment Tk 2,400.00 to Aarong successful. Fee Tk 0.00. Balance Tk 14,200.00. TrxID 9K43JD21 at 05/10/2026';
      const parsed = mfsEngine.parseSms(sms);

      expect(parsed.provider).toBe('bkash');
      expect(parsed.type).toBe('EXPENSE');
      expect(parsed.amount).toBe(2400);
      expect(parsed.category).toBe('Shopping & Lifestyle');
      expect(parsed.trxId).toBe('9K43JD21');
      expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should parse bKash received money / Cash In SMS as INCOME', () => {
      const sms = 'You have received Tk 5,000.00 from 01711223344. Fee Tk 0.00. Balance Tk 19,200.00. TrxID 8N34KD89';
      const parsed = mfsEngine.parseSms(sms);

      expect(parsed.provider).toBe('bkash');
      expect(parsed.type).toBe('INCOME');
      expect(parsed.amount).toBe(5000);
      expect(parsed.trxId).toBe('8N34KD89');
    });

    it('should parse Nagad utility bill payment SMS', () => {
      const sms = 'Bill Payment Tk 1,850.00 to DESCO is successful. TxnID: 5432167C. Balance: Tk 6,450.00';
      const parsed = mfsEngine.parseSms(sms);

      expect(parsed.provider).toBe('nagad');
      expect(parsed.type).toBe('EXPENSE');
      expect(parsed.amount).toBe(1850);
      expect(parsed.category).toBe('Bills & Utilities');
      expect(parsed.trxId).toBe('5432167C');
      expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should parse Bengali script SMS after numeral normalization', () => {
      const bnSms = 'DESCO এর বিল পরিশোধ ৩,২০০ টাকা সফল হয়েছে। ফি ০ টাকা। ব্যালেন্স ৫,১০০ টাকা। ট্রানজেকশন আইডি DESCO9911';
      const parsed = mfsEngine.parseSms(bnSms);

      expect(parsed.amount).toBe(3200);
      expect(parsed.fee).toBe(0);
      expect(parsed.balanceAfter).toBe(5100);
      expect(parsed.category).toBe('Bills & Utilities');
      expect(parsed.hadBanglaNumerals).toBe(true);
    });
  });

  describe('API Endpoint Integration (/api/transactions/mfs/parse-sms)', () => {
    it('should parse SMS and return rich metadata via HTTP', async () => {
      const res = await request(app)
        .post('/api/transactions/mfs/parse-sms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          smsText: 'Payment of Tk 750 to Chaldal successful. Fee Tk 0. Balance Tk 4,250. TrxID UPAY_TEST_998',
          autoSave: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.parsed.amount).toBe(750);
      expect(res.body.data.parsed.category).toBe('Food & Groceries');
      expect(res.body.data.parsed.confidence).toBeGreaterThan(0.7);
    });
  });
});
