# Wargame 08 — Practice module design review: mute + level merge (v2.7.3)

Date: 2026-08-03. Design/level/instructional review only. **No `index.html`
edits were made and none are authorized by this document.** Step 8 of the
`/amparo-loop` verification sequence.

**Scope:** `index.html` as shipped in tag `v2.7.3` (content unchanged since
commit `60ae7bc`; current HEAD `0b3f94f` — nothing after `60ae7bc` touches the
file). Two structural changes are under review: `8ce9639` (officer-mute) and
`9fcd5d6` (the level merge). Symbols read: `PRX_LEVELS`, `PRX_HARD`, `PRX_OPT`,
`PRX_VAR`, `PRX_CURVE`, `PRX_CHK`, `prxBuildDeck`, `prxTab`, `prxSpeak`,
`prxMuteTgl`, `prxMuted`, the `prx.v>=2` migration IIFE, and everything that
calls or is called by them.

**Prior art, not repeated here:** `wargames/03-door-module-design.md` already
flagged five issues in the *pre-merge* scenarios (§5.1–5.8) — score-fraction
legibility (§5.7, now fixed in `8ce9639`), the arrest-beat robotic-TTS bug
(§5.2, now moot — see §1.4), the curveball same-day-same-position defect
(§5.3, still open, not re-verified here), the "45 lines nobody knows exist"
gap (§5.4, still open — re-confirmed independently below in §3.2), and the
old level 3 re-skin complaint (§5.6, resolved by the merge — see §1.4).
`wargames/04-mobbin-component-audit.md` §6 already covers the mute *button's*
visual weight against shipped patterns (icon, active-state) — not repeated
here; §2 below covers two things it didn't: the bubble tap-target and the
recording feature. The door module is not re-litigated; it's a known,
deliberate hold.

---

## 1. The level merge, verified

### 1.1 Ladder shape today

`PRX_LEVELS` (index.html:3580) has exactly 5 entries:

```js
const PRX_LEVELS=[{ids:[0,8,1,2,6],rate:0.95},{ids:[0,8,1,2,4,5],rate:1.12},
                   {ids:[3,7],rate:1.28},{ids:[20,21,22],rate:1.3},
                   {ids:[30,31,32,33],rate:1.0}];
```

| Idx | Label (`prx_lvl`) | Beats | Tone pool | Gated | Ends in |
|---|---|---|---|---|---|
| 0 | Calm stop | 5 | calm | no | scored grid |
| 1 | Irritated officer | 6 | curt | no | scored grid |
| 2 | Ordered out | 2 | curt+hostile | consent gate | scored grid, sober |
| 3 | Hard mode | 3 | *(fixed deck)* | **locked + consent gate** | **debrief, no score** |
| 4 | Checkpoint | 4 | *(fixed deck)* | consent gate, never locked | scored grid + legal-limits note |

Four numbered rungs plus an unnumbered Checkpoint, exactly as the merge
commit describes. Confirmed against source, not against the commit message
alone.

### 1.2 What Hard Mode runs, and why the swan belongs there now

`prxBuildDeck()` (index.html:3812) short-circuits before the randomized path
for both fixed levels:

```js
if(prLevel===3) return PRX_HARD.map(h=>Object.assign({},h)); // fixed track — no variants, no curveball
if(prLevel===4) return PRX_CHK.map(h=>Object.assign({},h));  // checkpoint — fixed, legally scripted
```

`PRX_HARD` (index.html:3701–3711) is the **original** "Hard mode" content —
3 beats (`ci` 20/21/22), each with its own `setter` atmosphere line (bright
light in the mirror, a hand near the belt, knuckles on the roof) — the
content the merge commit says was the only late-game deck "with content of
its own." `PRX_OPT[20]`, `[21]`, `[22]` (index.html:3720–3740) are all
`bothGood:true` with a `react`/`react2` pair — no correct/incorrect scoring,
the officer reacts to either choice.

The unwinnable ("swan") ending is `const swan=prLevel===3` (index.html:4476)
— it fires for exactly this deck. That is correct: per the merge commit, the
swan framing ("you do everything right and the officer stays hostile
anyway") originally belonged to the *deleted* level ("The hard stop," old
index 3), and the merge moved it onto the surviving original content. The
consent-gate copy confirms the fusion actually happened at the prose layer,
not just the code layer — `prx_warn4` (index.html:1531) reads:

