import { expect, test } from '@playwright/test';

const other = { de: 'en', en: 'de' } as const;

for (const lang of ['de', 'en'] as const) {
  test.describe(`Seitenrahmen ${lang}`, () => {
    test('hreflang-Links sind vollständig und absolut', async ({ page }) => {
      await page.goto(`/${lang}/`);
      for (const [hl, href] of [
        ['de', 'https://sifa-web.com/de/'],
        ['en', 'https://sifa-web.com/en/'],
        ['x-default', 'https://sifa-web.com/'],
      ]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${hl}"]`)).toHaveAttribute('href', href);
      }
    });

    test('Sprachumschalter zeigt auf die Gegenseite und behält den Anker', async ({ page }) => {
      await page.goto(`/${lang}/#career`);
      const sw = page.locator('header [data-lang-switch]');
      await expect(sw).toHaveAttribute('href', `/${other[lang]}/`);
      await sw.click();
      await expect(page).toHaveURL(new RegExp(`/${other[lang]}/#career$`));
    });

    test('Navigation mit Logo, PDF, LinkedIn und GitHub', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const nav = page.locator('header');
      await expect(nav).toContainText('⟨sd⟩');
      await expect(nav.getByRole('link', { name: lang === 'de' ? 'Lebenslauf ↓' : 'Résumé ↓' })).toHaveAttribute(
        'href',
        `/cv/sebastian-dehn-cv-${lang}.pdf`,
      );
      for (const [name, href] of [
        ['LinkedIn', 'https://www.linkedin.com/in/sdehn/'],
        ['GitHub', 'https://github.com/Sifa171'],
      ]) {
        const link = nav.getByRole('link', { name });
        await expect(link).toHaveAttribute('href', href);
        await expect(link).toHaveAttribute('rel', 'me noopener');
      }
    });

    test('Fußzeile verlinkt Impressum und Datenschutz der Sprache', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const footer = page.locator('footer');
      const legal = lang === 'de' ? ['/de/impressum/', '/de/datenschutz/'] : ['/en/imprint/', '/en/privacy/'];
      for (const href of legal) await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    });

    test('Abschnittszähler folgt dem sichtbaren Abschnitt', async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator('[data-counter-index]')).toHaveText('00');
      await page.locator('#career').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-counter-index]')).toHaveText('02');
      await expect(page.locator('.dotnav a[aria-current="true"]')).toHaveAttribute('href', '#career');
    });
  });
}
