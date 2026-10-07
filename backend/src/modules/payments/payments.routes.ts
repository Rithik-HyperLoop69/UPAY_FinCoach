import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PaymentsController();

// Public transaction verification by TrxID
router.get('/upay/sandbox/verify/:trxId', controller.verifySandboxTrx);

// Authenticated gateway routes
router.use(authenticateToken);
router.get('/upay/sandbox/balance', controller.getSandboxBalance);
router.get('/upay/sandbox/transactions', controller.getSandboxTransactions);
router.post('/upay/sandbox/initiate', controller.initiateSandboxPayment);
router.post('/upay/sandbox/execute', controller.executeSandboxPayment);

export default router;
