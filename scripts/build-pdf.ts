import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { withPreview } from './lib/preview';

mkdirSync('dist/cv', { recursive: true });

await withPreview(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const lang of ['de', 'en']) {
      await page.goto(`${baseUrl}/${lang}/cv/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const path = `dist/cv/sebastian-dehn-cv-${lang}.pdf`;
      await page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true });
      console.log(`PDF: ${path}`);
    }
  } finally {
    await browser.close();
  }
});
