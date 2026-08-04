# Amparo — Blind-Spot Audit 03 (loop step 9, tag `v2.7.4`)

**Date:** 2026-08-04
**Scope:** `index.html` at tag `v2.7.4` (commit `a2fb643`). Verified `git diff v2.7.4 HEAD -- index.html` is empty (HEAD is `8f59cbf`, four docs-only commits ahead) — every citation below against the working tree is byte-identical to the tagged release, same diligence as the prior audit's §0.
**Read first, per instructions:** `notebook/amparo-blindspot-audit-2026-08-03-02.md` (prior audit) and `wargames/10-final-boss-module-scaffold.md` (scaffold for the not-yet-built two-scenario module). Nothing from the prior audit is re-reported except where explicitly confirming fixed/still-broken. UPL, attorney review, and the unbuilt module itself are not re-flagged — known, tracked, out of scope per instructions.
**Method:** static read of `index.html` plus live instrumentation — `python -m http.server 8778` over the working tree (confirmed identical to the tag), Chrome via the Claude Browser tool, direct calls into the app's own global functions from the page's JS console context. No source file was edited.
**Subject of this pass:** the three fixes in `f205531`/`37e4ffe`/`e586fe4` (all shipped since the prior audit), forward-looking risk from the `wargames/10` scaffold (levels 5/6, not yet built), and a fresh sweep.

---

## 1. Do the three shipped fixes hold under adversarial conditions?

### 1.1 Mute-race fix (`e586fe4`) — "gated at the single entry point" — HOLDS, verified live

**Claim under test** (comment at `index.html:3972-3978`): the mute bypass is closed by gating `prxSpeakTTS()` itself, because that function has a second real entry point (the interrupted-`play()` fallback), not just `prxSpeak()`'s own entry.

**Static trace, exhaustive.** Grepped `speechSynthesis` (9 occurrences), `new Audio\(` (3 occurrences), `\.play\(` (3, all subsets of the same 3 `new Audio()` sites), `SpeechSynthesisUtterance` (1), and `webkitAudioContext`/`AudioContext` (1) across the **entire file**, not just the practice-engine section:

| Site | Line | Gated? |
|---|---|---|
| `speechSynthesis.speak(u)` — the **only** call site in the file | `:3989`, inside `prxSpeakTTS()` | Yes — `if(prxMuted‖!prxTTS) return;` at `:3979`, first line of the function, executes before any other statement |
| `new Audio(...officer clip...)` | `:3962`, inside `prxSpeak()` | Yes — `prxSpeak()` itself returns at `:3956` (`if(prxMuted){ prxIdleArm(); return; }`) before this line is ever reached |
| `new Audio(prxLastUrl).play()` — "hear my answer again" button | `:4082`, `prxPlayLast()` | Yes — `if(prxLastUrl&&!prxMuted)` |
| `new Audio(prxLastUrl).play()` — automatic playback after recording stops | `:4136`, inside `rec.onstop` | Yes — `if(!prxMuted){...}` |
| `new (AudioContext‖webkitAudioContext)()` | `:4058`, `prxWaveStart()` | Not audio **output** — this is a `MediaStreamSource`/`AnalyserNode` reading the **microphone input** to drive the recording waveform bars. No speaker output, confirmed by reading the full function (`:4056-4071`): it only calls `getByteFrequencyData` and writes to `style.height`. |

`prxSpeakTTS()` itself is called from exactly three places, all inside `prxSpeak()` (`:3966` `onerror`, `:3967` `.catch()`, `:3968` the no-audio-id fallback) — no external caller exists, confirmed by grepping every `prxSpeakTTS` reference in the file.

**Ordering proof.** `prxMuteTgl()` (`:3890-3899`) sets `prxMuted=!prxMuted` at `:3891` — synchronously, before it calls `prxAudio.pause()` at `:3894`. JS is single-threaded and `.pause()`'s promise-rejection callback can only run in a **later** microtask, after `prxMuteTgl()` has already returned. So by construction, `prxMuted` is guaranteed `true` before `prxSpeakTTS()`'s guard is evaluated, however the interruption is triggered.

**Live reproduction (this pass), instrumented to prove the race window was actually hit, not just fast-pathed around:**

