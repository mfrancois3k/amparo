# Amparo blind-spot / architecture audit — scroll-reveal ship (2026-09-18)

Principal-engineer, adversarial pass on the scroll-reveal animation shipped across
`rights/index.html` and all 52 `rights/<state>/index.html` pages. Every finding below
was checked against real source or a real command output — nothing here is inferred
from a description of the feature. Anything I could not verify is labeled UNVERIFIED.

## Files read directly

- `rights/index.html` (hub)
- `rights/ga/index.html` (verified state)
- `rights/al/index.html` (federal-only state)
- `rights/any-state/index.html` (generic federal page)
- `rights/ny/index.html`, `rights/tx/index.html` (the other two verified states, for cross-check)
- `sw.js` (service worker, root scope)
- `privacy/index.html`
- `pack.html` (only file that registers the service worker)
- `vercel.json` (CSP and cache headers)
- `manifest.webmanifest`

Commands run: `wc -c`, `du -sh`, `md5sum` diffing across all 52 state files, `grep -c`/`grep -l`
across `rights/*/index.html` and `derechos/*/index.html`.

---

## 1. Performance — not a real problem at this scale (verified)

- `rights/ga/index.html` = 8,679 bytes, `rights/al/index.html` = 9,956 bytes,
  `rights/any-state/index.html` = 10,456 bytes, `rights/index.html` (hub) = 7,449 bytes.
- Whole `rights/` directory (53 HTML files): **640 KB total** (`du -sh rights` → `640K`).
  That's ~12 KB/page average, uncompressed, before Vercel's gzip/br.
- Each page inlines the same ~35 lines of CSS and the same ~10-line IO script rather than
  linking a shared external file. This is real duplication, but at 640 KB total across the
  whole feature it is not worth fixing — extracting a shared `<link>`/`<script src>` would
  save bandwidth on a *second* page view in the same session (browser cache) but costs an
  extra network round trip on the far more common single-state-page visit from search/print
  intent. **Verdict: premature optimization; correct call to inline.**
- Verified byte-for-byte consistency, not just "looks similar": extracting the trailing
  `<script>…</script>` block from all 52 state files and hashing each gives **one unique
  md5 across all 52 files** (`8271f0fbc1844ee8eceee9390a1fb8d9`, appearing 52/52 times).
  No drift, no partial rollout, no state accidentally missing the reveal script.

## 2. Service worker interaction — no stale-code risk, but a real pre-existing "wrong page" bug touches these pages (verified)

Read `sw.js` in full (130 lines).

- **No stale-reveal-code risk.** Page navigations are handled network-first
  (`e.request.mode === 'navigate'` branch, lines 89-114): every visit to `/rights/<state>/`
  fetches the network first and only falls back to cache on failure. There is no
  hardcoded precache list containing any `/rights/*` path — `EXTRA` (lines 16-22) only
  lists `manifest.webmanifest` and icon files. So online users always get the current
  HTML/CSS/JS, reveal animation included. Confirmed by reading the full `EXTRA` array and
  the `isAsset`/`isArenaPage` predicates (lines 72-84): neither matches `/rights/`.
- **But there is a genuine, verifiable "wrong page" bug that touches `/rights/*` when
  offline**, unrelated to the animation but relevant to "does the SW conflict with these
  pages": the navigate branch's catch-all fallback is `caches.match(CORE)` where
  `CORE = './'` (line 6) — the **pack builder page**, not the requested rights page. Per
  the sw.js comment itself (lines 99-105), only the pack page is treated as "the offline
  artifact for everything else." Since `/rights/<state>/` is never added to any cache
  (no match in `isAsset`, not `CORE`, not `ARENA_CORE`), a user who opens a
  `/rights/ga/` link **while offline** (e.g., mid-stop with no signal — the exact scenario
  this feature exists for) and the SW is already installed (installed by any prior visit
  to `pack.html`/`/`, since `manifest.webmanifest` sets `"scope": "/"`) will be served the
  **pack builder page instead of Georgia's rights card**, with no error and no indication
  anything went wrong. This is a pre-existing architectural gap, not something the reveal
  ship introduced, but it is exactly the kind of thing this audit should surface: the
  print-and-glovebox pages have zero offline fallback of their own.
- **No CSP conflict.** `vercel.json`'s CSP (`script-src 'self' 'unsafe-inline' …`) allows
  inline scripts, so both inline `<script>` blocks (head class-setter, body IO observer)
  execute normally. Verified by reading the actual header value.

## 3. Analytics honesty — no contradiction found (verified)

- `privacy/index.html` states PostHog is proxied first-party, automatic event capture is
  off, and "the Practice Arena loads no analytics at all."
- Every rights page I inspected (`ga`, `al`, `any-state`, `ny`, `tx`, hub) has exactly
  2-3 `<script>` tags total: the JSON-LD FAQ block (state pages only), the one-line
  `IntersectionObserver`-feature-detect class-setter in `<head>`, and the reveal-observer
  script at the bottom of `<body>`. None reference PostHog, Sentry, or any third-party
  domain. `grep -c "<script"` confirms 3 for every state page and 2 for the hub (no JSON-LD
  on the hub). **No inline JS was added that contradicts the privacy page's tracking
  claims** — the new reveal code adds zero network calls and zero data collection.

