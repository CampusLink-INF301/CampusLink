import { useState, useEffect, useRef } from 'react';
import { OpportunityType, OPPORTUNITY_TYPE_LABELS } from '../types/opportunity';

interface Props {
  onSearch: (search: string, type?: OpportunityType) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<OpportunityType | ''>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(search, type || undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(search, type || undefined);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch('');
    setType('');
    onSearch('', undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar oportunidad..."
      />
      <div className="search-divider" />
      <select
        data-testid="filter-type"
        value={type}
        onChange={(e) => setType(e.target.value as OpportunityType | '')}
      >
        <option value="">Todos los tipos</option>
        {Object.values(OpportunityType).map((t) => (
          <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
        ))}
      </select>
      <button type="submit" data-testid="btn-search" className="btn btn-primary btn-sm">
        Buscar
      </button>
      <button
        type="button"
        data-testid="btn-clear"
        className="btn btn-ghost btn-sm"
        onClick={handleClear}
      >
        Limpiar
      </button>
    </form>
  );
}
