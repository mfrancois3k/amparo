# Focus group 27 — the Arena stops needing bars, and the word "checked" gets a receipt it doesn't show anyone

**Standalone run, 2026-09-04.** Follows `amparo-focus-group-24-accounts-payments-feedback.md`
(FG24), `amparo-focus-group-25-apple-design-polish.md` (FG25) and
`amparo-focus-group-26-grand-audit.md` (FG26). None is re-litigated. FG26's five goldens
(HUD reachability, the two "your state" variables, `href="../"` exits, paid-artifact
overpromising, small trust breaks on the pay screen) are not re-counted — this file checks
only what changed since, and touches FG26 territory only where today's commit actually
touches it. One FG26 finding is explicitly **closed** and noted, not repeated: its missing-
feature #13, "Arena state lines offline," is fixed today (§0).

**Build under test.** `main` @ `c0b6311` (2026-09-04, *"feat(arena): work fully offline;
feat(law-watch): honest coverage pipeline"*), working tree clean (`git status --short` = 0
lines). This sits on top of `e1198537` (2026-09-03, FG26's own fix commit, which built the
Arena's full-screen panic view, `#panicView`, in the first place) and `1a46f8d` (2026-09-02).
Two features, evaluated fresh: **Arena offline** (`arena/index.html`, `sw.js`,
`tools/build-jurisdictions.mjs`) and **law-watch coverage honesty**
(`research/law-sources.json`, `research/law-watch-gaps.md`, `tools/law-sources.mjs`,
`tools/lib/lawSources.mjs`). Attorney/lawyer review is excluded as a finding, per standing
instruction.

**Method.** Direct read/grep only, no live browser (FG19–26 precedent); one exception —
`node -e` one-liners were run directly against the committed `data/hud.json` to independently
recompute cite counts rather than trust any prose claim about them (§7). Read in full or by
targeted grep: `arena/index.html` (state panel, `#panicView`, the inline-splice block and its
surrounding IIFE, lines ~2160–2296), `sw.js` (all 129 lines), `tools/build-jurisdictions.mjs`
(splice markers), `tools/build-jurisdictions.test.mts`, `tools/sw-routing-check.mjs`,
`tools/law-sources.mjs`, `tools/lib/lawSources.mjs`, `tools/law-sources.test.mts`,
`research/law-sources.json`, `research/law-watch.json`, `research/law-watch-gaps.md`,
`.github/workflows/law-watch.yml`, `.github/workflows/tests.yml`, `package.json`,
`CHANGELOG.md`'s v2.29.0 entry, `data/hud.json` (queried with Node), `new/index.html` (grep
only).

**Seating (ten of thirteen in `.focus-group/members.md`).** Spanish-first → Rosa (GA);
DACA/prepaid, offline is his whole objection from FG26 → Luis (TX); parent/buyer → Dana (TX);
retiree, distrusts unearned confidence → Tony (GA); federal-only-state honesty → Ana (AZ);
precision-in-Spanish, "reads as written" → Marisol (NY); non-driver, enters sideways → Wes
(Brooklyn); rideshare, thirty seconds → Keisha (Atlanta); PTSD, wants the non-simulated route
→ Nia (NY); the actual practicing teen → Devin (TX). **Not seated this round:** Marcus, Ray,
Omar — today's diff doesn't touch their FG26 territory (budget/voice-data, firearm content,
screen-reader ARIA) closely enough to earn a fresh seat; none of their FG26 findings are
re-litigated here either.

---

## 0. What actually changed, verified — including one FG26 gap now closed

