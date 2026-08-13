# Session record — the `/app` migration, end to end

Covers `v2.16.0` → `v2.21.2` (48 commits). Written 2026-08-13 as a companion to
`notebook/HANDOFF.md`; the handoff tells the next session what the world looks
like now, this tells it how the world got here and — more usefully — what went
wrong on the way.

---

## What was built

The whole 7-phase strangler migration in `wargames/15`, moves 0.1 → 6.2.

| Phase | What shipped |
|---|---|
| 0 | Root `sw.js` hardened first — `/app` passthrough guard, prefix-scoped cache cleanup, pathname-anchored asset matcher. Shipped **before any `/app` code existed**, deliberately. |
| 1 | `app-src/` Vite scaffold, committed build in `app/`, `noindex`, bilingual preview banner. |
| 2 | The mechanical content extractor + the `app_*` storage boundary. |
| 3 | Welcome screen + the geographic state map. |
| 4 | You-step + document capture, Lifelines, the six-page print pack. |
| 5 | Practice engine: FSM core, full UI + audio, overlay a11y framework. |
| 6 | `/app`'s own service worker + manifest, then the parity audit. |

Signed off 2026-08-13: 19 accepted deferrals, `/app` is a parity candidate.
Root `index.html` remains the live product at `/`.

---

## The bugs this migration found — and where they actually lived

The useful part of the record. Note how many were in **root**, not the port:
porting something forces you to read it, and reading it found real defects in a
product that had been live for weeks.

### Found in ROOT (pre-existing, discovered by porting)

1. **`PACK_EXTRA` has no `con_h` key** — root's `buildPrint()` interpolates
   `${PX.con_h}` into page 6 of the printed pack, so root has been printing the
   literal word **"undefined"** as a section header, in both languages, on every
   pack. `/app` degrades to icon-only rather than reproducing it. Root unfixed.
2. **Photo-upload controls are keyboard-unreachable** — a bare `<label>` wrapping
   a `display:none` file input is in no tab order. Fixed in `/app` only.
3. **`prx.best` interpolated unescaped into `innerHTML`** at two sites while a
   third escapes it. Self-XSS only. Root unfixed, logged.
4. **The `k30`/`k33` Spanish audio gap is real and unfixable by TTS** —
   re-tested this session with voicebox: every local preset reproduces the
   *identical* mispronunciation the browser TTS makes ("Ciudadanía" →
   "Siu d'Avanía", "Oríllese" → "Poríese"). Generated, round-trip transcribed,
   confirmed bad, **deleted rather than shipped**. Needs a human read.

### Found in the PORT (mine, caught before or shortly after shipping)

5. **STATES synthesis** — the extractor sliced the 3-key `STATES` literal, but
   root builds all 51 at load time by mutating it. Lifelines showed **New
   York's** legal aid lines for 48 states. Caught by driving the app and reading
   the rendered output, not by re-reading code. → `content/statesResolved.ts`.
6. **The extractor missed post-literal assignments** — `PRACTICE.en/es[20-22,
   30-33]` and `PRX_OPT[20-22,30-33]` are added by assignment statements *after*
   the `const` literals, so hard-mode and checkpoint content silently never
   extracted. Fixed generically in the tool.
7. **Crisis-tier reveal never rendered** — `markCrisis()` correctly suppressed
   scoring but the UI fell through to a normal "good answer" coach box. Root
   patches this via `querySelector` after render; React had no equivalent.
   The 988 crisis line is the highest-stakes string in the product.
8. **Two content strings rendered raw markup** — `ab_founder_note` and
   `prx_resource` carry `<br>`/`<b>` from the banks. Then grepped every other
   `<br>`/`<b>`-carrying key against every built screen rather than waiting for
   the next one to surface.
9. **Service worker cache-name collision** — `/app`'s runtime caches were named
   `amparo-app-*`, and root's activate handler deletes everything matching
   `amparo-*` except `amparo-v3`. Root's daily redeploy was silently wiping
   `/app`'s caches — the exact opposite of the isolation the move claimed.
   Renamed to `app-audio-v1`/`app-img-v1`.
10. **`/img` treated as immutable when it isn't** — proven via git history that
    `officer-f.jpg` changed bytes under the same filename. `CacheFirst` for a
    year → `StaleWhileRevalidate`.

### The one I shipped to the live product and had to revert

11. **The stale-best "fix" was itself the bug.** After Level 2 went from 2 beats
    to 3, a banked `"2/2"` could never be beaten by a `"2/3"`, so I made the
    comparison replace a best whenever the denominator differed — in `/app`,
    then in root.

    The premise was false. **`run.length` is not a per-level constant:**
    crisis-tier beats are excluded from it (disclosing distress *shrinks* the
    denominator) and the daily curveball adds a beat on levels 0-1 (*grows* it).
    So the rule fired during ordinary play and deleted real scores — a `5/5`
    overwritten by a `1/6` on a routine replay, and a `3/3` replaced by a `2/2`
    after a player typed a crisis phrase. **The app demoted someone for using
    the crisis disclosure.** Pre-change behaviour kept both.

    Reverted in both apps to the original numerator-only compare. The genuine
    staleness problem moved to a one-time `v3` migration, which is what a
    data-shape change actually calls for. The regression test I had written
    asserted the *wrong* behaviour and was rewritten to pin the right
    invariant: *a worse run never displaces a best, whatever the denominators.*

    Caught by a fanned-out QA pass, not by me.

---

## Process notes worth carrying forward

- **Live verification caught what code review didn't.** #5, #7 and #11 were all
  invisible on the page and obvious the moment the app was actually driven.
- **Two review agents contradicted each other** about whether `PRX_VAR[2]` has a
  hostile variant. Checking the bank directly settled it in seconds — the more
  confident-sounding report was the wrong one. Do not arbitrate agent
  disagreements by tone.
- **An audit agent corrupted `ui.json` to prove the build gate works, and left
  it corrupted.** The gate then failed the next build, which is the system
  working — but read-only instructions to agents need enforcing, not asking.
- **A check that fails for the wrong reason is worse than no check.** The
  content verifier began reporting drift on a perfectly in-sync file because
  `core.autocrlf=true` rewrites `index.html` to CRLF on checkout while the
  extractor emits LF. Since that verifier now gates `npm run build`, a spurious
  failure would have taught someone to bypass it. Normalised on read.
- **`app-storage-check` was hardcoded to "13 assertions" while running 14**, so
  every check added after it was written went unreported. Now counted.
- **Two root edits were made this whole migration**, both explicitly approved
  first, both verified against the *running* root app rather than in isolation:
  the Level 2 beat insert, and the best-score revert + `v3` migration.

---

## What is still open

See `notebook/HANDOFF.md` → "Open issues" and "Next session — paste-ready task
sequence". Short version:

1. **Two hostile officer lines** (`ci:2`, `ci:7`) — blocked on a human author;
   no AI on this project may write officer dialogue.
2. **The `/app` promotion decision** — deliberately not taken.
3. Root's unescaped `prx.best`, `/app`'s missing ErrorBoundary, the hub
   tablist's incomplete ARIA.
4. The two unsent memos (UPL attorney, DV clinician) — still the real
   bottleneck on the practice engine's legal exposure and the door module.
