# /app migration — running log

Companion to `wargames/15-react-strangler-migration.md` (the plan). This file
records what actually happened per phase: what shipped, what the verification
proved, what bit, and what the next phase inherits. The wargame says what
*should* happen; this says what *did*.

Root `index.html` remains the live product and the default entry throughout.
Nothing in `/app` is user-facing yet — it carries a `noindex` and a bilingual
preview banner pointing back to the real app.

---

## Phase 0 — root service worker hardened
**Shipped 2026-08-11 · `e21d019` · deployed · tagged in v2.17.0**

The precondition, shipped alone and deployed before any `/app` code existed, so
every client's root worker updated first.

Three edits to `sw.js`, all from the wargame's red-team pass:

1. **`/app` passthrough guard.** The navigation branch stores *every* successful
   navigation under `CORE`. One online visit to `/app` would therefore have
   overwritten the cached root shell — root's offline fallback would then serve
   the wrong app to every offline visitor. Same-origin and exact-prefix, so
   `/apple-touch-icon.png` and `/application*` are not swallowed.
2. **Prefix-scoped cache cleanup.** `activate` deleted every cache on the origin.
   That would have wiped `/app`'s Workbox precache — and a cron deploys daily,
   so `/app` would have silently lost offline capability once a day *while still
   claiming to have it*. That is precisely the quiet-false-claim failure mode of
   hard rule 3.
3. **Pathname-anchored asset matcher.** It was a substring test on the whole URL,
   so any third-party URL merely containing `/img/` was cached as an immutable
   asset.

Cache name deliberately stays `amparo-v3`: bumping it would drop every existing
user's cached shell and force a re-download, which is the prepaid-data cost the
worker's own header comment exists to avoid. Workers update on file bytes, not
cache name.

`tools/sw-routing-check.mjs` — 12 assertions against the real worker with stubbed
globals. Verified meaningful: fails 5/5 against the previous version.

## Phase 1 — beta shell
**Shipped 2026-08-11 · `f21c1bf` · deployed · tagged in v2.17.0**

`app-src/` holds the Vite source; `app/` holds the committed build output. The
Vercel project is zero-config static with no build step, so the compiled bundle
ships as ordinary files. **No `package.json` at the repo root** — Vercel's
framework auto-detection keys off one and could flip the project out of static
serving, putting root deploys at risk.

React + react-dom only: 27 packages, 0 vulnerabilities. No Clerk, no Convex, no
Stripe, no analytics. Design tokens copied verbatim from `index.html:36-43` so
the shell is cream/navy/gold from the first pixel rather than drifting toward the
rejected dark palette and being retrofitted.

Verified live: `/app/` and bare `/app` both 200; **`/app` inherits root's CSP and
needs no `vercel.json` change** (a carried RECON NEEDED from the wargame, now
closed); root `index.html` byte-unchanged.

**Baseline recorded before it grows: 191 kB raw / 60.2 kB gzip for a shell that
does nothing, against 112 kB brotli for the entire live app.** That gap is the
number the eventual promotion decision has to answer for.

## Phase 2 — content extraction + storage boundary
**Shipped 2026-08-11 · `cb30cd5` · deployed**

Nothing in this phase is reachable by a user: the extracted content and the
storage module are not imported by any component yet, so the deployed bundle is
byte-identical to Phase 1's. Deploying it early is deliberate — it puts the
invariants and their checks in CI's reach before the code that depends on them
exists.

### Content: extraction, not transcription
`tools/extract-app-content.mjs` slices the `const` **statements** for every
content bank out of `index.html` and evaluates them, so the emitted JSON *is* the
source literal. Every officer line, statute quote and legal phrase is
attorney-reviewable content, and hard rule 1 forbids a model writing legal text —
making hand-transcription impossible is the only durable way to honour that in a
port. If a string is wrong it is wrong in `index.html`, and that is where it gets
fixed, possibly with an EDITION bump. Never here.

Statement-level rather than literal-level, because the banks are not uniformly
`{...}`/`[...]`: `PRX_UNSCORED` is a `Set`, `PRX_LEVEL_IDS` is a flag-dependent
ternary, and `EDITION`/`ED_REPLACE` share one statement.

Output: 8 files, ~256 kB, from **463 top-level i18n keys / 516 deep paths**.
Flags extracted dark (`FINAL_SCENARIOS_ENABLED` and `DOOR_MODULE_ENABLED` both
false, `PRX_LEVEL_IDS` resolving to `[0,1,2,3,4]`), 68 `TODO_ATTORNEY` and 4
`TODO_DV_CLINICIAN` placeholders intact, attorney slots still empty strings.

Three guards, each covering a real class of bug:

- **74 officer lines** re-checked as verbatim substrings of `index.html`; the
  tool refuses to write if any fails.
- **EN/ES structural parity** by full path. FG-09 golden #3: a key present in EN
  and missing in ES renders as a blank via the `||''` fallbacks, silently, for
  Spanish users only. Confirmed identical. Three empty ES `amend` values turned
  out to be `""` in the source for *both* languages by design — those rights
  carry no amendment tag — so a real-looking gap was closed by reading the
  source rather than assuming.
- **Nothing non-JSON reaches disk.** This one bit immediately: values built
  inside the `vm` sandbox belong to a different realm, so `instanceof Set` is
  false for a genuine `Set`, and `PRX_UNSCORED`/`PRX_DO` serialized as `{}`.
  That would have made every scored level render a score — hard mode included,
  where a score would imply the escalation was earned. Now detected by
  `Object.prototype.toString`.

### Storage: read-only by construction
`app-src/src/services/storage.ts`. `/app` may read the six root-owned keys and
write only its own `app_*` keys. The constraint is **structural, not
disciplinary**: writers take a short name and the module applies the prefix
itself, so no caller can name a root key at all, and root keys are exposed only
through individual named readers so there is no read-any-key surface either.

State diverging between the two apps during beta is accepted. A write bug in an
unproven beta corrupting a live user's saved pack is not — the pack is the
product.

Ports root's whitelists for the reasons root records (an unrecognised state
would print the **wrong state's rules**; an unrecognised lang bricks every
render) and both `amparo_prx` migrations, read-side only.

`tools/app-storage-check.mts` — 13 assertions via node's native type stripping,
no new dependency. The load-bearing one: after exercising every write path, the
six root keys must be byte-identical. The migration cases matter because getting
the index shift wrong does not throw — it silently displays a returning user's
Hard-mode result as their Checkpoint result. Verified meaningful by breaking the
shift and watching it fail.

### QA round, 2026-08-11 — three independent agents

Run after Phases 1–2 deployed. Verdicts: root regression **SAFE-WITH-CAVEATS**,
`/app` E2E **PASS**, content fidelity **FAITHFUL-WITH-NOTES**. No CRITICAL or
HIGH anywhere. Most of what was found was wrong in *this migration's own tooling*
— which is the point of running QA that does not trust the author.

**Root regression (the live product).** 89 adversarial assertions over the real
worker, plus a live browser A/B against the pre-commit version served on
localhost. All 257 tracked repo files were classified under both the old and new
`isAsset` predicates: **zero same-origin assets changed classification.** The
A/B also *proved the bug the commit fixes was real* — the OLD worker destroyed a
planted `workbox-precache-*` cache; the new one leaves it and every third-party
cache intact while still pruning `amparo-v1`/`v2`. Deployed `sw.js` is
byte-identical to HEAD and byte-stable across repeated fetches, which rules out
the one condition that could cause a reload loop. Update path traced to exactly
one reload.

Two things it corrected in my understanding: the cross-origin matcher change is
a **security fix, not a caching loss** — the old substring test would cache *any*
third-party URL containing `/img/` or `/audio/` into a never-versioned cache —
and the `/og.png` change is strictly better, since the old `endsWith` failed on a
query string.

**`/app` E2E.** Zero external hosts contacted (corroborated three ways), zero
storage keys created, no console errors, mobile-clean, product palette confirmed.
The headline: **no cache poisoning** — the cached root shell measured
545,066 bytes / sha256 `087728ad…` both before and after an online `/app` visit
while controlled by the root worker, with `amparo-v3` still at exactly 6 entries.
Committed build verified not stale (byte-identical rebuild), and deployed ==
committed == source, which independently confirms no server-side build runs.

**Content fidelity.** 2,271 string leaves walked: **0 defects.** 145 apparent
mismatches were all encoding artifacts (the source spells characters as `—`,
`\"` etc.); the *values* are identical. Placeholder counts reconcile exactly —
the only `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` occurrences not in the JSON are in
code comments. Typographic marks and all 34 `§` citations survived intact.

### Four defects the audit found in this migration's own tooling — all fixed

