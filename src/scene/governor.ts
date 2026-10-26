export interface GovernorState {
  count: number;
  halvings: number;
  lowSince: number | null;
  /** Höchste bisher gemessene Bildrate; zeigt, ob das Gerät gedeckelt ist (z. B. 30 fps im Stromsparmodus). */
  maxFps: number;
}

const MIN_FPS = 50;
/** Schwelle für Geräte, die nie über ~30 fps kommen. */
const MIN_FPS_CAPPED = 25;
const CAPPED_BELOW = 35;
const LOW_FOR_MS = 2000;
const MAX_HALVINGS = 2;

/** Halbiert die Partikelzahl, wenn die Bildrate 2 s lang unter der Schwelle liegt (höchstens zweimal). */
export function govern(state: GovernorState, fps: number, nowMs: number): GovernorState {
  const maxFps = Math.max(state.maxFps, fps);
  const threshold = maxFps < CAPPED_BELOW ? MIN_FPS_CAPPED : MIN_FPS;
  const next = maxFps === state.maxFps ? state : { ...state, maxFps };
  if (fps >= threshold) return next.lowSince === null ? next : { ...next, lowSince: null };
  if (next.halvings >= MAX_HALVINGS) return next;
  if (next.lowSince === null) return { ...next, lowSince: nowMs };
  if (nowMs - next.lowSince < LOW_FOR_MS) return next;
  return { ...next, count: Math.floor(next.count / 2), halvings: next.halvings + 1, lowSince: null };
}
