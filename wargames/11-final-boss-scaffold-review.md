# Wargame 11 — final-boss scaffold review

Date: 2026-08-03. Step 8 of `/amparo-loop`, run at tag v2.7.4. **Design and
engineering-fit review only. No `index.html` changes made or authorized by
this document.** No legal content is reviewed here — none exists yet. Every
`TODO_ATTORNEY` referenced below stays a placeholder in this document too.

Reviewed against: `wargames/10-final-boss-module-scaffold.md` (all 8
sections), `wargames/09-final-boss-direction-brief.md` (all sections), and
`index.html` as it stands at this commit — not as it stood when the scaffold
was written.

**Verdict up front:** the scaffold's engine-fit claims are substantially
accurate — I verified every one named in the brief and they check out against
current source. But the scaffold's own §2 "implementation checklist" table
under-specifies the gating logic that §3 spends a paragraph insisting on, and
if an engineer codes from the table (which is literally formatted as the
thing to code from) rather than the prose, Scenario 6 unlocks the moment
Scenario 5 does — silently defeating the "5 before 6" thesis that §0 is
entirely built on. That's §5 below, and it's the highest-risk finding in this
review. Everything else is smaller.

---

## 1. Engine-fit verification

| Scaffold claim | Status | Evidence |
|---|---|---|
| `PRX_LEVELS` has 5 entries, indices 0–4 | **Confirmed** | `index.html:3585` — 5 objects, literal indices 0–4 |
| Randomized-path `tones` literal is a 4-element array that returns `undefined` at index 5/6 and throws on next dereference | **Confirmed** | `index.html:3820` `const tones=[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]`; used at `:3823` `tones.includes(v.tone)` — throws if `tones` is `undefined`. Only reachable if the new early-returns are missing or bypassed, since `PRX_LEVELS[5\|6].ids` would already throw one line earlier at `:3822` (`L.ids.map`) if `PRX_LEVELS` weren't also extended — so this is correctly a justification for the early-return approach, not a live bug today |
| Fixed-deck precedent (`PRX_HARD`/`PRX_CHK`) is the right pattern to copy | **Confirmed** | `index.html:3817-3818` — `prLevel===3`/`===4` both return hand-authored arrays before the randomized path runs |
| `ci` 50–55 / 60–65 don't collide with existing beats | **Confirmed** | Full existing `ci` space verified: scored bank {0,1,2,3,4,5,6,7,8} (`PRX_OPT` keys, `index.html:3618-3626`), Hard Mode {20,21,22} (`:3701-3710`), Checkpoint {30,31,32,33} (`:3765-3777`), curveballs resolve to `answerBeat` 1 or 2 (`:3682-3691`, inside the scored bank). No gaps, no overlaps |
| Warn ternary is `prLevel===4?warn6:(prLevel===3?warn4:warn3)`, and both new levels currently fall through to the arrest warning | **Confirmed** | `index.html:4437` exact match. Gate itself only fires for `prLevel>=2` (`:4436`), so 0/1 never reach it, and every value other than 3 or 4 — including the not-yet-existing 5 and 6 — resolves to `_t.prx_warn3` |
| `PRX_LEVELS[i].rate` is dead data | **Confirmed** | Only other `.rate` reference in the whole file is `u.rate=tn.rate` at `:3987`, sourced from `PRX_TONE` (calm/curt/hostile), not `PRX_LEVELS` |
| Hub grid / practice tab strip both hardcode `[0,1,2,3,4]` | **Confirmed** | `index.html:2936` and `:4434` |
| Hub progress bar counts `[0,1,2,3]` = "of 4" and should stay that way | **Confirmed, and correctly scoped** | `index.html:2929,2932` |
| `isLocked`/hub `locked` currently gate only `i===3` | **Confirmed** | `index.html:4430` (`isLocked=i=>(i===3)&&!mUnlocked`) and `:2908` (`locked=i=>(i===3)&&!mUnlocked`) — two separate copies of the same check, pre-existing duplication, not introduced by this scaffold |
| Hard Mode's score-leak bug (`37e4ffe`) guarded `i===3` only | **Confirmed, but at a different site than the scaffold implies** | See below — the historical fix guarded **display**, not the write |

### 1.1 The `prx.best` guard: write vs. display, and why it matters

The scaffold says: *"Guard the write at `prx.best[prLevel]=... ` so both are
excluded... That fix guarded `i===3` only; it must become a set, not another
one-off."* This is directionally right but conflates two different sites.

