import { describe, expect, it } from 'vitest';
import { altPath } from '../../src/i18n/ui';

describe('altPath', () => {
  it('bildet Startseite, CV und Rechtsseiten ab', () => {
    expect(altPath('/de/', 'de', 'en')).toBe('/en/');
    expect(altPath('/en/cv/', 'en', 'de')).toBe('/de/cv/');
    expect(altPath('/de/impressum/', 'de', 'en')).toBe('/en/imprint/');
    expect(altPath('/en/privacy/', 'en', 'de')).toBe('/de/datenschutz/');
  });
  it('liefert bei gleicher Sprache den Pfad unverändert', () => {
    expect(altPath('/de/cv/', 'de', 'de')).toBe('/de/cv/');
  });
});
