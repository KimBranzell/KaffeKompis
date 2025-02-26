import { defineConfig } from 'astro/config';
import path from 'path';
import svelte from "@astrojs/svelte";
import purgecss from "astro-purgecss";
import AstroPWA from '@vite-pwa/astro';
import criticalCss from "astro-critical-css";
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const isProd = process.env.NODE_ENV === 'production';
const base = isProd ? '/KaffeKompis' : '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://kimbranzell.github.io',
  base: base,
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
  integrations: [svelte(),
  AstroPWA({
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
  }),
  // purgecss({
  //   fontFace: true,
  //   keyframes: true,
  //   safelist: ['random', 'yep', 'button', /^nav-/],
  //   blocklist: ['usedClass', /^nav-/],
  //   content: [
  //     process.cwd() + '/src/**/*.{astro,svelte,jsx,tsx,js,ts}',
  //     process.cwd() + '/src/**/*.{css,scss}',
  //   ]
  // }),
  tailwind({
    applyBaseStyles: true,
  }),
  react()
],
  renderers: ['@astrojs/renderer-preact', '@astrojs/renderer-svelte']
});