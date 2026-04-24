import { Link } from 'react-router-dom';
import type { Opportunity } from '../types/opportunity';
import { OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';

interface Props {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
}

export function OpportunityCard({ opportunity, onDelete }: Props) {
  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('es-CL')
    : null;

  return (
    <article
      data-testid="opportunity-card"
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: '1rem',
        marginBottom: '1rem',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              background: '#e0f0ff',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              marginBottom: 4,
              display: 'inline-block',
            }}
          >
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </span>
          <h3 style={{ margin: '4px 0' }}>
            <Link to={`/opportunities/${opportunity.id}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
              {opportunity.title}
            </Link>
          </h3>
          <p style={{ color: '#555', margin: '4px 0', fontSize: 14 }}>
            {opportunity.description.length > 120
              ? opportunity.description.slice(0, 120) + '…'
              : opportunity.description}
          </p>
          {deadline && <p style={{ fontSize: 12, color: '#888' }}>Fecha límite: {deadline}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
          <Link to={`/opportunities/${opportunity.id}/edit`}>
            <button aria-label="Editar oportunidad">Editar</button>
          </Link>
          {onDelete && (
            <button
              aria-label="Eliminar oportunidad"
              onClick={() => onDelete(opportunity.id)}
              style={{ background: '#fdd', borderColor: '#f99' }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
