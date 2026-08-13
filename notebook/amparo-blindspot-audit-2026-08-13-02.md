# Amparo blind-spot audit — the root best-score edit (v2.21.1), the `.ll-seg` move, and the new build gate

**Scope:** Principal-engineer hostile review of what shipped since this
morning's audit: (a) root's second-ever migration edit,
`index.html:5491-5493`'s `_pb`/`_pbTotal`/`_sameShape` best-score compare, and
whether it survives garbage in a real user's `amparo_prx`; (b) whether root's
and `/app`'s two implementations of that same fix can diverge for ANY input;
(c) whether moving `.ll-seg` from `styles/lifelines.css` to `styles/shell.css`
changed the entry chunk or double-shipped CSS; (d) whether the new
`npm run build` content gate can be bypassed; (e) whether the committed
`app/` build output is actually current with `app-src/` right now.

**Not repeated here** — already found/logged/fixed in the four prior audits
(`2026-08-12`, `-02`, `-03`, `2026-08-13`): the `practice-engine-check.mts`
invocation doc, the PrintPack `dangerouslySetInnerHTML` undercount, the crisis
aria-live gap, the `usePracticeAudio` stale-callback leak, the root sweep vs.
`/app` cache-name collision, `/img` staleness, the `app_prx` quota/cross-tab
gap, the `PRX_LEVELS` consumer sweep, dead `PRX_LEVELS[*].rate`, and this
morning's Medium ("`--verify` has no trigger") — **that one is FIXED and
re-verified below, not restated as open.**

**Methodology:** Read both implementations directly. Differential-tested them
against 17 malformed/edge stored values in Node, side by side, rather than
reasoning about them (script in scratchpad; output reproduced verbatim below).
Ran `npm run build` and `npm run check` fresh this session. Compared built CSS
chunk byte sizes across the `v2.20.2` and `v2.21.x` trees via
`git cat-file -s`. Deliberately corrupted a content JSON and re-ran
`npm run build` to prove the gate actually fails rather than warns.

---

## 1. MEDIUM — `/app`'s `completeRun` **throws** on a non-string stored best where root coerces; there is no ErrorBoundary anywhere in `/app`, so the throw white-screens the app at the exact moment a run completes

**Verdict: CONFIRMED by differential test — this is a real behavioural
divergence between the two implementations that are meant to match.**

Root (`index.html:5491`) wraps the stored value: `parseInt(String(_pb).split('/')[1],10)`.
`/app` (`practiceEngine.ts:297`) does not: `stored ? Number(stored.split('/')[1]) : NaN`.

Differential run (root impl vs. `/app` impl, same inputs):

```
    "2/2"    sc=2 len=3 | root: "2/3"   app: "2/3"
    ""       sc=1 len=3 | root: "1/3"   app: "1/3"
    "3/"     sc=1 len=3 | root: "1/3"   app: "1/3"
    "abc"    sc=1 len=3 | root: "1/3"   app: "1/3"
    0        sc=1 len=3 | root: "1/3"   app: "1/3"
    null     sc=1 len=3 | root: "1/3"   app: "1/3"
DIF 2        sc=1 len=3 | root: "1/3"   app: THROW stored.split is not a function
DIF {"a":1}  sc=1 len=3 | root: "1/3"   app: THROW stored.split is not a function
```

Root handles every one of these — including a raw **number**, which is exactly
the shape an *older* root version's best could plausibly have had given the
`index.html:3470` comment records that this value used to be read with
`parseInt()` and rendered without its denominator. `/app` throws.

Why it matters beyond the type coercion: `/app` reads this from
`readApp<PracticeProgress>('prx', emptyProgress())`
(`PracticeStep.tsx:47`), and `readApp` (`storage.ts:189`) does **zero shape
validation** — it is a bare `JSON.parse` with a fallback only for `null`. The
`PracticeProgress` type is a compile-time fiction over untrusted persisted
data. Contrast `readRootSave`/`readRootDocs` in the same file, which validate
every field they return; `readApp` is the one reader that does not, and it is
the one feeding the engine.

Blast radius: grep for `ErrorBoundary`/`componentDidCatch` across `app-src/src`
returns **zero hits**. React 19 unmounts the entire tree on an uncaught render
error, so this is not "the score doesn't save" — it is a blank white page,
arriving at the emotional peak of the product (the debrief after a practice
run), with the user's run lost. Root, on the same corrupt data, renders fine.

Likelihood is genuinely low — `app_prx` is written only by `/app`, which only
ever writes `` `${score}/${run.length}` `` — so this needs devtools tampering,
a partial/interrupted write, or a future shape change. Called MEDIUM on blast
radius and on the fact that root already defends against it and `/app` was
supposed to match.

**Fix shape (not applied, audit scope only):** mirror root — `String(stored)` —
or, better and one rung up, validate in `readApp`'s practice call site the way
`readRootSave` already validates. An ErrorBoundary around the practice screen
is the separate, larger question this exposes.

---

## 2. LOW — second divergence: `parseInt` vs `Number` on the denominator makes root and `/app` disagree about whether `"2/3x"` is comparable

