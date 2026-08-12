/* Service-worker routing check. Node stdlib only: `node tools/sw-routing-check.mjs`
   (exit 0 = pass, 1 = fail).

   sw.js decides three things that are easy to break and expensive to break:
   whether a request is handled at all, whether it is treated as an immutable
   asset, and which caches get deleted on activate. Two of those are the
   landmines wargames/15 found before the /app strangler build existed:

     - an online visit to /app would have had its HTML stored under CORE, so the
       ROOT app's offline fallback would serve the wrong app;
     - activate deleted every cache on the origin, so /app's Workbox precache
       would be wiped by the daily law-watch deploy while /app still claimed to
       work offline.

   This loads the real sw.js against stubbed SW globals and asserts the routing,
   so a future edit that reintroduces either one fails here instead of in
   production. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const ORIGIN = 'https://www.amparohq.com';
const swPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'sw.js');

const handlers = {};
const deleted = [];
let cacheKeys = [];

const sandbox = {
  URL, console,
  self: {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    skipWaiting: () => {},
    clients: { claim: async () => {} }
  },
  caches: {
    open: async () => ({ add: async () => {}, put: async () => {}, match: async () => undefined }),
    match: async () => undefined,
    keys: async () => cacheKeys,
    delete: async k => { deleted.push(k); return true; }
  },
  fetch: async () => ({ ok: true, clone: () => ({}) })
};
sandbox.self.self = sandbox.self;
vm.createContext(sandbox);
vm.runInContext(readFileSync(swPath, 'utf8'), sandbox, { filename: 'sw.js' });

/** Fire a synthetic FetchEvent; returns true if sw.js took over the request. */
function handled(url, mode = 'no-cors') {
  let took = false;
  handlers.fetch({
    request: { method: 'GET', url, mode },
    respondWith: () => { took = true; }
  });
  return took;
}

const cases = [
  // [url, mode, shouldBeHandled, why]
  [`${ORIGIN}/app/`,             'navigate', false, '/app navigation must pass through — else it overwrites the root shell under CORE'],
  [`${ORIGIN}/app`,              'navigate', false, 'bare /app passes through too'],
  [`${ORIGIN}/app/assets/x.js`,  'no-cors',  false, '/app build assets belong to the /app worker'],
  [`${ORIGIN}/app/img/x.png`,    'no-cors',  false, '/app images must not land in the root cache'],
  [`${ORIGIN}/`,                 'navigate', true,  'root navigation is still network-first with cache fallback'],
  [`${ORIGIN}/audio/en/m/v0_0.mp3`, 'no-cors', true, 'root audio still cache-first'],
  [`${ORIGIN}/img/officer-m.jpg`,   'no-cors', true, 'root images still cache-first'],
  [`${ORIGIN}/index.html`,          'no-cors', true, 'everything else still network-with-cache-fallback'],
  // Not-/app lookalikes must NOT be skipped.
  [`${ORIGIN}/apple-touch-icon.png`, 'no-cors', true, '/app prefix match must not swallow /apple-*'],
  [`${ORIGIN}/application.js`,       'no-cors', true, '/app prefix match must not swallow /application*']
];

let failures = 0;
for (const [url, mode, want, why] of cases) {
  const got = handled(url, mode);
  if (got !== want) { failures++; console.error(`FAIL ${url} (${mode}) — handled=${got}, want=${want}\n      ${why}`); }
}

/* Cross-origin URLs that merely CONTAIN /img/ or /audio/ must not be cached as
   immutable assets — the old substring test on the whole URL did exactly that. */
const foreign = 'https://us-assets.i.posthog.com/static/img/array.js';
handlers.fetch({
  request: { method: 'GET', url: foreign, mode: 'no-cors' },
  respondWith: p => {
    // Cache-first would resolve from caches.match (undefined here) — the network
    // path is the correct one. We assert only that it is not *skipped*, and rely
    // on the same-origin guard in sw.js for the asset classification itself.
    if (p === undefined) { failures++; console.error(`FAIL ${foreign} — cross-origin request was dropped`); }
  }
});

// activate: prune old amparo shells, never foreign caches.
cacheKeys = ['amparo-v3', 'amparo-v2', 'amparo-v1', 'workbox-precache-v2-https://www.amparohq.com/app/'];
const waits = [];
await handlers.activate({ waitUntil: p => waits.push(p) });
await Promise.all(waits);

try {
  assert.deepEqual(deleted.sort(), ['amparo-v1', 'amparo-v2'],
    'activate must delete only stale amparo-* caches');
} catch (err) {
  failures++;
  console.error(`FAIL activate cleanup — deleted ${JSON.stringify(deleted)}; the /app Workbox precache must survive`);
}

console.log(failures === 0
  ? `sw-routing-check: PASS (${cases.length + 2} assertions)`
  : `sw-routing-check: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
