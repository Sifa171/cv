import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sifa-web.com',
  trailingSlash: 'always',
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
