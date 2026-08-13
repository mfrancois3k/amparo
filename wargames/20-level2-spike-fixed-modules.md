# wargames/20 — Level 2 spike, fixed: does it actually work? (game/level/instructional design lens)

Follow-up to `wargames/19-phase6-complete-modules.md`. That review's #1 finding —
also carried since wargames/16 and 17 — was fixed and shipped as v2.20.2:
`PRX_LEVELS[2].ids` went from `[3,7]` to `[3,2,7]`, inserting the ci:2
consent-to-search beat between the exit order and the arrest. This pass
re-reads the fix with fresh eyes (not "did it land," but "does it hold up"),
reconfirms the two items wargame 19 left open, and touches no content.

**Scope discipline, unchanged from 03/16/17/19:** structure and sequencing
only. No officer dialogue, no legal content authored here. `TODO_ATTORNEY`
remains the only placeholder convention; none is needed this pass.

---

## 1. Confirmed landed, both sides

`index.html:4374` — `PRX_LEVELS=[...,{ids:[3,2,7],rate:1.28},...]` (index 2,
the third traffic rung). `app-src/src/content/practice.json:194-199` —
`{"ids":[3,2,7],"rate":1.28}`, byte-identical shape, correctly re-extracted.
Both sides agree. The fix is real, not a doc-only change.

## 2. Fresh-eyes assessment of the 3-beat deck — verdict: it works, and it
does more than the one-line diff suggests

The obvious question first: does inserting ci:2 (consent to search) between
ci:3 (exit order) and ci:7 (arrest) fix the pacing problem wargame 16/17
flagged? Yes — three beats reads as a scene with a build (comply with the
order → hold the line on consent → the stakes escalate to arrest), where two
beats read as a jump cut. That part is exactly as advertised.

What's worth flagging is a second-order effect nobody had to write new code
for: **the divergence mechanic (`PRX_DIVERGE`, `index.html:5226-5238`) now
fires twice per run instead of once, and its "good path" is live across both
hops for the first time.**

`PRX_DIVERGE={1:{...},2:{g:'curt',b:'hostile'}}` re-tones the *next* dealt
line based on how the *current* beat went — a good answer at level 2 should
pull the following line toward `curt`, a miss toward `hostile`. With the old
2-beat deck `[3,7]`, this fired exactly once: the outcome of ci:3 (exit
order) re-toned ci:7 (arrest) directly. The code's own comment
(`index.html:5216-5219`) already documented that the `hostile` leg of that
single hop was inert, because ci:7 ships only `calm`/`curt` officer-line
variants (confirmed again this pass at `index.html:4471-4474` — no
`tone:"hostile"` entry exists for beat 7). So under the old deck, divergence
was doing real work only on the good path, and only for one hop.

With `[3,2,7]`, divergence now runs twice:

- Beat 0→1: how the player handles the exit order (ci:3) re-tones the
  consent beat (ci:2) toward `curt` or `hostile`. `PRX_VAR[2]` has both
  tones in its pool (confirmed at `index.html` — the checkpoint-adjacent
  consent variants ship curt and hostile lines), so **this hop is fully
  live in both directions** — new behavior the spike fix enabled for free.
- Beat 1→2: how the player handles consent (ci:2) re-tones the arrest line
  (ci:7) toward `curt` or `hostile`. The `hostile` direction is still inert
  for the same reason as before — no hostile variant exists for ci:7 — but
  the `curt` direction (a good consent answer keeping the arrest line curt
  instead of whatever it was dealt) is now reachable and testable, where
  before there was no second hop for it to apply to at all.

Net: the fix didn't just add a beat, it activated a code path
(`index.html:5216-5219`'s own inline comment predicted this — "kept because
the logic is tone-pool-driven and lights up the day the bank grows," written
for the *bank* growing; it turns out the *deck* growing had the same effect
on one full hop). Nothing to fix here — flagging it because it's the kind of
interaction that's easy to miss reading the diff in isolation ("inserted one
array element") and easy to verify wrong by eye without tracing
`prxBuildDeck()` → `prxDiverge()` together.

