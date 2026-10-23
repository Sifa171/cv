import { expect, test } from '@playwright/test';

for (const lang of ['de', 'en'] as const) {
  test(`/${lang}/ rendert mit Sprache, Hintergrund und ohne fremde Hosts`, async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (req) => {
      const host = new URL(req.url()).hostname;
      if (host !== 'localhost' && !req.url().startsWith('data:')) foreign.push(req.url());
    });
    const res = await page.goto(`/${lang}/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(6, 7, 10)');
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
  });
}
