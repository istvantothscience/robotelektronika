/** Kis-nagybetű, ékezet és felesleges szóköz figyelmen kívül hagyása. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Névsorrend-független kulcs: „Kiss Anna” == „anna kiss”. */
export function nameKey(name: string): string {
  return normalizeText(name)
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

export function containsAny(text: string, needles: string[]): boolean {
  const t = normalizeText(text);
  return needles.some((n) => t.includes(normalizeText(n)));
}

/** Tizedesvessző, valódi mínuszjel (−). */
export function formatNumber(value: number, decimals = 1): string {
  const s = value.toFixed(decimals).replace('.', ',');
  return s.startsWith('-') ? `−${s.slice(1)}` : s;
}
