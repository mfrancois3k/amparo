# Amparo — focus group 05: hub reachability fixes, mute, the merged ladder, and the door tab

Date: 2026-08-03. Run against commit `60ae7bc`, tag `v2.7.2`.
Ten personas drawn from `.focus-group/members.md` (13 saved).

**Method note.** Every claim below about source is grepped or read directly out of
`index.html` at `60ae7bc` and carries a line reference. Where a commit message
(`2160b40`, `dbb2154`, `8ce9639`, `9fcd5d6`, `60ae7bc`) claims something was
"verified in-browser," that claim is independently re-derived from source here
rather than taken on trust. I additionally opened `index.html` in a sandboxed
local-file preview and live-tested four things where a live DOM beats a static
read: the `#stateSearch` accessible name, the mute toggle (state, label,
`aria-pressed`, `localStorage`), the hub's rendered progress-bar/done-badge
markup, and general interactivity. That preview tool disclosed up front that
local files render as a **static snapshot**, and `location.reload()` inside it
did not reliably reset in-memory state — so I use it only for point-in-time DOM
checks (which worked correctly and are marked "live-confirmed" below), not for
click-through funnel testing across page loads. Funnel/reachability claims are
therefore verified by reading the actual conditional branches in source, the
same standard FG04 used. Anything neither grepped nor live-checked is marked
NOT VERIFIED.

**Roster.** Same three dropped as FG04 and for the same reason — their defining
issue is untouched by this round: **Ana** (federal-only framing, unchanged),
**Marisol** (Spanish parity — re-spot-checked this run across ~20 new v2.7.1/
v2.7.2 key pairs, all present, see check 45), **Ray** (audience-boundary
question, unchanged). Seated this run, in rough order of how much this round
moved them: Marcus, Keisha, Wes (the three whose headline blocker was
reachability), Rosa, Luis (mute + reachability, standing asks unchanged), Dana
(the progress-bar fix), Omar (accessibility, partial win), Tony (positioning
skeptic), Nia (the mute test case), Devin (unchanged, and worse for it — see
§6).

---

## 1. What was verified

### The four mandated re-checks

| # | Check | Where | Result |
|---|---|---|---|
| 1 | Hub reachable from landing, no printer | `2731` | `<button class="btn ghost" onclick="goM(5)">${_t.w_try}</button>` — unconditional, no `hasPrinted` gate at all. **Fixed.** In v2.7.0 this button opened the overlay via `practiceIntroOpen()`-adjacent code; it now navigates straight to step 5, the hub. |
| 2 | Hub reachable post-print, zero scenarios done | `2854–2856` | Inside `postPrintActions` (gated `hasPrinted&&!isDemo`, `2853`), the zero-progress branch's gold CTA is `onclick="goM(5)"`. **Fixed**, unchanged in mechanism from FG04's read, now on the correct step. |
| 3 | Hub reachable post-print, ≥1 scenario done | `2857` | The returning-user `arow` is now `onclick="goM(5)"`. FG04 (check 8) found this called `practiceOpen()` directly, i.e. the overlay, permanently bypassing the hub the instant a user finished one scenario. **Fixed** — this was the single highest-severity defect FG04 found and it is closed. |
| 4 | Resume guard reaches step 5 | `3008` | `if(s.step>=1&&s.step<=5&&s.state) window.__resumeStep=s.step;` — cap raised from `<=4` (FG04 check 10) to `<=5`. A session saved on the hub now round-trips. |

All four are source-confirmed. #1 was additionally live-confirmed: the hub's
own template (`step===5` block, `2906`) rendered correctly in a live DOM with
real `prx`/`step` JS state, not a static mock.

### Progress bar and score display

| # | Check | Where | Result |
|---|---|---|---|
| 5 | Progress bar counts only the 4 numbered rungs | `2929` | `const rungsDone=[0,1,2,3].filter(i=>prx.done[i]).length;` — index 4 (Checkpoint) is structurally excluded from both the numerator and the hardcoded denominator (`2932`: `.replace('{t}',4)`). **Confirmed, checkpoint excluded as specified.** |
| 6 | Progress bar renders and fills correctly | `2931–2933`, CSS `278–280` | Live DOM check: with `prx.done={0:true,1:true,2:true}` in memory, the hub rendered `"3 of 4 done"` and `.hub-progress .bar i` — live-confirmed text and a real `<i>` fill element (CSS transition on `width`), not a static icon. |
| 7 | Checkpoint completion doesn't move the bar | `2929` | By construction (`[0,1,2,3]` only) — completing index 4 alone cannot change `rungsDone`. Matches the commit's own claim precisely. |
| 8 | Score fraction shown whole, not truncated | `2944`, `4419` | Hub: `best?`🟩 ${esc(best)}`` — no `parseInt`. Tab strip: `🟩${prx.best[i]} ` — also no `parseInt`. FG04's "2/2 renders as 2, looks worse than 4/6" (check 23) is **fixed in both places it rendered.** |
| 9 | Score emoji still not `aria-hidden` | `2944` | The 🟩 sits in the same text node as the fraction, unlike `.pr-ic` which is explicitly `aria-hidden="true"` (`2939`). A screen reader now announces a correct fraction — an improvement — but still prefixed with an unhidden decorative glyph. Carried forward, narrower than before. |

