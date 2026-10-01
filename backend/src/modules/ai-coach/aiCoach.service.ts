import prisma from '../../config/database';
import { AIContextBuilder } from './aiContextBuilder';
import { AIProvider } from './adapters/aiProvider.interface';
import { GeminiProvider } from './adapters/geminiProvider';
import { DeterministicFallbackProvider } from './adapters/deterministicFallbackProvider';
import { CoachResponse } from './ai.types';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';

export class AICoachService {
  private contextBuilder: AIContextBuilder;
  private provider: AIProvider;

  constructor() {
    this.contextBuilder = new AIContextBuilder();

    if (process.env.GEMINI_API_KEY && process.env.AI_PROVIDER === 'gemini') {
      this.provider = new GeminiProvider(process.env.GEMINI_API_KEY);
    } else {
      this.provider = new DeterministicFallbackProvider();
    }
  }

  async chat(userId: string, userMessage: string, conversationId?: string): Promise<CoachResponse & { conversationId: string }> {
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

    // 5. Generate AI Coach Response
    const response = await this.provider.generateResponse(userMessage, context, formattedHistory);

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
