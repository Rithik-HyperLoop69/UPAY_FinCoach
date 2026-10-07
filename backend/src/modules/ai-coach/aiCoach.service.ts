import prisma from '../../config/database';
import { AIContextBuilder } from './aiContextBuilder';
import { AIProvider } from './adapters/aiProvider.interface';
import { GeminiProvider } from './adapters/geminiProvider';
import { DeterministicFallbackProvider } from './adapters/deterministicFallbackProvider';
import { CoachResponse } from './ai.types';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';

import { ProactiveNudgeEngine, ProactiveNudge } from './proactiveNudgeEngine';

export class AICoachService {
  private contextBuilder: AIContextBuilder;
  private provider: AIProvider;
  private fallbackProvider: DeterministicFallbackProvider;
  private nudgeEngine: ProactiveNudgeEngine;

  constructor() {
    this.contextBuilder = new AIContextBuilder();
    this.fallbackProvider = new DeterministicFallbackProvider();
    this.nudgeEngine = new ProactiveNudgeEngine();

    if (process.env.GEMINI_API_KEY && process.env.AI_PROVIDER === 'gemini') {
      this.provider = new GeminiProvider(process.env.GEMINI_API_KEY);
    } else {
      this.provider = this.fallbackProvider;
    }
  }

  async getNudges(userId: string): Promise<ProactiveNudge[]> {
    return this.nudgeEngine.generateNudges(userId);
  }

  async chat(
    userId: string,
    userMessage: string,
    conversationId?: string,
    privacyMode: 'cloud' | 'local_airgap' = 'cloud'
  ): Promise<CoachResponse & { conversationId: string; privacyMetadata?: any }> {
    // 1. Build strict, structured, sanitized financial snapshot
    const context = await this.contextBuilder.buildContext(userId);

    // 2. Locate or create conversation
    let convId = conversationId;
    if (!convId) {
      const newConv = await prisma.aIConversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 45) + (userMessage.length > 45 ? '...' : ''),
        },
      });
      convId = newConv.id;
    } else {
      const existing = await prisma.aIConversation.findFirst({
        where: { id: convId, userId },
      });
      if (!existing) {
        throw new NotFoundError('Conversation not found');
      }
    }

    // 3. Save User Message
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: userMessage,
      },
    });

    // 4. Retrieve recent message history (up to 6 messages)
    const history = await prisma.aIMessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const formattedHistory = history.reverse().map((h) => ({
      role: h.role,
      content: h.content,
    }));

    // 5. Generate AI Coach Response (Honoring User Privacy Mode)
    let response: {
      message: string;
      observed: string;
      forecast: string;
      suggestion: string;
      provider: 'gemini' | 'deterministic-fallback' | 'cached';
    };
    const isAirgap = privacyMode === 'local_airgap';

    if (isAirgap) {
      // 100% on-premise local deterministic execution — zero network calls to 3rd party AI
      response = await this.fallbackProvider.generateResponse(userMessage, context, formattedHistory);
    } else {
      // Hybrid Cloud with Gemini 2.5 Flash and 6s timeout circuit breaker
      response = await this.provider.generateResponse(userMessage, context, formattedHistory);
    }

    const privacyMetadata = {
      mode: isAirgap ? 'LOCAL_AIRGAP_ENGINE' : 'HYBRID_CLOUD_ENGINE',
      provider: isAirgap ? 'Local Deterministic Rules & Statistical Modeler' : 'Google Gemini 2.5 Flash (Context Grounded)',
      thirdPartyBytesSent: isAirgap ? 0 : JSON.stringify(context).length,
      privacyGuarantee: isAirgap
        ? '100% On-Premise Execution. Zero bytes sent to 3rd party AI or cloud services.'
        : 'Sanitized context passed with 10-minute semantic cache window.',
    };

    // 6. Save Assistant Response with Context Snapshot for transparency & auditing
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: response.message,
        structuredContext: JSON.stringify(context),
      },
    });

    return {
      ...response,
      conversationId: convId,
      contextSnapshot: context,
      privacyMetadata,
    };
  }

  async getConversations(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conv = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      throw new NotFoundError('Conversation not found');
    }

    return conv;
  }

  async getContextPreview(userId: string) {
    return this.contextBuilder.buildContext(userId);
  }
}
