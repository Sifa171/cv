import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('morph.vert.glsl', () => {
  it('dreht nur die Ausgangsform, nicht das Überblendziel', () => {
    const src = readFileSync('src/scene/morph.vert.glsl', 'utf8');
    const spin = src.indexOf('spinY(aFrom');
    const mix = src.indexOf('mix(from, to');
    expect(spin).toBeGreaterThan(-1);
    expect(spin).toBeLessThan(mix);
    expect(src).not.toMatch(/pos\s*=\s*spinY\(pos/);
  });
});
