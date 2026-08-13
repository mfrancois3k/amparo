# Amparo — session handoff

Paste this whole file as the first message of a new session. Everything in it
was verified against the repo on 2026-08-13 at tag `v2.21.2`, not remembered.

> **Biggest change since the last handoff (v2.15.0):** a React/Vite port of the
> whole app now exists and is live at `/app`, built by a 7-phase strangler
> migration that is **complete**. The old handoff said "No React/Next rebuild —
> do not re-litigate"; the operator explicitly superseded that decision. See
> **The `/app` strangler** below before you act on anything framework-related.
> Root `index.html` is still the live product at `/`.

---

I'm Michael, building Amparo (amparohq.com). Read this fully before doing anything.

## What Amparo is

Free, no-account, offline-capable PWA that prepares drivers for a police traffic
stop **before** it happens. Bilingual EN/ES. Single-file static HTML (~529KB),
deployed on Vercel. Repo: `C:\Users\mfran\Ai-Foundations\Amparo`

**Core promise, never violate:** "Your name, contacts and documents never leave
your phone." No accounts, no server, no upload. This is why the audience trusts
it, and it is the product's only real moat.

## Read these first — they exist so you don't read index.html

`index.html` is 436KB. Do not read it to learn context. Read these:

| File | What it gives you |
|---|---|
| `notebook/amparo-version-history.md` | every tag, what shipped, "which tag has fix X" lookup |
| `notebook/amparo-session-log.md` | ground truth, funnel data, incidents |
| `notebook/amparo-user-transcript.md` | the one real user's actual words |
| `notebook/amparo-ux-audit-2026-08-02.md` | the 94.5% drop audit |
| `wargames/02-consensus-roadmap.md` | 20 ranked roadmap items |
| `notebook/amparo-upl-engagement-memo.md` | UPL legal exposure, drafted, unsent |
| `notebook/amparo-dv-clinician-engagement-memo.md` | door-module DV safety gate, drafted, unsent |
| `CHANGELOG.md` | generated from tag annotations |
| `notebook/amparo-voice-generation-workflow.md` | **required before generating any audio** — Voicebox process, the transcribe round-trip, the orphan-id trap |
| `notebook/amparo-app-migration-log.md` | **the `/app` migration, move by move** — what shipped, what broke, what was deferred. Long, but it is the record |
| `wargames/15-react-strangler-migration.md` | the migration battle plan (7 phases, ~18 moves) + Appendix A, the full parity inventory |
| `wargames/18-app-parity-report.md` | the final parity audit + the **operator sign-off** on 19 accepted deferrals |

For the newest work specifically: `notebook/amparo-focus-group-08-divergent-turns.md`,
`wargames/12-divergent-turns-modules.md`, and
`notebook/amparo-blindspot-audit-2026-08-11.md` — the most recent `/amparo-loop` pass.
For the door module's research trail: `wargames/10-final-boss-module-scaffold.md`,
`notebook/amparo-door-module-research-2026-08-03.md`, and
`notebook/amparo-door-raid-research-2026-08-04.md` (six bodycam videos, see the
REVERTED note below before touching this again).

## Current state — verified at v2.21.2, 2026-08-13

- Live at https://www.amparohq.com/ — static, Vercel, no backend anywhere.
- **A second app now exists at `/app`** — same origin, same repo. See the next
  section. Root at `/` is still the default entry and the live product.
- `EDITION = "2026-C"`. An attorney signs a **specific** edition; any legal
  content change bumps EDITION and automatically drops every attorney badge.
- **Zero attorneys engaged.** Badge scaffold exists, never filled.
- TX/GA/NY have real cited statutes. The other 47 + DC show the verified federal
  floor only, marked "federal ✓". No state statute has ever been invented.
- **Practice engine: 5 live levels** — Calm stop, Irritated officer, Ordered
  out, Hard mode, Checkpoint. Hard mode is the unwinnable one. Checkpoint got
  its **own hub tab** in v2.13.0 (was buried at the end of the traffic ladder;
  it's a Border Patrol immigration checkpoint, not a traffic stop, and applies
  in all 50 states unlike the state-cited content).
- **Divergent turns (v2.14.0):** on Level 1, a good answer de-escalates the
  NEXT officer line to the calm-tone variant; on Level 2, a mistake escalates
  to hostile. Selection only, from the same static attorney-reviewable variant
  bank — no new content. L2's arrest beat currently has zero hostile variants
  in the bank, so that leg is inert until one is authored (flagged, not fixed).
