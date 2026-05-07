import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { opportunitiesApi, PublisherHistoryQuery } from '../../api/opportunities';
import { OpportunityCard } from '../../components/OpportunityCard';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  OpportunityType,
  OpportunityStatus,
} from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';

const PAGE_SIZE = 10;

export function PublisherHistoryPage() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser ? JSON.parse(storedUser) : null;

  const [items, setItems] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<OpportunityType | ''>('');
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadline' | 'status'>('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  const load = useCallback(
    async (currentPage: number) => {
      if (!localStorage.getItem('token')) { navigate('/login'); return; }
      setLoading(true);
      setError('');
      try {
        const query: PublisherHistoryQuery = {
          page: currentPage,
          sortBy,
          sortDir,
        };
        if (search) query.search = search;
        if (filterType) query.type = filterType;
        if (filterStatus) query.status = filterStatus;
        const data = await opportunitiesApi.getMine(query);
        setItems(data.items);
        setTotal(data.total);
      } catch {
        setError('Error al cargar tus oportunidades.');
      } finally {
        setLoading(false);
      }
    },
    [search, filterType, filterStatus, sortBy, sortDir, navigate],
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(page); }, [load, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
    setSortBy('createdAt');
    setSortDir('DESC');
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta oportunidad?')) return;
    await opportunitiesApi.remove(id);
    void load(page);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="page">
      <h1>Mis oportunidades</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="history-search"
        />
        <select
          className="input"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as OpportunityType | '')}
          data-testid="history-filter-type"
        >
          <option value="">Todos los tipos</option>
          {Object.values(OpportunityType).map((t) => (
            <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          className="input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OpportunityStatus | '')}
          data-testid="history-filter-status"
        >
          <option value="">Todos los estados</option>
          {Object.values(OpportunityStatus).map((s) => (
            <option key={s} value={s}>{OPPORTUNITY_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          className="input"
          value={`${sortBy}:${sortDir}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split(':') as ['createdAt' | 'deadline' | 'status', 'ASC' | 'DESC'];
            setSortBy(by);
            setSortDir(dir);
          }}
          data-testid="history-sort"
        >
          <option value="createdAt:DESC">Más recientes</option>
          <option value="createdAt:ASC">Más antiguas</option>
          <option value="deadline:ASC">Fecha límite próxima</option>
          <option value="deadline:DESC">Fecha límite lejana</option>
          <option value="status:ASC">Estado A-Z</option>
        </select>
        <button type="submit" className="btn btn-primary" data-testid="history-btn-search">Buscar</button>
        <button type="button" className="btn btn-secondary" onClick={handleClearFilters} data-testid="history-btn-clear">Limpiar</button>
      </form>

      {loading && <p className="loading-text">Cargando…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="empty-state" data-testid="history-empty">
          <p>No tienes oportunidades publicadas.</p>
        </div>
      )}

      {!loading && items.map((o) => (
        <div key={o.id}>
          <OpportunityCard
            opportunity={o}
            currentUserId={currentUser?.id}
            onDelete={handleDelete}
          />
          {[OpportunityStatus.EN_EVALUACION, OpportunityStatus.FINALIZADO, OpportunityStatus.DESIERTA].includes(o.status) && (
            <div style={{ marginTop: -8, marginBottom: 12, paddingLeft: 4 }}>
              <Link
                to={`/my-opportunities/${o.id}/applicants`}
                className="btn btn-secondary btn-sm"
                data-testid={`link-applicants-${o.id}`}
              >
                Ver postulantes
              </Link>
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            data-testid="history-prev"
          >
            ← Anterior
          </button>
          <span style={{ lineHeight: '36px' }}>Página {page} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            data-testid="history-next"
          >
            Siguiente →
          </button>
        </div>
      )}
    </main>
  );
}
