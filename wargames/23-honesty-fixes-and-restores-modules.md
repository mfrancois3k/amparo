# wargames/23 — the dormant hostile bank (game/level/instructional design lens)

Round for `/amparo-loop honesty-fixes-and-restores`, at `v2.21.7`. Follow-up to
`wargames/21-hub-rebuild-modules.md` and `wargames/22-small-fixes-modules.md`.

**Scope discipline, unchanged from 03/12/16–22:** structure and sequencing only.
**No officer dialogue, no statute text, no legal content is authored in this
document.** Where a line would be needed, `TODO_ATTORNEY` is the only
placeholder, per `wargames/03-door-module-design.md`. This document quotes no
officer line and proposes none — every restored line discussed below is
described by tone/id/reachability only, never by its text. All five
restorations (`v0_4`, `v0_5`, `v1_4`, `v1_5`, `v2_4`, `v4_4`) were authored and
committed by the operator himself, recovered verbatim from git history
(`3983f9d`, `bcd2645`) — not by any model, this session included.

Every claim below was read out of `index.html` at the current working tree
(`v2.21.7`, `031d70e`) this pass. Line numbers are from
`C:\Users\mfran\Ai-Foundations\Amparo\index.html` unless stated.

---

## 0. Re-verification of what changed since wargames/22 (`v2.21.3`)