1. **`PLACE` was never extracted.** A bilingual bank printed on all six pack
   pages, carrying safety-relevant wording ("announce … I'm reaching for it
   slowly"). It was the *only* unextracted prose bank. Now included, along with
   `STEP_SLUG`/`DOCS`/`CARRY_F` (structural tables the app needs, where a
   retyped slug breaks routing silently).
2. **The verbatim guard verified nothing it claimed.** It sampled
   `beat.officer.en` out of `PRACTICE` — a key path `PRACTICE` does not have
   (its beats are `{o, y}`) — so the primary rehearsal dialogue contributed
   **zero** lines while the tool printed "74 officer lines checked". A guard
   advertising coverage it lacks is worse than no guard: it is the
   claim-louder-than-reality failure hard rule 3 exists for, committed by the
   very tool meant to prevent content drift. Now walks **every** string leaf —
   2,317 of them.
3. **The JSON-safety guard was Set/Map-only.** `RegExp`, `Date`, functions,
   `undefined` and `NaN` all serialized to `{}`/`null`/nothing at exit 0. Now an
   allowlist of the JSON types. Verified against all five attacks plus a clean
   control.
4. **`plain()` was destroying the evidence.** Even after (3), `RegExp` and `Date`
   still passed, because `plain()` recursed into anything with
   `typeof === 'object'` and flattened them to `{}` *before* the guard ran. It
   now only rebuilds genuine plain objects.

Also fixed: the escape-tolerant matcher was decoding HTML entities, which turned
a *correct* string into a false miss — `&amp;` inside a value is content ("Civ.
Prac. &amp; Rem. Code"), not encoding, because these literals live inside a
`<script>` where `&` is already literal. JS escapes are decoded; entities are not.

Two findings from the E2E pass were also fixed: the Spanish banner now carries
`lang="es"` (without it a screen reader applies English phonetics to half the
audience's language), and `/app` now gets its **own, strictly tighter CSP** —
no CDN, no analytics hosts, no inline scripts. Root's rule is deliberately not
edited; the block is appended, so root keeps exactly the policy it has today
under any precedence rule. That moves "zero analytics" from tested to enforced.

### Open, NOT from this migration — root's offline chip can overclaim
On a true first visit the root app can display *"Saved on this device — works
without internet"* while `caches.keys()` is empty and no worker controls the
page: the chip is gated on `navigator.serviceWorker.ready` (resolves on an
active *registration*) rather than on the page being controlled or anything
actually being cached — while the source comment claims the opposite. For a
product whose pitch is roadside offline reliability this is an honesty gap of
exactly the kind rule 3 names. Pre-existing, unrelated to `e21d019`, and root
fixes ship separately from migration work — so it is filed here, not patched
mid-phase. The agent marked its production repro [UNVERIFIED] outside its
browser environment; settle with a normal incognito window before fixing.

### Inherited by Phase 3
- **~236 kB of content JSON must be code-split, not imported wholesale.** The
  bundle is still 60.2 kB gzip only because nothing imports it yet. `map.json`
  alone (the state-map path data) is 45.6 kB.
- The wargame's "every `localStorage.setItem` literal matches `/^app_/`" bundle
  check becomes meaningful once the storage module is actually imported.
- Root's amendment tags are language-neutral (`"5th Amendment"` in both EN and
  ES). Observed, not changed — it is shipped content.

---

## Phase 3 — welcome screen + geographic state map
**Committed 2026-08-12 · NOT yet deployed**

Designed by four agents (three independent specs + an adversarial critique that
reconciled them) before any code was written. The critique caught two errors in
already-committed Phase-1/2 work and one chain of reasoning that changed the
whole shape of the move.

### Decisions, settled before code
`screens/` (not `steps/`) · context+hooks in `i18n.ts`, provider in
`LangProvider.tsx` · **named JSON imports only**, lint-enforced · navigation
*contract* now, hash router deferred to Phase 4 · Phase 3 writes `app_lang` and
`app_save.state`, nothing else · welcome's gold CTA navigates in-app ·
`document.title` unchanged (still "preview build") · baseline stated as
**gzip -9**, not Vite's build-report gzip, because three specs quoted three
different numbers for the same file.

### The finding that reshaped the move: F3 is unexecutable
The wargame pre-registered fork F3 — "if React fights the imperative
choreography, wrap the existing vanilla map verbatim." That option **does not
exist**, and only became visibly impossible after `/app` got its own CSP:

- Root ships every map handler as an inline attribute injected via `innerHTML`
  (`onclick="pickState('AL')"`, `index.html:3232`). `script-src 'self'` blocks
  inline handlers, so a verbatim wrap renders a correct-looking map that is
  **completely dead to input**, with 51 CSP violations.
- The choreography F3 protects is absent anyway: root's collapse timeline needs
  GSAP, GSAP loads from cdnjs, and the same CSP forbids it. Root's own no-GSAP
  path is an instant swap — that is what `/app` ships.

So the clean React port was not merely preferred, it was the only option — and
it is *smaller* than feared, because the alphabetical 51-button grid is never
visible in root either (`index.html:212`), so the port deletes it entirely.

### Two errors this phase corrected in earlier commits
1. **The `sr-motion` comment shipped in Phase 1 was backwards.** It said the
   class means "the user asked for reduced motion". `SR.arm()`
   (`index.html:1397-1400`) adds it only when GSAP loaded **and** reduced-motion
   is off — it means "GSAP owns motion", and `:not(.sr-motion)` is the fallback
   branch. An implementer trusting that comment would have gated the entrance
   wave behind a class that can never be set in `/app`, and it would simply
   never have played.
2. **The CSP comment was over-general.** It said Vercel applies the first
   matching header *block*. Precedence is per header **key** — provable from
   `vercel.json` alone, since four later blocks set `Cache-Control` while
   relying on the first block for CSP. The `/app` block was dead because
   `/(.*)` already set that key, not because later blocks never apply.

### Bugs avoided, and how each was verified
- **Labels stacking at 0,0** — no `getBBox` anywhere. `SM_BOX` already *is* that
  measurement (`index.html:3731-3734` records it being baked in), so labels
  compute at module scope and render in the same JSX pass as the paths.
  Verified: `labelsAtZero: 0`, RI offset-right at x=892 with `anchor=start`.
- **Search re-mounting 51 paths** — verified by *node identity*, not by eye:
  the same DOM node for TX before and after a search (`sameNodeAfterSearch:
  true`), path count stable at 51, 50 dimmed on "tex", 0 after clearing.
- **51 phantom tab stops when collapsed** (critique risk R2) — verified by
  focusability, not a DOM count: the hidden holder computes `display:none`,
  paths have zero client rects, and `.focus()` on a path does not land.
- **The entrance wave** uses `backwards` instead of root's `forwards`, which is
  what root's own comment (`181-186`) says it wanted: `forwards` held opacity:1
  in the animations cascade layer so `.nomatch{opacity:.1}` could never win and
  search dimming silently died. Root works around it with a 950 ms class swap.

### Measured
Entry **270.07 kB raw / 91.76 kB gzip**; `StateStep` chunk **48.48 kB / 16.89 kB
gzip**, holding `map.json`. That is 31% of the wargame's 300 kB gz abort
threshold. Verified by probe string that the map path data is in the lazy chunk
and **absent from the entry chunk**. `CITED` (three key names, ~20 bytes,
extractor-derived) replaced importing `STATES` on the map path — measured at
5.98 kB gzip for three strings.

### Observed, not fixed: sliver-state tap targets
At 375 px, RI's label measures **5×4 px** — far below the 44 px minimum. This is
root parity, not a regression: root's SVG scales down whole and its own comment
(`index.html:204-206`) concedes small-state polygons stop being realistic
targets below 380 px, naming the offset labels and the search box as the honest
paths. The search box is ported. Changing the map's visual design to enlarge
sliver targets is a product decision, not a migration one — logged here rather
than decided mid-port.

### Deferred, logged not omitted
`skipToPack` (`index.html:3266`, needs the pack screen from Move 4.3) and
`finishLater()` (`3267`, writes an `.ics` and belongs with the pack flow). The
stepper and travelling state pill arrive with Move 4.1, when there is more than
one step to move between. Root's `sr_state_selected` analytics call is deleted,
not stubbed — `/app` ships zero analytics.

**Added after QA caught the omission:** root's **law-watch strip** (Appendix A
row A10) is also absent — the line reading "Statute sources auto-checked
daily…", fed by a `law-status.json` fetch. `/app` neither renders it nor makes
that request. Deferred deliberately: the strip asserts a freshness check, and
asserting it in a build that does not perform the check is precisely the
badge-that-lied precedent hard rule 3 exists for. It returns when `/app` fetches
`law-status.json` itself. Recorded here because it was omitted silently the
first time, which is the part that was wrong.

### QA round — two independent agents, both after deploy
**Code review** (`f0d4819`) found **seven** defects, all in code written this
session: a model-authored `aria-label` that also *displaced* root's real
`English`/`Español` labels; a caption reading the legend string instead of
root's; 102 tab stops where root has 51; a redesigned confirmed chip that
dropped the `non-scaling-stroke` keeping RI/DE/DC legible; `CITED` correct only
by accident; four CSS drifts in a file claiming a verbatim port; and a language
precedence divergence on a *corrupt* `sr_save`. Fixed in `fbad6ae`.

**E2E** (also `f0d4819`, so it independently re-found the tab-stop issue) added
two more:
- **`<html lang>` never updated on mount.** The assignment lived only inside
  `setLang`, so every path resolving to Spanish *without a click* — persisted
  `app_lang`, inherited `sr_save.lang`, browser sniff — rendered the whole page
  in Spanish inside `<html lang="en">`. The same defect the banner's `lang="es"`
  fixes, at document scope. Now an effect keyed on `lang`.
- **The Continue CTA was an enabled no-op.** `disabled={!picked}` with
  `onNext={() => {}}`: pick a state and the primary button became live and
  silent — contradicting the rule its sibling screen states in a comment. Now a
  disabled button until a state is picked, then an anchor to the live app,
  matching how Welcome routes every unported destination.

What it confirmed held, under adversarial testing: **zero external hosts**
(three ways, plus a `securitypolicyviolation` listener that stayed empty), the
six root keys **byte-identical by sha256** after a full session, `amparo-v3`
containing only root's shell at the same hash as before, one SW registration,
welcome strings string-identical to root in both languages, and the
collapsed-map a11y tested by focusability rather than node count — all 102
targets returning zero client rects with `.focus()` landing on none. It also
measured the sliver-target claim rather than accepting it: `/app` RI label
4.97×4.00 px vs root's 4.94×4.00 — genuine parity, worst case DC's path at
1.05×1.28 px. Still far below WCAG 2.5.8's 24×24, and still a product decision.

---

## Phase 4 — You step + document capture + Lifelines
**Shipped 2026-08-12 · deployed**

Moves 4.1 (You + docs) and 4.2 (Lifelines) together — the wargame separates
them, but You's own Continue button is the entry to Lifelines, so shipping one
without the other would have meant either a dead end or a stub.

### Move 4.1 — You + document capture
Ported from index.html:3271-3302 (form) and 3527-3637 (the docs system).
Native `<input type="file" accept="image/*" capture="environment">` only — no
`getUserMedia`, matching root's own design history (the 493-line guided
capture engine deleted in v2.1.0). Photos land in their own `app_docs` key,
separate from `app_you`, mirroring root's `sr_docs`/`sr_save` split so
"delete my photos" can never take the rest of the pack with it.

