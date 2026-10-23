import { gauss, mulberry32 } from '../rng';
import { depth, put, type Bounds } from './types';

type Curve = (u: number, rng: () => number) => number;

function line(count: number, seed: number, b: Bounds, amplitude: number, curve: Curve): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const d = depth(b);
  for (let i = 0; i < count; i++) {
    const u = rng();
    const y = curve(u, rng) * amplitude * (b.height / 2) + gauss(rng) * 0.015;
    put(out, i, b, (u - 0.5) * b.width, y, gauss(rng) * d * 0.03);
  }
  return out;
}

/** Datenstrom: Welle mit Datenblöcken. */
export function signalStream(count: number, seed: number, b: Bounds): Float32Array {
  return line(count, seed, b, 0.25, (u) => Math.sin(u * 60) * (Math.floor(u * 18) % 2 ? 1 : 0.3) - (Math.floor(u * 42) % 3 === 0 ? 0.35 : 0));
}

/** Puls: EKG-Zacke etwa alle 1/6 der Breite. */
export function signalPulse(count: number, seed: number, b: Bounds): Float32Array {
  return line(count, seed, b, 0.6, (u) => {
    const p = (u * 6) % 1;
    if (p < 0.03) return p / 0.03;
    if (p < 0.06) return 1 - ((p - 0.03) / 0.03) * 1.7;
    if (p < 0.09) return -0.7 + ((p - 0.06) / 0.03) * 0.7;
    return 0;
  });
}

/** Spektrum: gespiegelte Balken mit Hüllkurve. */
export function signalSpectrum(count: number, seed: number, b: Bounds): Float32Array {
  const bars = 48;
  const barRng = mulberry32(seed ^ 0x9e3779b9);
  const heights = Array.from({ length: bars }, (_, k) => (0.25 + 0.75 * barRng()) * Math.sin(((k + 0.5) / bars) * Math.PI));
  return line(count, seed, b, 0.75, (u, rng) => {
    const h = heights[Math.min(bars - 1, Math.floor(u * bars))]!;
    return (rng() * 2 - 1) * h;
  });
}
