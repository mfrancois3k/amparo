# Wargame 16 — Practice module review: beats, curve, pacing, replayability

Date: 2026-08-11 (amparo-loop Agent B). Design review only. **No `index.html`
edits were made and none are authorized by this document.**

**Inputs:** direct inspection of `index.html` (practice engine constants,
lines 4359-5255) at the current HEAD; the pure-logic FSM port at
`app-src/src/engine/practiceEngine.ts` (wargames/15 Move 5.1); prior design
work at `wargames/03-door-module-design.md`.

**Scope discipline, same as wargames/03:** this document authors no officer
dialogue, no legal content, no coach copy. Every content gap below is a
structural finding — what beat shape is missing, not what it should say.
Anywhere new content would be needed, the convention is `TODO_ATTORNEY` /
`TODO_DV_CLINICIAN`, matching what the engine already ships in `PRX_WAIT`,
`PRX_NOSTOP`, and `PRX_DOOR`.

---

## 0. What's actually live right now

`FINAL_SCENARIOS_ENABLED=false` and `DOOR_MODULE_ENABLED=false`
(index.html:4359, 4368) — so `PRX_LEVEL_IDS` is currently `[0,1,2,3,4]`
(index.html:4381) and the door tab (`PRX_DOOR_IDS`) is empty. Three fully
scaffolded modules — "The long wait" (`PRX_WAIT`, ci 50-55), "It doesn't
stop" (`PRX_NOSTOP`, ci 60-65), and the door module (`PRX_DOOR`, ci 70-75) —
exist in code, are wired into `prxBuildDeck`, `isLocked`, and the debrief
render path, and are 100% `TODO_ATTORNEY` placeholder content. They are real
engine work sitting behind a flag, not vaporware; this review treats them as
**designed-but-unauthored** and folds them into the curve analysis below
rather than re-scaffolding them (that scaffolding already happened and is
good — see §4).

The five *live* modules, in tab order:

| Idx | Name | Beats (`ids`) | Deck source | Tone(s) | Scored |
|---|---|---|---|---|---|
| 0 | Calm stop | `[0,8,1,2,6]` — 5 | randomized | calm | yes |
| 1 | Irritated | `[0,8,1,2,4,5]` — 6 | randomized | curt | yes |
| 2 | Ordered out | `[3,7]` — 2 | randomized | curt, hostile | yes |
| 3 | Hard mode | 3 fixed | `PRX_HARD` | curt→hostile | **no** (`PRX_UNSCORED`) |
| 4 | Checkpoint | 4 fixed | `PRX_CHK` | calm→curt | yes |

---

## 1. Beat structure — what each level is actually teaching

Levels are **not difficulty-ordered**; the code says so directly (the
`tones` comment at index.html:4726: *"hostile only behind consent gates"*)
and wargames/03 already made this the organizing frame. Reading distinct
**failure mode trained**, the five live levels map to only **three** distinct
mechanics, not five:

- **Levels 0 and 1** are the same lesson (decline questions, decline
  consent, comply with documents) at two tones. Four of level 1's six beats
  (`0,8,1,2`) are identical `ci`s to level 0's five. This is fine as a
  teaching ramp — repetition under rising pressure is a real pedagogical
  choice — but the level *tiles* don't say so. A player who has cleared
  level 0 sees level 1 as a new scenario, not "the same script, harder,"
  which is what it actually is.
- **Level 2** is the odd one out **structurally**, not just short: it's the
  *only* live level whose two beats (exit order, then arrest) are both
  **new** `ci`s relative to 0/1 (`3`, `7`). It is also the level that
  unlocks levels 3 and 4. wargames/03 §5.5 already flagged this as a
  two-beat spike behind a heavy warning screen — it is **still unfixed**
  (`PRX_LEVELS[2].ids` is still `[3,7]` at index.html:4374). See §3.
