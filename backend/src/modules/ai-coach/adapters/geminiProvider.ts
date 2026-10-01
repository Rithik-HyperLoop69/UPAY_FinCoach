import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiProvider.interface';
import { StructuredFinancialContext } from '../ai.types';
import { SYSTEM_COACH_PROMPT } from '../prompts/systemPrompt';
import { buildPromptFromTemplate } from '../prompts/promptTemplates';
import { DeterministicFallbackProvider } from './deterministicFallbackProvider';

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
    conversationHistory?: { role: string; content: string }[]
  ): Promise<{
    message: string;
    observed: string;
    forecast: string;
    suggestion: string;
    provider: 'gemini' | 'deterministic-fallback';
  }> {
    if (!this.apiKey) {
      console.log('ℹ️ No Gemini API key provided, using Deterministic Fallback Coach.');
      return this.fallbackProvider.generateResponse(userMessage, context);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_COACH_PROMPT,
      });

      const prompt = buildPromptFromTemplate(userMessage, context);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract sections if present, or format as full message
      let observed = 'Observed from your current spending records.';
      let forecast = 'Forecast based on current historical trends.';
      let suggestion = 'Consider reviewing your discretionary budget.';

      const observedMatch = text.match(/\*\*Observed:\*\*([\s\S]*?)(?=\*\*Forecast:\*\*|$)/i);
      const forecastMatch = text.match(/\*\*Forecast:\*\*([\s\S]*?)(?=\*\*Suggestion:\*\*|$)/i);
      const suggestionMatch = text.match(/\*\*Suggestion:\*\*([\s\S]*?)(?=$)/i);

      if (observedMatch) observed = observedMatch[1].trim();
      if (forecastMatch) forecast = forecastMatch[1].trim();
      if (suggestionMatch) suggestion = suggestionMatch[1].trim();

      return {
        message: text,
        observed,
        forecast,
        suggestion,
        provider: 'gemini',
      };
    } catch (error) {
      console.warn('⚠️ Gemini API call failed, falling back to deterministic engine:', error);
      return this.fallbackProvider.generateResponse(userMessage, context);
    }
  }
}
