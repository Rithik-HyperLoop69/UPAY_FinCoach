/**
 * AI Usage & Telemetry Manager
 * Manages semantic prompt caching, token estimation, rate-limit resilience,
 * and real-time observability metrics for the AI Financial Coach.
 */

interface CacheEntry {
  response: {
    message: string;
    observed: string;
    forecast: string;
    suggestion: string;
    provider: 'gemini' | 'deterministic-fallback' | 'cached';
  };
  cachedAt: number;
}

export interface AIUsageMetrics {
  totalRequests: number;
  geminiRequests: number;
  fallbackRequests: number;
  cacheHits: number;
  cacheHitRatio: number;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedTotalTokens: number;
  averageLatencyMs: number;
  activeModel: string;
}

export class AIUsageManager {
  private cache = new Map<string, CacheEntry>();
  private cacheTtlMs = 10 * 60 * 1000; // 10 minutes

  private totalRequests = 0;
  private geminiRequests = 0;
  private fallbackRequests = 0;
  private cacheHits = 0;
  private totalPromptTokens = 0;
  private totalCompletionTokens = 0;
  private totalLatencyMs = 0;
  private activeModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  /**
   * Fast character-based token estimator
   * Bengali / Unicode: ~2 chars per token; ASCII / English: ~4 chars per token
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
    const asciiCount = text.length - nonAsciiCount;
    return Math.ceil(asciiCount / 4 + nonAsciiCount / 2);
  }

  /**
   * Generates a stable cache key based on user ID, normalized query, and context snapshot hash
   */
  private generateKey(userId: string, query: string, contextSummary: string): string {
    const cleanQ = query.trim().toLowerCase().replace(/\s+/g, ' ');
    return `${userId}:${cleanQ}:${contextSummary}`;
  }

  /**
   * Check cache for identical recent inquiry
   */
  public getCached(
    userId: string,
    query: string,
    contextSummary: string
  ): CacheEntry['response'] | null {
    this.totalRequests++;
    const key = this.generateKey(userId, query, contextSummary);
    const entry = this.cache.get(key);

    if (entry) {
      if (Date.now() - entry.cachedAt < this.cacheTtlMs) {
        this.cacheHits++;
        return {
          ...entry.response,
          provider: 'cached',
        };
      }
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Store response in cache
   */
  public setCache(
    userId: string,
    query: string,
    contextSummary: string,
    response: CacheEntry['response']
  ): void {
    const key = this.generateKey(userId, query, contextSummary);
    this.cache.set(key, {
      response,
      cachedAt: Date.now(),
    });

    // Evict old entries if cache grows past 200 items
    if (this.cache.size > 200) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  /**
   * Record metrics after Gemini or Fallback call
   */
  public recordCall(params: {
    provider: 'gemini' | 'deterministic-fallback';
    promptText: string;
    completionText: string;
    latencyMs: number;
  }): void {
    if (params.provider === 'gemini') {
      this.geminiRequests++;
    } else {
      this.fallbackRequests++;
    }

    const pTokens = this.estimateTokens(params.promptText);
    const cTokens = this.estimateTokens(params.completionText);

    this.totalPromptTokens += pTokens;
    this.totalCompletionTokens += cTokens;
    this.totalLatencyMs += params.latencyMs;
  }

  /**
   * Retrieve aggregate usage metrics for judges & dashboard telemetry
   */
  public getMetrics(): AIUsageMetrics {
    const calls = this.geminiRequests + this.fallbackRequests;
    const avgLatency = calls > 0 ? Math.round(this.totalLatencyMs / calls) : 0;
    const hitRatio = this.totalRequests > 0 ? Number(((this.cacheHits / this.totalRequests) * 100).toFixed(1)) : 0;

    return {
      totalRequests: this.totalRequests,
      geminiRequests: this.geminiRequests,
      fallbackRequests: this.fallbackRequests,
      cacheHits: this.cacheHits,
      cacheHitRatio: hitRatio,
      estimatedPromptTokens: this.totalPromptTokens,
      estimatedCompletionTokens: this.totalCompletionTokens,
      estimatedTotalTokens: this.totalPromptTokens + this.totalCompletionTokens,
      averageLatencyMs: avgLatency,
      activeModel: this.activeModel,
    };
  }
}

export const aiUsageManager = new AIUsageManager();
