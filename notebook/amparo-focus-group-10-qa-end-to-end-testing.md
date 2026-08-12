# Amparo — focus group 10: the /app React strangler, welcome through print, and the unwired practice engine (v2.18.0)

Date: 2026-08-12. Run against `b389cd2` (HEAD). `app-src/src/` is the live source for
`/app`; root `index.html` is untouched and remains the shipped product (per
`wargames/15` §0 rule 1 — this round does not evaluate root, root was FG06-FG09's
subject and its findings stand unchanged). Phases 3 through 5.1 of wargame 15 have
shipped: Welcome, the geographic state map, You + document capture, Lifelines, the
six-page print pack, and `practiceEngine.ts` — a complete, pure-logic FSM with **zero
UI consumers** (confirmed: `grep -rl "practiceEngine" app-src/src` outside the file
itself returns nothing).

**Method note.** Every claim below is read directly out of `app-src/src/*` or
`index.html`, with file:line references, or is a direct `node -e` dump of the
extracted JSON content banks. Two things were run to verify, not assumed: a Node
script diffing `t.en.json.s_pending` against `t.es.json.s_pending` (identical
strings — see golden standard item 2), and a grep confirming `readRootPractice`,
`readRootDocs`, and `readRootPrefs` are defined in `services/storage.ts` but never
imported anywhere else in the tree (golden standard item 1). Attorney/UPL review is
excluded from findings below — known, already tracked (wargame 15 §0 condition 2 and
Appendix B), not new. Findings already logged in FG06-FG09 against root `index.html`
are referenced only as carried context when they resurface inside the /app port,
never re-presented as if freshly discovered in root.

---

## 0. What's actually new this round, verified against source

| System | File | What it is |
|---|---|---|
| Welcome screen | `screens/Welcome.tsx` | Feature rows, trust chips, gold CTA in-app; every other destination is an honest `href="/"` link, not a stub |
| Geographic state map | `components/StateMap.tsx`, `screens/StateStep.tsx` | 51 keyboard-reachable `<path>` targets + sliver-state label peer targets, search filter, entrance-wave latch |
| You step + docs capture | `screens/YouStep.tsx`, `components/DocsOverlay.tsx` | Contact fields writing to `app_you`; native `<input type="file">` capture, canvas downscale, own `app_docs` key |
| Lifelines | `screens/LifelinesStep.tsx` | Segmented tabs, snap-scroll track + dots, `resolveState()`-synthesized 51-state lifeline table |
| Print pack | `screens/PrintStep.tsx`, `components/PrintPack.tsx` | Six-page JSX-built print DOM, thumbnails cloned from the same DOM that prints |
| Practice engine core | `engine/practiceEngine.ts` | `IDLE → PRE_FLIGHT → OFFICER_SPEAKING → AWAITING → BEAT_COMPLETE → DEBRIEF` FSM; deck building, divergence, locking, scoring — no screen renders it yet |
| Storage boundary | `services/storage.ts` | `app_*` read-write; six root keys (`sr_save`, `sr_docs`, `amparo_prx`, `amparo_muted`, `amparo_voice`, `amparo_stt`) read-only via named getters |

**Confirmed working as designed, not re-derived as a finding:** the read/write
boundary holds by construction (`writeApp`/`writeAppReporting` hard-code the `app_`
prefix; there is no generic key-write surface — `storage.ts:186-207`). The print
pack's two `dangerouslySetInnerHTML` call sites are both on statically extracted
content (statute-quote markup, claims-block markup), never on a user-entered field —
verified by reading every call site in `PrintPack.tsx` (lines 49, 85, 196, 327, 345).
Zero analytics calls exist anywhere in `app-src/src` (grepped `posthog|ph(` — no
hits), matching wargame 15 §2's pre-answered decision.

---

## 1. Ten persona reactions

