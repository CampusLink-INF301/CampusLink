import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { savedApi } from '../../api/saved';
import { OpportunityCard } from '../../components/OpportunityCard';
import type { Opportunity } from '../../types/opportunity';

export function SavedPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    savedApi
      .getMine()
      .then(setItems)
      .catch(() => setError('No se pudieron cargar las oportunidades guardadas.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const handleToggleSave = useCallback(async (id: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      await savedApi.unsave(id);
      setItems((prev) => prev.filter((o) => o.id !== id));
    } else {
      await savedApi.save(id);
    }
  }, []);

  if (loading) return <p className="loading-text">Cargando guardados…</p>;

  return (
    <main className="page">
      <div className="page-header">
        <h1>Oportunidades guardadas</h1>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!error && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
          </div>
          <p>Aún no has guardado ninguna oportunidad.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/opportunities">Explorar oportunidades</Link>
          </p>
        </div>
      )}

      {items.map((o) => (
        <OpportunityCard
          key={o.id}
          opportunity={o}
          currentUserId={currentUser?.id}
          isSaved={true}
          onToggleSave={handleToggleSave}
        />
      ))}
    </main>
  );
}
