import type { SECTION_IDS } from '../lib/schemas';

export type SectionId = (typeof SECTION_IDS)[number];

export type SceneId = 'cloud' | 'cluster' | 'graph' | 'stream' | 'pulse' | 'point' | 'notfound';

export const SCENE_OF: Record<SectionId, SceneId> = {
  start: 'cloud',
  profile: 'cluster',
  career: 'graph',
  projects: 'stream',
  offduty: 'pulse',
  contact: 'point',
};

export interface SectionBox {
  scene: SceneId;
  top: number;
  height: number;
}

export interface SceneState {
  current: SceneId;
  next: SceneId;
  /** 0…1: Überblendung zur nächsten Szene. */
  morph: number;
  /** 0…1: Position der Referenzlinie im aktuellen Abschnitt. */
  local: number;
}