wargames/22 reviewed a tree where `PRX_VAR[2]` still had only 4 entries and the
L2 divergence bad-leg was dead at both hops. Two restorations have landed
since: `v2_4` (`3983f9d`'s predecessor `bcd2645`) and then five more
(`3983f9d`). Re-verified directly against source, not against either prior
document's prose:

| Claim | Verdict | Evidence |
|---|---|---|
| `PRX_VAR[2]` has 5 entries; `v2_4` exists, `tone:'hostile'` | **Confirmed** | `index.html:4517-4528` |
| `v2_4` is reachable via `prxDiverge()` on an L2 bad pick | **Confirmed, structurally** | `PRX_DIVERGE={1:{...},2:{g:'curt',b:'hostile'}}` `:5322`; L2 tone pool `['curt','hostile']` `:4805`; L2 deck `[3,2,7]` `:4427` includes `ci:2`. A bad pick at beat 0 (`ci:3`) sets `prCurTier='y'`, `prxDiverge()` wants `tone==='hostile'` for `next.ci===2`, `PRX_VAR[2]` now has a hostile entry to draw from. HANDOFF also records this as **empirically verified live** (forced `curt`-start, ran the real `prxDiverge('b')` path, confirmed the transition) — this pass adds nothing new here, just re-confirms the static shape still holds. |
| `PRX_VAR[0]` has 6 entries; `v0_4`/`v0_5` `tone:'hostile'`, **not** reachable | **Confirmed** | `index.html:4495-4507` |
| `PRX_VAR[1]` has 6 entries; `v1_4`/`v1_5` `tone:'hostile'`, **not** reachable | **Confirmed** | `index.html:4508-4516` |
| `PRX_VAR[4]` has 5 entries; `v4_4` `tone:'hostile'`, **not** reachable | **Confirmed** | `index.html:4534-4541` |
| L0 tone pool is `['calm']` only, no `PRX_DIVERGE` key `0` | **Confirmed** | tone pool literal `:4805`: `[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel]`; `PRX_DIVERGE` object `:5322` has keys `1` and `2` only |
| L1 tone pool is `['curt']` only; L1's `PRX_DIVERGE` entry (`{g:'calm',b:'curt'}`) never targets hostile | **Confirmed** | same tone-pool literal, index 1; `PRX_DIVERGE[1]` `:5322` |
| `ci:4` (where `v4_4` lives) only appears in L1's `ids`; L2 (the only hostile-capable level) never deals it | **Confirmed** | `PRX_LEVELS[1].ids=[0,8,1,2,4,5]` vs `PRX_LEVELS[2].ids=[3,2,7]` `:4427` — `4` is absent from the L2 array |
| `v8_4`/`v8_5` remain unrestored (EN audio, no text anywhere) | **Confirmed, unchanged** | `PRX_VAR[8]` `:4554-4557` still has exactly 4 entries, all calm/curt; no `v8_4`/`v8_5` reference anywhere in `index.html` |

**Methodological note, worth carrying forward:** unlike `v2_4`'s reachability
(which depends on a *runtime draw* from `prxDiverge()`'s random pick among a
filtered pool, and was therefore right to verify empirically — HANDOFF's "built
500 real decks" exercise), the non-reachability of `v0_4/v0_5/v1_4/v1_5/v4_4`
is **provable by static inspection alone**. `prxBuildDeck()`'s `tones` array
(`:4805`) and `PRX_DIVERGE` (`:5322`) are both hardcoded literals — neither is
derived from what's actually sitting in `PRX_VAR`. So no simulation is needed:
if a level's tone-pool literal doesn't contain `'hostile'`, and no divergence
entry for that level targets `'hostile'`, nothing in `PRX_VAR` for that level
can ever be drawn, full stop, regardless of how many hostile entries exist.
The 500-deck sampling done for the HANDOFF entry was extra rigor, not a
requirement — future audits of this exact question can skip the simulation and
just read the two literals.

**Net: the restored batch is exactly as described in HANDOFF and in your
instructions to me.** One orphan closed (`v2_4`), five more sitting in the
bank, reachable by neither the tone-pool deal nor divergence, at three `ci`
positions across two levels. `v8_4`/`v8_5` remain a separate, unrelated open
item (no text anywhere, not a reachability question).

---

## 1. Should Level 0 or Level 1 ever be allowed to escalate to hostile?

**No — not because the content doesn't exist, but because the ladder already
encodes a deliberate, correctly-designed answer to this exact question, and
the restored bank doesn't change the argument for it.** Taking a position, not
describing the ambiguity:

**1a. The escalation gate is a consent mechanism, and it already lives at the
level boundary, not the beat boundary.** `:5559` — `if(prLevel>=2 &&
!prWarnOk[prLevel])`, with its own comment: *"opt-in gate: escalation is
chosen, never sprung — checked per level."* This is not incidental structure —
it is the product's stated safety contract for this exact category of content.
A player must explicitly click through a warning screen before Level 2 (or any
future level) can show them a hostile officer. Wiring `v0_4`/`v0_5` into Level
0's tone pool without extending that gate down to Level 0 would let a
first-time player — the least-warmed-up, most-anxious user this product will
ever see, per the L0 curveball-comment framing `wargames/22 §4` already
documented — hit hostile content with zero warning, zero opt-in, on their very
first beat. That's not a content gap, it's a bypass of a safety mechanism this
project built on purpose.

**1b. The tone ladder is the one axis wargames/21 and /22 both independently
verified as sound and both said not to restructure.** wargames/21 §4: *"Ladder
0→1→2→3 is coherent... do not restructure."* wargames/22 §11: *"The ladder is
sound and should not be restructured."* Both reviews read the tone escalation
(`['calm']→['curt']→['curt','hostile']`) as the mechanism that gives the four
scored/unscored rungs their distinct instructional contracts: Level 0 teaches
the baseline script under the calmest possible conditions; Level 1 adds
friction without threat; Level 2 is where threat is introduced, and only after
consent. If Level 0 or Level 1 could ever go hostile, that contract collapses
— a player could no longer trust "Level 0" to mean "the calm one," which is
exactly the promise the hub's own copy makes on the selection screen (per
wargames/22 §1, `prx_sel_sub`).

**1c. The restored content's own comments say what it's for, and it isn't
this.** Every one of the five restoration comments (`:4499-4505`,
`:4512-4514`, `:4538-4540`) says the same thing in different beats: *"In the
bank for attorney review and for whenever the bank/level design changes; not
yet selectable by any live path."* That phrasing was written by the operator
at restoration time, and it already names the correct trigger — a **design
change**, deliberately taken, not a byproduct of the content merely existing.
Nothing about restoring old git history constitutes that design change on its
own, and this document isn't the venue to make it either (it would require new
UI — a per-level warning gate at Level 0/1, or a redefinition of what those
levels mean — which is exactly the kind of thing wargames/21 §0 correctly
routed to `TODO_ATTORNEY` + a human decision, not shipped from a wargame).

**Verdict: "calm stays calm, curt stays curt" should remain a deliberate
invariant for Levels 0 and 1.** The five variants stay exactly where they are
— reviewable, present, permanently dark unless a future human decision
explicitly re-gates Level 0/1 the way Level 2 already is.

---

## 2. The dormant bank is still a real design smell — just not the one you'd fix by wiring it in