```js
window.prxSpeakTTS = function(d,useEs){ window.__ttsCalls.push({calledWith_muted_at_entry: prxMuted, cardId: d.id}); return origTTS(d,useEs); };
prDeck = prxBuildDeck(); prIdx = 0; prLevel = 0; prxMuted = false;
prxSpeak();       // starts loading audio/en/m/v0_0.mp3, pending play() promise
prxMuteTgl();     // mute on the very next synchronous line
// ...2s later:
```
Result: `{"ttsCalls":[{"calledWith_muted_at_entry":true,"cardId":"v0_1"}],"spoken":[],"speaking":false}`

`prxSpeakTTS()` **was** invoked (proving the interrupted-promise fallback path really fired — this is not a false negative from a too-fast local server) and it saw `prxMuted===true` and correctly no-op'd. `speechSynthesis.speak` (separately instrumented) never fired. This is the exact scenario the prior audit reproduced as CRITICAL; this pass it does not reproduce.

**Verdict: the "only one call site, gated" claim holds. CONFIRMED FIXED**, both statically and live.

**Residual, separate, still-open issue — not fixed by this diff, unrelated to mute.** The prior audit's item #5 ("stale-content TTS on rapid re-trigger") is a **different** bug sharing the same unguarded-closure root cause, and this diff's fix (`if(prxMuted‖!prxTTS) return;`) does not touch it. Reproduced live this pass:
```js
prDeck = prxBuildDeck(); prLevel = 0; prxMuted = false;
prIdx = 0; prxSpeak();   // card A loading
prIdx = 1; prxSpeak();   // re-triggered for card B before A's promise settles
```
Result after 2s: `{"prIdxNow":1,"spoken":["Good evening. I'm going to need your license, registration, and proof of insurance."]}` — card A's (level-0) line was spoken via TTS after the user had already moved to card B. Not a mute-bypass (unaffected by whether `prxMuted` is true or false), but a wrong-content bug: the `.catch()` closure at `:3967` captures `d`/`useEs` at call time and never re-validates against current `prIdx`/`prLevel` before calling `prxSpeakTTS`.
**Severity: medium** (confirmed still open, same fix shape prior audit proposed — capture `prIdx`/`prLevel` at call time, check unchanged before speaking).

---

### 1.2 Hub score-leak fix (`37e4ffe`) — is `i===3` extensible, or another one-off?

**It is another one-off**, exactly as the scaffold itself already suspects (`wargames/10-final-boss-module-scaffold.md` §2, §4, §8-item-7). Confirmed independently, and the situation is somewhat worse than the scaffold's own text states:

**What actually shipped** (`index.html:2949`):
```js
<span class="pr-st">${isLk?_t.hub_locked:(i===3?(done?_t.hub_done:_t.hub_start):(best?`🟩 ${esc(best)}`:(done?_t.hub_done:_t.hub_start)))}</span>
```
A literal `i===3` ternary. Not a set, not a lookup against a constant. When level 5 or 6 lands and gets appended to the same `[0,1,2,3,4].map(...)` at `:2936`, this line will need manual editing again — it will not "just work."

**Finding A — the guard is duplicated, not singular.** There is a **second**, independently-written copy of the identical `i===3`-only pattern in the practice-overlay tab strip (`:4435`, inside the giant template literal):
```js
${isLocked(i)?'🔒 ':(i===3?(prx.done[3]?'✓ ':''):(prx.best[i]?`🟩${prx.best[i]} `:(prx.done[i]?'✓ ':'')))}
```
This is the pre-existing pattern the prior audit's finding said the hub card "never got" — but it means there are now **two** display-layer guards to update in lockstep (`:2949` and `:4435`), not one. A future editor fixing only the one they're looking at silently reintroduces the leak in the other.

**Finding B — the write itself is still fully unconditional.** `index.html:4454-4455`:
```js
const sc=prRun.filter(x=>x==='g').length;
if(!prx.best[prLevel]||sc>parseInt(prx.best[prLevel])) prx.best[prLevel]=sc+'/'+prRun.length;
```
This runs for **every** level, Hard Mode included, no guard at all. `prx.best[3]` genuinely holds a real `"N/M"` fraction in `localStorage` today — the two display sites above just choose not to render it. This means the "fix" is entirely a presentation-layer patch over live data that still exists in storage. **Any third read site** added later — a stats export, the certificate, a future analytics dashboard, a debug panel — that reads `prx.best[i]` without its own bespoke `i===3` check will silently re-leak the exact score the results screen was designed to suppress. This is the structural version of the bug, and it is not addressed by either landed fix or by the scaffold's own §2 table (which only proposes changing the **read**-side ternary to `(i===3‖‖i===5‖‖i===6)`, matching Finding A's pattern, but says nothing about the write).

