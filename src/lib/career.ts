import { commitHash } from './commit';
import type { Role } from './schemas';

export type CommitType = 'init' | 'merge' | 'feat';

export interface Commit {
  role: Role;
  hash: string;
  type: CommitType;
  head: boolean;
  lane: number;
}

export const LANE_OF: Record<Role['branch'], number> = { sag: 0, viada: 1, redhat: 2 };

/** Stationen als Commits, neueste zuerst. */
export function toCommits(roles: Role[]): Commit[] {
  const ascending = [...roles].sort((a, b) => a.start.localeCompare(b.start));
  const commits = ascending.map((role, i): Commit => {
    const prev = ascending[i - 1];
    const type: CommitType = !prev ? 'init' : prev.company !== role.company ? 'merge' : 'feat';
    return { role, hash: commitHash(role.id), type, head: false, lane: LANE_OF[role.branch] };
  });
  const latest = commits.at(-1);
  if (latest) latest.head = true;
  return commits.reverse();
}
