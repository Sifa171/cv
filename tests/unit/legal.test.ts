import { describe, expect, it } from 'vitest';
import { addressLines } from '../../src/lib/legal';

describe('addressLines', () => {
  it('teilt die Anschrift an Kommas in Zeilen', () => {
    expect(addressLines('Musterweg 1, 12345 Musterstadt')).toEqual(['Musterweg 1', '12345 Musterstadt']);
  });
  it('liefert den Platzhalter, wenn keine Anschrift gesetzt ist', () => {
    expect(addressLines(undefined)).toEqual(['PLATZHALTER(impressum-anschrift)']);
    expect(addressLines('  ')).toEqual(['PLATZHALTER(impressum-anschrift)']);
  });
});
