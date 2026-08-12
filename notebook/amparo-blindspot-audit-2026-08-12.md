# Amparo blind-spot audit — /app strangler port, Phases 3-5.1

**Scope:** Principal-engineer hostile review of `/app` (React strangler port) after
Phases 3-5.1 shipped: state map, You-step/document capture, Lifelines, the
six-page print pack, and the practice engine's core FSM
(`app-src/src/engine/practiceEngine.ts` — pure logic, not wired to any UI
yet). Root `index.html` is out of scope except where `/app` depends on it
(the service worker, root's read-only storage keys).

**Methodology:** Grepped and read source directly, ran the project's own
check suite (`extract-app-content.mjs --verify`, `app-storage-check.mts`,
`sw-routing-check.mjs`, `practice-engine-check.mts`), ran `tsc -b` and
`oxlint`, and inspected the committed `app/` build output. Verdicts are
CONFIRMED / CONTRADICTED / PLAUSIBLE-UNVERIFIED with citations. Two defects
already logged this migration (the STATES-synthesis bug in Lifelines, and
the extractor bug that dropped hard-mode/checkpoint practice content) are
**not** repeated here — see `notebook/amparo-app-migration-log.md`.

---

## Verification tooling

### Claim (migration log): `practice-engine-check.mts` — 17 checks, all pass.

**Verdict: CONTRADICTED — the script does not run as documented, on this machine (Node v22.22.0).**

Running it exactly as its own header instructs (`node tools/practice-engine-check.mts`, from the repo root) fails before a single assertion runs:

```
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module ".../app-src/src/content/practice.json"
needs an import attribute of "type: json"
```

- Root cause: `app-src/src/engine/practiceEngine.ts:26` does a **named** import
  from `../content/practice.json` with no `with { type: 'json' }` attribute.
  Node's native ESM loader has required this for JSON imports since Node 20+
  — it is unrelated to the file's own type-stripping (the header comment
  "Node 22 strips the types natively — no dependency" is about the `.mts`
  extension, not about JSON module resolution).
- **Not an environment fluke, and not a build defect:** `tsc -b && vite build`
  from `app-src/` completes clean (verified this session), because Vite's
  bundler resolves JSON imports without import attributes. So the shipped
  `/app` bundle is unaffected. The break is isolated to invoking the check
  script directly via plain `node`.
- **Why this matters for this project specifically:** hard rule 3 in this
  migration's own standing constraints is "don't claim more than what was
  tested." A check script that cannot execute is functionally equivalent to
  no check script — and the migration log records "All pass" for 17
  assertions that, as invoked, never ran to completion. `app-storage-check.mts`
  and `sw-routing-check.mjs` do **not** hit this (neither imports a content
  JSON bank), so this is specific to `practice-engine-check.mts`.
- **Fix is small:** either add `with { type: 'json' }` to the check script's
  own import of `practiceEngine.ts`'s dependency chain (not possible without
  touching the source file, since the assertion has to be on the import
  statement that resolves the JSON, i.e. inside `practiceEngine.ts` itself —
  which would also require the attribute at every JSON-import call site in
  the content layer), or run the check through a loader that patches JSON
  resolution (`vite-node`, `tsx`, or a `--experimental-json-modules`-style
  flag), or (simplest) have the check script import from a thin `.ts`
  wrapper module that re-exports the named consts with the attribute
  present. Whatever the fix, the current invocation instructions in the
  script's own header comment are wrong today and should be corrected or
  the import made attribute-safe.
- Re-verified `extract-app-content.mjs --verify` (PASS, 2437 strings),
  `app-storage-check.mts` (PASS, 13 assertions) and `sw-routing-check.mjs`
  (PASS, 12 assertions) — all three ran clean, unaffected by this issue.

---

## Storage boundary (`app-src/src/services/storage.ts`)

### Claim: the boundary holds once the practice engine is wired up in a future move.

