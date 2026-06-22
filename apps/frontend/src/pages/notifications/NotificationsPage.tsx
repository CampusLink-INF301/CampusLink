import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi, type Notification } from '../../api/notifications';

function getNotificationLink(n: Notification): string | null {
  if (!n.relatedId) return null;
  switch (n.type) {
    case 'application_feedback':
    case 'application_result':
      return '/profile';
    case 'application_submitted':
      return `/my-opportunities/${n.relatedId}/applicants`;
    case 'new_message':
      return `/applications/${n.relatedId}/chat`;
    case 'opportunity_modified':
      return `/opportunities/${n.relatedId}`;
    default:
      return null;
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
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
    window.dispatchEvent(new Event('notifications:read'));
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    window.dispatchEvent(new Event('notifications:read'));
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
          {notifications.map((n) => {
            const link = getNotificationLink(n);
            return (
              <li
                key={n.id}
                className={`notification-item${n.read ? ' notification-read' : ' notification-unread'}${link ? ' notification-clickable' : ''}`}
                onClick={link ? () => {
                  if (!n.read) void handleMarkRead(n.id);
                  navigate(link);
                } : undefined}
              >
                <div className="notification-body">
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-meta">
                    {new Date(n.createdAt).toLocaleString('es-CL')}
                  </div>
                </div>
                <div className="notification-actions">
                  {!n.read && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={(e) => { e.stopPropagation(); void handleMarkRead(n.id); }}
                    >
                      Marcar como leída
                    </button>
                  )}
                  {link && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notification-arrow">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
