import { Request, Response, NextFunction } from 'express';
import { ForecastService } from './forecast.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class ForecastController {
  private service: ForecastService;

  constructor() {
    this.service = new ForecastService();
  }

  getForecast = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const forecast = await this.service.getForecast(req.user.userId);
      return sendSuccess(res, forecast, 'Cash-flow forecast generated successfully');
    } catch (error) {
      next(error);
    }
  };

  getRisks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const risks = await this.service.getRisks(req.user.userId);
      return sendSuccess(res, risks, 'Identified cash-flow risks retrieved');
    } catch (error) {
      next(error);
    }
  };
}
