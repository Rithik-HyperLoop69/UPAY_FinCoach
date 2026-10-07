import { IMFSParserProvider, ParsedMFSTransaction } from '../mfs.types';
import { classifyCounterparty } from '../categoryMapper';

export class UpayProvider implements IMFSParserProvider {
  name = 'upay' as const;
  displayName = 'upay (United Commercial Bank MFS)';

  canHandle(sms: string): boolean {
    const lower = sms.toLowerCase();
    return (
      lower.includes('upay') ||
      lower.includes('ucb') ||
      lower.includes('united commercial bank')
    );
  }

  parse(
    sms: string,
    meta: {
      hadBanglaNumerals: boolean;
      detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed';
    }
  ): ParsedMFSTransaction {
    const clean = sms.trim();

    // Extract TrxID
    const trxMatch = clean.match(/(?:TrxID|TxnID|Txn ID|Trx ID)[:\s]*([A-Za-z0-9_-]+)/i);
    const trxId = trxMatch ? trxMatch[1] : `UPAY-SMS-${Date.now()}`;

    // Extract Amount
    let amount = 0;
    const amountMatch =
      clean.match(
        /(?:Payment of|Payment|Bill Pay of|Bill Pay|Cash Out|Send Money|Mobile Recharge of|received|Cash In)\s*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      ) || clean.match(/(?:Tk|BDT|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);

    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract Fee
    let fee = 0;
    const feeMatch = clean.match(/Fee\s*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (feeMatch) {
      fee = parseFloat(feeMatch[1].replace(/,/g, ''));
    }

    // Extract Balance After
    let balanceAfter: number | undefined = undefined;
    const balMatch = clean.match(/Balance\s*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (balMatch) {
      balanceAfter = parseFloat(balMatch[1].replace(/,/g, ''));
    }

    // Determine Type & Counterparty
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    let counterparty = 'upay Digital Payment';
    let defaultCategory = 'Shopping & Lifestyle';
    let description = clean.slice(0, 80);

    const lower = clean.toLowerCase();

    if (lower.includes('received') || lower.includes('cash in')) {
      type = 'INCOME';
      defaultCategory = 'Freelance & Consulting';
      const fromMatch = clean.match(/from\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|$)/i);
      counterparty = fromMatch ? fromMatch[1].trim() : 'Received Money';
      description = `Received Tk ${amount} from ${counterparty}`;
    } else if (lower.includes('bill pay')) {
      type = 'EXPENSE';
      defaultCategory = 'Bills & Utilities';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Utility Provider';
      description = `Bill Pay to ${counterparty}`;
    } else if (lower.includes('mobile recharge') || lower.includes('recharge')) {
      type = 'EXPENSE';
      defaultCategory = 'Internet & Mobile';
      const toMatch = clean.match(/to\s+([0-9+]+)/i);
      counterparty = toMatch ? `Mobile ${toMatch[1]}` : 'Mobile Recharge';
      description = `Mobile Recharge of Tk ${amount}`;
    } else if (lower.includes('cash out')) {
      type = 'EXPENSE';
      defaultCategory = 'Family & Transfers';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
      counterparty = toMatch ? `Agent ${toMatch[1].trim()}` : 'upay Agent';
      description = `Cash Out via ${counterparty}`;
    } else if (lower.includes('send money')) {
      type = 'EXPENSE';
      defaultCategory = 'Family & Transfers';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'upay Transfer';
      description = `Send Money to ${counterparty}`;
    } else {
      type = 'EXPENSE';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+&]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Merchant';
      description = `Payment to ${counterparty}`;
    }

    const classification = classifyCounterparty(counterparty, defaultCategory);
    const finalCategory = classification.category;
    if (classification.typeOverride) {
      type = classification.typeOverride;
    }

    // Calibrate confidence score
    let confidence = 0.7;
    if (trxMatch) confidence += 0.15;
    if (amount > 0) confidence += 0.1;
    if (balanceAfter !== undefined) confidence += 0.05;

    return {
      provider: 'upay',
      providerDisplayName: this.displayName,
      type,
      amount,
      fee,
      balanceAfter,
      counterparty,
      merchant: counterparty,
      category: finalCategory,
      description,
      trxId,
      paymentMethod: 'upay',
      rawSms: clean,
      confidence: Math.min(1.0, confidence),
      parsingMethod: meta.hadBanglaNumerals ? 'BANGLA_NORMALIZED' : 'PROVIDER_REGEX',
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
