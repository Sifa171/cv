import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { findBlockers } from './lib/blockers';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = ['src/content', 'src/pages'].flatMap(walk).map((path) => ({ path, text: readFileSync(path, 'utf8') }));
const blockers = findBlockers(files);

if (blockers.length > 0) {
  console.error(`Release gesperrt: ${blockers.length} offene Punkte`);
  for (const b of blockers) console.error(`  ${b.path}:${b.line}  ${b.text}`);
  process.exit(1);
}
console.log('Release-Prüfung: keine offenen Punkte.');
