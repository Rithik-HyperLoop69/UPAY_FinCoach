import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const summary = await this.service.getSummary(req.user.userId);
      return sendSuccess(res, summary, 'Financial summary calculated');
    } catch (error) {
      next(error);
    }
  };

  getSpendingBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const month = req.query.month as string | undefined;
      const breakdown = await this.service.getSpendingBreakdown(req.user.userId, month);
      return sendSuccess(res, breakdown, 'Spending breakdown generated');
    } catch (error) {
      next(error);
    }
  };

  getMonthlyTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const trends = await this.service.getMonthlyTrends(req.user.userId);
      return sendSuccess(res, trends, 'Monthly trends retrieved');
    } catch (error) {
      next(error);
    }
  };

  getHealthScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const score = await this.service.calculateHealthScore(req.user.userId);
      return sendSuccess(res, score, 'Financial health score evaluated');
    } catch (error) {
      next(error);
    }
  };
}
