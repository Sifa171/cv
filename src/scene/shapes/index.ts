import type { SceneId } from '../types';
import { cloud } from './cloud';
import { cluster } from './cluster';
import { graph } from './graph';
import { fromMask } from './mask';
import { point } from './point';
import { signalPulse, signalSpectrum, signalStream } from './signal';
import type { Anchor, Bounds, Mask } from './types';

export interface ShapeContext {
  bounds: Bounds;
  seed: number;
  clusterNodes: Anchor[];
  clusterEdges: [number, number][];
  graphAnchors: Anchor[];
  mask?: Mask;
}

/** Zielformen je Szene; mehrere Puffer werden innerhalb der Szene über `local` überblendet. */
export const SHAPES: Record<SceneId, (count: number, ctx: ShapeContext) => Float32Array[]> = {
  cloud: (n, c) => [cloud(n, c.seed, c.bounds)],
  cluster: (n, c) => [cluster(n, c.seed, c.bounds, c.clusterNodes, c.clusterEdges)],
  graph: (n, c) => [graph(n, c.seed, c.bounds, c.graphAnchors)],
  stream: (n, c) => [signalStream(n, c.seed, c.bounds)],
  pulse: (n, c) => [signalPulse(n, c.seed, c.bounds), signalSpectrum(n, c.seed, c.bounds)],
  point: (n, c) => [point(n, c.seed, c.bounds)],
  notfound: (n, c) => [c.mask ? fromMask(n, c.seed, c.bounds, c.mask) : point(n, c.seed, c.bounds)],
};