**Selection rationale.** Wes, Ana, Rosa, Luis, Marcus, Dana, Tony, Omar, Keisha, Nia —
spans literacy (Omar: assistive tech; Wes: analytical side-entry), urgency (Keisha:
highest real need, currently has nothing to use), language (Rosa: Spanish-first),
privacy (Luis), product-completeness allergy (Ana, Marcus), institutional trust
(Tony), print-completionism (Dana), and trauma sensitivity (Nia). Devin, Marisol, and
Ray sit out for the same reasons FG08/FG09 gave — their standing complaints are about
root, and root is unchanged this round.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **The honest-link pattern is exactly what his profile rewards.** `Welcome.tsx:44-53`:
  every destination /app hasn't built yet (`w_try`, `w_sample`, `w_share`,
  `about_link`, `doc_link`) is a real `href="/"`, not a disabled button or a dead
  `onClick`. The file's own comment names the alternative it rejected: "a dead button
  that looks alive is the 'convincing stub' this project keeps warning about." For a
  persona who explores by reading before tapping, this is legible immediately.
- **The lazy-loading rationale is visible in the code, not just in bundle output** —
  `App.tsx:17-28` documents a measured regression (91.76 kB → 116.13 kB gz) from an
  eager `Eyebrow` import and reverts it. Not a persona-facing feature, but exactly the
  kind of engineering discipline his "looks half-finished" cousin-concern (shared with
  Ana) would want evidence of if he ever read the source.
- **Nothing to react to on the practice engine yet** — no UI exists. His analytical
  read of a pure FSM file would be favorable (explicit phase names, doc comments citing
  root line numbers for every port) but there's no way to interact with it, so this is
  a note for a future round, not a verdict today.
- **Redo? Yes for the wizard as far as it goes. Refer? Conditional** — same shape as
  his root verdict, now applied to a smaller surface.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **The scope cuts are logged, not silent — which is the one thing that keeps her
  allergy quiet.** `PrintStep.tsx:5-11` lists exactly what's missing (no demo banner,
  no post-print rail, no email button, no restart/reprint actions, no feedback prompt)
  and why each is deferred rather than broken. This is the pattern her allergy actually
  responds to.
- **A genuinely new finding for her lens: the read-only root bridge is built but
  idle.** `services/storage.ts` implements full readers for all six root keys —
  `readRootSave`, `readRootPractice`, `readRootDocs`, `readRootPrefs` — with real
  migration logic (the v1→v2 practice-progress index shift is ported in
  `storage.ts:128-159`, tested against the exact root bug history). But grepping every
  file outside `storage.ts` for these four names finds exactly one caller:
  `i18n.ts:15,55` uses `readRootSave` for language only, with a deliberately empty
  state whitelist (`i18n.ts:28`, "nothing here may treat that as 'the user has no
  state'"). `readRootPractice`, `readRootDocs`, and `readRootPrefs` have **zero**
  callers anywhere. A returning user who already has a state, contacts, and photos
  saved in the live app opens `/app` today to a completely blank wizard — not because
  the bridge doesn't exist, but because nothing calls it yet. For her specifically,
  this reads exactly like the class of gap her allergy is tuned to: a preview that
  doesn't act like it already knows anything about you, sitting next to fully-built
  code that would let it.
- **Redo? Yes, for what's built. Refer? Leaning conditional** — same shape as her root
  FG08 verdict (the map answered her ask there); this round's wizard doesn't move her
  further either direction, but the idle-bridge finding is a real new data point.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **A genuine, source-verified bilingual bug — distinct from the one FG08 found in
  root.** FG08 found `smCap()`'s federal-only caption hardcoded a literal English
  string in the *code* (`index.html:3633`), bypassing the translation object entirely.
  That specific bug is **fixed** in `/app`: `StateMap.tsx:151-153` correctly reads
  `t.s_pending` from the translation bank, no hardcoded literal in the component.
  But the underlying *content* is still wrong: `node -e` dumping both banks shows
  `t.en.json.s_pending === "federal ✓"` and `t.es.json.s_pending === "federal ✓"` —
  identical strings. This traces back to root itself: `index.html:2310`, the Spanish
  `T` object's own `s_pending` entry, reads `s_pending:"federal ✓"` — untranslated in
  root's own source, faithfully mechanically ported (per wargame 15's verbatim-
  extraction rule) into `t.es.json`. It shows on every one of the 48 non-cited states
  when a Spanish-reading user hovers or taps in `/app`'s map — the exact screen she'd
  land on first, same as FG08's finding, but a different bug underneath the same
  surface symptom.
