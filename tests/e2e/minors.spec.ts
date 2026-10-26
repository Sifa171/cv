import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

test('Startfehler der Engine fällt auf Standbilder zurück', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let webglCalls = 0;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl') && ++webglCalls > 1 && this.classList.contains('scene-canvas')) return null;
      return original.call(this, type as '2d', ...(rest as []));
    } as typeof original;
  });
  await page.goto('/de/');
  await expect(page.locator('html')).toHaveClass(/\bno-webgl\b/);
  await expect(page.locator('html')).not.toHaveClass(/(^|\s)webgl(\s|$)/);
  await expect(page.locator('canvas.scene-canvas')).toHaveCount(0);
  const bg = await page.locator('section[data-scene="cloud"]').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('/fallback/cloud.webp');
  expect(await page.locator('.commit-graph-svg').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('Canvas nutzt die Breite ohne Scrollbalken', async ({ page }) => {
  await page.goto('/de/?debug=1');
  await expect(page.locator('html')).toHaveClass(/(^|\s)webgl(\s|$)/);
  await page.waitForFunction(() => (window as { __cvScene?: { anchorsVersion: number } }).__cvScene!.anchorsVersion >= 2);
  const { canvas, client } = await page.evaluate(() => ({
    canvas: (document.querySelector('canvas.scene-canvas') as HTMLCanvasElement).width / Math.min(devicePixelRatio, 2),
    client: document.documentElement.clientWidth,
  }));
  expect(Math.round(canvas)).toBe(client);
});

test('404 zeigt den aufgerufenen Pfad und zeichnet Deutsch aus', async ({ page }) => {
  await page.goto('/nirgendwo/');
  await expect(page.locator('main')).toContainText('curl -I /nirgendwo/');
  await expect(page.locator('main span[lang="de"]')).toContainText('Seite nicht gefunden');
});

test('Hero-Zeile kommt aus dem Profil', async ({ page }) => {
  const profile = parse(readFileSync('src/content/profile.yaml', 'utf8')).main;
  for (const lang of ['de', 'en'] as const) {
    await page.goto(`/${lang}/`);
    await expect(page.locator('#start .section__label')).toHaveText(`—— ${profile.name} · ${profile.tagline[lang]}`);
  }
});

test('keine Inline-Styles im HTML, CSP ohne unsafe-inline', async ({ request }) => {
  expect(readFileSync('public/_headers', 'utf8')).not.toContain("'unsafe-inline'");
  for (const path of ['/de/', '/en/', '/de/cv/', '/de/impressum/', '/nirgendwo/']) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toMatch(/ style="/);
    expect(html, path).not.toMatch(/<style[\s>]/);
  }
});

test('Commit-Knoten sitzen in ihrer Spur', async ({ page }) => {
  await page.goto('/de/');
  const lanes = await page.locator('#career .commit').evaluateAll((els) =>
    els.map((el) => {
      const cell = el.querySelector('.commit__graph')!.getBoundingClientRect();
      const node = el.querySelector('.commit-node')!.getBoundingClientRect();
      return { branch: (el as HTMLElement).dataset.branch, x: (node.left + node.width / 2 - cell.left) / cell.width };
    }),
  );
  const expected: Record<string, number> = { sag: 1 / 6, viada: 3 / 6, redhat: 5 / 6 };
  for (const l of lanes) expect(l.x).toBeCloseTo(expected[l.branch!]!, 1);
});
