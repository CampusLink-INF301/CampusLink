import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationsApi } from '../../api/applications';
import { opportunitiesApi } from '../../api/opportunities';
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from '../../types/application';
import { OpportunityStatus } from '../../types/opportunity';
import type { Application } from '../../types/application';
import type { FormField } from '../../types/opportunity';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

function FormResponsesView({
  fields,
  responses,
}: {
  fields: FormField[];
  responses: Record<string, string | string[]> | null | undefined;
}) {
  if (!responses || Object.keys(responses).length === 0) return null;
  return (
    <div className="form-responses-view">
      <strong>Respuestas del formulario:</strong>
      {fields.map((field) => {
        const value = responses[field.id];
        if (value === undefined || value === null || value === '') return null;
        const display = Array.isArray(value) ? value.join(', ') : String(value);
        return (
          <div key={field.id} className="form-response-item">
            <span className="form-response-label">{field.label}:</span>{' '}
            <span className="form-response-value">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

export function OpportunityApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    if (!id) return;
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    applicationsApi
      .getByOpportunity(id)
      .then((apps) => {
        setApplications(apps);
        const fb: Record<string, string> = {};
        apps.forEach((a) => { if (a.feedback) fb[a.id] = a.feedback; });
        setFeedbacks(fb);
      })
      .catch(() => setError('No se pudieron cargar los postulantes.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const oppStatus = applications[0]?.opportunity?.status as OpportunityStatus | undefined;
  const isDisponible = oppStatus === OpportunityStatus.DISPONIBLE;
  const isEnEvaluacion =
    oppStatus === OpportunityStatus.EN_EVALUACION ||
    applications.some((a) => a.status === ApplicationStatus.EN_EVALUACION);
  const isFinalized =
    oppStatus === OpportunityStatus.FINALIZADO ||
    oppStatus === OpportunityStatus.DESIERTA ||
    applications.some(
      (a) => a.status === ApplicationStatus.ACEPTADO || a.status === ApplicationStatus.NO_SELECCIONADO,
    );
  const formFields = (applications[0]?.opportunity?.formFields ?? []) as FormField[];

  const toggleSelect = (appId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleFinalize = async () => {
    if (!id) return;
    const ok = await confirm({ title: 'Finalizar selección', message: 'Los postulantes seleccionados serán aceptados y el resto será marcado como no seleccionado. Esta acción no se puede deshacer.', confirmLabel: 'Finalizar', variant: 'warning' });
    if (!ok) return;
    setSubmitting(true);
    try {
      await applicationsApi.finalize(id, Array.from(selected));
      navigate('/my-opportunities');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al finalizar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseApplications = async () => {
    if (!id) return;
    const ok = await confirm({ title: 'Cerrar postulaciones', message: 'No se podrán recibir nuevas postulaciones. Los postulantes actuales pasarán a evaluación.', confirmLabel: 'Cerrar postulaciones', variant: 'info' });
    if (!ok) return;
    setSubmitting(true);
    try {
      await opportunitiesApi.closeApplications(id);
      const apps = await applicationsApi.getByOpportunity(id);
      setApplications(apps);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al cerrar las postulaciones.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveFeedback = async (appId: string) => {
    const feedback = feedbacks[appId] ?? '';
    setFeedbackStatus((prev) => ({ ...prev, [appId]: 'saving' }));
    try {
      await applicationsApi.setFeedback(appId, feedback);
      setFeedbackStatus((prev) => ({ ...prev, [appId]: 'saved' }));
    } catch {
      setFeedbackStatus((prev) => ({ ...prev, [appId]: 'error' }));
    }
  };

  if (loading) return <p className="loading-text">Cargando postulantes…</p>;

  return (
    <main className="page">
      <Link to="/my-opportunities" className="back-link">← Mis oportunidades</Link>
      <h1>Postulantes</h1>

      {error && <p className="form-error" role="alert">{error}</p>}

      {isDisponible && (
        <div className="info-banner" style={{ marginBottom: 16 }}>
          <p>Las postulaciones están abiertas. Puedes ver los postulantes, pero para seleccionarlos primero debes cerrar las postulaciones.</p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 8 }}
            onClick={() => void handleCloseApplications()}
            disabled={submitting}
            data-testid="btn-close-applications"
          >
            {submitting ? 'Cerrando…' : 'Cerrar postulaciones'}
          </button>
        </div>
      )}

      {applications.length === 0 && (
        <p className="loading-text">No hay postulantes para esta oportunidad.</p>
      )}

      {applications.map((app) => {
        const borderColor = app.status === ApplicationStatus.ACEPTADO
          ? '#10B981'
          : app.status === ApplicationStatus.NO_SELECCIONADO
            ? '#94A3B8'
            : undefined;
        const bgColor = app.status === ApplicationStatus.ACEPTADO
          ? '#F0FDF4'
          : app.status === ApplicationStatus.NO_SELECCIONADO
            ? '#F8FAFC'
            : undefined;
        return (
        <div key={app.id} className="card" data-testid="applicant-item" style={{
          borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
          background: bgColor,
        }}>
          <div className="card-row">
            <div className="card-content">
              <strong>{app.user?.name ?? 'Desconocido'}</strong>
              <p className="card-meta">{app.user?.email}</p>
              <span className={`badge badge-status-${app.status}`}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </span>
            </div>
            {isEnEvaluacion && (
              <div className="card-actions">
                <label className={`select-toggle${selected.has(app.id) ? ' select-toggle--active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    data-testid={`chk-${app.id}`}
                    className="select-toggle-input"
                  />
                  <span className="select-toggle-check">
                    {selected.has(app.id) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )}
                  </span>
                  <span>{selected.has(app.id) ? 'Seleccionado' : 'Seleccionar'}</span>
                </label>
              </div>
            )}
          </div>

          {formFields.length > 0 && (
            <FormResponsesView fields={formFields} responses={app.formResponses} />
          )}

          {app.status === ApplicationStatus.ACEPTADO && (
            <Link
              to={`/applications/${app.id}/chat`}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Abrir chat
            </Link>
          )}

          {isFinalized && (
            <div style={{ marginTop: 8 }}>
              <textarea
                className="input"
                rows={2}
                placeholder="Feedback para este postulante…"
                value={feedbacks[app.id] ?? ''}
                onChange={(e) => setFeedbacks((prev) => ({ ...prev, [app.id]: e.target.value }))}
                data-testid={`feedback-${app.id}`}
              />
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 4 }}
                onClick={() => void handleSaveFeedback(app.id)}
                disabled={feedbackStatus[app.id] === 'saving'}
                data-testid={`btn-save-feedback-${app.id}`}
              >
                {feedbackStatus[app.id] === 'saving' ? 'Guardando…' : 'Guardar feedback'}
              </button>
              {feedbackStatus[app.id] === 'saved' && (
                <span className="form-success" role="status" data-testid={`feedback-saved-${app.id}`}>
                  {' '}Feedback guardado.
                </span>
              )}
              {feedbackStatus[app.id] === 'error' && (
                <span className="form-error" role="alert" data-testid={`feedback-error-${app.id}`}>
                  {' '}Error al guardar el feedback.
                </span>
              )}
            </div>
          )}
        </div>
      );
      })}

      {isEnEvaluacion && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => void handleFinalize()}
          disabled={submitting}
          data-testid="btn-finalize"
        >
          {submitting ? 'Finalizando…' : 'Finalizar selección'}
        </button>
      )}
      <ConfirmModal {...confirmProps} />
    </main>
  );
}
