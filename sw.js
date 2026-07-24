/* Amparo service worker — offline after first visit, but always fresh online.
   Page: network-first (you always get the latest deploy when you have signal;
   the cache is only the offline fallback). Audio/img: cache-first (immutable,
   and prepaid-data users must not re-pay for clips they've already played). */
const C = 'amparo-v2';
const CORE = './';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.add(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  const isAsset = url.includes('/audio/') || url.includes('/img/') || url.endsWith('og.png');

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
