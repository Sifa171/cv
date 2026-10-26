import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const PROJECTS = readdirSync('src/content/projects').map((f) => parse(readFileSync(`src/content/projects/${f}`, 'utf8')));

const SKILLS = ['OpenShift', 'Kubernetes', 'Ansible', 'Red Hat Enterprise Linux', 'Docker', 'Java', 'Shell', 'DevOps'];
const IDS = ['start', 'profile', 'career', 'projects', 'offduty', 'contact'];

for (const lang of ['de', 'en'] as const) {
  test.describe(`Abschnitte ${lang}`, () => {
    test('alle Abschnitte in Reihenfolge mit Inhalt', async ({ page }) => {
      await page.goto(`/${lang}/`);
      expect(await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id))).toEqual(IDS);
      await expect(page.locator('#start h1')).toBeVisible();
      await expect(page.locator('#start')).toContainText('Sebastian Dehn');
      await expect(page.locator('#start')).toContainText('Account Executive');
      for (const skill of SKILLS) await expect(page.locator(`#profile .skill[data-skill="${skill}"]`)).toHaveCount(1);
      await expect(page.locator('#profile dl')).toContainText(/uptime:\s*\d+y/);
      await expect(page.locator('#profile dl')).toContainText(/roles:\s*8/);
      for (const name of ['Katria', 'Homelab', 'sifa-web.com']) await expect(page.locator('#projects')).toContainText(name);
      await expect(page.locator('#projects a[href="https://github.com/Sifa171/cv"]')).toHaveCount(1);
      for (const p of PROJECTS.filter((p) => !p.url && !p.repo)) await expect(page.locator(`#projects [data-project="${p.id}"] a`)).toHaveCount(0);
      await expect(page.locator('#offduty')).toContainText('Triathlon');
      await expect(page.locator('#offduty')).toContainText('MGM Grand');
      expect(await page.locator('#offduty [data-offduty]').evaluateAll((els) => els.map((e) => e.getAttribute('data-offduty')))).toEqual(['triathlon', 'stage']);
      await expect(page.locator('#contact a[href="https://www.linkedin.com/in/sdehn/"]')).toHaveCount(1);
      await expect(page.locator('#contact a[href$=".pdf"]')).toHaveCount(1);
      expect(await page.locator('body').innerText()).not.toContain('undefined');
    });

    test.describe('ohne JavaScript', () => {
      test.use({ javaScriptEnabled: false });
      test('alle Texte sichtbar', async ({ page }) => {
        await page.goto(`/${lang}/`);
        for (const id of IDS) await expect(page.locator(`#${id} .section__headline`)).toBeVisible();
        await expect(page.locator('#profile .skill').first()).toBeVisible();
        await expect(page.locator('#offduty')).toContainText('MGM Grand');
      });
    });

    test.describe('schmaler Bildschirm', () => {
      test.use({ viewport: { width: 375, height: 812 } });
      test('kein horizontales Scrollen', async ({ page }) => {
        await page.goto(`/${lang}/`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
      });
    });
  });
}
