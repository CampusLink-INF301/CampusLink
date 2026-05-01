import { useState } from 'react';
import { OpportunityType, OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';
import type { CreateOpportunityPayload } from '../types/opportunity';

interface Props {
  initial?: Partial<CreateOpportunityPayload>;
  onSubmit: (payload: CreateOpportunityPayload) => Promise<void>;
  submitLabel?: string;
}

export function OpportunityForm({ initial = {}, onSubmit, submitLabel = 'Guardar' }: Props) {
  const [title, setTitle]               = useState(initial.title ?? '');
  const [description, setDescription]   = useState(initial.description ?? '');
  const [type, setType]                 = useState<OpportunityType>(initial.type ?? OpportunityType.OTRO);
  const [requirements, setRequirements] = useState(initial.requirements ?? '');
  const [deadline, setDeadline]         = useState(initial.deadline?.slice(0, 10) ?? '');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        type,
        requirements: requirements || undefined,
        deadline: deadline || undefined,
      });
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-group">
        <label className="form-label">Título *</label>
        <input
          className="form-input"
          data-testid="input-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: Tutoría de Cálculo II"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tipo *</label>
        <select
          className="form-select"
          data-testid="select-type"
          value={type}
          onChange={(e) => setType(e.target.value as OpportunityType)}
          required
        >
          {Object.values(OpportunityType).map((t) => (
            <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Descripción *</label>
        <textarea
          className="form-textarea"
          data-testid="input-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="Describe la oportunidad en detalle..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Requisitos <span>(opcional)</span>
        </label>
        <textarea
          className="form-textarea"
          data-testid="input-requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={2}
          placeholder="Requisitos opcionales..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Fecha límite <span>(opcional)</span>
        </label>
        <input
          className="form-input"
          data-testid="input-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ maxWidth: 200 }}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} data-testid="btn-submit" className="btn btn-primary">
          {loading ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