- **Geographic US state map (v2.11.0)** replaced the old alphabetical button
  list entirely — real state shapes from public-domain path data, sliver
  states (RI/DE/DC/NJ/CT/MA/NH) tappable via their labels. Picked state now
  travels as a pill through steps 2-5 (v2.12.0), tapping it returns to step 1.
  Stepper's completed nodes are clickable nav (v2.11.0).
- **Practice card is dark now (v2.15.0)** — was cream, now navy/gold matching
  the recording console's existing dark palette. Tone-atmosphere (v2.12.1: a
  border glow that shifts with officer tone, red scanline on Hard Mode) was
  re-tuned for the dark ground in the same release.
- **A "remind me tomorrow" `.ics` calendar reminder (v2.10.0)** is the only
  channel that can reach a user after they close the app — no server, no
  push, no account. Offered on steps 1-3 once a state is picked.
- **Document-capture step is BACK, rebuilt (v2.10.0)** — this file used to say
  "not built" after v2.1.0 removed it; that's now wrong. It's an *overlay*,
  not a wizard step (native OS-camera file input, no `getUserMedia`), reached
  from the You/Print steps, photos persisted under their own `sr_docs`
  localStorage key so they survive a reload but can be wiped independently of
  the rest of a saved pack.
- **One more scenario tier + a door module are BUILT but DARK.** See flags below.
- Audio: 62 clips per voice EN, 58 per voice ES. All 53 referenced ids resolve
  in EN. Missing in ES: `k30`, `k33` only. (A separate 24-clip door-module
  batch was generated in v2.9.0 and then deleted in the revert below — do not
  expect to find it.)
- No payment integration. No Stripe. No Convex deployed (chosen, not built).

## The `/app` strangler — read before any framework/port work

A full React 19 + Vite + TypeScript port of the app lives at `/app`. The
migration (`wargames/15`) is **complete**: all moves 0.1 → 6.2 shipped,
verified, and logged. It supersedes the old "no rebuild" decision.

**Shape of it:**
- Source in `app-src/`. Built output is **committed** to `app/` — the Vercel
  project is zero-config static with no build step, so the build must be in the
  repo. There is deliberately **no root `package.json`** (it would trip Vercel's
  framework auto-detection and put root deploys at risk).
- `app-src/` has its own `package.json`. Useful scripts:
  - `npm run check` — runs all four check suites at once
  - `npm run build` — **gated on the content verifier**; fails on content drift
  - `npm run lint` / `npm run dev` / `npm run preview`
- Four check suites in `tools/`: `extract-app-content.mjs --verify` (content),
  `app-storage-check.mts` (14), `sw-routing-check.mjs` (12),
  `practice-engine-check.mts` (21).

**The non-negotiable rule of the port:** every user-facing string, officer line,
statute and legal phrase in `/app` is **mechanically extracted** from
`index.html` by `tools/extract-app-content.mjs` into `app-src/src/content/*.json`
and verified byte-identical. Nothing user-facing is ever hand-typed in `/app`.
If you change content, change it in `index.html` and re-run the extractor.

**Other invariants, all enforced not just asserted:**
- `/app` writes only `app_*` localStorage keys. Root's six keys are read-only
  from `/app`, enforced by shape — `services/storage.ts` exposes no generic
  key writer.
- `/app` ships **zero analytics** (root has PostHog). Enforced by its own
  stricter CSP (`connect-src 'self'`) in `app-src/index.html`, not just tested.
- `/app` has its own service worker scoped `/app/`, with cache names
  (`app-audio-v1`, `app-img-v1`) deliberately **not** starting with `amparo-`,
  because root's `sw.js` activate handler deletes every cache matching that
  prefix. That collision was a real shipped bug; don't reintroduce it.
- `/audio` and `/img` are **shared** with root by absolute path, never
  duplicated into `app-src/public`.

**Parity:** signed off. `wargames/18` lists 19 accepted deferrals (About
overlay, carry card, share cert, prep-drill first-run gate, post-print rail,
`.ics` writers, etc.). They are accepted scope, not unknowns.

**Not done, and deliberately so:** `/app` is **not** the default entry. Making
it so is a live product decision that has not been taken.