Same differential run:

```
DIF "2/3x"   sc=1 len=3 | root: "2/3x"  app: "1/3"
```

`parseInt("3x")` is `3` (root: same shape, keep the old best);
`Number("3x")` is `NaN` (`/app`: incomparable, replace). Two apps, same user,
same stored value, different outcome. Only reachable from corrupt data, so LOW
— but it is a divergence in a pair of implementations whose entire stated
purpose is to match, and it is free to close (pick one parser).

---

## 3. LOW — shared latent trap in BOTH implementations: a best with a non-numeric **numerator** and a matching denominator can never be overwritten again

```
    "/3"     sc=1 len=3 | root: "/3"    app: "/3"
    "x/3"    sc=2 len=3 | root: "x/3"   app: "x/3"
```

When the denominator parses and matches, both take the numerator branch:
`sc > parseInt(_pb)` → `parseInt("/3")` is `NaN` → the comparison is `false`
→ the value is never replaced, for that level, forever. Every subsequent
perfect run is silently discarded and the hub keeps rendering the garbage
string.

This is not a regression from the edit — the pre-edit code had the same
`parseInt` comparison — and neither app can *write* such a value. It is a
latent trap, not a live bug. Named because a stuck-forever best is a
particularly bad failure to leave undetectable, and because the same
`Number.isFinite` guard that fixes §1 and §2 closes this too.

---

## 4. LOW — root renders `prx.best[...]` **unescaped** into `innerHTML` at two of its three display sites, while the third escapes it

| Site | Render | Escaped? |
|---|---|---|
| `index.html:3478` (module hub card) | `` `🟩 ${esc(best)}` `` | **Yes** |
| `index.html:5451` (practice level list) | `` `🟩${prx.best[i]}` `` | **No** |
| `index.html:5569` (debrief stats) | `` `${prx.best[prLevel]\|\|…}` `` | **No** |

All three are assigned via `b.innerHTML=`. The value's only source is
`localStorage`, so this is self-XSS — an attacker needs the victim's devtools
or an already-compromised same-origin script, at which point they have won
anyway. Not a real vulnerability, and deliberately **not** called Medium.

It is reported because the sibling line 30 lines away proves the author knew
to escape here, and because a hostile reviewer greps for exactly this: an
unescaped template interpolation of persisted data into `innerHTML`, three
lines apart from an escaped one, in a legal-help app for a vulnerable
population. Two `esc()` calls close it permanently. `/app`'s equivalents
(`PracticeHub.tsx:108`, `PracticeDebrief.tsx:94`) are JSX and auto-escape —
this is a root-only inconsistency.

---

## 5. Checked and NOT a finding — the `.ll-seg` move is an exact byte transfer with no double-shipping

**Verdict: CONFIRMED by measurement, not inspection.**

`.ll-seg` appears in exactly **one** built stylesheet — the entry chunk
`app/assets/index-BVn5jpfI.css` (3 occurrences: base, `button`, `button.on`).
All five lazy chunks: zero. No double-ship.

Chunk sizes across the move (`git cat-file -s`, raw bytes):

| Chunk | v2.20.2 (`9d54368`) | now | Δ |
|---|---|---|---|
| entry `index-*.css` | 4439 | 4876 | **+437** |
| `LifelinesStep-*.css` | 3056 | 2619 | **−437** |

