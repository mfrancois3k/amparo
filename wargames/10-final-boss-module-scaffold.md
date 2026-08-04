# Wargame 10 — the two final scenarios: scaffold

Date: 2026-08-03, revised same day to two scenarios. **Design document. No
`index.html` changes made or authorized by this document.** Nothing here ships
until an attorney has filled every `TODO_ATTORNEY` and voice performances exist.

**Concept, in the operator's words:** the point is not winning. It's that if
this ever happens for real, you stay calm, you remember the words, and you get
home. These scenarios are unwinnable by design — not to punish, but because the
one thing that survives a real encounter is having already said the words out
loud once.

Companion doc: `wargames/09-final-boss-direction-brief.md` (voice direction,
derived from craft analysis of real footage — **no dialogue, audio, or
identifying detail from that footage appears in this scaffold or anywhere in
the product**; see §7).

---

## 0. Why two, and why in this order

The two reference videos did not turn out to be two flavours of the same thing.
They measured as **opposite cadence mechanics**, and the difference is
pedagogically load-bearing:

| | **Scenario 5 — "The long wait"** | **Scenario 6 — "It doesn't stop"** |
|---|---|---|
| Reference | Ref A (cadence/structure/silence) | Ref B (volume/register-flip/dynamics) |
| Repeat intervals | **Widen**: ~1.6s → 3.3s → 6.2s | **Contract**: ~1.5 → 2.0 → **0.9 → 0.7s** |
| Reads as | a man deciding whether he has to escalate | the officer's own tension leaking out |
| Subject in reference | non-compliant — **see §0.1, must be reframed** | compliant |
| Emotional payload | dread; a decision being made off-screen, about you | obeying is not making it stop |
| Lesson | you cannot control the outcome, only your record | **compliance does not reliably de-escalate** |

**Order: 5 before 6.** Dread first, then the harder truth. This is an escalation
of *lesson*, not of volume — which matches the measurement that volume ranks
**last** among pressure sources in both references.

Scenario 6 is the real climax. The direction brief calls its contracting-cadence
beat *"the highest-value beat in the module"* — six repeats of one directive in
under seven seconds **at a person who is already obeying.** It is real, it is
counter-intuitive, and nobody would write it from imagination. That is the thing
the whole module exists to deliver, so it goes last.

### 0.1 Hard constraint on Scenario 5 — the non-compliance reframe

Ref A's subject is non-compliant. **Scenario 5 must NOT transfer that.** The
app's entire thesis is *comply physically, decline verbally*, and a scenario
built on a resisting subject risks teaching — or merely appearing to endorse —
the opposite. That is the one lesson this product must never teach.

The reframe, and it is not optional: **the player complies physically throughout
while declining verbally.** The widening cadence still works, because what
produces it is the officer weighing a decision, not the subject's defiance — the
brief establishes that repetition rate tracks *the speaker's own tension and the
physical clock*, not the subject's behaviour. So the mechanic transfers cleanly;
the subject's conduct does not.

Anyone writing this beat should be able to state, in one sentence, what the
player did right at every step. If they cannot, the beat is wrong.

---

## 1. Engine fit — two fixed-deck levels, indices 5 and 6

`PRX_LEVELS` currently has 5 entries (0–4). These append at **index 5 and 6**.

Non-negotiable, from the same constraint that governed the v2.7.2 merge:
`prx.done` / `prx.best` / `prx.runs` are keyed by **numeric level index** and
persisted to `localStorage`. Appending at the end is the only insertion that
does not re-point every existing user's saved progress. Do not insert either
mid-ladder to make it "feel" like the climax — position in the array is data,
not presentation.

**Fixed deck, not randomized.** `prxBuildDeck()` has two paths; the randomized
one reads `const tones=[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]`
— a 4-element literal that returns `undefined` at index 5 and throws on the
next line. Follow the `PRX_HARD` / `PRX_CHK` precedent: return a hand-authored
array verbatim. This is correct on the merits anyway — a climactic scenario
should be authored, not shuffled.

