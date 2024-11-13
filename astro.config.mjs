import { defineConfig } from 'astro/config';
import path from 'path';
import svelte from "@astrojs/svelte";
import purgecss from "astro-purgecss";
import AstroPWA from '@vite-pwa/astro';
import criticalCss from "astro-critical-css";
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://kimbranzell.github.io',
  base: process.env.NODE_ENV === 'production' ? '/Kaffekompis' : '',
  build: {
    assets: 'assets'
  },
  prefetch: true,
  vite: {
    resolve: {
      alias: {
        '$lib': path.resolve('./src')
      }
    }
  },
  integrations: [svelte(), AstroPWA({
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
      name: 'KaffeKompis',
      short_name: 'Kaffe',
      description: 'Din guide till en bättre bryggning',
      theme_color: '#ffffff',
      icons: [{
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }, {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }]
    }
  }), purgecss({
    fontFace: true,
    keyframes: true,
    safelist: ['random', 'yep', 'button', /^nav-/],
    blocklist: ['usedClass', /^nav-/],
    content: [
      process.cwd() + '/src/**/*.{astro,svelte}' // Watching astro and vue sources (for SSR, read the note below)
    ]
  }), criticalCss(), tailwind({
    applyBaseStyles: false,
  }), react()],
  renderers: ['@astrojs/renderer-preact', '@astrojs/renderer-svelte']
});