import prisma from '../../config/database';
import { Alert } from '@prisma/client';

export class AlertRepository {
  async findForUser(userId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.alert.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    severity?: string;
    actionUrl?: string;
    metadata?: string;
  }): Promise<Alert> {
    return prisma.alert.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity || 'INFO',
        actionUrl: data.actionUrl,
        metadata: data.metadata,
      },
    });
  }
}
