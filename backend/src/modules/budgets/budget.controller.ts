import { Request, Response, NextFunction } from 'express';
import { BudgetService } from './budget.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const setBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  totalLimit: z.number().positive('Total limit must be positive'),
  items: z.array(
    z.object({
      category: z.string().min(1),
      limitAmount: z.number().positive(),
    })
  ),
});

export class BudgetController {
  private service: BudgetService;

  constructor() {
    this.service = new BudgetService();
  }

  getBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const month =
        (req.query.month as string) ||
        new Date().toISOString().slice(0, 7); // Default current month YYYY-MM
      const budget = await this.service.getBudgetForMonth(req.user.userId, month);
      return sendSuccess(res, budget, 'Monthly budget retrieved');
    } catch (error) {
      next(error);
    }
  };

  setBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validated = setBudgetSchema.parse(req.body);
      const budget = await this.service.setBudget(req.user.userId, validated);
      return sendSuccess(res, budget, 'Budget saved successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.deleteBudget(req.params.id as string, req.user.userId);
      return sendSuccess(res, null, 'Budget deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
