import type { Lang } from './i18n';

const NOW: Record<Lang, string> = { de: 'heute', en: 'now' };

/** Zeitraum einer Station, z. B. „2018 – 2019“ oder „01/2023 – 09/2023“. */
export function formatPeriod(start: string, end: string | null, lang: Lang, opts: { months?: boolean } = {}): string {
  const fmt = (ym: string) => (opts.months ? `${ym.slice(5, 7)}/${ym.slice(0, 4)}` : ym.slice(0, 4));
  const from = fmt(start);
  const to = end ? fmt(end) : NOW[lang];
  return from === to ? from : `${from} – ${to}`;
}
