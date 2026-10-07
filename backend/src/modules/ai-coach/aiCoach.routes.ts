import { Router } from 'express';
import { AICoachController } from './aiCoach.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { aiLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
const controller = new AICoachController();

router.use(authenticateToken);

router.post('/chat', aiLimiter, controller.chat);
router.get('/conversations', controller.getConversations);
router.get('/conversations/:id', controller.getConversationMessages);
router.get('/context-preview', controller.getContextPreview);
router.get('/usage', controller.getUsageMetrics);

export default router;
