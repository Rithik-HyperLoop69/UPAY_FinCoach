import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getTransactions(req.user.userId, req.query);
      return sendSuccess(res, result, 'Transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const transaction = await this.service.getTransactionById(req.params.id as string, req.user.userId);
      return sendSuccess(res, transaction, 'Transaction retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const transaction = await this.service.createTransaction(req.user.userId, req.body);
      return sendSuccess(res, transaction, 'Transaction recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const transaction = await this.service.updateTransaction(
        req.params.id as string,
        req.user.userId,
        req.body
      );
      return sendSuccess(res, transaction, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.deleteTransaction(req.params.id as string, req.user.userId);
      return sendSuccess(res, null, 'Transaction deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  syncUpayWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.syncUpayWallet(req.user.userId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };

  parseUpaySms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { smsText, autoSave } = req.body;
      const result = await this.service.parseAndIngestUpaySms(req.user.userId, smsText, autoSave);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };
}