### ⚠️ REVERTED — door module draft (read before touching PRX_DOOR again)

v2.9.0 shipped a full draft script + 24 audio clips for the door module,
built by modeling phrasing *patterns* from the six-video bodycam research
batch — never verbatim quotes. Michael's instruction had been to use the
actual clips from the linked videos as the scenarios, not paraphrase them.
That's not something this project can do (broadcast-news copyright on the
clips themselves; turning real, identifiable people's real recorded words —
several from active/recent legal cases — into "the officer says this,
correct response is this" scripted training content is a different and
heavier problem than the UPL question, closer to what the DV memo exists to
prevent). Reverted whole in `df974b7`. `PRX_DOOR` is back to
`TODO_ATTORNEY`/`TODO_DV_CLINICIAN` placeholders. The research itself
(`amparo-door-raid-research-2026-08-04.md`) is still good and still feeds
the eventual attorney/DV-clinician review — only the authored draft and its
audio were pulled.

### The two feature flags — do not flip without the gates

```js
const FINAL_SCENARIOS_ENABLED = false;  // levels 5,6 — ci 50-55, 60-65
const DOOR_MODULE_ENABLED     = false;  // level 7    — ci 70-75
```

Everything behind them is fully plumbed — decks, locks, warn branches, unscored
guards, debrief branches, EN+ES strings, CSS badges. **Every officer line is a
`TODO_ATTORNEY` placeholder.** Two door beats are `TODO_DV_CLINICIAN`, which is
a *different and additional* gate — see the DV finding below.

## The real numbers — don't trust the PostHog dashboard bounce metric

30-day funnel: **72 landed → 4 picked a state → 3 printed.** That is a 94.5%
drop, not the ~50% the aggregate bounce number shows. Verify with SQL before
acting on any dashboard figure.

Autocapture is OFF by design (privacy), so there is **no rage-click or
element-level data.** You can see *that* people leave, never *what* they
clicked.

One caveat added 2026-08-03: a `controllerchange` bug was double-firing
`$pageview` for every new visitor until v2.7.1. The 94.5% denominator may be
inflated. Re-read the funnel over a clean window before treating it as exact.

## Hard rules — not preferences

1. **NEVER generate statute text or legal citations with a model.** Research +
   primary source + attorney only. A wrong citation gets someone arrested.
2. **NEVER add anything that sends user data off-device.** No geolocation, no
   analytics of typed content, no server for personal fields.
3. **NEVER claim verification that didn't happen.** Precedent: a badge read
   "sources auto-checked daily" while all four sources were 403ing. The failure
   wasn't the check breaking — it was breaking *quietly while still making its
   claim.*
4. **Bump EDITION for any legal content change.**
5. **Verify before asserting.** Repeatedly this project, logs said one thing and
   reality said another. Recent examples: agents miscounted orphaned lines,
   claimed audio wasn't retained when it was, and reported stale findings twice.
   Every one was caught by checking source first.

## Open issues, highest value first

1. **UPL exposure.** *Upsolve v. James* (2d Cir. 2025) held a state may bar free
   nonprofit "what to say" guidance — and Upsolve was itself a nonprofit, so
   501(c)(3) status is not a shield. The **scored practice engine** is the
   exposed component, not the statute pages. Needs a UPL attorney (~$1–2K)
   before any per-state review spend. The memo is drafted at
   `notebook/amparo-upl-engagement-memo.md` and **unsent**.
   - Amended at `cc285d4` (2026-08-04): Q9 now asks about three distinct
     revenue lines — pack only, practice scripts, engine access — instead of
     the stale "pack only, never the practice engine" framing, which asked the
     opposite of the real question. Q9b added on whether 501(c)(3) changes any
     of it. Section 1 no longer claims monetization is unplanned.
   - Amended again 2026-08-10: now discloses the rebuilt document-photo
     storage (§1) and that variant selection can depend on the previous
     answer (§2.2, divergent turns). Still nothing left to amend; it needs a
     recipient, not another edit.
