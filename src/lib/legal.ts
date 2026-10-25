/** Platzhalter, solange keine Anschrift gesetzt ist; die Release-Prüfung findet ihn im Build. */
const MISSING = 'PLATZHALTER(impressum-anschrift)';

/** Anschrift fürs Impressum kommt aus der Umgebung (GitHub-Secret bzw. lokale .env), nie aus dem Repo. */
export function addressLines(value: string | undefined): string[] {
  const lines = (value ?? '').split(',').map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 ? lines : [MISSING];
}

export const IMPRESSUM_EMAIL = 'impressum@sifa-web.com';
