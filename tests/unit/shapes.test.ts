import { describe, expect, it } from 'vitest';
import { cloud } from '../../src/scene/shapes/cloud';
import { cluster, clusterNodes } from '../../src/scene/shapes/cluster';
import { graph } from '../../src/scene/shapes/graph';
import { fromMask } from '../../src/scene/shapes/mask';
import { point } from '../../src/scene/shapes/point';
import { signalPulse, signalSpectrum, signalStream } from '../../src/scene/shapes/signal';
import type { Anchor, Bounds } from '../../src/scene/shapes/types';

const B: Bounds = { width: 16, height: 9 };
const D = Math.min(B.width, B.height) / 4;
const ANCHORS: Anchor[] = [
  { x: -5, y: 3 },
  { x: -4, y: 1 },
  { x: -3, y: -1 },
  { x: -5, y: -3 },
];
const nodes = clusterNodes(8, 7, B);
const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];
const singlePixel = { width: 4, height: 4, alpha: new Uint8ClampedArray(16).map((_, i) => (i === 5 ? 255 : 0)) };

const SHAPES: Record<string, (count: number, seed: number) => Float32Array> = {
  cloud: (n, s) => cloud(n, s, B),
  cluster: (n, s) => cluster(n, s, B, nodes, edges),
  graph: (n, s) => graph(n, s, B, ANCHORS),
  signalStream: (n, s) => signalStream(n, s, B),
  signalPulse: (n, s) => signalPulse(n, s, B),
  signalSpectrum: (n, s) => signalSpectrum(n, s, B),
  point: (n, s) => point(n, s, B),
  fromMask: (n, s) => fromMask(n, s, B, singlePixel),
};

function inBounds(p: Float32Array): boolean {
  for (let i = 0; i < p.length; i += 3) {
    if (Math.abs(p[i]!) > B.width / 2 + 1e-6 || Math.abs(p[i + 1]!) > B.height / 2 + 1e-6 || Math.abs(p[i + 2]!) > D + 1e-6) return false;
  }
  return true;
}

describe.each(Object.entries(SHAPES))('%s', (_, shape) => {
  it('liefert count*3 Werte im Rahmen', () => {
    const p = shape(1000, 7);
    expect(p).toHaveLength(3000);
    expect(inBounds(p)).toBe(true);
  });
  it('ist deterministisch und hängt vom Seed ab', () => {
    expect(shape(1000, 7)).toEqual(shape(1000, 7));
    expect(shape(1000, 7)).not.toEqual(shape(1000, 8));
  });
  it('liefert bei count 0 ein leeres Array', () => {
    expect(shape(0, 7)).toHaveLength(0);
  });
});

describe('graph', () => {
  it('sammelt um jeden Anker mindestens 20 Punkte im Radius 0,2', () => {
    const p = graph(1000, 7, B, ANCHORS);
    for (const a of ANCHORS) {
      let n = 0;
      for (let i = 0; i < p.length; i += 3) if (Math.hypot(p[i]! - a.x, p[i + 1]! - a.y) <= 0.2) n++;
      expect(n).toBeGreaterThanOrEqual(20);
    }
  });
});

describe('clusterNodes', () => {
  it('liefert n Knoten im Rahmen mit Mindestabstand', () => {
    expect(nodes).toHaveLength(8);
    for (const a of nodes) {
      expect(Math.abs(a.x)).toBeLessThanOrEqual(B.width / 2);
      expect(Math.abs(a.y)).toBeLessThanOrEqual(B.height / 2);
    }
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        expect(Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y)).toBeGreaterThanOrEqual(0.1 * B.width);
  });
});

describe('fromMask', () => {
  it('legt alle Punkte in die gesetzte Zelle', () => {
    const p = fromMask(500, 7, B, singlePixel);
    for (let i = 0; i < p.length; i += 3) {
      expect(p[i]).toBeGreaterThanOrEqual(-B.width / 2 + B.width / 4);
      expect(p[i]).toBeLessThanOrEqual(-B.width / 2 + B.width / 2);
      expect(p[i + 1]).toBeGreaterThanOrEqual(B.height / 2 - B.height / 2);
      expect(p[i + 1]).toBeLessThanOrEqual(B.height / 2 - B.height / 4);
    }
  });
});

describe('SHAPES', async () => {
  const { SHAPES } = await import('../../src/scene/shapes/index');
  const ctx = { bounds: B, seed: 7, clusterNodes: nodes, clusterEdges: edges, graphAnchors: ANCHORS, mask: singlePixel };
  it('liefert je Szene Puffer; pulse hat zwei (Puls, Spektrum)', () => {
    for (const scene of ['cloud', 'cluster', 'graph', 'stream', 'point', 'notfound'] as const) {
      const buffers = SHAPES[scene](100, ctx);
      expect(buffers).toHaveLength(1);
      expect(buffers[0]).toHaveLength(300);
    }
    expect(SHAPES.pulse(100, ctx)).toHaveLength(2);
  });
});