### Mute

| # | Check | Where | Result |
|---|---|---|---|
| 10 | Mute exists, defaults off, persists | `3884–3885` | `let prxMuted=false; try{ prxMuted=localStorage.getItem('amparo_muted')==='1'; }catch(e){}` |
| 11 | Mute gates the MP3 path | `3947–3964` | `prxSpeak()` returns at `3952` (`if(prxMuted){ prxIdleArm(); return; }`) **before** line `3957`'s `new Audio(...)` is ever constructed. |
| 12 | Mute gates the TTS fallback path | `3962–3964`, `3967` | Grepped every call site of `prxSpeakTTS(` in the file: all three (`3962` `onerror`, `3963` `.catch`, `3964` direct) are inside `prxSpeak()`, downstream of the same early return. **No caller bypasses `prxSpeak()`.** Confirmed airtight for both the recorded-clip path and the browser-synthesis fallback. |
| 13 | Mute stops audio already in flight | `3889–3892` | Toggling on calls `prxAudio.pause()` and `speechSynthesis.cancel()` immediately, not just for the next beat. |
| 14 | Mute toggle, live | live DOM | Before: `muted:false`, label `"🔇 Silence the officer"`, `aria-pressed="false"`. After calling `prxMuteTgl()`: `muted:true`, label `"🔊 Turn the voice back on"`, `aria-pressed="true"`, `localStorage.amparo_muted==='1'`. **Live-confirmed round trip.** |
| 15 | Mute does not disable the freeze/idle safety net | `3952` | `prxIdleArm()` still runs before the muted return — a silent user can still freeze and still gets the replay-or-leave offer. Intentional per the inline comment; confirmed correct. |
| 16 | **Mute has no pre-scenario affordance for levels 0–1** | `4171–4177`, `4185–4191` | `practiceOpen()`'s last two statements are `practiceRender(); prxSpeak();` — synchronous, back to back. For Calm stop (index 0, `practiceOpen()`'s default) and Irritated officer (index 1, via `prStart`→`prxTab`, gated only by `i>=2` for the warn screen), **audio fires in the same tick the overlay first paints.** The mute button lives inside `prx-ctrls`, rendered by that same call — there is no earlier screen (`practiceIntroOpen()`, `2512`; the `prep*` steps, `2535–2566`) that offers mute before first audio. See Nia, §2. |

### Accessible name on the state search field

| # | Check | Where | Result |
|---|---|---|---|
| 17 | `#stateSearch` has `aria-label` | `2754` | `<input ... aria-label="${_t.s_search}" placeholder="${_t.s_search}" ...>` |
| 18 | The label text is real, not empty/generic | `1590`, `1900` | `s_search:"Search your state…"` / `"Busca tu estado…"` — meaningful, distinct, present in both languages. |
| 19 | Live DOM confirms it | live DOM | `getAttribute('aria-label')` returned `"Search your state…"` on the actually-rendered input. Flagged in FG02 and FG03, unfixed through FG04 (its check 17); **fixed and independently confirmed live.** |

### Edition staleness, analytics hygiene (v2.7.1)

| # | Check | Where | Result |
|---|---|---|---|
| 20 | `printedEdition` stamped at print | `4704` | `hasPrinted=true; printedAt=Date.now(); printedEdition=EDITION; persist();` — all four in one atomic block. |
| 21 | Staleness check compares printed edition, not just date | `2206` | `edStale = !!(printedEdition && printedEdition!==EDITION)`. |
| 22 | Legacy saves (no edition) are not retroactively nagged | `2391` | Comment states the intent; `printedEdition` is `null`-initialized and the `edStale` check short-circuits false on falsy `printedEdition`. Deliberate, not an oversight. |
| 23 | PostHog Surveys disabled | `1279` | `disable_surveys:true` — present with rationale comment ("nothing remotely-injectable belongs in a rehearsal"). |
| 24 | Dead-click capture explicitly off | `1280` | `capture_dead_clicks:false`, also present. |
| 25 | **`controllerchange` double-reload guard — logic doesn't match the stated fix** | `4677–4686`, `sw.js:33` | The new guard is `if(!navigator.serviceWorker.controller) return;`. But `sw.js` calls `self.clients.claim()` unconditionally on activate (`sw.js:33`), and per the Service Worker spec `controllerchange` fires *after* `.controller` is already set to the new worker — including on a page's very first claim, not only on a worker replacing an older one. That means the added null-check is testing a condition that is true by construction the instant the event fires, in both the first-visit and the update case. **I could not confirm in this sandboxed environment whether the duplicate-`$pageview` actually stops firing on a genuinely fresh profile — this needs a real Network-tab trace, not source reading. Flagged as a real risk, not asserted as still-broken. NOT VERIFIED live; see blind spot BS-2.** |

### The merged ladder and localStorage migration (v2.7.2)

