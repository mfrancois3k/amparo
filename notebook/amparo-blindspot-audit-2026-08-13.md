# Amparo blind-spot audit — root's first mid-migration edit (v2.20.2, Level 2 spike fix)

**Scope:** Principal-engineer hostile review of the one-line `index.html:4374`
edit (`PRX_LEVELS[2].ids`: `[3,7]` → `[3,2,7]`) — the FIRST edit to root
`index.html` anywhere in this migration since policy locked it. Focus per the
task brief: (1) does the edit ripple into any other `PRX_LEVELS` consumer
that assumes a fixed beat count or indexes a level's `ids` by hardcoded
position; (2) can the re-extraction step (`extract-app-content.mjs`) go
silently stale if root changes again without a re-run; (3) can root's
`PRX_LEVELS` and `/app`'s `practice.json` drift apart undetected — is
`--verify` wired into CI/a hook, or does it rely on a human remembering.

**Not repeated here** — already found and logged/fixed, see
`notebook/amparo-app-migration-log.md` and the three 2026-08-12 audits:
`practice-engine-check.mts` invocation doc (fixed, now documents `npx tsx`),
PrintPack `dangerouslySetInnerHTML` comment undercount, crisis aria-live gap,
`usePracticeAudio` stale-callback leak, the root sweep vs. `/app` cache-name
collision (`amparo-app-*` falling inside `startsWith('amparo-')`), and `/img`
staleness (now StaleWhileRevalidate). Also not repeated: the migration log's
own entry for this exact fix, which is the starting point for this audit, not
a new finding to restate.

**Methodology:** Grepped every `PRX_LEVELS` reference across `index.html`
(4 hits) and `app-src/src` (5 hits, all inside `practiceEngine.ts` plus its
re-exports) and read each call site directly — not assumed from the
migration log's own claim that "nothing hardcodes a beat count." Ran
`node tools/extract-app-content.mjs --verify`, `npx tsx
tools/practice-engine-check.mts`, `node tools/app-storage-check.mts`, `node
tools/sw-routing-check.mjs`, `tsc -b && vite build` (from `app-src/`) this
session — all re-run fresh, not taken from the migration log's own reported
output. Checked `.github/workflows/`, `.git/hooks/`, and root/`app-src`
`package.json` `scripts` blocks for any automated wiring of `--verify` or the
check scripts.

---

## 1. Checked and NOT a finding — no consumer of `PRX_LEVELS` hardcodes a beat count or a fixed-position index into `.ids`

**Verdict: CONFIRMED — the migration log's claim holds under a full sweep of every call site, not just `prxBuildDeck`.**

Every reference to `PRX_LEVELS` or the array it produces:

| File:line | What it does | Beat-count assumption? |
|---|---|---|
| `index.html:4374` | The data itself | — |
| `index.html:4725` (`prxBuildDeck`) | `L.ids.map(...)` — builds deck by iterating, no fixed length | None |
| `index.html:5428` (`practiceRender`) | `const L=PRX_LEVELS[prLevel]` — only used for `L.ids` iteration downstream (locked-tab thumbnail image swap at 5449, unrelated to count) | None |
| `app-src/…/practiceEngine.ts:56,68,143` | Verbatim-ported `buildDeck` — same `.map` shape | None |

Every "X of Y" / progress-count render in both codebases computes both
numbers from live array lengths (`prDeck.length`, `prRun.length`,
`state.deck.length`, `state.run.length`), never a literal — confirmed at
`index.html:4842,4867,5410,5431,5459-5460,5468,5484,5491,5543,5553-5560,5579,
5588,5626` and the `/app` mirrors `PracticeStep.tsx:58-104`,
`PracticeBeat.tsx:41-133`, `PracticeDebrief.tsx:76-94`. The score-ring
denominator, the "Card {n} of {total}" string, the debrief pip row
(`i<state.deck.length-1`), and the share-card grid all read the array at
render time. A level going from 2 beats to 3 beats needed zero code changes
anywhere outside the one data line — consistent with the migration log's
claim, now verified against the full consumer set rather than just the two
sites the log itself named.

One nuance the log didn't call out: the curveball-insertion path
(`index.html:4745` / `practiceEngine.ts:162`,
`deck.splice(1+(seed%(deck.length-1)),0,...)`) is gated by `prLevel<2`
(0-indexed levels 0 and 1 only — the comment says "Never in L3," using the
1-indexed display name for level index 2). Level 2 was already excluded from
curveball insertion before this edit, for reasons unrelated to beat count, so
the new 3-beat deck never reaches this `deck.length-1` divisor. Not a bug,
but worth naming since it's the one piece of code in the consumer sweep that
does math on deck length in a way that *could* have broken (a `deck.length`
of 1 would make the modulo divide-by-zero) had the gate been different —
flagging as a note for whoever ever changes which levels get curveballs.

---

## 2. LOW — `PRX_LEVELS[*].rate` is dead data in both codebases, discovered doing the required consumer sweep

**Verdict: CONFIRMED by grep — not a regression from this edit, pre-existing on all 5 levels, but surfaced by the ground-rule requirement to check every consumer of `PRX_LEVELS`.**

