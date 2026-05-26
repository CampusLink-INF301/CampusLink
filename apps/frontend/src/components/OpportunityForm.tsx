import { useState } from 'react';
import {
  OpportunityType,
  OPPORTUNITY_TYPE_LABELS,
  ALLOWED_TYPES_BY_ROLE,
} from '../types/opportunity';
import type { CreateOpportunityPayload, FormField } from '../types/opportunity';
import { FormFieldBuilder } from './FormFieldBuilder';

interface Props {
  initial?: Partial<CreateOpportunityPayload>;
  onSubmit: (payload: CreateOpportunityPayload) => Promise<void>;
  submitLabel?: string;
}

function getCurrentUserRole(): string | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return (JSON.parse(stored) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export function OpportunityForm({ initial = {}, onSubmit, submitLabel = 'Guardar' }: Props) {
  const role = getCurrentUserRole();
  const allowedTypes: OpportunityType[] =
    (role ? ALLOWED_TYPES_BY_ROLE[role] : undefined) ?? Object.values(OpportunityType);
  const defaultType: OpportunityType = initial.type ?? allowedTypes[0] ?? OpportunityType.OTRO;

  const [title, setTitle]               = useState(initial.title ?? '');
  const [description, setDescription]   = useState(initial.description ?? '');
  const [type, setType]                 = useState<OpportunityType>(defaultType);
  const [requirements, setRequirements] = useState(initial.requirements ?? '');
  const [deadline, setDeadline]         = useState(initial.deadline?.slice(0, 10) ?? '');
  const [formFields, setFormFields]     = useState<FormField[]>(initial.formFields ?? []);
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
        formFields: formFields.length > 0 ? formFields : undefined,
      });
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMsg ?? 'Ocurrió un error. Intenta de nuevo.');
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
          {allowedTypes.map((t: OpportunityType) => (
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

      <div className="form-group">
        <FormFieldBuilder fields={formFields} onChange={setFormFields} />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} data-testid="btn-submit" className="btn btn-primary">
          {loading ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
