# Wargame 12 — Divergent-turns mechanic + module design review

Date: 2026-08-11. Design review only, requested as game designer + level
designer + instructional designer. **No `index.html` edits were made and none
are authorized by this document.**

**Inputs:** direct inspection of `index.html` at commit `29acc167`, specifically
`PRX_LEVELS` (:4216), `PRX_LEVEL_IDS` (:4223), `PRX_DO` (:4227), `PRX_OPT`
(:4258), `PRX_VAR` (:4283), `PRX_CURVE` (:4322), `PRX_HARD` (:4342), `PRX_CHK`
(:4406), `PRX_WAIT` (:4432), `PRX_DOOR` (:4481), `PRX_NOSTOP` (:4501),
`prxBuildDeck()` (:4558), the hub tab split (:3257–3324), the in-practice tab
strip and `isLocked()` (:5245–5254), and `PRX_DIVERGE` / `prxDiverge()`
(:5039–5051). Pool sizes below were counted programmatically against the live
file, not estimated.

Scope discipline, same rule as `wargames/03`: this document authors no officer
dialogue, no legal content, and does not touch any `TODO_ATTORNEY` placeholder.
Where a finding would require new lines, it says so and stops there.

---

## 1. What `prxDiverge()` actually does, precisely

```js
const PRX_DIVERGE={1:{g:'calm',b:'curt'},2:{g:'curt',b:'hostile'}};
```

After a beat resolves, if the *next* beat's dealt tone doesn't match the
direction implied by how the *current* beat went, `prxDiverge()` re-deals the
next beat from `PRX_VAR[next.ci]` filtered to the target tone — same closed,
reviewed corpus, selection only. Curveball beats are skipped (`next.curve`),
crisis disclosures are skipped (`prCurTier==='x'`). It only touches Level 1 and
Level 2; Level 0 and 3+ are untouched by design.

That's a clean, cheap mechanic — one function, no new content, no branching
state. The question this review answers is whether the *content underneath it*
supports it.

---

## 2. Pool depth — measured, not estimated

`PRX_VAR` tone counts per beat (`ci`), counted against the live array:

| ci | calm | curt | hostile | total | Used by level(s) |
|---|---|---|---|---|---|
| 0 | 2 | 2 | 0 | 4 | 0, 1 |
| 1 | 2 | 2 | 0 | 4 | 0, 1 |
| 2 | 2 | 2 | 0 | 4 | 0, 1 |
| 3 | 2 | 2 | 1 | 5 | 2 |
| 4 | 2 | 2 | 0 | 4 | 1 |
| 5 | 2 | 2 | 0 | 4 | 1 |
| 6 | 2 | 2 | 0 | 4 | 0 |
| **7** | **2** | **2** | **0** | **4** | **2** |
| 8 | 2 | 2 | 0 | 4 | 0, 1 |

Every beat ships exactly 2 calm + 2 curt. Only `ci 3` has a hostile variant
(1). `ci 7` — the arrest beat — has **zero**. No other beat in the scored bank
has a hostile variant either, so `ci 3`'s lone hostile line is the only
hostile content in the entire randomized bank.

### 2.1 Level 1 (`ids:[0,8,1,2,4,5]`, tones `['curt']`, `PRX_DIVERGE[1]={g:'calm',b:'curt'}`)

This is where the mechanic actually works. Every beat in the level's own ID
list has exactly 2 calm variants, so a good answer always has a real,
non-empty pool to re-deal into — `pool.length` is never 0 for the `g` leg
here. A run can chain de-escalations across up to 5 transitions (6 beats).
That's a legitimate, functioning mechanic today.

### 2.2 Level 2 (`ids:[3,7]`, tones `['curt','hostile']`, `PRX_DIVERGE[2]={g:'curt',b:'hostile'}`)

This is the one flagged in project history, and it's worse than "the
escalation leg is inert" — **both legs are currently unobservable**, for two
independent reasons:

- **The `b` (mistake → hostile) leg** wants `PRX_VAR[7]` filtered to
  `hostile`. That pool is empty (table above). `prxDiverge()` hits
  `if(!pool.length) return;` and no-ops. This is the gap already flagged.
- **The `g` (good → curt) leg** is *also* a no-op, but for a structural
  reason rather than a content one: `ci 7`'s base deal in `prxBuildDeck()`
  already filters to `tones=['curt','hostile']`, and since `hostile` is
  empty, `ci 7` is **always dealt curt regardless of the player's choice on
  beat 1**. So `next.tone==='curt'` is already true before `prxDiverge()`
  runs, and the `if(next.tone===want) return;` guard fires — "already
  there." There is nothing to converge toward; it started there.

