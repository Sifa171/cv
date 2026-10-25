import { createHash } from 'node:crypto';

/** Kurzer, stabiler Commit-Hash einer Station (erste 4 Hex-Zeichen von SHA-1). */
export function commitHash(id: string): string {
  return createHash('sha1').update(id).digest('hex').slice(0, 4);
}
