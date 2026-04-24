import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityCard } from '../../components/OpportunityCard';
import { SearchBar } from '../../components/SearchBar';
import type { Opportunity } from '../../types/opportunity';
import type { OpportunityType } from '../../types/opportunity';

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
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Oportunidades</h1>
        <Link to="/opportunities/new">
          <button data-testid="btn-new-opportunity">+ Nueva oportunidad</button>
        </Link>
      </div>

      <SearchBar onSearch={load} />

      {loading && <p>Cargando...</p>}
      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && opportunities.length === 0 && (
        <p data-testid="empty-message">No hay oportunidades disponibles.</p>
      )}
      {!loading && opportunities.map((o) => (
        <OpportunityCard key={o.id} opportunity={o} onDelete={handleDelete} />
      ))}
    </main>
  );
}
