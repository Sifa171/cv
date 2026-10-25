import { describe, expect, it } from 'vitest';
import { toCommits } from '../../src/lib/career';
import { ROLES } from './fixtures';

const roles = ROLES.map((r) => ({ ...r, branch: r.company === 'Red Hat' ? 'redhat' : r.company.startsWith('Viada') ? 'viada' : 'sag' })) as any;

describe('toCommits', () => {
  it('sortiert neueste zuerst und markiert HEAD', () => {
    const commits = toCommits(roles);
    expect(commits.map((c) => c.role.id)[0]).toBe('redhat-ae');
    expect(commits[0]!.head).toBe(true);
    expect(commits.filter((c) => c.head)).toHaveLength(1);
  });
  it('vergibt init, merge und feat', () => {
    const types = Object.fromEntries(toCommits(roles).map((c) => [c.role.id, c.type]));
    expect(types).toEqual({
      'redhat-ae': 'feat',
      'redhat-sa-commercial': 'feat',
      'redhat-sa-partner': 'feat',
      'redhat-consultant': 'merge',
      'viada-consultant': 'merge',
      'sag-developer': 'feat',
      'sag-apprentice': 'feat',
      'sag-student': 'init',
    });
  });
  it('übernimmt einen gesetzten commitType', () => {
    const withMerge = roles.map((r: any) => (r.id === 'redhat-ae' ? { ...r, commitType: 'merge' } : r));
    expect(toCommits(withMerge)[0]!.type).toBe('merge');
  });
});
