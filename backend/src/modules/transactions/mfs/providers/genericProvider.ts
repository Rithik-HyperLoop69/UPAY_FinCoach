import { IMFSParserProvider, ParsedMFSTransaction } from '../mfs.types';
import { classifyCounterparty } from '../categoryMapper';

export class GenericMFSProvider implements IMFSParserProvider {
  name = 'generic' as const;
  displayName = 'Universal Bangladeshi MFS/Bank SMS Parser';

  canHandle(_sms: string): boolean {
    return true; // Fallback provider
  }

  parse(
    sms: string,
    meta: {
      hadBanglaNumerals: boolean;
      detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed';
    }
  ): ParsedMFSTransaction {
    const clean = sms.trim();

    // Extract any ID or TrxID
    const trxMatch = clean.match(/(?:TrxID|TxnID|Ref|ID|Code)[:\s]*([A-Za-z0-9_-]+)/i);
    const trxId = trxMatch ? trxMatch[1] : `GEN-SMS-${Date.now()}`;

    // Extract Amount (look for currency prefix or numeric amount)
    let amount = 0;
    const amountMatch =
      clean.match(/(?:Tk|BDT|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) ||
      clean.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:Tk|BDT|৳)/i) ||
      clean.match(/\b([0-9]{2,7}(?:\.[0-9]{1,2})?)\b/);

    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract Fee
    let fee = 0;
    const feeMatch = clean.match(/(?:Fee|Charge)[:\s]*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (feeMatch) {
      fee = parseFloat(feeMatch[1].replace(/,/g, ''));
    }

    // Extract Balance
    let balanceAfter: number | undefined = undefined;
    const balMatch = clean.match(/(?:Balance|Bal)[:\s]*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (balMatch) {
      balanceAfter = parseFloat(balMatch[1].replace(/,/g, ''));
    }

    // Type inference
    const lower = clean.toLowerCase();
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    let defaultCategory = 'Shopping & Lifestyle';

    if (
      lower.includes('credit') ||
      lower.includes('received') ||
      lower.includes('deposited') ||
      lower.includes('cash in')
    ) {
      type = 'INCOME';
      defaultCategory = 'Salary & Allowances';
    } else if (lower.includes('transfer') || lower.includes('send money')) {
      type = 'TRANSFER';
      defaultCategory = 'Family & Transfers';
    }

    // Extract counterparty if "to" or "from" present
    let counterparty = 'Digital MFS';
    const partyMatch =
      clean.match(/(?:to|from)\s+([A-Za-z0-9\s+&]+?)(?=\.|\s+Fee|\s+Balance|\s+successful|$)/i);
    if (partyMatch) {
      counterparty = partyMatch[1].trim();
    } else {
      // Check for known providers or utilities at start/in text
      const knownEntityMatch = clean.match(/\b(DESCO|DPDC|WASA|Nesco|Titas|Shwapno|Aarong|Chaldal|Daraz|Pathao|Link3)\b/i);
      if (knownEntityMatch) {
        counterparty = knownEntityMatch[1];
      }
    }

    const classification = classifyCounterparty(counterparty, defaultCategory, clean);
    const category = classification.category;

    // Confidence is lower for heuristic fallback
    let confidence = 0.55;
    if (trxMatch) confidence += 0.15;
    if (amount > 0) confidence += 0.15;

    return {
      provider: 'generic',
      providerDisplayName: this.displayName,
      type,
      amount,
      fee,
      balanceAfter,
      counterparty,
      merchant: counterparty,
      category,
      description: clean.slice(0, 80),
      trxId,
      paymentMethod: 'MFS',
      rawSms: clean,
      confidence: Math.min(0.9, confidence),
      parsingMethod: 'HEURISTIC_FALLBACK',
      detectedLanguage: meta.detectedLanguage,
      hadBanglaNumerals: meta.hadBanglaNumerals,
      tokens: {
        trxId,
        amount,
        fee,
        balanceAfter,
        counterparty,
      },
    };
  }
}
