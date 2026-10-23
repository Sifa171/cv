import type { Anchor } from './shapes/types';

/** Mittelpunkte aller passenden Elemente in Dokumentkoordinaten, umgerechnet mit toWorld. */
export function measureAnchors(selector: string, toWorld: (x: number, y: number) => Anchor): Anchor[] {
  return [...document.querySelectorAll(selector)].map((el) => {
    const r = el.getBoundingClientRect();
    return toWorld(r.left + r.width / 2 + window.scrollX, r.top + r.height / 2 + window.scrollY);
  });
}
