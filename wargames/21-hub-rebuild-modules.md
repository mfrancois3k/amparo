# wargames/21 — the hub rebuild: does the tab split hold? (game/level/instructional design lens)

Follow-up to `wargames/20-level2-spike-fixed-modules.md`. That review's #1 open
structural item — `/app` shipping a flat level list where root ships a 3-tab
module hub — has now landed: `app-src/src/screens/practice/PracticeHub.tsx`
exists, `PracticeLevelSelect.tsx` is deleted, and "← All scenarios" returns to
the hub. This pass reads the rebuilt hub as an information-architecture
artifact, checks it line-by-line against root's step 5, and re-assesses the
difficulty ladder now that Level 2 is three beats.

**Scope discipline, unchanged from 03/16/17/19/20:** structure and sequencing
only. No officer dialogue, no legal content authored here. `TODO_ATTORNEY` is
the only placeholder convention; §5 is the first pass in a while that actually
needs one.

---

## 0. Correction to wargame 20, §2 — verified, and it changes the finding

Wargame 20 claimed the new `ci:3 → ci:2` divergence hop is "fully live (both
curt and hostile variants exist)". **That is wrong.** Read directly out of
`app-src/src/content/practice.json` this pass:

| bank | tones present |
|---|---|
| `PRX_VAR[2]` (consent to search) | `calm, calm, curt, curt` — **no hostile** |
| `PRX_VAR[7]` (arrest) | `calm, calm, curt, curt` — **no hostile** |
| `PRX_VAR[3]` (exit order) | `calm, calm, curt, curt, hostile` — the only hostile line in the traffic bank |

`PRX_DIVERGE[2] = {g:'curt', b:'hostile'}`. Level 2's deck is `[3, 2, 7]`.
Divergence re-tones the *next* beat, so the two hops are `ci:3→ci:2` and
`ci:2→ci:7`. Both targets (`ci:2`, `ci:7`) have zero hostile variants, and
`prxDiverge()` bails on `if(!pool.length) return`. Therefore:

- **Good-pick leg (`want:'curt'`) — live at both hops.** That part of wargame
  20's story stands, and it is a real gain from the 3-beat deck.
- **Bad-pick leg (`want:'hostile'`) — dead at both hops.** Not one hop, both.
  A player cannot make the officer escalate at Level 2 no matter how badly
  they answer.

The second-order consequence is worse than a missing variant, and it is an
instructional-design problem rather than a content nicety. `PRX_VAR[3]` is the
one beat that *does* carry a hostile line — and it is Level 2's **opening**
beat, which divergence never targets (there is no preceding beat to score).
The only route to that line is `prxBuildDeck()`'s deal-time tone filter
(`tones[2] = ['curt','hostile']`, `index.html:4726`). So the entire hostility a
Level 2 player will ever experience is decided by a coin flip **before they
have answered anything**. The level's stated premise — "a mistake draws
hostile, a good answer curt" (`index.html:5216-5219`) — is not deliverable with
the current bank in either direction it matters.

`TODO_ATTORNEY` — two officer lines, both `tone:"hostile"`: one for `PRX_VAR[2]`
(consent-to-search pressure) and one for `PRX_VAR[7]` (arrest). Authored and
reviewed through the normal process; not written here. With those two lines the
Level 2 divergence chain becomes live end-to-end for the first time, which is
the accurate framing to carry into that work.

## 1. Does checkpoint-on-its-own-tab fix the "just another traffic level" problem?

**Yes, structurally — this is the right move and it is correctly executed.**
The hub now has three separable claims: a *ladder* (traffic, four numbered
rungs, with a progress bar because progression is the point), a *standalone
scenario* (checkpoint, no rung number, a context note instead of a bar because
there is no ladder to be partway up), and an *honest hole* (the door module).
Those are three different instructional contracts and they now have three
different presentations. The flat list asserted one contract for all of them,
which is exactly the regression wargames/16–19 and focus group 12 kept
independently rediscovering.

The checkpoint tab's note (`hub_ck_note`) does the load-bearing work: it names
the encounter as *not a traffic stop*, names the rule difference, and states
the 50-state applicability. That is the framing the flat list destroyed by
placement alone, and it is restored without one word of new legal content.

