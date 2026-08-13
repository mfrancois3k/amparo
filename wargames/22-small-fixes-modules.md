# wargames/22 — the practice modules as systems (game / level / instructional design)

Round for `/amparo-loop small-fixes`, at `v2.21.3`. Follow-up to
`wargames/12-divergent-turns-modules.md` and `wargames/21-hub-rebuild-modules.md`.

Those two rounds asked *is the ladder coherent* and *does the tab split hold*.
Both answered yes. This round asks the next question down: **what does a player
actually retain, and what in the engine is producing that retention?** The
product's stated premise is recall under stress. The engine currently has no
component whose job is recall.

**Scope discipline, unchanged from 03 / 12 / 16–21:** structure and sequencing
only. **No officer dialogue, no statute text, no legal content is authored in
this document.** Where a line would be needed, `TODO_ATTORNEY` is the only
placeholder, per `wargames/03-door-module-design.md`. §10 discusses officer
lines that *already exist as files in this repo* — it quotes none of them and
proposes none.

Every claim below was read out of `index.html` at `v2.21.3` and out of
`audio/` / `tools/VOICE_LINES.md` this pass. Line numbers are from
`C:\Users\mfran\Ai-Foundations\Amparo\index.html` unless stated.

---

## 0. Re-verification of the ground truth handed to this pass

Everything I was told to re-verify, verified. Two items came back *understated*.

| Claim | Verdict | Evidence |
|---|---|---|
| 5 live levels; two tiers + door built but dark | **Confirmed** | `PRX_LEVEL_IDS` `:4386`; `FINAL_SCENARIOS_ENABLED=false` `:4364`; `DOOR_MODULE_ENABLED=false` `:4373` |
| L2's deck is `[3,2,7]` | **Confirmed** | `PRX_LEVELS[2]` `:4379` |
| `v3_4` is the only hostile entry in `PRX_VAR` | **Confirmed** | `:4463`; every other entry in `:4446-4484` is `calm` or `curt` |
| Divergence reads `prDeck[prIdx+1]`, so beat 0 is unreachable | **Confirmed** | `:5252` |
| L2 divergence is inert in **both** directions | **Confirmed** | `PRX_DIVERGE[2]={g:'curt',b:'hostile'}` `:5248`. Good leg wants `curt`; `prDeck[1]`/`prDeck[2]` are `ci 2` / `ci 7`, both dealt curt at `:4734` because `tones[2]=['curt','hostile']` and neither bank has a hostile — so `if(next.tone===want) return` `:5255` fires. Bad leg wants `hostile`; `if(!pool.length) return` `:5257` fires. Neither leg can ever mutate a beat |
| Checkpoint: no variants, no curveball, no divergence | **Confirmed** | `PRX_CHK` `:4569-4582` is a literal 4-beat array returned whole at `:4723`; curveball gate is `prLevel<2` `:4747`; `PRX_DIVERGE` has no key `4` `:5248` |
| `v2_4` is an orphaned id with audio in all four voice folders | **Confirmed, but it is 1 of 8** | See §10 |
| No spaced repetition (HANDOFF open issue 6) | **Confirmed, and it is a data-shape problem** | See §5 |

---

## 1. Variance audit — what actually differs between two consecutive runs

The honest inventory, per level. "Variance" here means *anything a returning
player could perceive as different*.

| Level | Beat order | Beat count | Officer wording | Options | Divergence | Curveball |
|---|---|---|---|---|---|---|
| 0 Calm | fixed `[0,8,1,2,6]` | 5 (6 w/ curveball) | 2 calm variants per beat → 32 combos | **identical** | none (`PRX_DIVERGE` has no key `0`) | yes from run 2, **day-locked** (§3) |
| 1 Irritated | fixed `[0,8,1,2,4,5]` | 6 (7 w/ curveball) | 2 curt variants per beat → 64 combos | **identical** | live, good-leg only | yes from run 2, day-locked |
| 2 Ordered out | fixed `[3,2,7]` | 3 | `ci 3`: 3 options (2 curt + `v3_4`); `ci 2`,`ci 7`: 2 each → 12 combos | **identical** | **inert both legs** | never (`prLevel<2`) |
| 3 Hard mode | fixed | 3 | **none** — `PRX_HARD` returned whole `:4722` | **identical** | none | never |
| 4 Checkpoint | fixed | 4 | **none** — `PRX_CHK` returned whole `:4723` | **identical** | never | never |