Exactly equal and opposite — the rules moved, they were not copied. Net cost:
**+437 B raw (~+0.13 kB gzip) on the always-loaded entry chunk**, paid by every
visitor including those who never open Lifelines or Practice. That is the real,
measured price of the move, and it is the correct trade: two screens now share
one definition, matching root's own treatment of `.ll-seg` as shared
segmented-control grammar (`index.html:3430`'s comment says so explicitly).
Worth stating precisely rather than hand-waving, since "moved to the entry
chunk" is the kind of change that usually *does* mean double-shipping.

---

## 6. Checked and PARTLY a finding — the build gate is real and not trivially bypassable, but nothing on the **deploy** path ever runs it

**Verdict: this morning's Medium is genuinely FIXED for the case it named.
Proven, not assumed.** Appended a byte to `app-src/src/content/ui.json` and
ran `npm run build`: **exit 1**, and `vite build` never executed (`app/`
untouched). The `&&` chain is correct — a content mismatch stops the build
rather than warning past it. `npm run check` runs all four suites and passes
clean this session (2437 strings, 13 + 12 + 20 assertions).

Remaining exposure, stated precisely so it is not confused with the fixed
finding:

- **`npx vite build` / `npx tsc -b && npx vite build` bypasses it entirely.**
  Unavoidable with an npm-script gate; noted for completeness, not as a defect.
- **The deploy path never runs it.** `DEPLOYMENT.md:153` — "Static site, no
  build step. Serve the repo root." Vercel serves the **committed** `app/`
  directory verbatim. The gate therefore protects the developer's machine, not
  production.
- **Nothing verifies committed `app/` matches `app-src/`.** `--verify` compares
  `index.html` ↔ `content/*.json`. No check compares `app-src/src` ↔ `app/`.
  An operator who edits a component and commits without rebuilding ships the
  old bundle, silently, and every check in the suite still passes.
- **`--verify` covers content strings only, never logic.** Root's best-compare
  edit (v2.21.1) changed root JS, not extracted content, so `--verify` was
  correctly a no-op for it — and correspondingly gave zero coverage of the
  thing that actually changed. `practice-engine-check.mts` tests `/app`'s
  `completeRun` stale-best behaviour (`:156-175`) but **nothing anywhere tests
  root's implementation of the same fix.** That asymmetry is how §1 and §2
  survived into two shipped versions.

**Fix shape:** a `pre-commit`/CI step running `npm run build` and failing on a
dirty `app/` would close the staleness gap; a shared fixture table driving both
root's and `/app`'s compare would close the divergence gap.

---

## 7. Checked and NOT a finding — the committed `app/` build IS current

Ran `npm run build` and then `git status --short app/`: **empty**. The
committed output is byte-identical to a fresh build of the current
`app-src/`, including all content-hashed filenames, `sw.js`, and
`manifest.webmanifest`. Consistent with the git history — `app/` and
`app-src/` last changed in the same commit (`f1af062`, v2.21.0), and v2.21.1
touched only `index.html`. Nothing stale is deployed today.

---

## 8. Note — three of `storage.ts`'s four root readers have no production callers

`readRootPractice`, `readRootDocs`, and `readRootPrefs` are referenced only by
`tools/app-storage-check.mts`. Only `readRootSave`/`rootSaveExists` are used in
`/app` (by `i18n.ts`, for language resolution). Consequence: a returning root
user opening `/app` sees an **empty** practice hub — zero streak, zero bests —
even though root holds their history. That is deliberate and documented
(`storage.ts:1-19`: "State therefore diverges between the two apps during beta;
that is accepted, and unifying it is promotion-scope work"), so it is not a
defect. Named only because §1's severity depends on it: `/app`'s `best` values
today can only have been written by `/app` itself, which is precisely why the
non-string crash is MEDIUM rather than HIGH.

---

## Summary table

| # | Area | Finding | Verdict | Severity |
|---|------|---------|---------|----------|
| 1 | root ↔ `/app` divergence | `/app`'s `completeRun` throws on a non-string stored best where root coerces via `String()`; `readApp` does no shape validation; no ErrorBoundary exists, so the throw white-screens the debrief | CONFIRMED (differential test) | **Medium** |
| 2 | root ↔ `/app` divergence | `parseInt` (root) vs `Number` (`/app`) on the denominator disagree on `"2/3x"` | CONFIRMED (differential test) | **Low** |
| 3 | Both impls | A best with a non-numeric numerator and matching denominator (`"/3"`, `"x/3"`) can never be overwritten — permanently stuck | CONFIRMED (differential test) | **Low** |
| 4 | root XSS hygiene | `prx.best` interpolated unescaped into `innerHTML` at `:5451` and `:5569`; escaped at `:3478` | CONFIRMED (read) | **Low** (self-XSS only) |
| 5 | `.ll-seg` move | Exact byte transfer (+437 entry / −437 lifelines), appears in one built chunk, no double-ship | CONFIRMED (byte sizes) | — |
| 6 | Build gate | Gate genuinely fails the build on drift (exit 1, proven); but deploy never runs it, nothing checks `app/` freshness, and root's own logic has no test | CONFIRMED (perturbation test + `DEPLOYMENT.md`) | **Low–Medium** |
| 7 | Committed build | `app/` is byte-identical to a fresh build — nothing stale deployed | CONFIRMED (`git status` after build) | — |
| 8 | `storage.ts` root readers | Three of four have no production callers; `/app` shows returning root users an empty hub — documented and intended | CONFIRMED (grep) | — (note) |

---

## Bottom line

No CRITICAL or HIGH. The root edit itself is the **more robust** of the two
implementations: `String(_pb)` absorbs every garbage value thrown at it —
`""`, `"3/"`, `"abc"`, `null`, `0`, and a raw number from a hypothetical older
version. Root reads real users' `amparo_prx` and it holds.

The blind spot is the other direction. The two implementations were shipped as
matching and they do not match: on a non-string stored best, root coerces and
`/app` throws — into a React tree with no ErrorBoundary, at the debrief screen,
after a completed run. Low likelihood, bad landing. A second, narrower
divergence (`parseInt` vs `Number`) and one shared latent trap (non-numeric
numerator locks the best forever) come from the same root cause: the compare
was ported by eye, twice, with a test on only one side.

This morning's Medium is properly closed — the gate fails the build, verified
by deliberately breaking it, not by reading the script. What replaces it is
smaller and more specific: the gate never runs on the path that actually
deploys, nothing proves committed `app/` matches `app-src/` (it does today,
verified byte-for-byte), and `--verify` covers content only — so root's JS,
now a live edit surface for the second time, still has no automated check of
any kind behind it.

The `.ll-seg` move is clean: 437 bytes moved out of a lazy chunk and into the
entry chunk, measured, with no copy left behind.
