// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Local D1 (SQLite) writes under .wrangler on every query, which
        // otherwise triggers an infinite dev-server reload loop.
        ignored: ['**/.wrangler/**']
      }
    }
  },

  adapter: cloudflare()
});