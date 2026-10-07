import { IMFSParserProvider, MFSProviderName, ParsedMFSTransaction } from './mfs.types';
import { normalizeBanglaSms } from './banglaNumeralNormalizer';
import { UpayProvider } from './providers/upayProvider';
import { BkashProvider } from './providers/bkashProvider';
import { NagadProvider } from './providers/nagadProvider';
import { RocketProvider } from './providers/rocketProvider';
import { GenericMFSProvider } from './providers/genericProvider';

export class MFSEngine {
  private providers: IMFSParserProvider[];
  private fallbackProvider: IMFSParserProvider;

  constructor() {
    this.providers = [
      new UpayProvider(),
      new NagadProvider(),
      new BkashProvider(),
      new RocketProvider(),
    ];
    this.fallbackProvider = new GenericMFSProvider();
  }

  /**
   * Parse any Bangladeshi MFS SMS with automatic provider detection,
   * Bengali numeral normalization, and confidence calibration.
   */
  public parseSms(sms: string, providerHint?: MFSProviderName): ParsedMFSTransaction {
    const { normalizedText, hadBanglaNumerals, detectedLanguage } = normalizeBanglaSms(sms);

    // If a specific provider was hinted by caller, try to use it first
    if (providerHint && providerHint !== 'generic') {
      const explicitProvider = this.providers.find((p) => p.name === providerHint);
      if (explicitProvider) {
        return explicitProvider.parse(normalizedText, {
          hadBanglaNumerals,
          detectedLanguage,
        });
      }
    }

    // Auto-detect provider
    for (const provider of this.providers) {
      if (provider.canHandle(normalizedText) || provider.canHandle(sms)) {
        return provider.parse(normalizedText, {
          hadBanglaNumerals,
          detectedLanguage,
        });
      }
    }

    // Fallback to universal parser
    return this.fallbackProvider.parse(normalizedText, {
      hadBanglaNumerals,
      detectedLanguage,
    });
  }
}

// Global singleton instance
export const mfsEngine = new MFSEngine();

/**
 * Backward-compatible wrapper for existing Upay SMS parser imports
 */
export function parseUpaySms(sms: string) {
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
    paymentMethod: 'upay' as const,
    rawSms: parsed.rawSms,
  };
}
