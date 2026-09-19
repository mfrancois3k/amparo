# Amparo blind-spot / architecture audit — v2.31.0 (commit 47ee601)

Date: 2026-09-19
Scope: hostile principal-engineer review of the v2.31.0 changes (first-run practice hero + restored homepage analytics).
Method: every finding checked against source in the working tree and against `git show`/`git log`. `node tools/check-inline-scripts.mjs` run clean. No browser was launched — items that need a running browser or a deployed rehearse hub are marked **UNVERIFIED**.

---

## CRITICAL

### C1 — The published privacy policy is now factually false: it says autocapture is OFF; the homepage runs autocapture:true
- **Evidence:**
  - `new/index.html:42` — `autocapture:true` (PostHog init, real project key `phc_y5Lz…`, api_host `https://ph.amparohq.com`).
  - `privacy/index.html:63` — "…and automatic event capture is off."
  - `privacidad/index.html:63` — "…y la captura automática de eventos está apagada."
  - `new/index.html:30` (dev comment) already admits it: "autocapture is ON per the first-run rebuild spec so hero taps and clicks are measurable."
  - `new/index.html:18` — stale/false comment `<!-- No marketing analytics on this page. -->` sits directly above the analytics block.
  - Homepage's own privacy copy `new/index.html:689` (`privacyBody`) describes only "anonymous, non-identifying usage — how many packs get built, and in which state," i.e. counts, not automatic click capture.
- **Why it's CRITICAL:** autocapture:true captures every click/DOM-interaction automatically — that *is* "automatic event capture." For a privacy-forward legal-preparedness tool aimed at a vulnerable audience, shipping a privacy statement that is provably false is a trust/legal-exposure issue, not a cosmetic one. `person_profiles:'identified_only'` keeps it anonymous but does **not** make the "off" claim true.
- **Minimal honest fix (recommended):** set `new/index.html:42` `autocapture:false`. The hero's own metrics do **not** need autocapture — every hero interaction already fires an explicit named event via `window.ph()` (`hero_answer_tapped` :574, `practice_line_answered` :575, `sr_practice_level_done` :592). So `autocapture:false` restores the privacy copy to true **and** keeps hero taps measurable. Then delete the false comment at line 18. (Alternative — rewrite all three privacy texts to declare autocapture on — is more surface area and worse for a privacy-marketed product.)

---

## HIGH

### H1 — /pack (the primary build funnel) and /aid are analytics-blind since 275ae3e and were never restored; the pack privacy claim about session replay is also now false
- **Evidence:**
  - The PostHog loader/init and project key exist in **exactly one deployed file**: `new/index.html`. Repo-wide, `phc_y5Lz…` matches only `new/index.html`.
  - `pack.html` references `window.posthog` in 6 places but **never loads or inits it**: `ph()` helper `pack.html:1242`, `srReplayGuard` start/stop `pack.html:3062,3065`, `sr_sample_viewed` `pack.html:3421`. There is no `posthog.init(`, no `phc_` key, no `array.js` loader; its only `<script src>` is `us-paths.js` (`pack.html:1365`). So `window.posthog` is always undefined on /pack → every `ph('sr_*')` silently no-ops.
  - `new/aid.html` has zero PostHog (`new/aid.html:27` comment "Marketing analytics disabled").
  - `git show 275ae3e --stat` confirms that commit ("cinematic Amparo homepage") is what stripped it: `pack.html | 152 ++----`, `new/aid.html | 26 +--`. 47ee601 restored only the homepage.
  - Consequence for the privacy doc, in the *other* direction: `privacy/index.html:63` promises "Session recording is off everywhere except the pack builder's first two screens, where it runs with every text input masked." With no posthog on /pack, `srReplayGuard()` returns at `if(!window.posthog) return` (`pack.html:3060`) — that recording never runs. The privacy doc describes collection that does not happen.
- **Impact:** the entire pack-build conversion funnel (`sr_step_viewed`, `sr_finish_reminder`, `sr_arena_opened`, `sr_reminder_downloaded`, …) has recorded nothing since 2026-09-13, while the homepage funnel top is now instrumented — so the funnel is measured at the mouth and dark everywhere it converts. `/aid` (legal-aid page) is likewise invisible.
- **Fix:** re-add the same guarded PostHog loader block from `new/index.html:32-53` to `pack.html` (with `autocapture:false`, replay scoped as the code already expects) and to `new/aid.html`. Then re-verify the privacy copy matches actual behavior on all three pages.

---

## MEDIUM

### M1 — Hero feedback is never announced to screen readers; the learning content is silent
- **Evidence:** `new/index.html:489` `<div class="rep-fb" data-rep-fb hidden>` has no `aria-live`/`role="status"`. On answer, all answer buttons get `disabled` (`:571`) and focus jumps to the Next button (`:580`). Disabled buttons drop out of the AT/focus order, and the feedback paragraph (Good/Risky + the "why") is not a live region, so a screen-reader user hears "Next, button" and none of the feedback — which is the entire point of the rep.
- **Fix (one line):** add `role="status"` (or `aria-live="polite"`) to the `.rep-fb` div at `:489`.

