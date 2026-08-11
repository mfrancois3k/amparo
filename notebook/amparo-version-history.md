# Amparo — version history & reference index

Purpose: a lookup table. "Which version was it when X happened" → find it here,
then `git checkout vX.Y.Z -- .` in the repo restores exactly that state.

Repo: `C:\Users\mfran\Ai-Foundations\Amparo` — tags are annotated, dates below
are the actual tag creation dates (`git for-each-ref`), not estimated.

---

## v2.0.0 — 2026-07-29 — "Get the site live and safe"

The pre-tag build-up commits, in order:
- `c73d034` — Amparo bilingual traffic-stop rights pack landing page (the
  original product)
- `07a5fe5` — split preview/action layout on the print step, demoted
  post-print actions to a grouped rail
- `8b306d4` — voice practice drill: TTS officer, hostility levels, no-mic by
  design
- `c795ec3` — rehearsal callout, pacing bar, on-device self-playback recording
- `3c50806` — state-accurate sign-ticket card, constitutional citations on
  practice cards

**Then, tagged v2.0.0** (bundled as one release):
- Web app manifest + 4 icon sizes — installability. Load-bearing, not
  cosmetic: iOS evicts storage for non-installed sites after ~7 days idle, and
  the product's pitch is "set it up once, need it months later at the
  roadside."
- Service worker precaches manifest + icons for a cold offline start.
- `vercel.json`: CSP, HSTS, X-Frame-Options DENY, no-referrer,
  Permissions-Policy, SRI on the GSAP CDN script.
- Removed a dead "quick exit" that never wiped anything and left captured
  licence photos one Back-gesture away via bfcache.
- Accessibility: Escape/focus-trap/focus-restore on all overlays; prep drill
  keyboard-operable (Enter/Space); emergency-contact fields properly labelled
  (previously announced the placeholder instead of the question); canvas carry
  card given real alt text; gold-text contrast raised 1.71:1 → 7.24:1; practice
  voice toggles padded to 44px.
- **EDITION bumped to 2026-C.** Immigration guidance corrected (voluntary
  departure / stipulated removal named explicitly; added the caveat that
  silence can lengthen a stop rather than end it). New checkpoint rehearsal
  level, built only on settled law (Martinez-Fuerte 1976, Ortiz 1975,
  Brignoni-Ponce 1975, 8 U.S.C. §1357, 8 C.F.R. §287.1) including that leaving
  a checkpoint is a federal felony (18 U.S.C. §758). "Practice genuinely lowers
  your risk" reworded to what the evidence actually supports.
- Gated practice levels shown as **locked**, not hidden.
- Carry card: fill-in recall card rendered to a saveable PNG.

**Known limits at this tag:** only TX/GA/NY covered; no state attorney-reviewed;
Upsolve v. James open question for the scored engine — unaddressed here.

---

## v2.1.0 — 2026-07-30 — "50 states, kill the docs step, fix the funnel"

- `3c71d4c` — all 50 states + DC selectable. TX/GA/NY keep cited statutes; the
  rest show the verified federal floor (Mimms, Rodriguez, Berghuis/Salinas, 4th
  Amendment), marked "federal ✓" — no state statute invented anywhere.
- `2670957` — **document-capture step removed entirely.** Flow: 5 steps → 4
  (state, you, lifelines, print). 493 lines / 32 functions of camera engine
  deleted. Reasoning at the time: drivers already carry their documents.
  *(Reversed in judgement later — see the transcript section: the one user who
  completed the funnel had used this exact step. Not re-added as of this
  writing; flagged as open.)*
- `1e2fd0e` — custom 404 (deer-in-headlights, in the site's own palette, home
  button + route into Practice). Focus-group review (6 personas) found the
  price banner ("$19 after launch") sitting on the state picker — precisely
  where the drop happens — and it was pulled; replaced with the on-device
  privacy line. Pending-state tag reworded from "FEDERAL ONLY" (reads as
  broken) to "federal ✓" (reads as verified). Micro-interactions added
  throughout, compositor-only (transform/opacity), reduced-motion safe.