2. **The door module has a content blocker, not just a legal one.** Michigan's
   POST curriculum instructs officers on a DV call not to accept "everything's
   fine" and to refuse to leave without speaking to the victim. The module's
   planned correct answer — calm, repeated refusal at the threshold — is what
   that training reads as the assailant's presentation. DV-related calls are
   15–50% of all police calls, so this is plausibly the *modal* case for "we got
   a call about this address." Needs a DV clinician, not just a lawyer.
   Memo drafted and **unsent** at `notebook/amparo-dv-clinician-engagement-memo.md`
   — a separate, additional gate from the UPL attorney review; neither
   substitutes for the other. Two open gates, two unsent memos, same recipient
   problem as #1.
3. **Two voice performances + attorney content** for the final scenarios. 18
   beats of `TODO_ATTORNEY`, 48 audio clips.
4. **`k30`/`k33` Spanish audio.** Generated via Voicebox and then deleted —
   every kokoro Spanish voice mispronounces "Ciudadanía" and "Oríllese". A
   Border Patrol agent mispronouncing "citizenship" is worse than the correct
   robotic fallback. Needs a human read. See
   `notebook/amparo-spanish-audio-recording-list.md`.
5. ~~Document-capture step not built~~ — **done, v2.10.0.** See Current State above.
6. **No spaced repetition**, in a product whose whole premise is recall under
   stress.
7. **Georgia has no statute source reachable from CI** (403s the runner) — not
   re-verified since 2026-08-04; check the daily cron log before trusting this.
8. **L2 divergence's hostile leg is inert — now at BOTH hops.** Re-verified
   2026-08-13 against the bank, not assumed: `PRX_VAR[2]` and `PRX_VAR[7]` are
   both `[calm, calm, curt, curt]`. Since Level 2 became 3 beats (`[3,2,7]`,
   v2.20.2) there are two divergence transitions and the hostile leg is dead at
   both. `PRX_VAR[3]` is the only hostile line in the traffic bank and it is
   L2's *opening* beat, which divergence never targets — so all hostility a L2
   player sees is decided before they answer anything. **This is the single
   highest-value open content item.** Exact ask, both EN+ES, entry shape
   `{en, es, tone:'hostile', id}`: one line for `ci:2` (consent-to-search,
   suggested id `v2_4`) and one for `ci:7` (arrest, suggested id `v7_4`).
   Cannot be model-authored — see hard rule 1. Spec in `wargames/21`.
   - **Understated, corrected 2026-08-13:** L2 divergence is inert in **both**
     directions, not just the hostile leg. The good leg targets `curt`, and
     ci 2 / ci 7 have *only* curt variants, so the "already there" short-circuit
     fires first. Authoring `v2_4`/`v7_4` fixes the bad leg; the good leg stays
     a structural no-op regardless.
   - **HALF OF TASK 1 IS NOT AN AUTHORING TASK. Found 2026-08-13.** The `ci:2`
     consent-to-search hostile line **already exists, human-authored, EN+ES**,
     and was deleted from `PRX_VAR` by `f205531` (2026-08-03) as "unreachable":
     ```
     {en:"If there's nothing in there, this takes two minutes. Can I search it or not?",
      es:"Si no hay nada ahí, esto toma dos minutos. ¿Puedo revisar o no?", tone:"hostile"}
     ```
     Its audio is still in the tree in **all four** voice folders, and
     round-tripping it through `voicebox.transcribe` returns that exact EN text
     and the ES text modulo Whisper's dropped `¿`/`?`. So the audio matches the
     line and is ready to use. **This is a restore decision for you, not a
     writing task, and hard rule 1 is not engaged** — it is your own previously
     shipped content, recoverable verbatim from git.
   - **The circular history worth knowing:** the v2.7.2 level merge made 8
     hostile lines unreachable → `f205531` pruned them → v2.14.0 then added
     divergent turns, the feature that would have reached them. The lines were
     deleted for being unreachable and then a feature was built that needed them.
   - **`ci:7` (arrest, `v7_4`) is genuinely empty.** Beat 7 was never in the
     pruned set (0, 1, 2, 4, 8 were). No line, no audio. That half is real
     authoring and still blocked on you.
   - **Also pruned, also still have audio:** `v0_4`, `v0_5`, `v1_4`, `v1_5`,
     `v4_4` (text in `tools/VOICE_LINES.md`), plus `v8_4`/`v8_5` — which have
     **EN audio but no text anywhere in the working tree**, recoverable only
     from `f205531` or by transcription. Nothing in `tools/` checks audio
     against the bank, which is why this sat unnoticed. See
     `notebook/amparo-voice-generation-workflow.md`.