**Finding C — the scaffold's own proposed one-line fix for the lock function is insufficient per the scaffold's own §3.** §2's table says: `isLocked / hub locked | i===3 | (i===3‖‖i===5‖‖i===6)`. But §3 states scenario 6's gating is **sequential**, not flat: *"Additionally scenario 6 requires `prx.done[5]`... 6's lesson only lands once 5 has been felt."* A flat `(i===3‖‖i===5‖‖i===6)&&!mUnlocked` — literally what the table proposes, and a direct copy of the existing `i===3` pattern's shape — does **not** express "level 6 additionally needs level 5 done." Implemented as tabled, level 6 would unlock the instant `mUnlocked` (levels 0-2) is true, exactly alongside level 5, defeating the ordering the scaffold calls *"the whole design."* The correct shape is closer to:
```js
const locked=i=>((i===3||i===5)&&!mUnlocked)||(i===6&&(!mUnlocked||!prx.done[5]));
```
Also note: this lock function, like the score guard, exists in **two** independent copies (`:2908` hub, `:4430` practice overlay) — both need the corrected (not the tabled) expression, identically.

**Verdict: the guard is confirmed NOT extensible.** Recommend, before 5/6 land: (1) a single shared `PRX_UNSCORED` set (or equivalent helper) consumed by both display sites *and* the write at `:4455`, so the write is guarded once rather than patched at every read; (2) correct the lock-function fix to express the sequential requirement, in both copies.
**Severity: medium** (write-guard gap, duplicated read-guard — both latent, not yet manifested since 5/6 don't exist in source) **and high** (the sequential-lock gap — this is a documented design requirement that the scaffold's own literal proposed code would violate if followed as tabled).

---

### 1.3 PRX_VAR cleanup (`f205531`) — did it affect the curveball mechanic (`PRX_CURVE`)?

**No. Confirmed safe by full trace**, and the reachability logic behind the original cleanup checks out.

**Which `ci`s were trimmed, and why it's correct:**

| `ci` | Levels it appears in (`PRX_LEVELS` `ids`) | Tones reachable there | Hostile entries before | After `f205531` | Correct? |
|---|---|---|---|---|---|
| 0,1,2 | L0 `[0,8,1,2,6]` (tones `['calm']`) **and** L1 `[0,8,1,2,4,5]` (tones `['curt']`) | calm, curt | 2 hostile each | removed | Yes — hostile is never in either level's tone filter for these ids |
| 8 | L0 and L1 (same as above) | calm, curt | 2 hostile | removed | Yes — same reasoning |
| 4 | L1 only | curt | 1 hostile | removed | Yes — 4 never appears in L2 (`[3,7]`), the only level with hostile in its filter |
| 3, 7 | **L2** `[3,7]` (tones `['curt','hostile']`) | curt, hostile | untouched (3 still has 1 hostile entry, `:3659`) | untouched | Correct — these are the two ids where hostile is genuinely reachable, and the diff leaves them alone |

`PRX_LEVELS=[{ids:[0,8,1,2,6]},{ids:[0,8,1,2,4,5]},{ids:[3,7]},{ids:[20,21,22]},{ids:[30,31,32,33]}]` (`:3585`) — confirmed by direct read, cross-referenced against `prxBuildDeck()`'s `tones=[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]` (`:3820`). CHANGELOG's "8 officer lines... traced by hand" matches exactly: 2+2+1+1+2 = 8 lines removed across ci 0,1,2,4,8 — independently re-derived, same count.

**ID stability, checked separately.** `PRX_VAR[b].forEach((v,i)=>v.id='v'+b+'_'+i)` (`:3813`) assigns ids by array **position**. Every removal was from the **tail** of each sub-array (hostile lines were always authored last), so surviving entries keep their original index/id (`v0_0`..`v0_3` etc. unchanged) — no audio-filename references broke. Only now-deleted entries' clip ids (`v0_4`, `v0_5`, `v1_4`, `v1_5`, `v2_4`, `v4_4`, `v8_4`, `v8_5`) become orphaned-if-they-ever-existed, not broken-if-referenced.

