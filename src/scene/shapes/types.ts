export interface Bounds {
  width: number;
  height: number;
}

export interface Anchor {
  x: number;
  y: number;
}

export interface Mask {
  width: number;
  height: number;
  alpha: Uint8ClampedArray;
}

export const depth = (b: Bounds) => Math.min(b.width, b.height) / 4;

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

/** Schreibt Punkt i in den Puffer und begrenzt ihn auf den Rahmen. */
export function put(out: Float32Array, i: number, b: Bounds, x: number, y: number, z: number): void {
  out[i * 3] = clamp(x, b.width / 2);
  out[i * 3 + 1] = clamp(y, b.height / 2);
  out[i * 3 + 2] = clamp(z, depth(b));
}