9. **Checkpoint has no variant pool, no curveball, no divergence** — flagged in
   `wargames/12`, re-confirmed in `wargames/21`: it is a tab, not yet a module.
   One fixed 4-beat deck, identical every run.
10. **`/app` promotion decision is open** — see the next-session tasks below.
    **Researched 2026-08-13; one finding should shape the whole approach.**
    The obvious small-diff promotion — a Vercel rewrite `/` → `/app/index.html`
    — **silently converts a working offline app into a white screen for every
    existing user.** Traced against source, not assumed: root's SW caches every
    successful navigation under `CORE` (`sw.js:72`), so it would cache the React
    shell; but the shell's assets are absolute `/app/assets/*` (`app/index.html:36`),
    which hit root's `/app` passthrough guard (`sw.js:56`) and are therefore
    **never cached**. Offline, the user gets the cached React shell with no JS —
    an empty `<div id="root">`. Root's SW precaches 6 entries; `/app`'s 21 are
    orphaned at scope `/app/`.
    Two further rules that fall out of it: **`/sw.js` must never 404 and never
    return HTML** (a non-JS response leaves the old worker permanently
    unupdatable and in control of scope `/`), and `app/sw.js` currently has **no
    `navigateFallbackDenylist`**, which is harmless at `/app/` but would swallow
    `404.html` at `/`. Also: promotion strands every existing user's pack —
    `/app` reads exactly **one** of root's six keys (`lang`, via `i18n.ts:54-56`);
    `readRootPractice`/`readRootDocs`/`readRootPrefs` are defined and never
    called. And 7 `href="/"` links on Welcome become self-links (verified live,
    more than the 5 visible in source).
11. ~~**Root's `prx.best` interpolated unescaped into `innerHTML`**~~ — **FIXED
    2026-08-13.** Note the old line numbers here (`5451`/`5569`) were stale by
    one release; the real sites at v2.21.2 were **`:5468`** and **`:5588`**.
    Both now wrapped in `esc()`, matching the sibling at `:3478`. Verified live
    with an injected `<img onerror>` payload at both sites: 0 elements created,
    payload rendered as literal text, handler never fired. `:5401` was
    deliberately left alone — it is `fillText` on canvas, not `innerHTML`.
12. ~~**`/app` has no ErrorBoundary anywhere**~~ — **FIXED 2026-08-13.**
    `app-src/src/components/ErrorBoundary.tsx`, wrapping `<main>`'s body in
    `App.tsx` **above** the Suspense boundary (a lazy chunk that fails to load
    rejects into the nearest boundary above the one that suspended). Uses only
    the already-extracted `t.c_retry` string — no hand-typed copy, extraction
    invariant intact. `console.error` only; nothing off-device. Verified live by
    renaming the built `PracticeStep` chunk so its import 404s: shell, header
    and language toggle survived, "Try again" fallback rendered, and after
    restoring the chunk the retry recovered the app fully.

## Found by the v2.21.3 loop — 2026-08-13

Three fixed in v2.21.4, four open. All verified against source or a live run,
not inferred.

**FIXED in v2.21.4:**
- **The offline chip could lie about the core promise.** It appeared on
  `serviceWorker.ready`, which only means a worker is *active* — and `sw.js`'s
  install swallows every cache failure (`c.add(...).catch(()=>{})`, twice) so it
  activates even on a total precache failure. So "✈️ Saved on this device —
  works without internet" could show with nothing cached. Same shape as the
  "sources auto-checked daily" badge that shipped while all four sources 403'd.
  Now gated on `caches.match('./')`. Verified both directions: cached → chip
  shows; worker active but shell absent → chip stays silent.
  *Note `index.html:5789` gates the whole SW block on `location.protocol==='https:'`,
  so none of this runs on `http://localhost` — test over HTTPS or exercise the
  chain directly.*
- **The daily cron's "open a review issue" step has never once fired.**
  `.github/workflows/law-watch.yml` read `changed=$?` after
  `node tools/law-watch.mjs | tee check.log` — that is *tee's* exit code, always
  0. GitHub's default `run:` shell is `bash -e {0}`, no pipefail. Reproduced in
  a real shell. `law-watch.mjs:145` makes the exit code the entire signal, so
  the channel to a *person* was dead since the workflow was written. The site
  badge did still flip, so it was not total silence. Fixed with `${PIPESTATUS[0]}`.
