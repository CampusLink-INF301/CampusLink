import client from './client';
import { notificationsApi } from './notifications';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('notificationsApi', () => {
  it('gets all notifications', async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    await notificationsApi.getAll();

    expect(mockedClient.get).toHaveBeenCalledWith('/notifications');
  });

  it('gets unread count', async () => {
    mockedClient.get.mockResolvedValue({ data: { count: 3 } });

    const result = await notificationsApi.getUnreadCount();

    expect(mockedClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result).toBe(3);
  });

  it('marks all as read', async () => {
    mockedClient.patch.mockResolvedValue({ data: null });

    await notificationsApi.markAllRead();

    expect(mockedClient.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('marks one notification as read', async () => {
    mockedClient.patch.mockResolvedValue({ data: null });

    await notificationsApi.markRead('n-1');

    expect(mockedClient.patch).toHaveBeenCalledWith('/notifications/n-1/read');
  });
});