import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS, OpportunityStatus } from '../../types/opportunity';
import { APPLICATION_STATUS_LABELS } from '../../types/application';
import type { Application } from '../../types/application';
import { DeadlineWarning } from '../../components/DeadlineWarning';
import { FormFiller } from '../../components/FormFiller';
import type { Opportunity, FormField } from '../../types/opportunity';

const SIXTY_MINUTES_MS = 60 * 60 * 1000;

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'filling' | 'loading' | 'done' | 'error'>('idle');
  const [applyError, setApplyError] = useState('');
  const [expired, setExpired] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, string | string[]>>({});
  const [existingApp, setExistingApp] = useState<Application | null>(null);

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; role: string } | null = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  const isStudent = currentUser?.role === 'estudiante';
  const isOwner = !!(currentUser?.id && opportunity?.publisher?.id === currentUser.id);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getById(id)
      .then(setOpportunity)
      .finally(() => setLoading(false));

    if (isStudent && isLoggedIn) {
      applicationsApi.getMine().then((apps) => {
        const match = apps.find((a) => a.opportunity?.id === id);
        if (match) {
          setExistingApp(match);
          setApplyStatus('done');
        }
      }).catch(() => {});
    }
  }, [id]);

  const hasForm = (opp: Opportunity) =>
    Array.isArray(opp.formFields) && opp.formFields.length > 0;

  const handleApplyClick = () => {
    if (!opportunity || expired) return;
    if (hasForm(opportunity)) {
      setApplyStatus('filling');
    } else {
      void handleSubmitApply({});
    }
  };

  const handleSubmitApply = async (responses: Record<string, string | string[]>) => {
    if (!id || expired) return;
    setApplyStatus('loading');
    setApplyError('');
    try {
      await applicationsApi.apply(id, Object.keys(responses).length > 0 ? responses : undefined);
      setApplyStatus('done');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApplyError(msg || 'Error al postular.');
      setApplyStatus('error');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmitApply(formResponses);
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

  const formFields = (opportunity.formFields ?? []) as FormField[];

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
          {isLoggedIn && isStudent && !isOwner && (
            <div>
              {!isDisponible ? (
                <p className="form-info" data-testid="apply-unavailable">
                  Esta oportunidad ya no está disponible para postular.
                </p>
              ) : applyStatus === 'done' ? (
                <div className="apply-status-card" data-testid="apply-success">
                  <div className="apply-status-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="apply-status-text">
                    <strong>Ya postulaste a esta oportunidad</strong>
                    {existingApp && (
                      <span className="apply-status-detail">
                        Estado: <span className={`badge badge-status-${existingApp.status}`}>
                          {APPLICATION_STATUS_LABELS[existingApp.status]}
                        </span>
                        {existingApp.feedback && (
                          <> &middot; <Link to="/profile">Ver feedback</Link></>
                        )}
                        {existingApp.status === 'aceptado' && (
                          <> &middot; <Link to={`/applications/${existingApp.id}/chat`}>Ir al chat</Link></>
                        )}
                      </span>
                    )}
                    {!existingApp && <span>¡Postulación enviada exitosamente!</span>}
                  </div>
                </div>
              ) : applyStatus === 'filling' ? (
                <form onSubmit={handleFormSubmit} className="apply-form">
                  <h3>Completa el formulario de postulación</h3>
                  <FormFiller
                    fields={formFields}
                    responses={formResponses}
                    onChange={setFormResponses}
                  />
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setApplyStatus('idle')}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={expired}
                    >
                      Enviar postulación
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="btn btn-primary"
                  data-testid="btn-apply"
                  onClick={handleApplyClick}
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