| Claim | Verified | Where |
|---|---|---|
| Compiled HUD bank is spliced inline into `arena/index.html` at build time between markers | TRUE — `AMPARO_HUD_INLINE:START`/`:END` wrap a single generated line assigning `window.__AMPARO_HUD__` (180,086 characters on that one line) | `arena/index.html:2169-2171`; markers defined in `tools/build-jurisdictions.mjs:177-178` |
| Inline copy renders before any network call; live fetch runs after as background refresh | TRUE — `if(window.__AMPARO_HUD__&&...){HUD=window.__AMPARO_HUD__;}` then `if(HUD) boot();` runs synchronously; `fetch(HUD_URL)` follows and only then re-runs `boot()` if it resolves | `arena/index.html:2186-2188`, `:2289-2293` |
| `?panic=1` opens the full-screen view with zero network if the inline copy loaded | TRUE — `if(!noInline&&...panic==='1') openPanic()` fires independent of the fetch | `arena/index.html:2294` |
| `sw.js` gives `/arena/` and `/rehearse` their own offline cache key, separate from the pack's | TRUE — `ARENA_CORE='./arena-offline'` vs `CORE='./'`; `isArenaPage` matches `/arena`, `/arena/*`, `/rehearse`, `/rehearse/` and writes/reads `ARENA_CORE` on the navigate branch | `sw.js:6,12,64-75,90-97` |
| Before today, `/rehearse` fell through to the generic branch and would silently serve the **pack's** cached page offline | TRUE, by the code's own account — the generic branch only special-cases `isPack` for writes, and would have `caches.match(CORE)` on failure for any other path including the old `/rehearse` | `sw.js:99-113`, comment at `:64-71` |
| Arena audio/fonts are now cache-first | TRUE — `isAsset` now includes `/arena/audio/` and `/arena/fonts/` | `sw.js:81-84` |
| `/app` (the React build) is untouched by any of this | TRUE — same early-return guard as before, unchanged this commit | `sw.js:56-62`; `git show --stat c0b6311` touches no `app-src/` file |
| Inline splice is tested to round-trip and fail loud on a missing marker | TRUE — three `node:test` cases: splice-and-match, idempotent re-splice, throws `/markers not found/` on a bad template | `tools/build-jurisdictions.test.mts:98,108,115` |
| A fetch-event harness asserts `/rehearse` never writes `CORE` and `/pack` still does | TRUE | `tools/sw-routing-check.mjs:131,137` |
| `data/hud.json` cites 184 distinct statute sections; 0 have a verified re-check source | TRUE, independently recomputed (§7), not just quoted | `research/law-watch-gaps.md:3-4`; Node count in §7 |
| The pre-existing daily watch (4 sources) is a different, older citation surface, untouched by the new tool | TRUE | `research/law-sources.json:9-11`; `tools/law-sources.mjs:29-40` (`sync()` never rewrites an existing id) |
| The daily workflow now runs the new `--sync`/`--gaps` pair and commits the result | TRUE | `.github/workflows/law-watch.yml:53-56,62` |
| **FG26 missing-feature #13, "Arena state lines offline," closed** | Confirmed — see rows above | (FG26 §4; not re-counted as new here) |

---

## 1. Ten persona reactions

### 🧑 Rosa, 44 — GA, Spanish-first, house cleaner, son 17 drives

*Pantalla completa* now opens instantly, in Spanish, with the safety line first and no bars
needed — this is the exact black screen my son would open, and it no longer waits on a
connection (`arena/index.html:2169-2171` inline copy, `:2265` safety line, `spFull`/`spPick`
strings at `:842`). Where I stop: Georgia's own *"documents"* line — the one about handing
over papers — carries no citation at all (`data/hud.json` GA entry, `documents` cite is
`null`), and the one Georgia statute this product has actually watched every day for months,
O.C.G.A. §40-5-29 (`research/law-watch.json:44-48`), matches none of the five lines Georgia
does cite today (firearm, recording, sign, unmarked, footage). Whatever *"(Statute Law)"*
next to GEORGIA means, it isn't "we are watching what you just read."

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data

FG26 told me the only offline safety screen was inside `/app`, a place nothing ever links to.
Now *my* door — `/rehearse`, the page I can actually reach — works with no bars: its own cache
key (`ARENA_CORE`, `sw.js:12`), its own audio and fonts cached first (`sw.js:81-84`), the
panel painting from the inline copy before the network call even starts
(`arena/index.html:2186-2188`). That is the fix I asked for, verified in the code, not just
promised. Where I stop: "checked against the statute text" (`tools/jurisdictions/hud.mjs:66`)
is on every state. Texas's own `documents` cite in that bank reads `"Transp. Code §521.025"`
— the one statute anyone has actually been watching daily reads `"Tex. Transp. Code
§521.025"` (`research/law-watch.json:15-21`). One word apart, and the code that would match
them compares exact strings (`tools/lib/lawSources.mjs:37`). Close doesn't count on a
machine that uses `===`.

