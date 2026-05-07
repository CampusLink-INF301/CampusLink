import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS, OpportunityStatus } from '../../types/opportunity';
import { DeadlineWarning } from '../../components/DeadlineWarning';
import type { Opportunity } from '../../types/opportunity';

const SIXTY_MINUTES_MS = 60 * 60 * 1000;

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [applyError, setApplyError] = useState('');
  const [expired, setExpired] = useState(false);

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  const isStudent = currentUser?.role === 'estudiante';

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getById(id)
      .then(setOpportunity)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id || expired) return;
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

  const isDisponible = opportunity.status === OpportunityStatus.DISPONIBLE;
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const showDeadlineWarning =
    isDisponible &&
    opportunity.deadline &&
    new Date(opportunity.deadline).getTime() - now < SIXTY_MINUTES_MS &&
    new Date(opportunity.deadline).getTime() > now;

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
            <strong>Estado:</strong>{' '}
            <span className={`badge badge-status-${opportunity.status}`} data-testid="opportunity-status">
              {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
            </span>
          </span>
          <span className="detail-meta-item">
            <strong>Publicado:</strong>{' '}
            {new Date(opportunity.createdAt).toLocaleDateString('es-CL')}
          </span>
        </div>

        {showDeadlineWarning && (
          <DeadlineWarning
            deadline={opportunity.deadline as string | Date}
            onExpired={() => setExpired(true)}
          />
        )}

        <div className="detail-actions">
          {isLoggedIn && isStudent && (
            <div>
              {!isDisponible ? (
                <p className="form-info" data-testid="apply-unavailable">
                  Esta oportunidad ya no está disponible para postular.
                </p>
              ) : applyStatus === 'done' ? (
                <p className="form-success" data-testid="apply-success">
                  ¡Postulación enviada exitosamente!
                </p>
              ) : (
                <button
                  className="btn btn-primary"
                  data-testid="btn-apply"
                  onClick={handleApply}
                  disabled={applyStatus === 'loading' || expired}
                >
                  {applyStatus === 'loading' ? 'Postulando…' : 'Postular'}
                </button>
              )}
              {applyStatus === 'error' && (
                <p className="form-error" data-testid="apply-error">{applyError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
