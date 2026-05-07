import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationsApi } from '../../api/applications';
import { APPLICATION_STATUS_LABELS } from '../../types/application';
import { OpportunityStatus } from '../../types/opportunity';
import type { Application } from '../../types/application';

export function OpportunityApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
  const isEnEvaluacion = oppStatus === OpportunityStatus.EN_EVALUACION;
  const isFinalized = oppStatus === OpportunityStatus.FINALIZADO || oppStatus === OpportunityStatus.DESIERTA;

  const toggleSelect = (appId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleFinalize = async () => {
    if (!id || !confirm('¿Finalizar la selección? Esta acción no se puede deshacer.')) return;
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

  const handleSaveFeedback = async (appId: string) => {
    const feedback = feedbacks[appId] ?? '';
    await applicationsApi.setFeedback(appId, feedback);
  };

  if (loading) return <p className="loading-text">Cargando postulantes…</p>;

  return (
    <main className="page">
      <Link to="/my-opportunities" className="back-link">← Mis oportunidades</Link>
      <h1>Postulantes</h1>

      {error && <p className="form-error" role="alert">{error}</p>}

      {applications.length === 0 && (
        <p className="loading-text">No hay postulantes para esta oportunidad.</p>
      )}

      {applications.map((app) => (
        <div key={app.id} className="card" data-testid="applicant-item">
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
                <label>
                  <input
                    type="checkbox"
                    checked={selected.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    data-testid={`chk-${app.id}`}
                  />
                  {' '}Seleccionar
                </label>
              </div>
            )}
          </div>
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
                onClick={() => handleSaveFeedback(app.id)}
                data-testid={`btn-save-feedback-${app.id}`}
              >
                Guardar feedback
              </button>
            </div>
          )}
        </div>
      ))}

      {isEnEvaluacion && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={handleFinalize}
          disabled={submitting}
          data-testid="btn-finalize"
        >
          {submitting ? 'Finalizando…' : 'Finalizar selección'}
        </button>
      )}
    </main>
  );
}
