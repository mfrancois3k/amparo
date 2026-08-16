# wargames/26 — Welcome trust/shortcut round: nothing new for the practice modules

Round for the standing `/amparo-loop` verification, agent B (game design / level
design / instructional design), run standalone against `v2.22.5` (`HEAD` at
`ed71378`).

**Scope discipline, unchanged from 03/12/16–25:** structure and sequencing
only. No officer dialogue, no statute text, no legal content authored here.
`TODO_ATTORNEY` (and, for the door module, `TODO_DV_CLINICIAN`) remain the
only placeholders, per `wargames/03`. This round introduces neither — see
below.

---

## 0. What this round actually shipped, and why that matters for scope

`ed71378` ("fix: surface trust reassurance + lawyer/hotline shortcut on
Welcome") is the only source commit since `wargames/25`'s base
(`v2.22.3` + docs). Confirmed by reading the commit directly rather than
inferring from the message:

```
app-src/src/App.tsx          | 8 ++
app-src/src/screens/Welcome.tsx | 9 ++
app-src/src/content/t.en.json | 1 +
app-src/src/content/t.es.json | 1 +
app-src/src/styles/shell.css  | 6 ++
index.html                    | 26 (+23/-3)
```

Every hunk in `index.html` touches: the pilot-banner visibility rule at
Welcome (`render()`, now shows on step 0 too), a new `w_lifelines_shortcut`
link on the Welcome screen, and a new `phLifelineClick()` tracking call on
the Lifelines (step 3) contact links. `app-src`'s changes mirror the same
three things in the React build. None of this touches `PRX_LEVELS`,
`PRX_OPT`, `PRX_VAR`, `PRX_HARD`, `PRX_CHK`, `PRX_WAIT`, `PRX_NOSTOP`,
`PRX_DOOR`, `prxBuildDeck`, or any file under `app-src/src/engine/`. Grepped
to confirm rather than trusted: zero matches for any `PRX_*` identifier or
`practiceEngine` in the commit's diff.

**Conclusion stated plainly, as the task brief anticipated: this round has
no new practice-module content to review.** The change is entirely a
funnel/trust-copy fix on the Welcome screen (step 0) and an analytics gap
fix on the Lifelines screen (step 3) — both upstream of the practice engine,
neither a beat, a level, nor a scoring path.

---

## 1. Verification pass anyway — reading current shapes fresh, not trusting old notes

The brief asked for a read of the current `PRX_LEVELS`/`PRX_OPT`/`PRX_VAR`
shapes in `index.html` and the ported version in
`app-src/src/engine/practiceEngine.ts`, not just a diff check. Did that read
(current `index.html:4520-4990`ish and the full 414-line
`practiceEngine.ts`) with the module-design lens the brief asked for
(beat structure, difficulty curve, pacing, replayability). Nothing below is
a new defect — it's confirmation that the ladder is in the state
`wargames/09/10/11/25` already described, plus explicit note of the one
thing that changed shape since `wargames/03` first proposed the door module
(useful because `wargames/03`'s beat-by-beat scaffold is now stale against
what actually shipped).

### 1a. The door module shipped structurally, dark — `wargames/03`'s scaffold is superseded, not wrong

`wargames/03` (2026-08-03) proposed the door module at `ci` 40-46 with 6-7
beats. What actually exists now, verified at `index.html:4842-4861`, is
`PRX_DOOR` at `ci` 70-75 (6 beats, no beat 7 — the "foot in the door" beat
`wargames/03` §3 recommended excluding from v1 was in fact excluded), living
at `prLevel===7`, alongside two more fixed-deck levels that weren't in
`wargames/03`'s scope at all: `PRX_WAIT` (level 5, "the long wait") and
`PRX_NOSTOP` (level 6, "it doesn't stop"). All three are `TODO_ATTORNEY`
placeholders end to end, gated dark by two separate flags with load-bearing
comments:

- `FINAL_SCENARIOS_ENABLED=false` (`:4528`) — gates `PRX_WAIT`/`PRX_NOSTOP`,
  citing `wargames/10` §8 as the ship gate.
- `DOOR_MODULE_ENABLED=false` (`:4537`) — gates the door specifically,
  citing `wargames/03` §6.5 and DV research: the comment states the door's
  planned "calm, repeated refusal" correct answer is what DV-response
  training reads as the *assailant's* presentation, not the victim's, and
  that 15-50% of police calls are DV-related — so this isn't an edge case,
  and the flag needs a DV clinician's sign-off, not just an attorney's.

This is exactly the trajectory `wargames/03` §6.5 called for ("do this
**before** shipping the door module, not after") and it held. Nothing to
fix; noting it here only because a reader of `wargames/03` alone would see a
stale beat range (40-46) and a scope that has since grown by two levels.

### 1b. Root/`/app` parity on the fixed-deck levels is intact

`practiceEngine.ts:181-185` (`buildDeck`) returns `PRX_HARD`/`PRX_CHK`/
`PRX_WAIT`/`PRX_NOSTOP`/`PRX_DOOR` for levels 3-7 in the same order root's
`prxBuildDeck` does (`index.html:4930-4937`), and `isLocked`
(`practiceEngine.ts:165-169`) matches root's gating: 3/5/7 need the 0/1/2
mastery set, 6 additionally needs level 5 done, 4 (checkpoint) is never
gated. Read both functions side by side rather than assuming from the
comment headers — they agree.

### 1c. Standing findings from `wargames/25` are unchanged and still open

Checked whether either open item from `wargames/25` §4 shipped in this
round's commit — they didn't (confirmed above, no `PRX_*`/engine files
touched):

1. `prxBack()`/`back()` still reverses `prx.miss` on Back
   (`index.html:5485-5506`; `practiceEngine.ts:369-398`) — `wargames/25`
   §2.2's position (this launders the counter and should be reverted) still
   stands, unaddressed.
2. The curveball splice at `index.html:4938`/`practiceEngine.ts:199-209`
   still has no guard against double-counting `ci 1`/`ci 2` in `prx.miss`.

Not re-litigating either — restating only so this document doesn't read as
silent on them. No new severity, no new evidence; `wargames/25` §4's table
is still the current standing list.

---

## 2. Priority table (this pass's findings only)

None. This round's shipped change does not touch the practice modules, and
the fresh read found no previously-unreported defect in beat structure,
difficulty curve, pacing, or replayability beyond what `wargames/09/10/11/25`
already recorded as open.

---

## Open items requiring a human before any of this ships

Unchanged from `wargames/25` §5 and `wargames/10` §8 / `wargames/03` §6.5 —
none newly introduced this round:

1. `wargames/25`'s `prx.miss` Back-reversal reversal (§2.2 there) is still
   an unshipped recommendation, not yet acted on.
2. `FINAL_SCENARIOS_ENABLED` and `DOOR_MODULE_ENABLED` both remain `false`,
   correctly — the door module additionally needs DV-clinician sign-off,
   not just attorney review, before that flag can move.
3. No `TODO_ATTORNEY` or `TODO_DV_CLINICIAN` items are introduced by this
   document.
