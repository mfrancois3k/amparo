# wargames/27 — State directories + print-pack zoom round: nothing new for the practice modules

Round for the standing `/amparo-loop` verification, agent B (game design /
level design / instructional design), run standalone against the current
`HEAD` (`88bf990`, tagged v2.22.8 docs; v2.22.9's docs commit `b9038ef` isn't
in `git log --oneline -5` shown to me but is confirmed present below).

**Scope discipline, unchanged from 03/12/16–26:** structure and sequencing
only. No officer dialogue, no statute text, no legal content authored here.
`TODO_ATTORNEY` (and, for the door module, `TODO_DV_CLINICIAN`) remain the
only placeholders, per `wargames/03`. This round introduces neither.

---

## 0. What this round actually shipped, and why that matters for scope

Base for this pass is `wargames/26`'s `ed71378`. Commits since then, read
directly rather than inferred from messages:

```
0b4bce8 fix: link to states' own county-searchable legal-aid directories
050926e fix: CRLF-safe content verify, stale comment, untracked shortcut click
70cfa0e fix: doc-row text column squeezed to word-breaking width at narrow viewports
19b3a34 feat: tap-to-zoom pack page previews before printing
ed4d23c feat: verified state-specific legal-aid directories for 24 states
+ 4 docs-only commits (version-history/CHANGELOG for v2.22.6-9)
```

Confirmed by diff, not by title:

```
git diff ed71378..HEAD -- index.html app-src/src/engine/practiceEngine.ts
```

Zero matches for any `PRX_` identifier anywhere in that diff.
`practiceEngine.ts` has no changes in the range at all (only `index.html`
appears in the diff stat). What actually moved, by commit:

- `0b4bce8`/`ed4d23c` — Lifelines directory URLs (TX/GA/NY county-search
  links, then 24 more state-specific directories, `BASE_LIFELINES` fallback).
  Screen: Lifelines (`w_lifelines_shortcut` destination), not Practice.
- `19b3a34` — new `packZoomOpen`/`packZoomClose` tap-to-zoom overlay for the
  Print pack's page thumbnails, wired into the shared `OVERLAYS` a11y system.
  Screen: Print pack, not Practice.
- `70cfa0e` — `.docrow`/`.dt` CSS flex/min-width fix for the documents list
  at narrow viewports. Screen: documents list, not Practice.
- `050926e` — build-tool CRLF normalization, a stale CSS comment, an
  untracked-click analytics gap. None of the three touch runtime practice
  code.

**Conclusion stated plainly, as the task brief anticipated: this round has
no new practice-module content to review.** Every shipped change lives in
Lifelines, the Print pack, the documents list, or tooling — all upstream or
orthogonal to the practice engine, none a beat, a level, or a scoring path.

---

## 1. Verification pass anyway — reading current shapes fresh, not trusting old notes

Read `index.html:4660-4880`ish (`PRX_LEVELS`, `PRX_LEVEL_IDS`, `PRX_DOOR_IDS`,
`PRX_UNSCORED`, `PRX_OPT`, `PRX_VAR`, `PRX_CURVE`, `PRX_HARD` and its
`bothGood` options) and the full 415-line `practiceEngine.ts` fresh, with the
module-design lens the brief asked for (beat structure, difficulty curve,
pacing, replayability). Byte-for-byte this matches what `wargames/26` §1
already described — no drift to report, because there was no commit in this
range that could have caused any:

- `PRX_LEVELS` still ships 5 numbered rungs (0-4) plus two gated fixed-deck
  levels (5 "the long wait", 6 "it doesn't stop") and the door module (7,
  separate tab) — 8 arrays total, ids unchanged.
- `PRX_UNSCORED = {3,5,6,7}` (hard mode + both final scenarios + door) —
  unchanged.
- `FINAL_SCENARIOS_ENABLED` and `DOOR_MODULE_ENABLED` are both still `false`
  at `index.html:4663` and the line above it, same load-bearing comments
  citing `wargames/03` §6.5 and `wargames/10` §8.
- `practiceEngine.ts`'s `buildDeck`/`isLocked`/`divergeDeck`/`advance`/
  `back`/`completeRun` are unchanged text (confirmed: zero diff hunks in the
  file across this whole range) — root/`/app` parity holds exactly as
  `wargames/26` §1b verified it.

### 1a. Standing findings from `wargames/25`/`26` are unchanged and still open

Neither open item shipped in this round (confirmed above — no `PRX_*` or
engine files touched):

1. `prxBack()`/`back()` still reverses `prx.miss` on Back
   (`index.html:5485-5506`ish; `practiceEngine.ts:369-398`) —
   `wargames/25` §2.2's position (this launders the counter and should be
   reverted) still stands, unaddressed.
2. The curveball splice still has no guard against double-counting `ci 1`/
   `ci 2` in `prx.miss`.

Not re-litigating either — restating only so this document doesn't read as
silent on them. No new severity, no new evidence.

---

## 2. Priority table (this pass's findings only)

None. This round's four shipped changes (Lifelines directories, print-pack
zoom, doc-row CSS, tooling fixes) do not touch the practice modules, and the
fresh read found no previously-unreported defect in beat structure,
difficulty curve, pacing, or replayability beyond what `wargames/09/10/11/
25/26` already recorded as open.

---

## Open items requiring a human before any of this ships

Unchanged from `wargames/26`'s close-out — none newly introduced this round:

1. `wargames/25`'s `prx.miss` Back-reversal reversal (§2.2 there) is still
   an unshipped recommendation, not yet acted on.
2. `FINAL_SCENARIOS_ENABLED` and `DOOR_MODULE_ENABLED` both remain `false`,
   correctly — the door module additionally needs DV-clinician sign-off,
   not just attorney review, before that flag can move.
3. No `TODO_ATTORNEY` or `TODO_DV_CLINICIAN` items are introduced by this
   document.
