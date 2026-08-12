# /app migration — running log

Companion to `wargames/15-react-strangler-migration.md` (the plan). This file
records what actually happened per phase: what shipped, what the verification
proved, what bit, and what the next phase inherits. The wargame says what
*should* happen; this says what *did*.

Root `index.html` remains the live product and the default entry throughout.
Nothing in `/app` is user-facing yet — it carries a `noindex` and a bilingual
preview banner pointing back to the real app.

---

## Phase 0 — root service worker hardened
**Shipped 2026-08-11 · `e21d019` · deployed · tagged in v2.17.0**

The precondition, shipped alone and deployed before any `/app` code existed, so
every client's root worker updated first.

Three edits to `sw.js`, all from the wargame's red-team pass:

1. **`/app` passthrough guard.** The navigation branch stores *every* successful
   navigation under `CORE`. One online visit to `/app` would therefore have
   overwritten the cached root shell — root's offline fallback would then serve
   the wrong app to every offline visitor. Same-origin and exact-prefix, so
   `/apple-touch-icon.png` and `/application*` are not swallowed.
2. **Prefix-scoped cache cleanup.** `activate` deleted every cache on the origin.
   That would have wiped `/app`'s Workbox precache — and a cron deploys daily,
   so `/app` would have silently lost offline capability once a day *while still
   claiming to have it*. That is precisely the quiet-false-claim failure mode of
   hard rule 3.
3. **Pathname-anchored asset matcher.** It was a substring test on the whole URL,
   so any third-party URL merely containing `/img/` was cached as an immutable
   asset.

Cache name deliberately stays `amparo-v3`: bumping it would drop every existing
user's cached shell and force a re-download, which is the prepaid-data cost the
worker's own header comment exists to avoid. Workers update on file bytes, not
cache name.

`tools/sw-routing-check.mjs` — 12 assertions against the real worker with stubbed
globals. Verified meaningful: fails 5/5 against the previous version.

## Phase 1 — beta shell
**Shipped 2026-08-11 · `f21c1bf` · deployed · tagged in v2.17.0**

`app-src/` holds the Vite source; `app/` holds the committed build output. The
Vercel project is zero-config static with no build step, so the compiled bundle
ships as ordinary files. **No `package.json` at the repo root** — Vercel's
framework auto-detection keys off one and could flip the project out of static
serving, putting root deploys at risk.

React + react-dom only: 27 packages, 0 vulnerabilities. No Clerk, no Convex, no
Stripe, no analytics. Design tokens copied verbatim from `index.html:36-43` so
the shell is cream/navy/gold from the first pixel rather than drifting toward the
rejected dark palette and being retrofitted.

Verified live: `/app/` and bare `/app` both 200; **`/app` inherits root's CSP and
needs no `vercel.json` change** (a carried RECON NEEDED from the wargame, now
closed); root `index.html` byte-unchanged.

**Baseline recorded before it grows: 191 kB raw / 60.2 kB gzip for a shell that
does nothing, against 112 kB brotli for the entire live app.** That gap is the
number the eventual promotion decision has to answer for.

## Phase 2 — content extraction + storage boundary
**Shipped 2026-08-11 · `cb30cd5` · deployed**

Nothing in this phase is reachable by a user: the extracted content and the
storage module are not imported by any component yet, so the deployed bundle is
byte-identical to Phase 1's. Deploying it early is deliberate — it puts the
invariants and their checks in CI's reach before the code that depends on them
exists.

### Content: extraction, not transcription
`tools/extract-app-content.mjs` slices the `const` **statements** for every
content bank out of `index.html` and evaluates them, so the emitted JSON *is* the
source literal. Every officer line, statute quote and legal phrase is
attorney-reviewable content, and hard rule 1 forbids a model writing legal text —
making hand-transcription impossible is the only durable way to honour that in a
port. If a string is wrong it is wrong in `index.html`, and that is where it gets
fixed, possibly with an EDITION bump. Never here.

Statement-level rather than literal-level, because the banks are not uniformly
`{...}`/`[...]`: `PRX_UNSCORED` is a `Set`, `PRX_LEVEL_IDS` is a flag-dependent
ternary, and `EDITION`/`ED_REPLACE` share one statement.

