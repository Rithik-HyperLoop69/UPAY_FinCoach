/**
 * Bangla Numeral & Text Normalizer
 * Converts Bengali script digits (০-৯) to Arabic numerals (0-9),
 * normalizes common Bengali MFS transaction keywords, and detects language.
 */

const BANGLA_DIGITS: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const BANGLISH_KEYWORDS = [
  'apnar',
  'apni',
  'taka',
  'pathano',
  'hoyeche',
  'kete',
  'neya',
  'grose',
  'shofol',
  'porishodh',
  'sofol',
  'jonno',
  'theke',
  'kache',
  'baki',
];

export interface NormalizedSmsResult {
  normalizedText: string;
  hadBanglaNumerals: boolean;
  detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed';
}

export function normalizeBanglaSms(rawSms: string): NormalizedSmsResult {
  let text = rawSms;
  let hadBanglaNumerals = false;

  // Check for Bengali script
  const hasBengaliScript = /[\u0980-\u09FF]/.test(text);

  // Check for Bangla digits
  if (/[\u09E6-\u09EF]/.test(text)) {
    hadBanglaNumerals = true;
    text = text.replace(/[\u09E6-\u09EF]/g, (digit) => BANGLA_DIGITS[digit] || digit);
  }

  // Detect language
  let detectedLanguage: 'en' | 'bn' | 'banglish' | 'mixed' = 'en';
  const lower = rawSms.toLowerCase();
  const hasBanglishWords = BANGLISH_KEYWORDS.some((word) => lower.includes(word));

  if (hasBengaliScript && hasBanglishWords) {
    detectedLanguage = 'mixed';
  } else if (hasBengaliScript) {
    detectedLanguage = 'bn';
  } else if (hasBanglishWords) {
    detectedLanguage = 'banglish';
  } else {
    detectedLanguage = 'en';
  }

  // Normalize Bengali currency words & symbols to standard Tk
  text = text
    .replace(/টাকা(?:র)?/g, ' Tk ')
    .replace(/টা[:\s]/g, ' Tk ')
    .replace(/৳/g, ' Tk ');

  // Normalize Bengali MFS terms
  text = text
    .replace(/(?:ট্রানজেকশন\s*আইডি|লেনদেন\s*নম্বর|লেনদেন\s*আইডি|আইডি)/g, 'TrxID')
    .replace(/(?:অবশিষ্ট\s*ব্যালেন্স|ব্যালেন্স)/g, 'Balance')
    .replace(/(?:চার্জ|ফি)/g, 'Fee')
    .replace(/(?:ক্যাশ\s*ইন|গ্রহণ\s*করেছেন|পেয়েছেন)/g, 'received')
    .replace(/ক্যাশ\s*আউট/g, 'Cash Out')
    .replace(/(?:সেন্ড\s*মানি|পাঠিয়েছেন)/g, 'Send Money')
    .replace(/(?:পেমেন্ট\s*সফল|পেমেন্ট|বিল\s*পরিশোধ)/g, 'Payment')
    .replace(/বিল\s*পে/g, 'Bill Pay')
    .replace(/রিচার্জ/g, 'Mobile Recharge');

  // Collapse multiple spaces
  text = text.replace(/\s+/g, ' ').trim();

  return {
    normalizedText: text,
    hadBanglaNumerals,
    detectedLanguage,
  };
}
