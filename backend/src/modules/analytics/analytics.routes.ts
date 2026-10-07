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
router.get('/anomalies', controller.getAnomalies);
router.get('/behavior-profile', controller.getBehaviorProfile);
router.get('/evaluation', controller.getEvaluationReport);
router.get('/model-card', controller.getModelCards);

export default router;
