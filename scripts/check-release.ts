import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { findBlockers } from './lib/blockers';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = ['src/content', 'src/pages'].flatMap(walk);
// Im Build landen Werte aus der Umgebung (z. B. die Impressum-Anschrift); fehlt einer, steht dort ein Platzhalter.
const built = existsSync('dist') ? walk('dist').filter((p) => p.endsWith('.html')) : [];
const files = [...sources, ...built].map((path) => ({ path, text: readFileSync(path, 'utf8') }));
const blockers = findBlockers(files);

if (blockers.length > 0) {
  console.error(`Release gesperrt: ${blockers.length} offene Punkte`);
  for (const b of blockers) {
    const at = Math.max(0, b.text.search(/TODO\(sebastian\)|PLATZHALTER\(/) - 40);
    const excerpt = b.text.length > 160 ? `…${b.text.slice(at, at + 120)}…` : b.text;
    console.error(`  ${b.path}:${b.line}  ${excerpt}`);
  }
  process.exit(1);
}
console.log('Release-Prüfung: keine offenen Punkte.');
