import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS, OpportunityStatus } from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

const PAGE_SIZE = 10;

export function AdminOpportunitiesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Opportunity[]>([]);
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
      const data = await adminApi.getOpportunities({
        page: currentPage,
        search: currentSearch || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError('Error al cargar oportunidades.');
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

  const handleBlock = async (opp: Opportunity) => {
    const isBlocked = opp.status === OpportunityStatus.BLOQUEADA;
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    const ok = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} oportunidad`,
      message: isBlocked
        ? `Se desbloqueará "${opp.title}" y volverá a estar visible para los estudiantes.`
        : `Se bloqueará "${opp.title}" y dejará de ser visible para los estudiantes.`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      variant: isBlocked ? 'info' : 'danger',
    });
    if (!ok) return;
    try {
      const updated = await adminApi.blockOpportunity(opp.id, !isBlocked);
      setItems((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      setError('Error al actualizar oportunidad.');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Oportunidades (Admin)</h1>
      </div>

      <form onSubmit={handleSearch} className="admin-search-bar">
        <input
          className="input"
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="admin-opp-search"
        />
        <button type="submit" className="btn btn-primary" data-testid="admin-opp-btn-search">
          Buscar
        </button>
      </form>

      {loading && <p className="loading-text">Cargando…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="loading-text" data-testid="admin-opps-empty">No hay oportunidades.</p>
      )}

      {items.map((opp) => {
        const isBlocked = opp.status === OpportunityStatus.BLOQUEADA;
        return (
          <div key={opp.id} className="card" data-testid="admin-opp-item">
            <div className="card-row">
              <div className="card-content">
                <strong className="card-user-name">{opp.title}</strong>
                <p className="card-meta">
                  {OPPORTUNITY_TYPE_LABELS[opp.type]}
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  por {opp.publisher?.name ?? 'Desconocido'}
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span className={`badge badge-status-${opp.status}`}>
                    {OPPORTUNITY_STATUS_LABELS[opp.status]}
                  </span>
                </p>
              </div>
              <div className="card-actions">
                <button
                  className={`btn btn-sm ${isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                  onClick={() => handleBlock(opp)}
                  data-testid={`btn-block-${opp.id}`}
                >
                  {isBlocked ? 'Desbloquear' : 'Bloquear'}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => { setPage((p) => p - 1); void load(page - 1, search); }}
            data-testid="admin-opps-prev"
          >
            ← Anterior
          </button>
          <span className="pagination-info">Página {page} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => { setPage((p) => p + 1); void load(page + 1, search); }}
            data-testid="admin-opps-next"
          >
            Siguiente →
          </button>
        </div>
      )}
      <ConfirmModal {...confirmProps} />
    </main>
  );
}