The actual write, unconditional today, is `index.html:4455`:
```js
if(!prx.best[prLevel]||sc>parseInt(prx.best[prLevel])) prx.best[prLevel]=sc+'/'+prRun.length;
```
No `i===3` guard exists here. It never has. `prx.best[3]` **is** written every
time Hard Mode completes — and because every Hard Mode `PRX_OPT` entry is
`bothGood:true`, `prCurTier` resolves to `'g'` unconditionally (`:3632`), so
the score written is always a perfect `3/3`.

`37e4ffe` actually patched two **display** sites, both still bare `i===3`
ternaries today:
- Hub card: `index.html:2949`, with a comment at `:2941-2948` that is the
  clearest statement of the actual bug history — the tab-strip guard existed
  first (`:4435`), the hub card was "written later and never got the same
  guard, so it leaked a score the results screen itself refuses to show."
- Practice tab strip: `index.html:4435`.

So today: the write is open, and two independent display sites each hide it
with their own copy of `i===3`. That's a symptom-patched bug, not a fixed
one — it has already recurred once (tab strip fixed first, hub card missed
it) and the scaffold's plan, read literally, adds a *third* site (a
guarded write) without removing or consolidating the first two. Extending
`i===3` to `i===3||i===5||i===6` at each of three separate sites is exactly
"another one-off," three times over — the same failure mode that produced
the bug being cited as precedent.

