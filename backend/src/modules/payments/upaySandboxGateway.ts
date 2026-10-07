import crypto from 'crypto';
import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export interface UpayInitiateParams {
  amount: number;
  type: 'MERCHANT_PAY' | 'SEND_MONEY' | 'BILL_PAY' | 'DPS_DEPOSIT' | 'CASH_OUT';
  recipientOrMerchant: string;
  clientMobile?: string;
  reference?: string;
}

export interface UpaySandboxSession {
  paymentId: string;
  sessionToken: string;
  gatewayUrl: string;
  trxId: string;
  merchantCode: string;
  amount: number;
  fee: number;
  recipientOrMerchant: string;
  type: string;
  reference: string;
  signature: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
  expiresAt: string;
}

export class UpaySandboxGateway {
  private merchantCode = 'UPAY_MERCHANT_FINCOACH_SANDBOX';
  private secretKey = 'upay_sec_sandbox_ucb_fincoach_sig_2026';
  private sessions = new Map<string, UpaySandboxSession>();

  private generateHmac(payload: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
  }

  public initiatePayment(params: UpayInitiateParams): UpaySandboxSession {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const trxId = `UPAY${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Calculate official upay fee schedule (Send money: ৳5 for > 1000 BDT, Merchant Pay: 0%, Cash Out: 1.40%)
    let fee = 0;
    if (params.type === 'SEND_MONEY' && params.amount > 1000) {
      fee = 5.0;
    } else if (params.type === 'CASH_OUT') {
      fee = Number((params.amount * 0.014).toFixed(2));
    }

    const payloadToSign = `${this.merchantCode}|${trxId}|${params.amount}|${fee}|BDT`;
    const signature = this.generateHmac(payloadToSign);
    const sessionToken = `upay_sess_${crypto.randomBytes(16).toString('hex')}`;
    const paymentId = `UPAY-SBX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const session: UpaySandboxSession = {
      paymentId,
      sessionToken,
      gatewayUrl: `https://sandbox.upay.com.bd/checkout/${paymentId}`,
      trxId,
      merchantCode: this.merchantCode,
      amount: params.amount,
      fee,
      recipientOrMerchant: params.recipientOrMerchant,
      type: params.type,
      reference: params.reference || 'upay payment',
      signature,
      status: 'INITIATED',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    // Index session
    this.sessions.set(sessionToken, session);
    this.sessions.set(paymentId, session);
    this.sessions.set(trxId, session);

    return session;
  }

  public async getBalance(userId: string) {
    const baseBalance = 25450;
    // Calculate total spend on upay in ledger
    const totalSpent = await prisma.transaction.aggregate({
      where: {
        userId,
        paymentMethod: 'UPAY_MFS',
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    const currentBalance = Math.max(0, baseBalance - (totalSpent._sum.amount || 0));

    return {
      account: '01812345678',
      currentBalance,
      currency: 'BDT',
      status: 'ACTIVE_SANDBOX',
      apiEnvironment: 'UPAY_OPEN_API_SANDBOX_V2',
    };
  }

  public async getTransactions(userId: string) {
    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        paymentMethod: 'UPAY_MFS',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return txs.map((t) => {
      let meta: any = {};
      try {
        meta = t.metadata ? JSON.parse(t.metadata) : {};
      } catch {}

      return {
        id: t.id,
        paymentId: meta.paymentId || meta.sessionToken || t.id,
        transactionId: meta.trxId || t.id,
        amount: t.amount,
        fee: meta.fee || 0,
        recipient: t.merchant || 'Merchant',
        purpose: t.description || 'upay payment',
        status: 'COMPLETED',
        createdAt: t.createdAt.toISOString(),
      };
    });
  }

  public async executeAndSyncLedger(
    userId: string,
    params: {
      sessionToken?: string;
      paymentId?: string;
      trxId?: string;
      amount?: number;
      fee?: number;
      recipientOrMerchant?: string;
      type?: string;
      signature?: string;
      otp?: string;
    }
  ) {
    // 1. Resolve session from token/paymentId/trxId if exists
    const sessionKey = params.sessionToken || params.paymentId || params.trxId || '';
    const cachedSession = this.sessions.get(sessionKey);

    const amount = params.amount ?? cachedSession?.amount;
    const fee = params.fee ?? cachedSession?.fee ?? 0;
    const trxId = params.trxId ?? cachedSession?.trxId ?? `UPAY${Date.now().toString().slice(-4)}${Math.floor(10000000 + Math.random() * 90000000)}`;
    const recipientOrMerchant = params.recipientOrMerchant ?? cachedSession?.recipientOrMerchant ?? 'upay Merchant';
    const type = params.type ?? cachedSession?.type ?? 'MERCHANT_PAY';
    const signature = params.signature ?? cachedSession?.signature ?? this.generateHmac(`${this.merchantCode}|${trxId}|${amount}|${fee}|BDT`);
    const sessionToken = params.sessionToken ?? cachedSession?.sessionToken ?? `upay_sess_${Date.now()}`;

    if (!amount || amount <= 0) {
      throw new Error('Invalid transaction amount for upay sandbox execution');
    }

    // 2. Verify HMAC Signature
    const expectedPayload = `${this.merchantCode}|${trxId}|${amount}|${fee}|BDT`;
    const expectedSig = this.generateHmac(expectedPayload);

    if (expectedSig !== signature) {
      throw new Error('HMAC SHA256 Signature verification failed for upay Sandbox Gateway');
    }

    // 3. Map Category based on payment recipient
    let categoryName = 'Shopping';
    if (type === 'BILL_PAY') categoryName = 'Utilities';
    else if (type === 'DPS_DEPOSIT') categoryName = 'Savings';
    else if (type === 'SEND_MONEY' || type === 'CASH_OUT') categoryName = 'Transfer / Cash Out';

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { contains: categoryName, mode: 'insensitive' } },
          { userId },
        ],
      },
    });

