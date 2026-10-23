import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const scene of ['cloud', 'cluster', 'graph', 'stream', 'pulse']) {
  test(`Standbild für ${scene} bei reduzierter Bewegung`, async ({ page, request }) => {
    await page.goto('/de/');
    const bg = await page.locator(`section[data-scene="${scene}"]`).evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain(`/fallback/${scene}.webp`);
    const res = await request.get(`/fallback/${scene}.webp`);
    expect(res.status()).toBe(200);
    expect((await res.body()).length).toBeLessThan(200 * 1024);
  });
}
