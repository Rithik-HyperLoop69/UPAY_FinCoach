export type MFSProviderName = 'upay' | 'bkash' | 'nagad' | 'rocket' | 'cellfin' | 'generic';
export type MFSTransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface ParsedMFSTransaction {
  provider: MFSProviderName;
  providerDisplayName: string;
  type: MFSTransactionType;
  amount: number;
  fee: number;
  balanceAfter?: number;
  counterparty: string;
  merchant?: string;
  category: string;
  description: string;
  trxId: string;
  paymentMethod: string;
  rawSms: string;
  confidence: number; // 0.0 to 1.0
  parsingMethod: 'PROVIDER_REGEX' | 'BANGLA_NORMALIZED' | 'HEURISTIC_FALLBACK';
  detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed';
  hadBanglaNumerals: boolean;
  tokens?: Record<string, string | number | undefined>;
}

export interface IMFSParserProvider {
  name: MFSProviderName;
  displayName: string;
  canHandle(sms: string): boolean;
  parse(
    sms: string,
    meta: {
      hadBanglaNumerals: boolean;
      detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed';
    }
  ): ParsedMFSTransaction;
}
