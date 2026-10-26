import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = resolve('scripts/check-release.ts');
const tsx = resolve('node_modules/.bin/tsx');

function run(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'release-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return spawnSync(tsx, [script], { cwd: dir, encoding: 'utf8' });
}

describe('check-release', () => {
  it('findet offene Punkte überall unter src/', () => {
    const res = run({ 'src/components/X.astro': '<!-- TODO(sebastian): Frage -->' });
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('src/components/X.astro:1');
  });
  it('ist ohne offene Punkte grün', () => {
    expect(run({ 'src/lib/a.ts': 'export const a = 1;' }).status).toBe(0);
  });
});