```js
// prxBuildDeck(), add BEFORE the randomized path:
if(prLevel===5) return PRX_WAIT.map(h=>Object.assign({},h));   // "The long wait"
if(prLevel===6) return PRX_NOSTOP.map(h=>Object.assign({},h)); // "It doesn't stop"
```

**`ci` ranges: 50–55 (scenario 5) and 60–65 (scenario 6).** Must not collide
with the scored bank (0–8), hard mode (20–22), or checkpoint (30–33).
**Audio ids: `w50`–`w55` and `n60`–`n65`.**

## 2. Everything that hardcodes the level count

Each is cheap; each is easy to miss. This list is the implementation checklist.

| Site | Current | Change |
|---|---|---|
| Hub grid (step 5) | `${[0,1,2,3,4].map(...)}` | `[0,1,2,3,4,5,6]` |
| Practice tab strip | `${[0,1,2,3,4].map(...)}` | `[0,1,2,3,4,5,6]` |
| Hub progress bar | counts `[0,1,2,3]` = "of 4" | **leave alone** — see §3 |
| Warn copy ternary | `prLevel===4?warn6:(prLevel===3?warn4:warn3)` | add `prLevel===5?_t.prx_warn7:` **and** `prLevel===6?_t.prx_warn8:` branches **first** — see trap below |
| Tab art | `${(i===3\|\|i===4)?'':url('img/scene-${i+1}.jpg')}` | extend the SAME ternary to `(i===3\|\|i===4\|\|i===5\|\|i===6)`, **not just add `.waitbg`/`.nostopbg` badge classes**. `img/scene-6.jpg` and `img/scene-7.jpg` do not exist on disk — confirmed by `ls`. Adding only the badge class leaves the old exclusion unchanged, so the inline `style="background-image:url(...)"` still gets written into the DOM and the browser still issues the failing request even though a badge visually sits on top of it. |
| i18n, both blocks | `prx_lvl1`…`prx_lvl5` | add `prx_lvl6`, `prx_lvl7`, `prx_warn7`, `prx_warn8` EN + ES |
| `PRX_LEVELS` | 5 entries | append `{ids:[50..55],rate:1.0}` and `{ids:[60..65],rate:1.0}` — `rate` is dead data (never read) but keep the shape consistent |
| `isLocked` / hub `locked` | `i===3` | **NOT** `(i===3\|\|i===5\|\|i===6)` — that expression only checks `mUnlocked` and does not encode the sequential rule below. Use `(i===3) \|\| (i===5&&!mUnlocked) \|\| (i===6&&!(mUnlocked&&prx.done[5]))`. See §3 — this row was wrong in an earlier draft and would have let 6 unlock the instant 5 did, silently defeating the entire point of §0. |

**The warn-ternary is a trap, and it is now a double trap.** `prLevel>=2`
auto-arms the consent gate, so indices 5 AND 6 get gated for free — but both
fall through to `prx_warn3`, the *arrest* warning. A user opening either final
scenario would read a warning about a traffic-stop arrest. **Two new warn
strings, both languages, same commit as the levels.** They must also differ from
each other: scenario 5 warns about dread and duration, scenario 6 warns that
doing everything right will not change the outcome.

## 3. Progress bar and mastery gate: deliberately excluded

The hub bar counts `[0,1,2,3]` and reads "{n} of 4 done". **Do not extend it to
6.** Same reasoning that kept Checkpoint out: the bar measures the numbered
ladder, and these scenarios are not rungs on it — they're what comes after.
Extending it would also mean nobody can ever read "4 of 4 done" without playing
two scenarios they may deliberately never want to play.

`mUnlocked = prx.done[0]&&prx.done[1]&&prx.done[2]` and the certificate's
`[prx_lvl1, prx_lvl2, prx_lvl3]` both stay untouched.

**Gating, and it is sequential.** Both sit behind `mUnlocked` like Hard Mode.
Additionally **scenario 6 requires `prx.done[5]`** — the order in §0 is the
whole design, and 6's lesson only lands once 5 has been felt. Unlike Checkpoint
(a different encounter someone may need *tonight*), these are explicitly the
last things — neither should be the first thing a scared first-time
visitor stumbles into.

