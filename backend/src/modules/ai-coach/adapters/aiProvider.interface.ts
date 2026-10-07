import { StructuredFinancialContext } from '../ai.types';

export interface AIProvider {
  name: string;
  generateResponse(
    userMessage: string,
    context: StructuredFinancialContext,
    conversationHistory?: { role: string; content: string }[]
  ): Promise<{
    message: string;
    observed: string;
    forecast: string;
    suggestion: string;
    provider: 'gemini' | 'deterministic-fallback' | 'cached';
  }>;
}