---

## v2.2.0 — 2026-07-31 — "Fix the DNS outage, fix analytics honesty"

- `bde93d9`, `68b5cc9`, `b88c4bf`, `413a69d` — **the site was down.**
  `www.amparohq.com` had been pointed at PostHog's own managed reverse proxy —
  a hostname collision, since a domain cannot be both the website and the
  analytics proxy. Fixed by moving the proxy to `ph.amparohq.com` and
  restoring `www` to Vercel.
- `457bc38` — analytics routed through the `ph.amparohq.com` proxy once it
  verified `valid`.
- `b5442b5` — daily statute source check + honest freshness badge added (see
  below; this is the first version of it, later hardened in v2.4.0).
- `c1b3bbc` — `sr_pack_printed` fixed to count one event per print. Android
  Chrome fires `beforeprint` more than once per print; production data showed
  a real user's two events 686ms apart, meaning every historical print count
  had been inflated.

---

## v2.3.0 — 2026-07-31 — "Documentation only, no user-facing change"

- `d369cb2` — `CHANGELOG.md` added, generated from tag annotations (not
  commit subjects — annotations carry the real release notes). Fixed 4 bugs
  in the generator skill itself: hardcoded project name from a different repo,
  mangled backticks in a here-string, mojibake em-dash (PowerShell 5.1 reads a
  BOM-less UTF-8 script as ANSI), and it was reading the commit at each tag
  instead of the tag's own annotation.

---

## v2.4.0 — 2026-07-31 — "The daily check actually runs, and cannot lie"

- `07c43c1` — GitHub Action for the daily statute check went live (09:17 UTC +
  manual dispatch). Blocked for a while by a git-credential mismatch: `gh auth
  refresh` had granted `workflow` scope, but git was still authenticating with
  a different, older PAT via `credential.helper=manager`. Fixed with `gh auth
  setup-git`.
- `5fd7292`, `8c7b9b2`, `ef43be9` — **source hosts hunted from a real Actions
  runner**, not locally. FindLaw and Justia 403 GitHub's datacenter IPs while
  answering a residential IP fine — which is exactly why local testing had
  been misleading. `public.law` serves the runner reliably; TX and NY switched
  to it. Georgia has no working source from CI (public.law has no GA
  subdomain; every alternative 404s/503s/serves a JS shell) — GA is only
  genuinely checked on a local run.
- `d406d2e` — **fixed a false-assurance bug the first cloud run exposed.**
  With all four sources 403ing, the job still wrote `lastChecked: today` and
  the site displayed a green "sources auto-checked daily" badge while nothing
  had been checked. `lastChecked` now only advances when at least one source
  is actually reached; otherwise the old date carries forward and
  `lastAttempt` records the run separately.
- `4d27254`, `480956e`, `0634442` — the daily cron firing on schedule,
  unattended, exactly as designed.
