import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sifa-web.com',
  // Alle Styles als Dateien ausliefern, damit die CSP ohne 'unsafe-inline' auskommt.
  build: { inlineStylesheets: 'never' },
  trailingSlash: 'always',
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
