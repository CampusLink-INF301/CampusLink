import { useState } from 'react';
import type { FormField, FormFieldType } from '../types/opportunity';
import { FORM_FIELD_TYPE_LABELS } from '../types/opportunity';

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const DEFAULT_TYPE: FormFieldType = 'text_short';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
  </svg>
);
const ArrowDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="M5 12h14"/>
  </svg>
);
const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
  </svg>
);

export function FormFieldBuilder({ fields, onChange }: Props) {
  const [optionInput, setOptionInput] = useState<Record<string, string>>({});

  const addField = () => {
    onChange([
      ...fields,
      { id: makeId(), label: '', type: DEFAULT_TYPE, required: false },
    ]);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const update = (id: string, patch: Partial<FormField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...fields];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === fields.length - 1) return;
    const next = [...fields];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const addOption = (fieldId: string) => {
    const val = (optionInput[fieldId] ?? '').trim();
    if (!val) return;
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    update(fieldId, { options: [...(field.options ?? []), val] });
    setOptionInput((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const removeOption = (fieldId: string, optIdx: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    update(fieldId, {
      options: (field.options ?? []).filter((_, i) => i !== optIdx),
    });
  };

  const needsOptions = (type: FormFieldType) =>
    type === 'select_single' || type === 'select_multiple';

  return (
    <div className="fb">
      <div className="fb-header">
        <div className="fb-header-text">
          <span className="fb-title">Preguntas del formulario</span>
          <span className="fb-hint">Opcional &mdash; los postulantes las verán al aplicar</span>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addField}>
          <PlusIcon /> Agregar pregunta
        </button>
      </div>

      {fields.length === 0 && (
        <div className="fb-empty">
          Sin preguntas adicionales. Haz clic en &ldquo;Agregar pregunta&rdquo; para crear un formulario personalizado.
        </div>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="fb-field">
          <div className="fb-field-header">
            <span className="fb-grip"><GripIcon /></span>
            <span className="fb-field-number">{idx + 1}</span>
            <div className="fb-field-actions">
              <button type="button" className="fb-action-btn" onClick={() => moveUp(idx)} disabled={idx === 0} title="Subir">
                <ArrowUpIcon />
              </button>
              <button type="button" className="fb-action-btn" onClick={() => moveDown(idx)} disabled={idx === fields.length - 1} title="Bajar">
                <ArrowDownIcon />
              </button>
              <button type="button" className="fb-action-btn fb-action-btn--danger" onClick={() => removeField(field.id)} title="Eliminar pregunta">
                <TrashIcon />
              </button>
            </div>
          </div>

          <div className="fb-field-body">
            <div className="fb-field-main">
              <input
                className="form-input"
                placeholder="Escribe la pregunta..."
                value={field.label}
                onChange={(e) => update(field.id, { label: e.target.value })}
              />
            </div>

            <div className="fb-field-config">
              <div className="fb-config-item">
                <label className="fb-config-label">Tipo</label>
                <select
                  className="form-select"
                  value={field.type}
                  onChange={(e) =>
                    update(field.id, {
                      type: e.target.value as FormFieldType,
                      options: needsOptions(e.target.value as FormFieldType)
                        ? (field.options ?? [])
                        : undefined,
                    })
                  }
                >
                  {(Object.keys(FORM_FIELD_TYPE_LABELS) as FormFieldType[]).map((t) => (
                    <option key={t} value={t}>
                      {FORM_FIELD_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <label className="fb-required-toggle">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => update(field.id, { required: e.target.checked })}
                />
                <span className="fb-toggle-track">
                  <span className="fb-toggle-thumb" />
                </span>
                <span>Requerido</span>
              </label>
            </div>

            {needsOptions(field.type) && (
              <div className="fb-options">
                <label className="fb-config-label">Opciones</label>
                <div className="fb-option-chips">
                  {(field.options ?? []).map((opt, oi) => (
                    <span key={oi} className="fb-chip">
                      {opt}
                      <button type="button" onClick={() => removeOption(field.id, oi)} className="fb-chip-remove">
                        <CloseIcon />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="fb-add-option">
                  <input
                    className="form-input"
                    placeholder="Nueva opción..."
                    value={optionInput[field.id] ?? ''}
                    onChange={(e) =>
                      setOptionInput((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addOption(field.id); }
                    }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(field.id)}>
                    <PlusIcon /> Opción
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
