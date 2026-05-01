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

  if (loading) return <p className="loading-text">Cargando…</p>;
  if (!opportunity) return <p className="loading-text">Oportunidad no encontrada.</p>;

  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('es-CL')
    : null;

  return (
    <main className="page">
      <Link to="/opportunities" className="back-link">← Volver a oportunidades</Link>

      <div className="detail-card" data-testid="opportunity-detail">
        <span className={`badge badge-${opportunity.type}`}>
          {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
        </span>
        <h1 data-testid="opportunity-title">{opportunity.title}</h1>

        <div className="detail-section">
          <h3>Descripción</h3>
          <p data-testid="opportunity-description">{opportunity.description}</p>
        </div>

        {opportunity.requirements && (
          <div className="detail-section">
            <h3>Requisitos</h3>
            <p data-testid="opportunity-requirements">{opportunity.requirements}</p>
          </div>
        )}

        <div className="detail-meta">
          {deadline && (
            <span className="detail-meta-item">
              <strong>Fecha límite:</strong> {deadline}
            </span>
          )}
          <span className="detail-meta-item">
            <strong>Publicado:</strong>{' '}
            {new Date(opportunity.createdAt).toLocaleDateString('es-CL')}
          </span>
        </div>

        <div className="detail-actions">
          <Link to={`/opportunities/${opportunity.id}/edit`}>
            <button className="btn btn-secondary" data-testid="btn-edit">Editar</button>
          </Link>
          <button
            className="btn btn-danger"
            data-testid="btn-delete"
            onClick={handleDelete}
          >
            Eliminar
          </button>
        </div>
      </div>
    </main>
  );
}
