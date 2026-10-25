import { expect, test } from '@playwright/test';

for (const lang of ['de', 'en'] as const) {
  test.describe(`Laufbahn ${lang}`, () => {
    test('8 Commits, HEAD oben, Typen und Jahre', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const commits = page.locator('#career .commit');
      await expect(commits).toHaveCount(8);
      await expect(commits.first()).toContainText('HEAD →');
      await expect(commits.first()).toContainText('Account Executive');
      await expect(commits.last()).toContainText('init:');
      await expect(commits.nth(3)).toContainText('merge:');
      await expect(commits.last()).toContainText('2011');
      for (const c of await commits.all()) {
        await expect(c.locator('.hash')).toHaveText(/^[0-9a-f]{4}$/);
        await expect(c.locator('.commit-node')).toHaveCount(1);
      }
    });

    test('Diff öffnet per Klick und per Tastatur', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const first = page.locator('#career .commit details').first();
      await first.locator('summary').click();
      await expect(first).toHaveAttribute('open', '');
      const second = page.locator('#career .commit details').nth(1);
      await second.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(second).toHaveAttribute('open', '');
    });

    test.describe('schmaler Bildschirm', () => {
      test.use({ viewport: { width: 375, height: 812 } });
      test('kein horizontales Scrollen mit offenen Diffs', async ({ page }) => {
        await page.goto(`/${lang}/`);
        for (const d of await page.locator('#career details').all()) await d.evaluate((el) => el.setAttribute('open', ''));
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
      });
    });
  });
}
