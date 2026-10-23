import { mulberry32 } from '../rng';
import { put, type Bounds } from './types';

/** Alle Partikel in einem kleinen Punkt in der Mitte. */
export function point(count: number, seed: number, b: Bounds): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const radius = Math.min(b.width, b.height) / 200;
  for (let i = 0; i < count; i++) {
    const r = radius * Math.sqrt(rng());
    const phi = rng() * Math.PI * 2;
    put(out, i, b, r * Math.cos(phi), r * Math.sin(phi), (rng() - 0.5) * radius);
  }
  return out;
}
