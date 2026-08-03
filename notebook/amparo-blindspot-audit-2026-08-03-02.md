# Amparo — Blind-Spot Audit 02 (follow-up)

**Date:** 2026-08-03
**Scope:** `index.html` **at tag `v2.7.3`** (commit `0ac3f76`; content identical to commit `60ae7bc`, verified via `git diff v2.7.3 HEAD -- index.html` → no hunks). This is step 9 of `/amparo-loop`, run in parallel with step 8 (module design review) and a 10-persona focus group.
**Subject of this pass:** two changes not covered by the original 2026-08-03 audit (that audit was taken at commit `a60717f`, which predates both): (1) `8ce9639` officer-voice mute, (2) `9fcd5d6` level merge + localStorage migration.
**Method:** static read of `index.html` at the `v2.7.3` tag (all citations below are against `git show v2.7.3:index.html`, not the mutable working tree — see §0), plus live instrumentation: `python -m http.server 8777`, Chrome via the Claude Browser tool, direct calls into the app's own global functions (`prxSpeak`, `prxMuteTgl`, `prxSpeakTTS`, the `prx` migration state) from the page's JS console context. No source file was edited.
**Read first, per instructions:** `notebook/amparo-blindspot-audit-2026-08-03.md`. Nothing it already found is repeated here except where explicitly noted as a fixed/still-open status check. UPL and the door module are not re-flagged (both known, tracked, out of scope per instructions).

---

## 0. Process note — index.html moved under me while auditing (benign, explained, but methodologically important)

**Not a severity-rated app finding. Recording it because it's why every citation below is pinned to the `v2.7.3` tag instead of the working tree, and because it's a useful data point on how this `/amparo-loop` pass actually ran.**

Partway through this audit, `git status` on `index.html` turned from clean to `M index.html`, with a diff scoped to `PRX_VAR` (removing now-unreachable `"hostile"`-tone dialogue variants) and a couple of stale comments — none of it touching any code this report cites. I did not make that change (every tool call I ran against `index.html` was `Read`/`Grep`/`git show`, or browser JS against a throwaway `http.server` copy; nothing in my toolset writes to the source file). By the time I finished, `git log` showed it had resolved itself: it landed as commit `f205531` — the module-design-review agent (step 8 of this same loop, `wargames/08-mute-fix-modules.md`) found those lines were unreachable after the level merge, and it was fixed and committed live during this session. A second commit, `37e4ffe`, landed the same way from this session's focus-group agent (see the hub-card finding in §2 below — I verified that one myself independently rather than taking the commit message on faith).

So: three verification agents (this audit, the module-design review, the focus group) ran in parallel over the same `v2.7.3` diff, and at least two of them surfaced real, small, upstream-of-my-scope issues that got fixed and committed while all three were still running. Nothing adversarial, nothing unattributed — just a fast-moving concurrent session. The methodological consequence stands regardless: **every citation in this report is verified against `git show v2.7.3:index.html`** (extracted to a scratch file up front), not the live working tree, specifically so a concurrent commit landing mid-audit couldn't shift my line numbers or silently swap in content I hadn't reviewed. I confirmed the stray diff's hunks fell entirely within lines 3638–3742 (the `PRX_VAR`/`PRX_CURVE` bank), upstream of everything this report discusses (`prxMuted` at 3884, `prxSpeak` at 3947, the migration IIFE at 3852, `prxPlayLast` at 4068, the hub at 2907–2945) — so none of the findings below were contaminated by it, and the line numbers you'll find if you check out `v2.7.3` right now will match exactly.

---

## 1. Mute implementation audit

### CRITICAL — Muting mid-playback can itself trigger the synthesized voice to speak the line anyway

**Severity: critical. Verified live, 100% reproducible.**

