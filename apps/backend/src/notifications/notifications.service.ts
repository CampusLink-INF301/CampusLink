import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(
    userId: string,
    type: NotificationType,
    message: string,
    relatedId?: string,
  ) {
    const notification = this.repo.create({
      user: { id: userId },
      type,
      message,
      relatedId,
    });
    return this.repo.save(notification);
  }

  createMany(
    userIds: string[],
    type: NotificationType,
    message: string,
    relatedId?: string,
  ) {
    const notifications = userIds.map((userId) =>
      this.repo.create({ user: { id: userId }, type, message, relatedId }),
    );
    return this.repo.save(notifications);
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, user: { id: userId } }, { read: true });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { user: { id: userId }, read: false } });
  }
}
