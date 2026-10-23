export interface GovernorState {
  count: number;
  halvings: number;
  lowSince: number | null;
}

const MIN_FPS = 50;
const LOW_FOR_MS = 2000;
const MAX_HALVINGS = 2;

/** Halbiert die Partikelzahl, wenn die Bildrate 2 s lang unter 50 fps liegt (höchstens zweimal). */
export function govern(state: GovernorState, fps: number, nowMs: number): GovernorState {
  if (fps >= MIN_FPS) return state.lowSince === null ? state : { ...state, lowSince: null };
  if (state.halvings >= MAX_HALVINGS) return state;
  if (state.lowSince === null) return { ...state, lowSince: nowMs };
  if (nowMs - state.lowSince < LOW_FOR_MS) return state;
  return { count: Math.floor(state.count / 2), halvings: state.halvings + 1, lowSince: null };
}
