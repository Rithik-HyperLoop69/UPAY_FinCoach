export interface PaymentTransactionResult {
  transactionId: string;
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  fee: number;
  recipientOrMerchant: string;
  reference?: string;
  timestamp: string;
}

export interface PaymentProvider {
  name: string;
  executePayment(params: {
    walletNumber: string;
    amount: number;
    type: 'SEND_MONEY' | 'MERCHANT_PAY' | 'BILL_PAY' | 'MOBILE_RECHARGE' | 'DPS_DEPOSIT';
    recipientOrMerchant: string;
    reference?: string;
  }): Promise<PaymentTransactionResult>;
}

export class UpayPaymentAdapter implements PaymentProvider {
  name = 'upay';

  async executePayment(params: {
    walletNumber: string;
    amount: number;
    type: 'SEND_MONEY' | 'MERCHANT_PAY' | 'BILL_PAY' | 'MOBILE_RECHARGE' | 'DPS_DEPOSIT';
    recipientOrMerchant: string;
    reference?: string;
  }): Promise<PaymentTransactionResult> {
    // Simulated upay transaction execution
    // In production, this invokes official UCB / upay MFS API endpoints with HMAC/MTLS credentials
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const trxId = `UPAY${Date.now().toString().slice(-4)}${randomSuffix}`;

    let fee = 0;
    if (params.type === 'SEND_MONEY') {
      fee = params.amount > 1000 ? 5.0 : 0.0;
    }

    return {
      transactionId: trxId,
      provider: 'upay (United Commercial Bank MFS)',
      status: 'SUCCESS',
      amount: params.amount,
      fee,
      recipientOrMerchant: params.recipientOrMerchant,
      reference: params.reference || `REF-${randomSuffix.toString().slice(0, 4)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export class MockPaymentProvider implements PaymentProvider {
  name = 'MockProvider';

  async executePayment(params: any): Promise<PaymentTransactionResult> {
    return {
      transactionId: `MOCK-${Date.now()}`,
      provider: 'Mock Payment Service',
      status: 'SUCCESS',
      amount: params.amount,
      fee: 0,
      recipientOrMerchant: params.recipientOrMerchant,
      timestamp: new Date().toISOString(),
    };
  }
}
