# Amparo blind-spot / architecture audit — v2.32.1 (commit 049ff4c)

Date: 2026-09-19 (second pass)
Scope: hostile principal-engineer review of v2.31.1 → v2.32.1 — the analytics
restore (fc38c96), the level-done state picker (95d3e2c), and the "Welcome back"
return loop (049ff4c). Read the first pass (`amparo-blindspot-audit-2026-09-19.md`)
first; its C1/H1 are now FIXED (see below) and are not re-raised.
Method: every finding checked against source in the working tree and `git show`.
Ran `node tools/check-inline-scripts.mjs` (clean) and `node tools/test-arena-deeplink.mjs`
(16/16). No browser launched — runtime-only items marked **UNVERIFIED**.

---

## Prior findings now resolved (verified)

- **C1 FIXED** — `new/index.html` PostHog init is `autocapture:false` (fc38c96). Hero
  still measures via named events (`hero_answer_tapped` :595, `practice_line_answered`
  :596). Stale "No marketing analytics" comment gone.
- **H1 FIXED** — `pack.html` (:1246-1263) and `new/aid.html` now carry the same guarded
  init; `srReplayGuard()`/`ph()`/event callers finally have a real `window.posthog`.
  `pack.html:3744 srReplayGuard(step)` arms replay on load for the restored step; init
  sets `disable_session_recording:true` + `maskAllInputs`, guard starts recording on
  steps 0-1 and permanently stops at ≥2. Privacy copy now matches behavior.

---

## CRITICAL
None.

## HIGH
None. The three feature commits are functionally sound; no data-loss, security, or
broken-flow defect found.

## MEDIUM

### M1 — Practice-completion metric is 100% homepage 3-tap taps; the real practice product is analytics-dark
- **Evidence:** the only production emitter of `sr_practice_level_done` is the homepage
  hero — `new/index.html:614 ph('sr_practice_level_done',{level:1,state:'federal',lang})`.
  The Arena (`arena/index.html`) loads **no** PostHog (grep `posthog.init|phc_` = 0), and
  `pack.html` does not emit that event. So the `sr_practice_*` completion funnel is fed
  entirely by marketing-page skimmers tapping 3 canned federal lines, seeded
  `state:'federal', level:1`. This is the prior audit's M3 namespace-squat, **deliberately
  retained** ("Kept per spec: sr_practice_level_done", fc38c96), now confirmed as the
  *sole* source.
- **Fix:** rename to `home_hero_level_done` or add `source:'home_hero'` so it never merges
  with genuine practice completions if the Arena ever gets instrumented.

