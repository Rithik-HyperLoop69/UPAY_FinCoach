import { Request, Response, NextFunction } from 'express';
import { AICoachService } from './aiCoach.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationId: z.string().optional(),
});

export class AICoachController {
  private service: AICoachService;

  constructor() {
    this.service = new AICoachService();
  }

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { message, conversationId } = chatSchema.parse(req.body);
      const result = await this.service.chat(req.user.userId, message, conversationId);
      return sendSuccess(res, result, 'Coach response generated');
    } catch (error) {
      next(error);
    }
  };

  getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const conversations = await this.service.getConversations(req.user.userId);
      return sendSuccess(res, conversations, 'Conversations retrieved');
    } catch (error) {
      next(error);
    }
  };

  getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const conversation = await this.service.getConversationMessages(
        req.user.userId,
        req.params.id as string
      );
      return sendSuccess(res, conversation, 'Conversation details retrieved');
    } catch (error) {
      next(error);
    }
  };

  getContextPreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const context = await this.service.getContextPreview(req.user.userId);
      return sendSuccess(res, context, 'Structured context preview generated');
    } catch (error) {
      next(error);
    }
  };
}