**The load-bearing row is "Options".** `PRX_OPT` is keyed by `ci` only
(`:4421-4431`, `:4692-4715`), so for any given beat the two answer texts, the
two coach lines and the model script are byte-identical on run 1 and run 50.
The selection-screen copy — `prx_sel_sub`, "The officer's wording changes every
run" (`:1805`) — is precisely and *only* true. Nothing about the thing being
drilled changes.

That is defensible for a rehearsal tool. It stops being defensible once you
notice §2.

---

## 2. The correct answer is in a deterministic screen position (NEW — HIGH)

`:5659`:

```js
${(prIdx%2===0)?gC+bC:bC+gC}
```

`gC` is the good option, `bC` the mistake. Order is a function of **beat index
parity**, not chance. So on every fixed-deck level:

| Level | beat 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 0 Calm | good top | good bottom | good top | good bottom | good top | — |
| 2 Ordered out | good top | good bottom | good top | — | — | — |
| 3 Hard mode | (bothGood) | (bothGood) | (bothGood) | — | — | — |
| 4 Checkpoint | good top | good bottom | good top | good bottom | — | — |

Identical every run, forever. A player who runs Level 0 three times has been
trained, with perfect consistency, on the sequence **top, bottom, top, bottom,
top**. That is a positional cue, and positional cues are the specific thing
retrieval practice is supposed to strip out — under real stress there is no
screen and no top option, only the sentence.

This is worse than pure randomisation *and* worse than a fixed correct
position, because it is a learnable 5-symbol pattern that feels like variety.
The alternation was almost certainly added to avoid "the answer is always
first"; it swapped one deterministic cue for a slightly longer one.

Curveball insertion partially scrambles parity on levels 0–1 (the splice at
`:4750` shifts every subsequent `prIdx` by one) — but the splice index is
day-seeded (§3), so within a calendar day the scrambled order is *also*
constant, and levels 2/3/4 never get a curveball at all.

**Fix is one expression and no content.** Seed the flip off something that
varies per run — the run counter, or a per-run random rolled once in
`prxBuildDeck()` and stored on the deck entry so `prxBack()` (`:5273`) doesn't
re-shuffle a beat the player is mid-way through. Storing it on the deck entry
matters: a naive `Math.random()` inside the render would re-order the buttons
on every re-render, including the ones fired by `prxSetGender` (`:4853`) and
the mute toggle (`:4835`), which is its own usability bug.

---

## 3. The daily curveball is a day-lock, not a surprise (NEW — MEDIUM-HIGH)

`:4746-4751`:

```js
const runs=(prx.runs[prLevel]||0);
if(runs>=1&&prLevel<2){
  const d=new Date(), seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate();
  const cb=PRX_CURVE[seed%PRX_CURVE.length];
  deck.splice(1+(seed%(deck.length-1)),0,{...});
}
```

The seed has **calendar-day granularity**. Both *which* curveball and *where it
lands* are constants for the whole day. The comment's rationale ("everyone gets
the same daily curveball and shares are comparable") justifies the cross-user
determinism; it does not justify the intra-user determinism, and the two are
currently the same knob.

The results screen's primary replay affordance is `prxAgain()` (`:5605` →
`:5224`), which rebuilds the deck immediately. So the single most likely replay
— tap "Practice again" straight after finishing — is guaranteed to serve the
**same curveball, at the same position, with the same two options** the player
just saw thirty seconds ago. The mechanic whose entire job is "later runs get
stressed" is disarmed by the way people actually replay.

**Sub-finding, a real feedback bug.** `:5518` writes `prx.cbDay=today` when a
curveball run completes. `:5623-5624` then renders the badge as
`prx.cbDay===today ? prx_daily_done ("done ✓") : prx_daily_live ("in this run")`
— but `hasCb` is recomputed from the *current* deck, and the insertion gate at
`:4747` does not consult `cbDay`. So every run after the first on a given day
contains a curveball while the badge above it says **"Today's curveball: done
✓"**. The UI states the opposite of the deck it is rendering.

Two coherent resolutions, both content-free:
- **(a) One-and-done**: add `prx.cbDay!==today` to the `:4747` gate. Badge
  becomes truthful; later same-day runs are clean scripts.
