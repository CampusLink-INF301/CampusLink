import type { FormField } from '../types/opportunity';

interface Props {
  fields: FormField[];
  responses: Record<string, string | string[]>;
  onChange: (responses: Record<string, string | string[]>) => void;
}

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
    <div className="form-filler">
      {fields.map((field) => (
        <div key={field.id} className="form-group">
          <label className="form-label">
            {field.label}
            {field.required && <span className="required-star"> *</span>}
          </label>

          {field.type === 'text_short' && (
            <input
              className="form-input"
              value={(responses[field.id] as string) ?? ''}
              onChange={(e) => set(field.id, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === 'text_long' && (
            <textarea
              className="form-textarea"
              rows={3}
              value={(responses[field.id] as string) ?? ''}
              onChange={(e) => set(field.id, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === 'number' && (
            <input
              className="form-input"
              type="number"
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
              <option value="">Selecciona una opción…</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === 'select_multiple' && (
            <div className="checkbox-group">
              {(field.options ?? []).map((opt) => {
                const selected = ((responses[field.id] as string[]) ?? []).includes(opt);
                return (
                  <label key={opt} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleMulti(field.id, opt)}
                    />
                    {' '}{opt}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