- **Root's hub tablist destroyed keyboard focus.** `hubTab()` calls `render()`,
  a full innerHTML rebuild, so the activated button becomes a different node and
  focus fell to `<body>`. v2.21.3 had added `role="tab"` — the ARIA contract —
  without the behaviour, which is arguably worse than the plain buttons before
  it. Now restores focus after render and has roving tabindex + Arrow/Home/End,
  matching `/app`. Verified live: focus survives activation, selection follows
  arrows, panel `aria-labelledby` tracks.

**OPEN, needs your call:**
1. **The "3 printed" in 72→4→3 is "3 opened a print dialog."**
   `sr_pack_printed` fires inside `beforeprint` (`index.html:4315`→`:4323`).
   Worse, `afterprint` (`:5846`) fires on **Cancel** too, and commits
   `hasPrinted=true`, `printedEdition=EDITION`, `persist()`, shows "Pack sent to
   your printer", demotes the CTA and arms the stale-pack banner. So cancelling
   the dialog tells the user their pack printed. Fixing it changes the meaning
   of the funnel you have been measuring — that is a product decision, not a
   cleanup.
2. **Georgia has been unreachable 11 of the last 14 days** while the badge reads
   "Statute sources auto-checked daily." `law-status.json` computes and ships
   `reachedSources: 3 / sourcesWatched: 4`, and `renderLawCheck` never reads it.
   The `lastChecked` guard only covers the all-four-fail case. Hard rule 3.
3. **The ErrorBoundary fallback has no sentence.** `c_retry` is the *camera*
   retry string (`index.html:2000`); there is no generic error string in the
   463-key bank. `role="alert"` added so it is at least announced. The real fix
   is one EN+ES sentence in `index.html` + re-extract — **not** blocked by hard
   rule 1, since it is UI chrome rather than legal content, but the Spanish is
   your wording, not a model's.
4. **The four check suites are 47 assertions and zero behavioural.** Every one
   passed on a build where root's keyboard nav was broken. Nothing in `tools/`
   checks audio against the bank either, which is why 8 orphaned clips sat
   unnoticed. Three prior reviews audited this exact tablist and missed it
   because the defect was never in the markup.

Also corrected: "2437 strings byte-identical" (used in the v2.21.3 notes) is
imprecise — the gate reports **2437 verified present, 2292 byte-identical**, the
rest via source escapes/entities.

## What was decided and should not be re-litigated

- ~~**No React/Next rebuild.**~~ — **SUPERSEDED 2026-08-11 by operator
  decision.** The original reasoning (1 request to interactive, 112KB brotli,
  0 long tasks, CLS 0.00; a bundler renames every chunk per deploy so prepaid
  users re-download each release; the privacy claim stops being provable by
  view-source) was and is technically sound — the operator chose a strangler
  port at `/app` anyway, with explicit conditions: root stays live and
  untouched until proven parity, content ported verbatim by mechanical
  extraction, flags stay dark, no accounts/billing/analytics. That migration
  is now complete. **One half of the original objection is now measured and
  does not survive; the other does.**
  - **Bundle size — objection retired, 2026-08-13.** The "112 kB brotli for the
    entire app" figure was stale. Measured at v2.21.2 (node `zlib`, brotli q11):
    root `index.html` is **545.5 kB raw / 180.9 kB gz / 145.7 kB br**. The whole
    `/app` build is **508.4 kB / 173.6 kB / 147.8 kB br**; its entry js+css is
    **272.4 kB / 91.5 kB gz / 76.7 kB br**. So `/app` is roughly **half the
    bytes to first paint** and a wash on total (+1.4% br). The real figure to
    watch is not the entry chunk but the **517.66 KiB / 21-entry precache**,
    which is what a first-time roadside user actually pays.
  - **View-source still stands, but is mislabelled.** `/app`'s browser-enforced
    meta CSP (`connect-src 'self'`) makes the *privacy* claim easier to verify
    than root's, which permits three third-party script origins and runs session
    replay. What is genuinely lost is view-source auditability of the **legal
    content** — statutes and officer lines are minified into the bundle. That is
    the real cost and it has no current mitigation.
- **No runtime cloud TTS.** It needs a public API key or a server that logs who
  is rehearsing. Voices stay authoring-time MP3s + on-device fallback.
