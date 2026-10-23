export type Lang = 'de' | 'en';

/** Bevorzugte Sprache aus Accept-Language; Deutsch nur, wenn höher gewichtet als Englisch. */
export function preferredLang(header: string | null): Lang {
  const q: Record<Lang, number> = { de: 0, en: 0 };
  for (const part of (header ?? '').split(',')) {
    const [tag = '', ...params] = part.trim().split(';');
    const primary = tag.trim().toLowerCase().split('-')[0];
    if (primary !== 'de' && primary !== 'en') continue;
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const value = qParam ? Number(qParam.slice(2)) : 1;
    q[primary] = Math.max(q[primary], Number.isFinite(value) ? value : 0);
  }
  return q.de > q.en ? 'de' : 'en';
}
