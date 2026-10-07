import { mfsEngine } from './mfs/mfsEngine';

export interface ParsedUpayTransaction {
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  fee: number;
  balanceAfter?: number;
  merchant: string;
  category: string;
  description: string;
  trxId: string;
  paymentMethod: 'upay';
  rawSms: string;
  confidence?: number;
  detectedLanguage?: string;
}

export function parseUpaySms(sms: string): ParsedUpayTransaction {
  const parsed = mfsEngine.parseSms(sms, 'upay');

  return {
    type: parsed.type,
    amount: parsed.amount,
    fee: parsed.fee,
    balanceAfter: parsed.balanceAfter,
    merchant: parsed.counterparty,
    category: parsed.category,
    description: parsed.description,
    trxId: parsed.trxId,
    paymentMethod: 'upay',
    rawSms: parsed.rawSms,
    confidence: parsed.confidence,
    detectedLanguage: parsed.detectedLanguage,
  };
}
