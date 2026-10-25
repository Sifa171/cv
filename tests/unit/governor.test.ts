import { describe, expect, it } from 'vitest';
import { govern, type GovernorState } from '../../src/scene/governor';

const start: GovernorState = { count: 40000, halvings: 0, lowSince: null };

describe('govern', () => {
  it('lässt bei 60 fps alles unverändert', () => {
    expect(govern(start, 60, 1000)).toEqual(start);
  });
  it('halbiert erst nach 2 s unter 50 fps', () => {
    const s0 = govern(start, 40, 0);
    expect(s0).toEqual({ count: 40000, halvings: 0, lowSince: 0 });
    expect(govern(s0, 40, 1999)).toEqual(s0);
    expect(govern(s0, 40, 2000)).toEqual({ count: 20000, halvings: 1, lowSince: null });
  });
  it('halbiert höchstens zweimal', () => {
    let s = start;
    for (let t = 0; t <= 20000; t += 500) s = govern(s, 20, t);
    expect(s.count).toBe(10000);
    expect(s.halvings).toBe(2);
  });
  it('setzt lowSince zurück, wenn fps wieder ≥ 50', () => {
    const low = govern(start, 40, 0);
    expect(govern(low, 55, 1000).lowSince).toBeNull();
  });
});