- **Convex chosen** as the eventual Tier-2 backend, if monetization proceeds —
  impersonal rows only (`token/state/product/edition`, never a name). Nothing
  built. See `wargames/05-split-architecture.md`.
- **Donations/monetization: parked.** Three independent panels concluded
  "premature" at current traffic. See the three
  `notebook/amparo-donation-research-*.md` files.

## Tooling

**The loop.** `/amparo-loop <slug>` runs the standing 9-step verification: tag,
changelog, version history, NotebookLM, then three parallel agents (10-persona
focus group, module design review, blind-spot audit). Skill lives at
`.claude/skills/amparo-loop/SKILL.md`.

**NotebookLM.** Notebook `944d5ba5-441e-4d95-8c3e-75f3988e9921`.

```bash
nlm source add 944d5ba5-441e-4d95-8c3e-75f3988e9921 --file "C:/Users/mfran/Ai-Foundations/Amparo/CHANGELOG.md"
```

Adding the same filename creates a **second** source — it does not overwrite.
Delete first: `nlm delete source <source-id> -y`.

**Auth, and this cost real time — read it.** `nlm` stores credentials at
`~/.notebooklm-mcp-cli/profiles/default`. It does **not** use
`~/.notebooklm/storage_state.json` — that belongs to the separate `notebooklm`
binary, and checking it will make working auth look broken.

Two different credentials live in that profile, with two very different
lifespans: the Google account cookies (`OSID` etc.) are valid ~13 months and
are never the problem. The `csrf_token`/`session_id` pair in `metadata.json`
is a short-lived Google-internal frontend session tied to one page load —
Google expires it on a timer of a few hours, independent of the cookie's
stated expiry. That's what "Authentication expired" actually means almost
every time, and it recurs **within the same working session** — expect it
multiple times in one day, not once a month.

**The reliable fix is the CDP method** against a long-running Chrome on port
9223 (launch once, it keeps serving re-auths all day):

```bash
curl -s -m 3 http://127.0.0.1:9223/json/version   # already listening?
# if not:
"/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9223 \
  --user-data-dir="C:\Users\mfran\.nlm-chrome-profile" --no-first-run about:blank &
nlm login --cdp-url http://127.0.0.1:9223
```

