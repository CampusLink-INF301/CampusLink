const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalizeSearch(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim();
}
