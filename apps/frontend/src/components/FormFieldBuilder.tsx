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
    <div className="form-builder">
      <div className="form-builder-header">
        <strong>Preguntas del formulario</strong>
        <span className="form-hint">(opcional — los postulantes las verán al aplicar)</span>
      </div>

      {fields.map((field, idx) => (
        <div key={field.id} className="form-builder-field">
          <div className="form-builder-field-row">
            <input
              className="form-input"
              placeholder="Etiqueta de la pregunta *"
              value={field.label}
              onChange={(e) => update(field.id, { label: e.target.value })}
              style={{ flex: 1 }}
            />
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
              style={{ width: 160 }}
            >
              {(Object.keys(FORM_FIELD_TYPE_LABELS) as FormFieldType[]).map((t) => (
                <option key={t} value={t}>
                  {FORM_FIELD_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <label className="form-builder-required">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => update(field.id, { required: e.target.checked })}
              />
              {' '}Requerido
            </label>
            <div className="form-builder-actions">
              <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} title="Subir">↑</button>
              <button type="button" onClick={() => moveDown(idx)} disabled={idx === fields.length - 1} title="Bajar">↓</button>
              <button type="button" onClick={() => removeField(field.id)} title="Eliminar" className="btn-danger-sm">✕</button>
            </div>
          </div>

          {needsOptions(field.type) && (
            <div className="form-builder-options">
              <div className="form-builder-option-list">
                {(field.options ?? []).map((opt, oi) => (
                  <span key={oi} className="option-chip">
                    {opt}
                    <button type="button" onClick={() => removeOption(field.id, oi)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="form-builder-add-option">
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
                  style={{ maxWidth: 220 }}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(field.id)}>
                  + Opción
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" className="btn btn-secondary btn-sm" onClick={addField}>
        + Agregar pregunta
      </button>
    </div>
  );
}
