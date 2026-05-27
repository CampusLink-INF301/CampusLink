import { Link } from 'react-router-dom';
import type { Opportunity } from '../types/opportunity';
import { OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  institucion: 'Institución',
  admin: 'Administrador',
};

interface Props {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
  currentUserId?: string;
}

export function OpportunityCard({ opportunity, onDelete, onClone, currentUserId }: Props) {
  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('es-CL')
    : null;

  const isOwner = !!(currentUserId && opportunity.publisher?.id === currentUserId);

  return (
    <article className="card" data-testid="opportunity-card">
      <div className="card-row">
        <div className="card-content">
          <span className={`badge badge-${opportunity.type}`}>
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </span>
          <Link to={`/opportunities/${opportunity.id}`} className="card-title">
            {opportunity.title}
          </Link>
          <p className="card-desc">
            {opportunity.description.length > 120
              ? `${opportunity.description.slice(0, 120)}…`
              : opportunity.description}
          </p>
          <p className="card-meta">
            {opportunity.publisher && (
              <>
                <span>
                  por {opportunity.publisher.name}
                  {opportunity.publisher.role && (
                    <span className={`card-meta-role card-meta-role--${opportunity.publisher.role}`}>
                      {ROLE_LABELS[opportunity.publisher.role] ?? opportunity.publisher.role}
                    </span>
                  )}
                </span>
              </>
            )}
            {opportunity.publisher && deadline && <span className="card-meta-sep">·</span>}
            {deadline && <span>Fecha límite: {deadline}</span>}
          </p>
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
    </article>
  );
}
