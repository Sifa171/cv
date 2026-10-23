import { mulberry32 } from '../rng';
import { point } from './point';
import { depth, put, type Bounds, type Mask } from './types';

/** Punkte nur auf Pixeln der Maske mit Alpha > 128 (Maske füllt den Rahmen). */
export function fromMask(count: number, seed: number, b: Bounds, mask: Mask): Float32Array {
  const pixels: number[] = [];
  for (let i = 0; i < mask.alpha.length; i++) if (mask.alpha[i]! > 128) pixels.push(i);
  if (pixels.length === 0) return point(count, seed, b);
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const cw = b.width / mask.width;
  const ch = b.height / mask.height;
  for (let i = 0; i < count; i++) {
    const px = pixels[Math.floor(rng() * pixels.length)]!;
    const col = px % mask.width;
    const row = Math.floor(px / mask.width);
    put(out, i, b, -b.width / 2 + (col + rng()) * cw, b.height / 2 - (row + rng()) * ch, (rng() - 0.5) * depth(b) * 0.1);
  }
  return out;
}