**The door tab's dead-end is acceptable and should not be "fixed."**
`hub_m2_body` explains what is missing, why it is missing (attorney review, and
the domestic-violence-call complication that changes what safe advice even
looks like), and refuses to imply a date. A tab that ends in an honest
explanation is a better instructional artifact than a hidden tab — root's own
note is that hiding work-in-progress already made the federal-only states read
as broken once. Leave it.

## 2. New problems the tab split introduces

### 2a. The tab is not sticky across a run — real, and it is a pacing bug (HIGH)

`PracticeHub.tsx:42` — `const [tab, setTab] = useState(0)`. `PracticeStep`
renders `<PracticeHub>` only when `state.phase === 'IDLE'`
(`PracticeStep.tsx:135`), so the component **unmounts** the moment a run
starts and remounts with `tab` back at 0.

Root does not have this. `_hubTab` is module-scope (`index.html:3865`,
`hubTab(i)`), and root's practice overlay is a *modal over the hub* — so the
hub's DOM is not even re-created. Play the checkpoint, hit "← All scenarios",
and in root you land back on the Checkpoint tab; in `/app` you land on Traffic
with no trace of where you were.

This lands precisely on the behaviour the split exists to protect. The player
who found the checkpoint, ran it, and wants to run it again is the exact user
whose second attempt now requires re-discovering a tab they already found. It
also silently punishes the only navigation path the rebuild kept ("← All
scenarios" → `toLevels()`).

Fix is small and belongs in `PracticeStep`, not the hub: lift `tab` to the
parent (or module scope) so it survives the IDLE ↔ run transition. Note this
is a *consequence* of the correct architectural call in the header comment
("ONE screen, not two") — the port dropped the persistence root got for free
from being a modal, and nothing replaced it.

### 2b. The traffic-only progress bar now under-represents the catalogue (MEDIUM-LOW)

`hub_progress` reads "{n} of 4 done" and counts `RUNGS = [0,1,2,3]` only. That
is correct scoping — checkpoint genuinely is not a rung — but it means the hub
no longer states anywhere that five playable scenarios exist. A player who
never taps tab 2 experiences a product that is four levels deep and then over.
Root has the identical shape, so this is faithful, not a `/app` regression.

The cheap, content-free mitigation is a count on the tab label itself (the tab
strip is the only surface that can honestly speak for the whole catalogue now
that each pane speaks only for itself). Not required; flagging because "did
splitting the tabs hide the checkpoint from people who never tapped it" is the
question this rebuild will actually be judged on, and there is currently no
signal in the UI — or, per §3c, in telemetry — that would answer it.

### 2c. Latent: the traffic tab and its own progress bar disagree under a flag flip (LOW)

If `FINAL_SCENARIOS_ENABLED` ever flips true, `PRX_LEVEL_IDS` becomes
`[0,1,2,3,4,5,6]` and root's traffic tab renders **six** cards (0,1,2,3,5,6)
while the bar still reads "of 4". Root's own comment anticipates the six-card
case ("the four numbered rungs plus any enabled final scenarios",
`index.html:3449-3452`) but the copy does not.

`/app` cannot flip it at all: `practice.json` has `PRX_LEVEL_IDS` baked to
`[0,1,2,3,4]`, and there is no `FINAL_SCENARIOS_ENABLED` or `DOOR_MODULE_ENABLED`
in `/app`. The extraction froze two runtime flags into data. That is arguably
the right call for now — but it means the flags are no longer a one-edit switch
across both surfaces, and anyone flipping them in root should expect `/app` not
to follow. Worth a line in the parity notes rather than a fix.

(Separately: `PRX_DOOR_IDS` at `index.html:4384` is **declared and never
read** — root's hub renders the unbuilt panel unconditionally on tab 2, so
flipping `DOOR_MODULE_ENABLED` would do nothing there either. `/app` does not
port the dead variable, which is the better state. Noted so nobody "fixes"
`/app` by adding it back.)

### 2d. The checkpoint tab is a one-card grid (LOW, cosmetic, but see §4)

`ids = [CK]` renders into the same `.pr-grid` as the four-card traffic tab. A
grid with one item in it reads as a shelf that failed to load rather than a
module that has one scenario. It is not wrong, and it is byte-faithful to root.
It becomes a non-issue the moment the checkpoint tab has siblings (§4), which
is the real answer.

## 3. Fidelity check: `PracticeHub.tsx` vs `index.html:3420-3483`

The port is close and the deliberate divergences are mostly documented in the
file's own header. Confirmed matching: tab order (`hub_m1`/`hub_m3`/`hub_m2`,
traffic → checkpoint → door, which is *not* the string-key order and is not a
typo), `CK = 4` filtered out of the ladder, `RUNGS = [0,1,2,3]` and the
`rungsDone/4` bar width, the checkpoint context pane replacing the bar, the
door pane on tab 2, `.pilot.info` reproducing root's inline `#eef1f7`/`#c3cde0`
override as a real class (`practice.css:54`), `PRX_UNSCORED` suppressing Hard
Mode's score on the card, the whole-fraction `🟩 {best}` status, the
lock/done/start status ladder, and `hub_back_pack` on the ghost button.
Both `hub_ck_note` and `hub_m2_body` exist in `t.en.json`/`t.es.json`.