## 4. Error handling — verified robust for the cases asked about

- **IntersectionObserver constructor throwing:** guarded twice — once in `<head>`
  (`if('IntersectionObserver' in window){...add 'js' class...}`) and once in the body
  script (`if(!('IntersectionObserver' in window))return;`). The constructor is called
  with a hardcoded, always-valid `{threshold:.15}` option, so there's no runtime input
  that could make it throw; the double feature-detection is the correct belt-and-suspenders
  guard for browsers that lack the API entirely (older Safari/older Android WebView).
- **`querySelectorAll` returning nothing:** `document.querySelectorAll('.reveal').forEach(...)`
  on an empty NodeList is a documented no-op — `forEach` simply doesn't iterate. Verified
  this is the actual code (not a manual loop with an off-by-one or an assumed non-empty
  result). No crash path exists here.
- **Feature-detection gate correctness (verified, not assumed):** the hiding CSS is scoped
  under `.js .reveal`, and the `.js` class is only added by the head script when
  `'IntersectionObserver' in window` is true. A browser without IntersectionObserver never
  gets `.js`, so `.reveal` content is never hidden — confirmed by reading the actual
  selector nesting in all four sampled files.

## 5. bfcache and rapid back/forward — verified no bug, with reasoning

- No `unload`/`beforeunload` listeners exist anywhere in the sampled pages (grep of the
  script blocks), so nothing here disqualifies these pages from bfcache eligibility on
  Chrome/Firefox/Safari.
- On a bfcache restore, the page is not re-executed from scratch — the existing DOM
  (including any `.in` classes already applied) and the existing `IntersectionObserver`
  instance are frozen and resumed as-is, not re-created. Elements already revealed before
  navigating away stay revealed after restore (their `.in` class is part of the frozen
  DOM); elements not yet observed-intersecting keep their live observer, which still fires
  normally once resumed. There's no re-run of the trailing `<script>` on `pageshow`, but
  none is needed since state is preserved. I could not run an actual bfcache test in this
  environment (no browser automation available in this pass) — **this reasoning is based
  on documented browser bfcache semantics for frozen JS/observers, not an observed test,
  so mark it UNVERIFIED by direct test** even though the code contains no known
  bfcache-breaking API.
- **Rapid back/forward between different state pages** is not a shared-state problem:
  each `/rights/<state>/` URL is a distinct document with its own inline script and its
  own `IntersectionObserver` instance scoped to that page's JS realm — there is no global
  or cross-page state that could leak or race between them, confirmed by these pages
  having zero shared/external JS file and zero `window`-scoped globals beyond the IIFE's
  local `io` variable.
- **sw.js hardcoded precache list vs. these pages:** already covered in §2 — there is no
  hardcoded list containing `/rights/*` paths, so there's no staleness vector from that
  list. The only conflict is the wrong-page fallback described above.

## 6. Additional findings noticed during the pass (verified, in scope of "would embarrass this project")

- **`derechos/` (the Spanish mirror, linked via `hreflang="es"` from every single English
  rights page) has zero reveal-animation code.** Verified: `grep -l "IntersectionObserver"
  derechos/*/index.html` and `derechos/index.html` both return 0 matches, vs. 52/52 + hub
  on the English side. This is a bilingual "know your rights" site — Amparo's own tagline
  — where a shipped UX improvement quietly only reached English speakers. Functionally
  harmless (Spanish pages still render, just without the fade-in), but it's an inconsistency
  a hostile reviewer (or a bilingual user comparing both editions) would notice immediately,
  and it's the kind of thing "garbage in/consistency" review should have caught before
  calling the animation ship complete across "the site."
- **Pre-existing grammar bug, unrelated to this ship but caught in the same files:** in
  every "federal rules apply, state not verified" page whose state name starts with a
  vowel, the disclaimer reads "not yet reviewed by **a** Alabama-licensed attorney"
  (also Arizona, Arkansas, Idaho, Illinois, Indiana, Iowa, Ohio, Oklahoma, Oregon, Utah —
  11 states confirmed via direct grep). Should be "an." Trivial, but it sits inside the
  site's own credibility disclaimer, repeated 11 times, on a legal-literacy product.

## What I did not verify

- No live bfcache test was performed (no browser tooling available in this environment);
  the bfcache analysis in §5 is based on documented spec/browser behavior, not an observed
  Chrome/Firefox restore.
- Did not test actual airplane-mode/offline behavior in a real browser; the "pack page
  served instead of rights page" conclusion in §2 is derived from reading `sw.js`'s cache
  keys and fallback logic, not from an executed offline reproduction.
- Did not check Safari/older Android WebView IntersectionObserver support versions
  directly — relying on MDN's general compatibility knowledge, not a version-by-version
  citation, for "which real browsers lack IO today."

## Bottom line

The reveal animation itself is solid: byte-identical across all 52 states, correctly
gated behind feature detection, correctly overridden by print and reduced-motion, no
analytics or CSP conflicts, no crash paths from empty selectors or missing APIs. The two
things worth actually fixing are (1) the offline fallback silently serving the pack page
instead of a rights page when the SW is installed and the network is down, and (2) the
Spanish mirror never got the same treatment. Neither was caused by this ship, but both
now sit directly next to it and are cheap for a hostile reviewer to find.
