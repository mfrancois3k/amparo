# Amparo blind-spot audit — EDITION bump hygiene, the restored lines' reach, and the content-verifier's actual coverage (v2.21.7)

**Agent C of `/amparo-loop honesty-fixes-and-restores`. Lens: principal engineer.**
Territory: performance, service worker, analytics honesty, error handling, data
integrity.

**Not repeated here.** Everything in the three prior 2026-08-13 audits (offline
chip, cron pipe, hub focus, print banner, Georgia partial-check badge,
`/app` ErrorBoundary, root/`app` best-score divergence, `PRX_LEVELS` consumer
sweep, dead `.rate`, `--verify` trigger gap) or the HANDOFF's already-known list
(zero attorneys, `k30`/`k33`, `/app` promotion decision, L2's good-leg no-op,
47-assertions-zero-behavioural). Not restated as new.

**Methodology.** Every finding below was executed or read at source. I ran the
real extractor, the full four-suite check, and `npm run build` fresh this
session — including one deliberate corruption test (swapping two ids in
`PRX_VAR`, restored immediately after) to see whether the pipeline that is
supposed to gate content actually catches an id-placement mistake. Confirmed
`git status` clean on `index.html`/`app-src/src/content`/`app/` before and
after. All quoted line numbers read from the working tree at commit `031d70e`.

---

## 1. MEDIUM — root self-heals a wrong/typo'd `PRX_VAR` id at runtime by recomputing it from array position; `/app`'s port trusts the literal id verbatim, with no equivalent recompute step and no test that would catch a mismatch

**Verdict: CONFIRMED by reading both implementations and empirically corrupting the data.**

Root never actually trusts the `id:'v0_4'` string literals written in the
`PRX_VAR` source. Immediately after the literal is declared, `index.html:4792`
overwrites every one of them positionally:

```js
Object.keys(PRX_VAR).forEach(b=>PRX_VAR[b].forEach((v,i)=>v.id='v'+b+'_'+i));
```

The comment directly above it (`:4790-4791`) states why: *"Stable clip ids:
v<beat>_<index> / c<index> — must match the generated audio filenames in
/audio/<lang>/<gender>/."* Root's audio player then keys off that recomputed
value, never the hand-typed one (`index.html:4973`):

```js
const a=new Audio(`audio/${useEs?'es':'en'}/${prxGender}/${d.id}.mp3`);
```

So in root, whatever string a human typed in the literal is cosmetic — the
*position* in the array is what actually determines which audio file plays.
A typo, a copy-paste id collision, or (the scenario the task named) restoring
a line under the wrong id would have **zero effect on root's behaviour**.

`/app`'s port never received this step. `practiceEngine.ts:58` casts the
extracted JSON straight through (`const PRX_VAR = PRX_VAR_RAW as unknown as
Record<number, Variant[]>`), and both places that build a beat (`:151`, `:183`)
copy `id: v.id` — the literal, unrecomputed value — straight from the extracted
data. `usePracticeAudio.ts:132` then builds the same kind of URL from it:
`` `/audio/${useEs?'es':'en'}/${gender}/${beat.id}.mp3` ``. Grepped
`app-src/src` for any resolver equivalent to the one `STATES` got (`content/
statesResolved.ts` exists precisely for this class of "extractor missed a
runtime-computed value" problem, per the extractor's own comment at
`extract-app-content.mjs:171-181`) — none exists for `PRX_VAR`. This exact
gap-class was closed once, for a different bank, and not for this one.

**Proven, not just read.** Swapped the ids on the two newly-restored `ci:0`
entries in a scratch edit (`v0_4`↔`v0_5`), then ran the real pipeline:

```
node tools/extract-app-content.mjs        -> wrote content/, no error
node tools/extract-app-content.mjs --verify -> PASS — content matches index.html
npx tsx tools/practice-engine-check.mts   -> practice-engine-check: PASS (21 checks)
```

All three passed cleanly with the ids swapped. Restored the file immediately
after (`git status --short index.html app-src/src/content` clean before and
after — nothing left dirty).

**Is this live today? No — checked directly, not assumed.** Wrote a one-off
script that re-extracts the current `PRX_VAR` literal and compares every
entry's literal `id` against its recomputed `'v'+bucket+'_'+index` value:

```
All literal ids match their recomputed position-based id -- no live drift today.
```

So today's five restored lines (and every other entry) happen to be correctly
positioned — no user is getting the wrong audio right now. What is real is the
*mechanism gap*: root has a self-healing safety net for this exact mistake
class, `/app` does not, and nothing in the four check suites would notice if a
future restore or edit put an entry at the wrong array index or typed the
wrong id — `grep` for `.id` in `tools/app-storage-check.mts` and
`tools/sw-routing-check.mjs` turns up nothing relevant either.

**Fix shape (not applied, audit scope only):** port the same one-line
recompute into `practiceEngine.ts` right after `PRX_VAR` is cast, the same
way `statesResolved.ts` exists for `STATES`. Cheapest version: a build-time
or check-time assertion that every `PRX_VAR[b][i].id === 'v'+b+'_'+i`, which
would have failed loudly on the corruption test above instead of passing all
three gates silently.

