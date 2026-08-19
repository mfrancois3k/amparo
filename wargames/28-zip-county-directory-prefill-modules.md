# Wargame 28 — Practice-module review: beat structure, curve, pacing, replayability

Date: 2026-08-16. Design review only. No `index.html` edits made or authorized
by this document. Structure-only, same convention as `wargames/03`: no officer
dialogue or legal content is authored here, and none of the existing
`TODO_ATTORNEY` / `TODO_DV_CLINICIAN` placeholders are filled in.

**Scope note.** This is step 8 of `/amparo-loop` off v2.22.13 ("ZIP/county,
pre-filled directory search"). That feature is not re-reviewed here — it's the
occasion, not the subject. It touches step 2 (You) and the Lifelines
directory link; the practice engine it sits next to is a separate system with
its own file region (`index.html` ~4677–6100+). The one real connection: v2.22.13
is about getting a user to a *real* lawyer faster. The practice modules are
the *rehearsal* layer — what a user does before that call, or instead of one
if no lawyer is reachable in time. This review is a game-designer /
level-designer / instructional-designer pass on that layer as it exists today,
which turns out to be substantially larger than the last design pass on it
(`wargames/03`, 2026-08-03) accounted for.

**Everything below was verified against source** (`index.html`, current
`main`) rather than assumed from prior wargame docs. Several `wargames/03`
findings have since been fixed; at least one is still live; the door module's
own blocking rationale has *changed* since `wargames/03` was written, in a way
that matters more to level design than to legal review.

---

## 1. What actually exists today — corrected structure

`wargames/03` described a 6-level ladder (traffic 0–2, hard mode 3, checkpoint
4, door 5). The live code has moved on from that shape entirely:

```js
const PRX_LEVELS=[{ids:[0,8,1,2,6]},{ids:[0,8,1,2,4,5]},{ids:[3,2,7]},
  {ids:[20,21,22]},{ids:[30,31,32,33]}
  ,{ids:[50,51,52,53,54,55]}   // 5 — "The long wait"
  ,{ids:[60,61,62,63,64,65]}   // 6 — "It doesn't stop"
  ,{ids:[70,71,72,73,74,75]}   // 7 — door module
];
```

| Idx | Name | Beats | Tone pool | `prx.done` gate | Scored? | Ship state |
|---|---|---|---|---|---|---|
| 0 | Calm stop | 5 | calm | none | yes | **live** |
| 1 | Irritated officer | 6 | curt | none | yes | **live** |
| 2 | Ordered out | 3 | curt+hostile | none (unlocks 3/5/7) | yes | **live** |
| 3 | Hard mode | 3 | `bothGood`, unscored | `mUnlocked` | no (debrief) | **live** |
| 4 | Checkpoint | 4 | fixed script | none (never gated) | yes | **live** |
| 5 | The long wait | 6 | fixed, widening silence | `mUnlocked` | no | **built, `FINAL_SCENARIOS_ENABLED=false`** |
| 6 | It doesn't stop | 6 | fixed, contracting cadence | `mUnlocked` **and** `prx.done[5]` | no | **built, dark** |
| 7 | Door module | 6 | fixed | `mUnlocked` (in code today) | no | **built, `DOOR_MODULE_ENABLED=false`** |

`mUnlocked = prx.done[0] && prx.done[1] && prx.done[2]` (:5892). Checkpoint
(4) is deliberately outside this gate — the code comment says so — because
it's a different encounter, not an escalation, and the only scenario that
applies fully in all 50 states.

The hub (pack step 5) currently shows **three tabs**: "Traffic stop"
(rungs 0–3, minus checkpoint), "Checkpoint" (its own tab), and "At your door"
— which renders an honest not-built-yet card (`hub_m2_body`, :1934) rather
than hiding the tab. Levels 5 and 6 aren't in the hub or the in-practice
level-select list yet because `PRX_LEVEL_IDS` caps at `[0,1,2,3,4]` while
`FINAL_SCENARIOS_ENABLED` is false (:4724). So today's live surface is
exactly 5 scenarios; three more are staged behind flags with placeholder
content.

This matters for the review below: a curve/pacing critique of "the practice
modules" has to cover both the 5 shipping scenarios (where findings are
live bugs) and the 3 staged ones (where findings are pre-ship level-design
input, cheaper to act on now than after content is poured in).

