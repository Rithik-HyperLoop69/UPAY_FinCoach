/**
 * Category & Counterparty Classification Engine for Bangladeshi MFS
 */

export interface MFSClassificationResult {
  category: string;
  isRecurringCandidate: boolean;
  typeOverride?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
}

const CATEGORY_MAP: { [keyword: string]: { category: string; recurring?: boolean; transfer?: boolean } } = {
  // Supermarkets & Groceries
  shwapno: { category: 'Food & Groceries' },
  agora: { category: 'Food & Groceries' },
  meena: { category: 'Food & Groceries' },
  unimart: { category: 'Food & Groceries' },
  chaldal: { category: 'Food & Groceries' },
  foodpanda: { category: 'Food & Groceries' },
  pathaofood: { category: 'Food & Groceries' },
  kfc: { category: 'Food & Groceries' },
  pizza: { category: 'Food & Groceries' },
  takeout: { category: 'Food & Groceries' },

  // Lifestyle & Shopping
  aarong: { category: 'Shopping & Lifestyle' },
  yellow: { category: 'Shopping & Lifestyle' },
  bata: { category: 'Shopping & Lifestyle' },
  apex: { category: 'Shopping & Lifestyle' },
  daraz: { category: 'Shopping & Lifestyle' },
  lotto: { category: 'Shopping & Lifestyle' },
  sailor: { category: 'Shopping & Lifestyle' },
  cats: { category: 'Shopping & Lifestyle' },
  rokomari: { category: 'Shopping & Lifestyle' },

  // Utilities & Bills
  desco: { category: 'Bills & Utilities', recurring: true },
  dpdc: { category: 'Bills & Utilities', recurring: true },
  wasa: { category: 'Bills & Utilities', recurring: true },
  nesco: { category: 'Bills & Utilities', recurring: true },
  titas: { category: 'Bills & Utilities', recurring: true },
  reb: { category: 'Bills & Utilities', recurring: true },
  breb: { category: 'Bills & Utilities', recurring: true },
  btcl: { category: 'Bills & Utilities', recurring: true },
  carnival: { category: 'Bills & Utilities', recurring: true },
  link3: { category: 'Internet & Mobile', recurring: true },
  amberit: { category: 'Internet & Mobile', recurring: true },
  grameenphone: { category: 'Internet & Mobile', recurring: true },
  gp: { category: 'Internet & Mobile', recurring: true },
  robi: { category: 'Internet & Mobile', recurring: true },
  banglalink: { category: 'Internet & Mobile', recurring: true },
  teletalk: { category: 'Internet & Mobile', recurring: true },

  // Transport
  pathao: { category: 'Transportation' },
  uber: { category: 'Transportation' },
  shohoz: { category: 'Transportation' },
  chalo: { category: 'Transportation' },
  railway: { category: 'Transportation' },
  biman: { category: 'Transportation' },

  // Savings, DPS & Investments
  dps: { category: 'Savings & Investments', recurring: true, transfer: true },
  idlc: { category: 'Savings & Investments', recurring: true, transfer: true },
  brac: { category: 'Savings & Investments', recurring: true, transfer: true },
  savings: { category: 'Savings & Investments', recurring: true, transfer: true },
  ipdc: { category: 'Savings & Investments', recurring: true, transfer: true },
  sanchay: { category: 'Savings & Investments', recurring: true, transfer: true },

  // Rent & Housing
  tolet: { category: 'Rent & Housing', recurring: true },
  basha: { category: 'Rent & Housing', recurring: true },
  rent: { category: 'Rent & Housing', recurring: true },
};

export function classifyCounterparty(
  counterparty: string,
  fallbackCategory = 'Shopping & Lifestyle',
  fullText?: string
): MFSClassificationResult {
  const cleanParty = counterparty.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanText = fullText ? fullText.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  for (const [key, mapping] of Object.entries(CATEGORY_MAP)) {
    if (cleanParty.includes(key) || (cleanText && cleanText.includes(key))) {
      return {
        category: mapping.category,
        isRecurringCandidate: !!mapping.recurring,
        typeOverride: mapping.transfer ? 'TRANSFER' : undefined,
      };
    }
  }

  return {
    category: fallbackCategory,
    isRecurringCandidate: false,
  };
}
