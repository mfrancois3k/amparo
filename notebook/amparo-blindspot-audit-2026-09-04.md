# Amparo blind-spot audit — 2026-09-04

Read-only. Scope: the three commits landed today on top of HEAD `1a46f8d` —
`3a0c19f`/`e119853` (v2.28.0 grand-audit fixes + focus-group-26, already
covered by the two 2026-09-03 reports), then today's `59bd95c` (v2.28.1,
app-src repair), `04c0398` (docs), `c0b6311` (v2.29.0, Arena offline +
law-watch coverage). HEAD at read time is `c0b6311`. This report does not
repeat anything already listed as open or fixed in
`amparo-blindspot-audit-2026-09-03.md` or `amparo-grand-audit-2026-09-03.md`
(read first, including the grand audit's "Closed 2026-09-04" section) unless
today's change reopened or only partially closed it — noted explicitly where
that happens (F1, F3). Every finding below was checked against source, a
local command, `gh`, or a live `curl` against production; unverified items
say so. Excluded by instruction: "no attorney has reviewed the content."

Severity: CRITICAL / HIGH / MEDIUM / LOW. Effort: S (< 1 h), M (half day), L (days).

---

## 1. sw.js: the arena/rehearse routing rewrite

Read in full (`sw.js`, 129 lines) plus `tools/sw-routing-check.mjs` (164
lines) and ran it locally: `sw-routing-check: PASS (22 assertions)`.

**No /app ↔ Arena misrouting exists.** `isArenaPage` (`sw.js:72-75`) is only
consulted inside the `mode === 'navigate'` branch (`sw.js:89`); the `/app`
guard (`sw.js:62`) `return`s before `isArenaPage` is even computed, so the two
never interact. Audio/font requests aren't navigations, so they never reach
`isArenaPage` either — they fall straight to the `isAsset` check
(`sw.js:81-84`), which has no path overlap with `/app`. Verified both by
reading the mutually-exclusive prefixes and by the test's explicit negative
assertions (`sw-routing-check.mjs:78-88`: `/app/*` never handled; `:139-144`:
`/` must never write to the Arena's key and must write to none at all).

**The v3→v4 cache cleanup is real, not just claimed.** `sw.js:44` filters
`caches.keys()` to `k.startsWith('amparo-') && k !== C` before deleting —
prefix-scoped, so it can never touch the `/app` Workbox precache. Confirmed
against git history that the constant has moved `v1→v2→v3→v4` in exactly one
line each time (`git log -p -- sw.js`), and `sw-routing-check.mjs:148-159`
feeds `activate()` a synthetic key list `['amparo-v4','amparo-v3','amparo-v2',
'amparo-v1','workbox-precache-v2-...']` and asserts exactly the first three
are deleted. Caveat: this is a Node VM sandbox against stubbed `self`/`caches`
globals, not a real browser — the actual install→skipWaiting→activate→claim
timing for an already-installed v3 client is standard Service Worker spec
behavior, not exercised by any browser-level test in this repo, but nothing
here contradicts it.

**The widened `isAsset` (`/arena/audio/`, `/arena/fonts/`) does not cache
anything dynamic or user-specific.** Officer audio is requested as
`/arena/audio/<audioKey(A.lang+':'+txt)>.mp3` (`arena/index.html:1466`), where
`audioKey` (`arena/index.html:1459`) is a hash of the *fixed* officer-line
text bank (`arena/index.html:1446-1450`: "audio/<hash>.mp3 — all 198 original
EN+ES lines... verified 0 missing"), never user-typed input — confirmed 204
files on disk, content-addressed, effectively self-invalidating if a line's
text ever changes. No API route or serverless function exists under either
prefix (`find . -iname api` — nothing). Fonts are pure static files.

**F1 — LOW — `/arena/fonts/*.woff2` are cache-first but NOT content-hashed
filenames, unlike the audio they now share caching treatment with.** The 9
files are named `f0.woff2`…`f8.woff2` (sequential, not a hash of content), so
if a font is ever swapped under the same filename without also bumping
`sw.js`'s `C` constant, every already-visited client keeps serving the stale
cached font indefinitely (cache-first, no revalidation, no expiry). This is
the same tradeoff root `/audio/` and `/img/` already accept under
`vercel.json`'s immutable header (not a new architecture), but today's change
is what actually extends *service-worker* cache-first (as opposed to just a
long HTTP cache header) to fonts specifically. `vercel.json:140-146` itself
only grants fonts `max-age=604800` (7 days, not `immutable`) — the HTTP layer
already assumed fonts might change; the SW layer now overrides that assumption
with no ceiling.
Fix: content-hash the font filenames in the build step that already exists,
or leave a comment on the `isAsset` fonts line noting the manual-bump
requirement. — S

**F2 — HIGH — `tools/sw-routing-check.mjs` is not run by anything except a
developer's own hands.** It is not a `*.test.mts` file, so `npm test`'s glob
(`package.json:14`) skips it; it does not appear anywhere in
`.github/workflows/tests.yml` (`grep -n sw-routing .github/workflows/*.yml` →
no match). It IS wired into `app-src/package.json:11`'s own `check` script
(`verify:content && app-storage-check.mts && sw-routing-check.mjs`) — but
`tests.yml`'s only `app-src` step (`:38-43`) runs `npm ci --ignore-scripts`
and `npx tsc -p convex/tsconfig.json --noEmit`, i.e. a Convex-*backend*
typecheck only. Neither `npm run check` nor `npm run build` for the frontend
is ever invoked in CI. This is the exact bug class the script exists to catch
(a repeat of the pre-strangler-build "wrong app served" defect, `sw.js:56-61`
comment references `wargames/15`) shipping with zero automated protection —
today's commit message even says the script "asserts the key separation
directly," which reads as a guarantee it does not currently back. See F7 for
why this specific gap already has a proven cost.
Fix: add `npm run check` (no secrets needed — verified below) to the existing
`app-src` step in `tests.yml`, after the Convex typecheck. — S

---

## 2. arena/index.html's inline `AMPARO_HUD_INLINE` block

Measured directly, not estimated:

| | raw bytes | gzip -9 bytes |
|---|---|---|
| `arena/index.html` (current, with inline block) | 427,466 | 92,659 |
| `arena/index.html` with the block stripped to `<script></script>` | 246,971 | 77,341 |
| **delta from inlining** | **+180,495** | **+15,318** |
| `data/hud.json` (pretty-printed, as committed) | 209,404 | 15,654 |
| `data/hud.json` minified (`JSON.stringify`, no spaces) | 180,063 | — |

The inline blob (`window.__AMPARO_HUD__={...};`, one line, `arena/index.html:2170`)
is 180,087 bytes — i.e. it *is* the minified JSON (180,063) plus the assignment
wrapper, not a bloated/uncompressed copy of the pretty-printed 209 KB file.
Live production check (today's deploy, `Last-Modified: Sat, 05 Sep 2026
02:14:03 GMT`, `Age: 530`): `curl -D- https://www.amparohq.com/rehearse` →
`Content-Encoding: br`, 95,457 bytes over the wire, `Etag: W/"73f98483..."`
(weak etag present → conditional GETs work).

**Verdict: not a regression worth a second look.** Three reasons:
1. The marginal cost (+15.3 KB gzip) is within noise of what the *replaced*
   runtime fetch of `/data/hud.json` (15.65 KB gzip) already cost on first
   load — inlining does not add meaningfully more bytes than the feature
   already shipped, it just moves when they're paid.
2. The block sits at `arena/index.html:2169`, 94% through a 2,298-line
   document, immediately before `</body>` (`:2297`) — it does not block
   parsing or rendering of anything visible above it.
3. The one real, structural cost — losing the ability to cache the HUD data
   independently of the page shell — only bites when `research/state-matrix.md`
   changes and someone reruns `build-jurisdictions.mjs` (regenerating both
   `data/hud.json` *and* `arena/index.html`'s ETag together). Verified this is
   NOT part of the daily automated pipeline: `.github/workflows/law-watch.yml`
   never touches `research/state-matrix.md`, `data/hud.json`, or
   `arena/index.html` (its steps run `law-watch.mjs`, `build-pages.mjs`, and
   the new `law-sources.mjs` only — see §4). It is a rare, human-triggered
   event, not a daily cache-buster.

The residual, permanent cost — every visitor to `/arena` or `/rehearse` now
downloads all 51 states' data whether they open the panel or not — already
existed as a runtime fetch (yesterday's F37) and is unchanged in kind, only
in timing. Not counted as a new finding.

---

## 3. `patchArenaInline` and the CI guard against arena/data drift

**Verified: yes, a CI guard exists and specifically covers `arena/index.html`
vs `data/hud.json` — not just "the four existing artifacts."**
`tools/build-jurisdictions.mjs:160-169`'s `ARTIFACTS` map covers 5 JSON
outputs; `arena/index.html` is deliberately checked *outside* that loop, in
its own block (`:219-225`): `run()` always recomputes
`patchArenaInline(arenaCurrent, built.hud)` and pushes `'arena/index.html'`
onto `stale` if it differs (CRLF-normalized) from what's on disk. Two
independent, CI-executed layers both catch a drift:
- `tools/build-jurisdictions.test.mts:119-124` — a unit test, run by
  `npm test`, that reads the *committed* `arena/index.html`, extracts the
  inline assignment, and asserts `JSON.parse(...) deepEqual built.hud`.
- `.github/workflows/tests.yml:34-36` ("generated data is current") — runs
  `node tools/build-jurisdictions.mjs --check`, which independently exercises
  the same `patchArenaInline` re-derivation at the CLI level.

So: edit `research/state-matrix.md`, forget to rerun the generator, push —
both gates fail before merge... except "before merge" isn't real, since main
has no branch protection (F3 below). The guard is correct; whether it's
enforced is a separate question, answered there.

No fix needed here — recorded because the brief asked for explicit
verification, and because F7 (§4) shows the adjacent worry (a crash the
sync workflow) *is* real for a sibling pipeline added the same day.

---

## 4. `tools/law-sources.mjs` and `law-watch.yml`'s new `--sync` step

Read `tools/law-sources.mjs`, `tools/lib/lawSources.mjs`, both test files,
`research/law-sources.json` (currently seeded with zero entries — confirmed:
`"sources": {}`), and the current `research/law-watch.json` (4 hand-verified
entries, unchanged ids).

**F3 — HIGH — a malformed `research/law-sources.json` doesn't just break the
new sync feature; it silently kills that day's ENTIRE law-watch commit.**
`law-watch.yml:53-56`:
```yaml
- name: Sync verified law sources and refresh the coverage gap report
  run: |
    node tools/law-sources.mjs --sync
    node tools/law-sources.mjs --gaps
```
`sync()` (`tools/law-sources.mjs:29-40`) calls `loadJson` (`:23-25`, a bare
`JSON.parse`, no try/catch) on `research/law-sources.json` — a file whose own
header (`research/law-sources.json:1-25`) explicitly documents it as
hand-maintained ("Add an entry only after actually fetching the URL...").
A syntax mistake while hand-editing it throws uncaught; Node exits 1. This
workflow's OWN comment two steps earlier
(`law-watch.yml:34-38`, on the unrelated `check.log` pipe) already documents
that "GitHub's default `run:` shell is `bash -e {0}`" — meaning a non-zero
exit here aborts the rest of that `run:` block (`--gaps` never executes) and,
with no `continue-on-error` on the step, GitHub Actions skips every
subsequent step in the job, including "Commit the refreshed status"
(`:58-66`). Net effect: `law-status.json`, all 111 regenerated rights pages,
`sitemap.xml`, `feed.xml` — everything the EARLIER, successful "Regenerate
the pages" step (`:46-47`) produced — is discarded when the runner exits,
because nothing commits it. This is the identical silent-multi-step-failure
shape flagged in yesterday's audit for `daily-post.yml` (F3 there), now freshly
reintroduced into the *more consequential* workflow, on the very day of the
CI-hardening pass. Verified NOT a corruption risk to `research/law-watch.json`
itself: the crash happens during the read/parse phase
(`tools/law-sources.mjs:30-32`), strictly before the `writeFile` at `:37` —
there is no partial-write path.
Fix: `continue-on-error: true` on the sync step (cheapest), or wrap the two
`loadJson` calls in try/catch and log-and-continue instead of throwing. — S

**F4 — MEDIUM — `matchedSources()`'s id scheme has no self-uniqueness check
within one run.** `tools/lib/lawSources.mjs:40`: `id =
hud-${state.toLowerCase()}-${slug(cite)}`; `slug()` (`:47-49`) truncates to 40
characters. `existingIds` (passed in from the caller) is only ever read
(`.has()`, line 41), never updated as the loop emits new ids — so if two
*different* cites in the *same* state slugify to the same 40-char string
(plausible: two long citations sharing a prefix, or differing only in
punctuation `slug()` strips), both get pushed into `out` and both land in
`research/law-watch.json` with an identical `id` in a single `--sync` call.
Checked against the real data: 184 distinct cites, 7 already exceed 40
characters, but 0 actual collisions today (computed directly, global
namespace, stricter than the actual per-state check). Latent, not live.
Fix: dedupe `out` by `id` before returning (drop or warn on the second), or
assert uniqueness in `sync()` immediately before the `writeFile`. — S

**Checked, not a finding: privilege/write scope.** The bot's permissions
(`contents: write`, `issues: write`, `law-watch.yml:10-12`) are unchanged from
before today. `--sync` only ever *promotes* a cite that a human already
hand-verified in `research/law-sources.json` (url + anchor both required,
`lawSources.mjs:38`) into the operational watchlist — it invents nothing.
The widened `git add` list (`law-watch.yml:62`) adds
`research/law-watch-gaps.md`, which is machine-generated but contains no URLs
(`renderGapsMarkdown` asserts this itself in
`tools/lib/lawSources.test.mts:58`) — nothing here expands what the bot can
commit into a category it wasn't already trusted with.

---

## 5. Git history: anything that bypassed the `tests` gate

Last 10 commits: no merge commits (`git log --merges -10` → empty). Reflog
shows three `rebase (start/continue/finish)` sequences — normal "rebase local
commits onto origin/main before push" hygiene for a single-branch workflow,
not a bypass mechanism (nothing here discards or force-overwrites history
relative to what's on the remote; the rebases land clean single-parent
commits). No local git hooks are installed (`.git/hooks/` has only
`*.sample` files) and no husky config exists — there is nothing to bypass on
the local side in the first place.

Checked CI directly rather than inferring it: `gh run list
--workflow=tests.yml --limit 10` shows `completed / success` for every one of
today's and yesterday's commits (`c0b6311`, `04c0398`, `59bd95c`, `e119853`,
`3a0c19f`), each a `push` trigger on `main`. Version tags `v2.29.0`/`v2.28.1`/
`v2.28.0` exist and `git merge-base --is-ancestor` confirms each points at
the commit the CHANGELOG claims. `npm test` locally: 88/88 (matches the
v2.29.0 CHANGELOG's claim exactly); `sw-routing-check.mjs`: 22/22 (matches
"sw-routing 22/22" exactly). Nothing here suggests a bypassed or fabricated
CI claim.

**F5 — MEDIUM — `main` has no branch protection.**
`gh api repos/:owner/:repo/branches/main/protection` → `404 Branch not
protected`. `tests.yml` runs and has been green on every recent commit, but
it is advisory: nothing stops a future commit — including exactly the kind
F3 describes, or a direct force-push — from landing on `main` whether or not
the check passes. This is a distinct, previously-undocumented gap from
yesterday's F30 (which was "no CI exists at all," now fixed) — the gate
exists now, but isn't wired as a gate. Given a single-developer, direct-push
workflow, this may be a deliberate choice; flagging because F3 just showed a
concrete way a red run could happen.
Fix: enable a branch protection rule on `main` requiring the `tests` check
to pass. — S
UNVERIFIED: whether a force-push has ever occurred — not checkable from a
local clone's reflog alone; would need the remote's own event history.

---

## 6. Anything else in today's changes specifically

Scanned the `59bd95c` app-src consolidation (practice-engine deletion,
FROZEN content, ThankYou screen) for loose ends beyond what the CHANGELOG
already claims.

**F6 — LOW — `app-src/src/styles/practice.css` (155 lines) is dead, orphaned
CSS left behind by today's practice-engine deletion.** Confirmed zero
importers anywhere in `app-src/src`: no `@import` in any `.css` file
(including `index.css`, which has none at all), and neither `main.tsx`
(imports only `./index.css`) nor `App.tsx` (imports only
`./styles/shell.css`) references it. The commit deleted `PracticeStep.tsx`,
`PracticeHub/Beat/Debrief.tsx`, `practiceEngine.ts`, `usePracticeAudio.ts`,
`practice.json`, `prep.json` — this stylesheet was the one file the cleanup
missed. No functional impact (Vite's module graph never reaches it, so it
isn't bundled), just repo hygiene.
Fix: `git rm app-src/src/styles/practice.css`. — S

**Checked, clean:**
- `tools/frozen-content.sha256.json`'s three hashes are genuine 64-hex-char
  SHA-256 digests (verified length programmatically, not by eye — two of the
  three happen to share a value, but that's `digest(name) =
  sha256(JSON.stringify(value))` with two boolean flags both `false`, not a
  hashing bug; verification is keyed by name, not by hash, so this doesn't
  cause cross-contamination).
- No orphaned dist chunks: `app/assets/` has no `Practice*`-named files left
  over, and every asset `app/index.html` references exists on disk (checked
  programmatically; the reverse — files on disk not directly referenced —
  are the expected Vite lazy-loaded chunks, pulled in dynamically at
  runtime, not a build defect).
- `app-src/.env.production` is git-tracked, and none of `verify:content`,
  `app-storage-check.mts`, or `sw-routing-check.mjs` touch `process.env` /
  `import.meta.env` — so F2's fix (wiring `npm run check` into CI) needs no
  new secrets and is not why it was left out.

---

## Top 5 by leverage

1. **F2** — Add `npm run check` (app-src) to `tests.yml` (S). Closes the
   exact hole that already let `npm run build` sit broken for a week
   undetected (eb82570 → today's `59bd95c`), and is the only thing that would
   catch a future regression to the Arena's real offline-routing behavior —
   the thing today's headline feature is about. No secrets required, verified.
2. **F3** — `continue-on-error: true` on the law-sources sync step (S). One
   bad hand-edit to a file whose own docs invite hand-editing currently
   zeroes out the entire day's law-watch commit, not just the new feature —
   the identical failure shape already caught elsewhere in yesterday's audit,
   shipped again today in a more important workflow.
3. **F5** — Branch protection on `main` requiring `tests` (S). Turns the gate
   F2 and the rest of `tests.yml` provide from advisory into actual — directly
   relevant given F3 shows a concrete way a red run happens.
4. **F4** — Dedupe `matchedSources()`'s emitted ids before writing (S). Latent
   today (0 collisions in 184 real cites) but the 40-char truncation is
   already exercised by 7 of them; cheap to close before the sidecar grows.
5. **F6 + F1** — Delete the orphaned `practice.css`; content-hash (or
   document) the Arena's font filenames (S each). Smallest items on the list,
   but both are the kind of loose thread a hostile reviewer finds first.
