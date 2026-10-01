import { Router } from 'express';
import { AlertController } from './alert.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AlertController();

router.use(authenticateToken);

router.get('/', controller.getAlerts);
router.post('/', controller.createAlert);
router.put('/read-all', controller.markAllAsRead);
router.put('/:id/read', controller.markAsRead);

export default router;