## 4. Scoring: unscored, not zero-scored

`prCurTier='x'` is the existing mechanism for "this beat is not scored" (crisis
disclosures already use it). Every beat here uses it — but **that alone does
not suppress the results screen**, and an earlier draft of this document
implied it did. Corrected below.

**The real mechanism, verified live.** `practiceRender()` contains a
completely separate branch, `if(prLevel===3){ ...debrief markup...; return; }`
(`:4478`), that exits BEFORE the scored-path code (`prx-score`, `prx-result`
grid, `prx-bd` breakdown) is ever assembled. This is the only reason Hard
Mode's results screen has no score today — confirmed by forcing `prLevel=3`
and a completed run in-browser and checking `.prx-score`/`.prx-result`/
`.prx-bd` are all absent from the DOM. `prCurTier` never enters into it; it
governs per-beat feedback DURING a run, not the end-of-run assembly, which
branches on `prLevel` directly.

**What this means for build:** the branch must extend to
`prLevel===3||prLevel===5||prLevel===6`, each with ITS OWN debrief markup —
not a shared one. Hard Mode's copy (`prx_hard_t`/`prx_hard_b`/`prx_hard_blame`)
is specific to Hard Mode; scenarios 5 and 6 need their own strings, matching
the corrected debrief copy in `amparo-gemini-mockup-prompts.md` prompts 15/16
("The silence was the point" / "I hope you never need this"). Built as three
independent `if(prLevel===N)` blocks or one block with an internal switch —
either is fine, but **do not let scenario 5/6 fall through into the scored
path below the Hard Mode branch**, which is exactly what happens if the branch
condition is only ever `prLevel===3` and nobody remembers to extend it.

- **No green/amber grid** on either results screen — achieved by the early
  return above, not by `prCurTier` alone.
- **No `prx.best[5]` or `prx.best[6]` write — at the WRITE site, not just the
  two display sites.** `37e4ffe` guarded `i===3` at the hub card (`:2949`) and
  the tab strip (`:4435`) — display only. The write itself,
  `prx.best[prLevel]=sc+'/'+prRun.length` (`:4455`), is unconditional today and
  was never touched. A guard added only at display would let the value sit in
  `localStorage` correctly hidden until the next code path that reads it
  forgets to check — the same failure shape that shipped the original bug.
  **One `const PRX_UNSCORED = new Set([3,5,6])` used at all three sites** —
  write and both displays — not three separate `i===3||...` literals.
- **No unscoped analytics on either scenario.** `ph('sr_practice_level_done',
  {level,score,total,state,lang})` fires unconditionally at the
  `prx.done[prLevel]=true` write (`:4445`/`:4458`), and `sr_practice_choice`/
  `sr_practice_typed`/`sr_practice_keywords_hit` fire per-beat during any
  level, all carrying `state`. `ph()` is a live `posthog.capture()` call, not
  a stub (`:1291`). Nothing today excludes any level from any of these. For
  content of this weight, "someone in `state` just finished the scenario where
  compliance didn't help" is exactly the kind of signal this project has
  removed before (`sr_crisis_phrase_shown`, unmasked replay on steps 0–1) —
  and it is currently unaddressed for levels 5 and 6. Either the five listed
  events go in `PRX_UNSCORED`'s exclusion too, or they fire with `state`
  stripped. Decide explicitly; do not let it happen by default.
- **`prx.done[5]` / `prx.done[6]`** may be set — completion is real, a *score*
  is not. `done[5]` additionally gates scenario 6 (§3).
- Every `PRX_OPT` entry uses **`bothGood:true`**. Not a trick: there is no wrong
  answer to author, because the outcome does not turn on the answer. This is the
  same shape Hard Mode already uses (`PRX_OPT[20]`), and the honest one.

## 5. Beat scaffolds — 6 beats each

Every `officer`, `setter`, `g`, `b`, `gc`, `bc`, `react`, `react2` below is a
placeholder. The **decision type** and **what it trains** per beat are the design
contribution and are safe to build the attorney brief and the voice brief around.

