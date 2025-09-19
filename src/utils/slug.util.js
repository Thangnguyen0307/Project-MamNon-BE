export function slugifySegment(input) {
  if (input === undefined || input === null) return 'unknown';
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9\-_.\s]/g, '') // keep alnum, dash, underscore, dot, space
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}
