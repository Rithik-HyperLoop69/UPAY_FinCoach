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

  getAnomalies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const anomalies = await this.service.getAnomalies(req.user.userId);
      return sendSuccess(res, anomalies, 'Statistical transaction anomalies audited');
    } catch (error) {
      next(error);
    }
  };

  getBehaviorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await this.service.getBehaviorProfile(req.user.userId);
      return sendSuccess(res, profile, 'User financial behavior profile generated');
    } catch (error) {
      next(error);
    }
  };

  getEvaluationReport = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { evaluationService } = await import('./evaluationService');
      const report = evaluationService.getSystemEvaluationReport();
      return sendSuccess(res, report, 'AI/ML system evaluation benchmark report retrieved');
    } catch (error) {
      next(error);
    }
  };

  getModelCards = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { evaluationService } = await import('./evaluationService');
      const cards = evaluationService.getModelCards();
      return sendSuccess(res, cards, 'Model cards registry retrieved');
    } catch (error) {
      next(error);
    }
  };

  getPilotImpact = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { PilotImpactService } = await import('./pilotImpactService');
      const service = new PilotImpactService();
      const report = service.getReport();
      return sendSuccess(res, report, 'Empirical survey and 30-day pilot impact report retrieved');
    } catch (error) {
      next(error);
    }
  };
}