Output: 8 files, ~256 kB, from **463 top-level i18n keys / 516 deep paths**.
Flags extracted dark (`FINAL_SCENARIOS_ENABLED` and `DOOR_MODULE_ENABLED` both
false, `PRX_LEVEL_IDS` resolving to `[0,1,2,3,4]`), 68 `TODO_ATTORNEY` and 4
`TODO_DV_CLINICIAN` placeholders intact, attorney slots still empty strings.

Three guards, each covering a real class of bug:

- **74 officer lines** re-checked as verbatim substrings of `index.html`; the
  tool refuses to write if any fails.
- **EN/ES structural parity** by full path. FG-09 golden #3: a key present in EN
  and missing in ES renders as a blank via the `||''` fallbacks, silently, for
  Spanish users only. Confirmed identical. Three empty ES `amend` values turned
  out to be `""` in the source for *both* languages by design — those rights
  carry no amendment tag — so a real-looking gap was closed by reading the
  source rather than assuming.
- **Nothing non-JSON reaches disk.** This one bit immediately: values built
  inside the `vm` sandbox belong to a different realm, so `instanceof Set` is
  false for a genuine `Set`, and `PRX_UNSCORED`/`PRX_DO` serialized as `{}`.
  That would have made every scored level render a score — hard mode included,
  where a score would imply the escalation was earned. Now detected by
  `Object.prototype.toString`.

### Storage: read-only by construction
`app-src/src/services/storage.ts`. `/app` may read the six root-owned keys and
write only its own `app_*` keys. The constraint is **structural, not
disciplinary**: writers take a short name and the module applies the prefix
itself, so no caller can name a root key at all, and root keys are exposed only
through individual named readers so there is no read-any-key surface either.

State diverging between the two apps during beta is accepted. A write bug in an
unproven beta corrupting a live user's saved pack is not — the pack is the
product.

Ports root's whitelists for the reasons root records (an unrecognised state
would print the **wrong state's rules**; an unrecognised lang bricks every
render) and both `amparo_prx` migrations, read-side only.

`tools/app-storage-check.mts` — 13 assertions via node's native type stripping,
no new dependency. The load-bearing one: after exercising every write path, the
six root keys must be byte-identical. The migration cases matter because getting
the index shift wrong does not throw — it silently displays a returning user's
Hard-mode result as their Checkpoint result. Verified meaningful by breaking the
shift and watching it fail.

### QA round, 2026-08-11 — three independent agents

Run after Phases 1–2 deployed. Verdicts: root regression **SAFE-WITH-CAVEATS**,
`/app` E2E **PASS**, content fidelity **FAITHFUL-WITH-NOTES**. No CRITICAL or
HIGH anywhere. Most of what was found was wrong in *this migration's own tooling*
— which is the point of running QA that does not trust the author.

**Root regression (the live product).** 89 adversarial assertions over the real
worker, plus a live browser A/B against the pre-commit version served on
localhost. All 257 tracked repo files were classified under both the old and new
`isAsset` predicates: **zero same-origin assets changed classification.** The
A/B also *proved the bug the commit fixes was real* — the OLD worker destroyed a
planted `workbox-precache-*` cache; the new one leaves it and every third-party
cache intact while still pruning `amparo-v1`/`v2`. Deployed `sw.js` is
byte-identical to HEAD and byte-stable across repeated fetches, which rules out
the one condition that could cause a reload loop. Update path traced to exactly
one reload.

Two things it corrected in my understanding: the cross-origin matcher change is
a **security fix, not a caching loss** — the old substring test would cache *any*
third-party URL containing `/img/` or `/audio/` into a never-versioned cache —
and the `/og.png` change is strictly better, since the old `endsWith` failed on a
query string.

**`/app` E2E.** Zero external hosts contacted (corroborated three ways), zero
storage keys created, no console errors, mobile-clean, product palette confirmed.
The headline: **no cache poisoning** — the cached root shell measured
545,066 bytes / sha256 `087728ad…` both before and after an online `/app` visit
while controlled by the root worker, with `amparo-v3` still at exactly 6 entries.
Committed build verified not stale (byte-identical rebuild), and deployed ==
committed == source, which independently confirms no server-side build runs.