---

## 2. Directly answers the brief — `extract-app-content.mjs --verify` cannot catch a "restored under the wrong id" mistake, by design, and this is a structural property of the tool, not a bug in it

**Verdict: CONFIRMED, same corruption test as #1.**

Reading the tool's own logic (`tools/extract-app-content.mjs:307-349`) makes
the shape of the gap explicit: `--verify`'s only two guarantees are (a)
`content/*.json` byte-matches a **fresh re-extraction of whatever is
currently in `index.html`** (drift detection between the two files, not
correctness of either), and (b) every extracted string value — `id` fields
included — literally appears somewhere in `index.html` (a JSON-safety/typo
allowlist, not a semantic check). Since `id` values are 4-6 character
alphanumeric tokens like `v0_4`, and the extractor is literally slicing the
same source it checks against, this check can never fail for an id that was
placed under the wrong entry — the wrong string is, tautologically, present
in `index.html`, because that's where it came from.

The empirical test in #1 is the direct answer: the swapped-id `index.html`
passed extraction, `--verify`, and `practice-engine-check.mts` (21/21) with
no failures anywhere. **The extractor's job is fidelity to `index.html`, not
correctness of `index.html`.** No tool in this repo's pipeline checks the
latter for `PRX_VAR`. This is the same shape as finding #1 — read together,
they are one gap (no id/position validation anywhere) with two consequences
(a silent verification hole, and a live behavioural divergence from root).

---

## 3. LOW — nothing in this repo would flag "this commit reintroduces text identical to a prior deletion" for a second look; the only guard against a bad restore is documentation discipline

**Verdict: CONFIRMED by inspecting every hook and workflow that exists.**

`.git/hooks/` contains only the default `*.sample` files — none active
(re-confirmed this session, same as the 2026-08-13 audit found for a
different question). `.github/workflows/` contains exactly one workflow,
`law-watch.yml`, which checks external statute sources and has nothing to do
with `index.html`, `git log`, or diff content. There is no CODEOWNERS file,
no PR template, no branch protection artifact in the repo (commits land
directly on `main`), and no script anywhere that greps incoming diffs against
prior deletions.

**What actually caught these six restores being done correctly** is entirely
process, recorded in the commit messages and HANDOFF rather than enforced by
tooling: explicit git-log lookup of the original authored text (`f205531`),
an explicit "not model-generated" framing, and — for audio — a
`voicebox.transcribe` round-trip compared back against the restored text
before shipping. That process is sound and was followed every time this
session (verified: all six commits' messages name the source commit and the
recovery method). But it depends entirely on whoever does the next restore
remembering to do the same thing; nothing technical would stop a future
restore that skipped the git-log check, or that pasted the right text under
the wrong id (see #1/#2), from landing clean.

**Not calling this higher than LOW deliberately.** At this repo's current
scale (solo operator, direct-to-main, a handful of restores per year) a
technical gate is arguably overhead the honesty-of-record approach already
covers. Naming it because the task asked, not because it's urgent.

**Fix shape, if ever wanted:** a pre-commit or CI script that diffs the
current commit's added lines against `git log -p --all -- index.html` for
near-identical strings reintroduced after a deletion, and prints a reminder
(not a block) to confirm the restore was verbatim. Cheap, and matches the
existing "warn, don't block" posture of `law-watch.mjs`.

---

## 4. Checked and NOT a finding — no stale EDITION literal anywhere in live code after the double bump (`2026-C`→`2026-D`→`2026-E`)

**Verdict: CONFIRMED by grep across every code surface, not just `index.html`.**

- `index.html:2594` — `const EDITION="2026-E"` — current.
- `app-src/src/content/meta.json:2` — `"EDITION": "2026-E"` — current, and
  confirmed it's the mechanically extracted value, not hand-typed (re-ran the
  extractor this session, zero diff).