| # | Check | Where | Result |
|---|---|---|---|
| 26 | "The hard stop" deck is gone, not hidden | `3580` (`PRX_LEVELS`), full-file grep | `PRX_LEVELS` now has 5 entries, not 6. The string `[0,8,1,2,3,7]` (the old level's `ids`) appears nowhere in the file. Fully removed, not merely delisted. |
| 27 | Hard mode (merged) is a fixed deck at index 3 | `3812–3813` | `if(prLevel===3) return PRX_HARD.map(...)`. Checkpoint now index 4: `if(prLevel===4) return PRX_CHK.map(...)` (`3814`). |
| 28 | localStorage migration remaps correctly and drops the deleted level | `3852–3874` | `shift()`: `0→0,1→1,2→2` unchanged, `4→3` (old Hard mode → new merged slot), `5→4` (Checkpoint), **old index 3 is not copied to anything** — a user's old "hard stop" result is dropped, never invented onto the new Hard mode. Matches the commit's stated design exactly. |
| 29 | Migration runs once, version-guarded | `3862` | `if(prx.v>=2) return;` before the remap; sets `prx.v=2` after. |
| 30 | Only Hard mode (index 3) is locked; Checkpoint (4) never is | `2907–2908`, `4409`, `4413` | `mUnlocked=prx.done[0]&&prx.done[1]&&prx.done[2]`; `locked=i=>(i===3)&&!mUnlocked`. Same predicate, hub and overlay. |
| 31 | Hard mode still ends in an unscored debrief | `4459–4473` | `if(prLevel===3){...}` renders a debrief (🌒, blame-reframe copy, no `prx-score`, no grid) and returns before the scored branch. Comment: *"a score here would imply the escalation was earned. It wasn't."* Preserved intact through the merge. |
| 32 | **...but the hub still shows Hard mode a numeric score once it's done** | `4437–4438` vs `2944` | `prx.best[prLevel]=sc+'/'+prRun.length` (`4438`) runs **unconditionally** for every level that reaches the results screen, Hard mode included — nothing in that block checks `prLevel===3`. The hub card's status line (`2944`) checks `prx.best[i]` truthy *first*, before falling back to "Done". So the same "escalation wasn't earned, don't score it" level whose own debrief hides the number **will show a 🟩 fraction on the hub tile**, one screen away, contradicting itself. This is new-to-this-round: it only becomes visible now that the hub renders real fractions (check 8) instead of a broken `parseInt`. Not flagged by FG04, because the hub wasn't reliably reachable then. See §3 item 2. |
| 33 | `prx_warn5` is now a second dead string | `1504`, `1816`, `3838` | The old standalone "Hard mode" warning copy is authored in both languages but the live ternary at `4420` only ever selects `prx_warn3`, `prx_warn4`, or `prx_warn6` for `prLevel` 2/3/4. `prx_warn5`'s only other appearance is inside a comment narrating the *old* per-level-consent bug. Joins `hub_replay` (`1485`/`1800`, still unreferenced, FG04 check 34) as dead i18n content. |

### Module tabs and the door empty state

| # | Check | Where | Result |
|---|---|---|---|
| 34 | Tabs exist, reuse the step-3 segmented control | `2918–2920` | `role="tablist"` wrapping two `role="tab"` buttons, `aria-selected` toggled correctly. No `aria-controls` linking each tab to its panel, no roving-tabindex arrow-key pattern — partial adherence to the WAI-ARIA tabs pattern. NOT VERIFIED with an actual screen reader. |
| 35 | Door tab is a real empty state, not "coming soon" | `1488–1489`, `1803–1804` | EN: *"Not built yet — and we won't fake it... every line an officer says and every answer we mark correct has to be checked by a lawyer first — and because a knock at the door is often a domestic-violence call... We'd rather ship it late than ship it wrong."* ES present, reads as native writing, not a translated afterthought. No date, no "soon." |
| 36 | Door tab has no feedback/demand-signal affordance | `2922–2924` | Just a styled text block (`.pilot` class, reused from the sample-pack banner). No tap-to-react, no email capture, no link out. Compare check 46. |
| 37 | Door tab correctly suppresses the progress bar and grid | `2922` | Ternary on `_hubTab===1` — confirmed neither renders when the door tab is active. |
| 38 | Tab selection is not reset on hub re-entry | `3121–3122` | `let _hubTab=0;` set once at module scope; `hubTab(i)` is the only writer. Leaving the hub (back to pack) and returning does not reset it — a user who taps "At your door" out of curiosity will land back on the empty state, not their progress grid, next time they open the hub in the same session. Minor, unflagged elsewhere. |
| 39 | Tab switch is measurable | `3122` | `ph('sr_hub_module',{module:i===0?'traffic':'door',lang:lang})` fires on every switch — the operator will get view counts on the door tab. View count only; no signal distinguishes a curious glance from someone who read all ~600 characters. |

### Carried-forward items re-verified against current source

| # | Check | Where | Result |
|---|---|---|---|
| 40 | Landing gold button still doesn't match the headline | `2730–2731` | `w_btn` ("Build my pack") is still gold; `w_try` ("Practice a full stop") is still ghost, directly beneath. FG04 finding #2, **still unaddressed** — none of the five commits this round touch this hierarchy, only the ghost button's destination. |
| 41 | Locked-card focusability | `2938` | `<button class="pr-card lock" aria-disabled="true" ...>` — no `tabindex="-1"`, `onclick=""` (empty string, not omitted, but functionally a no-op). Still a real, tabbable button; activating it does nothing, announces nothing. Unchanged from FG04 check 38. |
| 42 | Locked-card contrast | `37`,`38`,`41`,`262`,`265` | Tokens unchanged: `--navy:#1B2A4A`, `--muted:#64707d`, background `#fffdf8`, `.pr-card.lock{opacity:.55}`. Recomputed from the same source values FG04 used — same ≈2.2:1 / ≈3.5:1, still below the 4.5:1 AA threshold. Unchanged. |
| 43 | No deep link / shareable route into the hub or a scenario | full-file grep | Zero hits for `location.hash`, `history.pushState`, `location.search`, `URLSearchParams`. Completely unaddressed — this is a different gap from #1–3 above (those fixed *own-device* reachability; this is *hand-off across people/devices*, wargame BS-8). |
| 44 | Curveball still date-only seeded, levels 0–1 only | `3828–3830` | `seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate()`, `runs>=1&&prLevel<2` — unchanged. |
| 45 | Spanish parity on new v2.7.1/v2.7.2 keys | grep | `hub_m1/m2/m2_h/m2_body/progress/done_badge`, `prx_mute/unmute`, `s_search`, `pp_step2`, `hub_title/sub/locked/done/start` — all present, 2 occurrences (EN+ES) each. Parity holds. |

### Context findings (not defects, relevant to §4)

| # | Check | Where | Result |
|---|---|---|---|
| 46 | The pack already contains one sliver of door content | `2251`, rendered via `3133`/`3146` | The Lifelines-step situation card *"If it's ICE, not a police stop"* already tells users "you don't have to open your door," reviewed under the same process as every other card. It's a static tip, not a rehearsal — but the door tab's empty state doesn't point to it. |
| 47 | A reusable one-tap feedback pattern already exists in this file | `1673`/`1983`, `2875–2878`, `4599` | `printFeedback('easy'|'trouble')` — "How did printing go? 🙌 Easy / 😕 Had trouble," bilingual, already wired, already logs to PostHog. Directly adaptable to "would you use this?" on the door tab at near-zero cost. |

---

## 2. Ten persona reactions

### 🧑 Marcus, 19 — NY, broke college student, no printer, no car

- **The headline blocker is gone.** The ghost "🚔 Practice a full stop" button on
  landing now goes straight to the hub (check 1), not the overlay, with zero
  dependency on ever printing. This was FG04's single loudest, most-repeated
  complaint about him specifically and it is fixed at the root — the landing
  CTA, not a workaround.
- **New, smaller friction, and it's real.** The button's own copy promises "a
  full stop — 2 minutes," but tapping it now lands on a 5-card menu (the hub),
  not a scenario. For a true first-timer, tapping a card then opens the intro
  overlay (`practiceIntroOpen()`, check 16's context) before the scenario
  starts — three taps to the thing the button promised in one. Not a
  regression from v2.7.0 (which had zero working taps for him), but worth
  naming precisely rather than calling this "solved."
- **Redo?** Yes, unambiguously now. **Refer?** Yes — upgraded from FG04's
  "conditional (I'd have to explain the fake-print step)." He still can't
  send a *link* to a scenario (check 43), but he can now tell a friend "go to
  amparohq.com, tap the outline button" and have it work.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, lowest patience

- **Same structural win as Marcus**, for a different reason — she'll never
  print, full stop, and now doesn't need to. Landing → hub in one tap, no
  print event required anywhere in the chain (check 1).
- **Mute is her second fix**, and FG04 named this specifically for her
  ("practises between fares, sometimes with a passenger seat that isn't
  empty"). Confirmed airtight for both audio paths (checks 11–14).
- **The menu-tap friction (see Marcus) costs her more than it costs him.** Her
  bar was "something useful in her hand inside 30 seconds." An extra card-grid
  screen between the ghost CTA and an actual scenario eats into that budget in
  a way it wouldn't for a less time-pressured user.
- **Redo?** Yes. **Refer?** Yes — upgraded from FG04's "not yet." Both of her
  stated blockers (printer dependency, no mute) are independently fixed.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, the only real completed funnel

- **This is exactly the fix his real transcript asked for.** His documented
  path — skip the pack, land on scenarios — is now the *designed* path, not an
  accident he discovered. Landing ghost CTA → hub works with zero pack
  engagement (check 1).
- **Second, independently important fix for him:** the resume guard now
  covers step 5 (check 4). In FG04, closing the tab after reaching the hub
  meant losing it entirely — no resume chip, back to step 0. That's fixed.
- **Still open, and it's his other real complaint:** no deep link (check 43).
  He is, by FG04's own words, "the most engaged user this product has ever
  had" — exactly the person who would forward a specific scenario if he
  could. He still can't.
- **Redo?** Yes. **Refer?** Yes, unambiguous now — his path fully works and
  survives a session close. The only thing between "yes" and "evangelist" is
  a URL to actually send.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **A real, specific change to her pattern.** FG04's read was that she builds
  the pack, prints days later at church, and "never sees" the hub because it
  required a real `afterprint` event. That gate is gone for the landing entry
  point (check 1) — she could now reach the hub, in Spanish, the same visit
  she builds the pack, before ever printing. Whether she *would* — a
  Spanish-first parent focused on getting a document made — is a genuine open
  question this report can't answer from source, but the door that was closed
  in FG04 is now open.
- **The Checkpoint card is still the thing that would stop her cold if she
  gets there.** Unchanged, re-verified: ungated, full-brightness, and its own
  copy still discloses it hasn't been reviewed by an immigration attorney
  (unchanged content, not re-flagged as new per this report's constraints).
- **New, minor:** if she tapped the door tab out of curiosity (Spanish copy
  reads naturally, check 35 ES), the hub would show her that tab again next
  time she returns within the same session, not her progress (check 38) —
  small, but for someone navigating in a second language, "where did my
  scores go" is a worse experience than for a power user.
- **Redo?** Yes. **Refer?** Still no — unchanged, no institution's name on the
  product (standing, not a new finding this round).

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **Mute is his loudest FG04 complaint, resolved.** "An officer's voice
  speaking out loud with no off switch is a privacy problem in his own home"
  — confirmed fixed, persisted, gates both audio paths (checks 10–14).
- **The gate-priority question he embodies is completely unchanged by the
  merge.** Post-merge, the ladder is Calm / Irritated / Ordered out / **Hard
  mode (locked)** / **Checkpoint (never locked)** — same shape as before,
  renumbered. Checkpoint is still the only unreviewed, highest-consequence
  content in the product and still the only one of the escalated tiers that
  isn't gated (checks 30–31 for mechanism; the underlying question is the
  same one FG04 and wargame 02 already raised, not new here). If anything,
  the cleaner 4-rung ladder makes the asymmetry easier to see at a glance,
  not harder.
- **Redo?** Yes. **Refer?** Maybe — upgraded from FG04's flat "maybe" only in
  that his loudest complaint is gone; the standing one isn't.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old about to solo drive

- **This round is built for her specifically.** She was already the one
  persona who reliably reached the hub in FG04; now what she reaches actually
  works. The progress bar reads "n of 4 done" with a real fill bar (checks
  5–7), and every card's score shows the whole fraction (check 8) — no more
  "her best run looking worse than a mediocre one."
- **Green completed-state is a real, visible signal now** — border, tint,
  a "Done" badge (CSS confirmed, checks in table). The 18px checkmark FG04
  called "nobody noticed" is gone as a *sole* signal.
- **She'd still hit the same wall FG04 found if she taps a locked card**
  before her son has cleared the first three: nothing happens, no shake, no
  message (check 41), on a card that's still under AA contrast (check 42).
  For someone running structured drills and actually watching the screen with
  her kid, a silent non-response reads as broken, not "locked."
- **Redo / refer?** Yes / yes — the cleanest yes on the panel, more so than
  FG04, on stronger evidence.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **One of his two FG04 conditions is met.** `#stateSearch` now carries a
  real `aria-label`, live-confirmed in the rendered DOM (checks 17–19). This
  was flagged in three consecutive focus groups (FG02, FG03, FG04) before
  being fixed.
- **His score-badge complaint is partially addressed.** The hub now announces
  a real fraction instead of a truncated integer (check 8) — genuinely
  better, real information now. But the 🟩 emoji prefixing it is still not
  `aria-hidden` (check 9), so the announcement is still "green square, five
  slash six" rather than just "five of six."
- **His locked-card complaint is completely unaddressed.** Still a focusable,
  keyboard-reachable button that does nothing on activation and announces
  nothing (check 41) — same finding, same severity, unchanged.
- **New for this round:** the module tabs use `role="tab"`/`role="tablist"`
  correctly but skip `aria-controls` and roving tabindex (check 34) — a
  partial implementation of the standard pattern. I could not test this with
  an actual screen reader; flagged, not asserted as broken.
- **Redo?** Yes. **Refer?** Still conditional — narrower than FG04's two
  open items, now effectively one and a half.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **The empty-state honesty is exactly his register, and it's worth saying
  plainly.** "Not built yet — and we won't fake it," followed by two concrete,
  specific reasons instead of a vague "coming soon" (check 35) — this is the
  kind of directness FG04 predicted he'd respect ("he does not object to
  rehearsal. He objects to who is teaching it"). A product that names its own
  limits without being asked is closer to what he trusts than one that
  doesn't.
- **The merged ladder reads cleaner, and that's a legitimate, if small, point
  in the product's favor** — one fewer scenario that was, by the operator's
  own commit message, a recycled deck wearing a different name. He'd likely
  read a product correcting its own redundancy as a good sign, not a loss.
- **The thing that actually moved him in FG04 is completely untouched.** The
  claim-versus-backing gap (a headline that asserts rehearsal authority,
  backed by one person's name, no institution) is unchanged this round —
  correctly out of scope per this report's constraints, but also genuinely
  not addressed by anything in v2.7.1/v2.7.2.
- **Redo?** Yes — upgraded from FG04's "once," specifically to see how the
  door module's honesty plays out and because the ladder now makes more
  sense on its face. **Refer?** Still no. Unchanged for the same reason FG04
  gave.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **This is the persona the mute feature was named for in the commit message
  itself** ("a stop survivor for whom the synthesized hostile voice IS the
  trigger"), so it earns the most scrutiny here.
- **What actually protects her, confirmed:** once she finds and taps mute
  once, it's silent for every future scenario, every future session — it's a
  `localStorage` preference, not a per-visit toggle (checks 10, 14). That is
  real, durable protection for ongoing use, not a gesture.
- **What doesn't protect her: the first exposure.** For Calm stop and
  Irritated officer — the two least-gated levels, the ones a first-timer is
  routed toward — `practiceOpen()` calls `practiceRender()` then `prxSpeak()`
  synchronously in the same tick the overlay first paints (check 16). The
  mute button doesn't exist on screen until that same render call, by which
  point the officer's first line has already started playing. There is no
  earlier screen — not the intro overlay, not the prep steps — that offers
  mute before first audio. Levels 2 and up get a consent screen first
  (`prWarnOk`) with time to find mute; the two easiest levels, precisely the
  ones a first-timer reaches, do not.
- **Her original hard-no is untouched by anything in this round.** FG04's
  finding was that the headline itself — "Practice the stop before it
  happens" — leads with the simulation she came to avoid, before she ever
  reaches a mute button or a level. Nothing in v2.7.1/v2.7.2 touches the
  landing headline or bullet order. She still exits at step 0.
- **Redo?** No — she doesn't get far enough for the fixes in this round to
  reach her. **Refer?** No, unchanged. If she *did* get further (say, a
  friend walked her through it), mute would genuinely help every session
  after the first — worth the operator knowing precisely where the remaining
  gap is, rather than "mute didn't fix it" as an undifferentiated verdict.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user rather than the buyer

- **Nothing in this round touches his blocker, and that's now more
  conspicuous, not less.** Six of ten FG04 personas were blocked by hub
  reachability from their *own* device; five of them are fixed this round.
  Devin's blocker was never his own reachability — it was that his mother,
  on her device, has no way to hand him anything more specific than "go to
  the website." That's unchanged: zero deep-link, hash, or query-param
  routing anywhere in the file (check 43).
- **The hub is a better menu now than it was in FG04** — real progress,
  real scores, a cleaner 5-card ladder — which makes it a better thing to
  hand off, if only there were a way to hand it off. The gap between "this
  screen is good" and "this screen is reachable by the person who needs it"
  is wider this round precisely because the screen improved and the handoff
  didn't.
- **Redo / refer?** No / no — same verdict as FG04, same root cause, and
  the surrounding improvements make the absence more visible rather than
  less relevant.

---

## 3. Exactly 5 things needed to make this the golden standard

Ranked. Each is tied to a line in `index.html` or a specific persona, not to
taste. Two are new this round; three are FG04 findings re-verified as still
open.

### 1. Decide the Checkpoint's gate before the ladder gets any more polished

**Evidence.** `locked=i=>(i===3)&&!mUnlocked` (check 30) — Hard mode (fictional
escalation, ends in an unscored debrief) is the only gated tier; Checkpoint
(real federal consequences, explicitly "not reviewed by an immigration
attorney" in its own copy) is not. This is unchanged in substance from FG04's
#3 and wargame 02's #3 — carried forward because re-verification confirms it's
still true, not repeated by default. **The merge made the ladder more legible,
which makes this asymmetry easier to notice, not harder** — a cleaner 4-rung
ladder with an unnumbered tile beside it draws the eye to the one card that
doesn't fit the pattern. Luis and Rosa are the exact readers this affects.

### 2. Stop the hub from scoring the one level whose own screen refuses to score it

**Evidence.** Hard mode's results screen explicitly withholds the score
("`4459`: a score here would imply the escalation was earned. It wasn't, and
that's the whole point.") — but `prx.best[prLevel]` is written unconditionally
at `4438`, and the hub card checks that value first (`2944`). The hub will
show a 🟩 fraction on Hard mode once it's completed, directly contradicting
the design intent stated four lines away in the same file. This is genuinely
new to this round — it only became visible once the hub started rendering
real fractions instead of a broken `parseInt` (check 8), which is itself an
improvement. **Fix is one line**: special-case index 3's hub status the same
way its results screen is already special-cased, so the card reads "Done"
rather than a number.

### 3. Make the landing page's one gold action agree with its own headline

**Evidence.** Unchanged from FG04's #2, re-verified: `w_title` promises
"Practice the stop before it happens"; the gold button still says "Build my
pack" (`2730`); the practice CTA is still the ghost immediately beneath it
(`2731`). This is the cheapest fix on this list — no new logic, a class swap
— and the highest-visibility, since every visitor sees it before anything
else. Marcus and Keisha now reach practice easily once they find the right
button; Nia pays for the mismatch in the opposite direction, since the
headline she'd rather not see outranks the button that would actually serve
her (a document).

### 4. Give the two least-gated levels the same pre-audio window the gated ones already have

**Evidence.** `prWarnOk`'s consent screen (`4419`) already buys levels 2+ a
render cycle where mute is visible and audio hasn't started. Levels 0 and 1 —
the ones a first-timer is routed to — go straight from `practiceOpen()` into
`prxSpeak()` synchronously (check 16), so mute cannot be found before the
first line plays. The persisted-preference design (check 10, 14) already
solves this for every *subsequent* session; it does nothing for the first
one. Two cheap options: default a user's first-ever session to muted, or move
the mute toggle onto `practiceIntroOpen()` / the prep steps, which already
render before any scenario does. This is the single highest-leverage fix for
Nia specifically, and the mute feature is explicitly named for her in this
round's own commit message.

### 5. Fire an event, and register a preference, at the lock wall

**Evidence.** Unchanged from FG04's #5, re-verified: locked cards render with
`onclick=""` (`2938`), so a tap that hits the lock produces no `sr_*` event
and no live-region feedback — still true after the merge, still on the one
card class (Hard mode) that's gated at all now. Combined with the unchanged
sub-AA contrast (check 42, re-verified against current CSS tokens) and the
unchanged focusability (check 41), this remains the one interaction in the
hub that is simultaneously invisible to analytics, unusable for a
screen-reader/keyboard user, and silent for a sighted mouse user. Wargame 02's
item 1 was shipped to prevent exactly this class of blind spot; it has one
remaining instance, on the hub's single locked card.

---

## 4. What changed in the practice modules

### The merge: justified, and it resolved two old findings as a side effect

FG04's wargame document (§5.2, §5.6) flagged the old "The hard stop" level
(`ids:[0,8,1,2,3,7]`) twice: its climactic arrest beat had zero hostile
variants and fell back to robotic TTS, and it shared 4 of 6 beats with level 1
— "not structurally distinct." Both findings are now **moot, not fixed** —
that exact deck no longer exists anywhere in the file (check 26). The commit
message's own self-correction (Hard mode, not "the hard stop," was the
deliberately-unwinnable level) is accurate against source: Hard mode's
`PRX_HARD` deck and its debrief-not-scoreboard ending are both preserved
intact through the merge (checks 27, 31), and the migration correctly drops
the deleted level's saved progress rather than inventing a result for it
(check 28). This is a clean piece of work — it reduced surface area and kept
the receipts. The one gap it introduced is the hub/debrief score
contradiction at check 32, item 2 above.

### The door tab's empty-state honesty: it works, and here's the specific evidence

Measured against the wargame document's own recommendation ("says the module
isn't built, and says why... not a 'coming soon'"), the shipped copy hits
every mark: two concrete, named reasons (attorney review, DV-clinician
review), no date promised, closing on a value statement consistent with the
product's own voice elsewhere ("we'd rather ship it late than ship it
wrong"). Both languages read as native writing, not translation (check 35).
This is the right call, executed well.

**What it doesn't do, and could cheaply:**

- **No link to the one thing the product already has.** The Lifelines step's
  "If it's ICE, not a police stop" card (check 46) already tells a user "you
  don't have to open your door" — reviewed content, already shipped, already
  bilingual. The empty state doesn't mention it exists. A user who taps the
  door tab specifically because they're worried about this *tonight* gets a
  well-written explanation of why there's nothing here instead of a pointer
  to the one relevant sentence the product has already published.
- **No demand signal, despite a ready-made pattern.** `printFeedback()` (check
  47) is a one-tap, bilingual, already-logged "how did that go" mechanism
  sitting three thousand lines away in the same file. `sr_hub_module` (check
  39) tells the operator how many people *looked*; nothing tells them how
  many *needed* it. Adapting the existing pattern is close to free.
- **Tab state doesn't reset (check 38).** Small, but a user who explores the
  door tab out of curiosity loses their progress view on return to the hub
  within the same session, with no signal why.

---

## 5. Blind-spot questions a top UX researcher would ask that the operator has not

**BS-1. This codebase has now shipped the same failure class three times —
has anyone named the pattern?** The attorney-edition badge went stale
silently until `dbb2154` fixed it. The statute auto-checker 403'd silently for
days before anyone noticed (referenced in that same commit). The door tab's
"not built yet" is a *correct* claim today that will become exactly this kind
of silent-stale claim the day the module ships and nobody remembers to change
five lines of copy. Nobody has written down "un-shipping an empty state" as a
release-checklist item, and this project has now paid for that omission twice
already under different names.

**BS-2. Does the `controllerchange` fix actually stop the duplicate
`$pageview`, or does it just look fixed?** Check 25: the added guard checks
`.controller` truthiness *after* the event fires, and `sw.js`'s
`clients.claim()` (line 33) means `.controller` is set by construction the
instant that event dispatches — first activation or not. This needs a real
browser Network-tab trace on a genuinely fresh profile, not a source read.
Nobody has run that trace since the fix shipped, and the number this whole
roadmap is prioritized against — the 94.5% drop-off — depends on the answer.

**BS-3. Now that reachability is fixed for most of the panel, has anyone
re-pulled the actual funnel to see if it moved?** Five of ten FG04 personas
were blocked by the exact defects this round fixed. That's a testable
prediction about real numbers, not just a focus-group read. Nobody has closed
that loop yet — the next data point on whether this round worked is the next
scheduled focus group, not the analytics the product already collects.

**BS-4. Does the door tab's total honesty need a fast path for someone in
crisis right now?** Wargame 02's own words: "the person who opens Amparo
*tonight* because police are at the door." That person and someone idly
browsing the roadmap get the identical ~600-character paragraph about lawyer
review and DV-clinician review. Nobody has asked whether a person in the
first category needs one line, not a paragraph, before the explanation —
something closer to "here's what we do have" (a link to check 46's existing
card) *above* the fold, with the honest explanation available but not
first.

**BS-5. The merge deleted a scenario — has anyone asked the people who ran
it?** `prx.runs[level]` (check on migration, §1) is already tracked per
level, meaning the operator could, in principle, know whether anyone had "the
hard stop" as their most-repeated run before deleting its deck. Nobody
queried existing telemetry before removing content it could have informed.
Worth doing before the next deletion, not this one.

**BS-6. Is the hub a first-visit screen or a returning-user screen, and does
tab memory match the answer?** FG04's BS-1 asked this about the hub overall
and it's now half-answered — the hub itself finally serves both. But
`_hubTab`'s persistence-without-reset (check 38) answers the *sub*-question
inconsistently: it behaves like a returning-user preference (remembers your
last tab) without any of the signals a returning-user feature usually gets
(no indicator of what changed, no way to tell if new progress exists on the
other tab). Nobody has decided which one it's supposed to be.

**BS-7. Who is the module-tab pattern actually documented for?** `role="tab"`
/`role="tablist"` exist without `aria-controls` or roving tabindex (check
34) — a half-implementation of a well-known pattern, in a codebase that
otherwise gets ARIA details right (the locked-card `aria-disabled`, the
`aria-live` regions elsewhere). That inconsistency, more than the specific
gap, is worth a screen-reader pass before this tab pattern gets reused a
third time (it's already used on step 3 and now step 5).

---

## 6. Group read

**Consensus:** 4 clear yes (Marcus, Dana, Wes, Keisha) / 3 conditional (Rosa,
Luis, Omar) / 3 no (Tony, Nia, Devin). FG04 was 4/4/2. The shift isn't that
the product got worse for anyone — it's that Devin's unfixed blocker (no
deep link) reads as a harder no *because* five of his neighbors' blockers got
fixed and his didn't. An unsolved problem gets more conspicuous, not less,
when the problems around it disappear.

**What genuinely improved, stated without hedging.** The single highest-
severity defect in the codebase's history of focus groups — a hub that
promised rehearsal and was reachable by almost nobody — is fixed at the root,
verified in source across all four entry points and independently
live-confirmed for the landing path (checks 1–4). Mute is airtight for both
audio paths and live-confirmed round-tripping through `localStorage` (checks
10–14). The score-display bug that made a perfect run look worse than a
mediocre one is fixed everywhere it rendered (check 8). The state-search
accessible name — flagged in three consecutive focus groups — is fixed and
independently verified live (checks 17–19). The door tab's empty state is
genuinely well-executed honesty, not a "coming soon" in disguise (check 35).

**Biggest objection, by count among the ten seated personas — 3 of 10** (Marcus,
Wes, Devin): no deep link into the hub or a specific scenario (check 43). This
is a different gap from the reachability defects fixed this round — those were
about a user reaching the hub on *their own* device; this is about handing a
specific screen to someone else. It's the most-repeated complaint across
persona write-ups this round, ahead of any single new defect.

**Second by count, and highest consequence per instance — 2 of 10** (Rosa,
Luis): the Checkpoint-gating-priority question. Fewer personas voice it
directly than the deep-link gap, but the stakes are categorically different —
real federal consequences, explicitly unreviewed content, the only escalated
tier that isn't gated. Unchanged from FG04 and wargame 02, not a new finding,
and re-verification confirms the merge's legibility improvement makes the
asymmetry easier to spot, not harder.

**Third, and new this round:** the hub/debrief score contradiction on Hard
mode (check 32) — a defect that didn't exist as an *observable* problem until
this round's own score-display fix made it visible. A one-line fix.

**Highest-leverage fix:** give Nia's mute the pre-audio window levels 2+
already have (item 4, §3). Every other fix on this list improves a screen
some fraction of the panel reaches; this one is the difference between a
trauma-informed feature that protects someone from their second exposure
onward and one that protects them from the start — for the exact persona the
feature's own commit message says it was built for.

**Who this is not for:** Nia, still, and for the same reason as FG04 — the
headline itself, untouched by anything in this round. Devin, now more
clearly than before — not because anything regressed, but because the
product got better at everything except the one thing that would reach him.
