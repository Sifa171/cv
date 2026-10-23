export type Lang = 'de' | 'en';

export const LANGS: readonly Lang[] = ['de', 'en'];

export interface Localized {
  de: string;
  en: string;
}

export function t(value: Localized, lang: Lang): string {
  return value[lang];
}
