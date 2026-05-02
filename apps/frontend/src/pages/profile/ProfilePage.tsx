import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { applicationsApi } from '../../api/applications';
import { APPLICATION_STATUS_LABELS } from '../../types/application';
import type { Application } from '../../types/application';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  institucion: 'Institución',
  admin: 'Administrador',
};

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    Promise.all([authApi.getMe(), applicationsApi.getMine()])
      .then(([userData, appsData]) => {
        setUser(userData as UserProfile);
        setApplications(appsData);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p className="loading-text">Cargando perfil…</p>;
  if (!user) return null;

  return (
    <main className="page">
      <h1>Mi Perfil</h1>

      <div className="detail-card" data-testid="profile-card">
        <h2>{user.name}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {ROLE_LABELS[user.role] ?? user.role}</p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Mis Postulaciones</h2>

      {applications.length === 0 ? (
        <div className="empty-state" data-testid="no-applications">
          <p>Aún no has postulado a ninguna oportunidad.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/opportunities">Ver oportunidades disponibles</Link>
          </p>
        </div>
      ) : (
        <div data-testid="applications-list">
          {applications.map((app) => (
            <div key={app.id} className="card" data-testid="application-item">
              <div className="card-row">
                <div className="card-content">
                  <Link to={`/opportunities/${app.opportunity.id}`} className="card-title">
                    {app.opportunity.title}
                  </Link>
                  <p className="card-meta">
                    Postulado el {new Date(app.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="card-actions">
                  <span className={`badge badge-status-${app.status}`} data-testid="application-status">
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
