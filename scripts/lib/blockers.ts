export interface Blocker {
  path: string;
  line: number;
  text: string;
}

const PATTERNS = [/TODO\(sebastian\)/, /PLATZHALTER\(/];

/** Offene Fragen und Platzhalter, die einen Deploy verhindern. */
export function findBlockers(files: { path: string; text: string }[]): Blocker[] {
  return files.flatMap(({ path, text }) =>
    text.split('\n').flatMap((line, i) => (PATTERNS.some((p) => p.test(line)) ? [{ path, line: i + 1, text: line.trim() }] : [])),
  );
}