`docsShrink`'s downscale (1100px long edge, JPEG 0.72) ported verbatim.
`docPick`'s quota-rollback needed a storage primitive that doesn't exist yet:
`writeApp` swallows failures silently by design, but root's `docsSave()`
returns a boolean specifically so a failed write can roll the photo back and
alert the user. Added `writeAppReporting` as a second function rather than
change `writeApp`'s signature for every other caller.

The overlay is deliberately minimal — Escape closes, focus moves in on open
and returns to the trigger on close — not root's full 7-overlay z-index/focus
framework, which is Move 5.3's job and would be building ahead of the one
overlay /app has today.

**Not ported, and why:** `d_start`/`d_skip`/`d_deskhint` (guided-capture-only
strings, confirmed orphaned — never referenced by `renderPapers()` in current
source, leftover from the same deleted engine). The "remind me tomorrow" `.ics`
link inside the overlay (`d_later`/`downloadFinishReminder()`) — deferred with
`finishLater()`, both `.ics` writers belong with the pack flow. The optional
email field — gated behind `REVIEW.emailEnabled`, which is `false` today, and
would route through a Netlify function that doesn't exist in /app.

### Move 4.2 — Lifelines
Ported from index.html:3304-3320, `llTab`/`llSync`/`llGo` (3871-3919),
`lifeContact` (3852-3859). Segmented tabs over one scroll-snap track; dots and
the count follow scroll position as the single source of truth, same as root
— no separate "current index" state to drift from what's on screen. Continue
is deliberately never gated, for root's own stated reason: the one real
completed-funnel user in this product's history said "I skip all of that,"
and forcing a swipe through every card first would have blocked the one
person who ever finished.

### A real bug, caught by browser testing before commit
**You's Continue button was wrongly disabled.** Root's next step from You is
**Lifelines** (`saveInfo()` → `goM(3)`, index.html:3995), not Print — but this
screen was written assuming Print was the destination (Move 4.3, not yet
built) and disabled Continue on that wrong assumption, even though Lifelines
was built in this same phase. Caught by driving the actual navigation chain in
a browser rather than trusting the code. Fixed: both Continue and "Skip this"
now route to Lifelines, matching `skipInfo()`'s identical destination
(`goM(3)` — root's own comment notes the skip path needs no extra state,
since every info field already initializes empty).

