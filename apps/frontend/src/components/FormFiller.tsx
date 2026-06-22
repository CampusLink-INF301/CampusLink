import type { ReactNode } from 'react';
import type { FormField } from '../types/opportunity';
import { FORM_FIELD_TYPE_LABELS } from '../types/opportunity';

interface Props {
  fields: FormField[];
  responses: Record<string, string | string[]>;
  onChange: (responses: Record<string, string | string[]>) => void;
}

const FieldTypeIcons: Record<string, ReactNode> = {
  text_short: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>
    </svg>
  ),
  text_long: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 6H3"/><path d="M21 12H3"/><path d="M15.5 18H3"/>
    </svg>
  ),
  number: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3 14 21"/>
    </svg>
  ),
  date: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
    </svg>
  ),
  select_single: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/>
    </svg>
  ),
  select_multiple: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
};

export function FormFiller({ fields, responses, onChange }: Props) {
  const set = (id: string, value: string | string[]) => {
    onChange({ ...responses, [id]: value });
  };

  const toggleMulti = (id: string, option: string) => {
    const current = (responses[id] as string[] | undefined) ?? [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    set(id, next);
  };

  return (
    <div className="ff">
      {fields.map((field, idx) => (
        <div key={field.id} className="ff-field">
          <div className="ff-label-row">
            <span className="ff-number">{idx + 1}</span>
            <label className="ff-label">
              {field.label}
              {field.required && <span className="ff-required">*</span>}
            </label>
            <span className="ff-type-hint">
              {FieldTypeIcons[field.type]}
              {FORM_FIELD_TYPE_LABELS[field.type]}
            </span>
          </div>

          <div className="ff-input-area">
            {field.type === 'text_short' && (
              <input
                className="form-input"
                placeholder="Escribe tu respuesta..."
                value={(responses[field.id] as string) ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                required={field.required}
              />
            )}

            {field.type === 'text_long' && (
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Escribe tu respuesta..."
                value={(responses[field.id] as string) ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                required={field.required}
              />
            )}

            {field.type === 'number' && (
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={(responses[field.id] as string) ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                required={field.required}
                style={{ maxWidth: 160 }}
              />
            )}

            {field.type === 'date' && (
              <input
                className="form-input"
                type="date"
                value={(responses[field.id] as string) ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                required={field.required}
                style={{ maxWidth: 200 }}
              />
            )}

            {field.type === 'select_single' && (
              <select
                className="form-select"
                value={(responses[field.id] as string) ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                required={field.required}
              >
                <option value="">Selecciona una opción...</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'select_multiple' && (
              <div className="ff-options-grid">
                {(field.options ?? []).map((opt) => {
                  const checked = ((responses[field.id] as string[]) ?? []).includes(opt);
                  return (
                    <label key={opt} className={`ff-option${checked ? ' ff-option--checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMulti(field.id, opt)}
                        className="ff-option-input"
                      />
                      <span className="ff-option-check">
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        )}
                      </span>
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