- `a85b0e8` — removed the temporary source-prober tooling once its job was
  done (findings preserved in `research/law-watch.json`'s `_comment` array).

---

## v2.5.0 — 2026-08-02 — "Fix the bounce: the state picker was the problem"

- `fc2f46b` — `wargames/01-panel-and-roadmap.md`: the expert panel, blind
  spots, and the roadmap synthesised from the real user transcript + PostHog
  data + an outside AI's product prompt.
- `3b4918c` — **the state picker was the bounce driver, verified not assumed.**
  Real 30-day PostHog data: 72 people landed, 4 ever picked a state — a 94.5%
  drop, far worse than the ~50% PostHog's aggregate bounce metric showed.
  Reproduced the cause on a real mobile viewport: `.state-grid` had
  `max-height:52vh; overflow-y:auto`, a scrollable box nested inside a page
  that already scrolls (a scroll-trap), and Texas — one of only three states
  with real cited statutes — sat alphabetically at position **44 of 51** inside
  it, with no search. Fixed by removing the nested scroll, floating TX/GA/NY to
  positions 1–3 under a "Fully cited" heading, and adding a client-side search
  filter (zero network calls — nothing typed leaves the page).
  **Deliberately not built:** geolocation auto-detect, which would send
  coordinates to a reverse-geocoding API and break the on-device promise.
  Logged as an explicit fork rather than shipped silently.
- `notebook/` — the NotebookLM source documents moved into the repo so their
  paths survive across sessions and are versioned alongside the code.

**Open at this tag:** GA still unreachable from CI; no state attorney-reviewed;
Upsolve v. James unresolved for the scored practice engine; the
document-capture step's removal now looks wrong for the reason recorded in
`amparo-friend-answers-followup.md` (the user wanted it, but needed privacy —
the fix is skippable-and-resumable, not removal).

---

## v2.6.0 — 2026-08-02 — "The safety net had a hole, and the boot path never ran"

- `9a65eed` — **`sr_step_viewed`.** All ~30 existing `sr_*` events recorded
  actions; none recorded a step being *seen*. So "56 people saw the picker and
  left" was indistinguishable from "only 6 ever rendered it," and v2.5.0's
  picker fix was unfalsifiable. Fired from `render()` rather than `go()` so a
  restored or deep-linked first paint counts; `stepChanged` dedupes re-renders
  and language toggles (`sr_pack_printed` had already been burned by exactly
  that class of double-fire in v2.2.0). Plus a **feedback path for the 95% who
  leave** — `usageFeedback` existed but only appeared for a returning user who
  had already printed. The stuck-strip sits on every wizard step, four fixed
  reasons, only a reason slug transmitted. With autocapture permanently off,
  this is the only possible substitute for rage-click data.
- `2bb2d9d` — **four defects found by a blind-spot panel** (trauma-informed
  practitioner, analytics engineer, privacy engineer — none of those disciplines
  had ever read this code). All the same shape: a claim true when written and
  silently invalidated later, or a safety net that existed but was unreachable.
  1. **`restore()` was never called at boot** — two call sites, its own
     definition and `demoExit()`. Autosave, resume, and the first-visit Spanish
     auto-detect were all dead. **A Spanish-dominant phone landed in English the
     entire time**, and an earlier audit this same day had marked that problem
     "already fixed" on the strength of code that existed but was unreachable.
  2. **Session replay ran on steps 0–1 with no masking.** The scoping argument —
     those screens are "structurally un-recordable" — was true when step 1 was
     51 buttons. v2.5.0 added a text input and nobody revisited it.
  3. **The crisis net missed the natural spelling of its own trigger.** No
     apostrophe stripping, so `"I can't go on"` was not intercepted while
     `"I cant go on"` was. The phrase list was also duplicated and drifted (the
     typed path missed three phrases, two Spanish), and a disclosure was scored
     as a **miss** — a yellow square in the results grid, carried into the
     shareable summary.
  4. **`sr_crisis_phrase_shown` removed.** Properties were clean; the event's
     *existence* transmitted that a session disclosed suicidal ideation.
  Also: a freeze is no longer answered with escalation (12s of silence used to
  re-speak the hostile officer line), and consent to escalation is per-level
  instead of one global boolean that silently consented level-3 finishers to
  Hard Mode and the checkpoint.
- `notebook/` — UPL attorney engagement memo (sendable), focus group 02 (twelve
  simulated members walked step-by-step), and `wargames/02-consensus-roadmap.md`
  (20 ranked items, unioning the wargame 01 panel with new seats).

**No legal content changed. EDITION remains 2026-C.**

**Open at this tag:** six UI/UX fix specs designed but unapplied; GA still
unreachable from CI; no state attorney-reviewed; Upsolve v. James unresolved for
the scored practice engine.

---

## v2.7.0 — 2026-08-03 — "Rehearsal is the product"

Landing headline repositioned around rehearsal, not the pack. New step 5
"Practice" hub with live progress. Step 3 (lifelines) cut from 2449px to
667px via a segmented carousel. Print screen unified to one label covering
both print and PDF outcomes. Spanish lifeline names, the language-toggle
no-op, and frozen-English aria-labels all fixed. UPL opinion still pending —
step 5 promotes the scored engine, a deliberate call logged in `wargames/02`.

## v2.7.1 — 2026-08-03 — "The hub nobody could reach"

Fixed defects v2.7.0 introduced: the practice hub had exactly one entry
point and vanished once a user had any progress — found by a focus group
run against the shipped build. Printed packs now stamp their EDITION so a
content correction triggers a reprint warning. A `controllerchange` bug was
double-firing `$pageview` on every first visit. PostHog Surveys disabled.
React/Next rebuild and cloud TTS both rejected on measured evidence.

## v2.7.2 — 2026-08-03 — "Hard mode absorbs the hard stop"

"The hard stop" and "Hard mode" merged — the former recycled 100% of its
beats from other levels, the unwinnable ending moved onto the latter's
original content. Ladder now 4 numbered rungs + unnumbered Checkpoint, with
a version-stamped localStorage migration for existing users. Hub tabs added
[Traffic stop][At your door] — door tab is an honest "not built, here's why"
empty state pending attorney + DV-clinician review
(`notebook/amparo-door-module-research-2026-08-03.md`). Progress bar added.
Mute for the officer voice, full score fractions, search aria-label.

## v2.7.3 — 2026-08-03 — loop verification pass

No code changes — tags the state a `/amparo-loop` verification run (focus
group, module review, blind-spot audit) executes against, subject: the
mute fix from v2.7.2. Backfills this doc and CHANGELOG.md for v2.7.0–2.7.2,
which were pushed without an entry in either.

## v2.7.4 — 2026-08-03 — three fixes the v2.7.3 loop's own agents found

Unreachable dialogue lines pruned, stale post-merge comments fixed, Hard
Mode's hub-card score leak closed, and a CRITICAL race where muting mid-line
could itself trigger the officer's voice via the TTS fallback. Design-only
final-boss module scaffolded alongside (not shipped) — see
`wargames/10-final-boss-module-scaffold.md`.

## v2.8.0 — 2026-08-04 — "The recorded voices finally play"

The pre-recorded officer clips had never played on any level but Checkpoint —
`PRX_VAR`/`PRX_HARD` had no `id` field, so everything fell to browser TTS. 53
ids wired. Double-voice bug fixed (two independent causes). 18 Spanish clips
generated via Voicebox native presets, 2 rejected on pronunciation. Two final
scenarios and the door module fully plumbed but flag-dark pending attorney and
DV-clinician review.

## v2.8.1 — 2026-08-04 — "Ten personas said no, and not one said the price"

Synthetic 10-persona panel + UI/UX researcher synthesis run against the live
site: pain points, and would-they-pay-$3.99-for-a-module-script. All 10 said
no, zero for price reasons — payment-trail risk, no institutional backing,
duplicate of free content, wrong-shaped for the user, incomplete state
coverage. Shipped the two fixes buildable without legal content: a
state-pick-to-print-step fast path, and a reworded federal-only state screen
leading with what's verified before the gap. DV clinician engagement memo
drafted for the door module, unsent, alongside the UPL memo.

## v2.9.0 — 2026-08-04 — "The door has words now — and they stay behind the flag"

Door module (ci 70-75) drafted end to end: setters, officer lines, options,
coach lines, model answers, EN + ES; 24 edge-tts clips in the app's canonical
voices, 24/24 Whisper round-trip verified; hub card + tab + CSS door badge
wired behind `DOOR_MODULE_ENABLED`. Officer lines modeled on the six-video
bodycam batch's corroborated patterns (`amparo-door-raid-research-2026-08-04.md`).
DV-critical beats 71/73 drafted bothGood (never a miss); clinician markers
stay. Flag stays FALSE — flip still requires attorney + DV-clinician sign-off
in the same commit. Both memo appendices updated to disclose the draft.

**⚠️ REVERTED in `df974b7`** — the door-module content from this tag is not in
`main`. Pulled at Michael's direction: the draft paraphrased phrasing patterns
from the bodycam research instead of using the source clips, which was not the
approach asked for. Flag was never on; nothing reached users. `PRX_DOOR` is back
to placeholders, the 24 clips and `tools/gen_door_voices.py` are deleted. The
research survives at `notebook/amparo-door-raid-research-2026-08-04.md`.
`git checkout v2.9.0 -- .` still restores the draft if it is ever wanted.

## v2.10.0 — 2026-08-10 — "Four answers from the only real user, all four closed"

Every change traces to one of four direct answers from the one real user, and
nothing in it was invented. (1) Download worked but he wanted AirPrint and never
knew the button already does it — `window.print()` opens the OS dialog where
AirPrint lives; label now names it. (2) Nothing in the product brought him back
— he remembered, and had promised feedback; added a `.ics` reminder, the only
channel that reaches a closed app with no server, account or push token, landing
tomorrow evening because he named privacy as the blocker. (3) The gold practice
CTA got lost in a dense screen at the moment his task completed — now scrolls
itself into view. (4) Document capture returns as an optional overlay rather
than the wizard step v2.1.0 removed: native OS-camera file input, no
`getUserMedia`, ~90 lines instead of 493, photos persisted under `sr_docs` so
the reminder has somewhere to land, print pockets only when photos exist.

The join: not somewhere private → reminder → resume → add them. Three of the
four were placement or labelling defects, not missing features. Two pre-existing
CSS defects fixed in passing (`.btn` width overflow in flex rows, `.docrow .dt`
missing `min-width:0` at 320px in Spanish).

## v2.11.0 — 2026-08-11 — "A real map, and a stepper that actually steps"

State picker rebuilt twice in one session: a tile cartogram first, replaced
outright once the actual ask was "like this, not rectangular" — real
geographic US map from public-domain path data (Wikimedia Blank US Map), 51
jurisdictions, runtime label placement off each shape's bounding box. Sliver
states (RI/DE/DC/NJ/CT/MA/NH) get their label pulled outside the polygon and
wired as a full click/hover peer — the label *is* the tap target there.
Alphabetical button list removed entirely; map is the one picker. Stepper's
completed nodes are now clickable nav back to that section via the existing
`goM()`; current/future nodes stay inert. Found and fixed app-wide: `[hidden]`
was a silent no-op on `.linkbtn` (author rule beat the UA default).
`index.html` 458 → 502 KB.

## v2.11.1 — 2026-08-11 — "The map hands off properly now"

Two fixes on the v2.11.0 picker, both found by using it. **Search-fade
regression:** typing a state name stopped dimming the map — `filterStates()`
tagged non-matches correctly, but the entrance wave's
`animation-fill-mode:forwards` held `opacity:1` in the animations cascade
layer, which outranks ordinary author rules regardless of specificity, so
`.nomatch{opacity:.1}` could never win from first paint. Fixed by dropping the
animation class once the wave lands. **Confirmation + handoff:** the confirmed
chip now shows the state's own silhouette above ✓ + name (bounding boxes for
all 51 measured once and baked in as `SM_BOX`, no layout pass), and the
map→chip transition went from a 0.18s cut to three beats over ~900ms.

