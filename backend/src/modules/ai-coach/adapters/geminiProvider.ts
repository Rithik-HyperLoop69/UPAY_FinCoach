import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiProvider.interface';
import { StructuredFinancialContext } from '../ai.types';
import { SYSTEM_COACH_PROMPT } from '../prompts/systemPrompt';
import { buildPromptFromTemplate } from '../prompts/promptTemplates';
import { DeterministicFallbackProvider } from './deterministicFallbackProvider';
import { aiUsageManager } from '../aiUsageManager';

export class GeminiProvider implements AIProvider {
  name = 'GeminiProvider';
  private apiKey: string;
  private fallbackProvider: DeterministicFallbackProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.fallbackProvider = new DeterministicFallbackProvider();
  }

  async generateResponse(
    userMessage: string,
    context: StructuredFinancialContext,
    _conversationHistory?: { role: string; content: string }[]
  ): Promise<{
    message: string;
    observed: string;
    forecast: string;
    suggestion: string;
    provider: 'gemini' | 'deterministic-fallback' | 'cached';
  }> {
    // 1. Check prompt cache first
    const contextSummary = `${context.monthlyExpenses}-${context.financialHealthScore}-${context.topSpendingCategories[0]?.amount ?? 0}`;
    const cached = aiUsageManager.getCached(context.userId, userMessage, contextSummary);
    if (cached) {
      return cached;
    }

    // 2. If no API key configured, use deterministic fallback
    if (!this.apiKey) {
      console.log('ℹ️ No Gemini API key provided, using Deterministic Fallback Coach.');
      const startTime = Date.now();
      const fbResponse = await this.fallbackProvider.generateResponse(userMessage, context);
      aiUsageManager.recordCall({
        provider: 'deterministic-fallback',
        promptText: userMessage,
        completionText: fbResponse.message,
        latencyMs: Date.now() - startTime,
      });
      return fbResponse;
    }

    const startTime = Date.now();
    const prompt = buildPromptFromTemplate(userMessage, context);

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_COACH_PROMPT,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 6000ms')), 6000)
      );

      const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
      const response = await result.response;
      const text = response.text();
      const latencyMs = Date.now() - startTime;

      // Extract structured sections
      let observed = 'Observed from your verified transaction records.';
      let forecast = 'Forecast generated via Holt-Winters statistical modeling.';
      let suggestion = 'Consider reviewing discretionary expenditures to protect savings reserves.';

      const observedMatch = text.match(/(?:###|\*\*)\s*Observed:?\*?\*?([\s\S]*?)(?=(?:###|\*\*)\s*Forecast:?|$)/i);
      const forecastMatch = text.match(/(?:###|\*\*)\s*Forecast:?\*?\*?([\s\S]*?)(?=(?:###|\*\*)\s*Suggestion:?|$)/i);
      const suggestionMatch = text.match(/(?:###|\*\*)\s*Suggestion:?\*?\*?([\s\S]*?)(?=$)/i);

      if (observedMatch) observed = observedMatch[1].trim();
      if (forecastMatch) forecast = forecastMatch[1].trim();
      if (suggestionMatch) suggestion = suggestionMatch[1].trim();

      const output = {
        message: text,
        observed,
        forecast,
        suggestion,
        provider: 'gemini' as const,
      };

      // Record telemetry and save in cache
      aiUsageManager.recordCall({
        provider: 'gemini',
        promptText: prompt,
        completionText: text,
        latencyMs,
      });
      aiUsageManager.setCache(context.userId, userMessage, contextSummary, output);

      return output;
    } catch (error) {
      console.warn('⚠️ Gemini API call failed, falling back to deterministic engine:', error);
      const fbResponse = await this.fallbackProvider.generateResponse(userMessage, context);
      aiUsageManager.recordCall({
        provider: 'deterministic-fallback',
        promptText: prompt,
        completionText: fbResponse.message,
        latencyMs: Date.now() - startTime,
      });
      return fbResponse;
    }
  }
}
