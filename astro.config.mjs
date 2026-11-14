import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Set SITE_URL at build time (e.g. https://robertomendoza.dev) for canonical/OG URLs.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  build: { inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()] },
});