**Verdict: CONFIRMED, by construction — holds today, and the design generalizes correctly.**

- `practiceEngine.ts` is pure (no DOM, no storage import at all — confirmed
  by grep, zero `localStorage`/`storage.ts` references in the file). It
  returns `progress` as part of `EngineState`; the comment at
  `practiceEngine.ts:222-227` states the *caller* persists it via
  `writeApp('prx', ...)` (an `app_prx` key), matching the project's rule
  that root's `amparo_prx` stays read-only from `/app`.
- The prefix mechanism (`storage.ts:186-196`) makes this safe regardless of
  what name a future caller picks: `writeApp`/`writeAppReporting` always
  prepend `app_`, so there is no code path by which a Move-5.2 UI wiring
  the engine to storage could accidentally write `amparo_prx` (root's real
  key) instead of `app_prx`. Confirmed current callers (`App.tsx`,
  `LangProvider.tsx`, `DocsOverlay.tsx`, `YouStep.tsx`) all go through the
  same two functions — no direct `localStorage.setItem` call exists
  anywhere in `app-src/src` (grepped).
- One thing to watch, not a defect today: `readRootPractice()`
  (`storage.ts:128-159`) is the **read-side** migration of root's
  `amparo_prx` (v1→v2 shape, index-shift). If Move 5.2 ever seeds a new
  `/app` practice run's initial progress from root's practice history (as
  opposed to starting `/app`'s own independent `app_prx` from empty), that
  seed must go through `readRootPractice()`, not a raw read — otherwise a
  returning user's pre-port progress could re-surface under the wrong
  level index in `/app`, the same bug class root's own migration exists to
  prevent. Nothing in the current code does this seeding yet, so this is a
  forward-looking note, not a bug.

---

## PrintPack XSS surface

### Claim: two `dangerouslySetInnerHTML` call sites, both on static extracted content.

**Verdict: CONTRADICTED as a call-site count (there are six, not two) — but CONFIRMED safe on substance (all six are static extracted content, none touch user input).**

`PrintPack.tsx`'s own header comment (lines 7-11) says: *"Two content strings
embed real markup ... those two, and only those two, use
dangerouslySetInnerHTML."* Grepping the file finds six call sites:

| Line | Source | Content |
|------|--------|---------|
| 49 | `PLACE_ICONS[p.ic]` | SVG icon markup, `content/icons.json` |
| 85 | `LOGO` | SVG logo markup, `content/icons.json` |
| 107 | `ICONS[ICON_ORDER[i]]` | SVG icon markup, `content/icons.json` |
| 196 | `rules` (from `STATES.*.rules_*`) | statute `<i class="stq">` spans — the "two" the comment means |
| 327 | `(claims[resolvedCode] ?? claims.DEFAULT)[lang]` | `<b>` tags — the other of "the two" |
| 345 | `LOGO` (second render, page 6) | SVG logo markup, same as line 85 |

- The comment's "two" refers specifically to the two **prose content banks**
  (`STATES.*.rules_*`, `PACK_EXTRA.claims.*`) that need raw HTML for inline
  emphasis tags. It does not account for the icon/logo renders, which were
  added in the same move (`content/icons.json` is new to this move per the
  migration log) and are also static, build-time-extracted SVG — not less
  safe, but the comment undercounts by four and would mislead the next
  person auditing this file for new call sites (a `grep -c
  dangerouslySetInnerHTML` check against "should be 2" would false-fail
  forever).
- **Substance check, all six:** every source (`PLACE_ICONS`, `LOGO`, `ICONS`,
  `rules_*`, `claims.*`) is a named import from a `content/*.json` file
  produced by `extract-app-content.mjs`, which the extractor's own verbatim
  guard confirms against `index.html` byte-for-byte (2437 strings, PASS this
  session). None of the six interpolate a user-entered field — the six real
  user fields (`name`/`ec`/`ecp`/`ec2`/`ecp2`/`att`) are confirmed (grepped)
  to render only as plain JSX text children elsewhere in the same file,
  which React auto-escapes. So there is no live XSS path today: an attacker
  would need to compromise the build pipeline (edit `index.html` or the
  extractor output) to inject markup, which is a different and already-
  acknowledged trust boundary (rule 1 — no model-authored content;
  extraction, not transcription).
- **Recommendation:** update the header comment to say "these six call
  sites, all on statically extracted content" (or split as "two prose banks
  + four icon banks") so the count is accurate and a future reviewer
  doesn't waste time reconciling a stale claim, or convert the icon/logo
  sites to `<img src>`-style rendering if the SVGs can be data-URI'd instead
  — lower priority, since the current state is not unsafe, just imprecise.

---

## Service worker `/app` passthrough guard

### Claim: the guard added in Phase 0 still holds after Phases 3-5's additions.

**Verdict: CONFIRMED — unchanged, and nothing in Phases 3-5 touches `sw.js`.**

- `sw.js` is byte-unmodified since the Phase 0 commit (`e21d019`) per the
  migration log; re-read this session and the guard is intact
  (`sw.js:56`): `if (sameOrigin && (u.pathname === '/app' ||
  u.pathname.startsWith('/app/'))) return;` — exact-prefix, same-origin,
  placed before the navigation/asset branches, so every new `/app` route
  added in Phases 3-5 (`state`, `you`, `lifelines`, `print`, and whatever
  hash/path Move 5.2 adds) is covered by the prefix match without needing a
  per-route update. `tools/sw-routing-check.mjs` re-run this session: PASS,
  12/12 assertions, unchanged from Phase 0.
- The guard's own risk model (one online `/app` visit poisoning root's
  offline shell) is unaffected by adding more `/app` pages — the guard acts
  on the URL prefix, not on route count.

