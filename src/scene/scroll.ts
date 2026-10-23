import type { SceneState, SectionBox } from './types';

/** Ab diesem Anteil eines Abschnitts beginnt die Überblendung zur nächsten Szene. */
const MORPH_START = 0.7;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Aktive Szene für eine Scrollposition; Referenz ist die Mitte des Viewports. */
export function sceneAt(boxes: SectionBox[], scrollY: number, viewportH: number): SceneState {
  if (boxes.length === 0) throw new Error('sceneAt: kein Abschnitt mit Szene vorhanden');
  const line = scrollY + viewportH / 2;
  let index = boxes.findIndex((b) => line >= b.top && line < b.top + b.height);
  if (index === -1) index = line < boxes[0]!.top ? 0 : boxes.length - 1;
  const box = boxes[index]!;
  const nextBox = boxes[index + 1];
  const local = clamp01((line - box.top) / box.height);
  const morph = nextBox ? clamp01((local - MORPH_START) / (1 - MORPH_START)) : 0;
  return { current: box.scene, next: (nextBox ?? box).scene, morph, local };
}
