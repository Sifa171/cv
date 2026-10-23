import { gauss, mulberry32 } from '../rng';
import { depth, put, type Bounds } from './types';

/** Lose, leicht abgeflachte Wolke mit etwas Streuung. */
export function cloud(count: number, seed: number, b: Bounds): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    if (rng() < 0.15) {
      put(out, i, b, (rng() - 0.5) * b.width, (rng() - 0.5) * b.height, (rng() - 0.5) * 2 * depth(b));
    } else {
      put(out, i, b, gauss(rng) * b.width * 0.16 + b.width * 0.12, gauss(rng) * b.height * 0.18, gauss(rng) * depth(b) * 0.4);
    }
  }
  return out;
}
