import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotificationsPage } from './NotificationsPage';
import { notificationsApi } from '../../api/notifications';

jest.mock('../../api/notifications', () => ({
  notificationsApi: {
    getAll: jest.fn(),
    getUnreadCount: jest.fn(),
    markAllRead: jest.fn(),
    markRead: jest.fn(),
  },
}));

const mockedApi = notificationsApi as jest.Mocked<typeof notificationsApi>;

const notifications = [
  { id: 'n1', type: 'x', message: 'Hola', read: false, relatedId: null, createdAt: '2026-05-08T00:00:00Z' },
  { id: 'n2', type: 'x', message: 'Leída', read: true, relatedId: null, createdAt: '2026-05-08T00:00:00Z' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getAll.mockResolvedValue(notifications as never);
  mockedApi.markAllRead.mockResolvedValue(undefined as never);
  mockedApi.markRead.mockResolvedValue(undefined as never);
});

describe('NotificationsPage', () => {
  it('renders unread count and marks all as read', async () => {
    render(<NotificationsPage />);

    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /marcar todas como leídas/i }));

    await waitFor(() => expect(mockedApi.markAllRead).toHaveBeenCalled());
  });

  it('marks a single notification as read', async () => {
    render(<NotificationsPage />);

    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /marcar como leída/i }));

    await waitFor(() => expect(mockedApi.markRead).toHaveBeenCalledWith('n1'));
  });
});