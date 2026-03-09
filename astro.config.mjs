import { defineConfig } from 'astro/config';
import path from 'path';
import svelte from "@astrojs/svelte";
import AstroPWA from '@vite-pwa/astro';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';
const base = isProd ? '/KaffeKompis/' : '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://kimbranzell.github.io',
  base: base,
  build: {
    assets: 'assets'
  },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
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
  react()
]
});