- **(b) Per-run curveball**: seed from `prx.runs[prLevel]` (or day + runs) so
  each replay draws a different trap, and drop the badge's "done" state to a
  count. This is the one that actually serves replay value.

(b) costs the "everyone gets the same daily curveball" share-comparability
property. That property is currently worth very little — nothing in the share
payload names the curveball, and the funnel is 4 state-picks in 30 days.

---

## 4. Drill coverage is inverted: the least-rehearsed beats are the ones that matter most (NEW — HIGH, instructional)

Counting how many times each traffic `ci` can be encountered across the three
scored levels (`:4379`):

| `ci` | what the beat is | L0 | L1 | L2 | total ladder exposures | curveballs targeting it |
|---|---|---|---|---|---|---|
| 0 | documents | ✓ | ✓ | | 2 | 0 |
| 8 | "do you know why I stopped you" | ✓ | ✓ | | 2 | 0 |
| 1 | where are you coming from | ✓ | ✓ | | 2 | **7** |
| 2 | consent to search | ✓ | ✓ | ✓ | **3** | **3** |
| 6 | **"Am I free to go?"** | ✓ | | | **1** | 0 |
| 4 | have you been drinking | | ✓ | | **1** | 0 |
| 5 | **sign the citation** | | ✓ | | **1** | 0 |
| 3 | step out of the vehicle | | | ✓ | **1** | 0 |
| 7 | arrest / invoke silence+counsel | | | ✓ | **1** | 0 |

Curveball column read off `answerBeat` in `PRX_CURVE` `:4486-4495` — seven
entries resolve to `ci 1`, three to `ci 2`, none to anything else.

**Every reinforcement mechanism in the engine points at the two beats that are
already the most-drilled.** `ci 1` and `ci 2` get 2–3 ladder exposures *plus*
100% of curveball coverage. Meanwhile:

- **`ci 6` — "Am I free to go?"** — appears exactly once, as the **final beat of
  Level 0**, the calmest level, the one every player plays first and is least
  activated during. It never recurs on any later rung. It is also, functionally,
  the only line in the product that *ends an encounter*. `PRX_CITES[6]`
  (`:4410`) is the 4th-Amendment "a stop must end when its reason ends" anchor.
  One low-stress rep, ever.
- **`ci 5` — signing the citation** — the **only** beat in the entire engine
  with state-specific legal content (`PRX_SIGN`, `:4395-4406`, TX/GA/NY
  overrides via `prxCard()` `:4413-4416`). In Texas, refusing to sign is
  arrestable. A Texas user drills that exactly once per Level 1 run and cannot
  reach it from any other level.
- **`ci 4` — the drinking question** — the single highest-stakes 5th-Amendment
  moment in the traffic bank. One exposure, Level 1 only.

This is a curriculum problem, not a bug, and it is fixable **without one word of
new content**, because every beat already exists and is already reviewed. The
levers, in ascending cost:

1. **Re-point some curveballs.** Curveballs are the one existing re-drill
   mechanism and 100% of them land on `ci 1`/`ci 2`. Re-pointing an existing
   curveball's `answerBeat` is not authoring — but note the coach copy
   (`coach_en`/`coach_es`) is written *for* the current answer beat, so a
   re-point needs matching coach text. That text is legal-adjacent →
   `TODO_ATTORNEY`, one line per re-pointed curveball, EN + ES.
2. **A short "loose ends" deck** built entirely from existing `ci` — `[6,5,4]`
   or `[4,5,6]` — as a checkpoint-style standalone rather than a ladder rung.
   Zero new officer lines, zero new options, zero new coach text; it is a new
   entry in `PRX_LEVELS` plus title/description strings. This is the cheapest
   real fix in this entire document. It does need a title and a one-line
   description in EN+ES, which are marketing copy rather than legal content —
   but any framing of *why* these three beats belong together is arguably legal
   framing, so: `TODO_ATTORNEY` for the two strings, structure ready now.
3. **Weakest-beat targeting**, which needs §5.