Net effect: play Level 2 today, pick well or badly on the exit-order beat, and
the arrest line is **audibly and visibly identical either way**. The one level
where the escalation direction of divergence was supposed to matter is the one
level where it currently can't be told apart from doing nothing.

One nuance worth keeping when this gets fixed: the `g` leg being a no-op is
*correct by design*, not a second bug. Good behavior on the exit-order beat
shouldn't retroactively make the arrest not happen — the level's whole point
(per its own `prx_warn3` copy) is that this level ends in an arrest regardless.
The only leg that should ever produce a visible branch here is the mistake
leg. That raises the priority of authoring 1–2 hostile variants for `ci 7`
rather than lowering it — **it is not "one of two directions," it is the
entire visible content of divergence at this level.** Everything else about
the mechanism (the code path, the tone-driven bubble color, the TTS
rate/pitch swap via `PRX_TONE`) is already wired and will light up the moment
the pool is non-empty — this is a content gap, not an engine gap.

### 2.3 Beat-count ceiling on Level 2 independent of pool depth

Even with a hostile variant authored, Level 2 has exactly 2 beats
(`ids:[3,7]`), meaning exactly **one** beat-transition in the entire run for
divergence to fire across. Compare Level 1's up-to-5 transitions. Level 2
structurally cannot demonstrate escalation more than once per run, and
`PRX_CURVE` is explicitly excluded here too (`runs>=1&&prLevel<2` at :4584 —
curveballs never reach Level 2). So Level 2 is, on every axis, the
lowest-variance level in the ladder at the exact moment it was given the
mechanic's more dramatic direction (escalation). This connects directly to
the pre-existing `wargames/03 §5.5` finding that Level 2 is "a two-beat spike"
— that finding is now higher-priority than when it was written, because a
two-beat level is also a one-transition level for divergence.

**Recommendation, unchanged from `wargames/03` and reinforced here:** widen
Level 2 to 3–4 beats (the doc's suggested insertion is `ci 2`, which already
has a reviewed answer and one existing hostile variant at `PRX_VAR[2]` index
4 — wait, verified above: `ci 2` has 0 hostile in the current file, the
`wargames/03` note describing a hostile variant at that beat does not match
current content and should be re-verified before anyone acts on it). Widening
the level also buys divergence a second transition to work with, independent
of the `ci 7` fix.

---

## 3. Difficulty curve: does the unlock order still make sense?

Unlock gate, unchanged shape: `mUnlocked = prx.done[0] && prx.done[1] &&
prx.done[2]` (:3263, :5245) gates Hard Mode (index 3). Checkpoint (index 4)
is deliberately never gated by this — it now also has its own hub tab
entirely outside the ladder (§4).

Failure-mode read, updated for divergence:

| Idx | Level | Beats | Transitions for diverge | Failure mode | Divergence direction |
|---|---|---|---|---|---|
| 0 | Calm stop | 5 | — (no `PRX_DIVERGE` entry) | learning the script | none |
| 1 | Irritated | 6 | up to 5 | holding it under irritation | de-escalate on success |
| 2 | Ordered out → arrest | 2 | 1 (currently inert) | compliance + invocation | escalate on mistake |
| 3 | Hard mode | 3 | — (fixed track) | self-blame | none |

Read as a curve, this now has a real gap: Level 1 rewards good play with an
*audible, felt* softening — the player gets positive reinforcement mid-run,
which is new and good. Level 2 is supposed to be the mirror — punish a
mistake with an audible hardening — but currently delivers nothing
different. A player who has just experienced Level 1's responsive de-escalation
and then moves to Level 2 expecting the same responsiveness in the other
direction gets a flat, static arrest instead. That mismatch is more visible
*because* Level 1 now sets an expectation Level 2 doesn't pay off. Before
divergence shipped, both levels were equally static, so the asymmetry wasn't
noticeable; now it is a design gap created by half-shipping the mechanic to
Level 2's content.

