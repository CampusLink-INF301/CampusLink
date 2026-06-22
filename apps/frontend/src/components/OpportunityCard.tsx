import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Opportunity } from '../types/opportunity';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS, OpportunityStatus } from '../types/opportunity';
import { APPLICATION_STATUS_LABELS } from '../types/application';
import type { ApplicationStatus } from '../types/application';

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  institucion: 'Institución',
  admin: 'Administrador',
};

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  const days = Math.abs(diff);
  if (days === 0) return 'Publicado hoy';
  if (days === 1) return diff > 0 ? 'Publicado ayer' : 'Publicado mañana';
  if (days < 7) return `Publicado hace ${days} días`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `Publicado hace ${w} sem.`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `Publicado hace ${m} ${m === 1 ? 'mes' : 'meses'}`;
  }
  const y = Math.floor(days / 365);
  return `Publicado hace ${y} ${y === 1 ? 'año' : 'años'}`;
}

interface Props {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
  currentUserId?: string;
  isSaved?: boolean;
  onToggleSave?: (id: string, currentlySaved: boolean) => Promise<void>;
  appliedStatus?: ApplicationStatus;
}

export function OpportunityCard({
  opportunity,
  onDelete,
  onClone,
  currentUserId,
  isSaved = false,
  onToggleSave,
  appliedStatus,
}: Props) {
  const [saved, setSaved] = useState(isSaved);
  const [savingInProgress, setSavingInProgress] = useState(false);

  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('es-CL')
    : null;

  const isOwner = !!(currentUserId && opportunity.publisher?.id === currentUserId);
  const isDisponible = opportunity.status === OpportunityStatus.DISPONIBLE;

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (savingInProgress || !onToggleSave) return;
    setSavingInProgress(true);
    const next = !saved;
    setSaved(next);
    try {
      await onToggleSave(opportunity.id, saved);
    } catch {
      setSaved(!next);
    } finally {
      setSavingInProgress(false);
    }
  };

  return (
    <article className="card" data-testid="opportunity-card">
      <div className="card-row">
        <div className="card-content">

          {/* Header: tipo + estado + fecha + guardar */}
          <div className="card-header-row">
            <span className={`badge badge-${opportunity.type}`}>
              {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
            </span>
            <span className={`badge badge-status-${opportunity.status}`}>
              {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
            </span>
            {appliedStatus && (
              <span className="card-applied-badge" data-testid="applied-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                {APPLICATION_STATUS_LABELS[appliedStatus]}
              </span>
            )}
            <span className="card-date">{relativeDate(opportunity.createdAt)}</span>
            {onToggleSave && !isOwner && (
              <button
                className={`btn-save${saved ? ' btn-save--active' : ''}`}
                onClick={handleToggleSave}
                aria-label={saved ? 'Quitar de guardados' : 'Guardar oportunidad'}
                title={saved ? 'Quitar de guardados' : 'Guardar'}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={saved ? '0' : '1.5'} aria-hidden="true">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Título */}
          <Link to={`/opportunities/${opportunity.id}`} className="card-title">
            {opportunity.title}
          </Link>

          {/* Descripción */}
          <p className="card-desc">
            {opportunity.description.length > 120
              ? `${opportunity.description.slice(0, 120)}…`
              : opportunity.description}
          </p>

          {/* Footer */}
          <div className="card-footer">
            <div className="card-footer-meta">
              {opportunity.publisher && (
                <span className="card-footer-publisher">
                  {opportunity.publisher.name}
                  {opportunity.publisher.role && (
                    <span className={`card-meta-role card-meta-role--${opportunity.publisher.role}`}>
                      {ROLE_LABELS[opportunity.publisher.role] ?? opportunity.publisher.role}
                    </span>
                  )}
                </span>
              )}
              {deadline && (
                <>
                  {opportunity.publisher && <span className="card-footer-dot">·</span>}
                  <span className={`card-deadline${!isDisponible ? ' card-deadline--muted' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                    Fecha límite: {deadline}
                  </span>
                </>
              )}
            </div>

            {isOwner && (
              <div className="card-actions">
                <Link to={`/opportunities/${opportunity.id}/edit`}>
                  <button className="btn btn-secondary btn-sm" aria-label="Editar oportunidad">
                    Editar
                  </button>
                </Link>
                {onClone && (
                  <button
                    className="btn btn-secondary btn-sm"
                    aria-label="Clonar oportunidad"
                    onClick={() => onClone(opportunity.id)}
                  >
                    Clonar
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-danger btn-sm"
                    aria-label="Eliminar oportunidad"
                    onClick={() => onDelete(opportunity.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}