**Credit where due, and do not break it:** the ladder's *endings* escalate
correctly — L0 ends at `ci 6` (you are released), L1 at `ci 5` (you are cited),
L2 at `ci 7` (you are arrested). That is a real, deliberate narrative curve and
any coverage fix must not disturb it. The fix belongs in a side module or in
curveball targeting, **not** in re-ordering `PRX_LEVELS[0..2].ids`.

---

## 5. There is no per-beat memory, so spaced repetition is currently unbuildable (HIGH)

HANDOFF open issue 6 reads as a missing feature. It is a missing **field**.

Persisted practice state, `:4769` + `:4775` + `:5518`:

```js
prx = { done:{}, runs:{}, best:{}, streak:{last,n}, cbDay, v }
```

All five are **per level**. Nothing is per beat. The only per-beat outcome data
that ever exists is `prRun` / `prRunIdx` (`:4767`), which are run-scoped and
zeroed by `prxAgain()` (`:5226`), `prxTab()` (`:5219`) and `practiceOpen()`
(`:5143`).

Consequences, in order of severity:

**5a. The app cannot know which beat you are bad at.** Not "does not use" —
*cannot*. Any weakest-first ordering, any decay curve, any "you have missed the
consent question three times" surfacing requires a data shape that does not
exist. This is why issue 6 keeps getting deferred: it looks like a feature and
it is actually a schema migration (and `prx` already carries a `v` stamp and two
migration blocks at `:4784` and `:4808`, so the mechanism for adding one is
established and proven).

**5b. The results screen prescribes retrieval practice it then destroys.**
`prx_tip_y` (`:1925`): *"Turn 🟨 into 🟩 — run it again with the mic on and land
the highlighted words."* The 🟨 squares are rendered from `prRun` at `:5577` and
`:5581-5585`. The button directly beneath (`:5605`) calls `prxAgain()`, which
clears `prRun` on its first line. The player is told to fix specific beats and
then handed a control that erases the record of which beats those were. They are
expected to hold it in working memory — in a product about not having to hold
things in working memory.

**5c. Targeted practice costs the same as full practice.** One miss in a 6-beat
Level 1 run can only be re-drilled by replaying all 6. There is no "review the
two you missed" path anywhere in `practiceRender()`.

**Minimum viable shape, no content, one field:**

```js
prx.miss = { <ci>: <count> }   // ++ in prxAdvance() where prCurTier==='y'
```

`prxAdvance()` `:5267` already branches on exactly that tier and already knows
`prDeck[prIdx].ci`. One increment there unlocks all three of: a review deck
assembled from existing `ci`, weakest-first ordering inside an existing deck,
and an honest "you have missed this one before" affordance. It also needs a
`prx.v` bump to 4 and a migration stanza matching `:4784`/`:4808`.

**Privacy note, because this project's core promise is the reason to check:**
`prx.miss` is a map of small integers keyed by beat index, in `localStorage`,
under the existing `amparo_prx` key. It never leaves the device. It must **not**
be added to any `ph()` payload — a per-beat miss profile keyed alongside
`data.state` (as `sr_practice_level_done` already sends, `:5524`) would be a
behavioural fingerprint of what a specific person in a specific state is bad at
during a police stop. That is exactly the class of signal `:5520-5522` already
removed once. Local only.

---

## 6. The scoreboard cannot be failed, and it is displayed as an achievement (MEDIUM)

`prxBack()` `:5273-5277` pops the recorded outcome (`prRun.pop()`) and clears
`prRevealed`. The Back button is rendered in the **answered** branch too
(`:5673`). So the loop `pick → read the coach line and the model script → Back →
pick the other one` is available at every beat, costs nothing, and leaves no
trace.

`prx.best[prLevel]` (`:5517`) is therefore not a measure of recall; it is a
measure of willingness to press Back. It is then rendered as one of three
achievement stats on the results screen (`:5593`, `prx_st_best`, "best") and as
the hub card's status badge (`:5473`, `:3482`).

I do **not** think Back should be removed — a rehearsal tool that punishes
exploration would be the wrong product for this audience, and the reveal-then-
retry loop is genuinely how someone learns a script. The finding is the
**mismatch**: an ungated retry loop feeding a stat presented as a personal best.
Two content-free options:

- Reframe the stat. `prx_st_best` is the only one of the three that claims
  performance; the other two (`prx_st_days` streak, `prx_st_lvls` levels done)
  are effort measures and are honest. Making the third an effort measure too
  costs one string per language.
