import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { AdminUser } from '../../api/admin';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

const PAGE_SIZE = 10;

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  institucion: 'Institución',
  admin: 'Administrador',
};

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { confirm, confirmProps } = useConfirm();

  const load = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getUsers({
        page: currentPage,
        search: currentSearch || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const currentUser: { role: string } | null = storedUser ? JSON.parse(storedUser) : null;
    if (!localStorage.getItem('token') || currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1, '');
  }, [navigate, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load(1, search);
  };

  const handleSuspend = async (user: AdminUser) => {
    const action = user.suspended ? 'reactivar' : 'suspender';
    const ok = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      message: user.suspended
        ? `Se reactivará la cuenta de ${user.name} y podrá volver a usar la plataforma.`
        : `Se suspenderá a ${user.name}. No podrá acceder a la plataforma hasta ser reactivado.`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      variant: user.suspended ? 'info' : 'danger',
    });
    if (!ok) return;
    try {
      const updated = await adminApi.suspendUser(user.id, !user.suspended);
      setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      setError('Error al actualizar usuario.');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Usuarios</h1>
      </div>

      <form onSubmit={handleSearch} className="admin-search-bar">
        <input
          className="input"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="admin-user-search"
        />
        <button type="submit" className="btn btn-primary" data-testid="admin-user-btn-search">
          Buscar
        </button>
      </form>

      {loading && <p className="loading-text">Cargando…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="loading-text" data-testid="admin-users-empty">No hay usuarios.</p>
      )}

      {items.map((user) => (
        <div key={user.id} className="card" data-testid="admin-user-item">
          <div className="card-row">
            <div className="card-content">
              <span className="card-user-name">{user.name}</span>
              <p className="card-meta">{user.email} · {ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
            <div className="card-actions">
              {user.suspended && (
                <span className="badge badge-status-cancelado">Suspendido</span>
              )}
              <button
                className={`btn btn-sm ${user.suspended ? 'btn-secondary' : 'btn-danger'}`}
                onClick={() => { void handleSuspend(user); }}
                data-testid={`btn-suspend-${user.id}`}
              >
                {user.suspended ? 'Reactivar' : 'Suspender'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => { const prev = page - 1; setPage(prev); void load(prev, search); }}
            data-testid="admin-users-prev"
          >
            ← Anterior
          </button>
          <span className="pagination-info">Página {page} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => { const next = page + 1; setPage(next); void load(next, search); }}
            data-testid="admin-users-next"
          >
            Siguiente →
          </button>
        </div>
      )}
      <ConfirmModal {...confirmProps} />
    </main>
  );
}