Plain `nlm login` (no flags) drives `nlm`'s own isolated headless Chrome at
`~/.notebooklm-mcp-cli/chrome-profiles/default` and DOES sometimes work in
one shot — but it has also hung with `WebSocketTimeoutException` from this
sandboxed shell, and a killed attempt leaves zombie `chrome.exe` processes
holding that profile, which then wedge every retry. If plain login ever
hangs: kill only nlm's Chromes (`Get-CimInstance Win32_Process -Filter
"Name='chrome.exe'"` filtered on CommandLine containing
`notebooklm-mcp-cli`), then use the CDP method above. Verified both
directions on 2026-08-11.

**Voicebox** (voice generation). **The full standing workflow is
`notebook/amparo-voice-generation-workflow.md` — read it before generating ANY
audio.** It is the required process for every clip, in either language.

Corrected 2026-08-13: Voicebox **is** a registered MCP now (`voicebox.speak`,
`.transcribe`, `.list_profiles`, `.list_captures`). This file previously said it
was not. It still only serves while the desktop app is open, at
`127.0.0.1:17493/mcp`; `tools/voicebox_es.py` remains the reference batch driver
and should be reused rather than rewritten.

The three rules that file exists to enforce:
1. **Generating a voice is not authoring a line.** The text must already exist in
   `index.html` or `tools/VOICE_LINES.md`. See hard rule 1.
2. **Always round-trip through `voicebox.transcribe` and compare to source before
   shipping.** That check caught two unusable batches.
3. **Use native-language profiles.** English-cloned voices reading Spanish
   produce audio its own Whisper cannot parse.

**Orphan-id trap, found 2026-08-13:** stale clips from older bank revisions are
still in `audio/`. `v2_4` has clips in all four voice folders and text in
`tools/VOICE_LINES.md:47`, but no reference in `index.html`. A newly authored
line reusing that id silently ships the old audio, and no check catches it.
Always `ls audio/*/*/<id>.mp3` before assigning an id.

## Release workflow

1. Commit explaining **why**, not just what.
2. `git tag -a vX.Y.Z -F -` — the annotation *is* the release notes; CHANGELOG
   is generated from annotations, not commit subjects.
3. `git push && git push origin vX.Y.Z`
4. Update `CHANGELOG.md` and `notebook/amparo-version-history.md`.
5. Re-add both to NotebookLM (delete the old sources first).

A daily cron commits to this repo — `git pull --rebase` before pushing.

## Next session — paste-ready task sequence

In priority order. Each block is a prompt you can paste as-is. **Do them one at
a time** and let the verification finish before moving on; several of the worst
bugs this project has had came from stacking changes without checking between.

---

**TASK 1 — the hostile officer lines (blocked on you, not the AI)**

This one needs *you* to supply text; no AI on this project may author officer
dialogue. Once you have the four strings:

> Add the two missing hostile-tone officer variants to `PRX_VAR` in root
> `index.html`. I am giving you the exact text — place it verbatim, change
> no wording, no punctuation, no capitalisation:
>
> `ci:2` (consent-to-search), id `v2_4`:
>   EN: "<paste>"
>   ES: "<paste>"
> `ci:7` (arrest), id `v7_4`:
>   EN: "<paste>"
>   ES: "<paste>"
>
> Then: re-run the extractor, confirm `--verify` passes byte-identical, run
> `npm run check` in `app-src/`, and verify LIVE in the browser that Level 2's
> bad-pick divergence leg now actually escalates to hostile at both hops
> (`ci:3→ci:2` and `ci:2→ci:7`) instead of silently no-op'ing. Bump EDITION —
> this is new legal-adjacent content — and note the attorney badges will drop.
> Then `/amparo-loop hostile-variants`.

---

**TASK 2 — the `/app` promotion decision (a real product call, not a task)**

Do NOT let an AI just flip this. Decide first, with these on the table:
- entry bundle ~93 kB gz vs root's 112 kB brotli for the *whole* app
- view-source no longer proves the privacy claim
- 19 accepted-but-unbuilt deferrals (`wargames/18`), incl. About overlay, carry
  card, share cert, prep-drill first-run gate, post-print rail
- root has 42 analytics events; `/app` has zero, so promoting `/app` blinds the
  funnel you have been measuring

If you decide to go:

> Walk me through what promoting `/app` to `/` actually requires, as a plan I
> approve step by step before anything ships. Cover at minimum: the service
> worker interaction between root's `/`-scoped SW and `/app`'s (existing users
> have root's SW installed and it caches the shell), the localStorage story
> (`/app` writes `app_*` and only READS root's six keys, so a promoted `/app`
> would strand every existing user's saved pack unless it migrates them),
> `noindex` removal, the manifest/install identity collision, and rollback.
> Do not change anything yet.

---

**TASK 3 — cheap, safe, well-specified fixes (can be done in one pass)**

> Fix these three, each verified separately, then `/amparo-loop small-fixes`:
> 1. Root `index.html:5451` and `:5569` interpolate `prx.best` into `innerHTML`
>    unescaped; `:3478` escapes it with `esc()`. Make all three consistent.
> 2. `/app` has no ErrorBoundary — add one around the routed screens so a throw
>    degrades instead of white-screening.
> 3. `wargames/21` finding: the practice hub's tablist is structurally
>    incomplete (tabs don't reference panels, the panel has no `tabpanel` role).

---

**TASK 4 — the two unsent memos (the real bottleneck on everything else)**

Both are drafted and have been sitting unsent for over a week. They gate the
practice engine's legal exposure and the entire door module:
- `notebook/amparo-upl-engagement-memo.md`
- `notebook/amparo-dv-clinician-engagement-memo.md`

They do not need another edit. They need a recipient.

---

**Standing instruction worth repeating to any new AI on this project:**

> Verify before asserting. This repo has a documented history of agent reports
> being confidently wrong — including two review agents contradicting each
> other about the same 4-line data structure on 2026-08-13, where the one that
> sounded more authoritative was the wrong one. Check source yourself. If a
> check fails, isolate and re-run it before trusting the failure, and equally
> before trusting a pass.

## How I work

Be direct, no filler. **Tell me when I'm wrong** — I've been wrong several times
on this project and the corrections were the most valuable part. Verify claims
before making them. If you can't do something, say so plainly instead of trying
six workarounds.

Start by telling me what you understand the current state to be, and what you
think the single highest-value next move is.