- Or record first-pass-only into `best` (flag the beat once revealed; `prxBack`
  clears the outcome but not the flag). More code, keeps a real number.

Either is fine. Doing nothing is also survivable — but it should be a decision,
because §5's `prx.miss` will be gameable by the same loop and should be recorded
first-pass-only from the start, which is easier to build than to retrofit.

---

## 7. The freeze affordance is gated to levels 2+ — the inverse of where freezing happens (MEDIUM)

`prxIdleArm()` `:4864`:

```js
if(prLevel<2||prRevealed||prIdx>=prDeck.length||prxIdleN>=1) return;
```

The 12-second idle handler and its offer — replay the line, or leave, at equal
weight, nothing scored, nothing logged (`:4869-4882`) — is one of the best-
designed pieces of this engine and its own comment names the reason: *"Freezing
is the single most common trauma response to a real stop, and it is exactly what
this audience carries into the drill."*

It does not exist on Level 0 or Level 1.

A first-time user's first ever exposure to a synthesized officer voice is Level 0
beat 0. If they lock up there, they get no offer, no exit affordance, and no
acknowledgement — just a static card. The escalation-consent gate
(`prLevel>=2 && !prWarnOk[prLevel]`, `:5485`) is the right place to gate
*escalation*; it is the wrong place to gate a **safety net**, and the two are
currently the same threshold because idle-escalation and idle-offer used to be
the same feature (the comment at `:4869` records that the behaviour was changed
from re-speaking the hostile line to opening a door — but the gate came along
unchanged from the old escalating version).

The offer is now non-escalating by construction. Ungate it: drop `prLevel<2`.
No content changes — `prx_idle_h`, `prx_idle_replay`, `prx_idle_leave` all
already exist in both languages.

---

## 8. The only channel that can reach a user tomorrow is absent from the one screen about tomorrow (HIGH — cheapest retention win)

The `.ics` download is, per HANDOFF, the product's only post-close channel. Two
writers exist: `downloadReprintReminder()` `:2646` and `downloadFinishReminder()`
`:2668` (which already lands tomorrow at 19:00 and is explicitly written for a
returning user).

They are wired at `:3211` (wizard step), `:3376` (print screen) and `:3638`.
**None of them is reachable from the practice results screen.**

The results footer (`:5534-5541`) contains: checkpoint note, lifetime rehearsal
count, carry card, resources, founder's note, hard-truth link. The results body
above it renders the streak counter (`:5592`, `🔁 {n} days`) and the select
screen renders it again (`:5475`).

So the app: counts consecutive days practiced, displays that count as a stat,
resets it quietly on a lapse (`:5495-5502`), **and has no mechanism whatsoever
for causing the next day to happen.** A streak with no scheduling attached is a
scoreboard for something the product cannot influence.

This is the single cheapest spaced-repetition move available and it needs no new
engine and no per-beat data: one button in `foot`, calling the existing writer.
The `.ics` description string is the one thing that changes, and
`downloadFinishReminder`'s current text is about finishing a pack, not about
practice — so a practice-flavoured variant needs one EN + one ES line.
`TODO_ATTORNEY` is arguably overkill for a calendar description with no legal
content, but the string sits next to `prx_final_note` framing, so route it
through the normal review rather than writing it in a wargame.

Note the tone constraint already established at `:2666`: *"no guilt, no streak,
no 'you abandoned' framing."* The button must be an offer, not a nag — matching
`fin_link`'s existing shape, not a modal.

---

## 9. `PRX_LEVELS[].rate` is dead data, and it has already misled one review (MEDIUM)

`PRX_LEVELS` `:4379-4383` carries a `rate` per level: `0.95, 1.12, 1.28, 1.3,
1.0`. It is read in exactly two places, `:4730` and `:5450`, and **neither reads
`.rate`** — `:4730` uses only `L.ids`, and at `:5450` the local `L` is declared
and then never referenced again anywhere in `practiceRender()` (verified by
scanning `:5450-5608`; the sibling local `deck` on the same line is likewise
dead).

Speech rate actually comes from `PRX_TONE` `:4445` via `:4930`
(`u.rate=tn.rate`), keyed on **tone**, not level. It is a coincidence that
`PRX_TONE.calm.rate` and `PRX_LEVELS[0].rate` are both `0.95` and that
`PRX_TONE.curt.rate` and `PRX_LEVELS[1].rate` are both `1.12`; that coincidence
is why the field reads as live.

