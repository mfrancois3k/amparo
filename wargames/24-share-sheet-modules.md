# wargames/24 — what the engine should do with a known weak beat

Round for `/amparo-loop share-sheet`, at `v2.22.1`. Agent B (game design / level
design / instructional design). Follow-up to `wargames/22-small-fixes-modules.md`
and `wargames/23-honesty-fixes-and-restores-modules.md`.

`wargames/22` §5 argued the missing piece was a **field**. That field now exists
(`prx.miss` / `progress.miss`, v2.21.11). This round answers the question that
was explicitly deferred with it: **what should the product DO with it?** §3 takes
a position and names the trade. Everything before that is the verification the
position rests on.

**Scope discipline, unchanged from 03 / 12 / 16–23:** structure and sequencing
only. **No officer dialogue, no statute text, no legal content is authored in
this document.** Where a line would be needed, `TODO_ATTORNEY` is the only
placeholder, per `wargames/03-door-module-design.md`.

Line numbers are `C:\Users\mfran\Ai-Foundations\Amparo\index.html` at `v2.22.1`
unless stated. `HEAD` (`872eed3`) is docs-only against that tag —
`git diff --stat v2.22.1 HEAD` touches `CHANGELOG.md` and
`notebook/amparo-version-history.md` only — so tag line numbers are current.

---

## 0. Re-verification of the four engine changes I was handed

Every one verified by reading the code, not by accepting the brief.

| Claim in the brief | Verdict | Evidence |
|---|---|---|
| `PRX_LEVELS` no longer has `rate` | **Confirmed** | `:4512-4518` — every entry is `{ids:[…]}` and nothing else. The removal note sits at `:4504-4511`. `PRX_TONE` still carries `rate` at `:4578` and it is read only by the TTS fallback |
| Answer position randomized per beat at deal time | **Confirmed** | `swap` set at `:4890` (`const swap=()=>Math.random()<0.5`) and attached at all seven return paths `:4891-4910`. Render reads `d.swap` at `:5853` (`${d.swap?bC+gC:gC+bC}`). `prIdx%2` no longer appears anywhere in the option render |
| …genuinely random per deck | **Confirmed** | Independent `Math.random()<0.5` per beat, evaluated inside `prxBuildDeck()`. No shared seed, no index dependence, no day-lock. Unlike the curveball (§2) it is **not** date-seeded, so two players on the same day get different layouts |
| …stable across a re-render of the same beat | **Confirmed** | `swap` lives on the deck-entry object. `prxBuildDeck()` is called at exactly four sites — `practiceOpen()` `:5324`, `prxTab()` `:5400`, `prxAgain()` `:5408`, and the re-lock fallback inside `practiceRender()` `:5648`. The first three are level entry/replay; the fourth fires only when `isLocked(prLevel)` is true. The re-render paths that worried `wargames/22` §2 — `prxSetGender()` `:5034`, `prxMuteTgl()` `:5008`, the ES voice-language buttons `:5846` — all call `practiceRender()` and never re-deal. Buttons hold position for the life of the beat |
| Per-beat miss tracking exists, all-time, survives `prxAgain()` | **Confirmed** | Init `:4956`, single increment `:5455`, single read `:5775`. `prxAgain()` `:5406-5409` touches `prRun`/`prRunIdx`/`prIdx` and not `prx.miss` |
| Nothing consumes it except a badge | **Confirmed, exhaustively** | Three sites in root (`:4956`, `:5455`, `:5775`), three in `/app` (`practiceEngine.ts:156`, `:321`, `PracticeDebrief.tsx:86`). No deal path, no selection path, no gate, no analytics reads it |
| `/app` id-recompute parity (v2.21.9) | **Not re-verified this pass** — outside this round's lens. Marked unverified rather than assumed |

**Two credits, because they were the specific risks flagged last round.**