**`PRX_CURVE` independence, traced completely.** Read all 10 entries (`:3681-3692`). Every curveball has its **own** authored `en`/`es`/`tone` — the spliced deck card (`:3835`) is `{ci:cb.answerBeat, officer:{en:cb.en,es:cb.es}, tone:cb.tone, curve:cb, id:cb.id}` — it never reads from `PRX_VAR` at all. IDs come from a disjoint namespace (`PRX_CURVE.forEach((c,i)=>c.id='c'+i)`, `:3814`, i.e. `c0`-`c9`, never colliding with `v*`). The only cross-reference is `answerBeat`, used as `ci` to look up `PRX_OPT[ci]`/`PRACTICE[lang][ci]` for scoring — and every one of the 10 entries uses `answerBeat:1` or `answerBeat:2`, both of which are reachable at both curveball-eligible levels (curveballs only insert when `runs>=1&&prLevel<2`, `:3832` — i.e. levels 0 and 1, both of which include ci 1 and 2 in their `ids`). `PRX_OPT` was not touched by `f205531` at all.

**Verdict: the cleanup cannot have broken `PRX_CURVE` — confirmed, not just plausible.** The two banks share no data, only an id-space-disjoint reference through `answerBeat`, and that reference target was untouched.

**Adjacent gap found, outside the cleanup's stated scope ("hostile" lines specifically) but the same category of dead content — low severity.** `ci=4` and `ci=5` are each reachable **only** via L1 (tones `['curt']` only) — their 2 calm-tone entries each (`:3660-3661`, `:3664-3665`) are just as unreachable as the hostile lines that got pruned, but weren't in scope of a "hostile"-only sweep. Symmetrically, `ci=6` is reachable only via L0 (tones `['calm']` only) — its 2 curt-tone entries (`:3670-3671`) are unreachable the same way. None of this is a functional bug (the pool-filter fallback to the canonical `PRACTICE[lang][ci].o` line, `:3826`, handles an empty-after-filter pool gracefully), just unused authored/reviewed content sitting in the bank, same bucket as the prior audit's LOW dead-weight list.

---

## 2. Forward-looking: every site that hardcodes level count or a specific index

Cross-checked against the scaffold's own §2 table. Columns: confirmed-in-scaffold sites are marked ✓; sites **not** in the scaffold's table are marked **NEW**.