> "The last one, and the hard one. It's late, the officer is hostile from the
> first word — and in this stop you do everything right and he stays hostile
> anyway. Some stops are like that. The point: calm words protect your case
> even when they don't soften the officer."

First half ("late," "hostile from the first word") is Hard Mode's original
register; second half ("you do everything right... stays hostile anyway") is
the swan's. One warning, both halves, no orphaned half-sentence. **Verified
correct.**

### 1.3 Pacing across the ladder

Beat counts: **5 → 6 → 2 → 3**. The Irritated→Ordered-out drop (6 beats to 2)
is a real cliff, but it's pre-existing — `PRX_LEVELS[2].ids` is unchanged by
this merge, and it's already logged as wargame-03 §5.5 ("level 2 is a
two-beat spike behind a heavy warning"), still open, not this review's to
re-litigate. What *is* this review's business: the step from Ordered-out (2
beats, scored, fixed arrest outcome) into Hard Mode (3 beats, unscored,
atmospheric) is **not** a cliff — it's a legible register change, covered in
§4.

The `tones` pool array (index.html:3816) is
`[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]` — its 4th
element (`['hostile']`) was written for the old index-3 "The hard stop" and
is now **dead**: `prLevel===3` always returns at line 3813, before this line
ever executes. Harmless today (nothing reads it), but see §1.5.2 for what it
explains.

### 1.4 What the merge resolved — credit where due

Two things get fixed as a side effect of deletion, neither called out in the
merge commit's own verification list:

