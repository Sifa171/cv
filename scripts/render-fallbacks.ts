import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { withPreview } from './lib/preview';
import type { SceneId } from '../src/scene/types';

const SCENES: { scene: SceneId; path: string }[] = [
  { scene: 'cloud', path: '/de/' },
  { scene: 'cluster', path: '/de/' },
  { scene: 'graph', path: '/de/' },
  { scene: 'stream', path: '/de/' },
  { scene: 'pulse', path: '/de/' },
  { scene: 'point', path: '/de/' },
  { scene: 'notfound', path: '/fallback-404/' },
];

mkdirSync('dist/fallback', { recursive: true });

await withPreview(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    for (const { scene, path } of SCENES) {
      await page.goto(`${baseUrl}${path}?scene=${scene}&still=1`);
      await page.waitForFunction(() => document.documentElement.dataset.sceneReady === '1', null, { timeout: 30_000 });
      await page.addStyleTag({ content: 'header, main > *:not(canvas), footer, .counter, .dotnav { visibility: hidden !important; }' });
      const png = await page.screenshot({ type: 'png' });
      await sharp(png).webp({ quality: 60 }).toFile(`dist/fallback/${scene}.webp`);
      console.log(`Standbild: dist/fallback/${scene}.webp`);
    }
  } finally {
    await browser.close();
  }
});
