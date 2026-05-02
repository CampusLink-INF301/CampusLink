import { Link } from 'react-router-dom';
import type { Opportunity } from '../types/opportunity';
import { OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';

interface Props {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

export function OpportunityCard({ opportunity, onDelete, currentUserId }: Props) {
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
          {deadline && (
            <p className="card-meta">Fecha límite: {deadline}</p>
          )}
        </div>
        {isOwner && (
          <div className="card-actions">
            <Link to={`/opportunities/${opportunity.id}/edit`}>
              <button className="btn btn-secondary btn-sm" aria-label="Editar oportunidad">
                Editar
              </button>
            </Link>
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
