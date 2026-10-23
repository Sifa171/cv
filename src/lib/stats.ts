export interface Stats {
  uptimeYears: number;
  redhatYears: number;
  roleCount: number;
}

function monthIndex(yyyyMm: string): number {
  const [y, m] = yyyyMm.split('-').map(Number);
  return y! * 12 + (m! - 1);
}

function fullYearsSince(start: string, today: Date): number {
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  return Math.floor((now - monthIndex(start)) / 12);
}

export function computeStats(roles: { start: string; company: string }[], today: Date): Stats {
  const earliest = (list: { start: string }[]) =>
    list.reduce((min, r) => (r.start < min ? r.start : min), list[0]?.start ?? '');
  const redhat = roles.filter((r) => r.company === 'Red Hat');
  return {
    uptimeYears: roles.length ? fullYearsSince(earliest(roles), today) : 0,
    redhatYears: redhat.length ? fullYearsSince(earliest(redhat), today) : 0,
    roleCount: roles.length,
  };
}