---

## 2. Difficulty curve, re-read against the current 8

`wargames/03` sorted the old 6 levels by failure mode rather than by
"difficulty," following the code's own stated design (:4677: *levels track
officer hostility, not difficulty; the reviewed script shrinks as hostility
rises*). That framing still holds and extends cleanly to the new levels:

| Idx | Failure mode trained | Beats | Ends in |
|---|---|---|---|
| 0 | learning the script | 5 | score |
| 1 | holding it under irritation | 6 | score |
| 2 | compliance + invocation under an exit order | 3 | score |
| 3 | **self-blame** (bothGood, unwinnable by design) | 3 | debrief, no score |
| 4 | **volunteering** (not panic) | 4 | score + legal-limits note |
| 5 | **freezing under open-ended silence** | 6 | debrief, no score |
| 6 | **the belief that compliance de-escalates** | 6 | debrief, no score |
| 7 | **politeness** (door, voluntary encounter) | 6 | debrief, no score |

Four distinct failure modes beyond panic (self-blame, volunteering, freezing-
under-silence, compliance-doesn't-guarantee-safety) is a coherent set — each
teaches something the others structurally cannot. That's good instructional
design and it's *new* relative to `wargames/03`, which only had panic,
volunteering, and self-blame to work with.

**One curve problem, unchanged from `wargames/03` §5.5/5.6 but now solved a
different way than recommended:** the old two-beat "Ordered out" spike is
gone — level 2 is now 3 beats (`[3,2,7]`, exit → consent-to-search → arrest),
matching `wargames/03`'s exact recommendation to insert `ci:2` between exit
and arrest to give the arrest beat runway. **Verified fixed.**

**One curve problem `wargames/03` didn't have room to say, because levels 5/6
didn't exist yet:** levels 5 and 6 are *sequentially* gated
(`i===6&&!(mUnlocked&&prx.done[5])`, :5896) specifically so nobody reaches the
contracting-cadence scenario before the widening-cadence one. That's a
correct call structurally — 6's thesis ("compliance doesn't reliably
de-escalate") only lands as a *reversal* if the player has already sat through
5's slow-burn silence and internalized what patience looks like. Flag it as
correct, not a finding — worth stating because it's easy to assume all
`mUnlocked`-gated levels are unlocked in parallel and this one isn't.

**A curve gap worth flagging before content is poured into 5/6/7:** all three
staged levels are 6 beats, unscored, ending in a debrief. Three
structurally-identical-shaped scenarios in a row (same beat count, same "no
score" ending, same debrief pattern) risk feeling like reskins of each other
at the *meta* level even though their internal mechanics (widening interval /
contracting interval / physical-barrier-and-irreversible-position) are
genuinely different. `wargames/03` §5.6 flagged exactly this risk for the
now-removed old level 3 ("not structurally distinct from level 1") and the
fix there was reframing in copy, not new beats. The same fix — the results
screen or hub copy naming *what* was different about the level just finished,
not just that it finished — is cheap and should ship in the same PR that
flips each flag, not be retrofitted after.

---

## 3. Pacing: tone ladders across the three tiers

| Level | Tone sequence | Notes |
|---|---|---|
| 0 | calm → calm → calm → calm → calm | flat, by design — "learn the rhythm" (`prx_ld1`) |
| 1 | curt throughout | one notch up, still flat |
| 2 | curt/hostile pool, 3 beats | first level where hostile is reachable |
| 3 (Hard) | curt → hostile → hostile | escalates fast, matches "self-blame" thesis — the point is the officer escalates regardless of a textbook-correct answer |
| 4 (Checkpoint) | calm → curt → curt → curt | flat-low; businesslike, not angry — matches "volunteering, not panic" as the trained failure mode |
| 5 (Wait) | curt → curt → curt → hostile → hostile → hostile (per beat-comment intent) | cadence carries pressure, not tone — widening silence |
| 6 (No-stop) | curt → curt → curt → hostile (cold flip, no wind-up) → hostile → hostile | register flip engineered at beat 4, +6.6dB/+64Hz per the code comment, deliberately un-telegraphed |
| 7 (Door) | calm → calm → curt → curt → hostile → hostile | flattest, slowest ladder of all eight — reaches hostile only at beat 5 of 6 |

The door module's tone ladder is the right shape for its thesis (`wargames/03`
§2.2(c): *"the module should feel slower than the traffic stop... the
dangerous version of this encounter is the one that stays polite"*) —
confirmed still true in the staged `PRX_DOOR` array (:5008–5027): tones are
`calm, calm, curt, curt, hostile, hostile`, the flattest ladder of the eight
levels. That specific pacing decision survived from the design doc into the
actual scaffold. Good — worth confirming rather than re-deriving.

**One thing that changed the pacing calculus since `wargames/03`, and it's
the single most important finding in this document:** the door module's
*correct answer*, not just its content, is now understood to be
context-dependent in a way the engine cannot express. See §5.

---

## 4. Replayability — what's fixed, what's still stale

`wargames/03` §5.3, §5.4, §5.7 raised three replayability problems. Checked
each against current code:

**§5.7 (score legibility, `parseInt("2/2")` → `🟩2`) — FIXED.** The hub grid
now shows the stored `"n/total"` string verbatim (:3666, with an explicit
code comment naming the old bug and why it mattered when denominators differ
2–6 across levels). Confirmed by reading the render call site directly.

**§5.4 (45 authored variants nobody is told exist) — FIXED**, cheaply, exactly
as recommended. `prx_sel_sub` now reads *"Two minutes each, out loud. The
officer's wording changes every run."* (:1908), with a code comment
explicitly citing this as "Move 6" of the redesign. One sentence, shipped.
`wargames/03` recommended exactly this as the cheapest fix that captures most
of the value — done, not gold-plated with a coverage counter, correctly so.

**§5.3 (curveball seeded on date only, so replays within a day repeat
identically) — STILL OPEN.** Current code (:5120–5125):

```js
const runs=(prx.runs[prLevel]||0);
if(runs>=1&&prLevel<2){
  const d=new Date(), seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate();
  const cb=PRX_CURVE[seed%PRX_CURVE.length];
  deck.splice(1+(seed%(deck.length-1)),0,{...});
}
```

`runs` is read into a local variable and then never used in the seed. A
player who replays level 0 five times today gets the identical curveball
question inserted at the identical deck position all five times — the
mechanic the code comment above `PRX_CURVE` (:4779) calls out as "not
runtime-generated" for review reasons is, separately, not actually
*varying* within a session. This is a one-line fix
(`seed + runs` or similar, keeping the first-run-of-the-day comparability
`wargames/03` correctly said to preserve) and it's the same fix `wargames/03`
already specified. Re-flagging because it's the one item from that document's
replayability section that never landed.

**New replayability win not covered by `wargames/03` at all, because the
mechanic didn't exist yet:** the good/bad option now render on a
per-deal `swap` flag stored on the beat object itself (:5085–5093), not
derived from `prIdx%2` at render time. The code comment explains the old bug
precisely: the correct answer used to land in the *same screen position* on
every run of every level for every player, forever — training "which side to
tap" instead of "which words are right." This is exactly the kind of
structural replayability defect a level designer would flag, and it's already
found and fixed, with the reasoning preserved in-line. Confirmed by reading
the function.

---

## 5. The door module's central structural problem is no longer "unreviewed
content" — it's an engine/thesis mismatch

`wargames/03` treated the door module's blocker as a content-review problem:
attorney sign-off on TODO_ATTORNEY lines, plus a DV-clinician pass on the
subset it flagged (§6.5) as needing separate review. That framing is now
superseded by the block comment actually gating the flag (:4695–4702):

> *"wargames/09 and the DV research found its planned correct answer — calm,
> repeated refusal at the threshold — is what published DV-response training
> tells officers to read as the assailant's presentation, and to NOT leave
> on. DV-related calls are 15–50% of all police calls, so that is plausibly
> the modal case... This flag does not flip on an attorney's sign-off alone;
> it needs a domestic-violence clinician too."*

Read as a level-design problem rather than a legal one, this is not "beat 2
needs a different intercept list" (which is what `wargames/03` §6.5
proposed — a crisis-style unscored disclosure route). It's that **the
module's single-track, one-correct-answer-per-beat shape cannot represent a
fork where the same officer behavior calls for opposite correct responses
depending on information the player does not have and the game cannot ask
for** (who else is in the house, and whether they can speak freely). Every
other beat in the entire practice engine — traffic, checkpoint, hard mode —
resolves to one reviewed answer because the physical situation is
unambiguous once you're pulled over. The door is the first scenario where
that assumption is false at the premise level, not just at one contested beat
(the already-excluded "foot in the door," `wargames/03` §3 Beat 7).

Two structural options exist once attorney + DV-clinician review is done,
neither authored here:

1. **A `bothGood`-style beat** (the mechanism already exists — `PRX_OPT[20]`,
   `PRX_HARD`'s pattern) at the reason-for-visit beat (ci 71) and the
   step-outside beat (ci 73), where both options coach toward safety without
   asserting one is "correct" — mirroring how Beat 7 in `wargames/03` was
   already ruled `bothGood`-or-cut for a legal-outcome split. The same shape
   now needs to absorb a *safety-context* split, not just a legal one.
2. **A front-door disclaimer state**, shown once before beat 1, that the
   module teaches the knock-and-talk case specifically and names — plainly,
   not clinically — that a DV situation changes the right move, with a
   resource line. This doesn't require new engine mechanics; it's a `setter`-
   equivalent screen gated the same way the per-level warning (`prWarnOk`) is.

Recommendation for whoever holds the pen when this unblocks: **don't let
"attorney says the beats are correct" read as "ship."** The gating comment is
explicit that a DV clinician is required *in addition to* attorney sign-off,
and the reason is structural (the correct-answer shape), not a wording
problem any one beat's copy can absorb.

---

## 6. Still-live bug from `wargames/03` §5.1 — unscored via type-your-own,
confirmed present today, in shipping levels

`wargames/03` found two beats whose `y` field has no curly-quoted phrase, so
the free-text matcher's keyword extraction returns an empty array and the
beat is unwinnable via the type-your-own path (forced `prCurTier='y'`, a
guaranteed miss with no explanation shown). Re-checked against current
source, same defect, same root cause, **not fixed**:

- The extraction is still duplicated verbatim at two call sites:
  `index.html:5381` and `index.html:5518`, both
  `card.y.match(/"([^"]+)"/g)`.
- **`ci:33`, "Pull over to secondary"** (:5054): `y` = *"Comply with where to
  park. Keep declining questions. Never drive away."* — zero curly-quoted
  spans. This beat is in the **Checkpoint level (index 4)**, which is live
  and ungated today.
- **`ci:5`, "Sign here"** (via `PRX_SIGN` state overrides, :4735–4744): the
  TX/GA/NY override text for `y` also carries no curly-quoted phrase in any
  of the three states' strings. This beat is in **level 1 ("Irritated
  officer")**, also live and ungated.

Both beats are in scenarios a user can reach right now without any flag
change. The fix `wargames/03` specified — extract one `prxScore(text, card)`
used by both sites, treat "no keywords available" as unscored (`prCurTier='x'`,
the same mechanism crisis disclosures already use) rather than a forced miss
— is unchanged and still the right shape: one guard, both call sites, and it
automatically covers every beat in the three staged levels too (none of their
`y` fields exist yet, so this bug will reproduce at scale the moment their
placeholders are filled in, unless the matcher is fixed first).

---

## 7. Two small, verifiable gaps the door module will hit at ship time

Neither blocks anything today (the flag is off), but both are cheap to note
now, before content and QA attention are spent on the module:

1. **No `.doorbg` badge class exists.** The three already-shipped fixed-track
   levels each get a CSS badge on the level-select card
   (`.hardbg`, `.chkbg`, `.waitbg`, `.nostopbg` — all defined at
   :682–738). The ternary that assigns one is
   `${i===3?' hardbg':''}${i===4?' chkbg':''}${i===5?' waitbg':''}${i===6?' nostopbg':''}`
   (:5909) — **there is no `i===7` branch**, and the photo-background fallback
   is explicitly suppressed for `i>=3`. As written, the door's level-select
   card would render with no badge and no photo: a blank thumbnail. One-line
   fix, same shape as the other four.
2. **No `prx_ld6`/`prx_ld7`/`prx_ld8` description strings.** The level-select
   card shows a one-line description (`_t['prx_ld'+(i+1)]||''`, :5910) for
   levels 1–5 only (`prx_ld1`…`prx_ld5` exist at :1909–1913). Levels 6, 7, and
   8 (1-indexed: "the long wait," "it doesn't stop," the door) have no
   corresponding key, so today's fallback silently renders an empty
   description — consistent with `wargames/03`'s own convention of leaving
   copy as a placeholder rather than inventing it, but worth a checklist line
   so it isn't the thing that ships broken because everything *else* about
   the level was reviewed.

`PRX_DOOR_IDS` (:4727, `DOOR_MODULE_ENABLED?[7]:[]`) is defined but never
read anywhere else in the file — `prxBuildDeck` branches on the literal
`prLevel===7` instead. Not a bug (the literal path works), just dead code
sitting next to real logic; worth deleting or wiring up in the same pass that
adds the `.doorbg` badge, so there's one source of truth for "is 7 a real
level" instead of two that can drift.

---

## 8. Punch list, prioritized

1. **HIGH, live today:** fix the duplicated free-text matcher (§6) so `ci:5`
   and `ci:33` — both reachable in shipping levels — stop being unwinnable via
   typed answers. One function, two call sites.
2. **HIGH, pre-ship for the door module:** resolve the engine/thesis mismatch
   in §5 before any attorney-reviewed door content is written — the structural
   question (`bothGood` vs. a front-door disclaimer state) determines what
   shape the DV-clinician review even needs to sign off on.
3. **MEDIUM, cosmetic but easy to forget:** curveball seed still ignores
   `prx.runs` (§4, `wargames/03` §5.3) — replays within a day are identical.
   One-line fix, already specified twice now.
4. **LOW, pre-ship for levels 5/6/7:** add the reframing sentence(s) so three
   consecutive 6-beat/unscored/debrief-ending scenarios don't read as reskins
   at the meta level (§2), and fill in `prx_ld6`/`7`/`8` + `.doorbg` (§7)
   before any flag flips, not after QA catches an empty thumbnail.
5. **Housekeeping:** delete or wire up the dead `PRX_DOOR_IDS` constant (§7)
   so `prLevel===7` isn't checked one way in the hub's implicit assumptions
   and another way in `prxBuildDeck`.

## Confirmed fixed since `wargames/03` (no action needed, listed for the record)

- Score-fraction display shows the real `"n/total"` string, not
  `parseInt()`-truncated (§4, was §5.7).
- Users are told officer wording varies between runs (§4, was §5.4).
- The old two-beat "Ordered out" spike is now three beats with a natural
  insertion (§2, was §5.5).
- The old "level 3 is a reskin of level 1" problem is moot — that level no
  longer exists; index 3 is now Hard Mode, structurally distinct (§2, was
  §5.6).
- Option-side (good/bad) randomization is now per-deal and stable per beat
  instead of a positional `prIdx%2` pattern repeating every run (§4, new
  finding not in `wargames/03`, confirmed fixed in the same commit that
  introduced it).