**The lazy, root-cause-correct version:** one `Set`, one guard, applied at
the write. If `prx.best[5]`/`prx.best[6]` are never written, both existing
display ternaries fall through to their `done`-check branch automatically
(`best?...:(done?'✓ ':'')` — false `best` already falls through today,
that's not new behavior, it's the same branch Hard Mode already exercises
for anyone who hasn't looked closely). No change needed at `:2949` or
`:4435` at all. See §5 for the concrete patch.

### 1.2 Additional gaps found during verification (not asked for by name, surfaced by reading the actual sites)

- **Stale citation.** §6 cites `:3810` for *"the engine has deliberately
  never made a threatening noise... impatience through repetition, never
  noise or sirens."* That comment is at `index.html:3922-3923` now, not
  3810 — confirms the task brief's warning that line numbers have drifted.
  Low stakes (it's a citation, not logic), but if it's meant to survive as a
  pointer for whoever builds this, it should be re-anchored or replaced with
  a function/symbol name instead of a line number.
- **Tab art needs a fourth site touched, not three.** The scaffold's "Tab
  art" row correctly says add `.waitbg`/`.nostopbg` CSS badges "not photos,"
  but the actual conditional that chooses badge-vs-photo is
  `index.html:4434`: `${(i===3||i===4)?'':' style="background-image:url(...)"'}`.
  That exclusion list also needs `i===5` and `i===6`, or both new tabs will
  try to load `img/scene-6.jpg` / `img/scene-7.jpg` — files that don't exist
  and shouldn't (there's no stock photo for either scenario, deliberately).
  Separately: `.prx-tab:nth-child()` color rules (`index.html:433-438`) stop
  at `nth-child(6)`. Seven total tabs need `nth-child(7)` defined too, or
  Scenario 6 — "the real climax," per the scaffold's own §0 — renders its
  tab-strip accent color as the generic `var(--tabc,#e5e0d4)` fallback
  (flat tan) while Scenario 5 inherits a pre-existing, currently-unused
  `nth-child(6)` value (`#b8860b`) that happens to already be there. Minor,
  purely cosmetic, but it's the kind of gap that undercuts a module the
  scaffold otherwise treats as the payoff of the whole ladder.
- **Idle-freeze copy needs a code change, not just new copy.** §6 says
  `prx_idle_h` "should get a scenario-specific variant." Today that string
  is a single flat key with no per-level branch anywhere
  (`index.html:3938-3940`, inside `prxIdleArm`, `:3925-3946`) — unlike the
  warn copy, there's no existing ternary to extend. Budget this as a small
  code change alongside the warn-ternary work, not a copy-only edit.
- **`prx_warn5` is already dead in exactly this way.** Both locale banks
  define `prx_warn5` (`index.html:1504`,`:1816`) but nothing in the render
  path references `_t.prx_warn5` — only the comment at `:3840-3845`
  explains it was originally written for Hard Mode before a rework moved
  Hard Mode's warning to `prx_warn4` and left `prx_warn5` orphaned. Not
  something this scaffold needs to fix, but it's a live example, in this
  exact codebase, of a warning string existing in the i18n bank without
  being wired to the ternary that's supposed to select it — which is
  precisely the failure mode the scaffold's "double trap" callout (§2) is
  trying to prevent for `warn7`/`warn8`. Worth remembering when wiring the
  two new strings: define is not the same as reachable.
- **The widening/contracting cadence has no engine representation, and
  that's load-bearing to state explicitly.** `prxSpeak()` (`index.html:3951`)
  plays exactly one audio clip per beat, once, with no per-beat timing
  mechanic. The only timing logic in the practice engine at all is
  `prxIdleArm` (`:3924-3946`): a flat 12-second idle timer, capped at one
  fire per beat, that *used to* re-escalate on freeze and was deliberately
  changed to offer replay-or-leave instead (comment at `:3932-3937`) — i.e.
  the one piece of inter-beat timing that exists was intentionally made
  *less* escalatory, not more. There is no mechanism anywhere that could
  reproduce "repeats land at 1.6s, then 3.3s, then 6.2s" as measured
  wall-clock gaps between discrete beats — and there shouldn't be one built,
  because six game-beats per scenario already maps cleanly onto the
  direction brief's 5-stage spine (§3.2 of `09`), meaning **each scaffold
  beat represents a whole stage, and the measured repeat cadence is meant to
  live entirely inside that beat's single performed audio take** — which is
  exactly what `09` §3.6 asks for ("perform each stage as one continuous
  unbroken take"). That reading is correct and the two documents are
  consistent with each other. But neither document says this in one place,
  and the failure mode if it's missed is expensive: (a) an engineer could
  waste time building fake inter-beat delay logic that doesn't fit the
  turn-based architecture, or (b) worse, someone previews or QAs a beat
  before its clip is recorded, hears the flat, evenly-paced `speechSynthesis`
  fallback (`prxSpeakTTS`, wired as the `onerror`/`.catch` path at
  `:3966-3967`), and concludes the pacing doesn't land — when the pacing was
  never supposed to exist outside the recorded clip. Worth one explicit line
  in the scaffold: *the cadence numbers are direction for the voice take,
  not a spec for game timing; do not evaluate either scenario's pacing via
  TTS fallback.*

---

## 2. Beat-by-beat design critique

**Is 6 beats right?** Yes, and it's well-grounded rather than arbitrary.
Existing levels range 2–6 beats (`PRX_LEVELS` ids: 5, 6, 2, and Hard
Mode/Checkpoint at 3 and 4 — `index.html:3585,3701,3765`), so 6 isn't
unprecedented, and it maps cleanly onto the direction brief's 5-stage spine
(`09` §3.2: transactional / decision-gap / containment-burst / demand-loop /
verdict-flip) with one beat to spare for a closing silence. Both scaffold
tables also place their "signature beat" at position 3 of 6 — a structural
rhyme between the two scenarios that's a genuine strength, not a
coincidence: it matches both references' own stage-3 placement of the first
real pressure spike.

**Does the two-scenario arc hold together, or does Scenario 6 restarting
undercut Scenario 5's momentum?** One correction to the premise first:
Scenario 6 doesn't restart at *calm* — neither scenario ever uses `calm`
tone at all. Scenario 5 runs curt/curt/curt/hostile/hostile/hostile;
Scenario 6 runs curt/curt/hostile/hostile/hostile/hostile. Both open at
`curt`, which is correct against the brief's own stage 1 spec ("end on a
curt, un-inflected dismissal"). So the "reset" is real but smaller than the
premise suggests, and it's mitigated at the product level twice over: §6 of
the scaffold explicitly routes the post-5 debrief back to the hub rather
than into 6 ("two heavy scenarios back to back is itself a load"), and the
gated warn-copy (`prx_warn8`) sets expectation *before* beat 1 rather than
relying on in-beat tone to carry it. A player who reaches Scenario 6 has, by
design, left and come back — momentum isn't supposed to carry across that
gap. That part of the design holds up.

**The actual pacing problem, as literally written:** Scenario 6's tone
ladder tags beat 3 (`n62`, "keep complying through repetition — the
signature beat") as `hostile` — one full beat earlier than Scenario 5 tags
its equivalent step, and against the scaffold's own instruction one
paragraph earlier not to "ramp to shouting by beat 2 in either." `tone`
isn't cosmetic in this engine: it drives the visible dialogue-bubble style
(`moodC`, `index.html:4543` — `hostile`→`'hot'`, `curt`→`'firm'`) and the
TTS pitch/rate fallback (`PRX_TONE`, `:3641` — hostile drops pitch to 0.9x
and raises rate to 1.22x versus curt's 1x/1.12x). Two consequences:

1. Per the brief's own measurements, the beat this is describing — Ref B's
   "Approach rep" stage, six repeats in 6.6s — is explicitly **not** a
   pitch/register event. Its median F0 (211Hz) sits *below* the ultimatum
   stage's and roughly level with the calm "firm explain" stage; the brief
   says plainly "rate is doing all the work" (`09` §2.2). Tagging it
   `hostile` (which this engine renders as a pitch *drop* plus a speed
   increase) isn't what was measured — `curt` (neutral pitch, elevated
   rate) is the closer fit to the source data for that specific beat.
2. More importantly for pacing: if `n62` is already rendered "hot," beat 4
   (`n63`, "absorb the register flip") has nothing left to flip *from*.
   The brief spends more words on the stage-6-to-7 register flip than on
   almost anything else — "no transition, no wind-up... the voice does it
   cold" (`09` §2.3.1) — and calls it, alongside the containment burst,
   the load-bearing craft element of the whole reference. A UI that's
   already showing three consecutive "hot" bubbles by the time the flip
   arrives (beats 3, 4, 5 all `hostile`) pre-empts the one moment the
   source material is most emphatic about landing cold. Recommend
   `n62` stay `curt`, reserving `hostile` for `n63` onward — which also
   gives Scenario 6 the same clean 3-curt/3-hostile split Scenario 5
   already has, rather than today's 2/4 asymmetry.

This is a tagging fix, not a rewrite — it touches one field in the scaffold's
own table, costs nothing structurally, and directly serves the beat the
scaffold itself calls "the highest-value beat in the module."

---

## 3. The §0.1 reframe, as a design problem

The mechanical question: would an officer's repeat-interval actually widen
against someone doing everything asked? The brief's own data says yes, is
plausible — but not for the reason the scaffold's one-sentence justification
states, and the gap matters for whoever writes to `w53`/`w54`.

Ref A's widening containment-burst (the actual source of the 1.6→3.3→6.2s
numbers) wasn't a free-floating "officer deciding whether to escalate" in
the abstract — it was triggered by a specific, still-unfolding **physical
movement** (subject exiting the vehicle), and the brief is explicit that nothing
else moved the stage counter: not argument, not being told the stop is
unlawful, not being recorded (`09` §1.1, "Note what does *not* trigger
escalation"). The officer was repeating a directive *about an action still
in progress*. That detail doesn't automatically survive the reframe.

For a fully-compliant player, by the time a widening-interval beat plays,
the physical action it would be "about" has typically already resolved
(the player narrated the reach, stepped out, handed over documents at
beat 1). If the dialogue ends up repeating a directive at someone who has
nothing left to do, that's no longer "an officer deciding" — it's an
officer repeating a satisfied command, which is a different, real
phenomenon, but it's *Scenario 6's* phenomenon ("compliance does not
reliably de-escalate"), not Scenario 5's ("you cannot control the outcome").
Written that way, the widening beat would quietly borrow Scenario 6's lesson
one scenario early and blur the distinction the whole document (§0) argues
for.

The fix is cheap and the scaffold is one sentence away from having it
already. §0.1 says: *"Anyone writing this beat should be able to state, in
one sentence, what the player did right at every step."* Add a second
sentence to that same test: **and a sentence stating what the officer is
still deciding that has nothing to do with what the player did** — backup,
whether this becomes a citation, a supervisor's call, anything genuinely
off-screen. That keeps the widening beat anchored in "a decision being made
about you that you're not party to" (the brief's #1-ranked pressure source
in both references, `09` §1.4/§2.4) instead of drifting into "he's still
mad you already complied," which is next scenario's job.

Mechanically sound, in other words — but only if the beat is written
against an unresolved off-screen stake, not against the player's own
already-completed compliance. The scaffold doesn't say this explicitly
anywhere, and it's exactly the kind of thing that's obvious in the design
room and invisible in a `TODO_ATTORNEY` placeholder.

---

## 4. `bothGood` at scale — numbness risk across three unscored scenarios

Real risk, and the scaffold's own choices already blunt part of it without
saying so. Two things work in its favor before any new lever is added:

- **Spacing, not stacking.** §6 already keeps Scenario 6 from following
  Scenario 5 in the same sitting (hub-return, "let re-entry be a separate,
  deliberate choice"). Distance between exposures is itself the strongest
  anti-habituation lever available, and it's already in the document —
  just not framed as serving this purpose too.
- **Sequential gating means Scenario 6 is never a first exposure.** By the
  time anyone reaches it, they've already seen the pattern once (Hard Mode)
  and are about to see it a third time — the design doesn't pretend
  otherwise, which is more honest than hiding the mechanic would be.

Where the risk is real and unaddressed: the **warn-copy**, not the in-beat
mechanic, is what actually tips a returning player off each time, and per
the scaffold's own §2 spec, `prx_warn8` is described in almost the same
terms as the *existing* `prx_warn4` (Hard Mode: `index.html:1531`, *"you do
everything right and he stays hostile anyway"*) — both are outcome-focused
promises ("you'll do everything right and it won't matter"). A player who's
internalized that promise from Hard Mode is being told the same thing again
at the Scenario 6 gate, in the same shape, for the third time before beat 1
even plays. That's where the numbness risk actually lives — not in the
`bothGood` grading itself, which is invisible during play, but in the
threshold copy that announces it.

**Concrete lever:** don't make the three warnings promise the same thing.
Hard Mode's promise is about the *outcome* (stays bad regardless).
Scenario 5's dread is about *uncertainty/duration*, not outcome — its
warning could prime not-knowing-when-it-ends rather than repeat "it won't
matter what you do." Scenario 6's actual distinguishing lesson is that
*obeying itself will feel like it's failing in real time* — a promise about
the experience of complying, not about the final result. The scaffold
already got this half-right (§2: "scenario 6 warns that doing everything
right will not change the outcome") but that phrasing is Hard Mode's promise
restated, not Scenario 6's. Sharpening the three warnings to promise three
different things is a content note, costs nothing structurally, and is the
cheapest available lever against exactly the numbness this question is
asking about.

---

## 5. One concrete, buildable fix

**Highest-risk finding: the gating table in §2 doesn't encode the sequential
requirement §3 spends a paragraph insisting on.** §2's checklist row reads
`i===3` → `(i===3||i===5||i===6)`. Taken literally, that unlocks Scenario 6
the instant `mUnlocked` is true — exactly when Scenario 5 also unlocks —
silently deleting the "5 before 6" ordering that §0 devotes its longest
section to justifying ("Scenario 6 is the real climax... 6's lesson only
lands once 5 has been felt," §3). This is a bug an engineer would ship
without noticing, because a normal playtest proceeds through the levels in
order and would never try to jump to 6 first — it takes someone deliberately
testing the gate to find it, which means the people most likely to hit it
first are real users, not QA.

Bundled with it, because it's the same class of fix at the same call sites:
the `prx.best` write-guard from §1.1.

```js
// One source of truth for "outside the scored ladder" — replaces three
// independent i===3 one-offs (isLocked, hub locked, and the missing write guard).
const PRX_UNSCORED = new Set([3, 5, 6]); // Hard Mode, Scenario 5, Scenario 6

// index.html:4430 and the duplicate at :2908 — both become:
const isLocked = i => i===6 ? !(mUnlocked && prx.done[5]) : (PRX_UNSCORED.has(i) && !mUnlocked);

// index.html:4455 — guard the write itself instead of relying on display sites
// to keep hiding it:
if(!PRX_UNSCORED.has(prLevel) && (!prx.best[prLevel]||sc>parseInt(prx.best[prLevel])))
  prx.best[prLevel]=sc+'/'+prRun.length;
```

With the write guarded, `index.html:2949` and `:4435` need no changes at
all — `prx.best[5]`/`prx.best[6]` simply stay `undefined`, and both existing
ternaries already fall through to their `done`-check branch on a falsy
`best`, which is the same branch Hard Mode exercises today. One `Set`,
two call sites, zero new one-offs. Buildable in under an hour once the two
new levels exist in `PRX_LEVELS`, and it doesn't touch any `TODO_ATTORNEY`
content, so there's no reason to wait on the attorney pass to land it.

---

## What the scaffold got right (for calibration)

Worth naming so the findings above land as calibrated, not as a pile-on:
the fixed-deck-over-randomized call is correct and well-justified; the `ci`
range selection is clean with zero collisions; the `PRACTICE.en[50]`-shape
example correctly follows the `PRX_HARD`/`PRX_CHK` precedent for where `o`/`y`
text lives; the y-field curly-quote trap is carried forward accurately
(verified against the actual regex at `index.html:4042,4179`); and the
decision to exclude the new scenarios from the numbered progress bar and the
mastery certificate is the right call and matches how Checkpoint was already
handled. The scaffold's engine-fit instincts are good — the gaps found here
are in what its own summary tables leave implicit, not in its judgment.
