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
