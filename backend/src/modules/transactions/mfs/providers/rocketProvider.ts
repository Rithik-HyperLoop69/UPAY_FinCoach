import { IMFSParserProvider, ParsedMFSTransaction } from '../mfs.types';
import { classifyCounterparty } from '../categoryMapper';

export class RocketProvider implements IMFSParserProvider {
  name = 'rocket' as const;
  displayName = 'Rocket (Dutch-Bangla Bank MFS)';

  canHandle(sms: string): boolean {
    const lower = sms.toLowerCase();
    return (
      lower.includes('rocket') ||
      lower.includes('dbbl') ||
      lower.includes('dutch-bangla') ||
      /bal bdt/i.test(sms)
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

    // Extract TxnId / TrxID
    const trxMatch = clean.match(/(?:TxnId|TxnID|TrxID)[:\s]*([A-Za-z0-9_-]+)/i);
    const trxId = trxMatch ? trxMatch[1] : `ROCKET-${Date.now()}`;

    // Extract Amount
    let amount = 0;
    const amountMatch =
      clean.match(
        /(?:Cash Out|Cash In|Pay|Payment|Bill Pay|Transfer)\s*(?:BDT|Tk|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      ) || clean.match(/(?:BDT|Tk|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);

    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract Fee
    let fee = 0;
    const feeMatch = clean.match(/Fee\s*(?:BDT|Tk|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (feeMatch) {
      fee = parseFloat(feeMatch[1].replace(/,/g, ''));
    }

    // Extract Balance
    let balanceAfter: number | undefined = undefined;
    const balMatch = clean.match(/(?:Bal|Balance)\s*(?:BDT|Tk|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (balMatch) {
      balanceAfter = parseFloat(balMatch[1].replace(/,/g, ''));
    }

    // Determine Type & Counterparty
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    let counterparty = 'Rocket Transaction';
    let defaultCategory = 'Shopping & Lifestyle';
    let description = clean.slice(0, 80);

    const lower = clean.toLowerCase();

    if (lower.includes('cash in') || lower.includes('received')) {
      type = 'INCOME';
      defaultCategory = 'Freelance & Consulting';
      const fromMatch = clean.match(/from\s+([A-Za-z0-9\s+]+?)(?=\.|\s+Fee|\s+Bal|$)/i);
      counterparty = fromMatch ? fromMatch[1].trim() : 'Rocket Sender';
      description = `Received BDT ${amount} from ${counterparty}`;
    } else if (lower.includes('cash out')) {
      type = 'EXPENSE';
      defaultCategory = 'Family & Transfers';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+Fee|\s+Bal|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Rocket Agent';
      description = `Cash Out BDT ${amount} via ${counterparty}`;
    } else {
      type = 'EXPENSE';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+&]+?)(?=\.|\s+Fee|\s+Bal|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Rocket Merchant';
      description = `Payment to ${counterparty}`;
    }

    const classification = classifyCounterparty(counterparty, defaultCategory);
    const finalCategory = classification.category;
    if (classification.typeOverride) {
      type = classification.typeOverride;
    }

    let confidence = 0.7;
    if (trxMatch) confidence += 0.15;
    if (amount > 0) confidence += 0.1;
    if (balanceAfter !== undefined) confidence += 0.05;

    return {
      provider: 'rocket',
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
      paymentMethod: 'Rocket',
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