- **The 51-state lifelines synthesis bug that WAS caught and fixed is real, verifiable
  work worth crediting.** `content/statesResolved.ts:17-21` documents a bug that
  shipped and was caught by driving the app in a browser, not by re-reading code:
  `LifelinesStep.tsx` originally read the raw three-key `STATES` literal and fell back
  to New York's lifelines for any of the other 48 states. The fix (`resolveState()`
  synthesizing the full 51-state table exactly as root does at runtime) is now the only
  path `LifelinesStep.tsx:39` uses. For her extended family driving through any state
  that isn't TX/GA/NY, this was the more consequential bug and it's closed.
- **Redo? Yes, conditional on the s_pending value getting a real Spanish string —
  same conditional shape as FG08, carried forward with sharper evidence.**

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **The analytics-zero decision holds up under a real grep, not just a stated
  intent.** `grep -r "posthog\|ph("  app-src/src` returns nothing. `App.tsx:49-50`'s
  own comment names the deleted call explicitly: root fires `sr_state_selected` here;
  "/app ships zero analytics... so the call is deleted rather than stubbed." For him
  specifically — the persona whose standing complaint against root is an unconsented
  `sr_hub_module` event firing on a mere tab-tap — this is the cleanest possible
  answer: not a promise, a verified absence.
- **The storage boundary is enforced by shape, matching his stated trust condition.**
  `storage.ts:1-19`'s own header states the rule is "enforced by SHAPE, not by
  discipline" — callers name a short key, the module applies the `app_` prefix itself,
  so no caller can address a root key even by mistake. `docsSave`'s photo storage gets
  its own key (`app_docs`, separate from `app_you`) for the same reason root's
  `sr_docs`/`sr_save` split exists — "delete my photos" can never take the rest of the
  pack with it (`DocsOverlay.tsx:10-12`).
- **Redo? Yes — no open condition left for him on this surface.** A genuine
  improvement over his standing root complaint, not just a repeat of good intentions.

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **The beta banner works against him specifically.** `App.tsx:81-90` renders "Preview
  build. The live app is at amparohq.com" on every single screen, bilingual, `lang="es"`
  correctly scoped. Necessary and honest (hard rule 3 — never let /app pass as the
  finished product) — but for a persona whose entire engagement model is
  screen-recording and sharing what looks sharp, a banner announcing "this isn't the
  real thing yet" on every frame is close to the opposite of shareable.
- **Nothing new to move his practice-engine calculus** — same standing complaint as
  every prior round (no score badge, no share button), and there's no practice UI at
  all in /app yet to even carry that gap forward meaningfully.
- **Redo? Conditional on the banner not being the first thing anyone sees in a
  recording.** New finding, not a repeat — FG09 never evaluated a beta-labeled surface.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **The print pack's thumbnail/print DOM identity is real, not just claimed.**
  `PrintStep.tsx:47-70` clones directly from `#appPrintRoot .pp` — the same nodes
  `window.print()` uses — so a thumbnail literally cannot drift from what prints,
  matching root's guarantee and the wargame's own abort condition against patching
  drift with CSS overrides (wargame 15 §3 Move 4.3 fork F7).
  `Foot()` (`PrintPack.tsx:55-66`) renders the edition line and page count on every one
  of the six pages, verified by reading the component, not assumed from the plan.
