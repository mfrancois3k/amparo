/* Amparo service worker — offline after first visit, but always fresh online.
   Page: network-first (you always get the latest deploy when you have signal;
   the cache is only the offline fallback). Audio/img: cache-first (immutable,
   and prepaid-data users must not re-pay for clips they've already played). */
const C = 'amparo-v3';
const CORE = './';
/* Precached alongside the shell: without these the install prompt and the
   home-screen icon fail on a cold/offline start, which is the exact moment
   an installed pack has to work. */
const EXTRA = [
  './manifest.webmanifest',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-maskable-512.png',
  './img/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // addAll is atomic — one 404 would reject the whole install, so the icons are
  // added individually and allowed to fail without blocking the shell.
  e.waitUntil(caches.open(C).then(c =>
    c.add(CORE).catch(() => {}).then(() =>
      Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))
    )
  ).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      /* Prefix-scoped, NOT "everything that isn't C". This handler used to delete
         every cache on the origin, which would have wiped the /app build's
         Workbox precache (workbox-*) on every deploy — and a cron commits to
         this repo daily, so /app would have silently lost offline capability
         once a day while still claiming to have it. Old amparo-v1/v2 shells
         still get cleaned, which is all this was ever for. See wargames/15. */
      .then(ks => Promise.all(ks.filter(k => k.startsWith('amparo-') && k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  let u;
  try { u = new URL(e.request.url); } catch (err) { return; }
  const sameOrigin = u.origin === self.location.origin;

  /* /app is the strangler build (wargames/15). It owns its own service worker,
     its own scope and its own caches — this one must not touch it. Without this
     guard, ONE online visit to /app would hand its HTML to the navigation
     handler below, which stores every successful navigation under CORE — so the
     root app's offline fallback would start serving the wrong app. Leave this in
     place for as long as anything is served from /app. */
  if (sameOrigin && (u.pathname === '/app' || u.pathname.startsWith('/app/'))) return;

  /* /arena is the standalone Practice Arena page (own storage, own audio).
     Same reasoning as /app above: without this guard one visit to /arena/
     would overwrite CORE with the arena's HTML and the offline fallback
     would serve the wrong app. */
  if (sameOrigin && (u.pathname === '/arena' || u.pathname.startsWith('/arena/'))) return;

  /* Pathname-anchored and same-origin. The old test was a substring match on the
     whole URL (`url.includes('/img/')`), which would capture any third-party URL
     that merely CONTAINED /img/ into this cache, and would have grabbed
     /app/img/* too. */
  const isAsset = sameOrigin && (
    u.pathname.startsWith('/audio/') || u.pathname.startsWith('/img/') || u.pathname === '/og.png'
  );

  // Page navigations: NETWORK-FIRST so a new deploy shows immediately; cache is
  // only the offline fallback. (The old cache-first behavior is why updates
  // didn't appear.)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok) { const clone = res.clone(); caches.open(C).then(c => c.put(CORE, clone)); }
        return res;
      }).catch(() => caches.match(CORE))
    );
    return;
  }

  // Immutable assets (voice clips, officer photos, og image): cache-first.
  if (isAsset) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res && res.ok) { const clone = res.clone(); caches.open(C).then(c => c.put(e.request, clone)); }
        return res;
      }))
    );
    return;
  }

  // Everything else: network, fall back to cache when offline.
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
