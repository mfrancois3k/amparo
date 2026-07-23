/* Amparo service worker — offline after first visit.
   Core page cached on install; audio/img cached as encountered (never bulk-
   downloaded: prepaid-data users must not pay for clips they haven't played). */
const C = 'amparo-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok && (url.includes('/audio/') || url.includes('/img/') || url.endsWith('og.png') || e.request.mode === 'navigate')) {
          const clone = res.clone();
          caches.open(C).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => hit || caches.match('./'));
      return hit || net;
    })
  );
});
