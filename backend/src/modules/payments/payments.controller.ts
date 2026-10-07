import { Request, Response, NextFunction } from 'express';
import { upaySandboxGateway } from './upaySandboxGateway';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const initiateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['MERCHANT_PAY', 'SEND_MONEY', 'BILL_PAY', 'DPS_DEPOSIT']),
  recipientOrMerchant: z.string().min(1, 'Recipient/Merchant is required'),
  clientMobile: z.string().optional(),
  reference: z.string().optional(),
});

const executeSchema = z.object({
  sessionToken: z.string().min(1),
  trxId: z.string().min(1),
  amount: z.number().positive(),
  fee: z.number().nonnegative(),
  recipientOrMerchant: z.string().min(1),
  type: z.string().min(1),
  signature: z.string().min(1),
});

export class PaymentsController {
  initiateSandboxPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validated = initiateSchema.parse(req.body);
      const session = upaySandboxGateway.initiatePayment(validated);
      return sendSuccess(res, session, 'upay sandbox payment session initiated');
    } catch (error) {
      next(error);
    }
  };

  executeSandboxPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validated = executeSchema.parse(req.body);
      const result = await upaySandboxGateway.executeAndSyncLedger(req.user.userId, validated);
      return sendSuccess(res, result, 'upay sandbox payment settled and synchronized to ledger');
    } catch (error) {
      next(error);
    }
  };

  verifySandboxTrx = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trxId = req.params.trxId as string;
      const result = await upaySandboxGateway.verifyTrx(trxId);
      return sendSuccess(res, result, 'upay transaction status verified');
    } catch (error) {
      next(error);
    }
  };
}