- Built `app/assets/PrintStep-*.js` — contains the string `EDITION` (the
  identifier, expected — it's imported and used in that chunk) but no literal
  `2026-C`/`2026-D`/`2026-E` string baked in separately; the value flows
  through the import from `meta.json` at build time. `npm run build` this
  session reproduced this chunk byte-for-byte (`git status --short app/`
  empty after).
- `sw.js` — zero references to `EDITION` at all; cache names (`amparo-v3`,
  `app-audio-v1`, etc.) are versioned independently and were never coupled to
  the content edition. No cache-name staleness risk from this bump.
- Every other hit for `2026-C`/`2026-D` in the repo (`notebook/`, `wargames/`,
  `CHANGELOG.md`, `DEPLOYMENT.md`'s one verification note) is a **historical
  record** — a session log, an audit, or a changelog entry describing what
  was true *at the time it was written*, correctly. None of them are read by
  any running code. Read each hit in context before concluding this; none
  needed a fix.

No localStorage migration logic keys off the `EDITION` string either — the
only stored value that interacts with edition at all is `printedEdition`
(compared against the live `EDITION` to raise a "your printed pack may be
stale" banner), which is supposed to hold old values by design.

---

## 5. Checked and NOT a finding — the five restored-but-unreachable lines do not surface anywhere UI-visible; HANDOFF's "not reachable" claim holds under a wider sweep

**Verdict: CONFIRMED — swept every reference, not just `prxBuildDeck`.**

Total references to `PRX_VAR` in the entire codebase: **four in root**
(the declaration, the id-recompute at `:4792`, `prxBuildDeck`'s pool filter at
`:4808`, and `prxDiverge`'s pool filter at `:5330`) and **four in `/app`**
(import, cast, and the same two pool-filter call sites, `practiceEngine.ts:148`
and `:179`). Grepped for any debug view, admin panel, export, "view all
lines," or dump feature anywhere in `index.html` or `app-src/src` — none
exists in this codebase at all, in any module.

Checked the one path HANDOFF's own verification didn't explicitly rule out —
`prxDiverge` (`index.html:5322-5334`, the divergent-turns re-deal). Its table,
`PRX_DIVERGE={1:{g:'calm',b:'curt'},2:{g:'curt',b:'hostile'}}`, only fires for
levels 1 and 2. Level 1's re-deal target is `curt` on both branches — never
`hostile` (the code comment at `:5311` says so explicitly: *"hostile stays
out of L1"*). Level 2's re-deal draws from `next.ci`, which can only be a
value already in level 2's own dealt deck (`ids:[3,2,7]`) — never `0`, `1`,
or `4`, so it cannot reach `v0_4`/`v0_5`/`v1_4`/`v1_5`/`v4_4` regardless of
tone. This confirms the restored lines are unreachable via the divergence
path too, not just the base deal — a case the prior audit's 500-deck
simulation didn't explicitly cover since divergence is a *re-deal*, not an
initial deal.

---

## 6. Checked and NOT a finding — committed `app/` build is current after both restore commits

Ran `npm run build` fresh this session (after the corruption test in #1 was
already reverted) and `git status --short app/`: empty both times. The
committed bundle is byte-identical to a fresh build of the current
`app-src/`, consistent with both restore commits' messages stating "`app/`
rebuilt because the build output is committed."

---

## Summary table

| # | Area | Finding | Verdict | Severity |
|---|------|---------|---------|----------|
| 1 | root ↔ `/app` divergence | Root recomputes every `PRX_VAR` id positionally at runtime (self-healing against a wrong literal); `/app`'s port trusts the literal id verbatim with no equivalent step and no test | CONFIRMED (read + corruption test) | **Medium** |
| 2 | Content verifier | `--verify` cannot and structurally does not detect a "restored under the wrong id" mistake — proven by a real swap that passed all three gates | CONFIRMED (corruption test) | **Low-Medium**, same root cause as #1 |
| 3 | Git/process hygiene | No hook or CI would flag a reintroduced-after-deletion diff; the only guard is commit-message/HANDOFF discipline | CONFIRMED (inspected `.git/hooks`, `.github/workflows`) | **Low** |
| 4 | EDITION bump hygiene | No stale `2026-C`/`2026-D` literal anywhere in live code (root, `/app` source, built bundle, service worker); all historical hits are docs | CONFIRMED (grep sweep + rebuild) | — (not a defect) |
| 5 | Restored-lines reach | No debug/admin/export view exists anywhere; divergence path (not just base deal) confirmed unable to reach any of the 5 restored ids | CONFIRMED (full reference sweep) | — (not a defect) |
| 6 | Build freshness | `app/` byte-identical to a fresh build after both restore commits | CONFIRMED (`npm run build` + `git status`) | — (not a defect) |

---

## Bottom line

No CRITICAL or HIGH. The two real findings (#1/#2) are one gap seen from two
angles: root's `PRX_VAR` has a runtime self-healing step — recompute the id
from array position, don't trust what was typed — that exists specifically
because hand-typed ids tied to audio filenames are exactly the kind of thing
that goes wrong quietly. That step was never ported to `/app`, and the
content-verification pipeline that's supposed to be the safety net for this
class of port (`--verify`) provably cannot catch it, because its entire job
is confirming `index.html` and `content/*.json` agree with each other, never
whether either one is *right*. Proven by actually swapping two ids and
watching all three gates pass. It is not live today — checked, not
assumed, every current id matches its position — but the next restore that
gets an id wrong will ship silently to `/app` while root keeps working fine,
which is exactly the kind of two-implementation drift this project has hit
twice already this week (the best-score compare in the prior audit).

Everything else checked in this pass — the EDITION bump, whether the five
restored lines are reachable anywhere besides the level-gated build path,
whether the committed `app/` build is current — came back clean. The
double EDITION bump was executed cleanly with no orphaned literals anywhere,
and the "not reachable" claim in HANDOFF holds under a sweep that also
checked the divergence re-deal path, not just the initial deal.
