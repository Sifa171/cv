import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const TITLES = {
  de: ['Account Executive – Commercial Germany', 'Solution Architect Partner Enablement', 'Consultant', 'Softwareentwickler', 'Auszubildender Softwareentwickler', 'Werkstudent'],
  en: ['Account Executive – Commercial Germany', 'Solution Architect Partner Enablement', 'Consultant', 'Software Developer', 'Apprentice Software Developer', 'Student Assistant'],
};

async function pdfText(path: string): Promise<{ pages: number; text: string }> {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(path)) }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
  }
  return { pages: doc.numPages, text: text.replace(/\s+/g, ' ') };
}

for (const lang of ['de', 'en'] as const) {
  test(`PDF ${lang}: höchstens 2 Seiten, Name und alle Stationen`, async () => {
    const { pages, text } = await pdfText(`dist/cv/sebastian-dehn-cv-${lang}.pdf`);
    expect(pages).toBeLessThanOrEqual(2);
    expect(text).toContain('Sebastian Dehn');
    for (const title of TITLES[lang]) expect(text).toContain(title);
    expect(text).toContain('Solution Architect – Commercial Germany');
  });

  test(`Druckfassung /${lang}/cv/ ist hell und ohne Canvas`, async ({ page }) => {
    await page.goto(`/${lang}/cv/`);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.cv-role')).toHaveCount(8);
  });
}
