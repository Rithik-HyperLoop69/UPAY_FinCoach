import prisma from '../../config/database';
import { Category } from '@prisma/client';

export class CategoryRepository {
  async findForUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        OR: [{ userId }, { isSystem: true, userId: null }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
  }): Promise<Category> {
    return prisma.category.create({
      data: {
        ...data,
        isSystem: false,
      },
    });
  }

  async delete(id: string, userId: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }
}
