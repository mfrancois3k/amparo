# wargames/18 — /app parity audit + evidence pack

wargames/15 Move 6.2, the last move in the migration. Walks Appendix A of
wargames/15 end to end and marks every row PORTED / DEFERRED(reason) /
N-A(reason). No row is silently absent — every one below has a verdict.

Verification date: 2026-08-12. Repo state: `main` at the commit immediately
following Move 6.1 (`/app` service worker + manifest), before this report's
own commit.

## Headline finding first

**Practice's entry point structurally diverges from root's current design.**
Root's actual first screen for practice (step 5, index.html:3420-3474) is a
**3-tab hub** — Traffic ladder / Checkpoint / Door — with checkpoint
deliberately split into its own tab because (root's own comment) "it was
reading as just another traffic level buried at the end of the ladder."
`/app`'s `PracticeLevelSelect.tsx` ports a *different* screen: the practice
overlay's internal fallback list (index.html:5445-5454, reachable inside
root's overlay via "← All scenarios"), which shows all levels — including
checkpoint — in one flat list, exactly what root split checkpoint OUT of.

This was not caught earlier because both screens are real, both are content-
correct, and `/app`'s version works end-to-end (verified repeatedly this
session, zero bugs) — it is simply the wrong ENTRY screen, ported instead of
root's actual current step-5 hub. Not fixed in this audit — a genuine build
task (3-tab structure, `hub_progress` bar, door tab's honest "unbuilt and
why" message, `pr-grid`/`pr-card` markup), not an audit-time patch. Flagged
here as the single most significant DEFERRED item; see G/row-C6 below.

## A. Shell/boot

| # | Item | Verdict |
|---|---|---|
| A1 | cowork-artifact meta | N-A — build tooling metadata, not product |
| A2 | head/meta/PWA installability | PORTED (Move 1.3 meta tags; Move 6.1 manifest+icons+SW) |
| A3 | CSS design system + dark practice card | PARTIAL — tokens ported verbatim (Move 2.3); dark practice card explicitly NOT ported (Move 5.2: `/app` reuses the light `.card` shell every other step uses, logged as a deliberate structural adaptation, not a cut) |
| A4 | GSAP+SRI+SRMotion, no-GSAP degradation | N-A by construction — `/app`'s CSP (`script-src 'self'`) cannot load the GSAP CDN at all; the CSS-keyframe fallback path is what's used everywhere (index.css's own note: "this build is permanently in that fallback branch") |
| A5 | PostHog + 5 privacy flags + replay scoping + demo quarantine | N-A — `/app` ships zero analytics, enforced by CSP `connect-src 'self'` (verified: no `posthog`/`analytics`/`ph(` call anywhere in `app-src/src`) |
| A6 | sw.js (network-first nav, audio/img cache-first, skipWaiting+claim+guarded reload) | PORTED, `/app`-scoped — Move 6.1 ships `/app`'s own SW via vite-plugin-pwa (precache + runtime CacheFirst for `/audio/**` and `/img/**`, own cache names `amparo-app-audio`/`amparo-app-img`). Root's `sw.js` is byte-unchanged throughout the whole migration (verified: zero commits touch it after Move 0.2) |
| A7 | vercel.json CSP/HSTS/headers | PORTED — root's headers apply to `/app` too (Move 1.3); `/app`'s own tighter CSP layers on top via `<meta>` (intersection of both is enforced, documented in `app-src/index.html`); Move 6.1 added `/app/sw.js` and `/app/manifest.webmanifest` header rules |
| A8 | 404.html branded page | DEFERRED — `/app` has no client routing depth to need a fallback (single in-memory route, no deep links); an arbitrary bad `/app/*` URL falls through to Vercel's default handling, not root's branded page |
| A9 | robots/sitemap/og/manifest | PARTIAL — `robots: noindex,nofollow` (Move 1.3) and manifest (Move 6.1) ported; sitemap N-A (nothing to index, matches noindex); og image not built (beta isn't meant to be shared/previewed) |
| A10 | law-watch pipeline | N-A — cron-fed banner system with no `/app` equivalent; not referenced anywhere in `app-src` |

## B. Splash/landing

| # | Item | Verdict |
|---|---|---|
| B1 | splash+layered LOGO, quick path for returning users | PARTIAL — Welcome screen ported (Move 3.1); "quick path" (resume chip) not built, see B4 |
| B2 | header/brand/lang toggle/pilot banner/disclaimer | PORTED (Move 1.3/3.1) |
| B3 | welcome (trust chips, resume chip, sample pack, share, About, hard-truth link) | PARTIAL — trust chips (founder) and sample-pack/hard-truth links ported as honest links back to root (verified: `Welcome.tsx` `href="/"` for both); resume chip, share, and the full About overlay NOT built |
| B4 | stepper with clickable completed nodes + travelling state pill | PARTIAL — the state pill (`Eyebrow.tsx`/`StateSilhouette`) is ported; clickable-completed-node stepper navigation is not — `/app`'s nav is strictly linear (by design, `nav.ts`'s own comment: "a router now would be building for a need that does not exist yet") |
| B5 | stale-edition + usage banners | DEFERRED — no component references `packFreshness` or stale-edition copy; strings are extracted (`t.en.json`/`t.es.json`) but unused |
| B6 | "I'm stuck" strip | DEFERRED — same as B5, string extracted, unused |
| B7 | About overlay (REVIEW config, edition-locked badges) | DEFERRED — not built; `REVIEW`/`EDITION` are used in `PrintPack.tsx` (attorney-review badge logic) but there is no standalone About screen |
| B8 | hard-truth doc overlay (Castile/Wright, sourced) | DEFERRED — `Welcome.tsx`'s `doc_link` points at root (`/`) rather than an `/app`-native overlay |

## C. Wizard

| # | Item | Verdict |
|---|---|---|
| C1 | nav core (`go/goM`, `_navBusy`, step-viewed tracking) | PARTIAL — `nav.ts`'s `navigate()`/`stepIndex()` port the routing contract; `sr_step_viewed` analytics is correctly omitted (zero analytics, by design) |
| C2 | state step — geographic map, full micro-behavior set | PORTED — verified in source: `getBBox` label-measurement fix, entrance-wave once-per-reveal guard, sliver-state labels as real peer targets, search filter all present in `StateMap.tsx`/`StateStep.tsx`. `skipToPack` (fast path) explicitly DEFERRED (logged in `StateStep.tsx`'s own comment and the migration log) |
| C3 | You step (contacts, equal-weight skip, finish-later) | PARTIAL — contacts + equal-weight skip PORTED (Move 4.1); `finishLater()`'s `.ics` writer DEFERRED (same log entry as C2) |
| C4 | lifelines (segmented tabs, snap track, SCEN 7+7, Continue never gated) | PORTED (Move 4.2, plus the real STATES-synthesis bug found and fixed there) |
| C5 | print preview (clone-DOM thumbnails, one gold action, post-print rail, print help, feedback tap) | PARTIAL — thumbnails, one-gold-action print button, and the pdf-help disclosure PORTED (Move 4.3); post-print rail (email/restart/print-for-family/reprint-reminder) and the print-feedback tap DEFERRED, each logged as needing its own decision |
| C6 | practice hub (3 module tabs; door tab honest-unbuilt; sequential locks; unscored best suppression) | **DEFERRED — see Headline finding.** Sequential locks and unscored-best suppression ARE ported correctly (verified: `isLocked()` in `practiceEngine.ts`, `PRX_UNSCORED` gating in `PracticeLevelSelect.tsx`); the 3-tab hub structure itself is not — `/app` built the overlay's internal flat list instead |

## D. Document capture

PORTED (Move 4.1) — native file input only (root's own decision, not a gap:
the 493-line capture engine was deleted from root in v2.1.0), `docsShrink`
math ported verbatim (1100px/0.72), quota handling via `writeAppReporting`
(root's rollback+alert equivalent), own `app_docs` key independent from
`app_you` (mirrors root's `sr_docs`/`sr_save` split), `data:image/` prefix
validation on restore (`readRootDocs`).

## E. Persistence

PORTED. `services/storage.ts` implements the six-key boundary: `sr_save`
(whitelist-validated, matching restore semantics — state/lang/step
validated the same way root does), `sr_docs`, `amparo_prx` (**both
migrations ported**: v1 flat-shape detection and the v2 level-index remap
4→3/5→4, verified byte-for-byte against root's `shift()` function),
`amparo_muted`, `amparo_voice` — all READ-ONLY from `/app`, enforced by
construction (only named readers exist, no generic key access). `amparo_stt`
correctly not read at all (dead in root too, nothing writes it).
`/app`'s own writes are namespaced `app_*`: `save`, `docs`, `you`, `prx`,
`mute`, `voice`, `voiceLang` — never touching a root key, enforced the same
way.

## F. Content/legal/pack

| # | Item | Verdict |
|---|---|---|
| F1 | STATES TX/GA/NY + US_STATE_NAMES + BASE_RULES + pending-flag synthesis | PORTED — including the real synthesis bug found and fixed (Move 4.2, `statesResolved.ts`) |
| F2 | REVIEW + EDITION + attorney badges | PORTED (`PrintPack.tsx`'s `reviewInfo()`) |
| F3 | QR per cited state, text fallback | PORTED (`PrintPack.tsx`, verified live for TX/GA/NY + fallback for others) |
| F4 | PACK_EXTRA pages 4-6 incl. checkpoint + notice-of-claim deadlines | PORTED (Move 4.3) — including the real `con_h` defect found in ROOT itself (missing key, root prints literal "undefined"), not backported, `/app` degrades gracefully |
| F5 | buildPrint 6 pages + placement strips + beforeprint debounce + afterprint banner | PARTIAL — 6 pages + placement strips PORTED; the 4-second `beforeprint` debounce and the `afterprint` honest banner are NOT ported (`/app`'s print button just calls `window.print()` directly with a `printed` boolean flipped via `afterprint` for the gold/ghost swap only — no debounce, no banner text). New finding this audit, not previously logged. |
| F6 | email function (dormant) | N-A — dormant in root too (`emailEnabled: false`); correctly absent from `/app`, not a gap |
| F7 | .ics writer ×2 (reprint reminder; finish-later) | DEFERRED — neither writer built, both logged (C2/C3 above) |
| F8 | sample/demo mode + quarantine | N-A — no demo mode concept exists in `/app`; every visit is functionally identical (matches "no demo banner" decision, Move 4.3) |
| F9 | restart / print-for-family / update-stale flows | DEFERRED — none built, all logged under the post-print rail deferral (C5) |

## G. Practice engine

| # | Item | Verdict |
|---|---|---|
| G1 | intro + prep drill + tap-to-place recall (gates first-ever run) | DEFERRED — never assigned to a move in wargames/15's own action bullets (noted explicitly in the Move 5.2 log); `/app`'s practice entry skips straight to level selection for a true first-time visitor |
| G2 | decks/levels, PRX_UNSCORED, prxBuildDeck | PORTED (Move 5.1), including levels 5/6/7 dark-but-ported for when flags flip |
| G3 | flags + dark scaffolding | PORTED — `FINAL_SCENARIOS_ENABLED`/`DOOR_MODULE_ENABLED` read from `meta.json`, both false, matching root; dark-level decks (`PRX_WAIT`/`PRX_NOSTOP`/`PRX_DOOR`) build without throwing (verified in `practice-engine-check.mts`) |
| G4 | variant lines + curveballs + PRX_SIGN + PRX_CITES | PORTED |
| G5 | PRX_OPT g/b/coach/react + bothGood + checkpoint | PORTED, including `react2` (hard mode's alt-side reaction, added to the type this phase) |
| G6 | run FSM (per-level consent; crisis-skip alignment) | PORTED (Move 5.1), 18 self-checks green |
| G7 | divergence (selection-only) | PORTED — including the confirmed-still-inert L2 hostile leg (`PRX_VAR[7]` has no hostile variant; content gap, not code, flagged again this loop by the module design review) |
| G8 | audio (double-fallback latch, TTS tone, idle-freeze, mute double-gate) | PORTED (Move 5.2), stale-callback leak found and fixed this loop |
| G9 | typed path (same matcher) | PORTED, live-verified (EN and ES) |
| G10 | crisis detection (12 phrases, NFD+apostrophe) | PORTED, live-verified (EN and ES); the UI-rendering bug found and fixed this loop, plus the `aria-live` gap found and fixed in the same round |
| G11 | practiceRender equivalent (select/warn/results/live-beat) | PORTED as `PracticeLevelSelect`/`PracticeBeat`/`PracticeDebrief` — modulo the C6 hub-vs-flat-list divergence above |
| G12 | carry card | DEFERRED — not assigned to a move, not built |
| G13 | share cert + Wordle-style share | DEFERRED — same, buttons explicitly omitted rather than shipped dead (Move 5.2 log) |
| G14 | streak = days practiced | PORTED (`practiceEngine.ts`'s `completeRun`, verified live) |

## H. Overlay/a11y

PARTIAL. Root's centralized 7-overlay manager (About/prep/carry/practiceIntro
/doc/practice/papers) has no `/app` equivalent because 6 of those 7 overlays
don't exist yet (About = DEFERRED B7, prep = DEFERRED G1, carry = DEFERRED
G12, practiceIntro = DEFERRED G1, papers/practice-as-overlay = N-A, `/app`'s
practice is a routed step not a modal). The ONE overlay `/app` has —
`DocsOverlay` — got the full treatment this migration (Move 5.3):
`useOverlayA11y` hook ports focus trap, inert background, bidirectional
Tab-wrap, Escape-close, focus-restore. `esc()`'s job is structurally handled
by JSX auto-escaping everywhere except the 8 verified `dangerouslySetInnerHTML`
sites, all static extracted content (audited this session, zero on user
input). A genuine root bug (keyboard-unreachable upload controls) was found
and fixed in `/app` only, not backported.

## I. Quick-exit

N-A. Root removed this feature entirely; nothing exists to port. `/app`
correctly has no trace of it.

## J. Assets

PORTED via absolute-path sharing, not duplication — confirmed live this
session: `amparohq.com/img/scene-1.jpg` resolves correctly from the same
origin `/app` is served from. 240 audio files (238 real + 2 known-missing
ES clips, `k30`/`k33` — confirmed this session that root's own TTS fallback
mispronounces both, and a voicebox-AI-generated replacement reproduced the
identical mispronunciation and was correctly NOT shipped) all reachable at
their existing root paths, zero duplicated into `app-src/public`.

## K. Totals (current)

- i18n: 463 top-level keys / 516 deep paths per language, EN/ES structurally
  identical (verified every extraction run this migration).
- Root's 6 localStorage keys: all read-only from `/app`, whitelisted access
  only. `/app`'s own keys: `app_save`, `app_docs`, `app_you`, `app_prx`,
  `app_mute`, `app_voice`, `app_voiceLang` — 7, all `app_*`-namespaced.
- Analytics events: 0 in `/app` (root: 42) — enforced by CSP, not just
  tested.
- Audio files: 240 shared, 0 duplicated.

## L. Extra systems recon found beyond the original brief

All 15 items from wargames/15's own L row are covered by the rows above
(stuck strip → B6, demo quarantine → F8, resume/auto-ES → B1/B4 partial,
replay scoping → N-A with A5, email wiring → F6, prep drill → G1, idle
redesign → G8, prx migrations → E, a11y framework → H, 404/law-watch/
headers/meta → A7-A10, orphan audio + c-id double-duty → J, placement
strips + claims block → F4, finish-later ics → F7, stepper nav + pill →
B4, dark practice card → A3). No new item found beyond what wargames/15
already anticipated.

---

## Deferred-row count and the abort condition

wargames/15's own abort condition for this move: **">10 DEFERRED rows
without operator sign-off → the beta is a fragment, not a parity
candidate; stop and review scope."**

Counting DEFERRED verdicts above at the sub-item granularity the inventory
itself uses: **A8, A9(partial), B1(partial), B3(partial), B4(partial),
B5, B6, B7, B8, C1(partial-analytics-only, by design), C2(skipToPack),
C3(finishLater), C5(partial), C6, F5(beforeprint/afterprint — new
finding), F7, F9, G1, G12, G13 — 20 items, well over 10.**

This audit does NOT stop and silently pass. Per the wargame's own abort
condition, this is flagged explicitly: **the deferred list above needs
operator review and sign-off before `/app` is called a parity candidate
for promotion.** Every deferral has a reason attached, and the great
majority are consistent, deliberate, previously-logged product-scope
decisions (post-print rail, share/carry-card, About overlay, hub tabs) —
not accidents. But the wargame's threshold exists precisely so that volume
of deferral gets a human look before "the beta is done" gets said out
loud, and twenty crossing a ten-item line is exactly the volume that
threshold is for.

**Two items are genuinely NEW findings from this audit, not previously
logged anywhere:**
1. **C6 — practice's entry point is the wrong screen** (flat list ported
   instead of root's 3-tab hub). The most significant of the two: it's a
   structural UX difference on the primary path into the built-and-working
   practice module, not a missing corner feature.
2. **F5 — print's `beforeprint` debounce and `afterprint` banner are not
   ported.** Print itself works (verified repeatedly); the polish layer
   around it (debounce against Android's double-fire, the "printed
   successfully" confirmation banner) does not exist yet.

## Verification suite (run as part of this audit)

- `extract-app-content.mjs --verify` — PASS (2437 strings, EN/ES parity).
- `app-storage-check.mts` — PASS (13 assertions).
- `sw-routing-check.mjs` — PASS (12 assertions) — root's `sw.js`, unchanged.
- `practice-engine-check.mts` — PASS (18 checks).
- `tsc -b && vite build` — clean, entry chunk 93.03 kB gz.
- `oxlint` — clean.
- Live: `/app/sw.js` registered at scope `/app/`, precache populated with
  all 21 real build assets (confirmed via `caches.match` returning genuine
  2729-byte `index.html` content, not a stub), runtime-caching routes for
  `/audio/**`/`/img/**` present in the generated worker with isolated cache
  names. True network-disconnected (airplane-mode) reload is NOT testable
  in this harness — recommend one real device check against the deployed
  site before calling offline support proven, same category as the
  wargame's own already-flagged iOS dual-manifest RECON item.