1. **The privacy constraint `wargames/22` §5 wrote down was honoured.** `prx.miss`
   appears in no `ph()` payload on either side. A per-beat miss profile keyed
   alongside `data.state` would have been a behavioural fingerprint of what a
   specific person in a specific state is bad at during a police stop; it was not
   built. Verified by grep across both trees.
2. **`swap` was put on the deck entry, not in a render-time cache** — the exact
   failure mode `wargames/22` §2 named ("would re-order the buttons on every
   re-render, including the ones fired by `prxSetGender` and the mute toggle").
   The implementation took the harder-to-get-wrong option.

---

## 1. Two defects in `prx.miss` itself — fix these before anything consumes it (NEW — HIGH)

Both are true in root **and** `/app`. Both matter only a little for a badge and a
lot for a scheduler, which is why they belong ahead of §3 rather than inside it.

### 1a. `prxBack()` un-scores the run but not the counter

`prxBack()`'s own comment at `:5459-5460` states its contract: *"dropping its
recorded result so a re-do re-scores cleanly."* It drops `prRun`/`prRunIdx`
(`:5466`) and does not touch `prx.miss`. `/app`'s `back()` is identical —
`practiceEngine.ts:369-380` slices `run`/`runIdx` and passes `progress` through
untouched.

So the loop `pick the mistake → read the coach line → Next → Back → pick the
right one` produces a run that displays `🟩` and a `prx.miss` that permanently
records the miss. `wargames/22` §6 predicted this exact class of leak for the
scoreboard and closed with *"§5's `prx.miss` will be gameable by the same loop
and should be recorded first-pass-only from the start, which is easier to build
than to retrofit."* It was not, and this is the retrofit.

Direction of the error matters: it **inflates**. Every exploratory Back after a
miss makes a beat look chronically weak. The players most likely to use Back are
the ones exploring the coach lines carefully — i.e. the ones learning best. A
weak-beat consumer built on this field would preferentially target the beats the
most engaged players have already worked hardest on.

Cheapest correct fix, no content, symmetric with the push it mirrors: decrement
in `prxBack()` when the popped outcome was `'y'`, using `prRunIdx`'s popped index
to recover the `ci` (`prRunIdx` exists precisely because `prRun` and `prDeck`
misalign — `:5432-5436`). Same shape in `back()`.

### 1b. The counter is monotonic — it never records that you fixed it

`:5455` is `+1` and there is no other write. A beat missed six times in week one
and answered correctly on every run since still reads `×6` forever, on both
builds. As a *badge* that is merely stale. As a **scheduling signal it is
actively wrong**: any weakest-first ordering built on a monotonic counter
converges on whatever you were bad at when you started and never lets go.

The field's own doc comment (`:4945-4955`, `practiceEngine.ts:148-156`) is honest
that it is "not full spaced repetition." The gap is narrower than that phrasing
suggests: it isn't missing a scheduler, it's missing **decay**. A counter that
only rises cannot express "currently weak," which is the only thing a scheduler
needs.

**Position: make it a leaky bucket, not a ledger.** Decrement on a good answer,
floored at zero — one expression next to the existing increment, no new field, no
migration (an existing saved `{ci:n}` map is already a valid bucket). The cost is
real and should be stated: the `×N` badge stops meaning "missed N times ever" and
starts meaning "N unrecovered misses," and the three doc comments that say
"all-time" become wrong and must change with it. I think the new meaning is the
one the badge should have had — a player looking at `×5` on a beat they just
missed is being told *"this is a live weakness,"* not *"here is your history."*
The existing `prx_tip_y` copy (`:1975`, "Turn 🟨 into 🟩") already frames it that
way.

---

## 2. Two structural facts that decide §3

Neither is a defect. Both are constraints that rule out one of the candidate
answers outright.

### 2a. The curveball pool can only ever target two beats

`PRX_CURVE` `:4644-4655` is ten entries. Their `answerBeat` values:

| `answerBeat` | count |
|---|---|
| `ci 1` (where are you coming from) | 7 |
| `ci 2` (consent to search) | 3 |
| everything else (`ci` 0, 3, 4, 5, 6, 7, 8) | **0** |

`wargames/22` §4 counted this and called the resulting curriculum "inverted" —
`ci 1`/`ci 2` already carry the most ladder exposures *and* 100% of curveball
coverage, while `ci 6` ("Am I free to go?"), `ci 5` (signing, the only
state-specific beat in the engine) and `ci 4` (the drinking question) get one
exposure each, ever.

The consequence for this round is sharper than a coverage complaint:
**"bias curveball selection toward weak beats" is a null operation over 7 of the
9 traffic beats.** If the player's weakest beat is `ci 6`, a weighted curveball
draw cannot reach it — there is no entry to draw. If their weakest beat is `ci 1`
or `ci 2`, the unweighted draw already hits it 100% of the time. There is no
player for whom weighting the existing pool changes the deck.

Making it non-null requires re-pointing curveballs at other beats, and each
re-point needs matching `coach_en`/`coach_es` written *for* the new answer beat
(the existing coach text is written for `ci 1`/`ci 2` specifically). That text is
legal-adjacent → `TODO_ATTORNEY`, EN + ES, one pair per re-pointed entry. So the
candidate isn't just weak, it's **blocked on the same attorney gate as everything
else in HANDOFF open issues 1–3**.

### 2b. The curveball duplicates a `ci` already in the deck — so `prx.miss` is biased at the source

`PRX_LEVELS[0].ids` is `[0,8,1,2,6]` and `PRX_LEVELS[1].ids` is `[0,8,1,2,4,5]`
(`:4512`). Both contain `ci 1` and `ci 2`. The curveball splices in a beat whose
`ci` is `cb.answerBeat` (`:4919`) — always 1 or 2. The insertion is unconditional
on what the deck already holds.

So from the second run of Level 0 onward, a six-beat deck spends **two of six
beats on the same `ci`**, and `:5455` can increment `prx.miss[1]` twice inside a
single run. Level 1 the same. No other `ci` can be double-counted anywhere in the
engine.

This is a measurement bias baked into the data, not just a curriculum imbalance:
`prx.miss[1]` and `prx.miss[2]` accrue at roughly double the rate of every other
beat *for identical player skill*. Combined with §1a's inflation, a weakest-first
selector reading this field would rank `ci 1` first for nearly every player —
which is precisely the beat that needs re-drilling least.

Two smaller consequences worth recording:
- The `×N` badge renders on both the curveball row and the plain `ci 1` row with
  the **same number** (`:5775` keys on `d.ci`), so the debrief shows a duplicated
  count on two visibly different officer lines. Defensible — it is the same
  skill — but it reads as a rendering bug at a glance.
- `wargames/22` §4's exposure table undercounts. Its "total ladder exposures"
  column charged `ci 1` two exposures across L0+L1; from run 2 onward it is four.

---

## 3. The position: build a review deck, keep the shared daily curveball, and pay for it in shareability

The brief asked for a position, not a menu. Here it is, with the trade named.

### The recommendation

**Consume `prx.miss` with one thing: an opt-in, unscored, variable-length review
deck reachable from the debrief — "the beats you keep missing." Do not touch
curveball selection. Do not weight the ordinary deal.**

### Why a review deck and not the other three

**Against biasing the curveball (§2a).** It cannot reach 7 of 9 beats, it is a
no-op for the other 2, and making it real is blocked on attorney-authored coach
text. It also spends the date-seed for nothing — see the trade below.

**Against weighting the ordinary deal.** `PRX_LEVELS[0..2].ids` are fixed
sequences and their *endings* are load-bearing narrative: L0 ends at `ci 6` (you
are released), L1 at `ci 5` (you are cited), L2 at `ci 7` (you are arrested).
`wargames/22` §4 flagged this explicitly — *"any coverage fix must not disturb
it… the fix belongs in a side module or in curveball targeting, not in
re-ordering `PRX_LEVELS[0..2].ids`."* I agree and will not re-litigate it.
Weighting *which variant* is dealt is available but pointless: `PRX_OPT` is keyed
by `ci` only (`:4554`), so the thing being drilled is byte-identical regardless
of which variant speaks it. Variant weighting changes the wrapper, not the drill.

**Against deliberately nothing.** The engine's own copy makes the case. `:5788`
renders `prx_tip_y` — *"Turn 🟨 into 🟩 — run it again with the mic on and land
the highlighted words"* — directly above a breakdown that now, correctly, marks
which beats those are. The button beneath it (`:5799`, `prxAgain()`) re-deals the
whole level. `wargames/22` §5c: *"One miss in a 6-beat Level 1 run can only be
re-drilled by replaying all 6."* The badge closed the *memory* gap and left the
*cost* gap wide open. Telling a player exactly which beat they keep failing and
then offering only a full replay is worse than not telling them — it converts a
vague sense of weakness into a specific one with no proportionate action attached.

**For the review deck.** It is the only candidate that is a **deal, not content**.
`prxBuildDeck()` already maps an arbitrary array of `ci` into a playable deck
(`:4899-4911`), including the canonical `c<ci>` audio fallback for any beat with
no tone-matched variant. `PRX_OPT`, `PRACTICE`, `PRX_CITES`, `prxCard()`'s
state-specific `ci 5` override and the recorded clips all already exist for every
`ci` in the bank. A review deck is `{ids: [...]}` assembled at runtime from
`prx.miss` — zero new officer lines, zero new options, zero new coach text. It is
the same structural move `wargames/22` §4 proposed as its "loose ends" deck
`[6,5,4]`, with the beat list chosen per player instead of fixed.

It also lands `wargames/22` §4's coverage inversion as a side effect without
touching the ladder: a player who is weak on `ci 5` or `ci 6` gets reps on `ci 5`
or `ci 6`, which no other mechanism in the engine can currently deliver.

### The trade, stated explicitly

**I would not spend the date-seeded daily curveball. I would spend
shareability of the personalized surface instead.**

The date-seed's stated rationale (`:4913-4915`) is *"everyone gets the same daily
curveball and shares are comparable."* Two things about that, both verified:

1. **Nothing in the share payload currently carries it.** `prxShareRun()`
   `:5619-5626` builds `Amparo 🚔 <level>\n<grid> N/M\n<taunt>` plus the bare
   site URL. No date, no day number, no curveball identity. The v2.22.0 share
   sheet (`8d93d39`) and the v2.22.1 Facebook/X additions (`f9d7806`) changed the
   delivery surface and not the payload. So the property the date-seed buys is
   currently **unexpressed** — two players who compare grids cannot tell whether
   they faced the same trap. `wargames/22` §3 reached the same conclusion and
   concluded the property "is currently worth very little."
2. **That is an argument for fixing the share, not for spending the property.**
   The date-seed is also what makes the `prx_daily` badge (`:5816`, "⚡ Today's
   curveball") and `prx.cbDay` mean anything, and it sits inside the only
   retention loop the product has — day streak (`:5694-5700`), daily trap,
   `.ics` reminder. Personalizing curveball selection would delete the one
   *shared* daily artifact in a product whose share button is its only
   distribution channel, in exchange for a targeting capability §2a proves it
   cannot deliver. That is a bad trade at any price.

So the personalized surface is built **beside** the daily one, and pays for
itself by being deliberately non-comparable:

- **Unscored.** Add it to `PRX_UNSCORED` (`:4503`). It never writes `prx.best`
  (`:5704` is already guarded), never renders the score ring (`:5668`), never
  produces an `N/M`.
- **Unshared.** No share button on its debrief. A share whose denominator is
  "however many beats *you* are bad at" is not comparable with anyone, and
  publishing it leaks a weakness profile off-device — the same class of signal
  `:5711-5713` already removed once from `sr_practice_level_done`.
- **Off the ladder.** Not in `PRX_LEVEL_IDS` (`:4520`); reached from the debrief
  next to `prxAgain()`, and only when it would be non-empty. A player with no
  weak beats never sees it.
- **Local.** Everything it reads is already on the device.

That is the whole trade: **comparable daily challenge stays; the personalized
deck gives up ever being a score or a share.** It buys targeting for the seven
beats the curveball can never reach, and costs one entry in `PRX_UNSCORED`.

### Ordering — and one precondition that is not optional

`§1a` and `§1b` are **preconditions**, not nice-to-haves. A review deck reading
today's `prx.miss` would select on a counter that is inflated by exploration
(§1a), never decays (§1b), and double-counts two beats structurally (§2b). All
three bias the same direction, toward `ci 1`/`ci 2` — the two beats that already
receive every reinforcement mechanism in the engine. Built today, the review deck
would re-drill the most-drilled beats and call it personalization.

Fix order, cheapest first, each independently shippable:
1. §1a decrement in `prxBack()` / `back()` — one expression per side.
2. §1b leaky-bucket decrement on a good answer, plus the three "all-time" comments.
3. §2b: skip the curveball splice when the deck already contains that `ci`, **or**
   simply exclude curveball beats from the `prx.miss` increment at `:5455`
   (`prDeck[prIdx].curve` is already on the object). The second is smaller and
   loses nothing — a curveball miss and a plain miss on the same `ci` are the
   same skill, and the plain beat is always present in the same deck to record it.
4. Only then, the review deck.

Steps 1–3 are content-free and improve the existing badge on their own merits.
Step 4 needs two UI strings (a button label and a deck title) in EN + ES. Framing
*why* a set of beats belongs together is arguably legal framing → `TODO_ATTORNEY`
for those two strings, structure ready now. Same call `wargames/22` §4 made for
the "loose ends" deck.

### What I would not build

No scheduling. No intervals, no due dates, no decay curve over time. The streak
(`:5694-5700`) is already the product's return mechanism and it counts **days
practiced, never perfection** (`:5695`) — deliberately, for a trauma-adjacent
audience. A due-date system would put "you are overdue on the arrest beat" into
an app whose entire retention design avoids guilt. The leaky bucket in §1b is the
whole scheduler: weak beats surface, fixed beats fall off, nothing nags.

---

## 4. Standing review — difficulty curve, pacing, replayability, retention

Carryover items from `wargames/22` §§2–9 that `wargames/23` §3 re-confirmed are
**not** repeated here. Status changes and new findings only.

### 4a. Status changes since `wargames/23`

| Item | Was | Now |
|---|---|---|
| `wargames/22` §2 — correct answer in a deterministic screen position | HIGH, open | **CLOSED**, v2.21.10. Verified §0. The 5-symbol positional pattern is gone and the re-render stability bug that document predicted was avoided |
| `wargames/22` §5 — no per-beat memory | HIGH, open | **Field shipped**, consumer open. This document is the consumer decision (§3) |
| `wargames/22` §9 — `PRX_LEVELS[].rate` dead | LOW, open | **CLOSED**, v2.21.10, removed rather than wired. See §4b for the consequence |
| `wargames/22` §3 — daily curveball badge contradicts the deck | MEDIUM-HIGH, open | **STILL OPEN, re-verified.** The insertion gate `:4915` is `if(runs>=1&&prLevel<2)` and still does not consult `prx.cbDay`; `:5816` still renders "done ✓" whenever `prx.cbDay===today`. Every same-day run after the first still contains a curveball while the badge above it says it is done. Note §3's position **depends** on resolution (a) — one-and-done — not (b): (b) reseeds per run and spends exactly the property §3 argues is worth keeping |
| `wargames/22` §4 — drill coverage inverted | HIGH, open | **Still open, and worse than counted** — see §2b |

### 4b. Pacing is now a dimension the engine does not have at all (NEW — MEDIUM)

Removing `rate` was right; it was dead config and wiring it would have needed
every clip re-recorded per level (`:4504-4511` states this correctly). But it is
worth writing down what the engine looks like afterwards: **`PRX_LEVELS` entries
now carry `ids` and nothing else** (`:4512-4518`). There is no per-level timing,
spacing, or urgency dimension anywhere.

`PRX_TONE` (`:4578`) still carries `rate`/`pitch`, and it reaches only
`prxSpeakTTS`. The recorded-clip path — the default, and the good experience —
bypasses it. So for a player with audio on and clips present, escalation across
the ladder is carried **entirely** by word choice, the demeanor meter
(`:5817-5820`), the bubble mood class and the border-glow atmosphere. Zero by
time. A hostile Level 2 beat and a calm Level 0 beat occupy the same number of
seconds and arrive with the same rhythm.

That is survivable for the traffic ladder. It is a **scaffold hole** for the two
dark final scenarios, whose entire premise is temporal:

- `PRX_LEVELS[5]` is commented *"The long wait: widening intervals, silence"*
  (`:4513`)
- `PRX_LEVELS[6]` is commented *"It doesn't stop: contracting intervals"* (`:4514`)
- `PRX_WAIT` `:4754-…` and `PRX_NOSTOP` `:4823-…` carry `ci`/`id`/`tone`/`setter`/
  `officer` — **no interval, gap, or hold field on any beat.** The silence beat
  `w52`'s slot comment is *"the setter carries the waiting"*: the waiting is
  prose, not mechanism.

So both scenarios' defining mechanic exists only in comments and in
`TODO_ATTORNEY` stage directions. This is the right moment to notice it: adding a
timing field to a dark scaffold is free, and adding it *after* 48 clips are
recorded to a particular rhythm is not. But `rate`'s removal this week is also
the precedent against shipping config nothing reads. **Position: do not add the
field now.** Instead, put it in the scenario-5/6 authoring brief as an explicit
fork for whoever writes that content — *either* the interval is real engine
behaviour and gets built alongside the lines, *or* the interval framing comes out
of the level comments and those scenarios are re-described as what they actually
are, tone-and-content pieces. Shipping a third dead field would repeat exactly
the mistake v2.21.10 just cleaned up.

### 4c. The share payload does not carry the day (NEW — MEDIUM, retention)

Covered as evidence in §3 and restated here as a standalone finding because it is
the cheapest retention item in this document and it is squarely this round's slug.

v2.22.0/v2.22.1 built a real share sheet with per-channel targets. The payload it
sends (`:5623`) is level name, emoji grid, `N/M`, taunt, URL. The product has a
Wordle-shaped daily loop — a shared date-seeded trap (`:4913-4919`), a "⚡ Today's
curveball" badge (`:5816`, `:1971`), a day streak (`:5694-5700`) — and **none of
it appears in the share.** A recipient cannot tell that the sender faced the same
trap they would face today, which is the entire mechanism by which Wordle-shaped
shares recruit.

Adding a day marker is content-free — a date or a day-index string, not legal
content, not officer dialogue. It costs one line in `prxShareRun()` plus one
string per language, and it is the change that finally makes the date-seed's
stated rationale true rather than aspirational. Recommended ahead of anything in
§3, because it is smaller than all of it.

### 4d. Root and `/app` now disagree on when a miss is durable (NEW — LOW, parity)

Root persists `prx` only at run completion — `prxSave()` `:4997` is called from
the two migration blocks (`:4977`, `:4994`) and from the debrief-entry branch
(`:5706`). The `:5449-5452` comment states the consequence honestly: an abandoned
run's misses are lost, matching how an abandoned run's score was never counted.

`/app` does not match. `PracticeStep.tsx:56` is
`useEffect(() => { writeApp('prx', state.progress) }, [state.progress])`, and
`advance()` returns a **new** `progress` reference on every miss
(`practiceEngine.ts:319-321`). So `/app` persists each miss the instant it
happens, including from runs the player abandons.

Consequence: identical play produces different `prx.miss` histories on the two
builds — `/app` accumulates strictly more. Low severity today (it moves a `×N`
badge by one or two), but it becomes a real divergence the moment §3's review
deck selects on the field, and it is the kind of drift that gets discovered by a
user report rather than a check. Nothing in `tools/` asserts parity on this
field: grepping `miss` across `tools/*.mts`/`*.mjs` returns only unrelated hits
in `practice-engine-check.mts` (`:75`, `:311`) and `extract-app-content.mjs`.

Either cadence is defensible; they should not both be shipped. Root's is the more
conservative (an abandoned run counts for nothing, in both directions), and
`/app`'s effect-based write is the harder one to change without touching the
storage boundary — so if one moves, moving root's is probably cheaper, but this
is a call, not a bug report.

---

## 5. Priority table (this pass's findings only)

Carryover from `wargames/22` §12 and `wargames/23` §4 is unchanged except where
§4a records a status change.

| # | Finding | Where | Severity | Cost | Content needed |
|---|---|---|---|---|---|
| 1 | `prxBack()` un-scores the run but not `prx.miss` — counter inflates on exploration | `:5459-5467`; `practiceEngine.ts:369-380` | **HIGH** (precondition for any consumer) | one expression per side | none |
| 2 | `prx.miss` is monotonic — cannot express "currently weak" | `:5455`; `practiceEngine.ts:321` | **HIGH** (precondition) | one expression per side + 3 comment fixes | none |
| 3 | Curveball duplicates a `ci` already in the deck; `prx.miss[1]`/`[2]` accrue at ~2× | `:4919`, `:5455` | MEDIUM-HIGH | one guard | none |
| 4 | Share payload carries no day marker — the daily loop is invisible outside the app | `:5623` | MEDIUM (cheapest retention win here) | one line + 1 string ×2 langs | none (a date is not legal content) |
| 5 | Review deck as the sole consumer of `prx.miss` (§3) | new; `PRX_UNSCORED` `:4503`, debrief `:5799` | MEDIUM | a deck assembler + a debrief button | 2 UI strings ×2 langs → `TODO_ATTORNEY` |
| 6 | Root/`/app` disagree on miss-persistence cadence | `:5706` vs `PracticeStep.tsx:56` | LOW now, HIGH once #5 ships | a decision, then one side | none |
| 7 | Scenarios 5/6 have no timing field despite an interval-defined premise | `PRX_WAIT` `:4754`, `PRX_NOSTOP` `:4823`, comments `:4513-4514` | LOW (both dark) | note in the authoring brief, **build nothing now** | none |

---

## 6. Open items requiring a human before any of this ships

1. **The §3 position is a product decision, and it is stated as a recommendation,
   not taken on your behalf.** The concrete thing being recommended: keep the
   date-seeded shared curveball, build a separate unscored/unshared review deck,
   and accept that the personalized surface can never be a score or a share.
   Findings #1, #2 and #3 are bug fixes and are safe to ship without settling it
   — they improve the existing badge on their own merits and are preconditions
   for any version of the answer, including "do nothing else."
2. **Finding #4 (day marker in the share)** is content-free and independent of
   everything above. It is the smallest item in this document with the largest
   distribution effect. Recommended as the first thing to actually ship, in the
   same spirit as `wargames/22`'s "10d first" and `wargames/23`'s "reachability
   check first" ordering.
3. **The two UI strings for the review deck** (button label, deck title, EN + ES)
   are `TODO_ATTORNEY`. No officer dialogue, statute text, or coach copy is
   proposed anywhere in this document, and the review deck by construction adds
   none — it re-deals beats that are already in the reviewed bank.
4. **Scenario 5/6's interval mechanic (§4b)** is a fork for whoever authors that
   content with the attorney, not a decision to make in advance of it.
