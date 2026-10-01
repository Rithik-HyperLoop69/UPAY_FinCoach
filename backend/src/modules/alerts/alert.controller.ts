import { Request, Response, NextFunction } from 'express';
import { AlertService } from './alert.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AlertController {
  private service: AlertService;

  constructor() {
    this.service = new AlertService();
  }

  getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const alerts = await this.service.getAlerts(req.user.userId);
      return sendSuccess(res, alerts, 'Alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await this.service.markAsRead(req.params.id as string, req.user.userId);
      return sendSuccess(res, updated, 'Alert marked as read');
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.markAllAsRead(req.user.userId);
      return sendSuccess(res, null, 'All alerts marked as read');
    } catch (error) {
      next(error);
    }
  };

  createAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const alert = await this.service.createAlert(req.user.userId, req.body);
      return sendSuccess(res, alert, 'Alert generated', 201);
    } catch (error) {
      next(error);
    }
  };
}