Divergences found:

### 3a. Locked cards: `disabled` vs `aria-disabled` (MEDIUM-LOW, a11y)

Root: `aria-disabled="true" title="${hub_locked}"` and simply omits the
`onclick` (`index.html:3467`). The card stays **focusable** — a keyboard or
screen-reader user can reach it, hear that it is locked, and learn that more
content exists.

`/app` (`PracticeHub.tsx:114-116`): `disabled` **and** `aria-disabled` **and**
`title`. The native `disabled` wins: the button leaves the tab order, and
browsers do not surface `title` on a disabled control. So the two attributes
carrying the "there is more here, keep going" message are both rendered
unreachable by the users most dependent on them.

Locked rungs are the ladder's only forward-motivation signal on this screen.
Drop the `disabled` attribute, keep `aria-disabled` + `title`, and guard the
handler (`if (locked) return` in `pick`, alongside the `picked` guard already
there). Root's shape was correct; this one should be ported, not improved on.

### 3b. Tab strip has `role="tablist"` semantics it does not implement (LOW, inherited)

Both sides: `role="tablist"` + `role="tab"` + `aria-selected`, but no
`aria-controls`, no `role="tabpanel"` on the content, and no roving
tabindex/arrow-key handling. A screen reader announces "tab 1 of 3" and then
arrow keys do nothing. Faithful to root, so not a rebuild regression — but the
rebuild has now duplicated the defect onto a second surface, which is the
moment it is cheapest to fix in both. Either implement the pattern or use
plain buttons; the current state promises an interaction model that is not
there.

### 3c. Tab-change analytics are not ported — and this one bites (MEDIUM)

Root's `hubTab(i)` fires `ph('sr_hub_module', {module: ['traffic','checkpoint','door'][i]})`
(`index.html:3865`). `/app` has no analytics layer at all — `grep` for `ph(` or
`posthog` across `app-src/src` returns nothing.

Ordinarily a missing event is a chore. Here it is the specific event that
answers the question the entire tab split was made to answer: *does anybody
open the checkpoint tab?* The split's justification is a discoverability
hypothesis, and on `/app` it is now unfalsifiable. Not a hub bug — a `/app`
platform gap — but this is the first feature that concretely needs it, so it
belongs on the record here.

### 3d. The reduced-motion comment cites root incorrectly (LOW, doc accuracy)

`PracticeHub.tsx:51-53` says it is following "root's `prPick`
(index.html:5141-5160): let the green pulse land … but skip the wait entirely
under reduced motion."

Root's `prPick` branches on `document.documentElement.classList.contains('sr-motion')`,
and `sr-motion` does **not** mean reduced motion — `SR.arm()`
(`index.html:1397-1400`) sets it only when GSAP has loaded, i.e. it means "GSAP
is armed and owns motion." `/app`'s own `index.css:24-34` carries an explicit
warning about this exact inversion, noting a previous comment got it backwards.
Root's inline comment inside `prPick` also misreads its own class.