⚠️ Gotcha worth remembering: the silhouette needs **two** injection points —
`render()` for an already-collapsed load, and `setStateCollapsed()` for the
click, because picking a state only toggles classes and never re-runs
`render()`. Reload-only testing hides this completely; the chip renders empty
on every real click.

## v2.12.0 — 2026-08-11 — "The pick travels with you"

The chosen state used to vanish once the picker collapsed after step 1 —
every later step silently depended on a choice the user could no longer see.
A pill in the eyebrow row on steps 2-5 now carries the confirmation chip's
own silhouette plus abbreviation and full name, opposite the step counter;
tapping it calls `goM(1)`, matching v2.11.0's clickable-stepper contract.
Reuses `smShape()`/`SM_BOX` — no new geometry. Under 380px the name drops,
silhouette + abbreviation carry it. From the reference mockup's row 1 (state
should persist through the flow); the mockup's module dashboard was NOT
rebuilt (already shipped, step 5, since v2.7.0), and its paid-script
completion screen was NOT built (contradicts the 10-persona pricing panel —
all 10 declined $3.99, none on price).

## v2.12.1 — 2026-08-11 — "The room feels the tone now"

Practice card gets a tone-atmosphere border glow (amber curt, red hostile)
plus a red vignette + animated scanline for Hard Mode, closing the last gap
from the mockup pass — Hard Mode had a red tab badge and warning banner, but
the beat screen itself looked identical to a calm level while playing it.
`box-shadow` only, never touches text color, so no retheming of shared
templates needed. Reset unconditionally at the top of `practiceRender()`,
before its several early-return debrief paths, so a debrief never inherits a
stale `hardmode-live` class. Not built: a ring turn-counter from the same
mockup — the existing linear demeanor bar already carries that information.