### A second regression, caught the same way
**Eyebrow (eager) pulled the whole map module into the entry chunk.** The
travelling state pill renders a `StateSilhouette`, which imports
`content/map.ts` — the same module `StateMap.tsx` uses, holding all of
`US_PATHS`. Measured: entry chunk jumped from the Phase-3 baseline of
91.76 kB gz to 116.13 kB, and a probe string from `map.json` that must only
ever appear in the state-screen chunk showed up in the entry bundle instead.
Fixed by lazy-loading `Eyebrow` alongside the screens — it never renders on
Welcome, the only eager screen, so this costs nothing on first paint. Entry
back to **92.16 kB gz** (well within the 91.76 kB baseline's rounding). New
`states-*.js` shared chunk (8.48 kB gz) holds `STATES`/`US_STATE_NAMES`,
loaded once and shared across `Eyebrow`, `StateStep` and `LifelinesStep`.

### Storage after a full session
`app_save`, `app_you`, `app_docs`, `app_lang` — all `app_*`, verified via
`app-storage-check.mts` (13 assertions, unchanged) plus a live browser session
confirming field values and photo slots survive a reload.

### Correction: the dot-navigation "environmental quirk" was a flaky test, not a real issue
The previous entry here reported that `goTo`'s `scrollTo({behavior:'smooth'})`
did not animate and filed it as an unverified environment quirk. That report
was wrong, and re-testing found the actual cause: the first test batch fired
several overlapping `scrollTo`/reload/dispatch calls back to back with no
settle time, which left stale animation state that suppressed the next
`scrollTo`. Isolated and re-run cleanly — `scrollLeft = 0`, a short wait, THEN
one `scrollTo({behavior:'smooth'})` — the animation ran correctly every time:
13 samples showing clean progression (39→214→359→442→475→499→507→511) settling
at the scroll-snapped position. Repeated through the actual dot **button
click** (not a manual replication) with the same clean result: `activeDotIndex:
2`, `"3 of 5"`. Dot-tap navigation is fully proven, no code change needed. The
lesson worth keeping: a failing check needs to be isolated and re-run before
it's trusted, in both directions — the same discipline that caught real bugs
elsewhere in this phase almost produced a false report here.

### Deferred, logged not omitted
Print (Move 4.3) — the You and Lifelines Continue buttons both currently have
somewhere real to go (each other), so nothing in this phase is a dead end.
`skipToPack` and the `.ics` writers remain the only unbuilt destinations, as
recorded in Phase 3.

---

## Move 4.3 — Print/pack system

The six-page printed pack (`PrintPack.tsx`) and its screen (`PrintStep.tsx`),
wired as `lifelines → print`. This was the largest single move in Phase 4 —
ported `buildPrint()` (index.html:4033-4237) plus the step===4 render block
(index.html:3323-3414).

### What shipped
- `content/icons.json` — new extraction group (`LOGO`, `ICONS`, `PLACE_ICONS`),
  added to `extract-app-content.mjs`'s `GROUPS`. Pure SVG markup, still
  mechanically sliced rather than hand-copied — a mistyped path datum is a
  silent visual defect, and the no-hand-transcription rule is cheaper to apply
  uniformly than to re-justify per file.
- `styles/print.css` — verbatim port of the pack CSS (index.html:1030-1112)
  plus the thumbnail/split layout CSS (index.html:279-309). Targets
  `#appPrintRoot` instead of root's `#printRoot` so a user with both the root
  tab and `/app` open printing at the same instant can't collide.
- `components/PrintPack.tsx` — all six pages as JSX. Two fields carry real
  embedded markup from the extracted banks (`STATES.*.rules_*`'s `<i
  class="stq">` statute-quote spans, and `PACK_EXTRA.claims.*`'s `<b>` tag) —
  those two, and only those two, use `dangerouslySetInnerHTML` on static
  extracted content, never on a user-entered field. Every other user-facing
  string is a plain JSX text child, auto-escaped by React — a stricter
  guarantee than root's own `esc()` helper gives for the six user-entered
  fields (name/ec/ecp/ec2/ecp2/att).
- `screens/PrintStep.tsx` — compare box, thumbnail carousel, docs row (reuses
  `DocsOverlay`), print button, pdf-help disclosure toggle. Thumbnails use the
  same clone-and-scale mechanism as root (index.html:3391-3406): the six
  hidden `#appPrintRoot` pages are cloned and CSS-scaled into each thumbnail
  slot, so a thumbnail can never drift from what actually prints.
- `LifelinesStep`'s Continue button now navigates to `print` instead of
  linking out to `/`.
- `nav.ts` gained the `'print'` route (the `ui.json` `STEP_SLUG` bank already
  had the slug reserved at index 4).

### Real defect found in root, not replicated
`buildPrint()` page 6 (index.html:4207) renders `${PX.con_h}` as a box
header, but `PACK_EXTRA.en`/`PACK_EXTRA.es` have no `con_h` key anywhere —
confirmed by grepping the full source, not just the extracted JSON. Root's
template-literal interpolation coerces that to the literal string
`"undefined"`, so every printed pack today shows the word "undefined" as that
box's header, in both languages. Not something to hand-author a replacement
string for (the no-authored-user-facing-text rule holds even for one-off
fixes), so `PrintStep`'s box degrades to icon-only (`📞`) instead of
reproducing the glitch. Verified live: `document.querySelectorAll('#appPrintRoot
.pbox h3')` shows every other box's real extracted header text and this one
alone as bare `"📞"` — no literal "undefined" anywhere in `/app`.

### Deferred, logged not omitted
No demo banner (no demo mode in `/app`). No post-print rail (practice-hub
links point at Phase 5, unbuilt; email button gated by
`REVIEW.emailEnabled=false`; restart/printForFamily/reprint-reminder actions
have no destination yet). No print-feedback prompt — needs its own
analytics-free storage decision, deferred with the rail rather than stubbed.
`isReviewed`/`reviewLine` (index.html:2590-2596) ported as pure functions but
are a dead path today: every `REVIEW.attorneys[*].name` is `""`, so the pack
always shows "PILOT EDITION," matching root's current live behavior exactly.

### Verification
- `extract-app-content.mjs --verify` — PASS (2333 strings verified present in
  index.html, EN/ES structure identical, icons.json now included).
- `app-storage-check.mts` — PASS (13 assertions, unchanged; `PrintStep` reads
  `app_you`/`app_docs`, writes nothing new).
- `sw-routing-check.mjs` — PASS (12 assertions, unchanged).
- `tsc -b && vite build` — clean. Entry chunk held flat at **92.32 kB gz**
  (was 92.16 kB); new `PrintStep-*.js` chunk is 20.26 kB gz, lazy-loaded only
  on reaching step 4 — never touches the entry bundle.
- `oxlint` — clean, no warnings.
- Live browser session (Texas, name filled): state map → You (name "Maria
  Gonzalez") → Lifelines (confirmed Texas-specific 211/AG hotline, matching
  Move 4.2's fix) → Print. Verified in the rendered DOM: page 1 header shows
  "Texas · Maria Gonzalez"; compare box, docs row, print button, and the
  pdf-help toggle all render and the toggle opens/closes correctly; page 6's
  claims box shows real bolded Texas-specific deadline text with no literal
  `<b>`/`<i>` tags leaking as text; the `con` box (root's `con_h` defect)
  shows icon-only, not "undefined". Zero console errors throughout.

---

## Standing constraints (unchanged, every phase)
1. No model-authored officer dialogue, statutes, or legal phrases — extraction only.
2. Nothing leaves the device. `/app` beta ships **zero** analytics.
3. Feature flags stay dark; `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` placeholders intact.
4. Root `index.html` untouched until documented parity, which is a separate decision.
5. No Clerk, no Convex, no Stripe, no accounts.
6. Abort rather than improvise if a move appears to require editing legal content.

---

## PHASE 5 — Practice engine

## Move 5.1 — Engine core as an explicit FSM

`engine/practiceEngine.ts` — pure state + transition functions (no DOM, no
React, no audio) for the practice run lifecycle: `IDLE → PRE_FLIGHT →
OFFICER_SPEAKING → AWAITING → BEAT_COMPLETE → DEBRIEF`. Ports G2 (deck
building), G5 (`PRX_OPT` g/b/coach/react + `bothGood` hard-mode semantics),
G6 (run FSM: per-level consent, crisis-skip alignment), G7 (divergence,
selection-only) — index.html:4373-4762, 5119-5255, 5428-5491.

### What shipped
- `buildDeck()` — verbatim port of `prxBuildDeck` (fixed tracks for levels
  3-7, tone-pool variant deal for 0-2, date-seeded curveball splice from the
  2nd run of a level onward). `now`/`rng` are injectable for determinism
  testing only; production callers omit both.
- `isLocked()` / `selectLevel()` — the lock guard lives IN the transition
  function, not a UI helper, per the wargame's explicit instruction ("styling
  helpers don't refuse — the guard does").
- `confirmWarn()` / `PRE_FLIGHT` phase — per-level consent gate (`prWarnOk`),
  not a single global flag: clearing level 3's gate must not silently consent
  a player into level 5 or 6, matching root's own fix for that exact bug
  (index.html:4750-4755).
- `pick()`, `markCrisis()`, `advance()`, `back()`, `again()`, `toLevels()` —
  the run mechanics. `advance()` carries the `run[]`/`runIdx[]` split intact:
  crisis-tier beats advance `idx` but are excluded from both arrays, so a
  later read by shared index never misaligns (root's own inline warning
  about this exact class of bug, index.html:4757-4761).
- `divergeDeck()` — selection-only re-deal of the *next* beat's tone
  (index.html:5209-5238 comment block explains the per-level escalation caps
  in detail; ported as-is, immutable instead of root's in-place
  `Object.assign` mutation).
- Debrief bookkeeping (`runs`/`done`/`best`/`streak`) folded into `advance()`
  from root's inline `practiceRender()` branch — returned as part of the new
  state's `progress`, not written to storage directly; the caller (Move 5.2's
  UI) persists it via `app_prx`, matching this project's storage-boundary
  rule that root's `amparo_prx` stays read-only from `/app`.

### Real defect found in the extraction tool, not the engine
`PRACTICE.en/es[20-22, 30-33]` (hard-mode and checkpoint beat text) and
`PRX_OPT[20-22, 30-33]` (their option sets, including `bothGood`) are added
by top-level assignment statements AFTER the initial `const PRACTICE = {...}`
/ `const PRX_OPT = {...}` literals (index.html:4511-4538, 4679-4705) — the
same runtime-synthesis bug class as the STATES bug from Move 4.2, except this
time the fix belongs in the extractor itself: `tools/extract-app-content.mjs`
only sliced `const NAME` declarations, so `practice.json` silently shipped
without any of the hard-mode or checkpoint beat content. Building the deck
for level 3 or 4 would have thrown (`PRACTICE.en[20]` undefined) or rendered
missing option text the moment Move 5.2 wires a UI to it. Fixed by extending
the extractor to also slice every top-level `PRACTICE.(en|es)[N]=` and
`PRX_OPT[N]=` assignment statement (matched generically, not hardcoded to the
current ci list) and fold them into the same evaluated program, in source
order. `practice.json` grew 33.6 kB → 43.5 kB; re-verified byte-identical
against index.html (2437 strings, up from 2333).

### Verification
- `tools/practice-engine-check.mts` (new) — 17 checks: deck ci sequences for
  all 8 levels (0-2 randomized-tone, 3-7 fixed tracks), curveball-splice
  determinism for a fixed date, the lock gate (including level 6's extra
  `done[5]` requirement), per-level consent persistence across re-entry,
  crisis-skip `run[]`/`runIdx[]` alignment, debrief bookkeeping (including
  the no-double-count case and hard mode's unscored `best`), `back()`
  rewind, `again()`, and `bothGood` always scoring tier `g`. All pass.
- `extract-app-content.mjs --verify` — PASS (2437 strings, EN/ES parity
  intact, idempotent).
- `app-storage-check.mts` / `sw-routing-check.mjs` — PASS, unchanged (no
  storage or SW surface touched this move).
- `tsc -b && vite build` — clean. Entry chunk unchanged (92.32 kB gz):
  `practiceEngine.ts` is not imported by any screen yet, so it isn't in any
  chunk at all — Move 5.2 is what wires it up and is where its bundle cost
  will actually show.
- `oxlint` — clean after fixing one violation: the first draft imported
  `practice.json`'s default export, which the project's `no-restricted-
  imports` rule blocks (default JSON imports drag the whole bank into the
  chunk instead of tree-shaking per key — the rule's own message cites a
  measured 0.51 kB vs 28.28 kB difference on `states.json`). Switched to
  named imports.
- No live browser verification this move — nothing renders yet; Move 5.2 is
  where the practice UI exists to click through.

### Deferred to Move 5.2
Audio-driven `OFFICER_SPEAKING → AWAITING` gating (the phase names exist now;
nothing yet drives the transition on a real clip/TTS event), crisis-phrase
detection itself (G10 — `markCrisis()` exists as a pure transition, the
12-phrase NFD/apostrophe-insensitive matcher that calls it does not), the
typed-answer matcher (G9), and everything UI (scenario cards, chat thread,
demeanor meter, score ring, results/debrief screens, mute/voice controls).

---

## Move 5.2 — Practice UI + audio

The practice screens themselves (`PracticeStep.tsx`, `PracticeLevelSelect.tsx`,
`PracticeBeat.tsx`, `PracticeDebrief.tsx`), officer audio (`usePracticeAudio.ts`),
and the two pieces of run mechanics 5.1 explicitly deferred: the typed-answer
matcher (G9, `matchTypedAnswer`) and crisis-phrase detection (G10,
`isCrisisText`). Ported G8/G9/G10/G11 per the wargame's action bullet —
index.html:4796-4944 (audio + crisis), 5418-5643 (practiceRender).

### What shipped
- `styles/practice.css` — the `prx-`/`prc-` prefixed classes ported verbatim
  from index.html:395-770. Deliberately NOT ported: `#practiceOverlay`'s
  modal backdrop, its scoped dark-card theme, and the tone-atmosphere border
  glow. Root needs those because practice is a full-screen modal reachable
  from several entry points in its SPA; `/app` has practice as step 5 of one
  linear funnel, so it reuses the same light `.card` shell every other step
  already uses. Everything that renders CONTENT is ported; the container
  chrome is not — logged as a structural adaptation, not a content cut.
- `usePracticeAudio.ts` — the clip-then-TTS double-fallback latch, mute (own
  `app_mute` key, independent from root's `amparo_muted`), gender and
  voice-language preferences, and the 12-second idle-freeze offer (replay or
  leave, never an escalation). `SpeechRecognition` stays unported, per
  wargames/14 — root's own `PRX_SR` is dead code as of v2.16.1.
- `practiceEngine.ts` gained `matchTypedAnswer()` (G9) and `isCrisisText()`
  (G10, in the audio module) plus `splitKeyPhrases()` for highlighting the
  model line's quoted key phrases — all pure functions, ported verbatim.
- `PracticeLevelSelect.tsx` — the scenario cards, lock icons, best-score
  badges, streak banner.
- `PracticeBeat.tsx` — chat thread, demeanor meter, progress rail, audio
  controls, options + typed-answer disclosure, coach/model/citation.
- `PracticeDebrief.tsx` — scored results (score/grid/stats/breakdown) and the
  unscored hard-mode debrief (never a scoreboard, by design). The carry card
  (G12) and share cert (G13) are out of this move's scope per the wargame's
  own action bullet — their buttons are omitted rather than shipped dead;
  the level-2 "next level" progression CTA (a plain in-scope navigation) is
  wired.
- `PrintStep.tsx` gained a "Practice the script" CTA using root's own
  `prx_open_cta` string — the post-print rail stays otherwise deferred
  (email/restart/family/reminder actions each need their own decision), but
  the destination this one link needs now exists.
- App wiring: `nav.ts` gained the `'practice'` route; `App.tsx` lazy-loads
  `PracticeStep`.

### Real bug caught by live verification: crisis reveal never rendered
`markCrisis()` (Move 5.1) correctly set `curTier: 'x'` and suppressed the
score/match UI, but `PracticeBeat`'s answered-branch had no special case for
it at all — it fell through to the normal opt-based coach/model text, same as
any other answer. Typing an actual crisis phrase ("I want to die honestly")
during live verification produced a plain "good answer" coach box instead of
the 988 line. Root hides this because it patches the coach `<div>` via
`querySelector` after the normal render (index.html:5105); the React port
needed an explicit `state.curTier === 'x'` branch instead, since there is no
DOM to reach into afterward. Fixed and re-verified live: the same input now
shows only `prx_crisis` ("...you don't have to carry it alone. You can call
or text 988...") with no scoring language, no key-phrase grading, no
citation.

### Real bug caught: two more strings with embedded HTML, unhandled
Grepped every extracted string bank for `<br` / `<b>` after finding the
crisis gap, rather than waiting for the next one to surface live:
- `ab_founder_note` (rendered in the debrief footer) carries paragraph breaks
  as literal `<br><br>` — root gets real line breaks because it builds this
  via `innerHTML`; the naive `<p>{t.ab_founder_note}</p>` port showed the
  literal characters. Fixed by splitting on `<br><br>` into separate `<p>`
  tags — plain paragraph structure, not markup worth a `dangerouslySetInnerHTML`
  review surface for.
- `prx_resource` (the crisis-resource line under every debrief) has
  interleaved `<b>988</b>`/`<b>aclu.org</b>` tags and an `&amp;` entity —
  same treatment as `PrintPack`'s statute-quote/claims fields:
  `dangerouslySetInnerHTML` on static extracted content, justified inline.
- Checked every other `<br>`/`<b>`-carrying key (`doc_resource`, `pi_body`,
  `lawchk`, `lawchk_flag`, `c_ub_chrome/safari/firefox`) against every
  currently-built screen — none are rendered anywhere yet, so nothing else
  needed fixing this move. Left for whichever future move builds those
  screens to catch the same way.

### Noted, not fixed: browser CSP/worker console warning
Live verification surfaced a recurring console error — `Creating a worker
from 'blob:...' violates ... "script-src 'self'"` — whenever the TTS
fallback path fires (audio clips 404 in the Vite dev server, which doesn't
serve root's sibling `/audio` directory; confirmed separately that
`amparohq.com/img/scene-1.jpg` loads correctly in production, same origin as
`/app`). This appears to be this Chromium build's own internal
`speechSynthesis` implementation spinning up a Worker via a blob URL — not
something this code creates. Root's CSP is equally `script-src 'self'` (plus
trusted hosts), so root would hit the identical warning under the same
conditions. Non-blocking: mute, gender, voice-lang controls, and the rest of
the run all worked correctly through it. Flagged rather than chased further
— would need a real production audio clip (not a 404) to confirm whether it
also fires on the success path, which dev can't test.

### Deferred, logged not omitted
G1 (intro + prep drill + tap-to-place recall — its own mini-engine, gates
first-ever run) and G12/G13 (carry card, share cert) are not listed in the
wargame's Move 5.1/5.2 action bullets at all — not silently dropped, just
never assigned to a move yet. `practiceIntroOpen()`'s first-run gate
(index.html:2977) means `/app`'s practice entry currently skips straight to
the level tiles every time, which is a real behavior gap for a true
first-ever visitor; logged for whichever move claims G1.

### Verification
- `tsc -b && vite build` — clean. Entry chunk held flat at **92.39 kB gz**
  (was 92.32 kB before this move); new `PracticeStep-*.js` chunk is
  17.82 kB gz, lazy-loaded only past the print step.
- `oxlint` — clean.
- `extract-app-content.mjs --verify` / `app-storage-check.mts` /
  `sw-routing-check.mjs` / `practice-engine-check.mts` — all PASS, unchanged
  from Move 5.1 (this move added no new content extraction or storage
  surface beyond `app_prx`/`app_mute`/`app_voice`/`app_voiceLang`, all
  `app_*`-namespaced).
- Live browser session: full run through Level 0 (Calm stop) twice —
  multiple-choice picks, the typed-answer matcher (verified "Passed — you
  hit 2 of 2 key words" with correct citation), crisis detection (before and
  after the fix), the date-seeded curveball firing on the 2nd run with the
  correct banner, debrief with correct score **excluding** the crisis beat
  from the denominator (2/4, not 2/5), the level-2 progression CTA, and
  returning to level-select to confirm the best-score badge (🟩4/6) and the
  lock gate (Hard Mode locked, Checkpoint correctly never gated). Zero
  uncaught exceptions; only the noted CSP/worker warning and expected
  dev-only 404s (audio/img paths that resolve fine in production).

---

## Move 5.3 — Overlay/a11y framework

Focus trap, inert background, focus restore, and Escape-to-close for
`DocsOverlay` — the one overlay `/app` has today — plus a keyboard-only pass
and a manual accessibility scan across the whole funnel. Ported H1/H2 per
the wargame's action bullet — index.html:5814-5877.

### What shipped
- `hooks/useOverlayA11y.ts` — a reusable hook, not root's shared
  MutationObserver-driven manager. Root centralizes across seven always-
  mounted DOM overlays; `/app`'s overlays are conditionally-rendered React
  components, so the hook is driven by the `active` boolean React already
  tracks, applied per-instance. Same semantics: remember the trigger on
  open, mark `#app-root` inert, focus the first focusable element (or the
  container itself if none), trap Tab in both directions, Escape closes,
  restore focus to the trigger on close. Root's z-order "topmost wins"
  picker (`ovTop()`) isn't ported — `/app` has exactly one overlay type,
  never nested, so there is nothing to be topmost over; noted in the hook's
  own comment for whenever a second overlay makes that real.
- `DocsOverlay.tsx` now renders via `createPortal(..., document.body)`
  instead of inline in the component tree. It has to: `#app-root` gets
  `inert` while any overlay is open, and the overlay was previously a
  descendant of `#app-root` (nested inside whichever step rendered it),
  which would have made it inert too — same DOM shape problem root avoids
  by keeping its seven overlays as literal siblings of `#appRoot`.
- `App.tsx`'s shell gained `id="app-root"` so the hook has something to mark
  inert.

### Real bug found: upload buttons were keyboard-unreachable — in /app AND root
The keyboard-only pass (Tab through the doc-capture overlay) found the five
"Tap to add photo" controls never received focus at all. Root cause: both
root and `/app` render them as a bare `<label>` wrapping a `display:none`
file input (index.html:3627) — a label with no `tabindex` is not natively
in the tab order, and a `display:none` input can never receive focus either.
Root has carried this since Move 4.1's source. Not backported to root
(policy: root stays untouched), but cheap to fix in `/app` and directly
blocks this move's own verification requirement ("keyboard-only full
pass"), so fixed here: `tabIndex={0}` on the label plus a keydown handler
forwarding Enter/Space to the hidden input's `click()` — the behavior a
native `<button>` gets automatically. Verified live: all 5 upload labels
now appear in the overlay's focusable-item list between the close button
and the "Done" button, in the same visual order.

### Verification
- Live keyboard-only pass: Welcome (Tab order sane, external CTAs correctly
  point at root's live site) → State → You (opened the docs overlay via a
  real focus-then-activate sequence, matching an actual keyboard user, not
  a synthetic click — the first test attempt used `.click()` without
  focusing first and produced a FALSE FAILURE on focus-restore, caught and
  redone correctly, the same "isolate and re-run before trusting a failing
  check" discipline from the Phase 4 scrollTo correction).
- Overlay a11y chain confirmed via direct DOM inspection at each step:
  `inert` present on `#app-root` while open / absent while closed; the
  overlay card confirmed NOT a descendant of `#app-root` (portal working);
  focus lands on the first focusable element (close button) on open; Tab
  from the last item wraps to the first, Shift+Tab from the first wraps to
  the last; Escape closes, removes `inert`, and restores focus to the exact
  `.docrow` trigger element.
- Manual accessibility scan (no axe-core tool available in this
  environment, so a targeted DOM audit instead) run on four screens — You
  step, level-select, live practice beat, and the docs overlay itself:
  every `<img>` has `alt`, every `<button>` has an accessible name, every
  `<input>` (excluding file/hidden) has a label, the one `role="dialog"`
  has `aria-label`, the demeanor meter's `aria-live` region is present.
  Zero issues found on all four.
- `extract-app-content.mjs --verify` / `app-storage-check.mts` /
  `sw-routing-check.mjs` / `practice-engine-check.mts` — all PASS, unchanged
  (this move touched no content extraction or storage surface).
- `tsc -b && vite build` — clean. Entry chunk unchanged at 92.41 kB gz.
- `oxlint` — clean.

### Deferred, logged not omitted
Root's z-order topmost-picker (only matters once `/app` has two overlays
that can nest — doesn't exist yet). G1 (intro/prep-drill first-run gate)
remains unassigned to any move, as noted in Move 5.2's log — `/app`'s
practice entry still skips straight to the level tiles for a true
first-ever visitor.

**Phase 5 complete.** Next: Phase 6 — `/app` service worker + manifest
(Move 6.1), then the parity audit (Move 6.2), the last phase in
wargames/15.

---

## Post-Phase-5 fixes — loop round after v2.19.0

Two independent live QA passes (EN/TX+NY returning-user, ES/Georgia
fresh-session — both zero defects) plus this loop's three background
reports (focus group 11, module review 17, blindspot audit
2026-08-12-02) surfaced two real, cheap, in-scope fixes, applied now:

- **Crisis message had no screen-reader announcement.** The demeanor
  meter three lines above already had `aria-live`; the crisis-tier reveal
  (`PracticeBeat.tsx`) — the single highest-stakes sentence in the
  app — did not. Added `role="alert" aria-live="assertive"`. Verified
  live: triggering the Spanish crisis path shows the 988 message correctly
  exposed via `[role="alert"]` in the rendered DOM.
- **Officer audio stale-callback leak** (blindspot audit). `stopAll()` in
  `usePracticeAudio.ts` paused the old `Audio` element and dropped the
  React ref, but never detached its `onplay`/`onerror`/`onended`
  handlers. `pause()` rejects any pending `play()` promise, and that
  rejection still reached the STALE object's `onerror` — which could fire
  the TTS fallback for a beat that's no longer current, reachable via
  rapid re-tap of "hear it again," `back()`, or navigating off the screen
  mid-clip. Fixed by nulling all three handlers before `pause()`.

### Findings surfaced but NOT fixed — re-characterized or logged
- **"Mute unreachable before first audio fires"** (focus group, framed as
  a regression). Checked against root: root has the IDENTICAL property —
  no mute control exists anywhere before entering a level (`prx-hear` only
  renders inside the live-beat view, index.html's `practiceRender` non-
  select branch). `/app`'s port is faithful to this, not a new gap.
  Changing it would be a real UX feature addition beyond this migration's
  port scope, not a bug fix — logged for a product decision, not silently
  built.
- **`PRX_VAR[7]` has no hostile-tone variant** (module review, confirmed
  live via the divergence mechanic silently no-op'ing on level 2's "bad
  pick" path). Content-authoring gap, not code — can't be fixed without
  writing new officer dialogue, which this project never does.
- **Level 2 ("ordered out") is still a 2-beat spike behind the consent
  gate** (module review, carried forward from wargames/16, confirmed still
  open in both `index.html` and the ported `practiceEngine.ts`). Same
  content/design-decision category as above.
- **`app_prx`/`app_mute`/`app_voice` use `writeApp` (silent-fail) instead
  of `writeAppReporting`** (blindspot audit) — a quota failure would
  silently drop a completed practice run while the debrief screen still
  celebrates it. Real, but low-probability (this key never stores images,
  unlike `app_docs`, which shares the same quota and is the actual
  pressure point) and would need a genuine UI failure state this beta
  doesn't have a pattern for yet. Logged, not built, to avoid inventing
  UI beyond scope on a low-probability path.
- **No cross-tab `storage` event reconciliation on `app_prx`** (blindspot
  audit) — two open tabs can last-write-wins clobber each other's
  progress. Low priority, logged only.

### Verification
Full check suite (extractor, storage, service-worker, practice-engine —
18/18) and build pass. Live-verified the crisis `role="alert"` fix in the
browser (Spanish crisis phrase → `[role="alert"]` present with the 988
text). The audio-leak fix has no isolated live repro in this session (the
failure needs precise timing against a real audio clip, which the dev
server can't serve — see Move 5.2's log for the same img/audio dev-vs-prod
note) but is confirmed correct by code inspection and the practice-engine
check suite's unrelated coverage staying green.

---

## PHASE 6 — /app PWA + the parity audit

## Move 6.1 — /app service worker + manifest

`vite-plugin-pwa`, added as a dev-only dependency to `app-src/` — LAST of
the build-order moves, on purpose (index.html:5753-5774's own comment on
why: shipping offline-capability claims before the rest of the app is
proven is the exact quiet-false-claim failure mode Move 0.2 existed to
prevent).

### What shipped
- `/app/sw.js` — scope `/app/`, precaches this build's own emitted assets
  (21 entries: HTML, favicon, every JS/CSS chunk, the manifest itself),
  runtime `CacheFirst` for `/audio/**` (`.mp3` only) and `/img/**`, own
  cache names `amparo-app-audio`/`amparo-app-img` — deliberately NOT
  `amparo-v3`, so root's own cache-cleanup sweep (Move 0.2) can never touch
  them and vice versa.
- `/app/manifest.webmanifest` — `id`/`start_url`/`scope` all `/app/`
  (distinct install identity from root's `/`), product palette, root's
  actual icon files referenced by absolute path (`/img/icon-192.png` etc.)
  rather than duplicated into `app-src/public` — same sharing pattern as
  `/audio` and `/img/scene-*` from Moves 4.3/5.2.
- `registerSW.ts` — the registration gate, ported from root's own
  `serviceWorker` block (index.html:5756-5774): same `https:`-only guard,
  same spirit ("this is a verifiable claim, not marketing copy"). The
  reload-on-update dance root hand-rolls is handled internally by
  `registerType: 'autoUpdate'` here; this file is just the gate plus an
  `offline_ready` DOM event so `App.tsx` can show the same honest "saved on
  this device" banner root shows, using the same extracted string.
- `injectRegister: false` — the plugin's default injects an inline
  `<script>`, which `/app`'s CSP (`script-src 'self'`, no
  `unsafe-inline`) would block outright. Registered manually via
  `virtual:pwa-register` instead, a same-origin module import like
  everything else this build ships.
- `vercel.json` gained header rules for `/app/sw.js` (no-cache) and
  `/app/manifest.webmanifest` (correct content-type) — no
  `Service-Worker-Allowed` override needed, since a worker at `/app/sw.js`'s
  default max scope already IS `/app/`, matching what's wanted.

### Verification
- `tsc -b && vite build` clean; entry chunk grew 92.41 → 93.03 kB gz
  (manifest link + workbox-window registration code) — genuine new
  capability, still nowhere near the 300 kB abort threshold.
- `oxlint` clean. Full check suite (extractor, storage, service-worker,
  practice-engine) — all PASS, root's `sw.js` unchanged.
- Live, against the production BUILD (`vite preview`, not `vite dev` —
  the generated SW only exists in a real build): manually registered
  `/app/sw.js` (the code's own `https:`-only gate can't be exercised over
  plain `http://localhost`, same limitation root's identical gate has —
  registered directly to test the SW file itself, independent of that
  already-proven gate logic). Confirmed: registration scope exactly
  `/app/`; precache cache populated with all 21 real assets, verified via
  `caches.match` returning genuine 2729-byte `index.html` content, not an
  empty stub; runtime-caching routes for `/audio/**`/`/img/**` present in
  the generated worker with the correct isolated cache names; zero console
  errors with the SW actively controlling the page.
- **Not testable in this harness:** true network-disconnected (airplane
  mode) reload, and the two-SW-coexistence scenario (root's `/` scope +
  `/app`'s `/app/` scope on the same live origin) — both require the real
  Vercel deployment. Logged as a RECON item for one real-device check
  post-deploy, same category as the wargame's own already-flagged iOS
  dual-manifest deferral.

## Move 6.2 — Parity audit + evidence pack

Full report: `wargames/18-app-parity-report.md`. Walked every row of
wargames/15's Appendix A inventory (12 top-level sections, ~80 sub-items).
Headline: **two genuinely new findings**, not previously logged anywhere —

1. Practice's entry screen is structurally the wrong one. Root's actual
   step-5 hub (index.html:3420-3474) is a 3-tab structure (Traffic ladder /
   Checkpoint / Door) — checkpoint was deliberately split into its own tab
   because it "was reading as just another traffic level buried at the end
   of the ladder." `/app` instead ported the practice OVERLAY's internal
   fallback list (index.html:5445-5454), which mixes checkpoint back into
   one flat list — exactly what root split it out of. Both screens are
   real in root; `/app` built the wrong one as its primary entry point.
2. Print's `beforeprint` 4-second Android-double-fire debounce and the
   `afterprint` "printed successfully" banner were never ported — print
   itself works (verified repeatedly this migration), but the confirmation
   layer around it does not exist.

Per wargames/15's own abort condition ("**>10 DEFERRED rows without
operator sign-off → the beta is a fragment, not a parity candidate; stop
and review scope**"): the full audit counts roughly 20 DEFERRED items at
sub-item granularity. This report does not silently pass that threshold —
it states the count and flags explicitly that operator sign-off is needed
before `/app` is called parity-complete for a promotion decision. The great
majority of the 20 are consistent, previously-logged, deliberate scope
decisions (post-print rail, carry card, share cert, About overlay, the
prep-drill first-run gate) — not accidents — but the wargame's threshold
exists precisely so volume gets a human look, and twenty crossing a
ten-item line is exactly what it's for.

**This closes wargames/15.** Every move (0.1 through 6.2) has shipped,
been verified, and been logged. What remains is not migration work — it's
a promotion decision: whether and when `/app` becomes the default entry at
`/`, and in what order the ~20 deferred items above get built before that
happens.

---

## Post-Phase-6 fix — loop round after v2.20.0

The QA + loop pass that closed out Phase 6 also ran the three background
reports one more time. The blind-spot audit (scoped specifically at the new
service worker, `/app`'s first ever) found a real CRITICAL bug in Move
6.1's own work, contradicting that move's own stated design goal — fixed
immediately, same session:

- **Cache-name collision with root's own cleanup sweep.** Move 6.1's log
  entry claimed the runtime cache names (`amparo-app-audio`/`amparo-app-img`)
  were chosen specifically so root's cache-cleanup (Move 0.2, `sw.js:38`)
  "can never touch them." That claim was WRONG — misread of root's own
  logic. Root's activate handler deletes every cache matching
  `k.startsWith('amparo-') && k !== 'amparo-v3'` — a PREFIX test, not "every
  cache except amparo-v3." Both new names started with `amparo-`, so root's
  own daily-redeploy sweep was silently deleting `/app`'s runtime caches —
  the exact opposite of the isolation the move claimed to guarantee.
  Renamed to `app-audio-v1`/`app-img-v1` (no `amparo-` prefix at all).
  Verified: neither name appears anywhere in root's `sw.js` deletion
  pattern; live-checked the rebuilt `/app/sw.js` contains the corrected
  names via direct grep.
- **`/img` filenames are stable, not content-hashed — proven via git
  history**, same audit: `officer-f.jpg`'s bytes genuinely changed under
  the identical filename between two commits roughly an hour apart, before
  any service worker existed to make the consequence worse. A year-long
  `CacheFirst` on a mutable-content/stable-name asset has no revalidation
  path and would serve stale images indefinitely if that recurred. Switched
  `/img/**` from `CacheFirst` to `StaleWhileRevalidate` (serves the cached
  copy immediately — same speed, same offline behavior — while refetching
  in the background, so a real content change is picked up on the next
  load instead of never) and shortened its expiry from 365 to 30 days.
  `/audio/**` stays `CacheFirst` — those clips are genuinely immutable
  (replaced only by re-recording under a new id, never edited in place).
- **`onRegisterError` added** to `registerSW.ts` for symmetry with root's
  own fully-silent registration catch (index.html:5773) — the audit's third
  finding (a Workbox precache install failing silently on a partial deploy)
  isn't newly fixable without changing the underlying philosophy this whole
  migration has kept consistently: an infra hiccup degrades to plain
  network passthrough, never alarms the user. Named as a decision on
  record, not left as an accidental gap.

### Verification
Full check suite (extractor, storage, service-worker, practice-engine —
18/18) and build pass. Live-verified: registered the rebuilt `/app/sw.js`
against the production preview server; `grep -o 'cacheName:"[^"]*"'
app/sw.js` confirms both cache names in the shipped worker are
`app-audio-v1`/`app-img-v1`, neither matching root's deletion prefix.

---

## Level 2 spike fixed — root edit, first of this migration

Three independent reviews across this migration (wargames/16, 17, 19) all
converged on the same one-line fix for the same finding: Level 2 ("Ordered
out") was a 2-beat spike — `PRX_LEVELS[2].ids` was `[3,7]`, jumping straight
from the exit order to the arrest with nothing between them, right behind
the heaviest consent gate in the app. The recommended fix — insert `ci:2`
(the consent-to-search beat, already fully reviewed content in `PRX_VAR[2]`)
— reuses existing content, authors nothing new.

Root has been untouched by policy for the entire migration. Asked the
operator explicitly before touching it for the first time; got a clear yes,
scoped to this one line. Changed `index.html:4374`:
`{ids:[3,7],rate:1.28}` → `{ids:[3,2,7],rate:1.28}`. Nothing else on that
line touched.

The other open finding from the same reviews — `PRX_VAR[7]` (the arrest
beat) has no hostile-tone variant, so the divergence mechanic silently
no-ops on Level 2's "bad pick" path — was NOT fixed. That fix requires
authoring a genuinely new officer line, which this project never does
(attorney-reviewable content only, never model-authored). Asked the
operator; the answer was to leave it open, logged, same as before.

### What shipped
- `index.html:4374` — the one-line array edit above.
- Re-ran `extract-app-content.mjs` (no code changes needed elsewhere —
  `practice.json`'s `PRX_LEVELS[2]` now reads `{"ids":[3,2,7],"rate":1.28}`,
  everything downstream — `buildDeck()`, the tone-pool filter, the rail,
  the score denominator — already handles a 3-beat deck the same as any
  other, since none of it hardcodes a beat count).
- `tools/practice-engine-check.mts` gained a regression check pinning the
  exact ci sequence `[3, 2, 7]`, so a future edit can't silently regress
  back to the 2-beat spike without a test failing.

### Verification
- `extract-app-content.mjs --verify` — PASS, content re-synced.
- `practice-engine-check.mts` — 19/19 (new check included).
- `app-storage-check.mts` / `sw-routing-check.mjs` — PASS, unchanged.
- `tsc -b && vite build` / `oxlint` — clean.
- Live, both languages: entered Level 2, confirmed "Card 1 of 3" /
  "Tarjeta 2 de 3" (not "of 2"), the new beat 2 render correctly in EN
  ("Pop the trunk for me...") and ES ("Ábrame la cajuela..."), tone stayed
  curt (never calm, matching the level's tone pool), score ring tracked
  correctly through all 3 beats, debrief showed 2/3 with three squares in
  the grid. Zero console errors beyond the known dev-only 404s (audio/img
  paths not served by the isolated dev server) and the pre-existing
  browser-TTS CSP worker warning (noted in Move 5.2's log, unrelated to
  this change).

---

## Practice hub rebuilt — the parity audit's #1 finding, closed

wargames/18's parity audit found `/app` had ported the WRONG screen as its
practice entry: the practice overlay's internal flat fallback list
(index.html:5445-5454) instead of root's actual step-5 hub
(index.html:3420-3483). wargames/19 and focus group 12 independently
re-confirmed it. Root splits the Border Patrol checkpoint into its own tab
precisely because it "was reading as just another traffic level buried at
the end of the ladder" (index.html:3435-3439) — and the flat list is the
exact shape it was split OUT of. Now rebuilt.

### What shipped
- `screens/practice/PracticeHub.tsx` (new) — root's three module tabs
  (Traffic stop / Checkpoint / At your door, in root's own order), the
  traffic-only progress bar counting the four numbered rungs, checkpoint's
  own context note in place of that bar, the door tab's honest
  "Not built yet — and we won't fake it" panel, the 2-up `.pr-grid` card
  layout with lock/done/score states, and root's green pick-pulse before
  navigation (skipped under `prefers-reduced-motion`, where there is no
  pulse to see and the delay would just be latency).
- `screens/practice/PracticeLevelSelect.tsx` — **deleted**, not left
  reachable. Root needs two level screens because its practice overlay is a
  modal covering the hub; `/app`'s practice is a route, so there is only one
  place to return to. Keeping the flat list as the in-run "← All scenarios"
  destination would have reintroduced the mixed-in checkpoint one click
  deeper — the same bug, just hidden better. That link now returns to the
  hub.
- `.ll-seg` moved from `styles/lifelines.css` to `styles/shell.css`. Root
  treats it as ONE shared segmented-control grammar across the lifelines
  tabs and the hub tabs, deliberately ("rather than inventing a second tab
  grammar", index.html:3430); in `/app` it was trapped in the lifelines lazy
  chunk, invisible to the practice chunk. It now has two real consumers, so
  it belongs in the shared sheet.
- `styles/practice.css` gained the hub block (`.pr-grid`/`.pr-card`/
  `.hub-progress`/`.pilot`), ported from index.html:346-372, 76.

### Real bug found by focus group 13 and fixed: stale "best" score
Root compares best scores by NUMERATOR ONLY —
`sc > parseInt(prx.best[lvl])` (index.html:5484) — which is fine while a
level's denominator never changes. Level 2's denominator just changed (2
beats → 3). So a returning player's stored `"2/2"` (a perfect run on the
OLD deck) survives a `"2/3"`, and the hub would display a best score the
level can no longer produce. Reproduced before fixing:
`parseInt("2/2") === 2`, new run scores 2 → `2 > 2` is false → stale value
kept; only a `3/3` could ever displace it.

Fixed in `practiceEngine.ts`'s `completeRun`: a stored best whose
denominator differs from the current run's length was recorded against a
different deck shape, so it is *incomparable*, not unbeaten — replace it
outright. Root's numerator compare is preserved for the normal same-shape
case. Regression check added covering both directions (stale value gets
replaced; a genuinely worse same-shape run still does not displace a best).

### Two agent reports disagreed — checked the source myself
The module review (wargames/20) claimed the new `ci:3 → ci:2` divergence hop
is "fully live (both curt and hostile variants exist)". Focus group 13
claimed the opposite. Verified directly against `practice.json`:
`PRX_VAR[2]` tones are `[calm, calm, curt, curt]` — **no hostile variant**.
The focus group is right, the module review is wrong. Actual state of
`PRX_DIVERGE[2]` (`{g:'curt', b:'hostile'}`) on the 3-beat deck:
- good-pick leg (wants `curt`): live at both hops — `ci:2` and `ci:7` both
  have curt variants.
- bad-pick leg (wants `hostile`): **dead at both hops** — neither `ci:2` nor
  `ci:7` has a hostile variant.

So the Level 2 fix did not create a new problem; it widened the footprint of
the already-open `PRX_VAR` hostile-variant content gap from one dead hop to
two. Same category as the `PRX_VAR[7]` item the operator explicitly chose to
leave open (fixing it requires authoring new officer dialogue, which this
project never does). Logged here as an extension of that item, now known to
cover `ci:2` as well as `ci:7`.

### Blind-spot audit MEDIUM fixed: content drift had no automated gate
The audit found `extract-app-content.mjs --verify` had no CI job, no git
hook, and no npm script — sync between root and `/app`'s content banks
depended entirely on a human remembering to re-run it. That gap was
harmless while root was locked from edits; the Level 2 fix made root
editable, which gave it teeth.

`--verify` now runs as the FIRST step of `npm run build`, so a build cannot
succeed against drifted content. Also added `npm run check` to run all four
suites in one command. Proved the gate actually bites rather than assuming
it: injected drift (reverted `/app`'s `PRX_LEVELS[2].ids` to `[3,7]` while
leaving root at `[3,2,7]`) and confirmed the build exits 1 with
`FAIL practice.json — differs from a fresh extraction (drift)`, then
restored and re-verified green.

### Verification
- `npm run check` — all four suites PASS (content verify, storage 13,
  sw-routing 12, practice-engine 20 including the two new regression checks).
- `tsc -b && vite build` + `oxlint` — clean. Entry chunk 93.03 kB gz
  (unchanged); `PracticeStep` chunk 18.20 kB gz (+0.35 for the hub, minus
  the deleted flat list).
- Live, both languages: hub renders root's heading pair; all three tabs
  switch with correct `aria-selected`; traffic tab lists exactly the four
  numbered rungs with **checkpoint correctly absent**; checkpoint tab shows
  its own note and only its own card; door tab shows the honest unbuilt
  panel; progress bar tracked 0/4 → 1/4 (0% → 25%) after a real run; the
  pick-pulse lands before navigation; "← All scenarios" returns to the HUB;
  a completed level shows ✓ + Done badge + `🟩 3/5`; Hard mode's stored
  `3/3` stays suppressed as "Done" (`PRX_UNSCORED` guard); Level 2 displays
  `🟩 2/3` with the correct new denominator. Spanish verified equivalently
  ("Ahora ensáyalo.", "Parada de tráfico / Retén / En tu puerta",
  "4 de 4 completados", "Volver a mi paquete"). Zero new console errors.

---

## The stale-best "fix" was itself a regression — reverted, done properly

**I shipped a bug to the live product today and a fanned-out QA pass caught
it.** Recording it plainly, because the failure mode is more useful than the
fix.

### What went wrong
v2.21.0 and v2.21.1 changed the best-score compare in `/app` and then root:
if a stored best's DENOMINATOR differed from the just-finished run's, treat it
as incomparable and replace it. The reasoning looked sound — Level 2 went from
2 beats to 3, so a banked `"2/2"` could never be beaten by a `"2/3"`.

The premise was false. **`run.length` is not a per-level constant:**
- crisis-tier (`'x'`) beats are excluded from `run`, so disclosing distress
  SHRINKS the denominator;
- the daily curveball adds a beat on levels 0-1 from the second run onward, so
  it GROWS.

So the rule fired constantly on ordinary play and deleted real bests. Two
independent reproductions from the QA fan-out:
- Level 0: a `5/5` overwritten by a `1/6` on the very first replay — the
  curveball path, i.e. the happy path on the most-played level.
- Level 2: a `3/3` replaced by a `2/2` after a run in which the player typed a
  crisis phrase. The app demoted someone **for using the crisis disclosure** —
  the one interaction here that must never cost anyone anything.

Pre-fix behaviour kept both bests (numerator-only: `1 > 5` and `2 > 3` are
false), so this was a pure self-inflicted regression, shipped to root and
`/app` simultaneously. A blind-spot audit independently found the same code
also DIVERGED between the two apps on malformed input (root's `String()`
wrapper survives; `/app`'s bare `stored.split()` throws, and `/app` has no
ErrorBoundary — a white-screened debrief).

### What shipped now
- **Both implementations reverted** to root's original numerator-only compare.
  The fragile denominator parsing is gone entirely, which closes the
  regression, the root-vs-`/app` divergence, and the crash together.
- **The real problem handled where it belongs — a one-time migration.** Level
  2's *definition* changed; that is a data-shape event, not a comparison rule.
  Root gets a `v3` block beside its existing `v2` index-shift; `/app` mirrors
  it in `readRootPractice`. A `best[2]` whose denominator is `2` is dropped —
  not rescaled, since a `2/2` is not evidence of a `2/3`, the same reasoning
  `v2` used when it dropped a removed level rather than remapping it.
  `done`/`runs` are untouched: the level *was* completed, only its score is no
  longer expressible. Denominator-guarded, so it is a no-op for anyone already
  on `/3`.
- **The old regression test asserted the wrong behaviour** and was rewritten to
  pin the correct invariant: a worse run never displaces a best, *whatever* the
  denominators — with explicit coverage of the curveball path that the old rule
  broke. Plus migration tests in both check suites.

### Also fixed this round (all from the same review wave)
- **Hub tab did not survive a run** (module review HIGH, focus group golden
  #1). `PracticeHub` held tab state locally, but the hub unmounts for the
  duration of a drill — finish a Checkpoint, tap "← All scenarios", land on
  the Traffic ladder. Exactly the recombination the tab split exists to
  prevent. Ownership lifted to `PracticeStep`. Verified live: ran Checkpoint,
  returned, still on `Checkpoint:true`.
- **Locked cards were unreachable** (focus group golden #2). I had used the
  native `disabled` attribute; root deliberately uses `aria-disabled` + `title`
  and omits the handler, because native `disabled` drops the card out of the
  tab order AND suppresses the title — which is the only text explaining the
  lock. Root's own note (`index.html:5433-5435`) is that hiding gated levels
  made them undiscoverable. Now matches root. Verified live: focusable,
  announces "Finish the first three to unlock", click still refused.
- **Uncleaned `setTimeout`** in the hub's pick-pulse — now cleared on unmount,
  so a fast exit can't fire `onPick` against a dead component.
- **False parity claim corrected.** My comment said the reduced-motion check
  ported root's `sr-motion` branch. It does not: `sr-motion` means "GSAP is
  armed", not "reduced motion" — `index.css` already warns about that exact
  inversion. The behaviour is right; the citation was wrong, and a wrong
  citation is worse than none because the next reader trusts it.
- **Dead CSS removed** — `.prx-list`/`.prx-lcard`/`.prx-lockhint` and their
  tile art died with `PracticeLevelSelect.tsx`. `.prx-daily` deliberately kept:
  the live beat screen still renders it.
- **`app-storage-check` was lying about its own size** — a hardcoded
  "13 assertions" while 14 checks ran, so every check added after it was
  written went unreported. Now counted.

### Two agent reports contradicted each other again
`wargames/20` claimed Level 2's new `ci:3 → ci:2` divergence hop is "fully
live (both curt and hostile variants exist)". Checked the bank directly:
`PRX_VAR[2]` is `[calm, calm, curt, curt]` — **no hostile variant**. The
focus group was right, the module review wrong; `wargames/21` states it
correctly. Level 2's bad-pick leg is dead at BOTH hops. Unchanged conclusion:
this is the already-open `PRX_VAR` content gap (needs authored officer
dialogue, operator chose to leave it), now known to cover `ci:2` as well as
`ci:7`.

### A note on the QA run itself
An audit agent proved the build gate works by corrupting `ui.json` — and left
it corrupted. The very gate it was testing then failed the next build, which
is the system working, but the lesson is that read-only instructions to agents
need to be enforced rather than requested. Restored by re-extraction; `git
diff` on the content banks is clean.

### Verification
- `npm run check` — content verify PASS, storage **14** checks, sw-routing 12,
  practice-engine **21** (all new/rewritten tests included).
- `tsc -b && vite build` + `oxlint` — clean.
- **Root, live in the browser**: all inline scripts syntax-checked first (3 JS
  blocks, 0 errors); seeded a pre-fix `v2` profile with a stale `2/2` and
  confirmed it migrates to `v3` with the best dropped and `done`/`runs`
  preserved; then confirmed the regression is gone in both directions — a
  crisis-disclosure run (denominator 2 vs 3) left a `3/3` intact, and a
  curveball replay (6-beat deck) left a `5/5` intact — while a genuinely
  better run still won (`1/3` → `3/3`). Test state cleared afterward.
- **`/app`, live**: tab persistence and locked-card behaviour verified as
  described above; no new console errors.