Each `PRX_LEVELS` entry carries a `rate` field (`0.95`/`1.12`/`1.28`/`1.3`/
`1.0`) alongside `ids`. Grepped both codebases for any read of `.rate` off a
`PRX_LEVELS`/`L` value: zero hits in `index.html` (the only `.rate` in the
file is `u.rate=tn.rate` at line 4908, TTS utterance rate sourced from a
`tones` lookup — unrelated field, same name, different object) and zero
reads in `app-src/src` beyond the TypeScript cast at
`practiceEngine.ts:56` (`{ ids: number[]; rate: number }[]`), which types
the field but nothing ever destructures or uses it. So `rate` has been
inert config in every level's data since before this migration, in both the
source of truth and the extracted copy — not something today's edit
introduced or could have broken, and not itself a regression risk. Named
here only because closing out "does any consumer of `PRX_LEVELS` do
something surprising with a field" is exactly what the task asked for, and
this is the one surprising thing found. No fix suggested — could be a
future per-level pacing knob nobody wired up yet, or leftover from an
earlier design; worth a one-line decision (wire it up or delete it) next
time someone touches level data, not urgent on its own.

---

## 3. MEDIUM — `extract-app-content.mjs --verify` is not wired into CI or a git hook; the root/`practice.json` sync depends entirely on a human remembering to re-run it

**Verdict: CONFIRMED by inspecting the actual CI and hook configuration, not inferred.**

- `.github/workflows/` contains exactly one workflow, `law-watch.yml` — a
  daily cron that checks external statute sources and opens an issue on
  drift. It does not touch `index.html`, `practice.json`, or run
  `extract-app-content.mjs` in any mode.
- `.git/hooks/` contains only the default Git sample hooks (all `.sample`
  suffixed, none active) — confirmed by listing and filtering out
  `*.sample`. No pre-commit, pre-push, or any other active hook exists in
  this repo.
- Root `package.json` does not exist (no scripts at all); `app-src/package.json`'s
  `scripts` block has `dev`, `build`, `lint` — no `verify`, `extract`, or
  `check` script, and `build` (`tsc -b && vite build`) does not invoke
  `extract-app-content.mjs` or any of the three `tools/*check*` scripts.

So the only thing that kept `index.html`'s `PRX_LEVELS[2]` and
`app-src/src/content/practice.json`'s copy in sync for this edit was the
migration log's own account of a human running
`node tools/extract-app-content.mjs` (not even `--verify` — the plain
extraction re-run) immediately after the source edit, and then separately
running `--verify` as a manual confirmation step. Re-ran `--verify` fresh
this session: PASS, 2437 strings, `practice.json` byte-matches
`index.html`'s current content — so nothing is stale *today*. But there is
no mechanism that would catch a future root edit landing without the
matching re-extraction step other than the operator (or an agent) choosing
to run `--verify` again. This is the same class of gap Move 6.1's own
migration-log entry already flagged for `practice-engine-check.mts`'s
invocation instructions (fixed then) — here the risk is one level up: the
check itself works and is correct, it just has no trigger. Given root was
"untouched by policy for the entire migration" until this edit and is now a
live edit surface, this is the first time that gap has real teeth — before
today, root and `practice.json` could not drift because root never changed.

**Fix shape (not applied, audit scope only):** a `pre-commit` git hook (or,
lighter-weight given there's no root `package.json` to hang an npm script
off of, a one-line addition to whatever workflow eventually gates root
deploys) that runs `node tools/extract-app-content.mjs --verify` and fails
the commit/deploy on mismatch would close this without adding process
overhead to the common case (`/app`-only changes never touch `index.html`,
so the hook would be a no-op almost every time it runs).

---

## Summary table

| # | Area | Finding | Verdict | Severity |
|---|------|---------|---------|----------|
| 1 | `PRX_LEVELS` consumer sweep | No consumer (root or `/app`) hardcodes beat count or a fixed-position index into `.ids`; every count render is computed from live array length | CONFIRMED, full sweep | — (not a defect) |
| 2 | `PRX_LEVELS[*].rate` | Dead field, typed but never read, in both codebases, pre-existing on all 5 levels | CONFIRMED (grep) | **Low** |
| 3 | Extraction sync | `extract-app-content.mjs --verify` has no CI or git-hook trigger — sync between root and `practice.json` depends on a human re-running it after every root edit | CONFIRMED (inspected `.github/workflows/`, `.git/hooks/`, both `package.json`s) | **Medium** |

---

## Bottom line

No CRITICAL or HIGH issues. The one-line Level 2 fix itself is clean: a full
sweep of every `PRX_LEVELS` consumer in both `index.html` and `app-src/src`
confirms nothing anywhere assumes a fixed beat count or a fixed position
inside a level's `ids` array, so the edit had zero ripple effect — this was
verified directly against source, not taken on the migration log's word.
Fresh runs of all four verification tools (`extract --verify`,
`practice-engine-check.mts`, `app-storage-check.mts`, `sw-routing-check.mjs`)
plus `tsc -b && vite build` all pass clean this session.

One **Medium**: the sync between root's `PRX_LEVELS` and `/app`'s
`practice.json` — proven correct today — has no automated gate. Root was
locked from mid-migration edits for the entire project until this one, so
this is the first time the gap has been live; now that root is a real edit
surface, a future edit that skips the re-extraction step would go
undetected until someone happens to run `--verify` by hand.

One **Low**, found only because the task asked for a full consumer sweep:
`PRX_LEVELS[*].rate` is inert data in both the source array and the
TypeScript port — typed, carried through extraction, never read anywhere.
Not a risk on its own; worth a decision (wire it up or drop it) next time
someone touches level data.