---

## Analytics & network honesty

### Claim: `/app` ships zero analytics and makes zero network calls beyond same-origin asset fetches.

**Verdict: CONFIRMED.**

- Grepped `app-src/src` for `fetch(`, `XMLHttpRequest`, `WebSocket`,
  `EventSource`, and any `https?://` literal: the only hit is
  `LifelinesStep.tsx:20`, which constructs an `https://` string to use as an
  `href` attribute for a user-facing link (turns a bare-domain string like
  `"211.org"` into a clickable URL) — not a fetch, not app-initiated
  traffic; standard browser navigation on user click.
- Grepped for `posthog`/`analytics`/`gtag`/`sentry` (case-insensitive)
  across `app-src/src`: zero code hits — the three matches found are all in
  comments explaining *why* there is no analytics (`App.tsx:50`,
  `PrintStep.tsx:8`).
- Grepped the **committed build output** `app/index.html` for the same
  terms: the only hits are comment text describing the CSP's intent
  ("cannot reach the CDN or the analytics hosts it inherits"), not live
  script/connect references.
- Confirmed `/app`'s CSP is delivered via a `<meta>` tag in `app/index.html`
  (not the dead `vercel.json` `/app/(.*)` block the migration log already
  flagged and fixed in commit `4915c32`): `connect-src 'self'`, `script-src
  'self'` — no PostHog/CDN hosts, unlike root's CSP which explicitly
  allowlists `us.i.posthog.com`/`ph.amparohq.com`/`cdnjs.cloudflare.com`.
  This is enforced, not merely tested.
- Grepped the built `app/assets/*.js` chunk list: no `practiceEngine`,
  `buildDeck`, or `PRX_LEVELS` symbols appear in any shipped chunk —
  confirms Move 5.1's engine is genuinely unwired, matching the migration
  log, so it contributes zero bytes and zero behavior to the live beta
  today.

---

## Practice engine (Move 5.1) — forward-looking, not user-reachable yet

Since nothing renders this code yet, there is no live bug surface — these
are notes for whoever wires Move 5.2, not defects.