The claim at `index.html:3949-3951` — *"Gated at the single entry point so no caller can bypass it"* — is not true in one reachable case, and it's the case that matters most: **the act of muting can cause the officer's line to be spoken by `speechSynthesis` a moment later, despite `prxMuted === true`.**

**Mechanism.** `prxSpeak()` (`:3947-3966`) starts an `Audio` clip and wires its failure paths straight to the unguarded TTS fallback:

```js
// index.html:3958-3963
const a=new Audio(`audio/${useEs?'es':'en'}/${prxGender}/${d.id}.mp3`);
prxAudio=a;
a.onplay=()=>prxWaveTgl(true);
a.onended=()=>prxWaveTgl(false);
a.onerror=()=>{ prxWaveTgl(false); prxSpeakTTS(d,useEs); };
a.play().catch(()=>prxSpeakTTS(d,useEs));
```

`prxMuteTgl()` (`:3886-3895`), when engaging mute, does exactly what you'd want — pauses the element and cancels speech:

```js
// index.html:3889-3891
try{ if(prxAudio){ prxAudio.pause(); prxAudio=null; } if(prxTTS) speechSynthesis.cancel(); }catch(e){}
```

The bug: calling `.pause()` on an `Audio` element while its most recent `.play()` request has **not yet settled** rejects that promise (standard, well-documented browser behavior — Chrome's rejection reason is literally *"The play() request was interrupted by a call to pause()"*). That rejection lands in the `.catch()` on line 3963, which calls `prxSpeakTTS(d,useEs)` — and **`prxSpeakTTS()` (`:3967-3980`) has no mute check at all.** It unconditionally calls `speechSynthesis.speak(u)`. The fallback logic was written to handle "the clip failed to play," and cannot tell that apart from "we ourselves just interrupted it on purpose."

**Live reproduction** (Chrome, via the app's own functions, no source edited):

```js
speechSynthesis.speak = function(u){ log.push('speak: '+u.text); return orig(u); }; // instrumented only
prDeck = prxBuildDeck(); prIdx = 0; prLevel = 0; prxMuted = false;
prxSpeak();       // starts loading audio/en/m/v0_0.mp3
prxMuteTgl();     // mute, on the very next line
// → prxMuted === true
// → speechSynthesis.speak fires anyway, ~immediately after, speaking "License and registration, please."
```

Result captured: `{"muted":true, log:["speechSynthesis.speak: License and registration, please."]}`. `speechSynthesis.speaking` was `true` after mute was engaged.

**Control test, to isolate the window:** muting *after* the clip has genuinely finished (`prxAudio.paused===true, ended===true, currentTime>0`) does **not** trigger TTS — confirms this isn't "mute is broken," it's specifically the pending-promise window. And muting while `speechSynthesis` is already actively speaking (forced via `prxSpeakTTS()` directly) **does** correctly and immediately stop it (`speaking` flips `true`→`false` synchronously). So both "stop what's already playing" paths work; the hole is specifically the async fallback re-arming itself after an interruption.

**Why the window is realistically reachable, not just a synthetic race:** the vulnerable window is "between calling `.play()` and that promise settling." For a clip the service worker hasn't cached yet (per the prior audit's M3 finding, clips cache lazily one at a time — first play of any given id/gender/language combo requires a real network fetch), that window is easily hundreds of milliseconds to seconds on the prepaid/slow connections this app is explicitly built for. The single most natural time a distressed user hits "Silence the officer" is *the instant they hear it start* — which is exactly when a first-play clip is least likely to have finished loading yet.

**Who this hits hardest.** The mute feature's own design comment (`:3878-3883`) names its primary persona: *"a stop survivor for whom the synthesized hostile voice IS the trigger."* This bug means that for exactly this persona, tapping the panic button can itself produce a burst of synthesized hostile speech a beat later — the one outcome the feature exists to prevent.

**Related, same root cause, also verified live:** the same unguarded fallback also produces *wrong-content* output, independent of mute. Triggering `prxSpeak()` for card A, then immediately re-triggering it for card B (e.g. a fast double-tap on the gender/language toggle, or advancing before a slow clip resolves — both call `prxSpeak()` back-to-back the same way `prxMuteTgl()`'s pause does) causes card A's stale line to be spoken via TTS *after* card B's real audio has already started, because the `.catch()` closure captured card A's `d`/`useEs` and never re-validates against current `prIdx`/`prLevel`:
```
card A spoken (idx0, id=v0_0)
card B spoken (idx1, id=v8_1)
TTS FIRED for: License and registration, please.   ← card A's line, after B started
```

**Fix (small, and the codebase already has the pattern to copy).** Re-check `prxMuted` — and ideally a per-call token, the same idea as the existing `prxTok` guard already used for the recorder at `:4069-4071` — before falling back to TTS:
```js
a.onerror=()=>{ prxWaveTgl(false); if(!prxMuted) prxSpeakTTS(d,useEs); };
a.play().catch(()=>{ if(!prxMuted) prxSpeakTTS(d,useEs); });
```
That alone closes the mute-bypass. Closing the stale-content variant too means capturing `prIdx`/`prLevel` at call time and checking they're unchanged before speaking.

---

### HIGH — The user's own recorded playback ignores mute entirely, including an automatic playback the user never asked for

**Severity: high. Code path verified by static read — unambiguous, no timing/async subtlety like the finding above, a plain unconditional call. NOT VERIFIED: an actual live click-through (record → stop → audible playback), which needs a granted microphone in the browser tool that wasn't set up for this pass.**

Two more `new Audio(...).play()` call sites exist outside `prxSpeak()`, both operating on `prxLastUrl` — the user's **own** recorded voice from `MediaRecorder`, not the officer's:

```js
// index.html:4068 — explicit "play back my answer" button
function prxPlayLast(){ if(prxLastUrl){ try{ new Audio(prxLastUrl).play().catch(()=>{}); }catch(e){} } }

// index.html:4119 — INSIDE rec.onstop, fires automatically, no user action beyond stopping the recording
prxLastUrl=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||'audio/webm'}));
const pb=document.getElementById('prxPlayback'); if(pb) pb.removeAttribute('disabled');
try{ new Audio(prxLastUrl).play().catch(()=>{}); }catch(e){}
```

Neither checks `prxMuted`. That's arguably in-scope for the feature as *labeled* — the button copy is literally "🔇 Silence the officer" / "Silenciar al oficial" (`:1537`, `:1847`), not "silent mode" — so a strict reading says self-playback was never promised to respect it.

But the design comment that justifies the whole mute feature (`:3878-3883`) names two personas, and only one of them is about the officer's voice specifically:

> *"a stop survivor for whom the synthesized hostile voice IS the trigger, **and anyone rehearsing somewhere they cannot make noise**."*

Line 4119 defeats the second persona directly. It requires no extra tap: user mutes, taps record, speaks their practice answer quietly, taps stop — and the phone immediately plays their own voice back out loud at speaker volume, with no way to prevent it short of muting the device itself. That's the opposite of what "somewhere they cannot make noise" needs, and it happens on the single most core interaction in the practice engine (recording an answer), not an edge case.

`prxPlayLast()` (the explicit "hear my answer again" button) is more defensible since it's a deliberate second tap — but note the asymmetry: the officer's "Hear it again" button is hidden from the UI entirely when muted (`:4544`, `${prxMuted?'':'<button ... onclick="prxSpeak()">'}`), while the self-playback button is not hidden and stays enabled regardless of mute state.

**Fix.** Gate the automatic playback at minimum — it's the one firing with no additional user action:
```js
if(!prxMuted){ try{ new Audio(prxLastUrl).play().catch(()=>{}); }catch(e){} }
```
`prxPlayLast()` is a smaller judgment call; consider whether "muted" should mean "officer only" or "this device makes no unexpected sound," and pick one deliberately rather than leaving it as an accident of which function happened to check what.

---

### Verified healthy (mute) — state these if challenged

| Question from the task | Result | Evidence |
|---|---|---|
| Can `prxSpeak()` fire before `prxMuted` is read from localStorage on a cold load? | **No.** | The whole app is a classic (non-`defer`, non-`module`) inline `<script>`; `prxMuted` is initialized synchronously at `:3884-3885`, long before any practice UI exists. Every entry point into `prxSpeak()` (`practiceOpen`, `prxTab`, `prStart`, the gender/language toggles) requires a rendered, clicked button — impossible before the full script (including line 3885) has already executed once. |
| Does mute stop audio that's already stably playing? | **Yes, both paths**, once the play/speak request has actually settled. | Live: muting after `ended:true` on the Audio element → no TTS fallback fires. Muting while `speechSynthesis.speaking===true` → `speaking` flips to `false` synchronously. The bug above is specifically the *pending* window, not general unreliability. |
| Corrupt/legacy `amparo_muted` value | Safe default. | `prxMuted=localStorage.getItem('amparo_muted')==='1'` — strict-equals against `'1'`; anything else (`null`, `'0'`, `'true'`, garbage) safely resolves to `false` (unmuted). |

---

## 2. Migration audit — the highest-risk surface in this diff

**Headline: the core logic is correct.** I hand-traced it, then reproduced all three scenarios the task asked for live in-browser against the actual app code (not a reimplementation), and all three came back clean.

### Verified correct — old-index-3 drop, old-4→3 and old-5→4 shift, idempotency, brand-new user

The migration (`index.html:3852-3874`) runs once, guarded by `prx.v>=2`:
```js
// index.html:3860-3874
(function(){
  try{
    if(prx.v>=2) return;
    const shift=o=>{ if(!o) return o;
      const n={};
      if(o[0]!==undefined) n[0]=o[0];
      if(o[1]!==undefined) n[1]=o[1];
      if(o[2]!==undefined) n[2]=o[2];
      if(o[4]!==undefined) n[3]=o[4];   // hard mode  4 -> 3
      if(o[5]!==undefined) n[4]=o[5];   // checkpoint 5 -> 4
      return n; };
    prx.done=shift(prx.done); prx.best=shift(prx.best); prx.runs=shift(prx.runs);
    prx.v=2; prxSave();
  }catch(e){}
})();
```

**Test 1 — a populated pre-merge save**, simulated with distinct data on all six old levels (`done`, `best` as real `"N/M"` fractions, `runs`, plus a `streak`) and no `.v` field, loaded fresh:

```
in:  done:{0..5:true} best:{0:'5/5',1:'6/6',2:'2/2',3:'6/6',4:'3/3',5:'4/4'} runs:{0:3,1:2,2:1,3:1,4:1,5:1}
out: done:{0,1,2,3,4:true} best:{0:'5/5',1:'6/6',2:'2/2',3:'3/3',4:'4/4'} runs:{0:3,1:2,2:1,3:1,4:1} v:2
```

Old index 3 ("the hard stop") is dropped everywhere — not remapped, not fabricated. Old 4→new 3 and old 5→new 4 shifted correctly across `done`/`best`/`runs` simultaneously. `streak` (not level-indexed) passed through untouched. I cross-checked the carried-over fractions against the **actual current deck sizes**: new level 3 (hard mode) builds from `PRX_HARD` (3 items, `index.html:3701-3711`) — carried `"3/3"` is dimensionally correct; new level 4 (checkpoint) builds from `PRX_CHK` (4 items, `:3761-3774`) — carried `"4/4"` is correct too. A returning user's progress bar will render truthfully against the new deck, not against a stale denominator.

**Test 2 — idempotency.** Reloading a second time against the now-`v:2` save produced a **byte-identical** `prx` object to the first load. The guard works. And structurally, double-shift corruption isn't reachable even if `prxSave()` ever silently failed (e.g. quota exceeded): each load re-reads `raw` from localStorage from scratch into a fresh `prx` binding, so a failed persist just means the *original* unshifted data gets re-shifted identically next time — never a re-shift of already-shifted data.

**Test 3 — brand-new user, no `amparo_prx` key at all.** No console error. Migration path: `raw={}` → `raw.done` falsy → the v1-flat-migration `forEach` runs over zero keys → `prx` stays at its default `{done:{},runs:{},streak:{...}}` → `shift()` on each empty object returns an equivalent empty object → `v:2` stamped and saved. Correctly a clean no-op, confirmed live: `{done:{},runs:{},streak:{last:'',n:0},best:{},v:2}`.

**Test 4 — corrupted JSON** (`localStorage.amparo_prx = '{not valid json!!!'`). Caught by the existing `try/catch` around `JSON.parse` (`:3846-3850`), falls back to the same clean-default path as Test 3. No crash.

**The one input that produces a wrong (not crashing) result — self-inflicted only.** Setting `amparo_prx` to a bare JSON *string* (`localStorage.setItem('amparo_prx', '"hello"')`) doesn't error, but it does fabricate bogus progress: `Object.keys("hello")` walks the string's character indices (`'0'..'4'`), all truthy, and the v1-flat-migration branch reads that as `{0:true,1:true,2:true,3:true,4:true}` before `shift()` runs, producing `done:{0:true,1:true,2:true,3:true}` out of thin air. This requires the user (or a script with page access) to hand-set a non-object value into that key — the app itself never writes anything but a plain object there — so it isn't organically reachable, and the worst outcome is a fake checkmark on a level card, not a crash or data loss. Noting it because the task asked me to try to break it; I couldn't find anything that actually breaks (throws/corrupts unrecoverably), only this low-stakes tampering-only edge case.

### MEDIUM — The hub card leaked a score on the one level designed to never show one (found late, own miss, now fixed upstream — see note)

**Severity: medium. Verified independently against the pristine `v2.7.3` snapshot — this was real in the tagged build.**

`prxTab()`'s tab strip (`index.html:4417`) deliberately special-cases hard mode (`i===3`, the swan/unwinnable level) to show only a checkmark, never a score — matching the results screen's own "no celebration on the arrest/black-swan levels — deliberate" rule (`:4475-4480`, `sober`/`swan`/`master`). The step-5 hub card grid, three sections up in the same file, never got that guard:

```js
// index.html:2944 (v2.7.3)
<span class="pr-st">${isLk?_t.hub_locked:(best?`🟩 ${esc(best)}`:(done?_t.hub_done:_t.hub_start))}</span>
```

`best` is read unconditionally for every level 0-4. Since `prx.best[prLevel]` is written regardless of level (confirmed at `:4438`), a completed Hard Mode run renders `"🟩 3/3"` on the hub — the exact scored-outcome framing the level exists to argue against (its whole pedagogical point, per the level's own warning copy, is that good technique doesn't guarantee a good outcome; a fraction badge quietly re-introduces "you can win this").

**Process note, for transparency:** I read this exact block while investigating the denominators comment finding below and did not catch the missing guard myself on the first pass — this session's parallel focus-group agent (running as a different step of the same `/amparo-loop` verification pass) found it, live-proved it side-by-side, and it was fixed and committed as `37e4ffe` while this audit was in progress. I verified the bug independently against my own pristine `git show v2.7.3:index.html` snapshot rather than taking the commit message on faith — it checks out; the guard genuinely was missing in the tagged build. Recording it here because the task is to audit `v2.7.3`, and it was a real gap in that tag, even though the working tree has since moved past it. No action needed on your end — already fixed, and the fix (`i===3?(done?_t.hub_done:_t.hub_start):(...)`) matches the tab strip's existing pattern.

### MEDIUM — The migration is irreversible, runs in every returning user's browser, and emits zero telemetry

`prxSave()` overwrites the pre-migration raw data immediately (`:3872`), and no backup copy is kept under any other key. No `ph(...)` call exists anywhere in the migration IIFE or the v1-flat-shape branch — there is no signal, even a non-PII count, of how many returning users hit this path, how many had data on the now-deleted old index 3, or whether the shift ever throws in the wild (the `try/catch` would silently eat it). The commit message for `9fcd5d6` itself calls this "the part most likely to cause silent damage" — which makes the absence of any way to observe it in production worth flagging even though I verified the logic is correct today. A single counter, e.g. `ph('sr_prx_migrated',{hadOldHardStop:!!(raw.done&&raw.done[3])})` right after the shift, would make this observable without touching the app's minimal-analytics posture.

### LOW — Dead weight the merge left behind (comment/string cleanup, zero runtime effect)

- `index.html:4190` — `const seen=prx.done[0]||prx.done[1]||prx.done[2]||prx.done[3]||prx.done[4]||prx.done[5];` — `prx.done[5]` can't exist under the new 5-level (0-4) scheme; it's an inert extra OR term, harmless but stale.
- `index.html:2941-2943` — the comment *"denominators DIFFER per level (5/6/2/6/3/4)"* (introduced pre-merge in `8ce9639`) lists six values for what is now a five-level scheme (correct list would be `5/6/2/3/4`, matching `PRX_LEVELS[0].ids.length=5, [1]=6, [2]=2, PRX_HARD.length=3, PRX_CHK.length=4`). `9fcd5d6` updated the adjacent `rungsDone` comment two lines up (`:2925-2928`, correctly says "four NUMBERED rungs... 0-3") but missed this one.
- `index.html:1504` (EN) / `:1816` (ES) — `prx_warn5` is defined in both language tables and never read anywhere (`_t.prx_warn5` has zero call sites — verified by grep). The merge correctly folded its content into `prx_warn4` (confirmed: `prx_warn4`'s text — *"It's late, the officer is hostile from the first word... you do everything right and he stays hostile anyway"* — literally contains both halves the commit message describes merging) but left the now-orphaned original sitting in both languages.

None of these three change behavior. They're the kind of residue a hostile reviewer diffing the commit would flag as an incomplete sweep, even with the functional logic next to them being correct.

---

## 3. General fresh sweep

### Prior-audit status check (confirming, not re-litigating — see instructions)

| # | Finding | Status | Evidence (v2.7.3) |
|---|---|---|---|
| H4 | PostHog Surveys live | **Fixed** | `disable_surveys:true` at `:1279` |
| H3 | 361KB analytics payload | **Partially fixed** | `capture_dead_clicks:false` at `:1280` landed; `capture_performance:false` (the third recommended line, ~6.7KB) — grep found **zero** occurrences, not applied |
| H1 | First-visit double reload/pageview | **Fixed** | `if(!navigator.serviceWorker.controller) return;` guard now present at `:4684`, comment rewritten to explain why |
| C1 | Printed pack never knew its edition | **Fixed, and wired through, not just stored** | `printedEdition` declared `:2391`, saved in `sr_save` `:2977`, restored `:3003`, compared in `packFreshness()` `:2206`, set on print `:4704`, cleared on restart/stale-update (`:3251,3260,3268`) |
| M6 | `ip:false` not pinned explicitly | **Still open** | Zero occurrences of `ip:false`/`ip: false` in `posthog.init()` |

### Analytics honesty — the two new features specifically

- `sr_practice_mute` (`:3893`) fires once per `prxMuteTgl()` call with an accurate `{muted, lang}` — correctly represents both the mute *and* unmute direction via the boolean, not just a one-way "muted" ping. No double-fire path (not inside retry/async logic). Honest.
- The migration itself fires no event at all — see the MEDIUM finding above; omission, not misrepresentation, but notable since every other state-changing path in this file does report something.
- `sr_practice_hub_start`, `sr_practice_level_started`, `sr_practice_self_record`, `sr_practice_typed`, `sr_practice_keywords_hit` — each fires exactly once per the user action its name implies; no double-count paths found in or introduced by this diff. Demo-mode suppression (`ph()`'s short-circuit) is unchanged and still applies uniformly.

### Error handling

Prior audit's H5 (no `window.onerror`/`unhandledrejection`, no exception capture) is unchanged by this diff — not re-flagged in detail since it's already tracked as open. Both new code paths (mute, migration) follow the file's existing `try/catch`-everywhere idiom consistently; neither introduces a new unguarded throw site. No `console.log`/debug statements were left in either commit (`git show <sha> -- index.html | grep console.` on both is empty).

---

## 4. Suggested order

1. **Mute mid-load TTS bypass** (critical) — guard `prxSpeakTTS()` calls in `prxSpeak()`'s `onerror`/`.catch()` with `if(!prxMuted)`. Two lines.
2. **Self-recording auto-play ignores mute** (high) — gate `index.html:4119`'s auto-play with `if(!prxMuted)`. One line.
3. ~~Hub card leaked a score on the swan level~~ (medium) — **already fixed upstream, commit `37e4ffe`, while this audit was in progress.** No action needed.
4. **Migration observability** (medium) — one `ph()` call after the shift, non-PII.
5. **Stale-content TTS on rapid re-trigger** (same root cause as #1, lower likelihood) — capture `prIdx`/`prLevel` at call time, check unchanged before speaking in the fallback.
6. Dead-code sweep (low) — drop `prx.done[5]`, fix the denominators comment, delete `prx_warn5`×2. (Note: the `denominators DIFFER` comment this sweep would fix is the same one already touched by `37e4ffe`'s patch — re-check it's still `5/6/2/6/3/4` before editing again.)
7. Carry-overs from the prior audit still open: M6 (`ip:false`), the last third of H3 (`capture_performance:false`), H5 (global error handler + exception capture).

Items 1–2 are three lines total and close the only finding in this pass that contradicts the feature's own stated safety purpose under realistic, non-contrived conditions.

---

## Appendix — reproduction

```bash
cd C:/Users/mfran/Ai-Foundations/Amparo
git show v2.7.3:index.html > /tmp/index-v273.html   # pristine citation source, unaffected by the working-tree diff in §0
python -m http.server 8777 --bind 127.0.0.1
```

Then, in the browser console against `http://127.0.0.1:8777/`:

```js
// Finding 1 — mute mid-load TTS bypass
speechSynthesis.speak = (orig => u => { console.log('SPOKE:', u.text); return orig.call(speechSynthesis, u); })(speechSynthesis.speak.bind(speechSynthesis));
prDeck = prxBuildDeck(); prIdx = 0; prLevel = 0; prxMuted = false;
prxSpeak(); prxMuteTgl();
// wait ~1s, then: speechSynthesis.speaking / the SPOKE log line — fires despite prxMuted===true

// Migration — populated old save
localStorage.setItem('amparo_prx', JSON.stringify({
  done:{0:true,1:true,2:true,3:true,4:true,5:true},
  best:{0:'5/5',1:'6/6',2:'2/2',3:'6/6',4:'3/3',5:'4/4'},
  runs:{0:3,1:2,2:1,3:1,4:1,5:1}, streak:{last:'2026-08-01',n:4}
}));
location.reload();
// then: prx  →  done/best/runs shifted, old index 3 dropped, v:2

// Migration — idempotency
location.reload();
// then: prx  →  byte-identical to the previous load

// Migration — brand-new user
localStorage.removeItem('amparo_prx'); location.reload();
// then: prx  →  {done:{},runs:{},streak:{last:'',n:0},best:{},v:2}, no console error
```