### M2 — The state-aware handoff dead-ends at the Arena door (funnel goes dark where it converts)
- **Evidence:** the level-done state picker fires `state_selected_after_level {state,lang}`
  on click (`new/index.html:626`) and deep-links to `/rehearse?state=XX`. `/rehearse`
  rewrites to `arena/index.html` (`vercel.json:181`), which loads no analytics. So you can
  see who *chose* TX/GA/NY on the homepage but have zero visibility into whether the
  state-aware drill they were handed to produced any practice — the exact "measured at the
  mouth, dark where it converts" pattern the first audit flagged for /pack, now on the
  practice funnel. This is a deliberate privacy tradeoff (privacy copy: "the Practice Arena
  loads no analytics at all"), so it is a **blind spot to acknowledge**, not a bug.

### M3 — Language toggle on the "Welcome back" screen runs renderLine(); safe only by accident
- **Evidence:** the lang-toggle handler is `setChrome(); if(els.done.hidden){ renderLine(); }`
  (`new/index.html:621`). When the welcome panel is shown, `els.done` is hidden, so
  `renderLine()` **runs**. It is harmless today only because `renderLine()` (:575-588)
  rebuilds buttons inside the still-hidden `.rep-answers` and never un-hides the play
  containers that `showPlayHidden(true)` (:628) hid. A future refactor that makes
  `renderLine()` un-hide `.rep-answers`/officer would duplicate the drill on top of the
  welcome panel.
- **Fix:** extend the guard — `if(els.done.hidden && (!els.welcome || els.welcome.hidden)){ renderLine(); }`.

## LOW

### L1 — Orphan STR key `dots`
`new/index.html` STR carries `dots:'Line '/'Frase '` but nothing consumes it (no `S.dots`,
no `data-rep="dots"`; `dots()` :571 ignores it). Pre-existing dead key — delete.

### L2 — `.rep-play` dead residue
The "Hear the line" button markup is gone (prior L1 partially cleaned), but the CSS rule
`.rep-play` (`new/index.html:440`) and `finish()`'s `.rep-play` querySelector (:610) remain
and now match nothing. Cosmetic dead code — drop both.

### L3 — Reassurance line lingers on the welcome screen
`showPlayHidden()` does not hide `.rep-foot` ("Free. No account. 2 minutes.") or `.rep-watch`,
so a returning "Welcome back" visitor still sees the first-time reassurance copy under the
panel (`new/index.html:507,521`). Slightly incongruent; cosmetic.

---

## Verified FINE (checked, not findings)

- **#1c autocapture:** `false` in all three inits (index, `pack.html:1259`, `aid.html`).
- **#1d double-init:** exactly one real `posthog.init(` per file. `grep -c` reported 2 in
  pack.html only because `pack.html:3079` mentions `posthog.init()` inside a comment. No
  double-load; no second `array.js` loader.
- **#1e CSP:** `vercel.json:9` allows `https://ph.amparohq.com` + `https://us-assets.i.posthog.com`
  in `script-src` and (+`us.i.posthog.com`) in `connect-src`. All three pages proxy the same
  host — covered.
- **#2 privacy consistency:** EN `privacy/` + ES `privacidad/` now state homepage/pack/aid
  anonymous usage, autocapture off, replay on pack's first two screens masked, Arena none —
  matches the actual init configs and `srReplayGuard`.
- **#3 state picker → Arena:** `/rehearse` rewrites to `arena/index.html` (query preserved);
  `resolveState()` reads `?state` (`arena/index.html:2274`), upper-cases, checks `HUD.states`.
  TX/GA/NY all present in `data/hud.json` (51 states). Landing sets `A.state`, `bridgeFlow()`
  hides the setup gate and renders the **state-specific** reference lines — it does NOT replay
  the federal 3-line intro. The module/FG "handoff replays the same 3 lines" concern is
  **resolved**. (It pre-selects state + reveals drills; the user still picks a scenario — no
  auto-start, which is fine.) `CITED=['36','48','13']` = NY/TX/GA FIPS, so the "statute-cited"
  note is accurate.
- **#4 return loop:** `finish()` writes `amparo_progress.l1` (`new/index.html:613`) so the loop
  fires from homepage use alone. On load, `l1` → `showWelcome()` (hides play, shows welcome,
  done stays hidden); else `renderLine()`. No state shows both, or both hidden (`els.welcome`
  always resolves). Start-over (:630) hides welcome, `showPlayHidden(false)`, `i=0`,
  removes `data-locked`, `renderLine()` — reset + unlock confirmed. `amparo_progress` is read/
  written only by the homepage (no Arena clobber).
- **#5 regressions:** hero `<section class="rep" id="first-rep">` (:485) sits before
  `<main id="app">` (:524), so `render()`/cinema re-mount can't orphan or destroy it.
  `check-inline-scripts.mjs` clean (pack 3, index 5, arena 4, aid 2). `doneFull` removed and
  referenced nowhere. Hero lang toggle drives page `setLang()` (:622).

## Could NOT verify (no browser run)
- Prior M2 pin-drift: `finish()` now calls `ScrollTrigger.refresh()` (`new/index.html:615`),
  but the actual pin-alignment fix is reasoned from source, not a live GSAP scroll session.
- Live PostHog delivery (events actually reaching `ph.amparohq.com`) and that replay
  starts/stops on the real first two pack screens.
- Visual rendering / reduced-motion of the welcome + state-picker panels.