This doesn't require changing the unlock order — `mUnlocked` still correctly
gates Hard Mode behind completing the ramp, and Checkpoint's non-gating is
still correct for the reason already documented in the code comment ("a
different encounter, not an escalation"). It requires finishing what's
already been started: one authored `ci 7` hostile variant closes the gap
without touching the gate structure at all.

---

## 4. Checkpoint's new standalone tab: does it hold up alone?

The hub now presents three peer-level tabs (:3283–3285): traffic ladder,
Checkpoint, door (unbuilt). That's a promotion — Checkpoint used to be level
index 4 buried at the end of the ladder; it's now billed as an equal module.
The commit history confirms this was deliberate (`a6460b3 feat: Checkpoint
gets its own hub tab, out of the traffic-stop ladder`).

Content-wise, nothing about Checkpoint changed when its tab did:

- `PRX_CHK` (:4406) is 4 fixed beats, `calm → curt → curt → curt`.
- **No `PRX_VAR` entries exist for `ci 30–33`** — Checkpoint has zero
  officer-line variance between runs, a property the ladder's beats (0–8)
  have had since before divergence shipped.
- `PRX_DIVERGE` has no key for Checkpoint's level index, and even if it did,
  `prxDiverge()`'s pool lookup (`PRX_VAR[next.ci]`) would resolve to
  `undefined` for `ci 30–39` and no-op every time.
- No curveball path — the curveball gate is `prLevel<2`, and Checkpoint is
  index 4 (or effectively unreachable via that branch regardless).

So Checkpoint was already the least dynamic of the four ladder levels before
this change, and the change that just shipped — the ladder gaining
divergence — widens that gap instead of narrowing it, at the exact moment
Checkpoint was promoted to stand on its own. A user who plays the traffic tab
first now experiences audible tone-shifting mid-run, then switches to the
Checkpoint tab and gets the same 4 lines in the same order, verbatim, every
time. Against the ladder, it now reads thin specifically *because* the ladder
just got more expressive and Checkpoint didn't move.

This is a real but bounded finding — not "Checkpoint is broken," but "the tab
split raised Checkpoint's implicit bar to ladder-parity, and content
investment hasn't followed the IA investment yet." Two independent,
low-effort levers exist if this is worth acting on, in laziness order:

1. Author 2 alternate variants (any tone — even just phrasing variety, not a
   new tone tier) for each of the 4 `PRX_CHK` beats, giving it the same
   `PRX_VAR`-style pool the ladder has always had. This alone would close
   most of the gap without touching divergence at all.
2. Only after (1), consider whether Checkpoint wants its own `PRX_DIVERGE`
   entry — worth deferring, since Checkpoint's stated failure mode
   (volunteering) is arguably better served by the officer staying flat and
   procedural throughout (per its own header comment: "the agent is
   businesslike, not hostile") than by tone-shifting. A hostile Checkpoint
   officer might actively work against the module's own thesis. This needs a
   design call, not just a content pass.

---

## 5. Replayability: curveball × divergence — do they fight?

They don't collide mechanically (`prxDiverge()` explicitly skips
`next.curve`), and the corpus-safety property both rely on (selection only
from a closed, reviewed bank) is shared. Where they actually interact:

- **Level 0**: curveballs fire (`runs>=1`), divergence doesn't (`PRX_DIVERGE`
  has no key `0`). No interaction — curveball is the only source of
  run-to-run variance here.
- **Level 1**: both fire. A curveball beat resolves through the same
  `PRX_OPT[ci]` scoring as any beat (its `ci` is `cb.answerBeat`, an existing
  scored id), so its outcome *can* drive divergence on the beat immediately
  after it. This is a genuine, positive synergy: a curveball tests the player
  under an unfamiliar phrasing, and a good answer to it now also visibly
  softens what comes next. Nothing about this needs to change.
- **Level 2**: curveballs are excluded (`prLevel<2`), so no interaction here
  either way — consistent with `wargames/03`'s note that curveballs "stay
  canonical" outside the ramp.

Verdict: they don't fight, but the overlap where both are live is narrow (Level
1 only), and that's an artifact of both systems independently gating out
Level 2 for different stated reasons (curveball: "stays canonical" at the
escalation gate; divergence: currently inert there anyway). Once `ci 7` gets
a hostile variant, it may be worth deciding explicitly whether curveballs
should ever reach Level 2 too, rather than leaving that boundary as two
separate accidents of unrelated gates that happen to agree today.

---

## 6. Hard Mode, the two final scenarios, and the door module: stale by comparison?

Structural read only — none of `PRX_HARD`, `PRX_WAIT`, `PRX_NOSTOP`, or
`PRX_DOOR` content is touched here, and three of the four are still
`TODO_ATTORNEY` scaffolds per `wargames/03`, `09`, `10`.

**Hard Mode (`PRX_HARD`, :4342) — not stale, deliberately static.** Its whole
mechanic is `bothGood:true`: every choice is scored as good, and the officer
escalates regardless (:4359–4381). Its didactic point is that outcome is
decoupled from behavior. Giving it variant pools or divergence would actively
undermine that point — variance would imply the player's choice changed
something, when the entire lesson is that it didn't. Its fixed-track shape is
correct on its own terms and shouldn't chase the ladder's new dynamism.

