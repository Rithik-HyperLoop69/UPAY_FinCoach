import crypto from 'crypto';
import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export interface UpayInitiateParams {
  amount: number;
  type: 'MERCHANT_PAY' | 'SEND_MONEY' | 'BILL_PAY' | 'DPS_DEPOSIT';
  recipientOrMerchant: string;
  clientMobile?: string;
  reference?: string;
}

export interface UpaySandboxSession {
  sessionToken: string;
  trxId: string;
  merchantCode: string;
  amount: number;
  fee: number;
  recipientOrMerchant: string;
  signature: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
  expiresAt: string;
}

export class UpaySandboxGateway {
  private merchantCode = 'UPAY_MERCHANT_FINCOACH_SANDBOX';
  private secretKey = 'upay_sec_sandbox_ucb_fincoach_sig_2026';

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
    }

    const payloadToSign = `${this.merchantCode}|${trxId}|${params.amount}|${fee}|BDT`;
    const signature = this.generateHmac(payloadToSign);
    const sessionToken = `upay_sess_${crypto.randomBytes(16).toString('hex')}`;

    return {
      sessionToken,
      trxId,
      merchantCode: this.merchantCode,
      amount: params.amount,
      fee,
      recipientOrMerchant: params.recipientOrMerchant,
      signature,
      status: 'INITIATED',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  public async executeAndSyncLedger(
    userId: string,
    params: {
      sessionToken: string;
      trxId: string;
      amount: number;
      fee: number;
      recipientOrMerchant: string;
      type: string;
      signature: string;
    }
  ) {
    // 1. Verify HMAC Signature
    const expectedPayload = `${this.merchantCode}|${params.trxId}|${params.amount}|${params.fee}|BDT`;
    const expectedSig = this.generateHmac(expectedPayload);

    if (expectedSig !== params.signature) {
      throw new Error('HMAC SHA256 Signature verification failed for upay Sandbox Gateway');
    }

    // 2. Map Category based on payment recipient
    let categoryName = 'Shopping';
    if (params.type === 'BILL_PAY') categoryName = 'Utilities';
    else if (params.type === 'DPS_DEPOSIT') categoryName = 'Savings';
    else if (params.type === 'SEND_MONEY') categoryName = 'Transfer / Cash Out';

    // Locate system category or default
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { contains: categoryName, mode: 'insensitive' } },
          { userId },
        ],
      },
    });

    const defaultCategory = category || (await prisma.category.findFirst({ where: { isSystem: true } }));

    // 3. Persist transaction into user's relational database ledger
    const newTx = await prisma.transaction.create({
      data: {
        userId,
        amount: params.amount,
        type: 'EXPENSE',
        category: defaultCategory?.name || categoryName,
        merchant: params.recipientOrMerchant,
        date: new Date(),
        paymentMethod: 'UPAY_MFS',
        description: `upay Gateway [${params.trxId}] to ${params.recipientOrMerchant}`,
        metadata: JSON.stringify({
          gateway: 'upay_sandbox_gateway_v2',
          trxId: params.trxId,
          fee: params.fee,
          sessionToken: params.sessionToken,
          verifiedSignature: params.signature,
          settlementBank: 'United Commercial Bank (UCB)',
        }),
      },
    });

    // 4. Trigger alert for ledger sync
    await prisma.alert.create({
      data: {
        userId,
        type: 'PAYMENT_CONFIRMED',
        severity: 'INFO',
        title: 'upay Payment Gateway Settlement',
        message: `৳${params.amount.toLocaleString()} successfully paid to ${params.recipientOrMerchant} (TrxID: ${params.trxId}). Fee: ৳${params.fee}.`,
        metadata: JSON.stringify({ trxId: params.trxId, transactionId: newTx.id }),
      },
    });

    return {
      status: 'SUCCESS',
      transactionId: newTx.id,
      trxId: params.trxId,
      amount: params.amount,
      fee: params.fee,
      recipientOrMerchant: params.recipientOrMerchant,
      settlementTime: new Date().toISOString(),
      ledgerSynchronized: true,
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
