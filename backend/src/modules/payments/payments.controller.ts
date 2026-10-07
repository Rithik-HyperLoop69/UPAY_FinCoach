import { Request, Response, NextFunction } from 'express';
import { upaySandboxGateway } from './upaySandboxGateway';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const initiateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.string().optional(),
  paymentType: z.string().optional(),
  recipient: z.string().optional(),
  recipientOrMerchant: z.string().optional(),
  clientMobile: z.string().optional(),
  reference: z.string().optional(),
  purpose: z.string().optional(),
}).transform((data) => ({
  amount: data.amount,
  type: (['MERCHANT_PAY', 'SEND_MONEY', 'BILL_PAY', 'DPS_DEPOSIT', 'CASH_OUT'].includes(data.type || '')
    ? data.type
    : data.paymentType === 'MERCHANT_PAYMENT'
    ? 'MERCHANT_PAY'
    : data.paymentType === 'BILL_PAY'
    ? 'BILL_PAY'
    : data.paymentType === 'SEND_MONEY'
    ? 'SEND_MONEY'
    : data.paymentType === 'CASH_OUT'
    ? 'CASH_OUT'
    : 'MERCHANT_PAY') as 'MERCHANT_PAY' | 'SEND_MONEY' | 'BILL_PAY' | 'DPS_DEPOSIT' | 'CASH_OUT',
  recipientOrMerchant: data.recipientOrMerchant || data.recipient || '01899112233',
  clientMobile: data.clientMobile,
  reference: data.reference || data.purpose || 'upay payment',
}));

const executeSchema = z.object({
  sessionToken: z.string().optional(),
  paymentId: z.string().optional(),
  trxId: z.string().optional(),
  amount: z.number().optional(),
  fee: z.number().optional(),
  recipientOrMerchant: z.string().optional(),
  type: z.string().optional(),
  signature: z.string().optional(),
  otp: z.string().optional(),
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

  getSandboxBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const balance = await upaySandboxGateway.getBalance(req.user.userId);
      return sendSuccess(res, balance, 'upay sandbox wallet balance retrieved');
    } catch (error) {
      next(error);
    }
  };

  getSandboxTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const transactions = await upaySandboxGateway.getTransactions(req.user.userId);
      return sendSuccess(res, { transactions }, 'upay sandbox transactions retrieved');
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
