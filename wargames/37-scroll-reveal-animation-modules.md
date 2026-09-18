# Wargame 37 — Practice module review (game / level / instructional design)

Date: 2026-09-18. Structure-and-pacing review only, per amparo-loop step 8. **No
officer dialogue, legal claims, or statutory content authored below.** Every
line is verified against the live source; nothing is inferred from naming.

**Scope note:** this review is unrelated to the scroll-reveal animation work
that immediately preceded it (rights hub + 52 state pages, design-system/amparo).
That was static-page motion design. This is the practice engine — a
completely different subsystem, reviewed here as amparo-loop's standing
module/level-design step. The filename continues the wargame ledger sequence;
it does not describe this document's content.

---

## 0. What actually exists today (step 1 — corrects a stale premise)

The task brief asked me to locate `PRX_LEVELS` / `PRX_OPT` / `PRX_VAR`. **None
of these exist in the current codebase.** They were real — `wargames/03-door-module-design.md`
documents them in detail — but they lived in a root `index.html` at commit
`a60717f` that no longer exists anywhere in this tree (confirmed: no
`PRX_LEVELS`, `PRX_OPT`, `PRX_VAR`, `PRX_CHK`, `PRX_HARD`, or `PRX_DO` anywhere
outside `.git` pack objects and historical `/notebook` and wargame markdown).
The React `app-src/src` tree (screens: `Welcome`, `YouStep`, `StateStep`,
`LifelinesStep`, `PrintStep`, `SavePack`, `ThankYou`) is the **pack-builder**
flow, not the practice engine — it has no practice/arena code at all on the
main tree. (`PRX_LEVELS`-shaped code *does* exist under
`.claude/worktrees/agent-ace0fcba7cdc8cc8b/app-src/src/engine/practiceEngine.ts`,
but that worktree is on an unrelated branch — commit log shows outreach-pack
and process-exit-bug work, nothing to do with practice modules — and is not
part of the shipped app. Not reviewed further; flag it to whoever owns that
worktree so it isn't mistaken for live code.)

**The real, live practice module is `arena/index.html`** (2443 lines, single
file, the same architecture pattern as the old root file but fully rewritten).
Its actual data shapes:

- **`SCEN`** — array of scenario objects: `{id, title, scene, turns:[{o, c:[{t,p,g,f,nx?}], branch?}]}`. Each `c` (choice) carries point delta `p`, a good/bad flag `g`, feedback text `f`, and an optional `nx` (jump target — the only branching mechanism).
- **`SIT`** — array of "situations," each a named group of 4 (mostly) `SCEN` ids in escalating tone: `{id, title, levels:[...], names?}`. Seven situations: `traffic`, `door`, `pass`, `trap`, `last30`, `step`, `chk`.
- **`HELD_SITS = {door:1}`** — a gate object, not a level shape. It hides the `door` situation from the sidebar (padlock icon + alert), blocks its deep-link (`?sit=door`), and is re-checked on load in case saved state points at it.
- **`PRX_CRISIS`** — the one surviving `PRX_`-prefixed name, explicitly commented as *"ported from index.html prxIsCrisis/PRX_CRISIS."* It is a suicide-keyword intercept list checked on free-text submission only.

So step 1's real finding is: **the engine this review must cover is
architecturally different from the one `wargames/03` was written against.**
That document is still valuable — its door-module *design* was largely
carried over — but its file-line citations (`index.html:3475` etc.) point at
a file that is gone.

---

## 1. Game designer lens

### 1.1 The core loop is sound and has three real feedback layers, not one

Every turn stacks: **(a)** a binary or branching dialogue choice with an
immediate ✓/⚠ + point delta + coach line, **(b)** an independent "steady
needle" timing minigame (`lvlZone()`/`steadyCheck()`) that must be hit
*regardless* of which choice is correct, and **(c)** a simulated heart-rate
(`window.__BPM`) that climbs on bad picks and unsteady timing, drives a
tension drone (`startTension`), and speeds up the needle. A "correct" but
poorly-timed answer is explicitly downgraded (`if(p>0&&!steady&&(A.lvl>=1||A.pressure)){p=0;...}`,
line 1641) — the game is teaching *composed delivery*, not just *knowing the
line*, which is the right target for a rehearsal tool. This is a genuinely
well-built double-loop and better than the binary-choice engine `wargames/03`
was written against.

### 1.2 The "heat" mechanic is a good escalation signal, quietly undocumented to the player

`A.heat` (0–3) increments on non-good, non-neutral answers and is shown to
the player only as a passive scene-line addendum (*"He remembers how the
last one went."* + dot meter) and an officer "cutting you off" flourish once
`heat>=2`. It decays by 1 on a clean run. This is a nice diegetic memory
system, but nothing in the tutorial (`tut1`–`tut3`) introduces it — a player
who never triggers it never learns it exists. Low-cost fix: one tutorial
line, or fold it into `tut3`'s existing pressure explanation.

### 1.3 Recovery/branching is a proven mechanic that was built once and never reused

`branch:true` and `nx:` (the mechanic that lets a player recover from a bad
admission and see the interrogation escalate, or take a bad path and watch
it get worse) appear **in exactly one scenario, `routine` (traffic situation,
level 0), and nowhere else in the file.** Verified by direct grep — `nx:`
occurs at lines 900, 901, 912, 913 only (four hits, all inside `routine`);
zero occurrences in any of the other 24 scenario blocks, including `trap1-4`,
whose entire premise ("the admission trap") is the single best fit for this
exact mechanic. This reads as a mechanic that was prototyped once, worked,
and then the team moved on before propagating it. It's the highest-leverage,
lowest-risk (no new engine code, already proven) improvement available to
this module — see §4 CRITICAL.

### 1.4 Scoring/streak/badge layer is coherent and trauma-informed by default

"Swan levels" (`isSwanLvl`: index 3 for any situation, plus `step` indices
≥2) — the "the stop has already gone wrong" levels — deliberately suppress
score, confetti, the results ring, and badges, showing only a recap + weakest
moment. That's a considered design choice (comment cites `wargames/30 #1`)
and it's implemented consistently. Streaks count *days practiced*, not
perfection. First-time practice forces the coach explanation before letting
the player continue (`first-practice` class branch in `answer()`), which is
good scaffolding but only fires once ever, globally, not once per situation
— a player's very first exposure to `door` (once unheld) or `chk` gets no
onboarding beat even though the situation is structurally new to them.

### 1.5 Cosmetic: the "badges" stat is not counting badges

`badgeN` is labeled "SCENARIO BADGES" in the UI (line 688) but is wired to
`totalDone+'/'+TOTAL` (line 1363) — levels completed, not the `badgeHard`/
`badgeClean` achievements actually defined in `finish()`. LOW severity,
one-line mislabel or one-line rewire.

---

## 2. Level designer lens

### 2.1 Level length is inconsistent in a way that correlates with content maturity, not intended pacing

Counting officer turns per scenario directly from source:

| Situation | Level lengths (turns) |
|---|---|
| `traffic` (routine/intense/tension/hard) | 5 / 4 / 4 / 5 |
| `step` (1–4) | 6 / 5 / 5 / 5 |
| `pass` (1–4) | 4 / 3 / 3 / 3 |
| `door` (1–4, held) | **3 / 3 / 3 / 3** |
| `trap` (1–4) | 4 / 4 / 4 / 5 |
| `last30` (1–4) | 4 / 4 / 5 / 5 |
| `chk` (single level) | 4 |

`door` is the shortest situation in the module at every level, and flat —
no escalation in *length* even though tone escalates calm→irritated→warrant→
hard-mode. Every other multi-level situation grows or at least varies by 1–2
turns across its ladder. This isn't necessarily wrong (§2.2 in `wargames/03`
argued door should feel *slower*, not longer), but 3 turns is thin for a
module whose own design brief called for 6–7 beats with a dedicated
"vague reason" beat, a "warrant verification" beat, and a "repeat under
pressure" beat that deliberately reuses an earlier correct line. None of
those three beats exist in the shipped `door1-4` — it currently teaches
*only* "don't open," "demand a judicial warrant," and "don't step outside."
That's a real subset of the design brief, not the whole thing.

### 2.2 `chk` (checkpoint) has no difficulty ladder at all

Every other situation is a 4-level escalation. `chk` is a single level
(`levels:['chk1']`). That's a legitimate scope choice (checkpoints are a
narrower, more procedural encounter — the in-scene text says so explicitly:
*"Rehearsal only — not reviewed by an immigration attorney"*), but it means
`chk` is structurally an outlier the difficulty-curve logic has to special-
case (it's excluded from the `['traffic','pass','trap','last30','step','chk']`
scene-photo list treatment differently, uses `Math.min(A.lvl,3)` defensively
even though `A.lvl` can only be 0 here). Fine as shipped; worth a comment in
`SIT` noting it's intentionally single-level so a future editor doesn't "fix"
it by inventing 3 more levels without attorney sign-off.

