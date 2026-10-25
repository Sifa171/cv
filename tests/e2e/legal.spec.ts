import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/de/impressum/', other: '/en/imprint/' },
  { path: '/en/imprint/', other: '/de/impressum/' },
  { path: '/de/datenschutz/', other: '/en/privacy/' },
  { path: '/en/privacy/', other: '/de/datenschutz/' },
];

for (const { path, other } of PAGES) {
  test(`${path} erreichbar und mit Gegenseite verbunden`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('header [data-lang-switch]')).toHaveAttribute('href', other);
  });
}

test('Impressum enthält Angaben nach § 5 DDG mit Name und Kontakt', async ({ page }) => {
  for (const [path, contact] of [['/de/impressum/', 'Kontakt'], ['/en/imprint/', 'Contact']]) {
    await page.goto(path);
    await expect(page.locator('main h2').first()).toContainText('§ 5 DDG');
    await expect(page.locator('main')).toContainText('Sebastian Dehn');
    await expect(page.locator('main h2').nth(1)).toHaveText(contact!);
  }
});

test('Datenschutz nennt Cloudflare, Server-Logs und keine Cookies', async ({ page }) => {
  await page.goto('/de/datenschutz/');
  await expect(page.locator('main')).toContainText('Cloudflare');
  await expect(page.locator('main')).toContainText('Server-Logs');
  await expect(page.locator('main')).toContainText('keine Cookies');
  await page.goto('/en/privacy/');
  await expect(page.locator('main')).toContainText('Cloudflare');
  await expect(page.locator('main')).toContainText('server logs');
  await expect(page.locator('main')).toContainText('no cookies');
});

test('unbekannter Pfad zeigt die 404-Seite', async ({ page }) => {
  const res = await page.goto('/gibt-es-nicht/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('main')).toContainText('404 Not Found');
  await expect(page.locator('section[data-scene="notfound"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/de/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/en/"]')).toHaveCount(1);
});

test('Impressum-E-Mail ist von der Cloudflare-Verschleierung ausgenommen', async ({ request }) => {
  for (const path of ['/de/impressum/', '/en/imprint/']) {
    const html = await (await request.get(path)).text();
    expect(html).toMatch(/<!--email_off--><a href="mailto:impressum@sifa-web\.com">impressum@sifa-web\.com<\/a><!--\/email_off-->/);
  }
});
