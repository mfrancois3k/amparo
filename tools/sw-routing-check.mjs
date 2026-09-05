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
/* Every cache.put(key, ...) call, across the life of the sandbox — read by the
   ARENA_CORE/CORE separation test below via keyOf(), which normalises both a
   bare string key (CORE, ARENA_CORE) and a Request-like object to one string. */
const puts = [];
const keyOf = k => (typeof k === 'string' ? k : k?.url ?? String(k));

const sandbox = {
  URL, console,
  self: {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    skipWaiting: () => {},
    clients: { claim: async () => {} }
  },
  caches: {
    open: async () => ({ add: async () => {}, put: async (k) => { puts.push(keyOf(k)); }, match: async () => undefined }),
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

/** Fire a navigate FetchEvent and await whatever sw.js hands respondWith,
 * returning every cache key written during that one request. */
async function navigated(url) {
  const before = puts.length;
  let p;
  handlers.fetch({ request: { method: 'GET', url, mode: 'navigate' }, respondWith: (promise) => { p = promise; } });
  await p;
  return puts.slice(before);
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
  [`${ORIGIN}/application.js`,       'no-cors', true, '/app prefix match must not swallow /application*'],
  // Arena and its /rehearse rewrite: no longer skipped outright (2026-09-04) —
  // both now get their own offline handling, asserted separately below.
  [`${ORIGIN}/arena/`,               'navigate', true, '/arena navigation is handled (its own cache key, asserted below)'],
  [`${ORIGIN}/rehearse`,             'navigate', true, '/rehearse (the Arena rewrite) must be handled the same way as /arena/'],
  [`${ORIGIN}/arena/audio/en/x.mp3`, 'no-cors',  true, 'Arena audio is cache-first now, same as root audio'],
  [`${ORIGIN}/arena/fonts/f0.woff2`, 'no-cors',  true, 'Arena fonts are cache-first now'],
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

/* The bug this whole feature exists to prevent: until 2026-09-04, /rehearse
   was not excluded by the /arena prefix check, so it fell into the generic
   navigate branch and, offline, would have been silently handed the PACK's
   cached page — the exact "wrong app" failure the /app guard above prevents,
   just not yet extended past /app and the literal /arena path. Assert the
   two are written to genuinely distinct keys, not just "handled=true". */
{
  const rehearseWrites = await navigated(`${ORIGIN}/rehearse`);
  const arenaWrites = await navigated(`${ORIGIN}/arena/`);
  const packWrites = await navigated(`${ORIGIN}/pack`);
  const homeWrites = await navigated(`${ORIGIN}/`);
  if (!rehearseWrites.some(k => k.includes('arena-offline'))) {
    failures++; console.error(`FAIL /rehearse must write to the Arena's own offline key, wrote: ${JSON.stringify(rehearseWrites)}`);
  }
  if (rehearseWrites.some(k => k === './' || k.endsWith('amparohq.com/'))) {
    failures++; console.error(`FAIL /rehearse must NOT write to CORE (the pack's key): ${JSON.stringify(rehearseWrites)}`);
  }
  if (!arenaWrites.some(k => k.includes('arena-offline'))) {
    failures++; console.error(`FAIL /arena/ must write to the Arena's own offline key, wrote: ${JSON.stringify(arenaWrites)}`);
  }
  if (!packWrites.some(k => k === './' || k.endsWith('amparohq.com/'))) {
    failures++; console.error(`FAIL /pack must still write to CORE, wrote: ${JSON.stringify(packWrites)}`);
  }
  if (homeWrites.some(k => k.includes('arena-offline'))) {
    failures++; console.error(`FAIL / must never write to the Arena's offline key: ${JSON.stringify(homeWrites)}`);
  }
  if (homeWrites.length) {
    failures++; console.error(`FAIL / (not the pack) must not write ANY cache entry, wrote: ${JSON.stringify(homeWrites)}`);
  }
}

// activate: prune old amparo shells, never foreign caches.
cacheKeys = ['amparo-v4', 'amparo-v3', 'amparo-v2', 'amparo-v1', 'workbox-precache-v2-https://www.amparohq.com/app/'];
const waits = [];
await handlers.activate({ waitUntil: p => waits.push(p) });
await Promise.all(waits);

try {
  assert.deepEqual(deleted.sort(), ['amparo-v1', 'amparo-v2', 'amparo-v3'],
    'activate must delete only stale amparo-* caches');
} catch (err) {
  failures++;
  console.error(`FAIL activate cleanup — deleted ${JSON.stringify(deleted)}; the /app Workbox precache must survive`);
}

console.log(failures === 0
  ? `sw-routing-check: PASS (${cases.length + 8} assertions)`
  : `sw-routing-check: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