⚠️ Gotcha: first draft named the DOM handle `card`, colliding with the
function's pre-existing `const card=prxCard(ci)` (the beat's content object)
— a function-scope redeclaration that silently failed the whole inline
script to parse. Caught by running the extracted script through
`node --check` before trusting browser tests. Renamed to `atmCard`.

## v2.12.2 — 2026-08-11 — "The card says yes before the screen turns"

Hub scenario cards confirm the tap with a green pulse (~260ms) before the
practice overlay covers them — reference mockup row 3 ("card highlights green,
scenario selected"). Cards route through `prPick()`: pulse, then `prStart()`
launches; reduced motion launches immediately; a busy flag eats double-taps so
`practiceOpen()`'s spoken line can't stack. Locked cards keep their empty
onclick. This was the one remaining row-3 gap — every other screen in the
mockup is already live (map v2.11, state pill v2.12.0, tone atmosphere v2.12.1,
typed/voice/custom input long-standing, hub dashboard v2.7.0). Paid completion
screen (mockup 4x4) NOT built — contradicts the 10-persona pricing panel.

## v2.13.0 — 2026-08-11 — "Checkpoint gets its own tab"

A fixed Border Patrol checkpoint applies in all 50 states and has nothing to
do with a traffic stop's state-cited content, but it was buried as the last
card in the traffic ladder. Hub goes from 2 tabs to 3: Traffic stop |
Checkpoint | At your door. Traffic keeps the 4 numbered rungs + progress bar;
checkpoint gets its own card + context note; door unchanged (index 2 now).
Hub-grouping change only — same level 4, same content, same in-overlay tabs.

## v2.14.0 — 2026-08-11 — "The officer reacts to how you answer"

Divergent turns: `prxDiverge()` re-deals the NEXT beat's variant after each
answer — the reference mockup's core mechanic ("different next turn loads"),
its last unbuilt piece. Direction capped per level by the consent design:
L1 good answer de-escalates to a calm-pool line, mistake keeps curt (hostile
never enters L1 — no consent gate there); L2 mistake→hostile / good→curt but
inert today (the arrest beat ci 7 has zero hostile variants — logic kept,
tone-pool-driven, lights up when one is authored); L0 static (promised calm,
verified byte-identical); L3+ fixed tracks. Selection only from the same
closed static bank, each variant with its own recorded-voice id — no new
content, and UPL memo §2.2 gained a sentence disclosing the mechanic so
counsel keeps reading an accurate description. Curveballs never re-dealt;
crisis (tier x) answers never steer tone. No new UI — demeanor meter and
bubble colour already read tone per beat.

## v2.14.1 — 2026-08-11 — "Five fixes the loop's own agents found"

All five from the v2.14.0 verification pass. (1) Score-history index
mismatch: `prRun` skips crisis beats, `prDeck` doesn't — wrong officer line
per score square and wrong rail-dot colour after any crisis disclosure;
fixed with parallel `prRunIdx[]` through all five reset sites, verified with
a real crisis beat mid-run. (2) Reduced-motion double-tap double-fired the
overlay — first fix attempt also wrong (synchronous reset, same-tick clicks
slip through); caught only by re-testing the actual double-click. (3)
Demeanor tone label was `aria-hidden` — now a polite live region. (4)
`smCap()` hardcoded `'federal ✓'` → `_t.s_pending`. (5) Dead duplicate
`prxBack()` (hoisting-shadowed) deleted.

⚠️ Gotcha pair worth remembering: shared-index reads over `prRun`/`prDeck`
misalign after crisis beats (use `prRunIdx`), and busy-flag guards reset
synchronously are no-ops against same-tick double-clicks.

## v2.15.0 — 2026-08-11 — "The rehearsal room matches the roadside"

Practice overlay goes dark — card, bubbles, choice cards, coach boxes, tabs,
rail, results, footer. Extends the recording console/officer-panel palette
(gold `#F3D48A`, muted `#8fa0bd`, green `#4ade80`) rather than inventing a
second scheme. Scoped to `#practiceOverlay` via explicit overrides, not a
global `--navy` flip (it's both dark text AND dark button bg — flipping it
breaks the selected tab). Six other `.ab-card` overlays + print pack verified
still light. Caught in visual testing: `.prx-key` inherited text colour,
rendering the model answer's highlighted phrases unreadable on dark — fixed
with explicit ink. Tone atmosphere (v2.12.1) re-tuned for dark ground.

---

## Quick lookup: "what tag has the fix for X"

| If you're looking for… | It's in |
|---|---|
| Installability / manifest / a11y fixes | v2.0.0 |
| Checkpoint level / corrected immigration copy | v2.0.0 (EDITION 2026-C) |
| All 50 states selectable | v2.1.0 |
| Document-capture step removed | v2.1.0 |
| Custom 404 / focus-group copy fixes | v2.1.0 |
| The site-down DNS incident and its fix | v2.2.0 |
| Print-count double-fire fix | v2.2.0 |
| CHANGELOG.md itself | v2.3.0 |
| Daily statute check actually running in CI | v2.4.0 |
| public.law host switch (GA still unreachable from CI) | v2.4.0 |
| The panel / blind spots / roadmap doc | v2.5.0, `wargames/01-panel-and-roadmap.md` |
| State-picker search / priority order / scroll-trap fix | v2.5.0 |
| The UX audit that found the 94.5% drop | v2.5.0, `notebook/amparo-ux-audit-2026-08-02.md` |
| `sr_step_viewed` / step-view instrumentation | v2.6.0 |
| Feedback path for people who never convert | v2.6.0 |
| `restore()` never ran at boot (Spanish auto-detect was dead) | v2.6.0 |
| Session-replay masking on steps 0–1 | v2.6.0 |
| Crisis-phrase apostrophe bug + list drift | v2.6.0 |
| Freeze no longer answered with escalation | v2.6.0 |
| Per-level consent to escalation | v2.6.0 |
| UPL attorney engagement memo | v2.6.0, `notebook/amparo-upl-engagement-memo.md` |
| Consensus roadmap (20 ranked items) | v2.6.0, `wargames/02-consensus-roadmap.md` |
| Focus group 02 (12 members, step-by-step) | v2.6.0, `notebook/amparo-focus-group-02-walkthrough.md` |
| Step 5 practice hub / rehearsal-first landing | v2.7.0 |
| Lifelines carousel (2449px → 667px) | v2.7.0 |
| Practice hub reachability fix | v2.7.1 |
| Pack EDITION staleness check | v2.7.1 |
| Duplicate `$pageview` on first visit | v2.7.1 |
| Hard-stop/Hard-mode level merge + progress migration | v2.7.2 |
| Door module empty state / DV research | v2.7.2, `notebook/amparo-door-module-research-2026-08-03.md` |
| Officer-voice mute | v2.7.2, verified again at v2.7.3 |
| `.claude/skills/amparo-loop/` (this verification sequence) | v2.7.3 |
| Orphaned `PRX_VAR` hostile lines / stale merge comments | v2.7.4 |
| Hard Mode hub-card score leak | v2.7.4 |
| Mute-race CRITICAL fix (mute could itself trigger audio) | v2.7.4 |
| Final-boss module scaffold (2 scenarios, design-only) | v2.7.4, `wargames/10-final-boss-module-scaffold.md` |
| Recorded voices never played / TTS everywhere | v2.8.0 |
| Double-voice on entering a module | v2.8.0 |
| Spanish audio 49 → 58 per voice | v2.8.0, `notebook/amparo-spanish-audio-recording-list.md` |
| Final scenarios + door module built (flag-dark) | v2.8.0 |
| 10-persona panel + UX researcher synthesis, $3.99 pricing test | v2.8.1 |
| State-pick fast-path to printable pack (`skipToPack()`) | v2.8.1 |
| Federal-only state-screen copy reframe | v2.8.1 |
| DV clinician engagement memo | v2.8.1, `notebook/amparo-dv-clinician-engagement-memo.md` |
| Bodycam batch research (6 videos, /watch-bulk) | v2.9.0, `notebook/amparo-door-raid-research-2026-08-04.md` |
| Door module full draft (script + options + audio, flag-dark) | v2.9.0 |
| Door audio d70-75 (24 clips, edge-tts, verified) | v2.9.0, `tools/gen_door_voices.py` |
| Door hub card / tab / `.doorbg` badge wiring | v2.9.0 |
| **Door module draft REVERTED (not in main)** | `df974b7`, after v2.9.0 |
| Real-user 4-answer session (print, return, CTA, photos) | v2.10.0 |
| `.ics` "remind me tomorrow" finish-later reminder | v2.10.0, `downloadFinishReminder()` |
| AirPrint named on the print button | v2.10.0 |
| Practice CTA scrolls into view after printing | v2.10.0 |
| Document capture rebuilt as an overlay (not a wizard step) | v2.10.0, `openPapers()` / `sr_docs` |
| Window-card photo pockets restored (only when photos exist) | v2.10.0 |
| Geographic US state map (real shapes, replaces alphabetical list) | v2.11.0 |
| Sliver-state labels as full tap targets (RI/DE/DC/NJ/CT/MA/NH) | v2.11.0 |
| Stepper's completed nodes clickable — jump back to a section | v2.11.0 |
| `[hidden]` app-wide fix (was a no-op on `.linkbtn`) | v2.11.0 |
| Map search-fade regression (`forwards` beat `.nomatch`) | v2.11.1 |
| Confirmed chip shows the state silhouette (`SM_BOX`, `smShape()`) | v2.11.1 |
| Map→chip handoff choreographed (~900ms, 3 beats) | v2.11.1 |
| Chosen state travels via eyebrow pill (steps 2-5), tap returns to step 1 | v2.12.0 |
| Practice card tone-glow + Hard Mode scanline atmosphere | v2.12.1 |
| Hub scenario-card green-pulse confirm before overlay (`prPick()`) | v2.12.2 |
| Checkpoint split into its own hub tab, out of the traffic ladder | v2.13.0 |
| Divergent turns — officer's next line reacts to the answer (`prxDiverge()`) | v2.14.0 |
| L2 arrest beat (ci 7) has no hostile variant — escalation leg inert | v2.14.0 note |
| Crisis-beat score-history misalignment (`prRunIdx[]`) | v2.14.1 |
| Reduced-motion double-tap guard (same-tick clicks) | v2.14.1 |
| Demeanor label screen-reader fix + `smCap` i18n + dead `prxBack` | v2.14.1 |
| Loop reports: FG-08, `wargames/12`, blindspot-audit-2026-08-11 | v2.14.1 window |
| Dark practice card (scoped `#practiceOverlay` palette) | v2.15.0 |
| `.prx-key` dark-mode contrast fix | v2.15.0 |

To restore any version exactly:
```bash
git checkout v2.2.0 -- .        # restore files at that tag, keep history
git reset --hard v2.2.0         # discard everything after that tag
```
