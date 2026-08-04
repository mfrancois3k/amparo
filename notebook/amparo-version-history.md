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

To restore any version exactly:
```bash
git checkout v2.2.0 -- .        # restore files at that tag, keep history
git reset --hard v2.2.0         # discard everything after that tag
```
