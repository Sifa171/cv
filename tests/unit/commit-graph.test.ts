import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CommitGraph from '../../src/components/CommitGraph.astro';

const base = {
  company: 'ACME',
  title: { de: 'Rolle', en: 'Role' },
  branch: 'redhat',
  summary: { de: 'Zusammenfassung', en: 'Summary' },
  tech: [],
};

const roles = [
  { ...base, id: 'old', start: '2015-01', end: '2016-01', diff: [] },
  {
    ...base,
    id: 'new',
    start: '2016-02',
    end: null,
    location: { de: 'Ort', en: 'Place' },
    diff: [
      { type: 'add', de: 'Neu gebaut', en: 'Built' },
      { type: 'remove', de: 'Altlast entfernt', en: 'Removed legacy' },
    ],
    tech: ['OpenShift'],
  },
];

describe('CommitGraph', () => {
  it('rendert Diff-Zeilen mit Klassen und lässt leere Felder weg', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CommitGraph, { props: { roles, lang: 'de' } });
    expect(html).toMatch(/<li class="add"[^>]*>[\s\S]*Neu gebaut/);
    expect(html).toMatch(/<li class="remove"[^>]*>[\s\S]*Altlast entfernt/);
    expect(html.match(/class="diff"/g)).toHaveLength(1);
    expect(html).not.toContain('undefined');
    expect(html).not.toMatch(/\(\s*\)/);
    expect(html).toContain('HEAD →');
    expect(html).toContain('heute');
  });
});
