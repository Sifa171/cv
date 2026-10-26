import { describe, expect, it } from 'vitest';
import { govern, type GovernorState } from '../../src/scene/governor';

const start: GovernorState = { count: 40000, halvings: 0, lowSince: null, maxFps: 0 };

describe('govern', () => {
  it('lässt bei 60 fps alles unverändert', () => {
    expect(govern(start, 60, 1000)).toMatchObject({ count: 40000, halvings: 0, lowSince: null });
  });
  it('halbiert erst nach 2 s unter 50 fps', () => {
    const s0 = govern(start, 40, 0);
    expect(s0).toMatchObject({ count: 40000, halvings: 0, lowSince: 0 });
    expect(govern(s0, 40, 1999)).toEqual(s0);
    expect(govern(s0, 40, 2000)).toMatchObject({ count: 20000, halvings: 1, lowSince: null });
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
  it('halbiert nicht bei gedeckelten 30 fps (z. B. iOS-Stromsparmodus)', () => {
    let s = start;
    for (let t = 0; t <= 20000; t += 500) s = govern(s, 30, t);
    expect(s.count).toBe(40000);
  });
  it('halbiert trotzdem, wenn ein 30-fps-Gerät weiter einbricht', () => {
    let s = start;
    for (let t = 0; t <= 3000; t += 500) s = govern(s, 30, t);
    for (let t = 3500; t <= 7500; t += 500) s = govern(s, 18, t);
    expect(s.count).toBe(20000);
  });
});
