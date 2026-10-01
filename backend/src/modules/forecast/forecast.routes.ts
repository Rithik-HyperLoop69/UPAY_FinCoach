import { Router } from 'express';
import { ForecastController } from './forecast.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ForecastController();

router.use(authenticateToken);

router.get('/', controller.getForecast);
router.post('/generate', controller.getForecast); // Manual trigger
router.get('/risks', controller.getRisks);

export default router;
