import type { Lang } from '../lib/i18n';

const STRINGS = {
  cv: { de: 'Lebenslauf ↓', en: 'Résumé ↓' },
  switchLabel: { de: 'English', en: 'Deutsch' },
  switchShort: { de: 'EN', en: 'DE' },
  imprint: { de: 'Impressum', en: 'Imprint' },
  privacy: { de: 'Datenschutz', en: 'Privacy' },
  home: { de: 'Startseite', en: 'Home' },
  sections: { de: 'Abschnitte', en: 'Sections' },
  ready: { de: '$ ready_', en: '$ ready_' },
  skip: { de: 'Zum Inhalt springen', en: 'Skip to content' },
  scrollHint: { de: 'Scrollen · dem Signal folgen', en: 'Scroll · follow the signal' },
  visit: { de: 'Ansehen ↗', en: 'Visit ↗' },
  source: { de: 'Code auf GitHub ↗', en: 'Source on GitHub ↗' },
  skills: { de: 'Skills', en: 'Skills' },
  stats: { de: 'Kennzahlen', en: 'Key figures' },
} as const;

export type UiKey = keyof typeof STRINGS;

export function ui(lang: Lang, key: UiKey): string {
  return STRINGS[key][lang];
}

const PAGE_SLUGS: Record<Lang, Record<string, string>> = {
  de: { impressum: 'legal', datenschutz: 'privacy' },
  en: { imprint: 'legal', privacy: 'privacy' },
};

function slugFor(lang: Lang, key: string): string {
  const entry = Object.entries(PAGE_SLUGS[lang]).find(([, k]) => k === key);
  return entry ? entry[0] : key;
}

/** Pfad der gleichen Seite in der anderen Sprache. */
export function altPath(path: string, from: Lang, to: Lang): string {
  if (from === to) return path;
  const [first = '', ...tail] = path.slice(from.length + 2).split('/');
  const key = PAGE_SLUGS[from][first] ?? first;
  return `/${to}/${[key ? slugFor(to, key) : '', ...tail].join('/')}`;
}

export function legalPath(lang: Lang, page: 'legal' | 'privacy'): string {
  return `/${lang}/${slugFor(lang, page)}/`;
}
