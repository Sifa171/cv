export function shouldRunWebGL(env: { hasWebGL: boolean; reducedMotion: boolean }): boolean {
  return env.hasWebGL && !env.reducedMotion;
}

export function initialCount(env: { coarsePointer: boolean; width: number }): 40000 | 12000 {
  return env.coarsePointer || env.width < 768 ? 12000 : 40000;
}
