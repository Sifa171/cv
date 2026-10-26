import { describe, expect, it } from 'vitest';
import { initialCount, shouldRunWebGL } from '../../src/scene/capability';

describe('shouldRunWebGL', () => {
  it('nur mit WebGL und ohne reduzierte Bewegung', () => {
    expect(shouldRunWebGL({ hasWebGL: true, reducedMotion: false })).toBe(true);
    expect(shouldRunWebGL({ hasWebGL: true, reducedMotion: true })).toBe(false);
    expect(shouldRunWebGL({ hasWebGL: false, reducedMotion: false })).toBe(false);
  });
});

describe('initialCount', () => {
  it('12000 für Touch oder schmal, sonst 40000', () => {
    expect(initialCount({ coarsePointer: false, width: 1440 })).toBe(40000);
    expect(initialCount({ coarsePointer: true, width: 1440 })).toBe(12000);
    expect(initialCount({ coarsePointer: false, width: 767 })).toBe(12000);
    expect(initialCount({ coarsePointer: false, width: 768 })).toBe(40000);
  });
});

describe('parseStillScene', async () => {
  const { parseStillScene } = await import('../../src/scene/capability');
  it('nimmt nur bekannte Szenen mit still=1', () => {
    expect(parseStillScene(new URLSearchParams('scene=graph&still=1'))).toBe('graph');
    expect(parseStillScene(new URLSearchParams('scene=foo&still=1'))).toBeNull();
    expect(parseStillScene(new URLSearchParams('scene=graph'))).toBeNull();
    expect(parseStillScene(new URLSearchParams(''))).toBeNull();
  });
});

describe('probeWebGL', async () => {
  const { probeWebGL } = await import('../../src/scene/capability');
  it('gibt den Testkontext wieder frei', () => {
    let lost = 0;
    const ctx = { getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext: () => lost++ } : null) };
    const canvas = { getContext: (type: string) => (type === 'webgl2' ? ctx : null) };
    expect(probeWebGL(() => canvas as unknown as HTMLCanvasElement)).toBe(true);
    expect(lost).toBe(1);
  });
  it('meldet false ohne Kontext oder bei Fehler', () => {
    expect(probeWebGL(() => ({ getContext: () => null }) as unknown as HTMLCanvasElement)).toBe(false);
    expect(probeWebGL(() => { throw new Error('x'); })).toBe(false);
  });
});
