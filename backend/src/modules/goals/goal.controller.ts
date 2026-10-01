import { Request, Response, NextFunction } from 'express';
import { GoalService } from './goal.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0).optional().default(0),
  targetDate: z.string().optional(),
  category: z.string().optional().default('Emergency'),
  notes: z.string().optional(),
});

const depositWithdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export class GoalController {
  private service: GoalService;

  constructor() {
    this.service = new GoalService();
  }

  getGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const goals = await this.service.getGoals(req.user.userId);
      return sendSuccess(res, goals, 'Savings goals retrieved');
    } catch (error) {
      next(error);
    }
  };

  createGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validated = createGoalSchema.parse(req.body);
      const goal = await this.service.createGoal(req.user.userId, validated);
      return sendSuccess(res, goal, 'Savings goal created', 201);
    } catch (error) {
      next(error);
    }
  };

  deposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { amount } = depositWithdrawSchema.parse(req.body);
      const updated = await this.service.deposit(req.params.id as string, req.user.userId, amount);
      return sendSuccess(res, updated, `Successfully deposited ৳${amount} to goal`);
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { amount } = depositWithdrawSchema.parse(req.body);
      const updated = await this.service.withdraw(req.params.id as string, req.user.userId, amount);
      return sendSuccess(res, updated, `Successfully withdrew ৳${amount} from goal`);
    } catch (error) {
      next(error);
    }
  };

  updateGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await this.service.updateGoal(req.params.id as string, req.user.userId, req.body);
      return sendSuccess(res, updated, 'Savings goal updated');
    } catch (error) {
      next(error);
    }
  };

  deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.deleteGoal(req.params.id as string, req.user.userId);
      return sendSuccess(res, null, 'Savings goal deleted');
    } catch (error) {
      next(error);
    }
  };
}