- `buildDeck()` (`practiceEngine.ts:94-130`) indexes `PRX_LEVELS[level]`
  with no bounds check. Levels 0-2 go through this array; 3-7 are handled
  by the early fixed-array returns above it. An out-of-range `level`
  (e.g. a caller bug passing 8+, or a negative number) would throw on
  `L.ids` rather than returning state unchanged — inconsistent with every
  other transition function in this file (`selectLevel`, `pick`,
  `markCrisis`, `back`, all silently no-op on invalid phase/state instead
  of throwing). This mirrors root's own unguarded behavior (verbatim port,
  per the file's stated porting discipline), so it's not a regression —
  but it's the one function in the FSM that can throw instead of failing
  closed, worth a bounds check when Move 5.2 wires real UI input to
  `selectLevel()`.
- `back()` at `idx <= 0` (`practiceEngine.ts:269`) returns `phase: 'IDLE'`
  without clearing `run`/`runIdx`/`curTier`. Harmless today because
  `selectLevel()` always resets those fields on next entry
  (`practiceEngine.ts:181-182`), so no caller can observe the stale arrays
  — confirmed by reading every phase transition, none reads `run`/`runIdx`
  while `phase === 'IDLE'`. Flagging only because it's the one place state
  is left partially stale by design; if a future refactor adds an
  `IDLE`-phase reader, this becomes load-bearing.

---

## Summary table

| Area | Claim | Verdict | Severity |
|------|-------|---------|----------|
| Verification tooling | `practice-engine-check.mts` — 17/17 pass | **CONTRADICTED** — script throws before running, on Node v22.22.0, plain-node invocation as documented | **Medium** — build/bundle unaffected, but the check as invoked provides zero coverage today |
| Storage boundary | Holds once practice engine is wired | CONFIRMED by construction; one forward-looking note on seeding from `readRootPractice()` | — |
| PrintPack XSS | "Two" `dangerouslySetInnerHTML` sites, static content only | **CONTRADICTED** on count (six, not two) — CONFIRMED safe on substance, all six static/extracted, zero user-input paths | Low — comment drift, not a vulnerability |
| Service worker `/app` guard | Still holds after Phases 3-5 | CONFIRMED — `sw.js` byte-unchanged since Phase 0, 12/12 checks pass | — |
| Analytics/network | Zero analytics, zero unexpected network calls | CONFIRMED — zero fetch/XHR/analytics code paths; CSP enforces `connect-src 'self'` | — |
| Practice engine bounds | `buildDeck()` unguarded for out-of-range level | Real gap, matches root's own unguarded behavior (verbatim port) | Low — not reachable until Move 5.2 wires input |
| Practice engine `back()` stale fields | `run`/`runIdx` not cleared at `idx<=0` | Harmless today, confirmed no reader in `IDLE` phase | Low — note for future refactors |

---

## Bottom line

No CRITICAL issues. One **Medium**: the practice-engine check script's own
"17/17 pass" claim in the migration log does not reproduce on a plain
`node tools/practice-engine-check.mts` invocation on Node v22.22.0 — it
throws on a missing JSON import attribute before any assertion runs. The
actual `/app` build and bundle are unaffected (`tsc -b && vite build` and
`oxlint` both clean), so this is a broken *check*, not a broken *product* —
but for a migration whose own standing rule is "don't claim more than what
was tested," a script that can't execute needs either a fix or a corrected
claim in the log.

Everything else audited this pass holds: the storage boundary is safe by
construction and will stay safe once the practice engine is wired to it;
the service worker's `/app` guard is untouched and still covers every new
route; `/app` ships genuinely zero analytics and zero unexpected network
calls, enforced by CSP rather than merely tested; and the PrintPack
`dangerouslySetInnerHTML` surface, while undercounted by its own header
comment (six call sites, not two), is safe on substance — every site
renders statically extracted, verbatim-checked content, never a
user-entered field.
