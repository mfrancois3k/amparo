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
