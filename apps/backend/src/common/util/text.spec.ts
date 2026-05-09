import { normalizeSearch } from './text';

describe('normalizeSearch', () => {
  it('returns empty string for nullish values', () => {
    expect(normalizeSearch(null)).toBe('');
    expect(normalizeSearch(undefined)).toBe('');
    expect(normalizeSearch('')).toBe('');
  });

  it('normalizes accents, casing and whitespace', () => {
    expect(normalizeSearch('  Ávila Núñez  ')).toBe('avila nunez');
  });
});