### M2 — Completing the hero changes page height but never calls ScrollTrigger.refresh(), so the pinned film's scroll math can drift — UNVERIFIED
- **Evidence:** `.rep` is a normal in-flow block above `<main>` (`new/index.html:475` vs `:505`), not a fixed overlay. `finish()` (`:587-593`) hides the Q&A and reveals the done panel, changing the hero's height. The film's pin is `ScrollTrigger.create({trigger:root,start:'top 64px',end:'bottom bottom',invalidateOnRefresh:true})` (`new/cinema-motion.js:137`); ScrollTrigger caches start/end pixel positions and only recomputes on refresh (it refreshes on resize `:156`, and render() re-mounts on lang/FAQ change). Nothing calls `ScrollTrigger.refresh()` when the hero finishes, so the cached start for the film can be stale by the hero's height delta → possible pin jump/misalignment for a user who completes the hero then scrolls into the film.
- **Could NOT verify:** needs a real browser scroll session (GSAP + ScrollTrigger); reasoned from source only.
- **Fix (one line):** at the end of `finish()` add `try{window.ScrollTrigger&&ScrollTrigger.refresh();}catch(e){}` (or dispatch a `resize`).

### M3 — Hero events squat the rehearse product's `sr_practice_*` namespace with hardcoded state/level; latent funnel-pollution collision
- **Evidence:** hero fires `sr_practice_level_done {level:1,state:'federal',lang}` (`:592`) and `practice_line_answered {level:1,line,answer_id,correct}` (`:575`). The rehearse/practice build uses the identical `sr_practice_*` family with **real** state — e.g. `sr_practice_level_started`/`sr_practice_choice {level,state:data.state,lang}` (seen in `.claude/worktrees/agent-…/index.html:4883,5715`). pack.html owns the same `sr_` event namespace (`sr_finish_reminder`, `sr_arena_opened`, … `pack.html:2138-2562`). So the hero has claimed a generic completion-event name used by the actual practice product and seeds it with `state:'federal'`, `level:1` — once the real practice hub is live, "sr_practice_level_done" merges marketing-page skimmers who tapped 3 canned lines with genuine practice completions, corrupting the completion funnel.
- **No live double-fire today:** the only other emitter of `sr_practice_level_done` is a git **worktree** (not deployed), so there is no double-count in production right now — **UNVERIFIED** whether/when the rehearse hub deploys those events.
- **Fix:** namespace the hero's events (e.g. `home_hero_level_done`) or drop `state:'federal'`/`level:1` and mark `source:'home_hero'` so they never merge with real practice completions. `hero_answer_tapped` is hero-specific and fine.

---

## LOW

### L1 — "Hear the line" is permanent dead UI
`new/index.html:486` `<button class="rep-play" … data-rep-play hidden>` ships `hidden`; no JS ever un-hides it and no audio is wired (`finish()` only hides it again `:588`). Either wire audio or delete the button + its `.rep-play` CSS.

### L2 — Stale/false comments
`new/index.html:18` "No marketing analytics on this page." (false — analytics block is right below). `new/index.html:29` "Config identical to pack.html's" (false — pack.html now has no PostHog config at all; see H1). Delete/correct both.

### L3 — Two independent language states on the homepage
The hero's EN/ES (`data-rep-lang`, listener `:594-600`) is separate from the page bar's `setLang()`→`render()` (`#langEN/#langES`, `:396-397`). Switching one does not update the other, so the hero can sit in EN while the film/nav are ES. Cosmetic but visible.

### L4 — Weak focus targets / aria on the rep
`finish()` moves focus to the bare `.rep-done` container div via `tabindex=-1` (`:590）` with no heading role — better to focus the `<h2 data-rep="doneTitle">` inside. Answer buttons use `aria-pressed` (`:561,572`) which denotes a toggle button; a radio group (or `aria-checked`) better matches "pick one answer."

---

## Notes / things that are actually FINE (checked, not findings)

- **SW / returning visitors (#4):** `sw.js` navigations are **network-first** (`:89-113`); `/` is not `isPack` so it is fetched fresh every online load. Returning online visitors **do** get the new hero. Only the offline fallback serves the precached `./` shell (`:6,28`) which predates the hero — expected and acceptable for an offline fallback. No stale-SW bug.
- **render() vs cinema motion:** `render()` correctly calls `AmparoCinemaMotion?.dispose()` then `mount()` (`new/index.html:1084,1107`), and the hero lives outside `#app`, so rebuilding `#app` neither orphans the film's ScrollTrigger nor destroys the hero. Good.
- **`.rep [hidden]{display:none!important}` (`:432`):** correct defensive override — `.rep-fb/.rep-next` etc. carry display rules that would otherwise beat the default `[hidden]`.
- **CSP (`vercel.json:9`):** `script-src`/`connect-src` correctly allow-list `ph.amparohq.com`, `us.i.posthog.com`, `us-assets.i.posthog.com`; the loader's `api_host.replace('.i.posthog.com','-assets.i.posthog.com')` is a no-op for the proxied host, so array.js loads from `ph.amparohq.com/static/array.js` (allowed). No CSP break from the restored analytics.
- **check-inline-scripts:** clean (`new/index.html: checked 5 inline scripts`, exit 0).

## Could NOT verify (no browser run)
- M2 (ScrollTrigger drift after hero completion) — needs a live GSAP scroll session.
- M3 live collision — depends on whether/when the rehearse practice hub (currently only in a worktree) deploys `sr_practice_level_done`; no production double-fire today.