- **Level 3 (hard mode)** is a different game entirely: `bothGood:true` on
  every beat (index.html:4519-4539), no score, debrief-only. Its job is not
  skill transfer, it's **belief transfer** ("a bad outcome doesn't mean you
  did something wrong"). That's a legitimate and unusual design move for a
  rights-education app, and it's well-marked in the source comments — but
  nothing in the level tile or the pre-level warning tells the player *this
  level cannot be lost* before they play it. Right now the player discovers
  "everything I pick is graded 'good'" only by playing, which risks reading
  as the app being broken rather than intentional, precisely in the level
  aimed at people already primed to blame themselves.
- **Level 4 (checkpoint)** is the only level with a genuinely distinct
  failure mode already shipped and reviewed: *volunteering*, not panic. Its
  fixed track, its two extra debrief notes (`prx_chk_limit`, `prx_chk_note`
  at index.html:5499-5500), and its never-gated placement are all sound
  level design and need no changes.

**Finding 1.1 — the level tiles don't disclose level 3's rules.** A hard-mode
tile that visually signals "no score, no wrong answers" (a different icon
treatment from the 🟩 badge the other four use) would let players opt into
that level for the right reason instead of discovering the rule mid-run.
Cheap: `PRX_UNSCORED.has(i)` (index.html:5451) already branches the tile's
score badge to `✓`/blank — the same boolean can drive a one-line tile
subtitle. No new content, no `TODO_ATTORNEY` needed; it's UI copy about the
mechanic, not about a legal fact.

---

## 2. Difficulty / pressure curve

Ordering the five live levels by what actually escalates (tone pool +
consent gate + score presence), not by index:

```
Lvl 0 ── Lvl 1 ── Lvl 2 ─────── Lvl 3 ── Lvl 4
calm     curt     curt/hostile  hostile   calm→curt
no gate  no gate  GATE          GATE      no gate
5 beats  6 beats  2 beats       3 beats   4 beats
scored   scored   scored        unscored  scored
```

Two curve problems fall out of this, both already latent in the constants:

**Finding 2.1 — the gate sits on the shortest level.** The consent gate
(`prLevel>=2 && !prWarnOk[prLevel]`, index.html:5463) is the correct design
— escalation must be opted into, and wargames/03 documents why. But level 2
is the level where the warning-to-payoff ratio is worst: the player reads a
warning about an arrest (`prx_warn3`), consents, and the run is over in two
taps. Compare to level 4 (checkpoint), which carries the *same kind* of
weight (federal stop, no easy exit) across four beats and lands with room to
breathe. wargames/03's own recommendation — insert `ci:2` (consent-to-search,
already reviewed, already has a `hostile` variant at `PRX_VAR[2][3]`,
index.html:4453) between the exit order and the arrest — is still the
cheapest fix and still unimplemented. This is a one-line change to
`PRX_LEVELS[2].ids`: `[3,2,7]`. No new legal content; the beat, its options,
and its coach lines all already exist and are reviewed.

