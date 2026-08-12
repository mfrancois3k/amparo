# Amparo blind-spot audit — /app's first-ever service worker (Move 6.1), round 3

**Scope:** Principal-engineer hostile review of Move 6.1 (`/app`'s own service
worker + PWA manifest via `vite-plugin-pwa`, shipped this session, tagged
v2.20.0) and its interaction with root's pre-existing `sw.js`. This is the
FIRST time `/app` has ever shipped a service worker, so the review is
concentrated there rather than re-walking earlier phases.

**Not repeated here** — already found and logged, see
`notebook/amparo-app-migration-log.md` (Move 6.1/6.2 entries) and
`wargames/18-app-parity-report.md`: practice's entry screen being
structurally the wrong one (3-tab hub vs. flat list), print's
`beforeprint`/`afterprint` polish missing, and the ~20 DEFERRED
parity-audit items awaiting operator sign-off (post-print rail, carry
card, share cert, About overlay, etc.). Also not repeated: the two-SW
same-origin coexistence scenario and true airplane-mode reload were
already flagged in the migration log as untestable in this harness and
logged as a post-deploy RECON item — this audit adds code-level analysis
of what that coexistence actually does, which is new, not a restatement.

**Methodology:** Read `app-src/vite.config.ts`, `app-src/src/registerSW.ts`,
root's `sw.js` and its registration block (`index.html:5756-5774`), the
**committed build output** `app/sw.js` and `app/workbox-35e397ac.js`
(decompiled/read directly — not assumed from vite-plugin-pwa's docs), and
`git log`/`git show` on `img/officer-f.jpg` to test the "immutable asset"
claim against real repo history. Every finding below cites the exact line
or byte evidence; nothing is asserted from general Workbox knowledge alone
without confirming it against the actual shipped `workbox-35e397ac.js`.

---

## 1. CRITICAL — root's own cache-cleanup sweep deletes `/app`'s runtime caches, contradicting the documented design guarantee

**Verdict: CONFIRMED by reading both files' exact code.**

Root's `sw.js` activate handler (unchanged since Move 0.2):

```js
.then(ks => Promise.all(ks.filter(k => k.startsWith('amparo-') && k !== C).map(k => caches.delete(k))))
```

`C = 'amparo-v3'`. This filter is a **prefix match**, not an exact-name
match, and its own comment explains why: it exists so that a daily-cron
redeploy of root doesn't wipe `/app`'s Workbox precache on every visit
(a real bug this exact code was written to fix, per the comment at
`sw.js`'s activate handler and the migration log's Move 0.2 entry).

Move 6.1's own migration-log entry states the design intent explicitly:
*"own cache names `amparo-app-audio`/`amparo-app-img` — deliberately NOT
`amparo-v3`, so root's own cache-cleanup sweep (Move 0.2) can never touch
them and vice versa."*

That guarantee is false as implemented. `'amparo-app-audio'.startsWith('amparo-')`
is `true`, and `'amparo-app-audio' !== 'amparo-v3'` is also `true` — both
conditions the filter checks. Confirmed against the actual committed
build output (`app/sw.js`, minified but readable): the runtime-cache
names are exactly `amparo-app-audio` and `amparo-app-img`, verbatim, as
configured in `vite.config.ts`. **Cache Storage is a per-origin API, not
scoped to a service worker's registration scope** — any activated SW on
the origin can enumerate and delete any named cache regardless of which
SW created it or what scope it runs at. So root's `sw.js`, on every
activation (which fires on every root redeploy — root's own comment notes
"a cron commits to this repo daily" — and on the very first time root's
SW activates on a device that already has `/app` caches populated, in
either order), will delete both of `/app`'s runtime caches.

**Net effect:** the "own cache names so the sweep can never touch them"
design goal Move 6.1 states as its rationale for the naming scheme does
not hold. `/app`'s audio/image runtime caches are wiped by root's own
housekeeping roughly as often as root deploys — which, per root's own
comment, is roughly daily. This doesn't break correctness (Workbox will
just re-fetch and re-cache on next request — no user-visible failure) but
it silently defeats the entire point of the isolated cache names, and the
migration log's stated guarantee is factually wrong as written. One
opposite-direction check: `/app`'s own cleanup, read from the actual
generated `workbox-35e397ac.js` (`cleanupOutdatedCaches`), filters on
`s.includes('-precache-') && s.includes(self.registration.scope)` — this
is scope-anchored and precache-name-anchored, so it correctly can **never**
reach root's `amparo-v3` cache. The bug is one-directional: root → `/app`,
not `/app` → root.