1. **wargames/03 §5.6** ("level 3 is not structurally distinct from level
   1... plays as a re-skin") is fully resolved. Wargame-03 offered two
   options — reframe in copy, or add a unique beat. The merge took a third,
   better one: delete the redundant deck and keep only the level that
   already had unique content. Nothing to build; the complaint no longer has
   a subject.
2. **wargames/03 §5.2** (arrest beat falls back to robotic browser TTS
   because `PRX_VAR[7]` has zero `hostile`-tagged lines and old level 3's
   pool was `hostile`-only, so the filter returned empty) is moot. The level
   that had the hostile-only pool is gone. The beat's current home, Ordered
   out, pools `['curt','hostile']` — two tones — so `PRX_VAR[7]`'s two
   `curt` lines still match and the beat still gets a recorded clip. Verify:
   `(PRX_VAR[7]||[]).filter(v=>['curt','hostile'].includes(v.tone))` returns
   2 entries, not 0. No robotic fallback today.

### 1.5 What the merge left loose

**1.5.1 — Two stale comments, exactly the kind of thing that causes the next
numbering bug.** Directly above `PRX_HARD` (index.html:3696):

```js
/* ===== HARD MODE (level 5) =====
   A deliberately un-winnable track: ...
```

Hard Mode is index 3 (display label "4" of 4 numbered rungs), not "level 5."
And above `PRX_CHK` (index.html:3741):

```js
/* ===== Level 6: fixed Border Patrol checkpoint =====
```

The merge commit is explicit that Checkpoint "deliberately stays unnumbered"
— numbering it would claim a difficulty ranking that isn't true. The comment
directly contradicts that stated design decision. Both comments are leftover
from the pre-merge 6-level numbering (`0 calm · 1 irritated · 2 ordered-out
· 3 hard-stop · 4 hard-mode · 5 checkpoint`, per the migration comment at
index.html:3856) and were never updated when the ladder shifted. Low risk
today, real risk the next time someone adds a level and trusts the comments
over the array.

**1.5.2 — Seven authored officer lines, orphaned by the deletion, still
sitting in the file (and possibly still in the audio pipeline).** This is
the substantive finding — full detail and fix in §5.

**1.5.3 — One dead translation key.** `prx_warn5` (index.html:1504 EN,
1816 ES: "One more — a hard one...") was the old index-4 Hard Mode's
stand-alone warning before the merge fused it into `prx_warn4`. It is
defined in both language blocks and referenced **nowhere** — grepped, zero
call sites. `prx_warn6` (Checkpoint's warning) is still live and correctly
referenced at index.html:4420. Delete `prx_warn5` in both blocks; it's two
lines, translation debt, not content debt.

**1.5.4 — The migration IIFE itself: verified correct.** (index.html:3852–
3874). Guarded by `prx.v>=2` so it runs once; `shift()` builds a fresh
object copying `o[0],o[1],o[2]` as-is, remaps `o[4]→n[3]` (hard mode) and
`o[5]→n[4]` (checkpoint), and — critically — never reads `o[3]` at all, so
the deleted "hard stop" result is dropped rather than silently reassigned to
whatever now lives at index 3. Matches the commit's stated intent exactly.
**No bug found.** This is the one place in the merge where the risk was
highest (silently corrupting a returning user's saved progress) and the
implementation holds up under a cold read.

---

## 2. Mute, from a design lens

### 2.1 The core gate: correct, and correctly decoupled from safety

`prxSpeak()` (index.html:3947) is the single entry point for both the MP3
path and the TTS fallback, and mute is checked first:

```js
if(prxMuted){ prxIdleArm(); return; }
```

The idle-escalation timer (`prxIdleArm`, index.html:3921) still arms when
muted — deliberately, per the comment at :3949–3951: freezing is a trauma
response independent of whether audio is on, so the freeze-offer (replay or
leave, at equal weight, nothing scored) has to fire regardless of the mute
state. **This is the one place mute could have broken a safety affordance,
and it doesn't.** Correctly designed.

### 2.2 One real inconsistency: two controls, one hides, one doesn't

The explicit "Hear it again" button is conditionally rendered — it
disappears entirely when muted (index.html:4544):

```js
${prxMuted?'':`<button class="prx-hear" onclick="prxSpeak()">${_t.prx_hear}</button>`}
```

That's the right call — a visible control that silently no-ops is worse than
no control. But the officer's speech bubble itself doesn't get the same
treatment (index.html:4535):

```js
thread+=`<div class="prx-row">${photo}<div class="prx-ob ${moodC}" id="prxBubble" onclick="prxSpeak()" title="🔊">"${esc(d.officer[lang])}"</div></div>`;
```

`onclick="prxSpeak()"` and `title="🔊"` are unconditional — muted or not, the
bubble still advertises "tap to hear this" and still silently does nothing
when tapped while muted. A user who mutes via the button, then taps the
transcript itself (a very natural thing to do — it's the biggest, most
central touch target in the whole card) gets zero feedback either way: no
sound, no toast, nothing that confirms "muted is why nothing happened." It
reads as the app not responding, not as mute working correctly.

Small, not urgent, but worth naming precisely: **the mute state is legible
at the button and illegible at the bubble**, and the bubble is the bigger,
more obvious tap target.

### 2.3 The recording/playback feature: currently unreachable, mute or not

The task asks whether mute interacts oddly with "the recording/playback
feature." Checked directly: it can't interact with anything, because there's
no live path to it in the current build.

`prxRecToggle()` (index.html:4074) reads/writes `document.getElementById`
for `prxRecBtn`, `prxRecNote`, `prxCaption`, and `prxPlayback`. None of those
four ids appear anywhere in `practiceRender()`'s output (grepped the whole
file: zero `id="prxRecBtn"` etc.). `hasConsole` (index.html:4515,
`navigator.mediaDevices&&window.MediaRecorder&&!isDo&&!prRevealed`) is
computed once per render and **never read again** — also grepped, one
occurrence in the whole file, its own declaration. `practiceBody` (the only
element `practiceRender` writes into — confirmed only one writer in the
file) never receives a `.prx-console` block; that class exists only in CSS
(index.html:402–407) and the i18n strings `prx_rec`/`prx_rec_stop`/
`prx_rec_note*` (index.html:1544–1547) are defined but likewise never
interpolated into any template. The "own words" `<details>` block that
*does* render (index.html:4552–4555) contains only the typed-text input, not
the mic button.

This predates both commits under review — the `8ce9639` diff (mute) doesn't
touch this area, confirmed by reading the diff directly. It's a standing
gap, not a regression, but it's the honest answer to the question asked:
today, a player never sees a microphone option at all, so mute cannot make
that experience worse or better. Worth its own ticket, independent of this
review — the CSS, strings, and function were clearly built to a finished
state (`hasConsole` even correctly excludes `PRX_DO` action-beats and
already-answered beats) and then disconnected from the render path at some
point.

### 2.4 Results screen: clean

The results/debrief screens (index.html:4402–4508, and the swan debrief at
4461–4473) are fully static — score, grid, streak, coach tip, share buttons,
founder's note. No audio-dependent control anywhere on them. Mute has zero
footprint here because there's nothing for it to touch. No finding.

### 2.5 Relationship to wargame-04 §6

Wargame-04 already reviewed the mute *button's* visual state against five
Mobbin references and recommended an icon plus an `.on`/active class reusing
the existing `.prx-vbtn.on` grammar. That's still the right call and isn't
repeated here. §2.2 and §2.3 above are gaps that audit didn't cover (it
scoped to `.prx-ctrls`; the bubble and the recording console are both
outside that container).

---

## 3. Replayability

### 3.1 The bank, confirmed

`PRX_VAR` (index.html:3637) holds variant officer lines for 9 beats. Counted
directly from source: 6+6+5+5+5+4+4+4+6 = **45 lines**, matching the task
brief exactly.

### 3.2 Nobody's told — still, two commits later

Grepped every candidate onboarding string: `prx_intro` ("Say your answer OUT
LOUD before revealing it...", index.html:1471), `hub_sub` ("Run a scenario
out loud — two minutes each.", :1481), and the generic `prx_setter` line
(:1552). None mention that the officer's phrasing changes on replay. The
only in-run signals are retroactive: a "⚡ Curveball" tag on the specific
beat that has one (:4549), and a "⚡ Today's curveball" banner that only
appears once a run already contains (or already contained) one (:4520) — both
presuppose the player already knows what a curveball is; neither introduces
the mechanic. This is exactly wargame-03 §5.4 ("45 authored variants nobody
knows exist"), re-verified independently here and **still open** — the merge
and the mute feature didn't touch this, and nothing else has fixed it since
it was first flagged. Not re-solving it here (out of this review's five
questions), just confirming it's still true.

### 3.3 Curveball post-merge: functionally sound, tonally leaky

**Functionally:** the guard is unchanged and still correct —
`if(runs>=1&&prLevel<2)` (index.html:3828) fires only for Calm and Irritated,
never for Ordered out, Hard Mode, or Checkpoint. Hard Mode's fixed-deck
early-return (§1.2) makes it doubly safe — even if the `<2` guard were ever
loosened, `prxBuildDeck` would never reach the curveball-splice code for
Hard Mode at all. **No runtime issue.**

**Tonally:** the curveball selection itself is not filtered against the
level's tone pool. `PRX_CURVE[seed%PRX_CURVE.length]` (index.html:3830)
picks by date only. Two of the ten entries are tagged `tone:"hostile"` (the
"cooperate" and "why are you being so difficult" lines). Because the seed is
shared across levels and the only gate is `prLevel<2`, a hostile-tagged
curveball can be spliced into a **Calm-stop replay** on roughly 1 day in 5.
That directly contradicts the level's own premise — the opening design
comment (index.html:3570) states levels are "officer hostility, not
difficulty" and Calm is calm *by construction* (`tones=[['calm']]` filters
`PRX_VAR` accordingly). The curveball mechanic sits outside that filter
entirely, so on the wrong day, "😌 Calm stop" can show a red/tense demeanor
meter (:4522–4524, which reads `d.tone` directly off the spliced curveball)
and a hostile-voiced clip, with no structural difference from what happens
in Irritated. This is a **pre-existing** property of the curveball system
(not introduced by the merge — the splice code is untouched by `9fcd5d6`),
but it's squarely what "does the curveball mechanic still make sense
post-merge" is asking, so: mechanically yes, tonally it was already
quietly breaking the level-0 promise before the merge and still does now.
Cheap, separate fix if picked up: filter `PRX_CURVE` candidates by
`tones.includes(cb.tone)` before applying the date-seed, same shape as the
existing `PRX_VAR` filter one line above it.

One more small paper cut in the same neighborhood: the comment directly
above the guard (index.html:3826, "Never in L3 (stays canonical)") predates
the renumbering and now reads ambiguously — the code excludes three levels
(`prLevel<2` means never 2, 3, or 4), not just one. A future maintainer
reading only the comment could reasonably "fix" the guard to `<3` believing
that only restores intent, which would actually start splicing traffic-stop
curveball text into the Checkpoint's federal-checkpoint fiction. The guard
is correct today; the comment no longer explains why.

---

## 4. Difficulty curve: is Hard Mode felt, or just coded?

### 4.1 What the numbers claim

`PRX_LEVELS[2].rate` (Ordered out) is `1.28`; `PRX_LEVELS[3].rate` (Hard
mode) is `1.3` — a 1.5% difference. Before treating that as a deliberate
intensity signal: grepped every use of `.rate` in the file. It is read
exactly nowhere. TTS rate is driven entirely by `PRX_TONE[d.tone].rate`
(index.html:3971, keyed by the *beat's* tone — calm/curt/hostile — not the
level). **`PRX_LEVELS[i].rate` is dead data on every entry, not just the two
being compared.** Whatever intensity gap the numbers appear to encode is not
live in the product today.

### 4.2 What actually does the work

Three things, none of them numeric:

1. **Scoring register.** Ordered out is scored (a real grid, a real "best"
   fraction); Hard Mode is `bothGood` throughout and ends in a debrief with
   no grid at all (index.html:4459–4461: "a score here would imply the
   escalation was earned. It wasn't"). That's a mechanism difference, not a
   hostility difference.
2. **Prose density.** Ordered out's two beats (`ci` 3, 7) get no `setter`
   text of their own — only the very first beat of a run gets the generic
   `prx_setter` line (index.html:4533–4534: `if(d.setter)...else if
   (prIdx===0)...`). Hard Mode's three beats each carry a unique, written
   `setter` (bright light in the mirror; he studies your face; knuckles on
   the roof). The atmosphere is authored per-beat only in Hard Mode (and
   Checkpoint).
3. **Consent copy.** `prx_warn4` (§1.2) explicitly names both the "late and
   hostile" register and the "you did nothing wrong" lesson before the level
   even starts — Ordered out's `prx_warn3` only warns that it "ends with an
   arrest."

### 4.3 Would a level designer place it here?

Yes, and the reason is worth stating precisely: Hard Mode isn't one notch
harder than Ordered out on a shared difficulty axis — it's a **register
change**, from "here is the procedure, follow it, even a bad outcome is
survivable" (Ordered out) to "the procedure was followed and the outcome was
still bad, and that fact itself is the lesson" (Hard Mode). That's a
sequencing choice that only works placed *last* and *locked*, which is
exactly where it is. The felt gap is real; it's just not the gap the `rate`
field pretends to encode. Recommend not trying to express this register
change numerically at all — leave `tones`/`rate` alone and let the existing
`bothGood`/debrief/setter-density levers keep doing the actual work, since
they demonstrably already do it.

---

## 5. One buildable improvement

**Delete the 7 `PRX_VAR` lines that `9fcd5d6` orphaned, and drop their audio
clip ids from the next regeneration pass.**

### Why these seven, precisely

A beat's variant pool is only ever reachable if that beat's `ci` appears in
some level's `ids` *and* the line's `tone` is in that level's `tones` pool.
Cross-referencing `PRX_LEVELS[*].ids` against `PRX_LEVELS[*].tones`
(index.html:3816) for every `ci` in `PRX_VAR` shows **18 of the 45 lines
(40%) are mathematically unreachable** by any level today — no build, no
replay count, no seed will ever select them. Eleven of those were already
unreachable before the merge (beats 3–7's calm/curt lines authored for a
tone the beat's one level never uses — a separate, pre-existing
authoring/level-assignment mismatch, not this review's to fix). **Seven are
new fallout from deleting the old index-3 level**, which used to be the only
place `tones=['hostile']` combined with `ids` that included beats 0, 1, 2,
and 8. With that level gone, nothing left in `PRX_LEVELS` ever requests a
`hostile`-tagged line for those four beats — Calm only asks for `calm`,
Irritated only asks for `curt`, and neither beat 0/1/2/8 appears in Ordered
out's `ids:[3,7]`.

The seven, by their stable clip id (`v<beat>_<index>`, assigned at
index.html:3809):

| id | Beat | Line (existing, shipped) |
|---|---|---|
| `v0_4` | 0 (docs) | "License. Registration. Now, please." |
| `v0_5` | 0 (docs) | "I've asked twice. License and registration. Hand them over." |
| `v1_4` | 1 (where from) | "Where were you tonight? Don't make this difficult." |
| `v1_5` | 1 (where from) | "I asked where you're coming from. Answer me." |
| `v2_4` | 2 (search) | "If there's nothing in there, this takes two minutes. Can I search it or not?" |
| `v8_4` | 8 (why stopped) | "You know exactly why I stopped you. Don't play dumb." |
| `v8_5` | 8 (why stopped) | "Do you know why I stopped you? Don't lie to me." |

(All seven lines are already-shipped, already-reviewed content quoted
verbatim for identification — nothing here is newly authored.)

### The diff

Remove those 7 entries from their `PRX_VAR[0]`, `[1]`, `[2]`, `[8]` arrays
(index.html:3638–3682). No id renumbering needed elsewhere —
`Object.keys(PRX_VAR).forEach(...)` (:3809) reassigns ids off each array's
current order every load, so deleting array entries just shrinks the id
range cleanly. If the audio pipeline generates from this same array (per the
"Regenerate clips if lines change" comment at :3808), the four now-shorter
arrays mean fewer clips to (re)generate next pass, in both languages and
both voice genders — real, if small, savings, not just tidiness.

### Why this and not the alternatives

- **Don't widen Calm/Irritated's `tones` pools to use these lines instead.**
  That would let hostile lines surface in the levels the app's own design
  comment (index.html:3570) says must stay calm/curt — the same category of
  problem flagged in §3.3, just self-inflicted this time instead of via the
  curveball.
- **Don't try to build a 6th level to rehome them.** That's a strategic
  project, not a this-week fix, and the merge commit's own reasoning (kill a
  level whose only content was recycled) argues against manufacturing a new
  home for lines that were themselves recycled-tone leftovers.
- **Pruning is the smallest true diff:** no new arrays, no new levels, no
  new copy, no attorney review (nothing reviewed changes meaning, only
  which already-approved lines stay reachable), and it directly closes the
  gap this specific merge opened.

---

## Summary

| # | Area | Finding | Severity |
|---|---|---|---|
| 1.5.2 / §5 | Merge fallout | 7 of 45 `PRX_VAR` hostile lines orphaned by deleting old level 3; **the buildable fix** | Medium — content/audio debt, no runtime bug |
| 1.5.1 | Merge fallout | Two stale "level 5"/"Level 6" comments contradict the current ladder and the merge's own stated intent | Low — maintainer trap, not user-facing |
| 1.5.3 | Merge fallout | `prx_warn5` i18n key orphaned in both languages | Low — dead translation debt |
| 1.4 | Merge fallout | Two wargame-03 complaints (§5.2, §5.6) resolved incidentally | None — positive |
| 1.5.4 | Merge fallout | localStorage migration IIFE verified correct and idempotent | None — clean |
| 2.2 | Mute | Bubble tap-target keeps `title="🔊"`/`onclick` while muted; button hides, bubble doesn't | Low — minor confusing-silence UX |
| 2.3 | Mute | Recording/playback feature has zero live render path; mute cannot interact with it because nothing can | Medium — standing gap, pre-existing, own ticket |
| 3.2 | Replayability | Still no copy tells users officer lines vary between runs (wargame-03 §5.4, still open) | Medium — invisible content investment |
| 3.3 | Replayability | Curveball tone isn't filtered against level tone pool; hostile curveball can hit the Calm level (pre-existing) | Low-Medium — breaks the level-0 promise on ~1 day in 5 |
| 4 | Difficulty curve | `PRX_LEVELS[i].rate` is fully dead data; felt Hard-Mode/Ordered-out gap is real but carried entirely by scoring register + prose density, not by any numeric field | Low — no bug, but the numbers mislead a reader |
