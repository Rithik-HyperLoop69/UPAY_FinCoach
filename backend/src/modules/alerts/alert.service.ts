import { AlertRepository } from './alert.repository';

export class AlertService {
  private repo: AlertRepository;

  constructor() {
    this.repo = new AlertRepository();
  }

  async getAlerts(userId: string) {
    return this.repo.findForUser(userId);
  }

  async markAsRead(id: string, userId: string) {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.repo.markAllAsRead(userId);
  }

  async createAlert(userId: string, data: any) {
    return this.repo.create({
      userId,
      type: data.type || 'INFO',
      title: data.title,
      message: data.message,
      severity: data.severity || 'INFO',
      actionUrl: data.actionUrl,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });
  }
}