**One thing to flag, not to fix (content, not code):** `PRX_VAR[7]`'s missing
hostile variant means the arrest beat can never actually escalate in tone no
matter how badly the consent beat goes — a miss at ci:2 now visibly tries to
darken the mood into ci:7 and can't, because `want==='hostile'` and the pool
is empty (`index.html:5234-5235`, `if(!pool.length) return`), so the line
that was dealt originally is what plays. This was already the known,
explicitly-scoped-out gap (see §4) — the 3-beat deck doesn't create a new
problem, it just makes the existing gap load-bearing on one more transition
than it was before. Worth knowing when that content finally does get
authored: it isn't just "level 2's arrest line gets a hostile option," it's
"the level 2 divergence chain becomes live end-to-end for the first time."

## 3. Curveball interaction — checked, no issue

`prxBuildDeck()` gates curveball insertion with `if(runs>=1 && prLevel<2)`
(`index.html:4742`) — curveballs only ever apply to levels 0 and 1 (array
indices), never to level 2 (the fixed rung, array index 2) regardless of
deck length. The 3-beat deck doesn't interact with the curveball splice at
all; that code path is simply not reachable for this level. Confirmed by
reading the guard directly, not inferred from level-count math.

## 4. Score/best-time continuity — new, minor, worth one line

Not a bug and not in scope to fix, but a real instructional-design side
effect: any player who already has a recorded `best` time for level 2 set it
against the 2-beat deck. The 3-beat deck is strictly longer, so that stored
best will now read as unbeatable-by-comparison the next time they play —
the UI has no way to know "the level got harder," it just shows a number
that used to be achievable and now looks like a regression in the player's
own skill. This is the same category of thing a `PRX_LEVELS` content change
always risks and nothing here needs new code to fix (a version bump on the
progress schema would be the eventual answer, if it's ever worth doing) —
flagging so it isn't mistaken for a scoring bug if a returning player
reports "my best got worse."

## 5. Status of wargame 19's two open findings — both still stand, reconfirmed against current source

**PRX_VAR[7] hostile gap — STILL OPEN.** Re-verified directly this pass,
not inherited from the prior report: `index.html:4471-4474` lists exactly
four variants for beat 7, tones `calm, calm, curt, curt` — zero `hostile`
entries. Left open by explicit operator choice; needs new officer dialogue
authored and attorney-reviewed, out of scope for anyone but that process.
Section 2 above adds one detail worth carrying forward when it's picked up:
the gap is now load-bearing on two divergence hops in level 2, not one.

**Flat list vs. root's 3-tab hub — STILL OPEN, reconfirmed against current
source.** Read `app-src/src/screens/practice/PracticeLevelSelect.tsx` fresh
this pass (not assumed from wargame 19's description): it is unchanged — a
single `.prx-list` of `button.prx-lcard` mapped straight over
`PRX_LEVEL_IDS` (`[0,1,2,3,4]`), no `tablist`, no per-tab progress scoping,
no separate checkpoint pane. Root's step-5 hub at `index.html:3420-3474`
(3-tab `role="tablist"`, traffic-only `hub-progress`, checkpoint's own
context pane, door's own "unbuilt and why" pane) has no counterpart here.
The regression wargame 19 identified — checkpoint presented as "just
another traffic rung," the exact condition root's own code comment says it
already fixed once — is still live in `/app`. No new work has landed on
this component since wargame 19; it remains the correctly-sequenced next
move, scoped as its own build pass, not bundled into further one-line
`practice.json` edits.

## 6. Summary table

| # | Finding | Status | Severity | Notes |
|---|---|---|---|---|
| — | Level 2 3-beat spike fix | SHIPPED, verified both sides, holds up under fresh review | — | Also activates one full divergence hop (curt direction, ci:3→ci:2→ci:7) that was previously unreachable — bonus, not a defect |
| — | PRX_VAR[7] hostile gap | STILL OPEN, reconfirmed against `index.html:4471-4474` | MEDIUM | Content-only; now load-bearing on 2 divergence hops instead of 1 |
| — | `/app` flat list vs. root's 3-tab hub | STILL OPEN, reconfirmed against current `PracticeLevelSelect.tsx` | MEDIUM-HIGH | No work landed since wargame 19; correctly sequenced as next, separate build pass |
| NEW | Level 2 best-time continuity for returning players | Not a bug, minor UX note | LOW | Deck got longer; old best times will look artificially unbeaten. No fix needed now. |

Net: the shipped fix is sound and, on close reading, quietly better than the
one-line diff implies — it turns on a previously-dead branch of the
divergence system. Nothing here blocks anything. The two items already
flagged as open in wargame 19 are still open and still correctly sequenced
behind nothing; the hub rebuild remains the next real build task.
