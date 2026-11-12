import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// `base` must match where GitHub Pages serves the site.
// Repo "omar-elhallam.github.io" is a *user site*, served from the domain root → base '/'.
// If you ever move this to a project repo (e.g. "portfolio-v2"), change it to '/portfolio-v2/'.
export default defineConfig({
  base: '/',
  // Preact via preact/compat: same React API, ~55 KB (gzip) less JavaScript on slow connections.
  plugins: [preact(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
  },
})
