import { measureAnchors } from './anchors';
import { initialCount, shouldRunWebGL } from './capability';
import { PX, ParticleEngine, type Target } from './engine';
import { govern, type GovernorState } from './governor';
import { sceneAt } from './scroll';
import { clusterNodes } from './shapes/cluster';
import { SHAPES, type ShapeContext } from './shapes/index';
import type { Anchor, Bounds, Mask } from './shapes/types';
import type { SceneId, SceneState, SectionBox } from './types';

declare global {
  interface Window {
    __cvScene?: { anchorsVersion: number; count: number };
  }
}

const SEED = 7;

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function translate(data: Float32Array, dx: number, dy: number): Float32Array {
  for (let i = 0; i < data.length; i += 3) {
    data[i]! += dx;
    data[i + 1]! += dy;
  }
  return data;
}

function textMask(text: string): Mask {
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 90;
  const ctx = c.getContext('2d')!;
  ctx.font = '400 84px "Geist Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const alpha = new Uint8ClampedArray(c.width * c.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = img.data[i * 4 + 3]!;
  return { width: c.width, height: c.height, alpha };
}

/** Startet das Partikelsystem hinter dem Inhalt; gibt eine Aufräumfunktion zurück. */
export function mountScene(root: HTMLElement): () => void {
  const html = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!shouldRunWebGL({ hasWebGL: hasWebGL(), reducedMotion })) {
    html.classList.add('no-webgl');
    return () => {};
  }

  const params = new URLSearchParams(location.search);
  const stillScene = params.get('still') === '1' ? (params.get('scene') as SceneId | null) : null;
  const debug = import.meta.env.MODE !== 'production' || params.has('debug');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const maxCount = initialCount({ coarsePointer: coarse, width: innerWidth });

  const canvas = document.createElement('canvas');
  canvas.className = 'scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  root.prepend(canvas);
  html.classList.add('webgl');

  const engine = new ParticleEngine(canvas, maxCount);
  let governor: GovernorState = { count: maxCount, halvings: 0, lowSince: null };
  engine.setCount(maxCount);

  const sections = [...document.querySelectorAll<HTMLElement>('section[data-scene]')];
  let boxes: SectionBox[] = [];
  let targets = new Map<SceneId, Target[]>();
  const pulseScratch = new Float32Array(maxCount * 3);
  let anchorsVersion = 0;
  if (debug) window.__cvScene = { anchorsVersion, count: maxCount };

  const docToWorld = (x: number, y: number): Anchor => ({ x: (x - innerWidth / 2) / PX, y: -y / PX });
  const viewport = (): Bounds => ({ width: innerWidth / PX, height: innerHeight / PX });

  function clusterTarget(ctx: ShapeContext): Target | null {
    const list = document.querySelector<HTMLElement>('.skills');
    if (!list) return null;
    list.classList.add('skills--cluster');
    const rect = list.getBoundingClientRect();
    const local: Bounds = { width: rect.width / PX, height: rect.height / PX };
    const vp = ctx.bounds;
    const items = [...list.querySelectorAll<HTMLElement>('.skill')];
    const nodes = clusterNodes(items.length, SEED, { width: local.width * 0.62, height: local.height * 0.85 });
    const GAP = 11;
    items.forEach((el, i) => {
      const nodeX = rect.width / 2 + nodes[i]!.x * PX;
      const w = el.offsetWidth;
      const edge = nodes[i]!.x < 0 ? nodeX - w - GAP : nodeX + GAP;
      el.style.left = `${Math.min(Math.max(edge, 0), rect.width - w)}px`;
      el.style.top = `${rect.height / 2 - nodes[i]!.y * PX}px`;
    });
    const edges: [number, number][] = nodes.flatMap((_, i) => {
      const e: [number, number][] = [[i, (i + 1) % nodes.length]];
      if (i % 2 === 0) e.push([i, (i + 3) % nodes.length]);
      return e;
    });
    const center = docToWorld(rect.left + rect.width / 2 + scrollX, rect.top + rect.height / 2 + scrollY);
    const data = SHAPES.cluster(maxCount, { ...ctx, bounds: { width: vp.width * 1.6, height: vp.height }, clusterNodes: nodes, clusterEdges: edges })[0]!;
    return { data: translate(data, center.x, center.y), anchored: true };
  }

  function graphTarget(ctx: ShapeContext): Target | null {
    const anchors = measureAnchors('.commit-node', docToWorld);
    if (anchors.length === 0) return null;
    const xs = anchors.map((a) => a.x);
    const ys = anchors.map((a) => a.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const bounds: Bounds = { width: ctx.bounds.width * 1.6, height: Math.max(...ys) - Math.min(...ys) + ctx.bounds.height };
    const local = anchors.map((a) => ({ x: a.x - cx, y: a.y - cy }));
    const data = SHAPES.graph(maxCount, { ...ctx, bounds, graphAnchors: local })[0]!;
    return { data: translate(data, cx, cy), anchored: true };
  }

  function measure(): void {
    boxes = sections.map((s) => {
      const r = s.getBoundingClientRect();
      return { scene: s.dataset.scene as SceneId, top: r.top + scrollY, height: r.height };
    });
    const vp = viewport();
    const ctx: ShapeContext = { bounds: vp, seed: SEED, clusterNodes: [], clusterEdges: [], graphAnchors: [] };
    const fixed = (scene: SceneId, extra: Partial<ShapeContext> = {}): Target[] =>
      SHAPES[scene](maxCount, { ...ctx, ...extra }).map((data) => ({ data, anchored: false, spin: scene === 'cloud' }));
    const scenes = new Set(boxes.map((b) => b.scene));
    if (stillScene) scenes.add(stillScene);
    targets = new Map();
    for (const scene of scenes) {
      if (scene === 'cluster') targets.set(scene, [clusterTarget(ctx) ?? fixed('cloud')[0]!]);
      else if (scene === 'graph') targets.set(scene, [graphTarget(ctx) ?? fixed('cloud')[0]!]);
      else if (scene === 'notfound')
        targets.set(scene, fixed(scene, { mask: textMask('404'), bounds: { width: vp.width * 0.7, height: vp.width * 0.7 * (90 / 240) } }));
      else targets.set(scene, fixed(scene));
    }
    anchorsVersion++;
    if (debug) window.__cvScene = { anchorsVersion, count: governor.count };
    lastKey = '';
    update();
  }

  function targetFor(scene: SceneId, local: number): Target {
    const list = targets.get(scene)!;
    if (list.length === 1) return list[0]!;
    const s = Math.min(1, Math.max(0, (local - 0.5) / 0.3));
    const [a, b] = [list[0]!.data, list[1]!.data];
    for (let i = 0; i < pulseScratch.length; i++) pulseScratch[i] = a[i]! + (b[i]! - a[i]!) * s;
    return { data: pulseScratch, anchored: false };
  }

  let state: SceneState = { current: 'cloud', next: 'cloud', morph: 0, local: 0 };
  let lastKey = '';
  let from: Target | null = null;
  let to: Target | null = null;

  function update(): void {
    if (boxes.length === 0 && !stillScene) return;
    state = stillScene
      ? { current: stillScene, next: stillScene, morph: 0, local: 0.5 }
      : sceneAt(boxes, scrollY, innerHeight);
    const pulseStep = state.current === 'pulse' ? Math.round(state.local * 50) : 0;
    const key = `${state.current}|${state.next}|${pulseStep}`;
    if (key !== lastKey) {
      from = targetFor(state.current, state.local);
      to = targetFor(state.next, 0);
      engine.setTargets(from, to);
      lastKey = key;
    }
  }

  let pointerStrength = 0;
  let pointer = { x: 999, y: 999 };
  const onPointer = (e: PointerEvent) => {
    if (coarse) return;
    pointer = { x: (e.clientX - innerWidth / 2) / PX, y: -(e.clientY - innerHeight / 2) / PX };
    pointerStrength = 1;
  };

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      engine.resize(innerWidth, innerHeight);
      measure();
      if (stillScene) frame(performance.now());
    }, 150);
  };

  let raf = 0;
  let last = performance.now();
  let fps = 60;
  const start = performance.now();

  function frame(now: number): void {
    const dt = Math.max(1, now - last);
    last = now;
    fps = fps * 0.9 + (1000 / dt) * 0.1;
    if (!stillScene) {
      governor = govern(governor, fps, now);
      engine.setCount(governor.count);
      if (debug && window.__cvScene) window.__cvScene.count = governor.count;
    }
    pointerStrength *= 0.96;
    engine.setPointer(pointer.x, pointer.y, pointerStrength);
    const offset = (scrollY + innerHeight / 2) / PX;
    engine.setFrame({
      morph: state.morph,
      time: stillScene ? 4 : (now - start) / 1000,
      fromOffset: from?.anchored ? offset : 0,
      toOffset: to?.anchored ? offset : 0,
    });
    engine.render();
  }

  function loop(now: number): void {
    frame(now);
    raf = requestAnimationFrame(loop);
  }

  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  if (stillScene) {
    const section = sections.find((s) => s.dataset.scene === stillScene);
    if (section) {
      html.style.scrollBehavior = 'auto';
      const r = section.getBoundingClientRect();
      scrollTo(0, r.top + scrollY + r.height / 2 - innerHeight / 2);
    }
  }
  engine.resize(innerWidth, innerHeight);
  measure();
  void document.fonts.ready.then(() => {
    measure();
    if (stillScene) {
      frame(performance.now());
      html.dataset.sceneReady = '1';
    }
  });

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('pointermove', onPointer, { passive: true });
  if (!stillScene) {
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('scroll', update);
    removeEventListener('resize', onResize);
    removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    engine.dispose();
    canvas.remove();
    html.classList.remove('webgl');
  };
}
