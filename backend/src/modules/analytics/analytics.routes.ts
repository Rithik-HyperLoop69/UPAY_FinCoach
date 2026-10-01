import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authenticateToken);

router.get('/summary', controller.getSummary);
router.get('/spending-breakdown', controller.getSpendingBreakdown);
router.get('/trends', controller.getMonthlyTrends);
router.get('/health-score', controller.getHealthScore);

export default router;
