import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  parseUpaySmsSchema,
} from './transaction.validation';

const router = Router();
const controller = new TransactionController();

router.use(authenticateToken); // Protected routes

router.get('/', validateQuery(queryTransactionsSchema), controller.getTransactions);
router.post('/', validateBody(createTransactionSchema), controller.createTransaction);

// upay Auto-Tracking & SMS Ingestion endpoints
router.post('/upay/sync', controller.syncUpayWallet);
router.post('/upay/parse-sms', validateBody(parseUpaySmsSchema), controller.parseUpaySms);

router.get('/:id', controller.getTransactionById);
router.put('/:id', validateBody(updateTransactionSchema), controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

export default router;
