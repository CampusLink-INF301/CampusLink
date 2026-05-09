import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';

const mockNotificationRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('creates a notification for one user', async () => {
    const notification = {
      id: 'n-1',
      user: { id: 'u-1' },
      type: NotificationType.APPLICATION_RESULT,
      message: 'Resultado disponible',
      relatedId: 'app-1',
    };

    mockNotificationRepo.create.mockReturnValue(notification);
    mockNotificationRepo.save.mockResolvedValue(notification);

    const result = await service.create(
      'u-1',
      NotificationType.APPLICATION_RESULT,
      'Resultado disponible',
      'app-1',
    );

    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      user: { id: 'u-1' },
      type: NotificationType.APPLICATION_RESULT,
      message: 'Resultado disponible',
      relatedId: 'app-1',
    });
    expect(mockNotificationRepo.save).toHaveBeenCalledWith(notification);
    expect(result).toBe(notification);
  });

  it('creates notifications for many users', async () => {
    const notifications = [
      { id: 'n-1', user: { id: 'u-1' } },
      { id: 'n-2', user: { id: 'u-2' } },
    ];

    mockNotificationRepo.create
      .mockReturnValueOnce(notifications[0])
      .mockReturnValueOnce(notifications[1]);
    mockNotificationRepo.save.mockResolvedValue(notifications);

    const result = await service.createMany(
      ['u-1', 'u-2'],
      NotificationType.OPPORTUNITY_MODIFIED,
      'La oportunidad fue modificada',
      'opp-1',
    );

    expect(mockNotificationRepo.create).toHaveBeenCalledTimes(2);
    expect(mockNotificationRepo.save).toHaveBeenCalledWith(notifications);
    expect(result).toBe(notifications);
  });

  it('finds notifications for a user ordered by latest first', async () => {
    mockNotificationRepo.find.mockResolvedValue([]);

    await service.findForUser('u-1');

    expect(mockNotificationRepo.find).toHaveBeenCalledWith({
      where: { user: { id: 'u-1' } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  });

  it('marks all notifications as read', async () => {
    mockNotificationRepo.update.mockResolvedValue({ affected: 3 });

    await service.markAllRead('u-1');

    expect(mockNotificationRepo.update).toHaveBeenCalledWith(
      { user: { id: 'u-1' }, read: false },
      { read: true },
    );
  });

  it('marks a notification as read', async () => {
    mockNotificationRepo.update.mockResolvedValue({ affected: 1 });

    await service.markRead('n-1', 'u-1');

    expect(mockNotificationRepo.update).toHaveBeenCalledWith(
      { id: 'n-1', user: { id: 'u-1' } },
      { read: true },
    );
  });

  it('counts unread notifications for a user', async () => {
    mockNotificationRepo.count.mockResolvedValue(4);

    const result = await service.countUnread('u-1');

    expect(mockNotificationRepo.count).toHaveBeenCalledWith({
      where: { user: { id: 'u-1' }, read: false },
    });
    expect(result).toBe(4);
  });
});