### 🧑 Dana, 52 — TX suburb, the parent who would actually pay

Garage door down, phone on one bar, is my actual test — and the CHANGELOG says this was
verified exactly that way: a full offline reload of `/arena/?state=FL`, zero network
activity. Good, and specific. Where I stop: the one automated check built to catch a
*regression* of this — `tools/sw-routing-check.mjs`, the harness that proves `/rehearse`
never overwrites the pack's cache — is in neither `npm test` (`package.json`'s test script
globs only `*.test.mts` files, and this is a plain `.mjs`) nor the CI workflow that runs on
every push (`.github/workflows/tests.yml`, grep for `sw-routing` = 0). "Flaky" was my word in
FG24. A fix that nothing re-checks automatically is one refactor away from quietly being
flaky again, and nobody would see red.

### 🧑 Tony, 61 — GA, retired postal worker

Credit due: for the first time the product wrote down its own limit instead of just asserting
confidence. `research/law-watch-gaps.md` says it plainly — 0 of 184. That is the honest
sentence I have been asking this product to say about itself since focus group one. Where I
stop: none of that honesty reached the screen. The words a driver actually reads —
*"checked against the statute text, not yet reviewed by a [State]-licensed attorney"*
(`hud.mjs:66`, 51 times over in `data/hud.json`) and *"(Checked)"* in the sidebar
(`arena/index.html:2207`) — read exactly the same today as they did yesterday. The receipt
is in the repository. The customer still just gets the word "Checked."

### 🧑 Ana, 31 — Phoenix AZ, US citizen, mixed-status household

Arizona is one of the good ones — eight lines, seven cited, per FG26 — and now carries
*"(Checked)"* in the sidebar (`arena/index.html:2207`; Arizona's FIPS isn't in
`CITED=['36','48','13']`, so it gets "Checked," not "Statute Law"). Today's own gap report
lists all six of Arizona's cited sections — `13-3005(A)(2)`, `13-3102(A)(1)(b)`,
`28-1595(B)`, `28-622.01`, `A.R.S. §13-2412`, `A.R.S. §28-1595(C)` — as unwatched
(`research/law-watch-gaps.md`, `## AZ`). "Checked" turns out to mean checked once, by a
person, this summer — not checked today, or ever again automatically. I came to see whether
Arizona was framed honestly; the content is, and the label isn't.

### 🧑 Marisol, 29 — NY, green-card holder, night shifts

Precision is my whole complaint about this product, so I noticed this fast: the one New York
statute the daily job has watched for months is N.Y. Veh. & Traf. Law §1194, *"chemical-test
refusal consequences"* (`research/law-watch.json:33-39`) — and not one of New York's nine
current HUD lines (`safety, silence, documents, passenger, sign, search, firearm, recording,
unmarked`, per `data/hud.json`) is about chemical-test refusal at all. Whatever that daily
green checkmark has been protecting for New York, it is not anything I currently read on this
product.

### 🧑 Wes, 38 — Brooklyn, does not drive, enters sideways

I would never notice this shipped, and that is exactly how I find everything on this site.
Nothing on the page says "this now works with no signal" — grep for "offline" in
`arena/index.html`'s actual visible copy is zero; every hit is a code comment
(`:2134,:2169,:2186`). The install-prompt assets precache the same quiet way they did before
(`sw.js:16-22`). A feature built for the exact moment someone has no bars is invisible to
someone who has bars right now and is just poking around, which is the only way I ever look
at anything here.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, thirty seconds between fares

This is close to my actual moment — a parking deck, one bar, the fare clock running. The
full-screen view paints off the inline copy with zero network before the live fetch even
starts (`arena/index.html:2186-2188,:2294`), and the safety line — pull over, hazards, hands
visible — comes first (`T('spSafety')` at `:2265`), before any legal text. That is the right
order for someone in my seat. Where I stop: "verified live" in the CHANGELOG names Chrome
DevTools' offline emulation. My phone is not a DevTools throttle profile — it is an actual
old Android with an actual flaky tower connection. Nobody has confirmed this against that.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD

