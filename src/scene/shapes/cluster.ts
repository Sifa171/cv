import { gauss, mulberry32 } from '../rng';
import { cloud } from './cloud';
import { depth, put, type Anchor, type Bounds } from './types';

/** n Knoten auf einem lockeren Ellipsenring um die Mitte (gut beschriftbar). */
export function clusterNodes(n: number, seed: number, b: Bounds): Anchor[] {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + Math.PI / n / 2 + (rng() - 0.5) * 0.3;
    const r = 0.92 + rng() * 0.08;
    return { x: Math.cos(angle) * b.width * 0.42 * r, y: Math.sin(angle) * b.height * 0.42 * r };
  });
}

/** Knoten mit Kanten aus Partikeln: 50 % Knoten, 30 % Kanten, 20 % Streuung um die Mitte. */
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
      put(out, i, b, gauss(rng) * b.width * 0.12, gauss(rng) * b.height * 0.15, gauss(rng) * d * 0.3);
    }
  }
  return out;
}