Taking the position above doesn't mean the current state is costless. Five
`tone:'hostile'` entries sitting in `PRX_VAR[0]`, `PRX_VAR[1]`, `PRX_VAR[4]`,
each with an `id` that resolves to real audio in all four voice folders
(per HANDOFF's restoration notes) and a live `PRX_VAR` reference, is a
**different and subtler kind of orphan than the one wargames/22 §10 found**,
and it's worth naming precisely so the two don't get conflated:

| | wargames/22 §10's orphans (`v8_4`/`v8_5`, and `v2_4` before its restore) | This bank (`v0_4/5`, `v1_4/5`, `v4_4`) |
|---|---|---|
| Referenced in `index.html`? | No | **Yes** — live `PRX_VAR` entries |
| Has reviewed text? | `v8_4/5`: no. `v2_4` pre-restore: yes, but unwired | Yes |
| Has 4-folder audio? | Yes | Yes |
| Discoverable by grep for the id? | Only in `audio/` and `VOICE_LINES.md` | **Yes, directly in `index.html`** |
| Reachable at runtime? | No (not referenced at all) | **No, despite being referenced** — dead by tone-pool/divergence config elsewhere in the file |

That last row is the trap. A future developer — human or model — who greps
`index.html` for `v0_4` or `hostile` will find it sitting in a live-looking
data structure, with a comment, with matching audio, referenced from the exact
file the extractor (`tools/extract-app-content.mjs`) treats as ground truth.
Nothing about *looking* at `PRX_VAR[0]` tells you it's dead; you have to also
read `prxBuildDeck()`'s tone-pool literal (`:4805`) and `PRX_DIVERGE` (`:5322`)
and cross-reference three separate locations to learn that. This is the same
shape of risk wargames/22 §10d flagged for the audio/text parity gap — *"no
check in `tools/` verifies audio against the bank"* — one level up: no check
verifies that everything in the bank is actually *reachable* by the bank.

**This is fixable without one word of new content**, same discipline as
wargames/22's recommendations:

- **A reachability check, extending the existing check family.**
  `practice-engine-check.mts` already asserts structural properties of
  `PRX_LEVELS`/`PRX_VAR` per wargames/22. Add one more: for every `PRX_VAR[ci]`
  entry, is its tone present in *some* level's `tones` pool that also deals
  that `ci` (via `PRX_LEVELS[n].ids`), **or** targeted by a `PRX_DIVERGE` entry
  whose owning level's deck contains that `ci`? Per §0's methodological note,
  this is pure static analysis over three already-existing literals — no
  runtime simulation needed, no legal content touched, ~20-30 lines in the same
  style as wargames/22 §10d's proposed audio-parity check. It would have
  flagged all five of this session's entries as PRESENT-BUT-UNREACHABLE the
  moment they were added, which is a more honest signal than "the check
  passed" currently gives — right now `npm run check` and the extractor both
  pass cleanly on a bank with five structurally dead entries, and nothing says
  so.
- **This check should warn, not fail.** Unlike wargames/22 §10d's audio-parity
  check (which catches accidental orphaning — a real bug), a bank entry being
  unreachable *by current level design* is sometimes exactly what you want
  mid-review, per §1's verdict. The check's job is visibility, not gatekeeping:
  surface "5 unreachable entries: v0_4, v0_5, v1_4, v1_5, v4_4" so it's a
  one-line fact instead of a three-file cross-reference, not block a build over
  a state the operator has already chosen deliberately.

**Minor, LOW severity — comment consolidation.** The three near-identical
non-reachability caveats (`:4499-4505`, `:4512-4514`, `:4538-4540`) are good
and should stay, but they're a duplicated fact stated three times with no
single source of truth. If the tone-pool literal at `:4805` or `PRX_DIVERGE`
at `:5322` ever changes, all three comments need updating in lockstep and
nothing enforces that. Not urgent — the proposed reachability check (above)
makes this self-correcting anyway, since a stale comment would just mean the
check's output disagrees with the comment, which is a cheap thing to notice.

---

## 3. Standing review — difficulty curve, pacing, replayability, retention

This session's changes were pure content restoration (`bcd2645`, `3983f9d`)
plus one `EDITION` bump each — no engine, deck-build, or divergence logic
changed. So every open finding from wargames/22 that wasn't about the bank
itself is **unchanged and re-confirmed by inspection this pass**, not
re-litigated in full:

- **§5 — no per-beat outcome data, spaced repetition unbuildable.** Still
  true. `prx={done:{},runs:{},streak:{last:'',n:0}}` `:4843`, migrations to
  `v2`/`v3` at `:4870`/`:4887`, no `prx.miss` or equivalent. HANDOFF open issue
  6 is unchanged. Worth one addition given §0-§2 above: the newly-restored
  bank is a small preview of *why* per-beat targeting eventually matters —
  once/if Level 0 or 1 is ever re-gated for escalation (a decision this
  document declines to make, per §1), a `prx.miss`-style weakest-beat signal
  is exactly the mechanism that would decide *when* a given player is ready
  for it, rather than a blanket tone-pool change. That's a reason to keep §5
  on the roadmap, not a reason to build it now.
- **§2 — correct-answer screen position is a fixed function of beat parity.**
  Unchanged; not re-read this pass beyond confirming no deck-build code moved.
- **§3 — daily curveball is a day-lock, not a surprise; badge/data disagree
  after the first same-day run.** Unchanged.
- **§4 — drill coverage inverted (`ci 1`/`ci 2` over-drilled, `ci 6`/`5`/`4`
  under-drilled).** Unchanged, and worth flagging explicitly: `ci:4` (the
  drinking question) is the *same beat* that now has a dormant hostile
  variant (`v4_4`). If a future "loose ends" deck (wargames/22 §4's proposed
  fix, `[6,5,4]`) is ever built to re-drill this exact beat, that deck's tone
  pool is a separate design surface from Levels 0/1's — worth remembering when
  that work happens, since it's a third place the same reachability question
  could resurface.
- **§6 — unfailable scoreboard shown as an achievement.** Unchanged.
- **§7 — freeze/idle safety offer gated to Level 2+, the inverse of where
  freezing is likeliest.** Unchanged. Notable adjacency to §1's argument: this
  finding is the mirror image of this document's position — wargames/22 argued
  the *safety net* should reach down to Level 0 (freezing help), while this
  document argues *hostile content* should not. Those aren't in tension: one
  is a support affordance with no downside, the other is stress content gated
  behind explicit consent. Both conclusions point the same direction — Level 0
  should stay the gentlest level in every dimension except the ones that exist
  purely to catch someone who's struggling.
- **§8 — no `.ics` reminder reachable from the practice results screen; the
  only post-close channel is absent from the one screen about "tomorrow."**
  Unchanged, still HANDOFF's cheapest retention win.
- **§9 — `PRX_LEVELS[].rate` is dead data.** Unchanged; not re-verified line by
  line this pass but no code near it moved.

**No new difficulty-curve finding from this pass beyond §1/§2 above.** The
restored content doesn't change the curve's shape (nothing reachable moved),
only the bank's completeness for a future attorney review pass.

---

## 4. Priority table (this pass's findings only — see wargames/22 §12 for the still-open carryover list)

| # | Finding | Where | Severity | Cost | Content needed |
|---|---|---|---|---|---|
| 2 | No check surfaces "referenced but structurally unreachable" `PRX_VAR` entries — a subtler blind spot than wargames/22 §10's unreferenced-audio orphans | `tools/practice-engine-check.mts` (extend) | MEDIUM | ~20-30 lines, static analysis only, warn not fail | none |
| 1 | Whether L0/L1 should ever escalate | `:4805`, `:5322`, `:5559` | decision, not a bug | — | This document takes the position: no, keep the invariant. Restated, not asked. |
| 2 (minor) | Three near-duplicate non-reachability comments in `PRX_VAR`, no single source of truth | `:4499-4505`, `:4512-4514`, `:4538-4540` | LOW | comment only | none |

Everything else in this document reconfirms wargames/22's still-open items
unchanged; see that document's §12 for the full carryover priority table
(spaced repetition, positional-cue fix, day-locked curveball, drill-coverage
inversion, idle-safety gate, unfailable scoreboard, dead `rate` field, `.ics`
reminder unreachable from results).

---

## 5. Open items requiring a human before any of this ships

1. **The reachability check (§2)** is safe to build without further sign-off —
   it changes no runtime behavior, adds no content, and its whole purpose is
   visibility. Recommended as the cheapest next move to actually ship, same
   spirit as wargames/22's "10d first" ordering.
2. **Whether Level 0/1 should ever be re-gated for escalation** is a real
   product decision this document declines to make on your behalf, consistent
   with the standing instruction that design changes are human calls. If you
   want this reopened, the shape of the question is: does `prWarnOk`-style
   consent extend below Level 2, or does a *new*, separate module (not a
   change to Levels 0/1) become the home for graduated-hostility content that
   doesn't fit the current four-rung ladder's contract? Both are legitimate;
   neither should be inferred from "the audio already exists."
3. **`v8_4`/`v8_5`** are unchanged and still blocked on the transcription step
   HANDOFF and wargames/22 §13.2 already describe. Not re-actioned here.

---

*Nothing in this document authors officer dialogue, statute text, or legal
content. Every restored line discussed above is described by tone, id, and
reachability only — no line is quoted.*
