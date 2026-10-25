/// <reference types="astro/client" />

// tsc (ohne Astro-Sprachserver) kennt .astro-Importe in Unit-Tests nicht.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const component: AstroComponentFactory;
  export default component;
}