This is the non-simulated route I asked for two focus groups ago, actually built: a real
dialog (`role="dialog" aria-modal="true" aria-labelledby="pvTitle"`, `arena/index.html:2167`),
a safety line before any legal content, Escape closes it, focus returns to the button that
opened it (`:2272-2273`). I can now reach it directly, offline, from a bookmarked
`?panic=1` link, without touching a drill (`:2294` fires independent of any game state).
Where I'd still flinch: that link loads the ordinary Practice Arena page underneath first —
`#panicView` is `display:none` until a script at the very bottom of the page adds `.on`
(`:412-413`), and that script sits after a 180,000-character inline data block the browser
has to parse first (`:2170`). However many milliseconds that takes on a slow device is time
the page I came here specifically not to see is the one actually on screen.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user

Phone on airplane mode in my room, `/rehearse` still loads, my state's lines are just there —
that's the whole ask and it works now. I would read the sidebar word *"(Checked)"* as
"done," full stop — that is what a sixteen-year-old does with that word — and the product's
own new file this week says plainly that it isn't.

**Tally.** Genuine relief from all ten on the offline mechanics themselves — verified, not
just claimed, in every case above. Every single one of the ten also lands on some version of
the same second thing: the word "checked"/"Checked" now has a receipt proving it means less
than it sounds like, and none of that receipt reaches the screen.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. "Checked" now has a documented, honest exception list — and the product still says the same six words it said before that list existed

**Evidence.** Every one of 51 states in `data/hud.json` carries the sentence *"checked
against the statute text, not yet reviewed by a [State]-licensed attorney"*
(`tools/jurisdictions/hud.mjs:66`; confirmed present 51 times, `data/hud.json:107` through
`:4677`). The Arena sidebar shortens this to *"(Checked)"* for 48 of those states
(`arena/index.html:2207`, `CITED=['36','48','13']` at `:1277` carves out only NY/TX/GA as
*"(Statute Law)"*). As of today, `research/law-watch-gaps.md` states outright: 0 of 184
distinct cited sections have a verified, monitored source (line 3-4; independently
recomputed, §7). The only 4 sources under any daily watch (`research/law-watch.json`) belong
to an older, separate citation surface and — checked directly against what's on screen today
— don't reliably describe it: Georgia's watched cite (`O.C.G.A. §40-5-29`) matches none of
Georgia's five currently-cited lines; New York's watched cite (chemical-test refusal) is
off-topic for all nine of New York's current lines; Texas's watched cite differs from the
displayed one by exactly the word *"Tex."* No UI string anywhere references
`research/law-watch-gaps.md`, links to it, or hints that "checked" has a scope (grep for
`law-watch|law-sources` in `how-we-verify/`, `como-verificamos/` = 0).

**Impact.** Every persona's second reaction this round is a version of this. It is also the
single biggest gap between what the repository now honestly knows and what a driver at the
roadside is told.

**Cheapest fix that holds.** Don't change the legal claim — change the label's honesty to
match the file that already exists. Where `hud.mjs:66` builds the notice string, append a
coverage clause sourced from `renderGapsMarkdown`'s own counts (e.g. *"1 of 6 cited sections
here has an active monitor"* — real per-state numbers already computable from
`tools/lib/lawSources.mjs:hudCites()`); on the Arena sidebar, make *"(Checked)"* a link (or a
tap target) to a one-paragraph, plain-English version of the gap report, not the raw
markdown. This is a copy change plus one new small render function — no new research
required to ship it honestly today.

### 2. The one automated check that would catch a regression of today's headline fix runs in neither `npm test` nor CI

**Evidence.** `tools/sw-routing-check.mjs` is the harness that proves `/rehearse` writes to
`ARENA_CORE` and never to `CORE`, and that `/pack` still writes to `CORE`
(`:131,:137`) — exactly the "wrong app served offline" bug this release fixes. `package.json`'s
`"test"` script is `node --test tools/jurisdictions/*.test.mts tools/lib/*.test.mts
tools/*.test.mts app-src/convex/lib/*.test.mts app-src/src/**/*.test.mts` — a `.mts` glob only;
`sw-routing-check.mjs` is a plain `.mjs` and does not match. `.github/workflows/tests.yml`
(runs on every push and PR) executes `npm test`, two guard scripts
(`test-fulfilment.mjs`, `test-arena-deeplink.mjs`), and `build-jurisdictions.mjs --check` —
grep for `sw-routing` across that file returns 0. The only place it is actually invoked is
`app-src/package.json`'s own `check` script, run by hand, in a different package, on a
different cadence than the "Tests 88... guards 29/29, 16/16, sw-routing 22/22" tally the
CHANGELOG and commit message both report.

