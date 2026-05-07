import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authApi } from '../../api/auth';
import { applicationsApi } from '../../api/applications';
import {
  APPLICATION_STATUS_LABELS,
  ApplicationStatus,
} from '../../types/application';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  OpportunityType,
} from '../../types/opportunity';
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
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<OpportunityType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    authApi
      .getMe()
      .then((userData) => setUser(userData as UserProfile))
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('No se pudo cargar el perfil. Intenta de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    applicationsApi
      .getMine({
        search: search || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
      })
      .then(setApplications)
      .catch(() => {});
  }, [search, filterType, filterStatus]);

  const handleCancelApplication = async (id: string) => {
    if (!confirm('¿Cancelar esta postulación?')) return;
    await applicationsApi.cancel(id);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: ApplicationStatus.CANCELADO } : a,
      ),
    );
  };

  if (loading) return <p className="loading-text">Cargando perfil…</p>;
  if (error) return <p className="form-error" role="alert">{error}</p>;
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Buscar por oportunidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="profile-search"
        />
        <select
          className="input"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as OpportunityType | '')}
          data-testid="profile-filter-type"
        >
          <option value="">Todos los tipos</option>
          {Object.values(OpportunityType).map((t) => (
            <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          className="input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | '')}
          data-testid="profile-filter-status"
        >
          <option value="">Todos los estados</option>
          {Object.values(ApplicationStatus).map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state" data-testid="no-applications">
          <p>Aún no has postulado a ninguna oportunidad.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/opportunities">Ver oportunidades disponibles</Link>
          </p>
        </div>
      ) : (
        <div data-testid="applications-list">
          {applications.map((app) => {
            const canCancel =
              app.status === ApplicationStatus.POSTULADO &&
              (!app.opportunity.deadline || new Date(app.opportunity.deadline) >= new Date());
            return (
              <div key={app.id} className="card" data-testid="application-item">
                <div className="card-row">
                  <div className="card-content">
                    <Link to={`/opportunities/${app.opportunity.id}`} className="card-title">
                      {app.opportunity.title}
                    </Link>
                    <p className="card-meta">
                      Postulado el {new Date(app.createdAt).toLocaleDateString('es-CL')}
                    </p>
                    <p className="card-meta">
                      Oportunidad:{' '}
                      <span className={`badge badge-status-${app.opportunity.status}`}>
                        {OPPORTUNITY_STATUS_LABELS[app.opportunity.status]}
                      </span>
                    </p>
                  </div>
                  <div className="card-actions">
                    <span className={`badge badge-status-${app.status}`} data-testid="application-status">
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                    {canCancel && (
                      <button
                        className="btn btn-sm btn-danger"
                        data-testid="btn-cancel-application"
                        onClick={() => handleCancelApplication(app.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
                {app.feedback && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f4ff', borderRadius: 6 }}>
                    <strong>Feedback:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 14 }} data-testid="application-feedback">
                      {app.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