Both tone ladders are deliberately **flatter and slower** than a normal
escalation — per the direction brief, the frightening version is the one that
stays procedural, and volume ranks *last* among pressure sources. Do not ramp to
shouting by beat 2 in either.

### 5a. Scenario 5 — "The long wait" (`ci` 50–55, ids `w50`–`w55`)

Cadence: **widening** intervals (~1.6s → 3.3s → 6.2s). Pressure comes from
silence and the sense of an off-screen decision. Ref A is the reference for
structure and silence — **not** for volume (broadcast-limited to 14.6 dB).

Per §0.1 the player complies physically at every beat. The widening comes from
the officer's deliberation, never from player defiance.

| # | ci | id | Tone | Decision type | What it trains |
|---|---|---|---|---|---|
| 1 | 50 | w50 | curt | comply + narrate the movement | announcing before reaching |
| 2 | 51 | w51 | curt | decline questions, stay warm | holding the line without heat |
| 3 | 52 | w52 | curt | wait through a long silence | not filling dead air — the signature beat |
| 4 | 53 | w53 | hostile | repeat the same line verbatim | not re-arguing under pressure |
| 5 | 54 | w54 | hostile | comply physically, decline verbally | separating the two — the core skill |
| 6 | 55 | w55 | hostile | say nothing further | silence as completed skill, not failure |

### 5b. Scenario 6 — "It doesn't stop" (`ci` 60–65, ids `n60`–`n65`)

Cadence: **contracting** intervals (~1.5 → 2.0 → **0.9 → 0.7s**), aimed at a
player who is fully complying. Contains the register flip measured at **+6.6 dB
and +64 Hz across a 4-second boundary, cold, with no wind-up** — and the
ultimatum stage that is *quietest by mean, near-highest by peak*. Ref B is the
reference for dynamics.

**The beat immediately before the flip (`n62`) must stay `curt`, not
`hostile`.** Tone drives the bubble colour and the TTS pitch/rate directly — if
the beat right before the flip is already tagged hostile, the tone machinery
has pre-announced the escalation and the flip lands warm instead of cold. The
"no wind-up" property is the single most load-bearing craft finding in the
direction brief; it is cheap to lose by copy-pasting the wrong tone tag.

| # | ci | id | Tone | Decision type | What it trains |
|---|---|---|---|---|---|
| 1 | 60 | n60 | curt | comply immediately and fully | doing everything right from beat 1 |
| 2 | 61 | n61 | curt | keep complying as pace increases | not matching his tempo |
| 3 | 62 | n62 | **curt** | keep complying through repetition | **the signature beat — obeying isn't stopping it** |
| 4 | 63 | n63 | hostile | absorb the register flip, stay level | not escalating back when he does |
| 5 | 64 | n64 | hostile | say the one sentence that matters | the sentence they must still have at the worst moment |
| 6 | 65 | n65 | hostile | say nothing further | the record is already made |

```js
const PRX_WAIT=[
 {ci:50,id:'w50',tone:'curt',
  setter:{TODO_ATTORNEY_COPY:"scene: night, roadside. NO children, NO family, NO sound effect. See §6."},
  officer:{TODO_ATTORNEY:"opening command — procedural, not yet hostile"}},
 // ... beats 51–55, same shape
];
const PRX_NOSTOP=[ /* ci 60–65, ids n60–n65, same shape */ ];

PRX_OPT[50]={bothGood:true,
 g:{TODO_ATTORNEY:"the reviewed correct line"},
 b:{TODO_ATTORNEY:"a second correct approach — NOT a mistake"},
 gc:{TODO_ATTORNEY:"why this works"},
 bc:{TODO_ATTORNEY:"why this ALSO works — Hard Mode register, no blame"},
 react:{TODO_ATTORNEY:"officer escalates regardless"},
 react2:{TODO_ATTORNEY:"officer escalates regardless, variant"}};
PRACTICE.en[50]={o:"…",y:"TODO_ATTORNEY — MUST contain a “curly-quoted” sentence or the typed path cannot score it"};
```

