import { describe, expect, it } from 'vitest';
import { commitHash } from '../../src/lib/commit';

describe('commitHash', () => {
  it('liefert 4 Hex-Zeichen, deterministisch und je id verschieden', () => {
    const a = commitHash('redhat-ae');
    expect(a).toMatch(/^[0-9a-f]{4}$/);
    expect(commitHash('redhat-ae')).toBe(a);
    expect(commitHash('viada-consultant')).not.toBe(a);
  });
});
