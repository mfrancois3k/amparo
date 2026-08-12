import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Amparo /app strangler build — wargames/15 Move 1.1.
//
// base '/app/'      the build is served from a subpath on the SAME origin as the
//                   live single-file app at '/'. Root stays the default entry
//                   until documented parity; this build must never assume '/'.
// outDir '../app'   the compiled output is COMMITTED to the repo at /app, because
//                   the Vercel project is zero-config static with no build step
//                   (DEPLOYMENT.md). Adding a package.json at the repo root would
//                   trip framework auto-detection and could break root deploys —
//                   so the source lives here, outside the served tree.
// emptyOutDir       required: Vite refuses to clear an outDir outside the project
//                   root without it. /app holds build output only, never anything
//                   hand-written.
export default defineConfig({
  plugins: [
    react(),
    /* /app's own service worker + manifest — wargames/15 Move 6.1, LAST of the
       build-order moves on purpose (index.html:5753-5774's comment on why: a
       PWA claiming offline before the rest of the app is proven would be the
       exact quiet-false-claim failure mode Move 0.2 was built to prevent).
       Root's own sw.js is completely untouched by this — different file,
       different scope, different cache names, see Move 0.2's prefix-scoped
       cleanup and the /app passthrough guard it shipped ahead of any /app
       code existing at all. */
    VitePWA({
      /* injectRegister: false — the plugin's default injects an inline
         <script> into index.html, which /app's CSP (script-src 'self', no
         unsafe-inline, see index.html's own comment on why) would block
         outright. Registered manually in main.tsx via virtual:pwa-register
         instead — a same-origin module import, same as every other script
         this build ships. */
      injectRegister: false,
      registerType: 'autoUpdate',
      scope: '/app/',
      manifest: {
        /* A distinct id from root's "/" — same product, but the OS install
           identity must not collide with root's own installable manifest. */
        id: '/app/',
        name: 'Amparo — preview build',
        short_name: 'Amparo (preview)',
        description: 'A free, bilingual traffic-stop pack: your state\'s rules, your documents, and exactly what to say. Print it. Keep it in the glovebox.',
        start_url: '/app/',
        scope: '/app/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF6EE',
        theme_color: '#1B2A4A',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'utilities', 'lifestyle'],
        /* Root's actual icon files, referenced absolute — not copied into
           app-src/public. Same sharing pattern as /audio and /img/scene-*
           established in Moves 4.3/5.2: one set of brand assets, not two. */
        icons: [
          { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/img/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        /* Precache this build's own emitted assets — the same files
           globPatterns would find are already scoped to outDir (../app),
           so this can never reach into root's files by accident. */
        globPatterns: ['**/*.{js,css,html,svg}'],
        /* Runtime cache-first for the shared root assets /app renders but
           does not own — own cache names so Move 0.2's root SW cleanup
           (which deletes every cache NOT named 'amparo-v3') can never touch
           them, and vice versa: this SW only ever manages caches it named
           itself, never root's 'amparo-v3'. */
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^/]+\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'amparo-app-audio',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/[^/]+\/img\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'amparo-app-img',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: '/app/',
  build: {
    outDir: '../app',
    emptyOutDir: true,
  },
})
