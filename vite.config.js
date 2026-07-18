import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

// Build stamp used to cache-bust the references in index.html on every build.
const BUILD_VERSION = Date.now().toString()

// Appends ?v=<build> to local asset references in index.html (incl. the
// PWA-injected manifest/registerSW tags) so browsers fetch fresh after a deploy.
// The service worker is told to ignore the `v` param (see workbox below), so the
// precache still matches and offline keeps working.
const cacheBustHtml = {
  name: 'cache-bust-html',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(/\b(src|href)="([^"]+)"/g, (m, attr, url) => {
        if (/^(https?:)?\/\//i.test(url) || /^(data:|mailto:|tel:|#)/i.test(url)) return m
        const sep = url.includes('?') ? '&' : '?'
        return `${attr}="${url}${sep}v=${BUILD_VERSION}"`
      })
    },
  },
}

// Relative base so the build works on GitHub Pages project sites
// (https://<user>.github.io/<repo>/) without hard-coding the repo name.
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the service worker ourselves (see src/main.js) so we can add
      // periodic update checks; disable the auto-injected registration script.
      injectRegister: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Kalender Aboge',
        short_name: 'Aboge',
        description: 'Sistem penanggalan Jawa — siklus windu 8 tahun, neptu, dan hari baik.',
        lang: 'id',
        categories: ['utilities', 'lifestyle', 'education'],
        theme_color: '#1c1a16',
        background_color: '#f4efe4',
        display: 'standalone',
        orientation: 'portrait',
        // base is './', so icon paths are relative to the deploy directory
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screenshot-mobile.png', sizes: '412x820', type: 'image/png', form_factor: 'narrow', label: 'Kalender Masehi ↔ Aboge' },
          { src: 'screenshot-wide.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'Kalender Aboge' },
        ],
      },
      workbox: {
        // Precache the whole app shell (fonts now self-hosted as woff2) for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        // Ignore the cache-bust `v` param when matching precached assets
        ignoreURLParametersMatching: [/^v$/, /^utm_/, /^fbclid$/],
      },
    }),
    cacheBustHtml,
  ],
})
