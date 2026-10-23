import { gauss, mulberry32 } from '../rng';
import { cloud } from './cloud';
import { depth, put, type Anchor, type Bounds } from './types';

/** n Knotenpositionen im inneren Bereich mit Mindestabstand von 12 % der Breite. */
export function clusterNodes(n: number, seed: number, b: Bounds): Anchor[] {
  const rng = mulberry32(seed);
  const nodes: Anchor[] = [];
  let minDist = 0.12 * b.width;
  let attempts = 0;
  while (nodes.length < n) {
    const c = { x: (rng() - 0.5) * b.width * 0.8, y: (rng() - 0.5) * b.height * 0.8 };
    if (nodes.every((o) => Math.hypot(o.x - c.x, o.y - c.y) >= minDist)) nodes.push(c);
    if (++attempts % 2000 === 0) minDist = Math.max(0.1 * b.width, minDist * 0.95);
  }
  return nodes;
}

/** Knoten mit Kanten aus Partikeln: 50 % Knoten, 30 % Kanten, 20 % Streuung. */
export function cluster(count: number, seed: number, b: Bounds, nodes: Anchor[], edges: [number, number][]): Float32Array {
  if (nodes.length === 0) return cloud(count, seed, b);
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const d = depth(b);
  for (let i = 0; i < count; i++) {
    const r = rng();
    if (r < 0.5 || (r < 0.8 && edges.length === 0)) {
      const n = nodes[Math.floor(rng() * nodes.length)]!;
      put(out, i, b, n.x + gauss(rng) * b.width * 0.03, n.y + gauss(rng) * b.width * 0.03, gauss(rng) * d * 0.2);
    } else if (r < 0.8) {
      const [a, c] = edges[Math.floor(rng() * edges.length)]!;
      const p = nodes[a]!;
      const q = nodes[c]!;
      const t = rng();
      put(out, i, b, p.x + (q.x - p.x) * t + gauss(rng) * 0.02, p.y + (q.y - p.y) * t + gauss(rng) * 0.02, gauss(rng) * d * 0.05);
    } else {
      put(out, i, b, (rng() - 0.5) * b.width, (rng() - 0.5) * b.height, (rng() - 0.5) * 2 * d);
    }
  }
  return out;
}