**Fix shape (not applied, audit scope only):** rename root's sweep filter
to something exact or root-prefixed (`k.startsWith('amparo-v') && k !== C`,
or an explicit allowlist), or rename `/app`'s runtime caches off the
`amparo-` prefix entirely (e.g. `app-audio`/`app-img`) — either one closes
the collision. The current names were presumably chosen for brand
consistency, not realizing they'd fall inside root's own sweep pattern.

---

## 2. HIGH — `/img` assets are not content-hashed, and the "immutable" claim is contradicted by the repo's own git history

**Verdict: CONFIRMED — both the stable-filename claim and a real prior mutation, verified via `git show`.**

The task's own framing asked to verify whether `/audio`/`/img` are
genuinely immutable or just assumed to be. Checked directly:

- `ls img/` shows stable, non-hashed filenames: `officer-f.jpg`,
  `officer-m.jpg`, `scene-1.jpg` … `icon-192.png`, etc. — no content hash
  in any filename, unlike the JS/CSS chunks `/app` itself builds (which
  are content-hashed, e.g. `PracticeStep-DpxH_vrb.js`).
- `git log --stat -- img/officer-f.jpg` shows the file was overwritten
  **in place, under the same filename**, less than an hour after it was
  first added: `ba82624` adds `officer-f.jpg` (23068 bytes, AI-generated
  portrait), `2f4ea7d` — same commit that also added the scene thumbnails
  — replaces it with a **different 23709-byte file** ("original officer
  portraits restored" per the commit message). Confirmed via `git show
  ba82624:img/officer-f.jpg` vs. `git show 2f4ea7d:img/officer-f.jpg`
  piped to `cmp`: **DIFFERENT**, not a no-op re-add.

So the premise both root's `sw.js` comment ("Audio/img: cache-first
(immutable...)") and Move 6.1's runtime-caching config rest on — that
these are safe to cache-first forever because the content never changes
under a given name — has already been violated once in this repo's own
history, before any service worker even existed to cache it. Nothing
about the current pipeline (no build step touches `/img`, it's hand-
placed) prevents it from happening again.

**Consequence specific to Move 6.1:** `/app`'s `CacheFirst` strategy for
`/img/**` has `maxAgeSeconds: 60 * 60 * 24 * 365` (one year) and no
`cacheWillUpdate`/revalidation hook — confirmed reading the actual
generated route in `app/sw.js`: `CacheFirst` with only an
`ExpirationPlugin` (count/age-based eviction) and a `CacheableResponsePlugin`
(status-code filter), **no ETag/Last-Modified conditional-fetch logic**.
Once a `/app` client caches an image, there is no code path — short of the
365-day expiry, hitting the 60-entry cap, or the user clearing site data —
that will ever fetch a newer version, even if the file at that URL is
edited again the way `officer-f.jpg` already was once. This is a real,
demonstrated-possible staleness path, not a theoretical one. Root's own
`sw.js` has the identical assumption and the identical risk (also
cache-first-forever for `/img`/`/audio`, same lack of revalidation) — this
is not new to `/app`, but Move 6.1 doubles the blast radius by adding a
second, independent cache-first store for the same mutable-by-precedent
assets, and inherits root's incorrect "immutable" framing without
re-examining it.

---

## 3. MEDIUM — a single missing/edge-inconsistent build asset fails `/app`'s ENTIRE service-worker install silently, with no operator or user signal

**Verdict: CONFIRMED by reading the actual precache install logic in the shipped `workbox-35e397ac.js`, not inferred from Workbox docs.**

Root's own `sw.js` install handler is deliberately defensive against
partial-deploy/edge-inconsistency risk — its own comment says why:

```js
// addAll is atomic — one 404 would reject the whole install, so the icons are
// added individually and allowed to fail without blocking the shell.
e.waitUntil(caches.open(C).then(c =>
  c.add(CORE).catch(() => {}).then(() =>
    Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))
  )
).catch(() => {}));
```

Every entry is individually wrapped in `.catch(() => {})`, so a single
missing/inconsistent asset (e.g. a CDN edge that hasn't finished
propagating a deploy) degrades gracefully — the shell still installs,
just possibly missing one icon.

`/app`'s generated precache installer (`app/workbox-35e397ac.js`, the `Y`
class's `install()` method) has **no such per-entry catch**. Reading the
actual logic: each precache entry is fetched and `cachePut()`'d inside
`Promise.all(this.strategy.handleAll(...))`; if any single entry's
response fails `cachePut` (e.g. a 404, or a `bad-precaching-response`
thrown from the `X.A()` fallback path when the network fetch itself comes
back unusable), that rejection propagates through the `Promise.all` and
the outer `waitUntil()`, **failing the entire SW installation** — not just
that one asset. This is standard Workbox behavior, confirmed here by
reading the code that actually shipped, not assumed from the library's
public docs.

`registerSW.ts` (`app-src/src/registerSw.ts`) calls `registerSW({ immediate:
true, onOfflineReady() {...} })` with **no `onRegisterError` callback**.
Tracing `vite-plugin-pwa`'s own registration helper
(`node_modules/vite-plugin-pwa/dist/client/build/register.js`), a failed
`wb.register()` is routed to `onRegisterError?.(e)` — since that callback
is `undefined` here, the optional-chaining call is a silent no-op. The
promise chain itself is fully caught internally (no unhandled rejection),
so nothing throws, nothing logs, nothing surfaces anywhere — not even to
the browser console.

**Net effect:** if a deploy of `/app` ever lands on a CDN edge in a
partially-propagated state (one chunk 404s for a moment while the rest of
the build is live — the exact scenario Move 6.1's own migration-log entry
flags as untested/RECON for the two-SW-coexistence case, but this is a
distinct risk from that one), the entire `/app` service worker
installation fails outright, `/app` silently gets **zero** offline
capability for that visit, and there is no signal anywhere — not in the
browser console, not in any log, not to the user (who correctly never
sees the "offline ready" banner, so no false claim is made) — that
anything went wrong. This is a plausible, code-confirmed failure mode,
not one this session reproduced live (no CDN available in this harness to
force a partial-propagation state), so the code path is CONFIRMED but the
live trigger condition is PLAUSIBLE-UNVERIFIED.

Root's registration (`index.html:5756-5774`) has the equivalent gap —
`.catch(() => {})` on the whole chain, also silent — so this isn't a
regression `/app` introduced relative to root's own standard. But root's
*install* handler is defensively per-asset-catching specifically to avoid
the all-or-nothing failure mode in the first place, while `/app`'s
generated Workbox installer has no equivalent defense — so `/app` is
strictly more exposed to a single bad asset taking down the whole
install, with the same (already-accepted) silence once it does.

---

## 4. LOW — shared `/img`/`/audio` assets get double-cached under two independent cache stores depending on which SW was controlling at fetch time

**Verdict: CONFIRMED by reading both routing tables; not a correctness bug, a storage/footprint note.**

Root's `sw.js` fetch handler treats `/img/**` and `/audio/**` as
`isAsset` and caches them into its own `amparo-v3` cache whenever it is
the controlling worker for the request. `/app`'s generated SW has its own
separate `CacheFirst` routes for the same URL patterns
(`/^https:\/\/[^/]+\/img\/.*/`, `/^https:\/\/[^/]+\/audio\/.*\.mp3$/`),
caching into `amparo-app-img`/`amparo-app-audio`. Because a page is
controlled by whichever SW has the most specific matching scope
**at the time the page loaded** — root (`/`) before `/app`'s own SW has
ever registered on a given device, `/app`'s own SW (`/app/`) after — the
identical physical asset (e.g. `img/scene-1.jpg`, shared by absolute path
per Move 6.1's own design) can end up stored twice on a user's device:
once under root's cache from an earlier root visit, once under `/app`'s
cache from an `/app` visit. Confirmed by code inspection of both routing
tables; not tested live (would require inspecting real Cache Storage
across both scopes on a device that visited both). Low severity — this is
extra disk usage, not a correctness bug — but worth naming since it's a
direct, verifiable consequence of the two-SW-coexistence design that the
migration log already flagged as a RECON item without this specific
storage-duplication detail.

---

## 5. Checked and NOT a finding — `registerSW.ts`'s https-only gate and error-swallowing are faithful to root's own standard

Compared line-by-line against `index.html:5756-5774`. Both gate on
`'serviceWorker' in navigator && location.protocol === 'https:'`. Both
swallow registration errors silently (root via `.catch(() => {})`, `/app`
via the missing-`onRegisterError` no-op traced in Finding 3). This is
consistent, not a new gap introduced by the port — flagged in Finding 3
only because `/app`'s underlying Workbox installer is more fragile to a
single bad asset than root's hand-rolled one, which makes the shared
silence matter more for `/app`, not because the registration gate itself
regressed.

---

## Summary table

| # | Area | Finding | Verdict | Severity |
|---|------|---------|---------|----------|
| 1 | Cross-SW cache lifecycle | Root's `sw.js` activate-handler cache sweep (`k.startsWith('amparo-')`) deletes `/app`'s `amparo-app-audio`/`amparo-app-img` caches on every root activation — contradicts Move 6.1's documented "own cache names, can never touch them" guarantee | CONFIRMED (code) | **Critical** (design-intent violation; no user-visible breakage since Workbox re-fetches transparently) |
| 2 | `/img` staleness | Filenames stable/non-hashed; `officer-f.jpg` genuinely changed content under the same name in repo history (`git show` diff, 23068→23709 bytes); `CacheFirst` + 365-day expiry has no revalidation path | CONFIRMED (git history) | **High** |
| 3 | Precache install fragility | `/app`'s generated Workbox installer fails the ENTIRE SW install on a single bad precache entry (no per-asset catch, unlike root's hand-rolled defensive install); combined with `registerSW.ts`'s missing `onRegisterError`, failure is completely silent | CONFIRMED (code path); live trigger PLAUSIBLE-UNVERIFIED | **Medium** |
| 4 | Double caching | Shared `/img`/`/audio` assets can be stored under both root's and `/app`'s cache stores depending on which SW controlled the fetch | CONFIRMED (code) | **Low** |
| 5 | Registration gate/error handling | `registerSW.ts` faithfully matches root's https-gate and silent-catch pattern | CONFIRMED, not a defect | — |

---

## Bottom line

One **Critical**: Move 6.1's stated design guarantee — that naming `/app`'s
runtime caches `amparo-app-audio`/`amparo-app-img` keeps them safe from
root's Move-0.2 cache-cleanup sweep — is false as implemented. The sweep
is a prefix match (`startsWith('amparo-')`), not an exact-name match, and
both new cache names fall inside that prefix. This doesn't produce a
user-visible bug (Workbox silently re-populates on next request), but it
means the isolation Move 6.1 was specifically built to guarantee doesn't
exist, and the migration log's claim to the contrary should be corrected.

One **High**: the "immutable assets" premise behind cache-first-forever for
`/img` (inherited from root, doubled by `/app`) is not just theoretically
risky — this repo's own git history shows `officer-f.jpg` was silently
replaced under its unchanged filename once already, and nothing in the
current pipeline prevents it from happening again, with no invalidation
path in either SW's caching strategy.

One **Medium**: `/app`'s generated Workbox precache installer has no
per-asset fault tolerance (unlike root's deliberately defensive
hand-rolled install), so a single inconsistent/missing build asset — most
plausible during a partial CDN-edge propagation window right after a
deploy — fails the whole SW install with zero signal anywhere, since
`registerSW.ts` never wires an `onRegisterError` handler.

Everything else audited this pass is sound: `/app`'s own precache cleanup
correctly cannot reach root's cache (scope- and name-anchored, verified in
the generated `workbox-35e397ac.js`); root's own `/app`-passthrough guard
in its fetch handler is unchanged and correctly exempts every `/app/*`
path including `/app/sw.js` and `/app/manifest.webmanifest` themselves;
and the registration gate itself is a faithful, unregressed port of
root's own standard.