**The `y`-field trap, carried from `wargames/03`:** the free-text matcher pulls
scoring keywords by regexing `card.y` for `“…”` spans. No quoted phrase → no
keywords → the beat is unwinnable via typed input. Every beat's `y` needs at
least one curly-quoted sentence even though the beat is unscored, because the
matcher runs before the tier is applied.

## 6. Trauma-informed constraints — non-negotiable

Carried from `wargames/03` §6 and the 10-persona review, plus what's specific
here:

- **No knock, siren, or impact sound.** The engine has deliberately never made a
  threatening noise (`:3810` — "impatience through repetition, never noise or
  sirens"). A hostile *voice* is the payload; nothing else.
- **No children, no family, no passengers** in any setter. The user supplies
  their own household; the app must not populate it.
- **Mute must be reachable before the first line plays.** The pre-exposure gap
  is a known open finding — this module must not ship until the gate (prompt 6
  in the mockup set) puts an audio control *in front of* the scenario, not
  inside it.
- **Idle/freeze handling** already routes correctly at `prLevel>=2` (offer to
  replay or leave, equal weight, nothing scored, nothing logged) — but
  `prx_idle_h` copy should get a scenario-specific variant. Freezing here is a
  legitimate response, not a lapse.
- **`bc` coach lines in Hard Mode's register**, never level-1's corrective
  voice: *"His reaction is not about what you did."* Name the cost, never assign
  the fault.
- **Preview mode** (mockup prompt 7): a non-scored, non-logged pass-through so
  a parent can hear it before a teenager does. Two personas asked for this
  independently.
- **Two heavy scenarios back to back is itself a load.** Scenario 6 unlocking
  the moment 5 completes creates a "one more" pull at exactly the wrong time.
  The debrief after 5 should not offer 6 as its primary action — return to the
  hub, and let re-entry be a separate, deliberate choice on a later visit.

## 7. Provenance — stated plainly for whoever reads this later

Real bodycam/broadcast footage was analyzed **for craft only** — escalation
cadence, loudness and F0 curves, silence structure — and that analysis lives in
`wargames/09-final-boss-direction-brief.md`.

**No dialogue was transcribed into either scenario. No audio was retained. No
identifiable person is described.** Every line in both scenarios is original,
attorney-reviewed, and performed by a directed voice actor.

Full disclosure of what actually happened, because a sanitised version would be
worth less: the `/watch` pipeline used for the analysis *did* download both
source videos and write auto-caption `.vtt` files, extracted MP3s and frame
stills to the scratchpad. The analysis agent incorrectly reported that it hadn't.
All of it was verified and deleted; only the measurement scripts and two
dialogue-free reports remain. That correction is recorded in §4 of
`wargames/09` as well. Nothing from those files reached this scaffold or the
product.

## 8. Open before any of this ships

1. **Attorney review** of every `TODO_ATTORNEY` in §5 — **now two scenarios'
   worth**. Blocks ship.
2. **`prx_warn7` AND `prx_warn8`** authored EN + ES, each specific to its
   scenario. Blocks ship (see §2 double trap).
3. **Two voice performances** — original scenarios, directed against
   `wargames/09`: scenario 5 on the widening/silence shape, scenario 6 on the
   contracting/register-flip shape. Blocks ship.
4. **Mute-before-first-audio** gate built. Blocks ship (§6).
5. **Spanish authoring** of all 12 beats. A monolingual level is not shippable.
6. **Audio generation**: 12 beats × 2 languages × 2 voices = **48 clips**.
7. **`prx.best` guard becomes a set** (`i===3||i===5||i===6`), not another
   one-off — see §4.
8. **UPL opinion.** This adds a sixth *and seventh* scenario to the scored
   practice engine — the exact component the memo flags. Same gate as
   everything else.

**Scope note:** splitting one scenario into two roughly doubles items 1, 3, 5
and 6 — the attorney review, the performances, the Spanish, and the clips.
That's the real cost of the decision, stated up front rather than discovered
partway through.