Two consequences:

**9a. `wargames/21 §4` is wrong on this point.** It cites *"speech `rate` 0.95 →
1.12 → 1.28"* as evidence the ladder escalates monotonically. That escalation
does not happen. Hard Mode's `1.3` is never applied; its beats are `curt`,
`hostile`, `hostile` (`:4506-4514`) so they speak at `1.12`, `1.22`, `1.22` —
Hard Mode's officer is **not** faster than Level 1's. Correcting the record: the
per-level pace ladder does not exist. The per-tone one does, and it is the real
mechanism.

**9b. Even the per-tone rate only reaches users whose audio is broken.**
`prxSpeak()` `:4894-4911` plays `audio/<lang>/<gender>/<id>.mp3` whenever
`d.id` is set — and after the `:4741` fallback (`id:'c'+ci`) **every** deck beat
has an id. `prxSpeakTTS()` (`:4914`), the only consumer of `PRX_TONE.rate` and
`.pitch`, runs only when that clip 404s or fails to play. For a normally
functioning install, tone→pace is carried entirely by whatever pace the
authoring-time recordings happen to have; the runtime rate/pitch model is a
fallback-only path.

Whether the shipped MP3s encode pace differences per tone is an authoring
question, not a code question — `tools/VOICE_LINES.md:14-17` does instruct
CALM / CURT / HOSTILE deliveries, so the intent is recorded. **I did not measure
the clips; treat "the MP3s carry the tone escalation" as unverified.** What is
verified is that no code applies it.

Action: delete `rate` from `PRX_LEVELS` (or wire it), and delete the dead `L` /
`deck` locals at `:5450`. Low value on its own; worth doing because dead data
that looks live has now cost one review round a wrong conclusion.

---

## 10. The orphan audio bank is 8 ids, not 1 — and 2 of them have no text anywhere in the repo (HIGH — corrects HANDOFF issue 8)

HANDOFF open issue 8 flags `v2_4` as an orphan. Enumerated this pass by
diffing `audio/en/m/` against `PRX_VAR`:

| id | text in `tools/VOICE_LINES.md` | audio `en/m`,`en/f` | audio `es/m`,`es/f` | referenced in `index.html` |
|---|---|---|---|---|
| `v0_4` | yes, marked HOSTILE | yes | yes | **no** |
| `v0_5` | yes, marked HOSTILE | yes | yes | **no** |
| `v1_4` | yes, marked HOSTILE | yes | yes | **no** |
| `v1_5` | yes, marked HOSTILE | yes | yes | **no** |
| `v2_4` | yes, marked HOSTILE (`:47`) | yes | yes | **no** |
| `v4_4` | yes, marked HOSTILE | yes | yes | **no** |
| `v8_4` | **no — no text anywhere** | yes | **no** | **no** |
| `v8_5` | **no — no text anywhere** | yes | **no** | **no** |

Folder counts: `audio/en/m` 62, `audio/en/f` 62, `audio/es/m` 58, `audio/es/f`
58. EN `m` and `f` are identical file sets; ES `m` and `f` likewise. EN-minus-ES
is exactly `{k30, k33, v8_4, v8_5}` — the first two are HANDOFF issue 4, the
last two are orphans, so the known ES gap is unchanged at 2 real clips.

(`c0`–`c9` look like orphans to a naive grep because their ids are generated —
`PRX_CURVE.forEach((c,i)=>c.id='c'+i)` `:4719` — and because `'c'+ci` is also
the per-beat fallback id at `:4741`. They are legitimately referenced. Do not
delete them.)

Three findings fall out, and they change §0's shape of the `v2_4`/`v7_4` ask:

**10a. Six hostile officer lines already have EN text and four-folder audio, and
`index.html` references none of them.** `PRX_VAR` stops at index 3 for beats
0, 1, 2, 4, 8 while the manifest and the audio go to 4 or 5. Whether these lines
were withheld deliberately (unreviewed, cut) or dropped by accident is not
answerable from the repo — nothing records it, and given the `df974b7` history
the safe assumption is **deliberate and unreviewed until an attorney says
otherwise**. Nothing here should be wired in on the strength of a file existing.
But it materially changes HANDOFF TASK 1: the operator is being asked to source
`v2_4` text that is already sitting in `tools/VOICE_LINES.md:47` with matching
audio, and the real question is *"has this line been reviewed?"*, not *"what
should it say?"*.

