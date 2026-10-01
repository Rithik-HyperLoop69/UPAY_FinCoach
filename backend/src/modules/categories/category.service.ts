import { CategoryRepository } from './category.repository';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export class CategoryService {
  private repo: CategoryRepository;

  constructor() {
    this.repo = new CategoryRepository();
  }

  async getCategories(userId: string) {
    return this.repo.findForUser(userId);
  }

  async createCategory(userId: string, data: { name: string; type: string; icon?: string; color?: string }) {
    return this.repo.create({
      userId,
      name: data.name,
      type: data.type,
      icon: data.icon || 'folder',
      color: data.color || '#0284c7',
    });
  }

  async deleteCategory(id: string, userId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }
    if (existing.isSystem || existing.userId !== userId) {
      throw new ForbiddenError('Cannot delete system or unauthorized categories');
    }
    return this.repo.delete(id, userId);
  }
}
