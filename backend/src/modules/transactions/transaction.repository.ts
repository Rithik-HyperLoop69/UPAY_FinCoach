import prisma from '../../config/database';
import { Transaction, Prisma } from '@prisma/client';

export interface TransactionFilterParams {
  userId: string;
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  skip?: number;
  take?: number;
}

export class TransactionRepository {
  async findMany(params: TransactionFilterParams): Promise<[Transaction[], number]> {
    const where: Prisma.TransactionWhereInput = {
      userId: params.userId,
    };

    if (params.type) where.type = params.type;
    if (params.category) where.category = params.category;
    if (params.paymentMethod) where.paymentMethod = params.paymentMethod;
    if (params.isRecurring !== undefined) where.isRecurring = params.isRecurring;

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    if (params.search) {
      where.OR = [
        { description: { contains: params.search } },
        { merchant: { contains: params.search } },
        { category: { contains: params.search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: params.skip || 0,
        take: params.take || 20,
      }),
      prisma.transaction.count({ where }),
    ]);

    return [transactions, total];
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: { id, userId },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
    merchant?: string;
    paymentMethod?: string;
    status?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    notes?: string;
    metadata?: string;
  }): Promise<Transaction> {
    return prisma.transaction.create({
      data,
    });
  }

  async update(id: string, userId: string, data: Partial<Transaction>): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<Transaction> {
    return prisma.transaction.delete({
      where: { id },
    });
  }

  async getAllForUser(userId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    return prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }
}
