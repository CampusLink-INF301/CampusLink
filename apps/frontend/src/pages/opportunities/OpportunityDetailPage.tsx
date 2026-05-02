import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { OPPORTUNITY_TYPE_LABELS } from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [applyError, setApplyError] = useState('');

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string } | null = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  const isPublisher = !!(currentUser && opportunity?.publisher?.id === currentUser.id);

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

  const handleApply = async () => {
    if (!id) return;
    setApplyStatus('loading');
    setApplyError('');
    try {
      await applicationsApi.apply(id);
      setApplyStatus('done');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApplyError(msg || 'Error al postular.');
      setApplyStatus('error');
    }
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
          {opportunity.publisher && (
            <span className="detail-meta-item">
              <strong>Publicado por:</strong> {opportunity.publisher.name}
            </span>
          )}
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
          {isLoggedIn && !isPublisher && (
            <div>
              {applyStatus === 'done' ? (
                <p className="form-success" data-testid="apply-success">
                  ¡Postulación enviada exitosamente!
                </p>
              ) : (
                <button
                  className="btn btn-primary"
                  data-testid="btn-apply"
                  onClick={handleApply}
                  disabled={applyStatus === 'loading'}
                >
                  {applyStatus === 'loading' ? 'Postulando…' : 'Postular'}
                </button>
              )}
              {applyStatus === 'error' && (
                <p className="form-error" data-testid="apply-error">{applyError}</p>
              )}
            </div>
          )}

          {isPublisher && (
            <>
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
