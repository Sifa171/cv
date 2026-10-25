import { describe, expect, it } from 'vitest';
import { localized, roleSchema } from '../../src/lib/schemas';

const minimalRole = {
  id: 'x',
  company: 'X',
  title: { de: 'T', en: 'T' },
  start: '2020-01',
  end: null,
  branch: 'redhat',
  summary: { de: 's', en: 's' },
  diff: [],
  tech: [],
};

describe('Schemas', () => {
  it('lehnt fehlende Übersetzung ab', () => {
    expect(localized.safeParse({ de: 'x' }).success).toBe(false);
    expect(localized.safeParse({ de: 'x', en: '' }).success).toBe(false);
  });
  it('akzeptiert Station ohne Ort und mit leerem Diff', () => {
    expect(roleSchema.safeParse(minimalRole).success).toBe(true);
  });
  it('lehnt falsches Datumsformat und unbekannten Branch ab', () => {
    expect(roleSchema.safeParse({ ...minimalRole, start: '2020-1' }).success).toBe(false);
    expect(roleSchema.safeParse({ ...minimalRole, branch: 'ibm' }).success).toBe(false);
  });
});