**Content fidelity.** 2,271 string leaves walked: **0 defects.** 145 apparent
mismatches were all encoding artifacts (the source spells characters as `—`,
`\"` etc.); the *values* are identical. Placeholder counts reconcile exactly —
the only `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` occurrences not in the JSON are in
code comments. Typographic marks and all 34 `§` citations survived intact.

### Four defects the audit found in this migration's own tooling — all fixed

1. **`PLACE` was never extracted.** A bilingual bank printed on all six pack
   pages, carrying safety-relevant wording ("announce … I'm reaching for it
   slowly"). It was the *only* unextracted prose bank. Now included, along with
   `STEP_SLUG`/`DOCS`/`CARRY_F` (structural tables the app needs, where a
   retyped slug breaks routing silently).
2. **The verbatim guard verified nothing it claimed.** It sampled
   `beat.officer.en` out of `PRACTICE` — a key path `PRACTICE` does not have
   (its beats are `{o, y}`) — so the primary rehearsal dialogue contributed
   **zero** lines while the tool printed "74 officer lines checked". A guard
   advertising coverage it lacks is worse than no guard: it is the
   claim-louder-than-reality failure hard rule 3 exists for, committed by the
   very tool meant to prevent content drift. Now walks **every** string leaf —
   2,317 of them.
3. **The JSON-safety guard was Set/Map-only.** `RegExp`, `Date`, functions,
   `undefined` and `NaN` all serialized to `{}`/`null`/nothing at exit 0. Now an
   allowlist of the JSON types. Verified against all five attacks plus a clean
   control.
4. **`plain()` was destroying the evidence.** Even after (3), `RegExp` and `Date`
   still passed, because `plain()` recursed into anything with
   `typeof === 'object'` and flattened them to `{}` *before* the guard ran. It
   now only rebuilds genuine plain objects.

Also fixed: the escape-tolerant matcher was decoding HTML entities, which turned
a *correct* string into a false miss — `&amp;` inside a value is content ("Civ.
Prac. &amp; Rem. Code"), not encoding, because these literals live inside a
`<script>` where `&` is already literal. JS escapes are decoded; entities are not.

Two findings from the E2E pass were also fixed: the Spanish banner now carries
`lang="es"` (without it a screen reader applies English phonetics to half the
audience's language), and `/app` now gets its **own, strictly tighter CSP** —
no CDN, no analytics hosts, no inline scripts. Root's rule is deliberately not
edited; the block is appended, so root keeps exactly the policy it has today
under any precedence rule. That moves "zero analytics" from tested to enforced.

### Open, NOT from this migration — root's offline chip can overclaim
On a true first visit the root app can display *"Saved on this device — works
without internet"* while `caches.keys()` is empty and no worker controls the
page: the chip is gated on `navigator.serviceWorker.ready` (resolves on an
active *registration*) rather than on the page being controlled or anything
actually being cached — while the source comment claims the opposite. For a
product whose pitch is roadside offline reliability this is an honesty gap of
exactly the kind rule 3 names. Pre-existing, unrelated to `e21d019`, and root
fixes ship separately from migration work — so it is filed here, not patched
mid-phase. The agent marked its production repro [UNVERIFIED] outside its
browser environment; settle with a normal incognito window before fixing.

### Inherited by Phase 3
- **~236 kB of content JSON must be code-split, not imported wholesale.** The
  bundle is still 60.2 kB gzip only because nothing imports it yet. `map.json`
  alone (the state-map path data) is 45.6 kB.
- The wargame's "every `localStorage.setItem` literal matches `/^app_/`" bundle
  check becomes meaningful once the storage module is actually imported.
- Root's amendment tags are language-neutral (`"5th Amendment"` in both EN and
  ES). Observed, not changed — it is shipped content.

---

## Standing constraints (unchanged, every phase)
1. No model-authored officer dialogue, statutes, or legal phrases — extraction only.
2. Nothing leaves the device. `/app` beta ships **zero** analytics.
3. Feature flags stay dark; `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` placeholders intact.
4. Root `index.html` untouched until documented parity, which is a separate decision.
5. No Clerk, no Convex, no Stripe, no accounts.
6. Abort rather than improvise if a move appears to require editing legal content.
