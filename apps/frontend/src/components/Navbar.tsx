import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications';

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser
    ? JSON.parse(storedUser)
    : null;
  const isPublisher =
    currentUser?.role === 'docente' ||
    currentUser?.role === 'institucion' ||
    currentUser?.role === 'estudiante';
  const isAdmin = currentUser?.role === 'admin';

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(() => {
    if (!token || isAdmin) return;
    notificationsApi.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/opportunities" className="navbar-brand">
        CampusLink
      </Link>
      <div className="navbar-links">
        <Link to="/opportunities" className="nav-link">Oportunidades</Link>
        {token && (
          <>
            {isPublisher && (
              <>
                <Link to="/opportunities/new" className="btn btn-primary btn-sm">
                  + Publicar
                </Link>
                <Link to="/my-opportunities" className="nav-link">
                  Mis oportunidades
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/users" className="nav-link">Usuarios</Link>
                <Link to="/admin/opportunities" className="nav-link">Oportunidades (Admin)</Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link to="/notifications" className="nav-link nav-link-bell">
                  🔔
                  {unreadCount > 0 && (
                    <span className="badge-unread">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </Link>
                <Link to="/profile" className="nav-link">Mi Perfil</Link>
              </>
            )}
            <button onClick={handleLogout} className="btn btn-logout btn-sm">
              Salir
            </button>
          </>
        )}
        {!token && (
          <Link to="/login" className="nav-link">Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
