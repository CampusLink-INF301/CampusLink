import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityCard } from '../../components/OpportunityCard';
import { SearchBar } from '../../components/SearchBar';
import type { Opportunity, OpportunityType } from '../../types/opportunity';

export function OpportunitiesListPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (search?: string, type?: OpportunityType) => {
    setLoading(true);
    setError('');
    try {
      const data = await opportunitiesApi.getAll({ search, type });
      setOpportunities(data);
    } catch {
      setError('Error al cargar oportunidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oportunidad?')) return;
    await opportunitiesApi.remove(id);
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1>Oportunidades</h1>
        <Link to="/opportunities/new" className="btn btn-primary" data-testid="btn-new-opportunity">
          + Nueva oportunidad
        </Link>
      </div>

      <SearchBar onSearch={load} />

      {loading && <p className="loading-text">Cargando oportunidades…</p>}

      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && opportunities.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p data-testid="empty-message">No hay oportunidades disponibles.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/opportunities/new">Publica la primera oportunidad</Link>
          </p>
        </div>
      )}

      {!loading && opportunities.map((o) => (
        <OpportunityCard key={o.id} opportunity={o} onDelete={handleDelete} />
      ))}
    </main>
  );
}
