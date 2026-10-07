import { IMFSParserProvider, ParsedMFSTransaction } from '../mfs.types';
import { classifyCounterparty } from '../categoryMapper';

export class NagadProvider implements IMFSParserProvider {
  name = 'nagad' as const;
  displayName = 'Nagad (Bangladesh Post Office MFS)';

  canHandle(sms: string): boolean {
    const lower = sms.toLowerCase();
    return (
      lower.includes('nagad') ||
      lower.includes('post office') ||
      lower.includes('uddokta') ||
      /txnid[:\s]*[a-z0-9]+/i.test(sms)
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

    // Extract TxnID / TrxID
    const trxMatch = clean.match(/(?:TxnID|Txn ID|TrxID|Trx ID)[:\s]*([A-Za-z0-9_-]+)/i);
    const trxId = trxMatch ? trxMatch[1] : `NAGAD-${Date.now()}`;

    // Extract Amount
    let amount = 0;
    const amountMatch =
      clean.match(
        /(?:Cash In|Payment|Bill Payment|Cash Out|Send Money|Recharge)\s*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      ) || clean.match(/(?:Tk|BDT|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);

    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract Fee
    let fee = 0;
    const feeMatch = clean.match(/Fee[:\s]*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (feeMatch) {
      fee = parseFloat(feeMatch[1].replace(/,/g, ''));
    }

    // Extract Balance
    let balanceAfter: number | undefined = undefined;
    const balMatch = clean.match(/Balance[:\s]*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (balMatch) {
      balanceAfter = parseFloat(balMatch[1].replace(/,/g, ''));
    }

    // Determine Type & Counterparty
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    let counterparty = 'Nagad Payment';
    let defaultCategory = 'Shopping & Lifestyle';
    let description = clean.slice(0, 80);

    const lower = clean.toLowerCase();

    if (lower.includes('cash in') || lower.includes('received')) {
      type = 'INCOME';
      defaultCategory = 'Freelance & Consulting';
      const fromMatch = clean.match(/from\s+([A-Za-z0-9\s+]+?)(?=\.|\s+Balance|\s+Fee|$)/i);
      counterparty = fromMatch ? fromMatch[1].trim() : 'Nagad Cash In';
      description = `Cash In Tk ${amount} from ${counterparty}`;
    } else if (lower.includes('cash out')) {
      type = 'EXPENSE';
      defaultCategory = 'Family & Transfers';
      const toMatch = clean.match(/to\s+(?:Uddokta\s+)?([A-Za-z0-9\s+]+?)(?=\.|\s+Fee|\s+Balance|$)/i);
      counterparty = toMatch ? `Uddokta ${toMatch[1].trim()}` : 'Nagad Uddokta';
      description = `Cash Out Tk ${amount} via ${counterparty}`;
    } else if (lower.includes('bill payment') || lower.includes('bill pay')) {
      type = 'EXPENSE';
      defaultCategory = 'Bills & Utilities';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+is|\s+Fee|\s+Balance|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Utility Biller';
      description = `Bill Payment to ${counterparty}`;
    } else if (lower.includes('send money')) {
      type = 'EXPENSE';
      defaultCategory = 'Family & Transfers';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+is|\s+Fee|\s+Balance|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Nagad User';
      description = `Send Money to ${counterparty}`;
    } else {
      type = 'EXPENSE';
      const toMatch = clean.match(/to\s+([A-Za-z0-9\s+&]+?)(?=\.|\s+is|\s+Fee|\s+Balance|$)/i);
      counterparty = toMatch ? toMatch[1].trim() : 'Merchant';
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
      provider: 'nagad',
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
      paymentMethod: 'Nagad',
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