**10b. `v7_4` genuinely does not exist, in any form.** `VOICE_LINES.md`'s beat-7
table has four rows and stops. No text, no audio, no reference. So of the two
lines HANDOFF asks for, one is a review decision and one is authoring from
zero. Those are different asks with different owners and should be tracked
separately. `TODO_ATTORNEY` — one hostile line for `PRX_VAR[7]`, EN + ES, id
`v7_4`, entry shape `{en, es, tone:'hostile', id}`. Not authored here.

**10c. `v8_4` and `v8_5` are audio of officer lines with no written source in
this repo.** Two MP3s per voice, EN only, containing spoken words about a police
encounter that cannot be read, reviewed, or diffed without listening to them.
For a project whose stated hard rule is that no unreviewed words about police
encounters go in front of a user, un-transcribed audio is the same category of
risk as unreviewed text — it is only latent because nothing references it.
`tools/VOICE_LINES.md` also has **no Beat 8 section at all**, despite
`PRX_VAR[8]` (`:4480-4483`) shipping four live variants — so the manifest is
stale in both directions.

**10d. No check catches any of this.** `tools/` holds `app-storage-check.mts`,
`sw-routing-check.mjs`, `practice-engine-check.mts`, `extract-app-content.mjs`,
`law-watch.mjs`. None verifies `audio/` against `PRX_VAR`. A ~20-line check —
every referenced id has a clip in all four folders, every clip is referenced,
every referenced id has a line in `VOICE_LINES.md` — would have caught the
orphan trap, the missing Beat 8 manifest section, and the `k30`/`k33` ES gap,
and would make the id-reuse trap in HANDOFF's voice workflow structurally
impossible instead of procedurally avoided. This is the highest
value-per-line item in this document.

---

## 11. Difficulty curve — verdict

**The ladder is sound and should not be restructured.** `wargames/21 §4` got the
shape right even though it got the pace mechanism wrong (§9a): tone escalates
`['calm'] → ['curt'] → ['curt','hostile']` (`:4731`), consent gates from level 2
(`:5485`), Hard Mode breaks the axis on purpose and is correctly gated
(`:5458`) and unscored (`:4378`). The endings escalate released → cited →
arrested. That is a real curve.

What is thin is not the curve, it is the **pressure delta between rungs**. With
§0 confirmed, Level 2's entire increment over Level 1 is: a warning screen, one
fewer beat, an idle-repeat handler, and a 1-in-3 chance that the *opening* line
is `v3_4`. Divergence contributes nothing in either direction, curveballs are
excluded, and per §9 the speech does not speed up. Level 2 currently reads
harder than it plays.

The three cheapest things that would restore the delta, none requiring new
levels: wire a hostile variant at `ci 2` (§10a — a review decision, not
authoring), author `v7_4` (§10b), and decide whether curveballs should reach
Level 2 (`wargames/12 §5` flagged that the `prLevel<2` boundary is two unrelated
gates that happen to agree; with §3(b) making curveballs per-run rather than
per-day, that boundary is worth reopening).

**Checkpoint's thinness is confirmed and unchanged from `wargames/21 §5`.** One
fixed 4-beat deck, byte-identical every run, now on peer billing with a tab that
has tone variance and a curveball. I have nothing to add to 21's three
`TODO_ATTORNEY` sibling proposals and am not restating them. I would only
re-order: §4's "loose ends" deck built from **existing** beats lands before new
checkpoint scenarios, because it costs two strings instead of a full new
attorney-reviewed scenario.

**Hard Mode, `PRX_WAIT`, `PRX_NOSTOP` — still correctly static.** `wargames/12
§6`'s reasoning holds and this pass found nothing to revise. Do not give them
variance.

---

## 12. Priority table

