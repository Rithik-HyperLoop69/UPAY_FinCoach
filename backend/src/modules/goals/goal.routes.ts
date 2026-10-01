import { Router } from 'express';
import { GoalController } from './goal.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new GoalController();

router.use(authenticateToken);

router.get('/', controller.getGoals);
router.post('/', controller.createGoal);
router.post('/:id/deposit', controller.deposit);
router.post('/:id/withdraw', controller.withdraw);
router.put('/:id', controller.updateGoal);
router.delete('/:id', controller.deleteGoal);

export default router;