The **behaviour** in `/app` is right: `/app` can never load GSAP (CSP is
`script-src 'self'`), so it is permanently in root's CSS-keyframe branch, and
under `prefers-reduced-motion` that keyframe is flattened to `.001ms` — there
genuinely is no pulse to wait for, so skipping the 260ms is correct and better
than a literal port. Only the citation is wrong. Fix the comment, not the code;
this repo has already spent one review cycle on this inversion and the comment
as written will cause a third.

### 3e. Double-tap guard is weaker on the reduced-motion path (LOW)

Root keeps `_prPickBusy` set for the full 260ms on *both* branches, after
discovering that clearing it synchronously was a no-op against two `.click()`
calls in the same tick. `/app`'s reduced-motion path calls `onPick(level)` and
returns without ever setting `picked`, relying on unmount to prevent a second
call — but React batches, so two same-tick clicks both reach `selectLevel()`,
and `selectLevel()` is not idempotent (it calls `buildDeck()`, which re-rolls
tone variants). Outcome is a harmlessly re-dealt deck, not a crash. Cheapest
fix is to set `picked` on both paths and let it be the guard.

## 4. Difficulty curve, re-assessed with Level 2 at three beats

**Ladder 0→1→2→3 is coherent.** The axis that actually escalates is officer
tone, and it escalates monotonically: `tones` per level is
`[['calm'], ['curt'], ['curt','hostile'], (fixed)]` (`index.html:4726`), with
speech `rate` 0.95 → 1.12 → 1.28 and a per-level escalation consent gate from
level 2 up (`needsWarn = level >= 2`). Level 3 (Hard Mode) then breaks the axis
on purpose: fixed deck, unscored, unwinnable, teaching that a bad outcome is
not the driver's fault. That is a legitimate ladder — three rungs of graded
pressure and a fourth that reframes what the pressure means.

Three observations, none blocking:

**4a. Beat count is not monotonic and should not be read as difficulty.**
5 → 6 → 3 → 3 beats. Level 2 is the *shortest* scored level and sits third
behind a warning gate. That is correct design (intensity, not endurance) but
it produces a scoring artifact: denominators are 5, 6, 3, so a perfect `3/3` on
the hardest scored level renders next to a `5/6` on an easier one and reads as
the lesser achievement. The recent best-score fix (comparing numerator *and*
denominator, `practiceEngine.ts` `completeRun` / `index.html:5493`) correctly
killed the stale-best bug; cross-level comparability is a separate, purely
cosmetic issue and does not need code now. Do not "fix" it by padding Level 2
back to 5–6 beats — that would undo wargame 19/20's fix.

**4b. The stress mechanic inverts at the top of the ladder.** Curveballs are
gated `if (runs >= 1 && prLevel < 2)` (`index.html:4742`) — they exist on levels
0 and 1 only. So a repeat player gets an unscripted surprise beat on the two
*easy* levels and none on Level 2, the level explicitly gated behind an
escalation warning. Combined with §0 (Level 2's hostile leg being dead in both
directions), Level 2's added pressure over Level 1 currently reduces to: a
warning screen, a faster speech rate, and a coin-flip chance of one hostile
opening line. That is thinner than the ladder's framing promises. The two
`TODO_ATTORNEY` lines in §0 are the fix; no code change needed for either.

**4c. Hard Mode's placement as the 4th rung is still right — with one caveat
the progress bar creates.** It must come last (it only lands after the player
has internalised that good answers produce good outcomes), it must be gated
(`isLocked`: needs `done[0] && done[1] && done[2]`), and it must be unscored
(`PRX_UNSCORED`) so the unwinnable track never renders as a failure. All three
hold on both sides. The caveat: the rebuilt bar now counts Hard Mode as one of
four *completion targets*, so a player at "3 of 4 done" is being invited to
complete a level whose thesis is that completion is not in their control. The
tension is mild and arguably productive — you do "finish" it — but it is new
with the bar and worth being deliberate about rather than discovering later.

## 5. Is the checkpoint tab a satisfying standalone module?

