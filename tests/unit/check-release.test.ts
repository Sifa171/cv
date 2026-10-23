import { describe, expect, it } from 'vitest';
import { findBlockers } from '../../scripts/lib/blockers';

describe('findBlockers', () => {
  it('findet TODO(sebastian) und PLATZHALTER( mit Zeilennummer', () => {
    const hits = findBlockers([
      { path: 'a.yaml', text: 'ok\n# TODO(sebastian): Frage\nok' },
      { path: 'b.astro', text: '<p>PLATZHALTER(impressum-anschrift)</p>' },
    ]);
    expect(hits).toEqual([
      { path: 'a.yaml', line: 2, text: '# TODO(sebastian): Frage' },
      { path: 'b.astro', line: 1, text: '<p>PLATZHALTER(impressum-anschrift)</p>' },
    ]);
  });
  it('ignoriert TODO ohne (sebastian) und sauberen Text', () => {
    expect(findBlockers([{ path: 'c.ts', text: '// TODO: später\nalles gut' }])).toEqual([]);
  });
});