### 2.3 Difficulty is tone-ordered, not skill-ordered — same finding as `wargames/03`, still true

`lvlPeriod()`/`lvlZone()` tighten the timing window monotonically with
`A.lvl` (1.7s→0.65s base period; 38%→16% zone width) — that part *is* a
real, code-enforced skill curve. But the underlying *content* difficulty is
officer-hostility-ordered, and hostility is not the same axis as decision
difficulty. `l303` ("mentions a K9, pulse spikes") is tonally "pressure," not
"hard," yet sits at index 2 same as every other situation's index-2 slot —
consistent placement, but the labelling (`names` arrays use `😌/😠/🔥.🚨/🏆`
somewhat differently per situation — `step` uses `🚨 Tests & cuffs` at index
2 while `trap`/`last30` use `🔥 Pressure` at the same index) means the same
index number means a different *kind* of escalation depending which
situation you're in. A player who has internalized "index 2 = pressure" from
`trap` gets "index 2 = tests & cuffs, procedural" in `step`. Minor, but it
undercuts the transferable mental model the module could otherwise build.

### 2.4 Consent gate placement is correct and consistently enforced

The swan-level consent prompt (`hardQ`) is gated in `renderArena()` itself —
explicitly *not* on the tab click — with a comment citing exactly why
(`wargames/30 #4`/`FG23 golden #2`): every entry path (sidebar, tab, daily
drill, reload) funnels through one render function, so there's no route that
skips the warning. This is good defensive level design and matches the
gating discipline `wargames/03 §4.2` asked for.

