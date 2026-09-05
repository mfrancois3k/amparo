/* Amparo service worker — offline after first visit, but always fresh online.
   Page: network-first (you always get the latest deploy when you have signal;
   the cache is only the offline fallback). Audio/img: cache-first (immutable,
   and prepaid-data users must not re-pay for clips they've already played). */
const C = 'amparo-v4';
const CORE = './';
/* The Arena's own offline artifact. A second, unrelated key — not a "./arena/"
   path, an arbitrary cache entry, same as CORE itself is an arbitrary entry
   keyed './' rather than a URL. Kept apart from CORE so an Arena visit can
   never overwrite the pack's fallback, and an offline Arena visit is never
   silently handed the pack instead (see the isArenaPage block below). */
const ARENA_CORE = './arena-offline';
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

  /* /arena (and /rehearse, the same content via a Vercel rewrite) get their own
     handling below rather than a blanket skip: until 2026-09-04 this guard
     covered every /arena/* request outright, which meant Arena audio and fonts
     were never cache-first (no offline voice lines) and — because /rehearse
     did NOT match this prefix — an offline visit to /rehearse fell through to
     the generic navigate branch and silently served the PACK'S cached page,
     the exact "wrong app" failure this file exists to prevent, just not yet
     extended past /app and the literal /arena path. */
  const isArenaPage = sameOrigin && (
    u.pathname === '/arena' || u.pathname.startsWith('/arena/') ||
    u.pathname === '/rehearse' || u.pathname === '/rehearse/'
  );

  /* Pathname-anchored and same-origin. The old test was a substring match on the
     whole URL (`url.includes('/img/')`), which would capture any third-party URL
     that merely CONTAINED /img/ into this cache, and would have grabbed
     /app/img/* too. */
  const isAsset = sameOrigin && (
    u.pathname.startsWith('/audio/') || u.pathname.startsWith('/img/') || u.pathname === '/og.png' ||
    u.pathname.startsWith('/arena/audio/') || u.pathname.startsWith('/arena/fonts/')
  );

  // Page navigations: NETWORK-FIRST so a new deploy shows immediately; cache is
  // only the offline fallback. (The old cache-first behavior is why updates
  // didn't appear.)
  if (e.request.mode === 'navigate') {
    if (isArenaPage) {
      e.respondWith(
        fetch(e.request).then(res => {
          if (res && res.ok) { const clone = res.clone(); caches.open(C).then(c => c.put(ARENA_CORE, clone)); }
          return res;
        }).catch(() => caches.match(ARENA_CORE))
      );
      return;
    }
    /* Only the pack page is the offline artifact for everything else. Until
       2026-09-03 every navigation (/, /aid, /rights/...) overwrote CORE, so one
       visit to the homepage after building a pack replaced the pack's offline
       copy with a page whose CSS and JS were never cached (blind-spot audit,
       "offline is last-page-wins"). The fallback still answers any of those
       offline with the pack: it is the one thing here that works without a
       network — Arena now has its own equivalent instead of sharing this one. */
    const isPack = u.pathname === '/pack' || u.pathname === '/pack/' || u.pathname === '/pack.html';
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok && isPack) { const clone = res.clone(); caches.open(C).then(c => c.put(CORE, clone)); }
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
