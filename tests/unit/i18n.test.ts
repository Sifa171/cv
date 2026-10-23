import { describe, expect, it } from 'vitest';
import { LANGS, t } from '../../src/lib/i18n';

describe('t', () => {
  it('wählt die Sprache', () => {
    expect(t({ de: 'a', en: 'b' }, 'en')).toBe('b');
    expect(t({ de: 'a', en: 'b' }, 'de')).toBe('a');
  });
  it('kennt genau de und en', () => {
    expect(LANGS).toEqual(['de', 'en']);
  });
});