    const defaultCategory = category || (await prisma.category.findFirst({ where: { isSystem: true } }));

    // 4. Persist transaction into user's relational database ledger
    const newTx = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'EXPENSE',
        category: defaultCategory?.name || categoryName,
        merchant: recipientOrMerchant,
        date: new Date(),
        paymentMethod: 'UPAY_MFS',
        description: `upay Gateway [${trxId}] to ${recipientOrMerchant}`,
        metadata: JSON.stringify({
          gateway: 'upay_sandbox_gateway_v2',
          trxId,
          fee,
          sessionToken,
          verifiedSignature: signature,
          settlementBank: 'United Commercial Bank (UCB)',
        }),
      },
    });

    // 5. Trigger alert for ledger sync
    await prisma.alert.create({
      data: {
        userId,
        type: 'PAYMENT_CONFIRMED',
        severity: 'INFO',
        title: 'upay Payment Gateway Settlement',
        message: `৳${amount.toLocaleString()} successfully paid to ${recipientOrMerchant} (TrxID: ${trxId}). Fee: ৳${fee}.`,
        metadata: JSON.stringify({ trxId, transactionId: newTx.id }),
      },
    });

    // Mark session as SUCCESS
    if (cachedSession) {
      cachedSession.status = 'SUCCESS';
    }

    const balanceData = await this.getBalance(userId);

    return {
      status: 'SUCCESS',
      transactionId: newTx.id,
      trxId,
      amount,
      fee,
      newBalance: balanceData.currentBalance,
      recipientOrMerchant,
      settlementTime: new Date().toISOString(),
      ledgerSynchronized: true,
      syncStatus: 'RECORDED_IN_LEDGER',
    };
  }

  public async verifyTrx(trxId: string) {
    const tx = await prisma.transaction.findFirst({
      where: {
        description: { contains: trxId },
      },
    });

    if (!tx) {
      return {
        found: false,
        trxId,
        status: 'NOT_FOUND_IN_LEDGER',
      };
    }

    return {
      found: true,
      trxId,
      status: 'SUCCESS',
      amount: tx.amount,
      date: tx.date,
      merchant: tx.merchant,
      metadata: tx.metadata,
    };
  }
}

export const upaySandboxGateway = new UpaySandboxGateway();
