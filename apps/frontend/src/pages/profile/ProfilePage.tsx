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

interface AppStats {
  total: number;
  aceptadas: number;
  pendientes: number;
  rechazadas: number;
}

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
  const [applicationsError, setApplicationsError] = useState('');

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const [stats, setStats] = useState<AppStats | null>(null);

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
      .then((userData) => {
        setUser(userData as UserProfile);
        setEditName((userData as UserProfile).name);
      })
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
    const storedUser = localStorage.getItem('user');
    const role = storedUser ? (JSON.parse(storedUser) as { role: string }).role : null;
    if (role !== 'estudiante') return;
    applicationsApi.getStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setApplicationsError('');
    applicationsApi
      .getMine({
        search: search || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
      })
      .then(setApplications)
      .catch(() => setApplicationsError('No se pudieron cargar las postulaciones.'));
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const payload: { name?: string; currentPassword?: string; newPassword?: string } = {};
    if (editName.trim() && editName.trim() !== user?.name) payload.name = editName.trim();
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }
    if (!payload.name && !payload.newPassword) {
      setEditError('No hay cambios para guardar.');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await authApi.updateMe(payload);
      setUser((prev) => prev ? { ...prev, name: updated.name } : prev);
      // sync localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        localStorage.setItem('user', JSON.stringify({ ...parsed, name: updated.name }));
      }
      setEditSuccess('Perfil actualizado correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setEditing(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEditError(msg ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditName(user?.name ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setEditError('');
    setEditSuccess('');
  };

  if (loading) return <p className="loading-text">Cargando perfil…</p>;
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!user) return null;

  return (
    <main className="page">
      <div className="page-header">
        <h1>Mi Perfil</h1>
      </div>

      {/* Profile header card */}
      <div className="profile-header" data-testid="profile-card">
        <div className="profile-header-top">
          <div>
            <h2>{user.name}</h2>
            <div className="profile-meta">
              <span className="profile-meta-item"><strong>Email:</strong> {user.email}</span>
              <span className="profile-meta-item"><strong>Rol:</strong> {ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
          </div>
          {!editing && (
            <button
              className="btn-edit-profile"
              onClick={() => { setEditing(true); setEditSuccess(''); }}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              Editar perfil
            </button>
          )}
        </div>

        {editSuccess && !editing && (
          <p className="profile-success">{editSuccess}</p>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="profile-edit-card">
          <h3>Editar perfil</h3>
          <form onSubmit={handleEditSubmit} className="form" style={{ marginTop: '1rem' }}>
            {editError && <p className="form-error" role="alert">{editError}</p>}

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre"
                data-testid="edit-name"
              />
            </div>

            <div className="profile-edit-divider">
              <span>Cambiar contraseña <span>(opcional)</span></span>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña actual</label>
              <input
                className="form-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                data-testid="edit-current-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva contraseña <span>(mín. 8 caracteres, mayúscula, número y símbolo)</span></label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                data-testid="edit-new-password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={editLoading} data-testid="btn-save-profile">
                {editLoading ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {stats && (
        <div className="app-stats" data-testid="app-stats">
          <div className="app-stat">
            <span className="app-stat-value">{stats.total}</span>
            <span className="app-stat-label">Total</span>
          </div>
          <div className="app-stat app-stat--accepted">
            <span className="app-stat-value">{stats.aceptadas}</span>
            <span className="app-stat-label">Aceptadas</span>
          </div>
          <div className="app-stat app-stat--pending">
            <span className="app-stat-value">{stats.pendientes}</span>
            <span className="app-stat-label">Pendientes</span>
          </div>
          <div className="app-stat app-stat--rejected">
            <span className="app-stat-value">{stats.rechazadas}</span>
            <span className="app-stat-label">No seleccionadas</span>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h2>Mis Postulaciones</h2>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Buscar por oportunidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="profile-search"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
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

      {applicationsError && (
        <p className="form-error" role="alert" data-testid="applications-error">{applicationsError}</p>
      )}

      {!applicationsError && applications.length === 0 && (
        <div className="empty-state" data-testid="no-applications">
          <p>Aún no has postulado a ninguna oportunidad.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/opportunities">Ver oportunidades disponibles</Link>
          </p>
        </div>
      )}

      {!applicationsError && applications.length > 0 && (
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
                    {app.status === ApplicationStatus.ACEPTADO && (
                      <Link
                        to={`/applications/${app.id}/chat`}
                        className="btn btn-sm btn-primary"
                        data-testid="btn-chat"
                      >
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginRight: 4 }}>
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                        Chat
                      </Link>
                    )}
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
                  <div className="feedback-box">
                    <strong>Feedback</strong>
                    <p data-testid="application-feedback">{app.feedback}</p>
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
