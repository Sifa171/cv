import type { SceneId } from './types';

export function shouldRunWebGL(env: { hasWebGL: boolean; reducedMotion: boolean }): boolean {
  return env.hasWebGL && !env.reducedMotion;
}

export function initialCount(env: { coarsePointer: boolean; width: number }): 40000 | 12000 {
  return env.coarsePointer || env.width < 768 ? 12000 : 40000;
}

const SCENES: readonly SceneId[] = ['cloud', 'cluster', 'graph', 'stream', 'pulse', 'point', 'notfound'];

/** Standbild-Modus (?scene=<id>&still=1) nur für bekannte Szenen. */
export function parseStillScene(params: URLSearchParams): SceneId | null {
  const scene = params.get('scene');
  return params.get('still') === '1' && SCENES.includes(scene as SceneId) ? (scene as SceneId) : null;
}

/** Prüft WebGL mit einem Testkontext und gibt ihn sofort wieder frei. */
export function probeWebGL(create: () => HTMLCanvasElement = () => document.createElement('canvas')): boolean {
  try {
    const canvas = create();
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
