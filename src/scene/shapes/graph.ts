import { gauss, mulberry32 } from '../rng';
import { cloud } from './cloud';
import { depth, put, type Anchor, type Bounds } from './types';

/** Commit-Graph: Knoten an den Ankern, Kanten zwischen aufeinanderfolgenden Ankern. */
export function graph(count: number, seed: number, b: Bounds, anchors: Anchor[]): Float32Array {
  if (anchors.length === 0) return cloud(count, seed, b);
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const d = depth(b);
  for (let i = 0; i < count; i++) {
    const r = rng();
    if (r < 0.4 || anchors.length === 1) {
      const a = anchors[i % anchors.length]!;
      put(out, i, b, a.x + gauss(rng) * 0.05, a.y + gauss(rng) * 0.05, gauss(rng) * d * 0.05);
    } else if (r < 0.85) {
      const k = Math.floor(rng() * (anchors.length - 1));
      const p = anchors[k]!;
      const q = anchors[k + 1]!;
      const t = rng();
      put(out, i, b, p.x + (q.x - p.x) * t + gauss(rng) * 0.015, p.y + (q.y - p.y) * t + gauss(rng) * 0.015, gauss(rng) * d * 0.02);
    } else {
      put(out, i, b, (rng() - 0.5) * b.width, (rng() - 0.5) * b.height, (rng() - 0.5) * 2 * d);
    }
  }
  return out;
}
