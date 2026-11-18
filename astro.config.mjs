import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://chainshirts.example.com',
  integrations: [preact(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Islands are separate Vite entries; without an explicit chunk the
          // storage adapter and its state are duplicated per island.
          manualChunks(id) {
            if (id.includes('/src/lib/')) return 'store-core';
            return undefined;
          },
        },
      },
    },
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  devToolbar: {
    enabled: false,
  },
});
