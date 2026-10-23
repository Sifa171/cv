import { describe, expect, it } from 'vitest';
import { sceneAt } from '../../src/scene/scroll';
import type { SectionBox } from '../../src/scene/types';

const boxes: SectionBox[] = [
  { scene: 'cloud', top: 0, height: 1000 },
  { scene: 'cluster', top: 1000, height: 1000 },
  { scene: 'graph', top: 2000, height: 1000 },
];
const VH = 800;

describe('sceneAt', () => {
  it('Anfang: erste Szene ohne Überblendung', () => {
    expect(sceneAt(boxes, 0, VH)).toEqual({ current: 'cloud', next: 'cluster', morph: 0, local: 0.4 });
  });
  it('blendet in den letzten 30 % eines Abschnitts über', () => {
    const s = sceneAt(boxes, 450, VH);
    expect(s.current).toBe('cloud');
    expect(s.local).toBeCloseTo(0.85);
    expect(s.morph).toBeCloseTo(0.5);
  });
  it('Grenze gehört zum nächsten Abschnitt', () => {
    expect(sceneAt(boxes, 600, VH)).toEqual({ current: 'cluster', next: 'graph', morph: 0, local: 0 });
  });
  it('Overscroll oben wird begrenzt', () => {
    expect(sceneAt(boxes, -1000, VH)).toEqual({ current: 'cloud', next: 'cluster', morph: 0, local: 0 });
  });
  it('hinter dem Ende: letzte Szene, local 1, keine Überblendung', () => {
    expect(sceneAt(boxes, 3000, VH)).toEqual({ current: 'graph', next: 'graph', morph: 0, local: 1 });
  });
  it('vorwärts und rückwärts gleich', () => {
    const forward = [0, 300, 450, 900].map((y) => sceneAt(boxes, y, VH));
    const backward = [900, 450, 300, 0].map((y) => sceneAt(boxes, y, VH)).reverse();
    expect(backward).toEqual(forward);
  });
  it('leere Liste wirft einen sprechenden Fehler', () => {
    expect(() => sceneAt([], 0, VH)).toThrow(/Abschnitt/);
  });
});
