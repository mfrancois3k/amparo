# wargames/19 — Phase 6 module design review (game/level/instructional design lens)

Follow-up to `wargames/17-phase5-complete-modules.md` (module design review of
the shipped `/app` practice port) triggered by `wargames/18-app-parity-report.md`
(Phase 6 parity audit), which found something squarely in this lens: the
practice entry screen `/app` ported is the wrong one. This review reads both,
reads the actual markup on both sides, and answers three things — is the flat
list a real design harm or a wash, does it still stand next to wargame 17's
two open findings, and how should all three be sequenced.

**Scope discipline, unchanged from 03/16/17:** structure and sequencing only.
No officer dialogue, no legal content authored here. `TODO_ATTORNEY` remains
the only placeholder convention, and none is needed — this pass touches no
content banks.

---

## 1. The comparison, read directly

**Root's step-5 hub** (`index.html:3420-3474`) is a 3-tab `role="tablist"`
control (`.ll-seg`, reused from step 3 rather than inventing a second tab
grammar): Traffic ladder / Checkpoint / Door. The traffic tab renders a
`hub-progress` bar counting only the four numbered rungs (`[0,1,2,3]`); the
checkpoint tab renders a context note instead of that bar, because — root's
own comment, verbatim — checkpoint "was reading as just another traffic
level buried at the end of the ladder." The door tab is a third state
entirely: not a level grid, an honest "unbuilt and why" message. Three
different affordances for three different kinds of encounter.

**`/app`'s `PracticeLevelSelect.tsx`** renders one `.prx-list` of
`PRX_LEVEL_IDS` — `[0,1,2,3,4]` (`app-src/src/content/practice.json:252-258`)
— with no grouping, no tabs, no progress bar. Walking that id list against
`practiceEngine.ts`'s `buildDeck()` (level 3 → `PRX_HARD`, level 4 →
`PRX_CHK`) and `PRX_UNSCORED` (`[3,5,6,7]`) gives the actual on-screen order:
traffic level 1, traffic level 2, traffic level 3 (the 2-beat spike), hard
mode / "the swan" (unscored), **then checkpoint, fifth and last**. That is
not a similar problem to the one root solved — it is the *identical* problem,
reproduced tile-for-tile: checkpoint sits at the tail of a list dominated by
traffic-stop content, indistinguishable in presentation from "one more
traffic rung," which is the exact phrase root's own comment used to describe
what it was fixing.

## 2. Is this a real harm, or a wash? — verdict: real, not a wash

Three reasons this isn't defensible as "differently organized, equally
fine":

1. **It's not a fresh design question — it's a regression of a solved one.**
   Root's comment isn't speculative design taste, it's a documented finding
   from actually shipping the flat version and having it misread. `/app`
   re-created the condition that finding described, not a novel arrangement
   that happens to look different.
