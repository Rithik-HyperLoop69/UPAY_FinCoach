import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
} from './transaction.validation';

const router = Router();
const controller = new TransactionController();

router.use(authenticateToken); // Protected routes

router.get('/', validateQuery(queryTransactionsSchema), controller.getTransactions);
router.post('/', validateBody(createTransactionSchema), controller.createTransaction);
router.get('/:id', controller.getTransactionById);
router.put('/:id', validateBody(updateTransactionSchema), controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

export default router;
