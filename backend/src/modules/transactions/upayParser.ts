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
}

export function parseUpaySms(sms: string): ParsedUpayTransaction {
  const clean = sms.trim();

  // Extract TrxID
  const trxMatch = clean.match(/TrxID\s*([A-Za-z0-9_-]+)/i);
  const trxId = trxMatch ? trxMatch[1] : `UPAY-SMS-${Date.now()}`;

  // Extract Amount (preferring transaction action prefix to avoid matching balance/fee)
  let amount = 0;
  const amountMatch =
    clean.match(
      /(?:Payment of|Bill Pay of|Cash Out|Send Money|Mobile Recharge of|received|Cash In)\s*(?:Tk|BDT|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
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

  // Determine Type, Category, Description, and Counterparty
  let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
  let merchant = 'upay Digital Payment';
  let category = 'Shopping & Lifestyle';
  let description = clean.slice(0, 80);

  const lower = clean.toLowerCase();

  if (lower.includes('received') || lower.includes('cash in')) {
    type = 'INCOME';
    category = 'Freelance & Consulting';
    const fromMatch = clean.match(/from\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|$)/i);
    merchant = fromMatch ? fromMatch[1].trim() : 'Received Money';
    description = `Received Tk ${amount} from ${merchant}`;
  } else if (lower.includes('bill pay')) {
    type = 'EXPENSE';
    category = 'Utilities & Bills';
    const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
    merchant = toMatch ? toMatch[1].trim() : 'Utility Provider';
    description = `Bill Pay to ${merchant}`;
  } else if (lower.includes('mobile recharge')) {
    type = 'EXPENSE';
    category = 'Utilities & Bills';
    const toMatch = clean.match(/to\s+([0-9+]+)/i);
    merchant = toMatch ? `Mobile ${toMatch[1]}` : 'Mobile Recharge';
    description = `Mobile Recharge of Tk ${amount}`;
  } else if (lower.includes('cash out')) {
    type = 'EXPENSE';
    category = 'Family & Transfers';
    const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
    merchant = toMatch ? `Agent ${toMatch[1].trim()}` : 'upay Agent';
    description = `Cash Out via ${merchant}`;
  } else if (lower.includes('send money')) {
    type = 'EXPENSE';
    category = 'Family & Transfers';
    const toMatch = clean.match(/to\s+([A-Za-z0-9\s+]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
    merchant = toMatch ? toMatch[1].trim() : 'upay Transfer';
    description = `Send Money to ${merchant}`;
  } else {
    // Payment of Tk ... to ...
    type = 'EXPENSE';
    const toMatch = clean.match(/to\s+([A-Za-z0-9\s+&]+?)(?=\.|\s+successful|\s+Balance|\s+Fee|$)/i);
    merchant = toMatch ? toMatch[1].trim() : 'Merchant';
    description = `Payment to ${merchant}`;

    // Auto-map category by merchant name
    const mLower = merchant.toLowerCase();
    if (
      mLower.includes('shwapno') ||
      mLower.includes('agora') ||
      mLower.includes('meena') ||
      mLower.includes('unimart') ||
      mLower.includes('chaldal')
    ) {
      category = 'Food & Groceries';
    } else if (
      mLower.includes('aarong') ||
      mLower.includes('yellow') ||
      mLower.includes('bata') ||
      mLower.includes('daraz') ||
      mLower.includes('apex')
    ) {
      category = 'Shopping & Lifestyle';
    } else if (
      mLower.includes('desco') ||
      mLower.includes('dpdc') ||
      mLower.includes('wasa') ||
      mLower.includes('nesco') ||
      mLower.includes('titas')
    ) {
      category = 'Utilities & Bills';
    } else if (
      mLower.includes('pathao') ||
      mLower.includes('uber') ||
      mLower.includes('shohoz') ||
      mLower.includes('chalo')
    ) {
      category = 'Transportation';
    } else if (
      mLower.includes('dps') ||
      mLower.includes('idlc') ||
      mLower.includes('brac') ||
      mLower.includes('savings')
    ) {
      category = 'Savings & Investments';
      type = 'TRANSFER';
    }
  }

  return {
    type,
    amount,
    fee,
    balanceAfter,
    merchant,
    category,
    description,
    trxId,
    paymentMethod: 'upay',
    rawSms: clean,
  };
}