2. **Checkpoint is a different encounter wearing the same tile.** A fixed
   immigration checkpoint has different rules, different stakes, and
   arguably different audience relevance (documented/undocumented status
   matters at a checkpoint in a way it doesn't at a traffic stop) than any
   of the four traffic rungs. Presenting it identically to "level 5 of 5" in
   a single visual rhythm tells the player it's more of the same thing
   they've been doing, right when the content is asking for a mental
   context switch.
3. **The progress bar quietly misrepresents completion.** Root's
   `hub-progress` bar is scoped to `[0,1,2,3]` — four rungs — on purpose,
   specifically so checkpoint doesn't get counted into "traffic stop
   mastery" progress it isn't part of. `/app` has no progress bar at all
   (per wargame 18 §B4/C6), so this isn't wrong yet, but the moment anyone
   adds one to the flat list without re-splitting checkpoint out first,
   it will need the exact same carve-out root already had to write once.

This is not a wash. It's a confirmed level-design regression with a
paper trail: root tried the flat version, it read wrong, root split it,
and the port undid the split.

## 3. Sequencing — Level 2 spike vs. the hub rebuild vs. PRX_VAR[7]

Three open items now sit on the board:

| Item | Fix shape | Size | Risk | Files touched |
|---|---|---|---|---|
| Level 2 two-beat spike (wargame 16/17, still open) | insert `ci:2` into `PRX_LEVELS[2].ids` | one line | none — reuses an already-reviewed beat | `practice.json` (PRX_LEVELS data) |
| PRX_VAR[7] hostile gap (wargame 17 §2, still open) | author 1-2 hostile variants for `ci:7` | small content addition | needs a content author, not a coder | `PRX_VAR` bank (content, both `index.html` and ported JSON) |
| Flat-list vs. 3-tab hub (this review, confirmed real) | rebuild `PracticeLevelSelect.tsx` as a tabbed hub, add the traffic-only progress bar, give checkpoint its own pane | genuine build task — new component structure, not a data edit | low technical risk, but it's UI surface area, needs its own pass | `PracticeLevelSelect.tsx`, likely a new `PracticeHub` shape, `t.en.json`/`t.es.json` for `hub_*` strings already extracted per wargame 18's i18n note |

**Recommendation: fix the two data-only items first, do the hub rebuild
second, and don't let the hub block either of them.**

Reasoning, in design-lens terms:

- The spike and the hostile-variant gap are **beat-level tuning fixes
  inside a screen that already exists** — they change what happens once a
  player is in a level, not how players find or frame the level. The hub
  problem is **upstream of both**: it's about discovery and framing before
  a single beat plays. Normally upstream-first would be the instinct, but
  upstream-first only wins when the downstream fix is expensive or risky.
  Here it's neither — it's a one-line array edit with a fix that has been
  fully specified and re-confirmed correct across three separate reviews
  (16, 17, this one) and zero new review cycles needed to ship it.
- Shipping the spike fix and the hostile-variant fix now costs nothing
  against the hub work — they touch content data, not `PracticeLevelSelect`
  or any shared component the hub rebuild will also touch. There's no
  merge risk, no reason to sequence them behind a UI rebuild.
- The hub rebuild is real design/build work (new tab state, a second
  progress-bar scope, checkpoint's own pane, the door tab's honest-unbuilt
  message) and deserves to be scoped and reviewed on its own, the way
  wargame 18 already flagged it — not folded into "also insert one array
  element" as if they were the same size of change.
- Net effect of doing it in this order: the two long-open, previously
  reviewed, zero-risk findings finally close (they've been open since
  wargame 16 and 17 respectively — that's two full review cycles of a
  one-line fix sitting unfixed), and the larger structural item gets the
  dedicated build pass it actually needs instead of being rushed to avoid
  looking like the odd one out.

Do **not** invert this and gate the spike/hostile-variant fixes on the hub
rebuild landing first "since we're touching practice anyway" — that's scope
creep dressed as efficiency, and it's exactly the kind of bundling that lets
a one-line fix sit open for a third review cycle.

## 4. Status of wargame 17's two open findings — both still stand

**Level 2 two-beat spike behind the consent gate — STILL OPEN.**
Confirmed again this pass: `PRX_LEVELS[2].ids` (index index 2, the third
traffic rung) is `[3,7]` in both `index.html:4374` and the ported
`practice.json:194-199` (verified byte-identical this pass). No new work has
landed on it since wargame 17. Same one-line fix still recommended:
insert `ci:2` between the exit order and the arrest.

**PRX_VAR[7] has no hostile variant — STILL OPEN.** Not re-verified against
`index.html`'s `PRX_VAR` bank directly this pass (out of scope — this review
is IA/sequencing, not a re-audit of the content bank), but wargame 18 §G7
independently reconfirmed it this same loop ("the confirmed-still-inert L2
hostile leg... content gap, not code, flagged again this loop by the module
design review"), so two independent passes in the same review cycle agree
it's unresolved.

## 5. Summary table

| # | Finding | Status | Severity | Fix shape | Sequencing |
|---|---|---|---|---|---|
| — | Level 2 is a 2-beat spike behind a heavy gate | STILL OPEN, 3rd cycle unfixed | HIGH | one-line `PRX_LEVELS[2].ids` edit | **do first** |
| — | PRX_VAR[7] has no hostile variant | STILL OPEN, reconfirmed independently this cycle | MEDIUM | author 1-2 hostile `ci:7` variants | **do first** (parallel to above, content not code) |
| NEW | `/app` ported the flat scenario list instead of root's 3-tab hub, reproducing the exact "checkpoint reads as just another traffic level" problem root already solved | CONFIRMED real, not a wash | MEDIUM-HIGH (IA regression, not a missing feature) | rebuild `PracticeLevelSelect` as a tabbed hub with a traffic-only progress bar and a dedicated checkpoint pane | **do second**, as its own scoped build pass |

Net: the flat list is a genuine, confirmed level-design regression — root
tried this exact arrangement, wrote down why it didn't work, and fixed it;
`/app` shipped the version that was already fixed. It should be corrected,
but not at the cost of delaying two smaller, fully-specified, already-
reviewed fixes that have been sitting open since wargame 16. Ship the data
fixes now; scope the hub rebuild as its own move.
