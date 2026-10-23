import { describe, expect, it } from 'vitest';
import { preferredLang } from '../../worker/lang';

describe('preferredLang', () => {
  it.each([
    ['de', 'de'],
    ['de-DE,de;q=0.9,en;q=0.8', 'de'],
    ['en;q=0.9, de;q=0.8', 'en'],
    ['DE-at', 'de'],
    ['fr', 'en'],
    ['*', 'en'],
    ['de;q=abc, en', 'en'],
    ['en;q=0, de', 'de'],
    ['', 'en'],
  ])('%s → %s', (header, lang) => {
    expect(preferredLang(header)).toBe(lang);
  });
  it('fehlender Header → en', () => {
    expect(preferredLang(null)).toBe('en');
  });
});
