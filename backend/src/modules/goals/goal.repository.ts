import prisma from '../../config/database';
import { SavingsGoal } from '@prisma/client';

export class GoalRepository {
  async findForUser(userId: string): Promise<SavingsGoal[]> {
    return prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string): Promise<SavingsGoal | null> {
    return prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
  }

  async create(data: {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: Date;
    category?: string;
    notes?: string;
  }): Promise<SavingsGoal> {
    return prisma.savingsGoal.create({
      data,
    });
  }

  async update(id: string, userId: string, data: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return prisma.savingsGoal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<SavingsGoal> {
    return prisma.savingsGoal.delete({
      where: { id },
    });
  }
}