**Impact.** The exact regression this release exists to prevent — an offline `/rehearse`
silently serving the pack instead of the Arena — has zero standing protection going forward.
A future edit to `sw.js`'s branch logic could reintroduce it, and both `npm test` locally and
the CI workflow on the PR would stay green.

**Cheapest fix that holds.** One line in `.github/workflows/tests.yml`'s existing "unit
suites" step (or its own step, next to the other guard scripts already there):
`node tools/sw-routing-check.mjs`. It already exits non-zero on failure
(`:162-163` reports `PASS`/`FAILED` and the script's own convention elsewhere in this repo is
to set an exit code on failure) — wiring it in is a one-line CI change, not new test-writing.

### 3. Two Panic HUD implementations now exist, and only the one nobody built for reachability got today's offline work

**Evidence.** `app-src/src/components/panicHud/*` (React, its own Workbox service worker,
per FG26 still labeled *"Preview build"*) is untouched by this commit — confirmed via
`git show --stat c0b6311`, which names no file under `app-src/`. It remains unreachable from
any live page: grep for `href="/app`, `amparohq.com/app`, or the literal string `panic=1`
across every `.html`/`.xml`/`.json` file outside `app/`, `app-src/`, `node_modules/` returns
**0**, same as FG26 found. The *other* implementation — `arena/index.html`'s own `#panicView`
(vanilla JS, built yesterday by FG26's fix commit, `e1198537`) — is the one that got today's
offline work, is reachable via `/arena/` and `/rehearse`, and already has better dialog
semantics (`role="dialog" aria-modal="true"`, focus management, `:2167,:2272-2273`) than the
Arena's own completion modal (still a bare `div.modalBg`, per FG26 golden #5, unchanged
today). Nothing shares code between the two; nothing links one to the other.

**Impact.** Every dollar and hour spent hardening `/app`'s HUD for offline use, before today,
bought nothing a real visitor can reach. Today's investment went entirely into the surface
that was already reachable, which is the right call — but it means the product now has two
independently-maintained versions of its most safety-critical screen, diverging further with
every release, with no written decision about which one is canonical.

**Cheapest fix that holds.** Write the decision down once (`docs/engine/PLAN.md`): either
retire `app-src`'s `PanicHud` in favor of the Arena's (now offline, now reachable, now more
accessible) version, or make the Arena's `#panicView` a thin link into `/app/?panic=1&state=`
once `/app` itself is reachable. Building a third safety screen before choosing between the
first two is the failure mode to avoid.

### 4. The old 4-source watch and the new 184-cite ledger already speak two dialects of the same citations — so populating the sidecar today would not close today's own gap report

**Evidence.** `tools/lib/lawSources.mjs:37` matches `sidecar[cite]` by exact string equality.
Texas's `documents` line in `data/hud.json` carries the cite `"Transp. Code §521.025"`; the
pre-existing, already-hand-verified source for the same statute in `research/law-watch.json`
is spelled `"Tex. Transp. Code §521.025"` (`:17`). Georgia's watched cite
(`O.C.G.A. §40-5-29`) has no counterpart at all among Georgia's currently-cited lines (its
`documents` line carries no cite). New York's watched cite is off-topic for all nine of New
York's current lines. If someone spent an afternoon copying all 4 existing verified URLs into
`research/law-sources.json` today, in the old system's own spelling, `matchedSources()` would
still recognize **zero** of them against `data/hud.json`, because the strings don't match and
in Georgia's and New York's cases the underlying statute isn't even the same one currently
displayed.

**Impact.** This is a second-order version of golden #1: even the fastest, cheapest possible
first step toward real coverage — reusing verified work the team already did — silently
fails today, for reasons a contributor would only discover by reading both files side by
side, which is what this section just did.

**Cheapest fix that holds.** A single shared normalizer (strip state-name prefixes, section
symbols, and whitespace to a canonical key) used by both `hudCites()` and any future sidecar
lookup, so `"Tex. Transp. Code §521.025"` and `"Transp. Code §521.025"` resolve to the same
key. Separately — and this doesn't need code — re-derive or retire the 4 existing entries
against what `data/hud.json` currently cites for those states, since two of the four
currently point at content the product no longer shows.

