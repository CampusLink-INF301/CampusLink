import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { savedApi } from '../../api/saved';
import { OpportunityCard } from '../../components/OpportunityCard';
import { SearchBar } from '../../components/SearchBar';
import type { Opportunity, OpportunityType } from '../../types/opportunity';
import type { ApplicationStatus } from '../../types/application';

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

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  const isStudent = currentUser?.role === 'estudiante';

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedMap, setAppliedMap] = useState<Map<string, ApplicationStatus>>(new Map());

  useEffect(() => {
    if (!isStudent) return;
    savedApi.getIds().then((ids) => setSavedIds(new Set(ids))).catch(() => {});
    applicationsApi.getMine().then((apps) => {
      const map = new Map<string, ApplicationStatus>();
      apps.forEach((a) => { if (a.opportunity?.id) map.set(a.opportunity.id, a.status); });
      setAppliedMap(map);
    }).catch(() => {});
  }, [isStudent]);

  const handleToggleSave = async (id: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      await savedApi.unsave(id);
      setSavedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } else {
      await savedApi.save(id);
      setSavedIds((prev) => new Set([...prev, id]));
    }
  };

  return (
    <main className="page">
      <div className="page-hero page-hero--landing">
        <p className="hero-eyebrow">Plataforma universitaria de oportunidades</p>
        <h1>Tutorías, prácticas, ayudantías y más en un solo lugar</h1>
        <p className="hero-subtitle">
          Estudiantes encuentran oportunidades relevantes. Docentes e instituciones
          las publican y gestionan. Todo en CampusLink.
        </p>

        <div className="hero-chips">
          <span className="hero-chip">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"/>
            </svg>
            Publica oportunidades
          </span>
          <span className="hero-chip">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            Explora y filtra
          </span>
          <span className="hero-chip">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
            Postula en un clic
          </span>
          <span className="hero-chip">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            Notificaciones en tiempo real
          </span>
        </div>

        {!isLoggedIn && (
          <div className="hero-cta">
            <Link to="/register" className="btn-hero-primary">Crear cuenta gratis</Link>
            <Link to="/login" className="btn-hero-outline">Ingresar</Link>
          </div>
        )}
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
        <OpportunityCard
          key={o.id}
          opportunity={o}
          currentUserId={currentUser?.id}
          isSaved={savedIds.has(o.id)}
          onToggleSave={isStudent ? handleToggleSave : undefined}
          appliedStatus={appliedMap.get(o.id)}
        />
      ))}

      {loading && <p className="loading-text">Cargando oportunidades…</p>}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </main>
  );
}
