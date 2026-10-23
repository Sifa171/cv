import { describe, expect, it } from 'vitest';
import { computeStats } from '../../src/lib/stats';
import { ROLES } from './fixtures';

describe('computeStats', () => {
  it('rechnet volle Jahre aus den Stationen der Spec', () => {
    expect(computeStats(ROLES, new Date('2026-10-23'))).toEqual({
      uptimeYears: 15,
      redhatYears: 8,
      roleCount: 8,
    });
  });
  it('rundet ab, solange der Monat nicht erreicht ist', () => {
    expect(computeStats([{ start: '2011-08', company: 'X' }], new Date('2026-07-31')).uptimeYears).toBe(14);
  });
});
