import { expect, test } from '@playwright/test';

test('Anker werden nach Layoutänderung (Diff öffnen) neu gemessen', async ({ page }) => {
  await page.goto('/de/?debug=1');
  await page.waitForFunction(() => (window.__cvScene?.anchorsVersion ?? 0) >= 2);
  const before = await page.evaluate(() => window.__cvScene!.anchorsVersion);
  await page.locator('#career details summary').first().click();
  await page.waitForFunction((v) => window.__cvScene!.anchorsVersion > v, before, { timeout: 3000 });
});

test.describe('Landung auf einem Anker', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('/en/#career endet bei #career, auch mit WebGL', async ({ page }) => {
    await page.goto('/en/?debug=1#career');
    await page.waitForFunction(() => (window.__cvScene?.anchorsVersion ?? 0) >= 2);
    await page.waitForTimeout(1200);
    const top = await page.locator('#career').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(top)).toBeLessThanOrEqual(2);
  });
});

test('Sprachwechsel behält den sichtbaren Abschnitt auch ohne Hash', async ({ page }) => {
  await page.goto('/de/');
  await page.locator('#career').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(page.locator('[data-counter-index]')).toHaveText('02');
  await page.locator('header [data-lang-switch]').click();
  await expect(page).toHaveURL(/\/en\/#career$/);
});

test('keine kaputten internen Links', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const start of ['/de/', '/en/', '/de/cv/', '/en/cv/', '/de/impressum/', '/en/privacy/']) {
    await page.goto(start);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => (a as HTMLAnchorElement).pathname));
    for (const h of hrefs) seen.add(h);
  }
  for (const path of seen) expect((await request.get(path)).status(), path).toBe(200);
});