---

## 3. Instructional designer lens

### 3.1 The one repeatable-phrase mechanic that teaches transfer is real, but under-leveraged

`finish()`'s "KEY PHRASES TO MASTER" recap and the "weakest moment" callout
are strong retention devices — end-of-run, spaced-repetition-adjacent,
targeted at the specific line the player missed. But because §3.1's
branching/recovery mechanic is confined to `routine`, the module's strongest
tool for teaching *"you can always recover, even after a mistake"* is
demonstrated exactly once across ~21 unlocked levels. A player who fails
`trap1` (the scenario literally named for this exact failure mode) simply
restarts the level rather than seeing the consequence play out and then
recovering mid-run. This is the same finding as §1.3, from the teaching
side: it's not just an underused mechanic, it's an underused *lesson*.

### 3.2 Word-economy nudge is a genuinely good, consistently-applied teaching device

`if(wc>12) f+=' · '+UI[A.lang].econ(wc)` (line 1644) fires on *every* free-
text answer regardless of correctness, appending "N words — you volunteered
more than he asked. Shorter is safer." This is applied uniformly across all
situations and both languages, teaches a transferable skill (brevity) rather
than a memorized line, and costs nothing to maintain. Good instructional
design, no changes recommended.

### 3.3 Gentle Mode is the right default and the right opt-in shape

New users default to `A.gentle=true` (no clock, no heartbeat) until they
finish setup; "replay under pressure" is an explicit opt-in from the results
screen, not a level gate. This matches trauma-informed sequencing — teach
the content first, add stress inoculation only once the player has chosen
to. No structural gap found here.

