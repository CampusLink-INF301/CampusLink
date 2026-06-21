import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, type Notification } from '../../api/notifications';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <main className="page">
      <div className="page-header">
        <h1>Notificaciones</h1>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={() => void handleMarkAllRead()}>
            Marcar todas como leídas ({unread})
          </button>
        )}
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && notifications.length === 0 && (
        <p className="empty-state">No tienes notificaciones.</p>
      )}

      {!loading && notifications.length > 0 && (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item${n.read ? ' notification-read' : ' notification-unread'}`}
            >
              <div className="notification-message">{n.message}</div>
              <div className="notification-meta">
                {new Date(n.createdAt).toLocaleString('es-CL')}
              </div>
              {!n.read && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => void handleMarkRead(n.id)}
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
