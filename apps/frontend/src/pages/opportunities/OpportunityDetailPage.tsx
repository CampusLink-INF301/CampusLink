import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { OPPORTUNITY_TYPE_LABELS } from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getById(id)
      .then(setOpportunity)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('¿Eliminar esta oportunidad?')) return;
    await opportunitiesApi.remove(id);
    navigate('/opportunities');
  };

  if (loading) return <p>Cargando...</p>;
  if (!opportunity) return <p>Oportunidad no encontrada.</p>;

  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('es-CL')
    : 'Sin fecha límite';

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
      <Link to="/opportunities">← Volver</Link>
      <article data-testid="opportunity-detail" style={{ marginTop: '1rem' }}>
        <span style={{ background: '#e0f0ff', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
          {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
        </span>
        <h1 data-testid="opportunity-title" style={{ marginTop: 8 }}>{opportunity.title}</h1>
        <p data-testid="opportunity-description">{opportunity.description}</p>
        {opportunity.requirements && (
          <section>
            <h3>Requisitos</h3>
            <p data-testid="opportunity-requirements">{opportunity.requirements}</p>
          </section>
        )}
        <p><strong>Fecha límite:</strong> {deadline}</p>
        <p style={{ color: '#888', fontSize: 12 }}>
          Publicado: {new Date(opportunity.createdAt).toLocaleDateString('es-CL')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
          <Link to={`/opportunities/${opportunity.id}/edit`}>
            <button data-testid="btn-edit">Editar</button>
          </Link>
          <button
            data-testid="btn-delete"
            onClick={handleDelete}
            style={{ background: '#fdd', borderColor: '#f99' }}
          >
            Eliminar
          </button>
        </div>
      </article>
    </main>
  );
}
