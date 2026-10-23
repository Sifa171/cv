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
