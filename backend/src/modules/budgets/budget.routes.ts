import { Router } from 'express';
import { BudgetController } from './budget.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new BudgetController();

router.use(authenticateToken);

router.get('/', controller.getBudget);
router.post('/', controller.setBudget);
router.delete('/:id', controller.deleteBudget);

export default router;