**Not yet — it needs siblings, and it is the clearest next content ask after
§0's two lines.** Right now it is one fixed 4-beat scripted deck (`PRX_CHK`,
`practice.json`) with no variants, no divergence entry (`PRX_DIVERGE` has no
key 4), no curveballs (`prLevel < 2` gate), and no progress affordance of any
kind. A player who runs it twice gets a byte-identical experience. Meanwhile
the traffic tab next door has tone variance, divergence, a curveball from run 2
onward, and a progress bar. The tab split correctly asserted "this is its own
module"; the module currently has one room in it.

The right shape is 2–3 checkpoint scenarios that vary the *legal* situation
rather than the officer's mood — that is what makes a checkpoint different from
a traffic stop, and it is also the axis a player most needs rehearsed. Candidate
siblings, structure only:

- **Secondary inspection referral** — the checkpoint escalating to being waved
  to a secondary area. `TODO_ATTORNEY`.
- **Passenger, not driver** — same checkpoint, different seat and different
  answers. `TODO_ATTORNEY`.
- **Interior checkpoint vs. border-adjacent** — the 100-mile-zone distinction
  the current note gestures at. `TODO_ATTORNEY`.

All three are new legal content and new officer dialogue, so none of them is
authored here. Sequencing: these come *after* §0's two hostile variants, which
unblock an existing level rather than opening a new one, and after §2a, which
is a bug.

## 6. Summary table

| # | Finding | Where | Severity | Action |
|---|---|---|---|---|
| 0 | wargame 20 §2 is wrong: Level 2's hostile leg is dead at **both** hops, not one. `PRX_VAR[2]` and `PRX_VAR[7]` are both `calm,calm,curt,curt` | `practice.json`, `index.html:4441-4474` | MEDIUM | 2 `TODO_ATTORNEY` hostile lines; corrects the record |
| 1 | Tab split fixes the "just another traffic level" regression | `PracticeHub.tsx` | — | Confirmed good, no action |
| 2a | Hub tab resets to Traffic after every run — root's `_hubTab` persists, `useState` in an unmounting child does not | `PracticeHub.tsx:42`, `PracticeStep.tsx:135` | **HIGH** | Lift `tab` to `PracticeStep` |
| 2b | Traffic-only bar means nothing on the hub states that 5 scenarios exist | both sides | MEDIUM-LOW | Optional: count on the tab label |
| 2c | `FINAL_SCENARIOS_ENABLED` / `DOOR_MODULE_ENABLED` frozen into `/app`'s data; `PRX_DOOR_IDS` dead in root | `practice.json`, `index.html:4381-4384` | LOW | Parity note only |
| 2d | Checkpoint tab is a one-card grid | `PracticeHub.tsx:95` | LOW | Resolved by §5 |
| 3a | Locked cards use native `disabled`, killing focus + `title` that root kept reachable | `PracticeHub.tsx:114-116` | MEDIUM-LOW | Drop `disabled`, guard in `pick` |
| 3b | `role="tablist"` without `aria-controls`/`tabpanel`/arrow keys | both sides | LOW | Implement or drop the roles |
| 3c | `sr_hub_module` not ported; `/app` has no analytics at all, so the split's own hypothesis is unmeasurable | `/app` platform | MEDIUM | Platform gap, not a hub fix |
| 3d | Comment cites root's `sr-motion` as meaning reduced motion; it means "GSAP armed". Behaviour correct, citation wrong | `PracticeHub.tsx:51-53` | LOW | Fix comment only |
| 3e | Reduced-motion path skips the double-tap guard; `selectLevel()` is not idempotent | `PracticeHub.tsx:54-60` | LOW | Set `picked` on both paths |
| 4 | Ladder 0→1→2→3 coherent; beat count non-monotonic by design; curveballs absent from the hardest scored level | `index.html:4726,4742` | LOW | No code change |
| 5 | Checkpoint tab is a single fixed deck — a tab, not yet a module | `PRX_CHK` | MEDIUM | 2-3 `TODO_ATTORNEY` siblings, sequenced after §0 and §2a |

Net: the rebuild is the right screen and a close port, and it does fix the
regression wargames/16–19 kept re-finding. One real bug came with it (§2a, the
tab not surviving a run — root got persistence for free from being a modal and
nothing replaced it), one a11y port to tighten (§3a), and one correction to
carry forward (§0). The ordering that falls out: fix §2a, port §3a, author §0's
two lines, then build §5's checkpoint siblings.
