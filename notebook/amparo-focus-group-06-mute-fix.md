# Amparo — focus group 06: does mute actually protect first exposure, and did the ladder merge survive contact

Date: 2026-08-03. Run against commit `5b46965`, tag `v2.7.3`. Step 7 of `/amparo-loop`.
Loop subject: the officer-voice MUTE feature shipped in `8ce9639` (v2.7.2).

**Method note.** Every claim below is either (a) grepped/read directly out of `index.html`
at `5b46965`, with a line reference, or (b) live-tested in an actual browser tab against
the project's own `.claude/launch.json` static server (`http-server` on port 4173,
commit `5b46965`) — reading real DOM output and real `localStorage` state, not a
render function's return string. Where I did both, both are cited. Anything neither
grepped nor live-checked is marked NOT VERIFIED. Nothing in this report was taken on
the strength of a commit message or of FG05's own prose — every figure was re-derived
independently this round, including the ones that turn out to match FG05 exactly.

## 0. The fact that reframes this whole round

```
git diff 60ae7bc..HEAD -- index.html   → 0 lines changed
git diff 60ae7bc..HEAD -- sw.js        → 0 lines changed
git diff --stat 60ae7bc..HEAD          → 12 files, all docs/notebook/wargame markdown
                                          + CHANGELOG.md + version-history.md
                                          + .claude/skills/amparo-loop/SKILL.md
```

**`index.html` and `sw.js` are byte-identical to the commit FG05 already audited.**
Three commits landed between FG05 (`60ae7bc`) and this run (`5b46965`) — `322838c`,
`0ac3f76`, `5b46965` — and every one of them is documentation or tooling. Zero
application code shipped. This means:

- FG05's 47 source-verified checks are still accurate **by construction**, not by
  re-confirmation — there was nothing to break them.
- Nothing FG05 flagged as open could have been fixed, because nothing changed. Where
  this report says a finding is "unchanged," that is a statement about the git log,
  not a soft re-flag.
- This round's actual job — per the brief — was to independently re-derive three
  specific things rather than trust FG05's or the commit's account of them. That
  re-derivation, done from scratch this round including live browser testing FG05
  did not do for these specific items, surfaced a materially sharper picture on two
  of the three (mute, score display) than FG05's own phrasing captured. That is the
  actual content of this report.

**Roster.** Same ten as FG05, same reasons — nothing moved that would change who's
seated: **Marcus, Keisha, Wes, Rosa, Luis, Dana, Omar, Tony, Nia, Devin.** Same three
dropped for the same unchanged reasons: **Ana** (federal-only framing), **Marisol**
(Spanish parity — re-spot-checked this run on the mute/hub strings specifically, see
check 22), **Ray** (audience-boundary question, untouched).

---

## 1. What was verified

### A. The mute pre-exposure gap — re-derived from scratch, and it's broader than FG05's phrasing

FG05 (its check 16) found the gap on "the two least-gated levels." Re-tracing the full
call graph this round — every function between a hub tap and the first `prxSpeak()` —
shows the mechanism is not level-specific at all. It's structural: **exactly one
function ever emits the mute control's HTML (`ctrls`, built at `4544`), and that
function is `practiceRender()`'s full-scenario branch. No earlier screen, and no
consent screen, ever includes it.**