### 3.4 The tutorial (`tut1`–`tut3`) explains the *timing* mechanic in detail but not the *scoring* mechanic

`tut2` explains the needle/gold-zone timing exercise; `tut3` explains the
pressure meter and composure bonus. Neither explains that a *correct but
unsteady* answer is silently zeroed (§1.1) — a player can play the "correct"
choice, get 0 points, and never learn why unless they read the appended
coach text carefully. Recommend folding one sentence into `tut3` (which
already covers timing+pressure) rather than adding a fourth tutorial screen
— cheapest fix that closes the gap.

### 3.5 The module already has one working example of the review discipline this task is asking for — worth preserving as precedent

Lines 1313–1317 (`CITED`, `DUTY_INFORM`, `STOP_ID`) are explicitly commented
`TODO_ATTORNEY: unverified state lists — kept as data, never rendered`, and
lines 1422–1428 show the actual removal: per-state "duty to inform" / "stop
and identify" copy was shipped, then pulled in a focus-group pass
(*"the charter does not allow state-specific legal commands without attorney
sign-off"*), with the removed lines preserved in a comment for a future
reviewer rather than deleted outright. That is exactly the discipline
`wargames/03` asked for. It makes the next finding more notable by contrast.

---

## 4. Findings, severity-ranked

### 4.1 CRITICAL (structural, not legal) — the door module shipped full dialogue while gated as "with the attorney and DV-clinician reviewers"

`HELD_SITS={door:1}` and its adjacent comments (lines 853, 1271, 2002, 2172)
all describe `door1`–`door4` as unreviewed: *"the door-knock coaching is with
the attorney and DV-clinician reviewers... we will not ship it half-checked."*
But `door1`–`door4` (lines 1072–1112) contain **complete, specific authored
officer dialogue and legal claims** — not `TODO_ATTORNEY` placeholders. Examples
of claims currently sitting in shipped (if gated) code: *"You never have to
open your door without a judicial warrant,"* *"Administrative forms (I-200/
I-205) do NOT authorize entry into a home,"* and a `door3` beat scripting the
exact visual difference between an ICE Form I-200 and a judicial warrant.

This is not a content-authoring problem for me to flag as `TODO_ATTORNEY` —
the content already exists and reads as complete, reviewed-sounding prose.
The structural problem is a **process/labeling gap**: nothing in the file
marks *which* of these four levels' claims have actually cleared attorney +
DV-clinician review versus which are placeholder-quality drafts sitting
behind the gate for convenience. `wargames/03 §6.5` explicitly required a
second (DV) intercept list *before* the door module ships, separate from the
one CRISIS list — I found no DV-specific intercept anywhere in the file (see
§4.2). If the review this comment describes is in fact still pending, the
gate is doing its job today (users can't reach it) — but the content sitting
behind it is far past the `TODO_ATTORNEY` stage `wargames/03` specified, and
whoever finishes that review needs to know it's reviewing finished copy, not
a scaffold. Recommend: either (a) confirm review status out-of-band and
update the comments/`HELD_SITS` reason to match reality, or (b) if review is
genuinely still open, add an explicit `TODO_ATTORNEY`/`TODO_DV_CLINICIAN`
marker atop the `door1`–`door4` block itself, not just in surrounding prose,
so the gate and the content don't silently drift apart the way `DUTY_INFORM`/
`STOP_ID` did before their focus-group catch (§3.5).

### 4.2 HIGH — the DV intercept `wargames/03 §6.5` called for does not exist

Confirmed by direct search: no `domestic`, `clinician`, `DV_`, or equivalent
intercept anywhere in `arena/index.html`. `PRX_CRISIS` (suicide-only) is the
sole intercept list, ported as-is. `wargames/03` was explicit that this
blocks shipping the door module *before*, not after, launch, precisely
because door beats 1–2 are the first place in the app a user might disclose
being the subject of the officer's call. If door is unheld before this
exists, that gap ships with it.

### 4.3 HIGH — the branch/recovery mechanic's near-total non-reuse (§1.3/§3.1)

Restated as a fix-shaped item: this is a proven, already-built, zero-new-
engine-code mechanic. Extending it to at least `trap1` (thematically the
best fit) and one `last30` level (the "one more question" pattern is
structurally the same "recover after almost slipping" shape) would cost
authoring time only, no engine work — same category of fix `wargames/03`
favored ("cheapest fix that captures most of the value").

### 4.4 MEDIUM — level-index semantics drift across situations (§2.3)

Index 2 means "procedural/tests" in `step`, "pressure" in `trap`/`last30`,
and "ordered out" in `traffic`. Not broken, but it erodes the transferable
mental model a player builds after their first situation. Cheapest fix:
standardize the `names` array's index-2 label semantics across situations,
or accept the drift and say so in a code comment so it reads as intentional
rather than accidental next time someone edits `SIT`.

### 4.5 MEDIUM — `door`'s shipped content covers roughly half of its own design brief (§2.1)

3 turns vs. the 6–7-beat scaffold `wargames/03 §3` specified; missing
specifically the "ask them to name the basis" beat, the warrant-verification
beat (which `wargames/03` itself flagged as conditionally cuttable — fine to
drop), and the "repeat the same line verbatim" beat (which is the one
`wargames/03` called "mechanically elegant" and cheapest to add, since it
reuses existing correct copy rather than authoring new). If door is being
expanded as part of finishing its review, that beat is the highest-value,
lowest-authoring-cost addition.

### 4.6 LOW — heat mechanic undocumented in tutorial (§1.2)

### 4.7 LOW — `badgeN` label doesn't match what it measures (§1.5)

### 4.8 LOW — first-practice onboarding fires once globally, not once per new situation type (§1.4)

---

## 5. TODO_ATTORNEY-convention placeholders (structure only, per §4.1/§4.2)

Following the exact convention `wargames/03` established — a placeholder
names the decision type and the source, never the legal content itself:

```
// If door1-4 review is still open, mark it at the data, not just in prose:
const DOOR_REVIEW_STATUS = {
  door1: { TODO_ATTORNEY: "confirm judicial-warrant framing, beat 1-3", TODO_DV_CLINICIAN: "n/a, no disclosure risk at this beat" },
  door2: { TODO_ATTORNEY: "confirm 'volume doesn't change the law' framing" },
  door3: { TODO_ATTORNEY: "confirm I-200/I-205 vs judicial-warrant distinction, beat 2" },
  door4: { TODO_ATTORNEY: "confirm ruse-legality framing (gas leak beat), 'sign nothing' framing" }
};

// wargames/03 §6.5 — DV intercept, still unbuilt. Structure only:
const DV_INTERCEPT = [ /* TODO_DV_CLINICIAN: phrase list — must be authored/
  reviewed by a domestic-violence clinician or advocacy org, not a model */ ];
function dvIsDisclosureArena(text){ /* TODO: same shape as prxIsCrisisArena,
  routes to prCurTier='x' (unscored) + a DV resource line, never a coach line */ }
```

No case names, statutes, or officer lines are proposed above — only the
shape review already agreed to in `wargames/03` and never implemented.

---

## Open items requiring a human before any of this ships or changes

1. **Resolve §4.1**: confirm whether `door1`–`door4`'s content has actually
   cleared attorney + DV-clinician review. If yes, unhold and update stale
   "in review" copy (lines 853, 2172) so it stops telling users something
   false. If no, this is already shipped-quality copy sitting unreviewed —
   flag urgency accordingly to whoever owns that review.
2. **§4.2 blocks unholding `door` regardless of §4.1** — the DV intercept
   list must exist first, per `wargames/03`'s own ruling, and must be
   authored/reviewed by a DV clinician, not by a model or by me.
3. **§4.3/§4.5 are authoring-only, zero-engine-risk improvements** — good
   candidates for the next content pass once §1/§2 are resolved.
4. Everything else in §4 (2.4, 4.6–4.8) is a small, independent fix; none are
   blocking.