**Finding 2.2 — level 3 has no ramp before its escalation.** `PRX_HARD`'s
three beats go curt → hostile → hostile
(index.html:4501-4509: `tone:'curt'`, then `'hostile'`, `'hostile'`) with no
calm beat at all. Contrast level 2's tone pool `['curt','hostile']`, which at
least allows a curt roll. Level 3 opens already elevated. Given §1's finding
that level 3's *purpose* is to decouple bad outcomes from player error, this
might be intentional — no ramp room to "earn" safety reinforces the point
that nothing you do changes the outcome. Flagging as a design question, not
a bug: if the un-winnability is meant to land as a slow realization rather
than an immediate one, a calm opening beat (mirroring level 0/1's structure)
would let the player start the level the normal way and feel the floor drop
out from under the *pattern*, not just the tone. Either reading is
defensible; worth a deliberate call rather than the current default.

**Finding 2.3 — the disabled tier (levels 5-7) escalates on a completely
different axis, and that's a strength worth naming explicitly.** `PRX_WAIT`
("The long wait," widening intervals + silence) and `PRX_NOSTOP` ("It
doesn't stop," contracting intervals + a mid-run register flip measured at
"+6.6 dB and +64 Hz... cold, with no wind-up," per the comment at
index.html:4611-4619) are **pacing**-driven pressure, not tone-driven. This
is the first place in the whole practice system where *time itself* — not
what the officer says — is the mechanic. When these ship, they should not
be filed under the same 🟩 score badge as levels 0/1/2/4: `PRX_UNSCORED`
already exempts them (index.html:4373, includes 3/5/6/7), which is correct,
but the level-select tile treatment (§1, Finding 1.1) should extend to all
three unscored levels uniformly, not be authored per-level later.

---

## 3. Pacing within a run

**Finding 3.1 — the anti-repetition mechanic (curveballs) only fires on two
of five levels, and never on the level a repeat player returns to most.**
`prxBuildDeck`'s curveball insertion is gated `runs>=1 && prLevel<2`
(index.html:4742) — so only levels 0 and 1 ever get a curveball, and only
from a player's second run onward. Level 2, the unlock gate every player
must clear multiple times if they're building the mastery streak toward
levels 3/4, never varies at all: it is the exact same two lines, same tones
(no random tone pool since both `PRX_VAR[3]` and `PRX_VAR[7]` are filtered
by the level's tone set, but the *curveball* mechanic itself is simply
absent), every single replay. This compounds wargames/03 finding 5.5 — level
2 is already the shortest level, and it's also the only randomized level
where "randomized" doesn't actually vary run to run once the tone pool is
exhausted at 2 beats.

**Finding 3.2 — idle escalation timing is uniform across a curve that isn't.**
`prxIdleArm`'s 12-second timeout (index.html:4839-4861) is a single constant
applied at `prLevel>=2` regardless of level. That's defensible for levels 2
and 4 (both are close in register to the traffic-stop baseline the timeout
was tuned against), but level 3 (hard mode) has a different psychological
job — the point is to feel destabilized, not to be quizzed against a clock
that behaves the same way it did in level 1. Not flagging this as a change
to make now (the trauma-informed design in wargames/03 §6.4 already covers
the copy-register side of this for the door module, and the same argument
extends to hard mode); flagging it as a question worth the same treatment
before hard mode's idle copy is finalized.

**Finding 3.3 (pacing, not beats) — replay signal exists but is invisible
before the run starts.** wargames/03 finding 5.4 (45 authored `PRX_VAR`
variants across 9 beats, nothing in the UI advertises that officer lines
change between runs) is still true of the current source — the "different
every run" sentence it recommends for the results screen is not present in
the results-screen markup at index.html:5493-5508. This is a pacing/
replayability issue as much as a content one: a player deciding whether to
replay level 0 today is making that call with zero signal that the replay
will *sound* different, which undercuts the value of §3.1's curveball work
and the underlying `PRX_VAR` authoring investment.

---

## 4. Replayability

**What's already strong and shouldn't be touched:**
- The **divergence mechanic** (`PRX_DIVERGE`, index.html:5209-5238; ported
  faithfully in `practiceEngine.ts` `divergeDeck`, lines 132-148) is the
  single best replayability primitive in the system: a good/bad pick on
  level 1 reshuffles the *next* beat's tone from the same reviewed bank,
  selection-only, no new content, no branching state. This is exactly the
  right shape for a linear-deck engine (per wargames/03 §2.2's ruling that
  the engine cannot model branching state) and it is under-marketed for the
  same reason as Finding 3.3 — nothing on-screen tells the player that a
  good pick just changed what's coming.
- The **streak** (`prx.streak`, counts days practiced, not perfection,
  index.html:5473-5480) is the correct replayability hook for this
  audience — it explicitly does not punish a lapsed day, which the code
  comment names as deliberate for a trauma-adjacent audience. No change
  needed.
- **Carry card** (index.html:5260 on) as a per-run artifact gives a
  concrete, low-effort reason to finish a run even on a level with no score
  (it's offered on every debrief except level 3's — `prLevel===3?'':...` at
  index.html:5503, which is itself arguably a gap: hard mode is exactly the
  level where a player might most want a concrete, non-scored takeaway to
  carry away from a run that told them nothing they did mattered).

**Finding 4.1 — level 4's replay has nothing new to offer once beaten.**
`PRX_CHK` is fully fixed (no `PRX_VAR` pool, no curveball path — the
`prLevel===4` branch in `prxBuildDeck` returns the array verbatim,
index.html:4718). Once a player has seen it once, replaying is byte-for-byte
identical dialogue. This is explainable ("fixed, legally scripted" is the
existing rationale, correctly applied to a federal-checkpoint script that
shouldn't drift) but it does mean level 4 is the one level with zero
replay-freshness mechanism of any kind — no divergence (not in
`PRX_DIVERGE`'s keyset, which only covers `{1,2}`), no curveball, no tone
variance. Not a bug; a tradeoff the design already made deliberately. Worth
naming so it isn't rediscovered as a surprise later: if checkpoint content
ever needs *any* variety, it has to come from attorney-reviewed additional
scripted beats, never from the randomized-pool mechanism the other levels
use.

**Finding 4.2 — the carry-card gap at hard mode (see 4.i above) is a
one-line pacing fix, not a content gap.** Removing the `prLevel===3?'':`
special case at index.html:5503 costs nothing — `carryOpen()` is a generic
form, no level-specific content is baked into it. Whether it *should* be
offered there is a judgment call about whether hard mode wants the player to
leave with an artifact or leave with nothing but the debrief message; noting
both readings rather than picking one, since it bears on the level's whole
point (§1).

---

## 5. Summary table

| # | Finding | Severity | Fix shape | Blocks on attorney/DV review? |
|---|---|---|---|---|
| 1.1 | Level tiles don't disclose hard mode's no-score rule | MEDIUM | one-line tile subtitle, driven by existing `PRX_UNSCORED` boolean | no |
| 2.1 | Level 2 is a 2-beat spike behind a heavy gate | HIGH | insert `ci:2` into `PRX_LEVELS[2].ids` — beat already reviewed | no |
| 2.2 | Level 3 has no calm opening beat | LOW / judgment call | add one `PRX_HARD` beat if the "no ramp" read is wrong | yes, if new beat authored |
| 2.3 | Levels 5-7 need their own tile treatment when unflagged | LOW (future) | extend 1.1's fix to all `PRX_UNSCORED` levels uniformly | no (UI only) |
| 3.1 | Curveballs never fire on level 2 | MEDIUM | extend `runs>=1&&prLevel<2` gate, or accept as intentional (2 beats may be too short for a curveball insert) | no |
| 3.2 | Idle-timeout is one constant across a non-uniform curve | LOW / judgment call | per-level idle copy + possibly timing, mirrors wargames/03 §6.4 | copy needs review if changed |
| 3.3 | No on-screen signal that officer lines vary run to run | MEDIUM | one sentence on results screen (wargames/03 finding 5.4, still open) | no |
| 4.1 | Level 4 has zero replay variance (by design) | INFO | none — document as accepted tradeoff | no |
| 4.2 | Carry card withheld on hard-mode debrief | LOW / judgment call | remove the `prLevel===3` special case, or affirm it's intentional | no |

Every MEDIUM/HIGH item above is a **one-line-to-one-array-edit** change to
existing, already-reviewed constants (`PRX_LEVELS[2].ids`, the curveball
gate condition, one results-screen sentence) — none require new officer
dialogue, new `PRX_OPT` pairs, or new legal content. The LOW/judgment-call
items are flagged as open questions for a deliberate design call, not
prescribed fixes.
