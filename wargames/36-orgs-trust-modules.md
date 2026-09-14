# 36 — Arena Onboarding & Stress-Curve Design Review: Gentle Default, the Skipped Tutorial, the Half-Relabeled Meter

**Loop step 8 design review — game designer + level designer + instructional designer lens.
2026-09-13, read-only.** Scope: `arena/index.html` only (2441 lines at review time), the sole
practice surface (root's engine is a redirect; `/app`'s duplicate was deleted 2026-09-04, per
`wargames/35`). Structure and mechanics only — **no officer dialogue or legal copy is authored
below**; every content slot that would need new wording is marked `TODO_ATTORNEY`, the
convention from `wargames/03-door-module-design.md`. `HELD_SITS={door:1}` is respected; no
door content is proposed.

**What this does NOT relitigate.** The two newest prior passes are read and deliberately not
repeated: `wargames/35` (difficulty curve §1, swan gate §2, micro-win badge §3, ladder modal
position §4, state panel §5, panic view §6, replay fallback copy §7 — all on this same file)
and `wargames/34` (root `index.html`'s `PRX_*` engine, out of scope here). Two of 35's punch-list
items have since landed and are confirmed fixed in passing, not re-argued: the dead `||A.lvl===3`
badge branch is gone (`:1710`, with the fix documented in-comment at `:1705–1709`), and `mPath`
is now hidden in gentle mode as well as swan (`:1687`). This review is a **first pass on the
onboarding funnel and the stress mechanics as a first-timer meets them** — the one region three
prior arena reviews (29/30/31/35) never took a lens to, because they entered mid-drill and this
gap lives entirely in the first sixty seconds.

All line numbers verified by direct read of `arena/index.html` at HEAD.

---

## The through-line: stress rehearsal is the product thesis, and it is opt-in twice over

The About copy states the entire reason the game mechanics exist: *"Rehearsal under mild stress
is what makes words available when your heart is pounding"* (`ab5b`, `:718`); the intro modal
repeats it (`inB`, `:797`). Yet as built, the **median first session almost certainly contains
zero stress rehearsal**, because stress is gated behind two independent opt-ins a first-timer is
steered away from and never told about. Findings 1–3 are the two gates and the meter that would
have taught them; 4–5 are the mechanical seams that result. This is the unifying structural
problem, and every finding below is one face of it.

---

## 1. Gentle Mode is the first-timer default AND the tutorial is skipped — so the default player is taught nothing and shown nothing  — **HIGH**

Two lines set the first-run state, and they compound:

- `:1261` `if(firstSetup && A.gentle===undefined)A.gentle=true;` and, redundantly, the
  quick-setup submit at `:2401` `if(!Object.keys(A.done).length)A.gentle=true;` — **gentle mode
  is on by default** for anyone with no completed drills.
- The same submit handler, one line up at `:2400`, sets `A.seenIntro=true;A.seenTut=true;`.
  The intro modal and the tutorial only auto-open `if(!firstSetup...)` (`:2125–2126`), and a
  brand-new user *is* `firstSetup` (`:1260`, true when `A.done` is empty). So during setup both
  are suppressed, and the moment setup completes they are marked seen — **the intro modal and
  all three tutorial screens never auto-open for a first-timer at all.** The only path back is
  the `?` help button (`:2124`).

What gentle mode removes: the heartbeat/meter (`:291`, `display:none!important`), the countdown
clock (`:1463`, gated `if(!A.gentle)`), the steadiness scoring (`:1627`, `steady=A.gentle?true`),
the per-line steadiness note (`:1636`, `if(!A.gentle)`), and the steadiness recap on the results
screen (`:1687`). So the default first experience is a clockless, heart-less, un-scored pick-a-line
exercise **with no tutorial** — and the three authored, animated tutorial screens
(`tut1`/`tut2`/`tut3`, `:804–821`) sit unreachable. That includes `tut1` ("How practice works,"
`:805`), whose "**Say every line OUT LOUD — that's what builds the reflex**" is the single most
load-bearing behavioral instruction in the product and is *not* gentle-specific — it applies to
every mode and is the whole thesis. A first-timer through quick-setup never reads it.

**Is Gentle Mode the right default?** Gentle-first is defensible for a frightened audience — the
lower barrier and the "mistakes are free" framing (`inB`) are real trust wins, and this review is
**not** recommending flipping the default off. The defect is pairing gentle-default *with*
tutorial-skip: the player learns neither the universal instruction (out-loud) nor the mechanics
they will later hit. The fix is sequencing, not a mode change:

**Fix (no new copy; reuses `openTut()`):** always run `tut1` even for the gentle-default
first-timer (it is mode-agnostic and carries the out-loud reflex) — i.e. do not set
`A.seenTut=true` at `:2400`; let `:2126` fire `openTut(1)`. Defer `tut2`/`tut3` (steadiness,
pressure meter) until the player first leaves gentle mode (Finding 2), so the mechanic screens
arrive when the mechanics do. `TODO_ATTORNEY` not needed — `tut1`/`tut2`/`tut3` text already
exists and is UI chrome.

---

## 2. "Replay under pressure" is an unguided cliff from the calmest config to the harshest — at the exact moment the tutorial's mechanic screens should fire — **HIGH**

`mPressure.onclick` (`:1742–1744`): `A.gentle=false;renderGentle();A.pressure=true;...renderArena();`
— one tap flips gentle **off** and pressure **on** simultaneously. From a gentle completion (where
per Finding 1 the player has never seen a clock, a meter, or the steadiness bar score anything),
that single tap lands them in the **most punishing configuration in the game at once**: countdown
`-1s` (`:1464`), steadiness zone `×0.8` (`:1560` `lvlZone`), needle period `×0.7` (`:1559`
`lvlPeriod`). The steadiness bar and the pressure meter appear for the first time, unexplained,
at their tightest settings — and `tut2`/`tut3`, which exist precisely to explain them, were
marked seen at `:2400` and will not open.

This is the sharpest instance of Finding 1: the deferred tutorial screens have an obvious, already-
built trigger sitting right here and it is not wired to them.

**Fix (reuses existing `openTut`):** on the first transition out of gentle mode — either this
button or the `gentleBtn` toggle at `:2146` — if `!A.seenTut`, open `openTut(2)` (steadiness →
pressure) before dealing the drill. One guard, no new copy. Optionally split the button's two
effects so "under pressure" doesn't also silently disable gentle without a beat of explanation.

---

## 3. The "pressure meter" relabel is skin-deep — the HUD still reads as a heart-rate monitor, and the vocabulary is split four ways — **MEDIUM**

The brief flags that the meter was "recently relabeled from BPM/heart rate." Verified: the relabel
reached exactly one small-caps label. The live HUD (`:668`) renders:

```
❤️  <span id="bpmN">72</span>  PRESSURE
```

Everything except the word "PRESSURE" still says *heart rate* to a first-timer: the **❤️ emoji**,
the **pulsing animation** whose rate is literally `60/BPM` seconds (`:1615` `updateHeart`), the
**number** that starts at `72+lvl*15` and rides to `165` (`:1408`, `:1631` — a physiological BPM
band), and the **color thresholds** `>120` red / `>90` amber / else green (`:1615`), which are
heart-rate zones. The variable names (`__BPM`, `bpmN`, `hbHeart`) are cosmetic to the user but
confirm the widget was never rebuilt, only re-captioned.

Worse, the vocabulary is now inconsistent across four surfaces the same user sees in one session:
- HUD label: **"PRESSURE"** (`pressLbl`, `:668`)
- Tutorial: **"the ❤️ pressure meter (simulated, not your real heart rate)"** (`tut3B`, `:819`)
- Gentle button + settings alert: **"no clock or heartbeat"** / **"no countdown or heartbeat"**
  (`setGentle` `:594`, intro `gentle` copy `:2361`)
- Intro modal: **"your heart rate doubles"** (`inB`, `:797`)

So the product simultaneously tells the user it is a pressure meter, hedges that it is "not your
real heart rate," and elsewhere calls it a heartbeat — while showing a red heart ticking at a
believable pulse. This is the worst of both metaphors: the disclaimer implies deception was a risk,
while the widget still looks exactly like the thing being disclaimed. Pick one:

**Fix (no legal copy; UI chrome — but any *replacement* user-facing string is `TODO_ATTORNEY`-adjacent
only if it makes a claim; the label words below do not):**
- *Commit to the metaphor* — keep ❤️/BPM as an honest stand-in for arousal, drop the "PRESSURE"
  relabel, and unify the other three surfaces on "heartbeat." Cheapest; the `tut3` hedge already
  covers the honesty concern. **Or**
- *Finish the relabel* — swap the ❤️ + BPM range for a 0–100 "pressure" fill bar (the color logic
  at `:1615` already maps cleanly to a 0–100 scale), drop `bpmN`'s number, and align `setGentle`/
  `inB` to "pressure." More work, removes the ambiguity entirely.

Either is fine; the current half-state is the one thing that isn't. NEW — `wargames/35` did not
touch the meter's legibility.

---

## 4. Steadiness scoring flips from cosmetic to point-costing at the level-0→1 seam with no signpost — **MEDIUM**

`:1635`: `if(p>0&&!steady&&(A.lvl>=1||A.pressure)){p=0;f+=' · '+T('shakyCost');}`

At **level 0**, a correct-but-shaky answer keeps its point; at **level 1+ (or any pressure run)**
the identical answer is zeroed. The steadiness bar looks pixel-identical across those levels —
nothing tells the player the needle just went from decorative to load-bearing. `tut2` says only
that the zone "shrinks at higher difficulty" (`:811`) — that describes *movement*, not the *scoring
rule change*. And because gentle is the default (Finding 1), the level-0 steadiness note at `:1636`
(`if(!A.gentle)…`) is itself hidden, so a gentle player's first sight of the mechanic *is* the
moment it starts costing points: they turn gentle off at level 1, and the same behavior that
breezed level 0 now silently docks them, cued only by a small `shakyCost` line.

**Fix:** surface the rule at the boundary — e.g. show the non-costing steady/miss note during
level 0 too (so the mechanic is visible one level before it bites), or a one-time note when the
zeroing rule first engages. The rule statement is UI chrome, `TODO_ATTORNEY` not needed. Interlocks
with Findings 1–2: if `tut2` fires on first exit from gentle (Finding 2), that is the natural place
to state "from here, missing the zone costs the point."

---

## 5. The auto-advance loop never escalates pressure and dead-ends into a silent replay of the calmest scenario — so the sustain loop plateaus below the product's own thesis — **MEDIUM**

`mAgain` ("Practice another scenario →", `:788`) is the sustain button. `:1736–1740` resets
`A.pressure=false` and calls `nextUnfinished()` (`:1727`), which climbs to the next unfinished
level in the situation, then the next situation, and **once the ladder is exhausted falls back to
`A.sit='traffic';A.lvl=0`** (`:1733`) — a silent re-loop of the calmest scenario in the deck, with
no "you've completed the ladder" terminal state, no nudge toward Hard Mode, the wallet card, or the
streak as the next goal.

Two structural consequences:
- **Pressure is never carried by the sustain loop.** `mAgain` force-clears `A.pressure`
  (`:1738`), and gentle stays on unless the user manually toggles it. Pressure is reachable *only*
  by tapping `mPressure` per-scenario (Finding 2), one drill at a time — it is never the ambient
  state the loop advances into. Combined with the gentle default, a passive player can run the
  **entire product start to finish having never once met the clock, the meter, or steadiness
  scoring.** That is the thesis (`ab5b`) opt-in twice over, made concrete.
- **The completionist gets no ending.** Finishing everything drops them back at calm traffic level
  0 with the full results modal (score ring, ladder, upsell) as if it were a fresh calm run —
  indistinguishable from never having started. Replayability has no top rung to point at.

**Fix (structure only, no new legal copy):** give `nextUnfinished`'s exhausted branch (`:1733`) a
real terminal state — a "ladder complete" results variant that routes to Hard-Mode/pressure replay,
the wallet-card print, or the streak, instead of silently re-seeding traffic 0. Optionally let the
sustain loop carry the current pressure/gentle state forward rather than resetting it at `:1738`,
so difficulty is sticky once earned. Any new sentence shown to the user is `TODO_ATTORNEY` only if
it makes a legal claim; a "you've finished every scenario — here's what's next" nudge does not.

---

## 6. Confirmatory notes (not action items)

- **`mAgain` climbs levels, not scenarios**, despite its "Practice another scenario →" label
  (`nextUnfinished` advances within a situation first, `:1728–1730`). Pedagogically correct (climb
  the rung), only the label slightly overstates it. Not worth a fix on its own; fold into any
  Finding-5 copy pass.
- **The `first-practice` walkthrough is a genuinely good onboarding touch and is separate from the
  tutorial.** `:1652–1656` replaces the auto-advance with an explicit "Continue Scenario" button
  and shows the feedback inline on the very first drill, then `finish()` clears the class at
  `:1680`. This is real first-run scaffolding — worth naming so it isn't mistaken for the missing
  tutorial. It teaches the *loop*; it does not teach the *mechanics* (Findings 1–4), which is why
  it doesn't close them.
- **Gentle mode's results screen degrades cleanly** — `mPath` hidden (`:1687`), `steady` forced
  true (`:1627`) so the composure bonus math (`:1669`) still runs on `avg` accuracy. No brokenness;
  the concern is purely that the mechanic was never introduced, not that it misbehaves when off.

---

## 7. Priority punch list (smallest diff → biggest effect)

1. **§1** — stop setting `A.seenTut=true` at `:2400`; let `tut1` auto-open for the gentle-default
   first-timer. One deletion. Restores the out-loud instruction to the funnel. Do this first.
2. **§2** — wire the first exit from gentle (`mPressure` `:1744` / `gentleBtn` `:2146`) to
   `openTut(2)` when `!A.seenTut`. One guard; makes the mechanic screens arrive with the mechanics.
3. **§4** — show the (non-costing) steadiness note at level 0, or state the zeroing rule at the
   0→1 seam. One condition on `:1636`, or a one-time note tied to §2.
4. **§3** — resolve the meter to one metaphor: either drop the "PRESSURE" relabel and unify on
   "heartbeat," or finish the swap to a 0–100 pressure fill and align `setGentle`/`inB`. Label-only.
5. **§5** — give `nextUnfinished`'s exhausted branch (`:1733`) a terminal "ladder complete" state
   instead of a silent traffic-0 re-loop; optionally carry pressure/gentle across `mAgain`.

None of the five requires officer dialogue or legal wording. All are sequencing, gating, or label
changes over mechanics that already exist.

---

## Verification log

- Gentle default: `:1261`, `:2401`. Tutorial/intro suppression + mark-seen: `:2125–2127`,
  `:2400`. `firstSetup` definition: `:1260`.
- Gentle removals: `:291` (heart CSS), `:1463–1464` (clock), `:1627`/`:1636` (steadiness),
  `:1687` (mPath recap), `:1604` (tension drone).
- Tutorial screens: `tut1` `:804–807`, `tut2` `:809–816`, `tut3` `:817–821`; nav `openTut`
  `:2111–2116`; help button `:2124`; `tutDone` sets `A.seenTut` `:2123`.
- Pressure replay: `mPressure` markup `:789`, handler `:1742–1744`. `mAgain` `:788`,
  `:1736–1740`. `nextUnfinished` `:1727–1734`.
- Meter: HUD markup `:668`; `updateHeart` `:1615`; BPM seed `:1408`; BPM step `:1631`;
  `lvlPeriod` `:1559`, `lvlZone` `:1560`; copy split `pressLbl :668` / `tut3B :819` /
  `setGentle :594` / intro `gentle :2361` / `inB :797`.
- Steadiness cost rule: `:1635`; per-line note gate `:1636`; `answer()` scoring `:1620–1664`;
  `finish()` `:1665–1718`; composure bonus `:1669`.
- `first-practice` walkthrough: `:1652–1656`, cleared `:1680`.
- Confirmed-landed prior fixes (not re-argued): badge `||A.lvl===3` removed `:1710` (comment
  `:1705–1709`); `mPath` gentle-hidden `:1687`. Both trace to `wargames/35` §3.1 / §5.
- Prior reports read for continuity, not re-derived: `wargames/35` (all §§, same file),
  `wargames/34` (root engine, out of scope), `wargames/03` (`TODO_ATTORNEY`/`HELD_SITS`
  convention).