### 5. The test that keeps the gap report honest works by silently rewriting the real file it's checking, before it reports failure

**Evidence.** `tools/law-sources.test.mts:64-68` reads the committed
`research/law-watch-gaps.md` from disk into `before`, then calls the real `gaps()` function
with **no fixture root** — meaning it runs against the actual project's `data/hud.json` and
`research/law-sources.json`, and (per `gaps()`'s own unconditional `writeFile`,
`tools/law-sources.mjs:47`) overwrites the real `research/law-watch-gaps.md` on disk, and only
*then* asserts `before === rendered`. This is wired into `npm test`
(`package.json`'s glob matches `tools/*.test.mts`) and does genuinely fail when the two
differ — the CHANGELOG's claim that "`npm test` fails if the committed gap report drifts" is
true. But a contributor who edits `research/state-matrix.md`, forgets to run
`node tools/law-sources.mjs --gaps`, and then runs `npm test` gets: a failing test, and a
working tree where `git diff` already shows the fix applied, because the test itself just
wrote it.

**Impact.** Smallest of the five, and not user-facing — but it is exactly the kind of subtle
process gap a project built around "don't claim more than you've verified" ought not to have
in its own verification tooling. A confused contributor force-passing a red suite by
re-running it, without understanding why, is a plausible failure mode.

**Cheapest fix that holds.** Have this one test run against a temp-directory copy of the real
files (same `mkdtemp` pattern the other two tests in the same file already use), so a failure
leaves the repository exactly as the contributor left it, for them to fix deliberately.

---

## 3. What must change in the practice modules / Arena flow next (structure, not officer dialogue)

1. **One canonical Panic HUD, decided in writing.** Golden #3: either fold `app-src`'s React
   HUD into the Arena's now-offline, now-reachable, now more-accessible `#panicView`, or wire
   a link between them. Do not add a third capability to either until this is decided.
2. **`sw-routing-check.mjs` into the automated gate.** Golden #2: one line in
   `.github/workflows/tests.yml`, next to the other guard scripts already invoked there.
3. **A shared cite-normalizer between the two citation surfaces.** Golden #4: one function
   used by both `hudCites()` (the 184-cite side) and whatever eventually reads
   `research/law-sources.json`'s keys, so a verified URL entered in either surface's spelling
   is recognized by the other.
4. **The gap report's freshness test stops mutating the real file.** Golden #5: same
   `mkdtemp` pattern as its two sibling tests in `tools/law-sources.test.mts`.
5. **The "(Checked)" / "checked against the statute text" strings gain a coverage clause or a
   link**, sourced from the numbers `tools/lib/lawSources.mjs` can already compute per state —
   golden #1, the highest-impact item, and the only one that changes what a user reads rather
   than what a machine tests.
6. **A visible, on-page signal that Arena/`/rehearse` now work with no connection** — nothing
   in the current copy tells Wes or Keisha this shipped; today it lives entirely in code
   comments (`arena/index.html:2134,2169,2186`).
7. **Reconcile or retire the 4 pre-existing watched sources against current `data/hud.json`
   content** — two of the four (`GA`, `NY`) no longer describe a line the product currently
   shows for that state; leaving them in `research/law-watch.json` unexamined implies a
   coverage that isn't there.

---

## 4. Missing features the personas expect that still do not exist (each checked before claiming)

| Expected | Verified absent | Who |
|---|---|---|
| Any on-page signal that Arena/`/rehearse` now works with no signal | grep `offline` in `arena/index.html`'s visible UI strings (excluding JS comments) = 0 | Wes, Keisha |
| A visible distinction between "checked once" and "actively monitored," in the same word a user reads | `"(Checked)"` (`arena/index.html:2207`) and the 51 `hud.mjs:66` notices are unchanged text; no link to `research/law-watch-gaps.md` from any HTML/JSON outside `research/` (grep `law-watch\|law-sources` in `how-we-verify/`, `como-verificamos/` = 0) | Tony, Ana |
| An in-the-moment indicator of whether the rights lines on screen came from a live fetch or a saved/offline copy | no such element or string in `arena/index.html`; `render()`/`openPanic()` never surface fetch provenance | Keisha, Devin |
| A citation format shared between the two "verified" lists, so a state Marisol/Luis already trust doesn't silently fail to link up once the sidecar is populated | TX cite differs by the token `"Tex. "` across `data/hud.json` vs `research/law-watch.json`; matching is exact-string (`tools/lib/lawSources.mjs:37`) | Luis, Marisol |
| Confirmation that "verified live" covers a real device on real intermittent signal, not only a DevTools offline toggle | CHANGELOG names "Chrome DevTools offline emulation" only; no device-lab or throttled-network note found anywhere in the diff | Keisha, Luis |

Not repeated from FG26 (still open there, untouched by today's diff): `href="../"` exits,
the badge/level-name mismatch, the two "your state" encodings, the paid-artifact
overpromising, dialog semantics on the completion/pay modals, `<html lang>` never updating in
the Arena.

---

## 5. Blind-spot questions a top UX researcher would ask, not yet asked by the owner

**BS-1. Is "checked" a copy problem or a systems problem — and does the team know which one
it's solving?** `research/law-sources.json` and `research/law-watch-gaps.md` are new
infrastructure for turning "checked" into something continuously true. But nothing shipped
today changes the word itself, anywhere a user reads it. If populating the sidecar for all
184 cites is, by the tool's own comment, "not a same-day task" (`research/law-sources.json:19-20`),
what does the product say about itself in the meantime — and has anyone decided that
question, or is it simply unaddressed until the research is done?

**BS-2. The Arena now has a better safety screen than `/app` does, and `/app` is still the
one place a printed card and the CHANGELOG describe as canonical. Who decides which one
is the product, and when?** Two implementations of the same safety-critical screen, built
independently, diverging further with every release (golden #3) — this is a decision, not a
backlog item, and nothing in `docs/engine/PLAN.md` or the CHANGELOG names it as one still
to be made.

**BS-3. The four sources this product has watched every day for months have already drifted
from what's on screen — who was supposed to notice that, and how would they have?** Georgia's
watched cite matches no currently-displayed Georgia line; New York's is off-topic for New
York's current nine lines. Nobody wrote a check for "the thing we're watching is still the
thing we show" — only for "the thing we're watching hasn't changed its own text." A focus
group reading raw JSON found this; the daily job, by design, cannot.

**BS-4. What does a contributor actually experience the first time `data/hud.json` changes
without a `--gaps` re-run?** Golden #5: the freshness test silently repairs the real file
before reporting a failure against content that no longer exists on disk. Has anyone
actually lived through that sequence once, or only read the code?

**BS-5. "Verified live" measured a DevTools offline toggle — a clean binary — for a persona
whose real failure mode is a signal that's present but too weak to complete a fetch before
timing out.** Luis's phone doesn't go instantly offline; it degrades. Does the inline-copy-
first design actually help in that slow-fetch case (it should, since `boot()` never waits on
the fetch to render) — has that specific case, rather than airplane mode, been the one
someone actually watched happen?

**BS-6. Populating the sidecar is real, uncosted legal-research labor — the same kind of
work that built the 51-state matrix in the first place. Is that work on anyone's calendar, or
does the honesty layer just sit at zero indefinitely while the product keeps making the claim
it was built to check?** `research/law-sources.json`'s own header compares the task to
"the same kind of per-section research pass that built the matrix itself" — that pass took
real time before. Nothing in this commit schedules the next one.

---

## 6. A small thing worth naming: the honesty layer's own numbers already drifted

Two hand-written comments describe the scope of what `tools/law-sources.mjs` covers as
**230** distinct sections (`tools/law-sources.mjs:4`; `research/law-sources.json:14`). The
actual, current, generated number — recomputed independently against the real `data/hud.json`
(§7) and matching both `research/law-watch-gaps.md:3` and `CHANGELOG.md`'s own v2.29.0 entry
— is **184**. Neither stale comment affects behavior (both functions compute the real count
at runtime), but on the day a feature ships specifically to stop the product from overstating
what's verified, its own source comments already overstate their own scope by 25%. Cheapest
fix: delete the hand-typed number from both comments, or compute it into the docstring from
`hudCites(...).size` the same way the gap report does.

---

## 7. Verification log

- Commit under test: `c0b6311` (2026-09-04, `git log -1 --format=%ci` = `2026-09-04
  22:11:56 -0400`); working tree clean at read time (`git status --short` = 0 lines).
- Node, direct against the committed `data/hud.json`: 51 states; 474 total lines; 184 lines
  carry a `cite`; 184 **distinct** cite strings (no cite is reused across states/lines) —
  matches `research/law-watch-gaps.md:3` and `CHANGELOG.md:38` exactly; does **not** match
  `tools/law-sources.mjs:4` or `research/law-sources.json:14` ("230," §6).
- Node, per-state cite dump for GA/TX/NY specifically (the 3 `CITED` states): GA's
  `documents` line cite = `null`; TX's `documents` cite = `"Transp. Code §521.025"`; NY's
  lines carry no chemical-test-refusal topic at all. Cross-checked against
  `research/law-watch.json`'s 4 entries (`ga-40-5-29`, `tx-521-025`, `tx-543-005`,
  `ny-vtl-1194`) by hand.
- `research/law-watch-gaps.md`: 184 `- \`` bullet lines (`grep -c '^- \`'`), grouped under 51
  `## XX` headers; spot-checked AK, AL, AZ, GA, WI, WV, WY sections against the raw count.
- Grep-negatives (absence, not intent): `href="/app` / `amparohq.com/app` / literal `panic=1`
  in site HTML/XML/JSON outside `app/`, `app-src/`, `node_modules/` = 0 (same as FG26);
  `offline` in `arena/index.html`'s non-comment strings = 0; `sw-routing-check` in
  `package.json`'s `test` script and `.github/workflows/tests.yml` = 0 both;
  `law-watch|law-sources` in `how-we-verify/`, `como-verificamos/` = 0; `http` in
  `research/state-matrix.md` = 0 (confirms "citations but never URLs").
- `.github/workflows/law-watch.yml:53-56,62`: confirmed the daily job runs
  `node tools/law-sources.mjs --sync` then `--gaps` and commits
  `research/law-watch.json research/law-watch-gaps.md` alongside its pre-existing outputs.
- `.github/workflows/tests.yml`: confirmed steps are `npm test`, `test-fulfilment.mjs` +
  `test-arena-deeplink.mjs`, `build-jurisdictions.mjs --check`, Convex typecheck — no
  `sw-routing-check.mjs` step.
- `tools/build-jurisdictions.test.mts:98,108,115`: confirmed three real assertions for
  `patchArenaInline` (splice-and-match, idempotent, throws on missing markers) — the
  "round-trips" claim in the commit message is not just prose.
- `tools/sw-routing-check.mjs:131,137`: confirmed explicit assertions that `/rehearse` must
  not write `CORE` and `/pack` must still write `CORE` — a real, if unwired, regression test.
- `sw.js` read in full (129 lines); `arena/index.html` read by targeted grep and `sed` line
  ranges only — a full `Read` of the file fails (the inline data line alone is 180,086
  characters), so no offset/limit read was attempted across line 2170.
- **RECON, not asserted:** whether Vercel's deploy pipeline itself re-runs
  `tools/build-jurisdictions.mjs` before serving `arena/index.html` (the CI workflow runs
  `--check`, which fails the Actions run on drift, but root `index.html`/`arena/index.html`
  have no build step per `package.json`'s own description, and this session has no access to
  Vercel's project settings or GitHub branch-protection rules to confirm the Actions result
  actually gates the deploy); how this behaves on a real degrading-signal Android rather than
  a DevTools offline toggle (BS-5); Lob/print-adjacent claims — out of scope this round, not
  touched by today's diff.
- Excluded per standing instruction: attorney-review as a finding. In scope and flagged: UI
  strings that describe verification status ("checked against the statute text," "(Checked)"),
  because those are copy, not legal review itself.

## 8. Signature

Ten seated personas from `.focus-group/members.md` — Rosa, Luis, Dana, Tony, Ana, Marisol,
Wes, Keisha, Nia, Devin. Five goldens, seven module items, five missing features, six blind
spots, one self-referential drift in the honesty layer's own numbers. Every `file:line` above
was opened this session against `c0b6311` with a clean working tree; the 184-vs-230 count was
independently recomputed, not quoted from any single source.