- **The same idle-bridge finding Ana raised lands harder for her specifically.** She's
  the panel's repeat player, tracked across five prior rounds building state in root.
  If she opens `/app` today, `readRootSave`/`readRootDocs` exist but nothing calls them
  to prefill her state or her son's contact info — she'd retype everything from
  scratch in a "preview" of a product she already configured. Not a new code finding
  (Ana's item 1 above), but a sharper persona hit: this is exactly the workflow she's
  demonstrated three focus-group rounds running.
- **Redo? Yes for the wizard as it exists. Refer? Yes**, unchanged — but she'd notice
  the blank-slate problem within one visit.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **The beta banner doesn't help his standing condition, and arguably works against
  it.** His consistent, four-round-running ask is a named institution behind the
  product. `App.tsx:81-90`'s "Preview build" framing, while honest and necessary, adds
  a second credibility hurdle on top of the first: not only does the product lack an
  institution's name, this specific surface now also announces it isn't even the
  primary product.
- **Content he'd recognize as unchanged and correct.** The rights language, the
  edition-locked "PILOT EDITION" honesty in `PrintPack.tsx:199-207` ("Formal attorney
  sign-off is in progress. General information, not legal advice.") — same honest
  register he credited in FG07 and FG08, faithfully ported.
- **Redo? Once, if an institution backs it. Refer? Still no.** Unchanged.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The map's keyboard access claim from FG08 carries over intact and is re-verified
  here in the port.** `StateMap.tsx:74-101`: every `<path>` still carries
  `tabIndex`, `role="button"`, `aria-label={names[code]}`, plus keyboard handling —
  51 independently reachable, correctly labeled targets, confirmed again against this
  codebase, not assumed carried.
- **A new, concrete gap: the one interactive overlay currently live in /app ships
  without a real focus trap.** `DocsOverlay.tsx:56-59`'s own comment: "Root's full
  7-overlay framework (focus TRAP, inert background, z-order-aware Escape) is Move
  5.3 — this covers the one overlay /app has today without building ahead of that
  move." In practice: Escape closes it, focus moves in on open and returns to the
  trigger on close, but nothing stops Tab from walking past the last focusable element
  in the card and out into `You` step content sitting behind it, still fully in the tab
  order. This is not a hypothetical for him — document capture is a live, shipped
  overlay today, not dark-flagged content waiting on a later phase.
- **The map's own `aria-hidden` caption pattern is correctly inert for him, same
  finding as FG08** — `StateMap.tsx:142` marks the caption decorative, so the
  s_pending translation bug Rosa found above never reaches him; each target's own
  accessible name already carries the information.
- **Would he want it fixed before calling this surface accessible?** Yes — the
  DocsOverlay focus-trap gap is the cheapest, most concrete item on this list; it's a
  standard focus-trap utility, not new design work, and it's the one piece of live
  interactive /app surface where the gap is a regression risk today, not a Move-5.3
  promise.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **There is currently nothing in /app for her.** Her described use case across four
  prior rounds — glance at a scenario, rehearse in 30-60 seconds between fares — has no
  surface in /app at all. `practiceEngine.ts` is a complete FSM (deck building,
  divergence, locking, scoring all implemented and internally consistent) but zero
  files import it (confirmed by grep). The wizard she'd have to sit through first
  (welcome → state → you → lifelines → print) is paperwork-prep, not rehearsal — the
  part of the product she has never needed.
- **What she can evaluate favorably: the document-capture speed.**
  `DocsOverlay.tsx:23-45`'s downscale pipeline (1100px / 0.72 JPEG) and the plain
  native file input (no getUserMedia round-trip) matches her between-fares urgency —
  a real photo in, a stored photo out, no extra screens.
- **Redo? Not yet applicable — there's nothing to rehearse.** This isn't a regression
  (Phase 5.2, the practice UI, is explicitly not built yet) but for the persona this
  product's practice module exists for, /app currently offers her the least of any
  panel member.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **The consent-gate shape ported into the FSM matches her standing concern almost
  exactly, and it's checkable today even with no UI.** `practiceEngine.ts:180`:
  `needsWarn = level >= 2 && !state.warnOk[level]` — levels 0 and 1 skip
  `PRE_FLIGHT` entirely and enter `OFFICER_SPEAKING` directly; only level 2 and above
  require `confirmWarn()` (line 189-192) before content plays. This is a faithful port
  of root's `prWarnOk` gate, not a new decision — but it means the same tension FG08
  named in root (the level-level consent gate covers the level's *ceiling*, not the
  *per-beat* trigger) now lives unresolved inside /app's engine too, verified at the
  same file, different codebase.
- **`isLocked()` (line 84-89) is a pure function with no UI opinion yet** — whether a
  locked scenario's title stays visible-but-disabled (root's current behavior, FG09
  golden #5's unresolved policy question) or gets hidden entirely is not decided by
  this code; it's a decision Move 5.2 still owes. Worth naming precisely: the engine
  is ready for either answer, so this is the moment to decide it on purpose rather than
  let the eventual UI implementation make the choice by default.
- **She still can't evaluate anything experientially** — there is no run to exit from,
  no headline to read, because there is no screen. Her verdict is conditional on
  design decisions the code hasn't made yet, same shape as always, one layer more
  abstract this round.
- **Redo? No. Refer? Conditional yes**, unchanged in spirit — but this round she has
  genuinely nothing to react to except the shape of code that will eventually decide
  her experience.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Wire the already-built root-read bridge to actually prefill /app, or state explicitly that it won't yet

**Evidence.** `services/storage.ts` implements complete, tested-shape readers for all
six root keys — `readRootSave` (with state/lang whitelisting, `storage.ts:94-111`),
`readRootPractice` (with the full v1→v2 index-shift migration, `storage.ts:128-159`),
`readRootDocs` (with `data:image/` prefix validation, `storage.ts:162-170`), and
`readRootPrefs` (`storage.ts:172-182`). Grepping every file in `app-src/src` outside
`storage.ts` for these four names finds exactly one caller: `i18n.ts` uses
`readRootSave` for language detection only, with a state whitelist deliberately left
empty (`i18n.ts:28`). `readRootPractice`, `readRootDocs`, and `readRootPrefs` have zero
callers anywhere in the tree. Wargame 15 §1.2 itself frames the intended relationship
as "it may read to prefill/preview" — the reading half is fully built; the prefill
half doesn't exist yet. Impact: **every returning root user (Dana's demonstrated
pattern across five rounds; Ana's "looks half-finished" allergy triggered by a preview
that visibly ignores what it already has access to) hits a blank wizard in /app today,
not because the bridge is missing but because nothing calls it.**

### 2. Give `t.es.json`'s `s_pending` key a real Spanish value

**Evidence.** `node -e` dumping both banks shows `t.en.json.s_pending` and
`t.es.json.s_pending` are the identical string `"federal ✓"`. This traces to root's own
source: `index.html:2310`, the Spanish `T` object's own entry, reads
`s_pending:"federal ✓"` — untranslated in root itself, faithfully mechanically ported
per wargame 15's verbatim-extraction rule (§1.2, condition 2: content is ported
"never retyped, never 'improved'"). Distinct from FG08's finding: that bug was a
hardcoded literal *bypassing* the translation object in code (`index.html:3633`); this
round's `StateMap.tsx:151-153` correctly wires the caption to `t.s_pending` — the
code-level bug is fixed — but the value it now correctly reads is itself wrong, and
that fact was only checkable once the code stopped hiding it behind a literal. Impact:
**shows on 48 of 51 states, on the screen a Spanish-reading user lands on first
(Rosa's lens); the correct fix is a content edit to root's own T.es bank first (per the
extraction rule — content edits happen in `index.html`, then re-extract), not a
patch inside `/app`.**

### 3. Give `DocsOverlay` a real focus trap before it ships as functionally complete

**Evidence.** `DocsOverlay.tsx:56-70`'s own comment states plainly: root's full
7-overlay a11y framework (focus trap, inert background, z-order-aware Escape) is
scheduled for Move 5.3; this overlay ships with only Escape-to-close and
open/close focus movement. Concretely: nothing prevents Tab from walking past the
overlay's last focusable control and landing on `YouStep`'s form fields sitting behind
it, still fully present in the DOM and the tab order. Unlike most of this round's
subject, this is not dark-flagged or deferred content — document capture is the one
fully interactive, fully shipped overlay in /app today. Impact: **Omar's reaction
above is the direct hit — a keyboard or screen-reader user can tab out of an open
modal into the page behind it, right now, on the one interactive surface complex
enough to need it.**

### 4. Decide and record whether `/app` surfaces the practice module before or after promotion, and say so where a reader would look

**Evidence.** `practiceEngine.ts` is complete: deck building (`buildDeck`, lines
94-130), divergence (`divergeDeck`, lines 135-148), locking (`isLocked`, lines 84-89),
and scoring (`completeRun`, lines 241-263) are all implemented and internally
consistent with root's documented behavior. Zero files import it — confirmed by grep.
This is explicitly Move 5.2's job per wargame 15, not a defect — but nothing in the
current build states, in a place a reader would find it, when Move 5.2 lands relative
to the rest of the migration. Impact: **Keisha's reaction above is the sharpest
hit — the persona this module exists for has literally nothing to evaluate in /app
today, and there's no visible signal (in-app or in the migration log) of how soon that
changes.**

### 5. Author the missing hostile variant for `PRX_VAR[7]` before Move 5.2 wires divergence to a screen

**Evidence.** `node -e` dumping `practice.json.PRX_VAR['7']` (the arrest beat) shows
four entries, tones `calm, calm, curt, curt` — zero `hostile` entries.
`PRX_DIVERGE['2']` (`practice.json`) reads `{"g":"curt","b":"hostile"}` — Level 2's
escalation leg is defined to reach for a hostile variant of beat 7 that does not
exist. This is carried from FG08 (root's own code comment there called it "kept
because the logic is tone-pool-driven and lights up the day the bank grows") — not a
new discovery — but it is newly relevant: the exact same gap now sits inside the
ported engine's own data file, one Move away from being live. Impact: **a
content-authoring task the engine is already built to consume the moment it exists;
cheapest to close before Move 5.2 rather than after, when it would ship live as
structurally inert.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to `practiceEngine.ts` and its content banks** — not the wizard, not the map,
not the print pack.

- **Author `PRX_VAR[7]`'s hostile variant** (golden standard item 5) — the engine's
  own divergence logic already depends on it existing.
- **Wire the tone-tier text prefixes wargame 15 §1.3 promises** ("Calm: / Escalates: /
  Hostile:", EN+ES) — checked directly: `t.en.json` and `practice.json` currently
  contain zero such prefixes on any `prx_ld`-equivalent description string. This was
  FG-09's golden #1 against root, explicitly banked as a must-port fix for /app
  (§1.3) — worth flagging now, before Move 5.2 builds the card list, rather than after.
- **Decide the locked-card visibility policy before Move 5.2, not during it.**
  `isLocked()` (`practiceEngine.ts:84-89`) is a pure predicate with no opinion on
  whether a locked scenario's title renders at all. FG09 golden #5 asked root to make
  this decision explicit; /app's engine is the first codebase where making it explicit
  costs nothing (no existing UI to break) — the cheapest point in this project's
  history to decide it on purpose.
- **Implement real `disabled` (not just visual opacity) on locked cards** when Move
  5.2 builds them — banked in wargame 15 §1.3 as a must-fix, not yet checkable since
  no card UI exists; recorded here so it doesn't get lost between this round and the
  round that reviews Move 5.2.
- **Verify `PRX_UNSCORED` gating survives the port into UI unchanged.**
  `completeRun()` (`practiceEngine.ts:241-263`) correctly checks
  `!PRX_UNSCORED.has(level)` before writing `best` — confirmed matching root's
  semantics (count+denominator always, unscored levels never write a best score).
  This is currently correct; the item here is to keep the same check point when
  Move 5.2 renders a score ring, not to duplicate the gate in a second location the
  way FG09 flagged as a coupling risk in root.
- **`readRootPractice`'s migration exists and is correct but is unconsumed** (overlaps
  golden standard item 1) — when Move 5.2 ships, decide explicitly whether a returning
  root user's practice history prefills `/app`'s engine state or whether /app
  deliberately starts every user at zero during beta. Either is defensible; leaving it
  undecided is not.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06-FG09

**BS-1. If Move 5.2 eventually calls `readRootPractice()`, does a user who already
unlocked Hard Mode on root see it unlocked on their first /app visit, or does the
engine's `isLocked()` — evaluated against a fresh, empty `PracticeProgress` — re-lock
content they've already earned?** The migration logic exists and is correct
(`storage.ts:128-159`), but nothing today exercises the path from "read root's
progress" to "seed the engine's initial state" — that wiring doesn't exist yet, and no
one has decided whether re-locking earned content during beta is acceptable
divergence or a promotion-blocking regression.

**BS-2. Was the `DocsOverlay` focus-trap gap sequenced deliberately (explicitly
deferred to Move 5.3, a documented decision) or simply not measured against a real
screen reader before the overlay shipped as functionally complete?** The code comment
frames it as sequencing ("Move 5.3 — this covers the one overlay /app has today
without building ahead of that move"), but sequencing a fix for later and verifying
the interim state is safe are two different things, and only the first has evidence
here. Nobody has run a screen-reader pass against the live built app to confirm the
interim gap is merely inconvenient rather than actually blocking.

**BS-3. Given that `readRootSave`/`readRootDocs`/`readRootPractice` exist unused, was
"prefill nothing until asked" an explicit product decision, or is it simply that Phase
4's moves didn't reach it?** Every other deliberate scope cut in this migration is
recorded in a code comment at the decision point (`PrintStep.tsx:5-11`,
`Welcome.tsx:32-36`, `YouStep.tsx:65-68`). The root-read bridge has no equivalent
comment anywhere explaining why it's built but idle — the one deferral in this round
that reads like an interruption rather than a choice.

**BS-4. Does a first-time /app visitor who has never touched root correctly
understand what "the live app is at amparohq.com" (`App.tsx:82`) is telling them, or
does identical visual content on both surfaces make the banner read as a formality
rather than a real signal about which app to trust?** Both apps currently render the
same wizard content, word-for-word (by extraction design). A user with zero context
for why two apps exist has no way to distinguish "beta preview" from "the same thing
twice" beyond reading and retaining one banner line.

**BS-5. What is the failure mode if a future `index.html` content edit introduces
markup into a STATES rule or a PACK_EXTRA claims string that the extraction pipeline
doesn't expect — does `PrintPack.tsx`'s `dangerouslySetInnerHTML` on that content
(lines 196, 327) silently render broken HTML, or does something in the extractor
verify the shape of what it hands to a `dangerouslySetInnerHTML` call site before it
ships?** Today's two call sites are verified safe because today's content is known-good
statute-quote and claims markup — but the guarantee that dangerouslySetInnerHTML "never
touches a user field" doesn't by itself guarantee the *content* stays well-formed HTML
as `index.html` continues to change under active development. Nobody has asked what
the extractor does if that assumption breaks.

---

## 5. Group read

**Would-evaluate-favorably verdict: 6 yes/conditional-yes on what's built (Wes, Rosa,
Luis, Dana, Ana, Omar) / 2 neutral, standing conditions unchanged (Tony, Marcus) / 2
have nothing to evaluate yet (Keisha, Nia).** This is a different shape than any prior
FG round because the subject itself is different — a paperwork wizard with a complete
but invisible practice engine behind it, rather than a shipped product surface. The
two personas the practice module exists for (Keisha's urgency, Nia's trauma-sensitivity)
are structurally unable to render a verdict this round, and that absence is itself the
most honest signal in this report.

**Biggest objection by theme.** Three of five golden-standard items trace to the same
root cause: work that is fully built at the code level but not yet connected to
anything a user would touch — the root-read bridge (item 1), the practice engine
(item 4), and the tone-tier prefixes already promised in the wargame's own §1.3 (folded
into item 4/module list). This is a different failure shape than FG06-FG09 found in
root (where features shipped complete and exposed pre-existing gaps more sharply). Here
the pattern is components and utilities built ahead of their consumers, correctly, and
then not wired — the strangler pattern's natural rhythm, but worth naming because three
separate instances in one review round is a pattern, not a coincidence.

**Highest-leverage fix, this round's subject specifically.** Golden standard item 1 —
wire the root-read bridge, or record explicitly that it stays idle through this beta
phase. It's the one item that would change a verdict for the panel's two most engaged,
highest-trust personas (Dana, Ana) without requiring any new design work — the readers
already exist and are already correct.

**Highest-leverage fix, across the whole product regardless of surface.** Unchanged
from FG06-FG09's running item against root — the pre-audio mute gap. This round's
subject is a different codebase (`/app`) that doesn't yet have audio wired to anything
(Move 5.2), so the item doesn't apply here YET — but it must not be allowed to ship
un-fixed a second time in a second codebase. Worth stating as a standing condition on
Move 5.2, not a new finding.

**Who this still isn't for.** Keisha and Nia, for the same underlying reason: the
paperwork half of this product is /app's whole surface today, and neither of their
described needs live in the paperwork half. Not a regression — the practice module was
always going to ship after the wizard — but worth being precise that "no findings for
Keisha/Nia" this round means "nothing exists for them to react to," not "nothing is
wrong."

---

## 6. Signature

Generated by Amparo Focus Group 10 (QA end-to-end review of `/app`, ten-persona
panel).
**Panel:** Wes, Ana, Rosa, Luis, Marcus, Dana, Tony, Omar, Keisha, Nia.
**Scope:** `/app` React strangler migration, wargame 15 Phases 3 through 5.1
(v2.18.0) — welcome, state map, You + document capture, Lifelines, print pack,
practice engine core FSM (no UI). Root `index.html` unchanged and out of scope this
round.
**Verdict date:** 2026-08-12.

All findings tied to live source in `app-src/src/` or `index.html`, or to direct
`node -e` dumps of the extracted content banks. No speculation beyond what a real
future move (Move 5.2, promotion) would need to resolve — those are named explicitly
as open decisions, not treated as defects.