| # | Check | Where | Result |
|---|---|---|---|
| 1 | Single gate, no bypass | `3947–3966` (`prxSpeak`) | `if(prxMuted){ prxIdleArm(); return; }` at `3952`, before the MP3 path (`3957–3963`) or the TTS fallback (`3964`, `3967` `prxSpeakTTS`) can run. Grepped every call site of `prxSpeak(` (11 total) and `prxSpeakTTS(` (3 total) — all downstream of this one check. **Live-confirmed**: toggling mute mid-session and calling `prxSpeak()` produced no audio; toggling off restored it. |
| 2 | First-timer routing | `4185–4194` (`prStart`) | `const seen=prx.done[0]‖…‖prx.done[5]; if(!seen){ practiceIntroOpen(); return; } practiceOpen(); if(i!==0) prxTab(i);` — for **any** genuine first-timer, tapping **any** hub card (0–4) routes to `practiceIntroOpen()`, discarding which card was tapped. **Live-confirmed**: reset `prx` to empty, called `prStart(0)`; result `introOverlayOpen:true, practiceOverlayOpen:false`. |
| 3 | Intro screen: no mute, no audio | `2512–2533` (`practiceIntroOpen`) | Framing text, language toggle, one "Start" button. No reference to `ctrls`, `prxSpeak`, or `Audio(` anywhere in the function. **Live-confirmed**: with the intro overlay open, `document.querySelector('.prx-hear')` → `null`; `prxAudio` → unset. |
| 4 | Five prep steps: no mute, no audio, and not checkpoint-relevant | `2498–2567` (`PREP_STEPS`, `prepOpen`, `prepRenderStep`, `prepNext`, `prepBack`) | All five steps are traffic-stop mechanics — *Stop safe, Settle the car, Open the window, Set phone & papers, Hands on the wheel*. No `ctrls`, no `prxSpeak` in any render path. See §4 for why this matters beyond mute. |
| 5 | Recall drag-and-drop game: no mute, no audio | `2568–2618` (`prepStartRecall`, `prepRenderRecall`, `prepPlace`/`prepUnplace`, success handler at `2618`) | The only exit from this screen that reaches a scenario is the success handler: `prepClose(); ph('sr_prep_recall_done'); practiceOpen();` — no `ctrls`, no `prxSpeak` upstream of that call. |
| 6 | The scenario screen: mute button and audio object appear in the same synchronous tick | `4171–4180` (`practiceOpen`) | `practiceRender(); prxSpeak();` — two statements, no `await`, no `setTimeout`, nothing that yields between them. **Live-confirmed empirically**, not just read: called `practiceOpen()` fresh — result in the same call, `muteButtonNowInDocument:true` **and** `prxAudioObjectNow:"http://localhost:4173/audio/en/m/v0_1.mp3"`. There is no wall-clock gap in which a human could act between the button existing and the audio being instantiated. |
| 7 | **The consent/warn screen (levels 2+) also has no mute control — this is the correction to FG05's framing** | `4419–4423` | `b.innerHTML=tabs+<div class="prx-warn">…</div>+<button onclick="prWarnOk[prLevel]=true;practiceRender();prxSpeak()">`. `ctrls` is defined at `4544`, *after* this branch's `return` at `4422` — it is never reached, never concatenated, never rendered on the warn screen. **Live-confirmed**: entered Checkpoint's (level 4) warn screen fresh (`prxTab(4)` with `prWarnOk={}`) — `onWarnScreen:true`, `muteButtonOnWarnScreen:false`. FG05 characterized levels 2+ as having "time to find mute" before audio because a consent tap intervenes. That's half right: the tap does delay audio. It does **not** expose mute during the delay — the "I'm ready" button's own `onclick` calls `practiceRender();prxSpeak()` together, so mute's first appearance for those levels is *also* simultaneous with their first audio, just one tap later than levels 0–1. **The gap is universal to every level's first exposure, not confined to the two least-gated ones.** |
| 8 | Mute stops audio already in flight, toggle round-trips | `3886–3895` | Muting calls `prxAudio.pause()` and `speechSynthesis.cancel()` immediately. **Live-confirmed** round trip: `{muted:false,ls:null}` → toggle → `{muted:true,ls:"1"}` → toggle → `{muted:false,ls:"0"}`. |
| 9 | Minor, newly found: returning users jumping straight to a gated level get a stray level-0 audio blip first | `4171–4194` | `practiceOpen()` unconditionally sets `prLevel=0` and speaks its first line, *then* `prStart` calls `prxTab(i)` to switch to the requested level. **Live-confirmed**: a returning user with levels 0–2 done, tapping the Checkpoint card, produces a `prxAudio` object for `v0_0.mp3` (Calm stop's opening line) an instant before `prxTab(4)` swaps to the correctly-gated warn screen. Low severity — it's one line of the *calm* beat, not a hostile one — but it means even a "protected" returning user briefly hears audio that has nothing to do with the level they asked for, if they haven't muted yet. |

### B. The level-merge migration — re-derived by hand, then proven empirically

FG05 read this migration and trusted the inline comment's account of it. This round I
rebuilt the shift logic from the raw code without reading FG05's description first,
then ran an actual before/after test in the browser rather than stopping at the read.

| # | Check | Where | Result |
|---|---|---|---|
| 10 | Old deck is gone, not hidden | `3580`, full-file grep | `PRX_LEVELS` has 5 entries. `grep "[0,8,1,2,3,7]"` (the deleted level's exact `ids` array) returns **zero matches** anywhere in the file — re-run this round, not assumed from FG05. |
| 11 | Migration logic, hand-traced | `3860–3874` | `shift()`: copies `o[0]→n[0]`, `o[1]→n[1]`, `o[2]→n[2]` unchanged; `o[4]→n[3]` (old Hard mode → new slot 3); `o[5]→n[4]` (old Checkpoint → new slot 4); **no line copies `o[3]` anywhere** — the deleted level's data has no destination and is dropped by omission, not by an explicit delete. Applied identically to `prx.done`, `prx.best`, `prx.runs`. Guarded by `if(prx.v>=2) return;` before running, `prx.v=2` set after. |
| 12 | **Live empirical test of the exact migration** | localhost:4173, `amparo_prx` | Seeded `done:{0..5:true}, best:{0:'5/5',1:'6/6',2:'2/2',3:'4/6',4:'3/3',5:'2/4'}, runs:{0:2,1:1,2:1,3:1,4:1,5:1}` — the full old 6-level shape — then reloaded. Resulting live `prx`: `done:{0,1,2,3,4:true}` (5 keys, not 6), `best:{0:'5/5',1:'6/6',2:'2/2',3:'3/3',4:'2/4'}`. **`'4/6'` (old index 3's score) is not present anywhere in the migrated object** — confirmed dropped, not merged or inherited by the new index 3. `best[3]` is old index 4's `'3/3'`, `best[4]` is old index 5's `'2/4'` — confirmed correctly shifted. This matches the hand-traced logic in check 11 exactly, and now has two independent forms of confirmation (static trace + live before/after) rather than one. |
| 13 | Fresh installs also get stamped, harmlessly | live test | A brand-new profile (empty `localStorage`) loads with `prx.v` already `2` — the migration runs once against empty objects (`{}` is truthy in JS, so `shift()` doesn't short-circuit on it, but produces another empty object), then stamps the version so it never re-runs. No functional effect, confirmed by reading the guard and by the first live read of a clean profile. |
| 14 | Minor, newly found: a dead index check survives the merge | `4190` | `const seen=prx.done[0]‖prx.done[1]‖prx.done[2]‖prx.done[3]‖prx.done[4]‖prx.done[5];` still checks index 5, which the migration guarantees can never be populated again (the new `prx.done` only ever gets keys 0–4). Harmless — it's OR'd with five real conditions — but it's a small piece of pre-merge residue nobody swept up. |

### C. Score-fraction display — every render site, not a sample

FG05's check 8 named two render sites and called the truncation bug fixed at both.
This round I grepped every reference to `prx.best` in the file (9 total) to find all
render sites, not just the two already known, and live-tested the one that matters.

| # | Check | Where | Result |
|---|---|---|---|
| 15 | Hub grid card | `2937–2944` | `best?`🟩 ${esc(best)}`:...` — full fraction, no `parseInt`, **and no `i===3` exclusion**. **Live-confirmed**: with Hard mode completed, the rendered card is `{classes:"pr-card done", status:"🟩 3/3", doneBadge:"Done"}` — styled identically to every other completed card. |
| 16 | Tab strip — the working counter-example | `4418` | `${isLocked(i)?'🔒 ':(i===3?(prx.done[3]?'✓ ':''):(prx.best[i]?`🟩${prx.best[i]} `:...))}` — this one **does** special-case `i===3`: checkmark if done, no score, ever. **Live-confirmed** with the identical underlying data used in check 15: the same Hard mode tab renders `"✓ 🌒 Hard mode"` — no fraction. **The fix for check 15 already exists in this file, 126 lines away, written in the same commit** — copy this ternary's shape into the hub card. |
| 17 | Results-screen stats row | `4494` | `${prx.best[prLevel]‖(score+'/'+prRun.length)}` — full fraction, but this line is inside the branch that starts at `4475`, which `4461`'s `if(prLevel===3){…return;}` skips entirely for Hard mode. Unreachable for level 3, so no leak here. |
| 18 | Shareable "🏆" certificate canvas | `4351–4372` | `[_t.prx_lvl1,_t.prx_lvl2,_t.prx_lvl3].forEach((l,i)=>{...x.fillText('✅ '+clean+' · '+(prx.best[i]‖'✓'),...)})` — the loop is hardcoded to indices 0–2 only. Hard mode (index 3) and Checkpoint (index 4) never appear on the shareable image at all. Not a new finding to worry about — a clean confirmation that this surface was scoped correctly. Not previously checked by FG04 or FG05. |
| 19 | The write, and what it drags with it | `4437–4438` vs `4459–4473` | `if(!prx.best[prLevel]‖sc>parseInt(prx.best[prLevel])) prx.best[prLevel]=sc+'/'+prRun.length;` runs for every level including 3 (it's a "new personal best" guard, not a level filter — `parseInt('2/3')` correctly recovers `2` for the comparison, that part is fine). Four lines away, the debrief comment reads *"a score here would imply the escalation was earned. It wasn't."* The write doesn't know about that sentence. It isn't just the number that leaks onto the hub — **`prx.done[prLevel]=true` (`4428`) is also unconditional**, so the hub card also gets the green `.pr-card.done` tint, the `.pr-ic` checkmark color, and the "Done" pill badge — the full success treatment, for a level whose entire authored point is that finishing it should not read as an accomplishment. |

### D. Supporting checks

| # | Check | Where | Result |
|---|---|---|---|
| 20 | Hub progress bar text and fill | `2929–2933` | `rungsDone=[0,1,2,3].filter(i=>prx.done[i]).length`, denominator hardcoded `4`, Checkpoint (index 4) structurally excluded. **Live-confirmed**: all 5 levels done → `progressText:"4 of 4 done"`, `barWidth:"100%"` (Checkpoint's completion correctly did not push it past 4). |
| 21 | Green completed-card styling is real CSS, not just a claim | `269–280` | `.pr-card.done{border-color:#bcd8c2;background:#f4faf5}`, `.pr-donebadge{...color:var(--ok);background:#dcefe1...}` — confirmed present and, per check 15/19, confirmed to apply to Hard mode too. |
| 22 | EN/ES parity on the strings this round touches | `1487–1537`, `1802–1847` | `hub_progress:"{n} of {t} done"` / `"{n} de {t} completados"`; `prx_mute:"🔇 Silence the officer"` / `"🔇 Silenciar al oficial"`; `prx_unmute` likewise paired. All present in both blocks, spot-checked directly (not assumed from FG05's broader check 45). |
| 23 | Mute button accessibility | `4544` | `<button class="prx-hear" onclick="prxMuteTgl()" aria-pressed="${prxMuted}">` — correct ARIA toggle pattern. **Live-confirmed**: `aria-pressed` read `"false"` on a fresh unmuted render. Genuinely solid, and it's the one control in this feature Omar's read has no complaint about. |
| 24 | Escalation consent doesn't persist the way mute does — asymmetry, newly derived | `3842` vs `3884–3885` | `let prWarnOk={};` is a plain in-memory variable — grepped every reference (`4207`, `4408`, `4419`, `4421`); none touch `localStorage`. `prxMuted` is loaded from and saved to `localStorage.amparo_muted` at load and on every toggle. **Two mechanisms that both exist to keep unwanted content from surprising the user behave oppositely**: mute, once found, protects forever; consent, once given, protects only until the tab closes. See blind spot BS-3. |

---

## 2. Ten persona reactions

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

This is the persona the mute feature's own commit message names. Testing mute against
her specifically means actually walking the first-exposure path, not just confirming
the toggle works — so that's what I did, live, on a reset profile.

- **Her standing exit is untouched.** `w_title` is still "Practice the stop before it
  happens," still the first line on the site, still leads with the simulation she
  came to avoid (unchanged, confirmed at `1425`/`2724`). By her own line in
  `members.md` — "exits the practice engine within seconds" — she never reaches the
  screen this round audits. That verdict hasn't moved because nothing shipped that
  would move it.
- **The counterfactual the brief asked for, run for real.** Suppose someone walks her
  past the headline — a friend, a case worker, this focus group's own hypothesis in
  FG05. She lands on the hub, taps a card. What actually happens, live-tested this
  round: `practiceIntroOpen()` opens (framing text, a language toggle, a "Start"
  button — check 3). She taps Start. Five prep screens about mounting her phone and
  turning on the dome light (check 4). A drag-and-drop recall game (check 5). Then,
  in the same synchronous call that opens the scenario, an officer's voice plays —
  live-confirmed: `prxAudio` pointed at a real MP3 URL in the identical instant the
  mute button first existed in the DOM (check 6). **Five full screens of calm,
  procedural content — the opposite of what she's bracing for — precede a first line
  of audio she had no way to see coming and no functional window to prevent.** That
  sequencing is worse for her specifically than "no runway at all" would be: it
  reads as safe right up until it isn't.
- **What genuinely would protect her, confirmed live:** the instant mute is found —
  even reactively, even after that first line already played — it is airtight and
  permanent (checks 1, 8). Every subsequent beat, every subsequent level, every
  subsequent session: silent, by a `localStorage` flag that outlives the tab. That is
  real, and it is not a small thing. It just doesn't cover the one moment she's least
  equipped to absorb.
- **Redo?** No — she doesn't get past the headline in the base case, and even in the
  assisted counterfactual this round ran on her behalf, the one moment mute doesn't
  cover is the one moment she came here worried about. **Refer?** No, unchanged.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old about to solo drive

The brief asked for a persona who actually plays the merged Hard mode through to the
end. Dana is the panel's completionist — the one who reaches the hub cleanly and
tracks progress across weeks with her son — so she's the one who'd genuinely earn
her way there. I ran her exact sequence live.

- **The climb.** She clears Calm stop, Irritated officer, Ordered out — `mUnlocked`
  flips true, Hard mode's lock (`locked=i=>(i===3)&&!mUnlocked`, checks live-confirmed
  at `2908`/`4413`) drops. She taps it. Consent screen first (`prx_warn4`, check 7) —
  "It's late, the officer is hostile from the first word... you do everything right
  and he stays hostile anyway." No score-anxiety framing; it tells her upfront this
  one doesn't work like the others.
- **The three beats, read from the actual deck (`PRX_HARD`, `3701–3740`):** a
  late-night approach, a hand near the belt, "don't lie to me," a knuckle-rap on the
  roof, "step out, hands where I can see them." Every option is tagged
  `bothGood:true` — both the calm-assertive answer and the quiet-compliant one are
  coded as correct. She can't fail this by choosing wrong; the debrief confirms why:
  *"Every choice you made was sound... He kept pushing regardless... That was his
  behavior, not your failure."* This is well-built, and as the persona who runs
  literal drills with her kid, she'd recognize the honesty in it — real stops don't
  always resolve because you did the right things.
- **Then she backs out to the hub — and the contradiction lands on her specifically,
  because progress-tracking is her whole throughline across three focus groups.**
  Live-confirmed, same session, same data: the Hard mode card reads `🟩 3/3`, green
  border, a "Done" pill — visually identical to her Calm stop and Irritated officer
  cards. She just read "there was no score to lose." The hub just gave her one
  anyway. For the one persona on this panel who would actually notice a number and
  ask what it means, this is the worst possible audience for that inconsistency to
  reach.
- **Locked-card silence, still there.** Before unlocking Hard mode, tapping it
  produced nothing — no shake, no message (`onclick=""` at `2938`, unchanged from
  FG04/FG05). Not new, still true.
- **Redo?** Yes, still the cleanest yes on the panel. **Refer?** Yes — but she'd ask
  "why does it say 3/3 if it told me there's no score" the same week she referred it,
  which is not the review anyone wants attached to a referral.

### 🧑 Marcus, 19 — NY, broke college student, no printer, no car

- Landing → hub still works with zero print dependency (unchanged, re-confirmed at
  `2731`). As a genuine first-timer, he takes the exact intro→prep→recall path traced
  in checks 3–6 — same universal pre-exposure gap as everyone's first scenario, not a
  safety issue for him the way it is for Nia, but still: a voice starts talking with
  zero warning the first time he opens this on a bus or in a dorm common room.
- **A genuinely good fit for him specifically: `bothGood:true`.** He's here to show
  friends something sharp, not to be graded (per `members.md`: "shares things that
  look sharp"). A mode where nothing he taps is wrong removes the one thing that
  would make a screen-recording embarrassing. The numbered ladder (check on
  `prx_lvl1..5`) gives him a clean "cleared level 4" to post, if the hub weren't
  simultaneously telling him that number shouldn't exist.
- **Redo?** Yes. **Refer?** Yes, unchanged from FG05 — his headline blocker is still
  fixed, nothing regressed.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, lowest patience

- Her two loudest FG04/FG05 objections (printer dependency, no mute) are still both
  independently resolved — unchanged, because nothing shipped to unresolve them.
- **The universal-gap finding (check 7) matters more for her than for Marcus.** Her
  stated context is "practises between fares, sometimes with a passenger seat that
  isn't empty" — and a genuine first-time visit, which for her is plausibly mid-shift
  on a dashboard mount, means five silent onboarding screens lull exactly the wrong
  expectation before unmuted audio fires with a passenger three feet away. This isn't
  hypothetical for her the way it is for most of the panel — it's her literal
  described environment.
- **Redo?** Yes. **Refer?** Yes, unchanged.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, the only real completed funnel

- Hub reachability and the resume-guard-to-step-5 fix both still hold (unchanged,
  confirmed via the same byte-identical file). His standing ask — a deep link into a
  specific scenario — is still completely absent; re-confirmed this round via the
  same full-file grep FG05 ran (`location.hash`, `history.pushState`,
  `location.search`, `URLSearchParams` — zero hits).
- **Redo?** Yes. **Refer?** Yes, unchanged — his path fully works and survives a
  session close; the only gap is still a URL to send.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- Landing→hub reachability without a print event still holds for her entry point
  (unchanged). Spanish parity on this round's specific strings re-spot-checked
  directly rather than trusted from FG05: `hub_progress`, `prx_mute`/`prx_unmute`,
  `hub_m1`/`hub_m2` all present and read as native writing, not machine translation
  (check 22).
- **The universal pre-exposure gap reads the same in Spanish, mechanically — same
  code path, same synchronicity, regardless of `lang`.** Worth naming precisely: this
  isn't a translation gap, it's a code-structure gap that no amount of Spanish-copy
  polish touches.
- Checkpoint's own note ("not reviewed by an immigration attorney") is unchanged
  content — not re-flagged here as new, consistent with this round's scope.
- **Redo?** Yes. **Refer?** Still no — unchanged, no institution's name attached.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **Mute is still his loudest complaint, resolved** — re-confirmed this round with
  more rigor than FG05 applied (live toggle test, not just source read). "An
  officer's voice with no off switch in a shared apartment" is fixed for every
  session after someone finds the button once.
- **The residual first-session exposure (check 7) is a smaller version of his
  original complaint, not a new one** — his standing concern was "every session," now
  correctly "only ever the very first beat of the very first session," which is real
  progress even though it isn't zero.
- The Checkpoint-vs-Hard-mode gate asymmetry he embodies is unchanged in mechanism
  (`locked=i=>(i===3)&&!mUnlocked`, re-confirmed live at `2908`/`4413`) — carried
  forward from FG04/FG05, not re-litigated as a new finding here, and not connected
  to the pending attorney-review question beyond what those prior rounds already
  established.
- **Redo?** Yes. **Refer?** Maybe, unchanged.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- `#stateSearch`'s `aria-label` fix still holds (unchanged). Locked-card silence
  (`onclick=""`, `2938`) and sub-AA contrast on lock state are both unchanged —
  confirmed via the same byte-identical file, not re-tested from scratch since
  nothing about them could have moved.
- **New, and a genuine point in the feature's favor: the mute button itself is
  correctly built.** `aria-pressed` toggles properly (check 23, live-confirmed), the
  label swaps between "Silence the officer" and "Turn the voice back on" rather than
  a static icon. Of everything this round covers, the mute *control* is the one piece
  Omar's read has no complaint about.
- Module tabs (`role="tab"`/`role="tablist"` without `aria-controls` or roving
  tabindex, `2918–2920`) — unchanged, still NOT VERIFIED with an actual screen
  reader.
- **Redo?** Yes. **Refer?** Still conditional, unchanged.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- The claim-vs-backing gap (a headline asserting rehearsal authority, backed by one
  name) is unchanged — correctly out of this round's scope.
- **A small, specific, newly-noticed irony:** the migration's inline comment
  (`3852–3859`) is some of the most candid engineering writing in this file —
  *"claiming a result for a level the user never played would be inventing
  progress"* — precisely the register Tony responds to (per FG04: "a product that
  names its own limits without being asked is closer to what he trusts"). It's a
  developer-facing code comment, invisible to any user including him. The honesty he
  values exists in this codebase; it just isn't in a place he could ever read it.
- **Redo?** Once, unchanged. **Refer?** Still no, unchanged.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user rather than the buyer

- Zero deep-link routing, unchanged (re-confirmed via the same grep Wes's entry
  cites — zero hits for hash/query/pushState routing anywhere in the file).
- **A small, honest silver lining from the merge, not a fix:** the ladder is now
  numbered ("level 4," not one of six same-weight names), which makes a *verbal*
  handoff — "try level 4 tonight" — marginally more specific than six unordered card
  names were. It is not a substitute for a link, and it doesn't change his verdict,
  but it's a real, minor byproduct of the merge worth naming since this section is
  supposed to be about the merge specifically.
- **Redo / refer?** No / no — unchanged, same root cause.

---

## 3. Exactly 5 things needed to make this the golden standard

Ranked. Each is tied to a specific line and, where I live-tested it, to the actual
DOM/`localStorage` output, not a description of one.

### 1. Give every level's first-ever audio a real pre-mute window — not just levels 0–1

**Evidence.** Checks 3–7, live-confirmed: the mute control (`ctrls`, first built at
`4544`) does not exist in the DOM on the intro screen, any of the five prep screens,
the recall game, *or* the levels-2+ consent screen — only on the fully-rendered
scenario view, which is built in the same synchronous call that triggers the first
`prxSpeak()` (`practiceOpen()` at `4171–4180`; the warn-screen's "I'm ready" handler
at `4421`). This is broader than FG05's "levels 0–1" framing — I found zero levels
where mute is discoverable before their first audio. Two cheap options, neither
requiring new copy: default a session with no `amparo_muted` key at all to muted
until the user's first deliberate unmute, or move a copy of the `ctrls` markup onto
the warn screen (`4420`) and the intro screen, both of which already exist and
already buy several taps of runway before audio. This is this round's subject and the
single highest-leverage item on the list — see Nia, §2, and the group read.

### 2. Stop the hub from scoring and green-carding the one level whose own screen refuses to

**Evidence.** Checks 15, 16, 19, all live-confirmed with identical underlying data in
the same session: the hub card reads `🟩 3/3` with a green `.done` border and a
"Done" badge; the practice-overlay tab strip, reading the *same* `prx.best[3]` and
`prx.done[3]`, correctly renders `✓` with no score at all (`4418`). The fix is not
speculative — it's a working reference implementation already sitting in this exact
file, in the exact commit that introduced both surfaces. Copy the `i===3` ternary
shape from `4418` into the hub card's status line at `2944` (and, ideally, keep the
`.done` class but suppress the fraction the same way). See Dana, §2.

### 3. Make the landing's one gold action agree with its own headline

**Evidence.** Unchanged since FG04, re-confirmed byte-for-byte this round: `w_title`
("Practice the stop before it happens") sits above a gold `w_btn` ("Build my pack",
`goM(1)`) with the practice CTA still demoted to a ghost button beneath it
(`2724–2731`). Zero code shipped in three commits to touch this. Still the cheapest
fix on any version of this list — a class swap, no new logic — and still the
highest-visibility, since it's the first thing every visitor sees.

### 4. Decide whether escalation-consent should persist like mute does, and act on the answer

**Evidence, newly derived this round (check 24).** `prWarnOk` (the "I'm ready" gate
for levels 2+) is a plain in-memory object, never written to `localStorage` — grepped
every reference, none touch storage. `prxMuted` is persisted and restored on every
load. Two mechanisms that both exist to keep unwanted content from surprising a user
currently behave in opposite ways: one remembers forever, one forgets on tab close.
If re-showing the warning every session is deliberate (repeat exposure to a hostile
consent screen could itself be reasoned about as a feature, not a bug), that's a
legitimate call — but nothing in the file states it was made on purpose, and the
asymmetry with mute's design (explicitly commented as "someone who needs silence
needs it every session, not once," `3878–3883`) suggests it wasn't.

### 5. Route a first-timer's tapped card to that card — or admit the ladder isn't really five doors yet

**Evidence, newly derived this round (checks 2, 4).** `prStart(i)` discards `i`
entirely for any first-timer (`4190–4192`) and always lands them on Calm stop after
five prep steps that are 100% traffic-stop mechanics (roll down the window, dome
light, phone mount — `2498–2509`). This is reachable in practice specifically for
Checkpoint, the one escalated tier that isn't locked for first-timers — someone
worried about a checkpoint tonight, tapping that exact card, is instead walked
through car-stop prep with no relevance to what they asked for. This is a routing
fix, not a request for new scenario content: either honor the tapped index once the
generic onboarding completes, or acknowledge in the hub itself that a first tap
always starts the same shared onboarding regardless of which card was pressed.

---

## 4. What needs to change in the practice modules

**Does the merge itself hold up? Yes — re-derived from scratch, not trusted from the
commit message, and it does what it claims.** `PRX_LEVELS` has 5 entries (`3580`);
the deleted level's exact `ids` array is gone from the file (check 10, freshly
grepped this round, zero matches); `PRX_HARD`'s three-beat fixed deck and its
unscored debrief survive the merge intact (checks read directly from `3701–3740` and
`4459–4473`); the migration drops the deleted level's saved results rather than
inventing them, confirmed by hand-tracing the logic *and*, this round, by an actual
seed-and-reload test against a live profile (checks 11–13) — a stronger standard of
proof than either prior focus group applied to this specific claim. Nothing about the
merge mechanism itself is broken.

**What the merge's own scoring fix (real fractions, `8ce9639`) exposed as a side
effect, now proven live rather than inferred:** Hard mode's entire hub presentation —
number, green border, badge — contradicts its own debrief screen, and the working
counter-example for how to fix it (the tab strip) already exists in the same commit.
See golden-standard item 2.

**What's newly visible this round, specific to how the merge changed first
impressions of the ladder:** now that the ladder is numbered and presented as five
discrete named rungs (`prx_lvl1..5`, plus the unnumbered Checkpoint), a user is more
likely to read a tapped card as a real, specific choice than the underlying routing
honors. Pre-merge, six same-weight cards read more like a generic menu; post-merge,
"rung 4 of 4" reads like a destination. The gap between that presentation and
`prStart`'s actual behavior (discard the tap, always start at Calm stop for anyone
new) is more conspicuous *because* the merge succeeded at making the ladder legible.
See golden-standard item 5.

**One more structural detail worth naming for whoever tunes this next:** every
option in `PRX_HARD` is `bothGood:true` (`3720`, `3727`, `3734`) — this is the actual
mechanism that makes `prx_hard_note`'s promise ("there was no score to lose") literally
true at the code level, not just true in the debrief copy. That's good, verifiable
design. It is also the same mechanism the hub's unconditional `prx.done[prLevel]=true`
write (`4428`) undermines the moment the user leaves the scenario screen — the module
itself is honest; the surface one tap away from it isn't yet.

**Consent screens for levels 2+ don't persist consent across sessions (check 24)** —
worth flagging here specifically because it means a returning user who has already
proven, by finishing Hard mode once, that they understand what they're walking into
will see the *identical* full warning text again on day two, day three, day thirty.
Whether that's the intended trauma-informed posture (never assume consent transfers)
or simply the one persistence detail nobody got to is a decision worth making on
purpose rather than by omission.

---

## 5. Blind-spot questions a top UX researcher would ask that the operator has not

**BS-1. The loop's own last audit ranked this exact fix as highest-leverage — why did
three commits of runway go to documentation instead?** FG05's own group-read named
"give Nia's mute the pre-audio window" as the single highest-leverage item on its
list, for the exact persona the mute feature's commit message says it was built for.
The three commits since are a hub-progress-bar polish pass and two documentation
commits. Neither is wrong to have shipped. But nobody has written down whether
re-verification without remediation is an acceptable steady state for a fix the
project's own process already identified and ranked. This report will not be the
first one to rank it either, if nothing changes the pattern.

**BS-2. What happens when a stale service-worker-cached tab and a freshly-migrated
`localStorage` collide?** FG05's BS-2 already flagged doubt about whether the
`controllerchange` guard (`sw.js:33`) behaves as claimed, and marked it NOT VERIFIED
live. This round's migration (`prx.v`-guarded, checks 11–13) gives that doubt a
concrete failure mode: if an old cached `index.html` (pre-merge, 6-entry
`PRX_LEVELS`) runs in one tab while a newer tab has already shifted `localStorage`
into the 5-entry shape, the old tab's code has no index-3 concept that matches the
new data's index-3 meaning. Nobody has traced what the old code does when handed
`prx.v=2` data it doesn't know how to interpret — this needs an actual multi-tab,
mixed-cache trace, not a source read from either version alone.

**BS-3. Is the mute/consent persistence asymmetry (golden-standard item 4) a decision
or an accident — and if intentional, has habituation been considered?** A warning
screen a user has already read and cleared once, that reappears identically every
session, risks training exactly the rapid-dismissal behavior "escalation is chosen,
never sprung" (the code's own comment, `3836–3841`) was written to prevent. Nobody has
asked whether re-showing it is protective or performative once a user has already
demonstrated they understood it.

**BS-4. Does "no score to lose" land as reassurance or as anticlimax for someone who
isn't already trauma-averse?** Hard mode's `bothGood:true` mechanic and its debrief
both remove any possibility of a "you did it" moment after three tense, hostile-tone
beats (checks 19, module section). That is unambiguously correct for a user like Nia,
who this round confirms never reaches it anyway. It has never been asked whether the
*average* user — someone playing for mastery or a shareable badge, per Marcus's
profile — experiences the total absence of scoring as validating or as a
let-down after real tension. The feature has one identified beneficiary and an
unmeasured effect on everyone else who reaches it.

**BS-5. Can the product currently tell a startled mute from a proactive one?**
`sr_practice_mute` fires `{muted:prxMuted,lang:lang}` (`3893`) — no elapsed time since
the scenario opened, no flag for "this is the first scenario this profile has ever
opened." Given this round's finding that the pre-exposure gap is universal (check 7),
the product cannot currently distinguish "someone muted before their first stop
because they read about it" from "someone muted mid-beat because the voice
surprised them" — the exact signal that would tell the operator whether golden-
standard item 1 is theoretical or actively hurting people today. Measuring the gap
requires a code change before it can even be observed.

**BS-6. Now that the ladder is numbered, does anyone check whether users attempt to
skip ahead — and what "locked" communicates when the destination has a name and a
number, not just a silhouette?** A locked card used to be one of six anonymous tiles;
it's now visibly "rung 4 of 4" with a lock icon and a silent no-op on tap (`2938`,
unchanged since FG04). Numbering a locked destination raises its perceived specificity
without raising its feedback quality. Nobody has asked whether the merge's own
legibility win makes the silent lock wall — carried forward, not new, but newly
adjacent to a numbered ladder — read as more broken than it did as an unlabeled tile.

---

## 6. Group read

**Consensus: 4 clear yes (Marcus, Dana, Wes, Keisha) / 3 conditional (Rosa, Luis,
Omar) / 3 no (Tony, Nia, Devin) — unchanged from FG05, because nothing shipped that
could change it.** That is itself the finding, not a hedge: three commits landed
between the two rounds and all three were documentation. No persona moved because no
code moved.

**What this round actually added, stated plainly.** Not new fixes — a sharper, more
rigorous, partly live-tested account of exactly two things: the mute gap is universal
across all five levels' first exposure, not confined to two of them (check 7,
live-confirmed on the Checkpoint consent screen specifically); and the hub-vs-debrief
score contradiction on Hard mode is now proven with actual rendered DOM output in two
UI surfaces side by side, not inferred from reading two separate code paths (checks
15–16, live-confirmed). The migration — the other thing this round was asked to
re-derive rather than trust — checks out completely, now on two independent forms of
evidence (hand-traced logic and a live seed-and-reload test) rather than one.

**Biggest objection by raw count, unchanged — 3 of 10** (Marcus, Wes, Devin): no
deep link into the hub or a specific scenario. Still the most-repeated complaint
across two consecutive rounds with zero code shipped against it.

**Second by count, unchanged and correctly not re-litigated here — 2 of 10** (Rosa,
Luis): the Checkpoint-gating-priority question, carried forward from FG04 and FG05
without new development this round; not connected here to the pending attorney-review
timeline beyond what those rounds already established.

**Highest-leverage fix, and it is more clearly the highest-leverage fix than FG05 was
able to establish:** golden-standard item 1. FG05 identified the mute pre-audio window
as its top-ranked item based on a source read of two levels. This round's live testing
extends that finding to every level's first exposure, including the ones a consent
screen was assumed to protect, and confirms empirically that the mute button and the
first audio object are created in the same unyielding synchronous call. The gap is
bigger than the project's own last audit said it was, and it is still the single fix
that would move the exact persona the feature was built for from "unprotected on
exposure one" to "protected from the first second."

**Who this is not for:** Nia, still, for the same reason as every prior round — the
headline outranks the button, and this round's live-simulated walkthrough of her
counterfactual path confirms the one moment that would matter most to her is the one
moment mute cannot currently reach. Devin, still, because the product keeps getting
better at everything except the one thing that would put it in his hands.
