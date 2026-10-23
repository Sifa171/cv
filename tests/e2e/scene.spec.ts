import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __cvScene?: { anchorsVersion: number; count: number };
  }
}

test.describe('Partikelszene', () => {
  test('läuft mit WebGL: ein verstecktes Canvas, html.webgl, keine Konsolenfehler', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/de/?debug=1');
    await expect(page.locator('html')).toHaveClass(/\bwebgl\b/);
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('misst Anker nach dem Laden der Schriften und nach Größenänderung neu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/de/?debug=1');
    await page.waitForFunction(() => (window.__cvScene?.anchorsVersion ?? 0) >= 1);
    const before = await page.evaluate(() => window.__cvScene!.anchorsVersion);
    await page.setViewportSize({ width: 800, height: 800 });
    await page.waitForFunction((v) => window.__cvScene!.anchorsVersion > v, before);
  });

  test('Skills bleiben als Text lesbar', async ({ page }) => {
    await page.goto('/de/?debug=1');
    await expect(page.locator('html')).toHaveClass(/\bwebgl\b/);
    await page.locator('#profile').scrollIntoViewIfNeeded();
    await expect(page.locator('#profile .skill[data-skill="OpenShift"]')).toBeVisible();
  });

  test.describe('reduzierte Bewegung', () => {
    test.use({ reducedMotion: 'reduce' });
    test('kein Canvas, html.no-webgl', async ({ page }) => {
      await page.goto('/de/');
      await expect(page.locator('html')).toHaveClass(/\bno-webgl\b/);
      await expect(page.locator('canvas')).toHaveCount(0);
    });
  });

  test('404-Seite bekommt ebenfalls die Szene', async ({ page }) => {
    await page.goto('/nirgendwo/');
    await expect(page.locator('html')).toHaveClass(/\bwebgl\b/);
    await expect(page.locator('canvas')).toHaveCount(1);
  });
});
