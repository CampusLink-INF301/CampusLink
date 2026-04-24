import { useState } from 'react';
import { OpportunityType, OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';

interface Props {
  onSearch: (search: string, type?: OpportunityType) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<OpportunityType | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search, type || undefined);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar oportunidad..."
        style={{ flex: 1, minWidth: 200 }}
      />
      <select
        data-testid="filter-type"
        value={type}
        onChange={(e) => setType(e.target.value as OpportunityType | '')}
        style={{ minWidth: 160 }}
      >
        <option value="">Todos los tipos</option>
        {Object.values(OpportunityType).map((t) => (
          <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
        ))}
      </select>
      <button type="submit" data-testid="btn-search">Buscar</button>
      <button
        type="button"
        data-testid="btn-clear"
        onClick={() => { setSearch(''); setType(''); onSearch('', undefined); }}
      >
        Limpiar
      </button>
    </form>
  );
}