| # | Finding | Where | Severity | Cost | Content needed |
|---|---|---|---|---|---|
| 10d | No check ties `audio/` to `PRX_VAR` / `VOICE_LINES.md` — the id-reuse trap is procedural, not enforced | `tools/` | **HIGH** | ~20 lines | none |
| 10a/c | 8 orphan ids, not 1; 6 have unreviewed hostile text, 2 (`v8_4`,`v8_5`) have audio with no written source; manifest has no Beat 8 | `audio/`, `tools/VOICE_LINES.md` | **HIGH** | triage | review decision, not authoring |
| 5 | No per-beat outcome data — spaced repetition is a schema gap; `prx_tip_y` prescribes what `prxAgain()` erases | `:4769`, `:5226`, `:1925` | **HIGH** | one field + migration | none |
| 8 | `.ics` reminder unreachable from the results screen — streak counted, next day never scheduled | `:5534-5541` vs `:2668` | **HIGH** | one button | 1 EN + 1 ES string |
| 2 | Correct answer's screen position is a fixed function of beat parity — a learnable positional cue | `:5659` | **HIGH** | one expression | none |
| 4 | All re-drill lands on `ci 1`/`ci 2`; `ci 6` "Am I free to go?", `ci 5` (state-specific), `ci 4` get one exposure each | `:4379`, `:4486-4495` | **HIGH** | new deck from existing beats | 2 strings (`TODO_ATTORNEY`) |
| 3 | Curveball is day-locked — the "Practice again" path guarantees the same trap; badge says "done ✓" during a run containing it | `:4746-4751`, `:5518`, `:5623` | MEDIUM-HIGH | gate or reseed | none |
| 7 | Idle/freeze safety offer gated to levels 2+; freezing is likeliest on a first-ever Level 0 run | `:4864` | MEDIUM | delete one clause | none |
| 6 | `prxBack()` makes the score unfailable; `best` shown as an achievement stat | `:5273`, `:5593` | MEDIUM | reframe or first-pass flag | 1 string if reframed |
| 9 | `PRX_LEVELS[].rate` is dead data; per-tone rate only reaches the TTS fallback; corrects `wargames/21 §4` | `:4379`, `:4930`, `:5450` | MEDIUM | delete | none |
| 11 | L2's pressure delta over L1 is a warning screen and a coin flip | `:4731`, `:4747`, `:5248` | MEDIUM | blocked on `v2_4`/`v7_4` | see 10a/10b |

**Suggested order.** 10d first — it is small, it is a check rather than a change,
and it makes every later audio decision safe. Then 2, 7 and 9 (three tiny
content-free diffs that can ship in one pass). Then 8 and 5, which are the two
halves of "does anyone come back". Then 4 and 3. §11 stays blocked on the human
items below.

---

## 13. Open items requiring a human before any of this ships

1. **Triage the 8 orphan ids (§10).** Were the six hostile lines in
   `VOICE_LINES.md` withheld for review reasons or dropped by accident? Nobody
   should wire `v2_4` in on the strength of the file existing, and nobody should
   record over the id either. This blocks HANDOFF TASK 1 and reframes it: one
   of the two requested lines already has text and audio.
2. **`v8_4` / `v8_5`.** Two EN clips of officer speech with no written source
   anywhere in the repo. Transcribe (the voice workflow's existing
   `voicebox.transcribe` round-trip is the tool for this), record the text, then
   decide keep-or-delete. Do not leave un-transcribed officer audio in the tree.
3. **`TODO_ATTORNEY` — one hostile line for `PRX_VAR[7]`**, EN + ES, id `v7_4`,
   shape `{en, es, tone:'hostile', id}`. Genuinely does not exist in any form.
   Not authored here, per hard rule 1.
4. **`TODO_ATTORNEY` — title + one-line description, EN + ES, for the §4 "loose
   ends" deck** (`ci [4,5,6]`). No officer lines, no options, no coach text —
   all of that already exists and is already reviewed. Only the framing of *why*
   these three beats belong together is new, and that framing is legal-adjacent.
5. **Product call on §3:** does the curveball stay day-locked for share
   comparability, or become per-run for replay value? Cannot be decided from
   the code; the comparability property is currently unused.
6. **Product call on §6:** is `best` an achievement or an effort stat? Decide
   before §5's `prx.miss` lands, because it should be recorded first-pass-only
   from the start if the answer is "achievement".

---

*Nothing in this document authors officer dialogue, statute text, or legal
content. §10 enumerates files that already exist in the repo and quotes no line
from any of them.*
