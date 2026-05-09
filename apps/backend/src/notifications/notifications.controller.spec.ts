import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  const mockNotificationsService = {
    findForUser: jest.fn(),
    countUnread: jest.fn(),
    markAllRead: jest.fn(),
    markRead: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('returns notifications for the current user', async () => {
    mockNotificationsService.findForUser.mockResolvedValue([{ id: 'n-1' }]);

    const result = await controller.findAll({ user: { id: 'u-1', role: 'estudiante' as never } });

    expect(mockNotificationsService.findForUser).toHaveBeenCalledWith('u-1');
    expect(result).toEqual([{ id: 'n-1' }]);
  });

  it('returns unread count for the current user', async () => {
    mockNotificationsService.countUnread.mockResolvedValue(7);

    const result = await controller.unreadCount({ user: { id: 'u-1', role: 'estudiante' as never } });

    expect(mockNotificationsService.countUnread).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ count: 7 });
  });

  it('marks all notifications as read', async () => {
    mockNotificationsService.markAllRead.mockResolvedValue(undefined);

    const result = await controller.markAllRead({ user: { id: 'u-1', role: 'estudiante' as never } });

    expect(mockNotificationsService.markAllRead).toHaveBeenCalledWith('u-1');
    expect(result).toBeUndefined();
  });

  it('marks a single notification as read', async () => {
    mockNotificationsService.markRead.mockResolvedValue(undefined);

    const result = await controller.markRead('n-1', { user: { id: 'u-1', role: 'estudiante' as never } });

    expect(mockNotificationsService.markRead).toHaveBeenCalledWith('n-1', 'u-1');
    expect(result).toBeUndefined();
  });
});