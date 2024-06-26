import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import purgecss from "astro-purgecss";
import AstroPWA from '@vite-pwa/astro';

import criticalCss from "astro-critical-css";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
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
    content: [process.cwd() + '/src/**/*.{astro,svelte}' // Watching astro and vue sources (for SSR, read the note below)
    ]
  }), criticalCss()],
  renderers: ['@astrojs/renderer-preact', '@astrojs/renderer-svelte']
});