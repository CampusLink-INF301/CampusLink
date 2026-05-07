import { useEffect, useCallback, useRef, useState } from 'react';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityCard } from '../../components/OpportunityCard';
import { SearchBar } from '../../components/SearchBar';
import type { Opportunity, OpportunityType } from '../../types/opportunity';

const LIMIT = 20;

export function OpportunitiesListPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const activeSearch = useRef({ search: '', type: undefined as OpportunityType | undefined });

  const loadPage = useCallback(
    async (currentOffset: number, currentSearch: string, currentType?: OpportunityType) => {
      setLoading(true);
      setError('');
      try {
        const data = await opportunitiesApi.getAll({
          search: currentSearch || undefined,
          type: currentType,
          limit: LIMIT,
          offset: currentOffset,
        });
        setItems((prev) => (currentOffset === 0 ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
        setOffset(currentOffset + data.items.length);
      } catch {
        setError('Error al cargar oportunidades.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const resetAndLoad = useCallback(
    (newSearch: string, newType?: OpportunityType) => {
      activeSearch.current = { search: newSearch, type: newType };
      setItems([]);
      setOffset(0);
      setHasMore(true);
      void loadPage(0, newSearch, newType);
    },
    [loadPage],
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadPage(0, '', undefined); }, [loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const { search: s, type: t } = activeSearch.current;
          void loadPage(offset, s, t);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, offset, loadPage]);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Oportunidades</h1>
      </div>

      <SearchBar onSearch={resetAndLoad} />

      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p data-testid="empty-message">No hay oportunidades disponibles.</p>
        </div>
      )}

      {items.map((o) => (
        <OpportunityCard key={o.id} opportunity={o} />
      ))}

      {loading && <p className="loading-text">Cargando oportunidades…</p>}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </main>
  );
}
