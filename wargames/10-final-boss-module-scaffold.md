# Wargame 10 — "Final Scenario" module scaffold

Date: 2026-08-03. **Design document. No `index.html` changes made or authorized
by this document.** Nothing here ships until an attorney has filled every
`TODO_ATTORNEY` and a voice performance exists.

**Concept, in the operator's words:** the point is not winning. It's that if
this ever happens for real, you stay calm, you remember the words, and you get
home. The scenario is unwinnable by design — not to punish, but because the one
thing that survives a real encounter is having already said the words out loud
once.

Companion doc: `wargames/09-final-boss-direction-brief.md` (voice direction,
derived from craft analysis of real footage — **no dialogue, audio, or
identifying detail from that footage appears in this scaffold or anywhere in
the product**; see §7).

---

## 1. Engine fit — it is a fixed-deck level, index 5

`PRX_LEVELS` currently has 5 entries (0–4). This appends at **index 5**.

Non-negotiable, from the same constraint that governed the v2.7.2 merge:
`prx.done` / `prx.best` / `prx.runs` are keyed by **numeric level index** and
persisted to `localStorage`. Appending at the end is the only insertion that
does not re-point every existing user's saved progress. Do not insert it
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
if(prLevel===5) return PRX_FINAL.map(h=>Object.assign({},h));
```

**`ci` range: 50–55.** Must not collide with the scored bank (0–8), hard mode
(20–22), or checkpoint (30–33). **Audio ids: `f50`–`f55`.**

## 2. Everything that hardcodes the level count

Each is cheap; each is easy to miss. This list is the implementation checklist.

| Site | Current | Change |
|---|---|---|
| Hub grid (step 5) | `${[0,1,2,3,4].map(...)}` | `[0,1,2,3,4,5]` |
| Practice tab strip | `${[0,1,2,3,4].map(...)}` | `[0,1,2,3,4,5]` |
| Hub progress bar | counts `[0,1,2,3]` = "of 4" | **leave alone** — see §3 |
| Warn copy ternary | `prLevel===4?warn6:(prLevel===3?warn4:warn3)` | add `prLevel===5?_t.prx_warn7` branch **first**, or index 5 falls through to the arrest warning |
| Tab art | `.hardbg` (i=3), `.chkbg` (i=4) | add `.finalbg` CSS badge — not a photo |
| i18n, both blocks | `prx_lvl1`…`prx_lvl5` | add `prx_lvl6`, `prx_warn7` EN + ES |
| `PRX_LEVELS` | 5 entries | append `{ids:[50,51,52,53,54,55],rate:1.0}` — `rate` is dead data (never read) but keep the shape consistent |

**The warn-ternary is a trap, not a task.** `prLevel>=2` auto-arms the consent
gate, so index 5 gets gated for free — but with the *wrong copy*. A user opening
the final scenario would read a warning about an arrest during a traffic stop.
`prx_warn7` is mandatory and must ship in the same commit as the level.

## 3. Progress bar and mastery gate: deliberately excluded

The hub bar counts `[0,1,2,3]` and reads "{n} of 4 done". **Do not extend it to
5.** Same reasoning that kept Checkpoint out: the bar measures the numbered
ladder, and this scenario is not a rung on it — it's what comes after. Adding it
would also mean nobody can ever read "4 of 4 done" without playing a scenario
they may deliberately never want to play.

`mUnlocked = prx.done[0]&&prx.done[1]&&prx.done[2]` and the certificate's
`[prx_lvl1, prx_lvl2, prx_lvl3]` both stay untouched.

**Gating:** gate it behind the same `mUnlocked` condition Hard Mode uses. Unlike
Checkpoint (a different encounter someone may need *tonight*), this one is
explicitly the last thing — it should not be the first thing a scared first-time
visitor stumbles into.

## 4. Scoring: unscored, not zero-scored

`prCurTier='x'` is the existing mechanism for "this beat is not scored" (crisis
disclosures already use it). Every beat here uses it.

- **No green/amber grid** on the results screen.
- **No `prx.best[5]` write.** Guard the write at `prx.best[prLevel]=...` so
  level 5 is excluded — otherwise the hub card leaks a score, which is the exact
  bug already fixed once on Hard Mode (`37e4ffe`).
- **`prx.done[5]`** may be set — completion is real, a *score* is not.
- Every `PRX_OPT` entry uses **`bothGood:true`**. Not a trick: there is no wrong
  answer to author, because the outcome does not turn on the answer. This is the
  same shape Hard Mode already uses (`PRX_OPT[20]`), and the honest one.

## 5. Beat scaffold — 6 beats

Every `officer`, `setter`, `g`, `b`, `gc`, `bc`, `react`, `react2` below is a
placeholder. The **decision type** and **failure mode** per beat are the design
contribution and are safe to build the attorney brief and the voice brief around.

Tone ladder is deliberately **flatter and slower** than a normal escalation —
per the direction brief, the frightening version is the one that stays
procedural. Do not ramp to shouting by beat 2.

| # | ci | id | Tone | Decision type | What it trains |
|---|---|---|---|---|---|
| 1 | 50 | f50 | curt | comply + narrate | announcing movement before making it |
| 2 | 51 | f51 | curt | decline questions, stay warm | holding the line without heat |
| 3 | 52 | f52 | hostile | repeat the same line verbatim | not re-arguing under pressure |
| 4 | 53 | f53 | hostile | comply physically, decline verbally | separating the two — the core skill |
| 5 | 54 | f54 | hostile | say the one sentence that matters | the sentence they must still have at the worst moment |
| 6 | 55 | f55 | hostile | say nothing further | silence as the completed skill, not failure |

```js
const PRX_FINAL=[
 {ci:50,id:'f50',tone:'curt',
  setter:{TODO_ATTORNEY_COPY:"scene: night, roadside. NO children, NO family, NO sound effect. See §6."},
  officer:{TODO_ATTORNEY:"opening command — procedural, not yet hostile"}},
 // ... beats 51–55, same shape
];
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

## 7. Provenance — stated plainly for whoever reads this later

Real bodycam/broadcast footage was analyzed **for craft only** — escalation
curve, vocal mechanics, pacing — and that analysis lives in
`wargames/09-final-boss-direction-brief.md`.

**No dialogue was transcribed. No audio was extracted, clipped, or retained. No
identifiable person is described.** Every line in this module is original,
attorney-reviewed, and performed by a directed voice actor.

This is recorded here so the provenance is unambiguous if anyone asks later —
including the operator, six months from now.

## 8. Open before any of this ships

1. **Attorney review** of every `TODO_ATTORNEY` in §5. Blocks ship.
2. **`prx_warn7`** authored EN + ES. Blocks ship (see §2 trap).
3. **Voice performance** — original scenario, directed against
   `wargames/09`. Blocks ship.
4. **Mute-before-first-audio** gate built. Blocks ship (§6).
5. **Spanish authoring** of all 6 beats. A monolingual level is not shippable.
6. **Audio generation**: 6 beats × 2 languages × 2 voices = 24 clips.
7. **UPL opinion.** This adds a sixth scenario to the scored practice engine —
   the exact component the memo flags. Same gate as everything else.
