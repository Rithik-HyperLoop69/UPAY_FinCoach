import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const categories = await this.service.getCategories(req.user.userId);
      return sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validated = createCategorySchema.parse(req.body);
      const category = await this.service.createCategory(req.user.userId, validated);
      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.deleteCategory(req.params.id as string, req.user.userId);
      return sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
