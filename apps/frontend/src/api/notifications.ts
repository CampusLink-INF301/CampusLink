import client from './client';

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () =>
    client.get<Notification[]>('/notifications').then((r) => r.data),
  getUnreadCount: () =>
    client.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  markAllRead: () =>
    client.patch('/notifications/read-all'),
  markRead: (id: string) =>
    client.patch(`/notifications/${id}/read`),
};
