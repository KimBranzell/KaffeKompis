import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { PRODUCTION_BASE, SITE_URL } from './site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  base: process.env.NODE_ENV === 'production' ? PRODUCTION_BASE : '/',
  build: { assets: 'assets' },
  prefetch: true,
  vite: { plugins: [tailwindcss()] },
  integrations: [svelte()],
});