| # | Site | Location(s) | Current | Needed for 5/6 | In scaffold's §2? |
|---|---|---|---|---|---|
| 1 | Hub grid array | `:2936` | `[0,1,2,3,4].map(...)` | `[0,1,2,3,4,5,6]` | ✓ |
| 2 | Practice tab strip array | `:4434-4435` | `[0,1,2,3,4].map(...)` | `[0,1,2,3,4,5,6]` | ✓ |
| 3 | Warn-copy ternary | `:4437` | `prLevel===4?warn6:(prLevel===3?warn4:warn3)` | add `prLevel===5?warn7:` and `prLevel===6?warn8:` branches, **first** in the chain | ✓ (called "a trap, now a double trap") |
| 4 | `PRX_LEVELS` array | `:3585` | 5 entries | append 2 more (`ci` 50-55, 60-65) | ✓ |
| 5 | `prxBuildDeck()` tones literal | `:3820` | `[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]` — 4 elements, `undefined` at index 5, **throws** on `.includes()` at index 5/6 | add early-return branches for `prLevel===5`/`===6` **before** this line (mirroring the existing `===3`/`===4` pattern at `:3817-3818`) | ✓ — scaffold correctly flags this as the sharpest trap; confirmed by direct read, this is real and would crash |
| 6 | i18n `prx_lvl1`-`prx_lvl5` | `:1499` (EN), `:1811` (ES) | 5 keys each | add `prx_lvl6`, `prx_lvl7`, EN+ES | ✓ |
| 7 | Score-display guard (hub card) | `:2949` | `i===3` ternary | must become a set/shared check | ✓ (flagged as needing to stop being "another one-off") |
| 8 | Score-display guard (**second copy**, tab strip label) | `:4435` (inside the big template) | `i===3` ternary, independent of #7 | same set/shared check, **both** copies | **NEW** — scaffold's table lists this pattern once; there are two live instances |
| 9 | `prx.best[prLevel]` **write** | `:4454-4455` | unconditional for every level | needs an actual guard — currently nothing prevents `prx.best[5]`/`[6]` (or `[3]`) from being written | **NEW** (partially — §4 says "no write" as a requirement but the write is not yet guarded anywhere, including for Hard Mode today; §8 item 7 talks about the *read* guard becoming a set, not this) |
| 10 | Lock function (hub) | `:2908` | `(i===3)&&!mUnlocked` | must express level 6's **sequential** dependency on `prx.done[5]`, not a flat OR — see §1.2 Finding C | ✓ table entry exists, but the literal proposed code in §2 doesn't satisfy §3's own stated requirement |
| 11 | Lock function (**second copy**, practice overlay) | `:4430` | same as #10, independent copy | same correction, **both** copies | **NEW** (same duplication issue as #8) |
| 12 | Tab art / CSS badge classes | `:4435` | `i===3?' hardbg':''`, `i===4?' chkbg':''` | add `i===5?' waitbg':''`, `i===6?' nostopbg':''` + matching CSS | ✓ |
| 13 | **Background-photo suppression condition** | `:4435`, same template: `(i===3‖‖i===4)?'':style="background-image:url('img/scene-${i+1}.jpg')"` | only suppresses photo for i=3,4 | must extend to `(i===3‖‖i===4‖‖i===5‖‖i===6)` or levels 5/6 will request `img/scene-6.jpg`/`img/scene-7.jpg` | **NEW** — confirmed those files don't exist (`img/` only has `scene-1.jpg`…`scene-4.jpg`, verified via `ls`); untreated, this is a live 404 on both new tabs, not a hypothetical |
| 14 | **CSS `:nth-child` tab accent colors** | `:433-438` | `:nth-child(1)` through `:nth-child(6)` already defined (`#2f8f5b … #b8860b`) for what is currently a 5-tab UI | `:nth-child(6)` is pre-provisioned and currently unused (matches the future level-5 tab automatically); `:nth-child(7)` does **not** exist — level 6's tab would fall back to the neutral gray default (`var(--tabc,#e5e0d4)`, `:432`) unless a rule is added | **NEW** — not mentioned anywhere in the scaffold. Verify `#b8860b` was actually intended for "The long wait" and isn't unrelated leftover cruft before relying on it; add `:nth-child(7)` for scenario 6 regardless |
| 15 | **Grid-suppression mechanism mismatch** | `:4478-4525` | Hard Mode's "no scoreboard" is achieved by an **early-return debrief branch** (`:4478`, `if(prLevel===3){...return;}`), **not** by `prCurTier='x'`. Scaffold §4 says "prCurTier='x'... every beat here uses it... No green/amber grid... same shape Hard Mode already uses" — conflating two independent mechanisms | Levels 5/6 need their **own** early-return branches, structurally copying `:4478`'s pattern. If built by setting every beat's `prCurTier='x'` on the *generic* results template instead (per a literal reading of §4), `prRun` stays empty all run (`:4246`, tier `'x'` beats are never pushed to `prRun`) → `prx.best[5]="0/0"`, and the generic template (`:4504-4505`) **unconditionally** renders `<div class="prx-score">0<span>/0</span></div>` and the grid — the opposite of the stated requirement | **NEW**, see full reasoning below |
| 16 | `swan` variable | `:4493` | `const swan=prLevel===3` computed **after** the `if(prLevel===3){...return;}` block at `:4478-4491` — always `false` by the time it's evaluated. Every `swan?...` branch downstream (`:4497,4506,4508,4514,4515`) is dead code today | Do not pattern-match against `swan` when building levels 5/6's results handling — it looks like live infrastructure and isn't | **NEW**, dead-code trap |
| 17 | `PRX_DO` set | `:3586`, `const PRX_DO=new Set([3,5,33])` | ci-keyed, controls whether the self-recording mic UI shows for a beat (pure physical-compliance beats like "step out," "sign here," "pull over" skip it) | if any of the 12 new beats is a pure physical-compliance beat (not yet clear from the scaffold's own beat table — closest candidates are 5a-beat-1 "comply + narrate" and 5a-beat-5 "comply physically, decline verbally," both still verbal), its `ci` needs adding here | **NEW** — not in scaffold's checklist; flag for the attorney/design pass, not a confirmed defect |
| 18 | `foot` template's Hard-Mode-only carry-card suppression | `:4470`, `prLevel===3?'':...carryOpen()...` | suppresses the "carry card" link only for Hard Mode | undecided whether scenarios 5/6 should also suppress it — scaffold doesn't say | **NEW** — flag as an open decision, not a bug |

**Reasoning for #15 in full**, since it's the least obvious: `PRX_OPT`'s existing `bothGood:true` mechanism (already used by Hard Mode, `PRX_OPT[20‑22]`) sets `prCurTier=(o.bothGood‖‖good)?'g':'y'` (`:3632`) — i.e. `bothGood` beats are always tier `'g'`, **not** tier `'x'`. `prCurTier='x'` in the current codebase is used exclusively for the crisis-language safety net (`:4025`, `:4169`) — a reactive, single-beat override inside an otherwise normally-scored level, never applied to every beat of an entire level. There is no precedent anywhere in the file for an all-`'x'` level, so an implementation that follows §4's literal instruction ("every beat here uses [prCurTier='x']") would be exercising genuinely new, untested territory, and — per the `prRun`-accumulation logic at `:4246` and the unconditional write at `:4454-4455` (finding #9 above) — would produce a `"0/0"` `prx.best` entry and, if the generic template path is reached at all, a literal `0/0` score and an empty (but rendered) results grid. The reliable way to get "no green/amber grid" is the same mechanism Hard Mode actually uses: its own early-return branch before the generic template is ever reached, matching `:4478`. This is worth surfacing now because §4's prose reads as a ready-to-copy recipe and isn't one.

### Sites confirmed correctly EXCLUDED — verified, no change needed

Listed because a hostile reviewer (or an over-eager implementer) could plausibly "fix" these by extending them to 5/6, which would be wrong:

- Hub progress bar `[0,1,2,3].filter(...)`, `.replace('{t}',4)`, `rungsDone/4*100` (`:2929,2932-2933`) — scaffold §3 explicitly says leave alone; independently verified the reasoning holds (measures the *numbered ladder* only).
- `mUnlocked=prx.done[0]&&prx.done[1]&&prx.done[2]` (`:2907`, `:4426`) — inherently scoped to indices 0-2 regardless of total level count; correct as-is in both copies (though see finding — it'd be cleaner as one shared function, not zero-risk duplication).
- Certificate array `[_t.prx_lvl1,_t.prx_lvl2,_t.prx_lvl3]` (`:4382`) — stays at the first 3, confirmed by direct read.
- Results-screen stats row `${[0,1,2].filter(i=>prx.done[i]).length}/3` (`:4512`) — same "first 3 only" pattern as the progress bar; a **third** near-identical hardcoded-3 site the scaffold's table doesn't separately enumerate, but correctly needs no change.
- Checkpoint-specific note `prLevel===4?...` (`:4466`) — legitimately singular to checkpoint, not a level-count assumption.
- `_runs` total (`:4463`, `Object.keys(prx.runs).reduce(...)`) — iterates whatever keys exist; will automatically include 5/6 once they write to `prx.runs`, no change needed.
- `prLevel>=2` consent-gate check (`:4425,4436`) — scaffold correctly notes this "auto-arms... for free" for indices 5 and 6, verified true (both `>=2`).
- `prLevel<2` "next level" button (`:4521`) — naturally never offers 5/6 as a next step; reinforces (doesn't contradict) scaffold §6's explicit "don't offer 6 immediately after 5" requirement.
- `PRX_LEVELS[3]`/`[4].rate` — confirmed genuinely dead (`grep '\.rate\b'` shows the only read is `tn.rate` from `PRX_TONE`, never `PRX_LEVELS[i].rate`); scaffold's "rate is dead data" claim independently verified true, appending `rate:1.0` for 5/6 is cosmetic-only as stated.

---

## 3. General fresh sweep

### 3.1 Hub card grid — hardcoded column count? (explicit ask)

`index.html:260`: `.pr-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}` — **yes, hardcoded to exactly 2 columns**, not a responsive `repeat(auto-fit/auto-fill,...)` pattern (contrast with the practice-overlay's own `.prx-tabs` desktop grid at `:430`, which **does** use `repeat(auto-fit,minmax(150px,1fr))` — the two components made different choices).

**Does it break past 5 cards? No.** CSS grid with a fixed 2-column track and a non-multiple-of-2 item count just leaves the last row short — today: 5 cards → rows of 2, 2, 1 (Checkpoint alone on row 3). At 7 cards → rows of 2, 2, 2, 1 (the new scenario 6 alone on row 4). No overflow, no broken layout, no crash — this is the same cosmetic "orphan card" pattern that already exists today, just one row longer. **Verified, not a defect.** Worth a design glance only if a different visual treatment is wanted for a taller hub (e.g. whether a lone climactic-scenario card sitting by itself reads as intentional or accidental), not an engineering fix.

### 3.2 Dead code found this pass (new, beyond the prior audit's LOW list)

- `const swan=prLevel===3;` (`:4493`) — unreachable, see Task 2 finding #16. Every `swan?...` ternary downstream is dead.
- `prx_done4_t` / `prx_done4` i18n keys, **both languages** (`:1532-1533` EN, `:1842-1843` ES) — only ever referenced from the dead `swan` branches (`:4506`,`:4515`); orphaned, same shape as the prior audit's `prx_warn5` finding.
- `const L=PRX_LEVELS[prLevel], deck=PRACTICE[lang];` (`:4422`) — both locals declared, neither used anywhere in `practiceRender()` (confirmed by grep across the function body); `prDeck`/`PRACTICE[lang][ci]` are used instead throughout. Harmless, but exactly the kind of "looks live, isn't" trap that costs a future editor time.
- (Carried from §1.3) non-hostile unreachable `PRX_VAR` entries for ci 4, 5, 6.

None of these change behavior. **Severity: low**, all four — but worth a cleanup pass before the 5/6 integration specifically, since a couple of them (`swan`, the `L`/`deck` locals) sit directly in the code the next implementer will be reading and editing.

### 3.3 Error handling, analytics honesty, and general hygiene — unchanged from prior audit, spot-checked

- No `console.log`/`console.debug`/`console.warn`/`console.error`/`debugger` statements anywhere in `index.html` (grepped whole file, zero matches).
- No premature scaffold leakage: grepped `PRX_WAIT`, `PRX_NOSTOP`, `prx_warn7`, `prx_warn8`, `TODO_ATTORNEY`, and `ci:5[0-5]`/`ci:6[0-5]` — zero matches. The scaffold's own claim ("no `index.html` changes made or authorized") holds.
- The two shipped fixes both follow the file's existing try/catch idiom consistently (`prxMuteTgl`, `prxSpeakTTS` both already wrapped as needed); neither introduces a new unguarded throw site.
- `ph('sr_practice_mute',...)` (`:3897`) — unchanged, still fires once per toggle with an honest `{muted,lang}` boolean either direction. No new analytics call was added by any of the three fixes (the hub-card and PRX_VAR fixes are pure rendering/content changes with no tracking implications).
- Prior audit's still-open carry-forwards, reverified unchanged this pass: `ip:false` not present in `posthog.init()` (M6); `capture_performance:false` absent (remainder of H3); no `window.onerror`/`unhandledrejection` handler anywhere in the file (H5). Not re-detailed per instructions — status only.
- The scaffold's own §6 blocking item ("mute must be reachable *before* the first line plays") is unchanged and already tracked by the scaffold itself as a ship-blocker — confirmed the mechanism: the mute button (`:4561`, inside the per-beat `ctrls` template) renders in the **same** `practiceRender()` call that `practiceOpen()` immediately follows with `prxSpeak()` (`:4194`-ish), so the control exists in the DOM an instant before audio starts, but there is no deliberate pause/gate giving the user a chance to act on it first. Not newly flagged — this is exactly the gap the scaffold already names.

---

## 4. Punch list, severity-ordered

1. **HIGH** — §4's "unscored" plan for levels 5/6 (`prCurTier='x'` on every beat) does not, by itself, suppress the results grid; only the early-return debrief pattern Hard Mode actually uses does that. Implemented literally, risks a `"0/0"` score and a rendered (not suppressed) grid on the flagship scenario. **Fix:** give scenario 5 and 6 their own `if(prLevel===5){...return;}` / `if(prLevel===6){...return;}` branches, structurally copying `:4478-4491`, before the generic results template. (Task 2 finding #15)
2. **HIGH** — the scaffold's own §2-tabled fix for the lock function (`(i===3‖‖i===5‖‖i===6)`) contradicts its own §3 sequential-gating requirement for level 6 (`prx.done[5]`). Implemented as tabled, level 6 unlocks alongside level 5 instead of after it. **Fix:** correct the boolean in both copies (`:2908`, `:4430`) to express the sequential dependency, not a flat set. (§1.2 Finding C / Task 2 #10-11)
3. **MEDIUM** — hub score-leak guard is a display-only patch in (now confirmed) **two** independent one-off sites; the underlying `prx.best[prLevel]` write (`:4454-4455`) is still fully unconditional for every level including Hard Mode today. Any future third read site re-leaks. **Fix:** one shared unscored-levels check, consumed by both display sites and the write. (§1.2 Findings A/B, Task 2 #7-9)
4. **MEDIUM** — background-photo suppression condition (`i===3‖‖i===4`, `:4435`) not extended to 5/6 will request `img/scene-6.jpg`/`img/scene-7.jpg`, confirmed not present in `img/`. **Fix:** extend the condition alongside the `.waitbg`/`.nostopbg` badge classes the scaffold already plans to add. (Task 2 #13)
5. **MEDIUM** — stale-card TTS on rapid re-trigger, confirmed still live this pass, unrelated to mute (prior audit item 5, not touched by `e586fe4`). **Fix:** capture `prIdx`/`prLevel` at `prxSpeak()` call time, check unchanged before the fallback speaks. (§1.1)
6. **LOW-MEDIUM** — CSS `:nth-child` tab accent colors stop at `(6)`, none at `(7)`; `(6)` is oddly pre-provisioned for a tab that doesn't exist yet. Verify `#b8860b` is deliberate before relying on it for scenario 5; add `:nth-child(7)` for scenario 6. (Task 2 #14)
7. **LOW** — `mUnlocked`/lock-function logic duplicated in two independent copies each (hub vs. practice overlay); recommend consolidating into one shared function before adding more special-cased indices to both. (Task 2 #8, #11)
8. **LOW** — dead code: `swan` (always false), `prx_done4_t`/`prx_done4` (EN+ES, orphaned), unused `L`/`deck` locals in `practiceRender()`. Worth clearing before the next implementer mistakes any of it for live infrastructure. (§3.2)
9. **LOW** — non-hostile unreachable `PRX_VAR` entries for ci 4, 5, 6, outside the stated scope of `f205531`'s "hostile lines" sweep. (§1.3)
10. **LOW / INFO** — `PRX_DO` (ci-keyed physical-compliance set) and the `foot` template's Hard-Mode-only carry-card suppression may each need new entries/decisions for scenarios 5/6 — not confirmed defects, flagged for the design/attorney pass. (Task 2 #17-18)
11. **Verified, no action** — hub card grid's fixed 2-column layout does not break at 7 cards, just continues the existing "orphan last card" cosmetic pattern. (§3.1)
12. **Verified, no action** — progress bar, `mUnlocked`'s 0-2 scope, certificate array, results "of 3" stats row, `_runs` total, `prLevel>=2`/`prLevel<2` gates, `PRX_LEVELS[3-4].rate` all correctly need zero change for 5/6. (Task 2, exclusion list)
13. Carry-forward, unchanged, not re-detailed: M6 (`ip:false`), H3 remainder (`capture_performance:false`), H5 (no global error handler) — still open. Mute-before-first-play pre-exposure gap — still open, already a scaffold §6 ship-blocker, not newly flagged.

---

## Appendix — reproduction (this pass)

```bash
cd C:/Users/mfran/Ai-Foundations/Amparo
git diff v2.7.4 HEAD -- index.html   # empty — working tree citations == tagged v2.7.4
python -m http.server 8778 --bind 127.0.0.1
```
Then, in the browser console against `http://127.0.0.1:8778/`:
```js
// 1. Mute-race fix — now closed (Task 1.1)
window.__ttsCalls=[]; const origTTS=prxSpeakTTS;
window.prxSpeakTTS=function(d,useEs){window.__ttsCalls.push({muted:prxMuted,id:d.id});return origTTS(d,useEs);};
window.__spoke=[]; const origSpeak=speechSynthesis.speak.bind(speechSynthesis);
speechSynthesis.speak=function(u){window.__spoke.push(u.text);return origSpeak(u);};
prDeck=prxBuildDeck(); prIdx=0; prLevel=0; prxMuted=false;
prxSpeak(); prxMuteTgl();
// wait 2s, then: window.__ttsCalls[0].muted===true, window.__spoke.length===0 — fallback fired, guard blocked it

// 2. Stale-content TTS on rapid re-trigger — still open, unrelated to mute (Task 1.1 residual)
prDeck=prxBuildDeck(); prLevel=0; prxMuted=false;
prIdx=0; prxSpeak(); prIdx=1; prxSpeak();
// wait 2s: window.__spoke gets card-0's stale line, spoken after prIdx already advanced to 1

// 3. Confirm no scaffold leakage into index.html
grep -nE "PRX_WAIT|PRX_NOSTOP|prx_warn7|prx_warn8|TODO_ATTORNEY" index.html   # zero matches
```