**`PRX_WAIT` / `PRX_NOSTOP` (:4432, :4501) — also static by design, not by
neglect.** Their comments describe scripted audio cadence as the entire
mechanic — measured interval widening/contracting and a specific,
un-telegraphed tone flip (`wargames/09`'s "+6.6 dB and +64 Hz across a
4-second boundary, cold, with no wind-up"). That precision is only achievable
as a fixed, hand-timed script. A `PRX_VAR`-style pool per beat would reintroduce
randomness into exactly the dimension (timing/register) these two scenarios
exist to control. These should stay fixed even after they're written; nothing
here is "catching up" to divergence.

**Door module (`PRX_DOOR`, :4481) — the one case where divergence changes the
calculus that produced its original design ruling.** `wargames/03 §1.1`
mandated the fixed path for the door for three reasons, one of which was
cost: authoring a full `PRX_VAR`-style bank multiplies attorney review 6×
"for content the user sees once per run." That ruling predates divergence.
Divergence is cheaper than a full variant bank — it needs only 2 variants per
tone per beat that matters, reused via selection, not N-per-level content.
`wargames/03 §2.2(b)` already identifies the door's core problem as
"irreversibility the engine can't model," and works around it by loading all
the stakes into `setter` copy. Divergence is a second, narrower tool for the
same problem: it could make the position-loss beat (`ci 73`, "step out for a
second" — the doc's own "signature beat") mechanically real by shifting the
*next* beat's tone based on whether the player held position, the same way
`ci 3`→`ci 7`'s escalation was intended to work. This is not a
recommendation to build it now — the door module is still unauthored and
gated behind `DOOR_MODULE_ENABLED=false` — but it is worth flagging that the
"fixed-only" ruling in `wargames/03` should be revisited, not assumed, once
door content authoring starts, because the engine gained a cheaper way to
express irreversibility after that ruling was written. Scope a minimal
2-variant calm/hostile pool for just the one or two beats where divergence
would carry real weight (beat 73 and the beat immediately after it), not a
full bank across all six beats — that keeps the review-surface argument from
`wargames/03` intact while giving the module's central thesis mechanical
teeth instead of only narrative teeth.

---

## 7. Priority summary

| # | Finding | Severity | Type |
|---|---|---|---|
| 1 | `ci 7` (Level 2 arrest beat) has zero hostile variants — divergence's only visible leg at that level is dead | **HIGH** | Content gap, priority-worthy |
| 2 | Level 2 is 2 beats / 1 transition — even a fixed `ci 7` gives divergence one shot per run | MEDIUM | Structural, ties to pre-existing `wargames/03 §5.5` |
| 3 | Checkpoint promoted to its own hub tab with zero `PRX_VAR` pool — reads thin against a ladder that just got more dynamic | MEDIUM | Content/IA mismatch |
| 4 | `wargames/03`'s cited hostile variant at `ci 2` index 4 does not exist in the current file — anyone acting on that doc's §5.5 recommendation should re-verify pool contents first | LOW | Documentation drift |
| 5 | Door module's "fixed-path-only" ruling predates divergence and is worth revisiting at authoring time, scoped narrowly | LOW / informational | Forward-looking, not actionable yet |

Items 6 (Hard Mode) and the `PRX_WAIT`/`PRX_NOSTOP` cadence scripts are
explicitly **not** findings — their static shape is correct by design and
should not be changed to match the ladder.

---

## Open items requiring a human before any of this ships

1. **Attorney/content authoring** of 1–2 hostile lines for `ci 7` — the single
   highest-leverage content addition raised by this review. No ruling on
   *what* the officer says belongs in this document.
2. **Design call** on whether Level 2 should grow to 3–4 beats (per
   `wargames/03 §5.5`) — independent of item 1, but compounds with it.
3. **Design call** on Checkpoint: variant-pool investment now that it has
   peer billing on the hub, and a separate call on whether Checkpoint should
   ever get its own `PRX_DIVERGE` entry given its "businesslike, not
   hostile" thesis may argue against tone-shifting at all.
4. **Re-verify** `wargames/03 §5.5`'s claim about a `ci 2` hostile variant
   against the live file before using it as an insertion candidate.
5. **Scope decision, not authoring**, on whether a minimal divergence pool
   for the door module's beat 73 is worth revisiting `wargames/03`'s
   fixed-only ruling once door content work begins.
