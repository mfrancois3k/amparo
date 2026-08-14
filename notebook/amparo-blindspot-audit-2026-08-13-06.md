# Amparo blind-spot audit — 2026-08-13 (06) — prep-drill gate, miss-write frequency, share-sheet DOM after the wrap fix

Agent C of the standing `/amparo-loop`. Lens: principal engineer — performance,
service worker, privacy/analytics honesty, error handling, anything a hostile
reviewer would find first.

**Context.** This round follows a full manual click-through (Welcome → hub →
consent → prep drill → live run → wrong answer → coaching → completion →
debrief → real share-sheet click → real WhatsApp target → second run, `×2`
badge) that passed clean end to end. Rather than re-verify that pass, this
audit went looking at three specific open questions plus general territory,
per the task brief. Checked against source at HEAD (`d3a0f12`, tag `v2.22.3`)
and against a live run at `http://127.0.0.1:8931/index.html`.

**Not repeated here.** Everything in `notebook/HANDOFF.md`'s "already fixed" /
"already known" lists, and every finding already made in the five prior
2026-08-13 audits (`amparo-blindspot-audit-2026-08-13.md` through `-05.md`) —
including the share-row overflow, `prxShareCert` cancelled-share-as-save,
`sr_drill_shared` naming, silent clipboard failure, `sms:` `target="_blank"`,
and miss-count persistence itself, all of which shipped fixes in v2.22.2/v2.22.3
(commits `c20e799`, `0642590`) and were verified live by this session's own
manual QA pass before this audit began.

---

## 1. Checked and NOT a finding — the prep-drill gate has a real, persisted "seen" signal; it cannot be bypassed from the live UI

**Verdict: CONFIRMED by tracing every call site, not assumed from the absence
of a dedicated flag.**

The task brief's framing was that "the QA pass bypassed the gate by calling
`prepClose()`+`practiceOpen()` directly, not a documented skip" — true, but
that was the audit script reaching for internal functions, not a route a real
user has. Traced the actual entry graph:

- `practiceOpen()` (`index.html:5341`) has exactly **two** callers in the
  entire codebase: `prepCheckOrder()`'s "all correct" success handler
  (`:3160`, reached only by finishing the prep drill), and `prStart()`
  (`:5394`, reached only from a hub-tile tap via `prPick()`, `:5363`).
- `prStart()` (`:5383-5389`) gates on:
  ```js
  const seen=prx.done[0]||prx.done[1]||prx.done[2]||prx.done[3]||prx.done[4]||prx.done[5];
  if(!seen){ practiceIntroOpen(); return; }
  ```
  `practiceIntroOpen()`'s only "Start" button (`:3071`) calls `prepOpen()`.
  So a hub tap with no completed level **always** routes through the intro →
  prep drill; there is no third path into `practiceOpen()`.
- `prx.done` is not memory-only. It is loaded from `localStorage['amparo_prx']`
  at boot (`:4958-4961`) and written by `prxSave()` at run completion
  (`:5746`, `prx.done[prLevel]=true`), which is the same persisted object the
  hub tiles, best-score badges, and miss counter all already trust. It is
  never cleared by `prxAgain()`/`again()` (verified in the prior session's
  miss-persistence work, same object).

So this is not "no persisted seen flag" — it is a persisted flag computed
from existing state (`prx.done`) rather than stored under its own key, and it
is structurally the only door into a scenario. A returning user who has
completed nothing skips nothing; a returning user who has completed anything
skips the intro/prep drill on every subsequent hub tap, correctly, forever,
by design (the comment at `:5385-5387` states the intent explicitly: "Anyone
with existing progress has already seen it, so they go straight into the
scenario"). Not a trust-eroding retrigger — verified there is no code path
that resets `prx.done` outside of a full data-wipe the user themselves
performs.

---

## 2. Checked and NOT a finding — `prx.miss`'s per-write localStorage calls are cheap and bounded; batching was not worth doing here

**Verdict: CONFIRMED by measuring the object shape and the actual write
count per run, not assumed from "more writes than before."**

`prx` is `{done:{}, runs:{}, streak:{last,n}, best:{}, miss:{}, v}` — every
field is a small object keyed by a single-digit level index or a two-to-four
character `ci`/curveball id, holding a boolean, a short string, or a small
integer. `prx.runs[level]` (`:5745`) is a counter, not an accumulating array —
grepped every `prx.runs` site (`:4934,4995,5745,5781`), none of them push.
So the serialized object stays under roughly 300-400 bytes for the life of
the app; it does not grow with usage the way an event log would.

Write frequency per run, traced through `prxAdvance()` (`:5478`) and
`prxBack()` (`:5503`): one `prxSave()` call **only on a missed beat**, and one
more **only if that miss is then reversed via Back**. A typical run of 3-8
beats with 1-3 misses produces roughly 1-4 extra `localStorage.setItem` calls
beyond the pre-existing run-completion save — not "several writes instead of
one" in the sense of a hot loop, and not proportional to anything that scales
with usage over time (the object's size ceiling is fixed by the number of
levels/curveball ids, both small constants).

`localStorage.setItem` on an object this size is a sub-millisecond
synchronous call on any device this product targets — there is no batching,
debouncing, or `requestIdleCallback` need here. Quota exposure is also a
non-issue: even years of `prx.miss` entries (bounded by curveball-id count,
currently ≤10 keys) cannot meaningfully grow the object.

One real (not hypothetical) gap this surfaced: **no automated check exercises
root's `prxAdvance`/`prxBack` miss logic at all.** `tools/practice-engine-check.mts`
(`:319-344`) tests exactly this behavior — but only against `/app`'s TypeScript
port (`practiceEngine.ts`); grepped the whole `tools/` directory for any
reference to `index.html`'s `prxAdvance`/`prxBack` — none exists. This is the
same asymmetric-coverage shape flagged in two of today's earlier audits
(root's best-score compare, root's id-recompute) — not a new category of
problem, just a fresh instance of it landing on the miss counter specifically.
Not escalating past a note: root and `/app` were verified to agree behaviorally
in this session's live QA pass, and the logic is simple enough (increment on
miss, decrement on reversing a miss, guard against touching an unrelated
`ci`) that the risk of silent root/`/app` drift here is lower than the
best-score divergence was.

---

## 3. Checked and NOT a finding — the share sheet's real computed layout, after the flex-wrap fix, is clean: no overlap, ample touch targets, contrast passes AA

**Verdict: CONFIRMED against live `getBoundingClientRect`/`getComputedStyle`
output at 375×812, not against the CSS source alone.**

Opened the sheet live with a realistic payload (grid + level name + taunt,
tested both a 3-beat English message and a 10-beat Spanish one) and measured:

- **6 tiles, `navigator.share` present** (real-phone shape): wraps cleanly to
  two rows of 3 — `top:415`/`top:499`, an 84px gap between rows, zero overlap.
  Every tile's `pctVisible` would read 100% (all six inside the 295px
  content width, centered). This directly confirms `c20e799`'s fix holds on
  real layout, not just by re-reading the CSS.
- **5 tiles, `navigator.share` absent** (desktop/older-browser shape): wraps
  3+2, same story, `.sh-t` count matches exactly (no dead "More" button
  rendered) — re-confirms finding H from `-05.md`, now against the
  post-wrap DOM specifically.
- **Touch targets:** each `.sh-t` measures **74×82px** (icon circle 48px +
  6px gap + label line + 6px vertical padding) — well above the 44×44px
  minimum (iOS HIG / WCAG 2.5.5), regardless of whether the tile is an `<a>`
  or a `<button>`.
- **A false lead, ruled out:** the tile *element itself* (`.sh-t`) reports a
  different computed `font-size` depending on tag — 16px for `<a>` (inherits
  body), 13.33px for `<button>` (UA default, since `.sh-t` sets
  `font-family:inherit` but not `font-size:inherit`). This looked like it
  could produce visibly mismatched icon/label sizing between, e.g., "X" and
  "Copy link". It does not: `.ic` (21px) and `.lb` (11.5px) both set their
  own font-size in absolute px, confirmed identical across every tile
  (`A` and `BUTTON` alike) by direct measurement. Zero visual effect — noting
  it only so a future pass doesn't rediscover the same false lead.
- **Label contrast:** `.lb` renders `rgb(100,112,125)` (`var(--muted)`) on the
  card's `rgb(250,246,238)` background. Computed contrast ratio ≈ **4.69:1**
  — passes WCAG AA's 4.5:1 threshold for normal text (11.5px/700 weight does
  not qualify as "large text"), but with under a 0.2 margin. Not a defect;
  worth knowing the margin is thin if `--muted` or the card background ever
  shifts.
- **Icon contrast (non-text, WCAG 1.4.11's 3:1):** Facebook's `#1877F2` on the
  icon circle's `#eef1f7` computes to ≈3.74:1 — passes. X's near-black glyph
  passes by a wide margin. WhatsApp/Messages are emoji, exempt.
- **Message preview box** (`sh_preview`, added in `0642590`): `max-height:132px;
  overflow:auto`. Tested against the longest realistic payload (10-beat grid +
  Spanish taunt) — renders at 91px, well inside the cap, no scrollbar needed
  even at the practical maximum. `esc(msg)` is applied before the innerHTML
  write, confirmed at `:6023`.

Nothing here contradicts or extends `-05.md`'s findings (which were fixed);
this pass exists to confirm the fix behaves correctly against real layout,
not just to re-read the CSS rule, and it does.

---

## Summary table

| # | Area | Finding | Verdict | Severity |
|---|---|---|---|---|
| 1 | Prep-drill gate | `prStart()` gates the only entry into `practiceOpen()` on `prx.done`, a persisted, never-reset localStorage-backed signal — not bypassable from any real UI path | CONFIRMED (full call-site trace) | — (not a defect) |
| 2 | `prx.miss` write frequency | Object stays ~300-400 bytes for the life of the app; 1-4 extra sub-millisecond writes per run; no batching needed. Root's miss logic has zero automated test coverage (same asymmetric-coverage shape flagged earlier today, new instance) | CONFIRMED (traced object shape + write sites) | — (not a defect); coverage gap noted, **Low** |
| 3 | Share sheet DOM | 6-tile wrap is overlap-free, touch targets 74×82px, label contrast 4.69:1 (passes AA, thin margin), icon contrast passes, message preview handles max realistic payload without scrolling | CONFIRMED (live `getBoundingClientRect`/`getComputedStyle`) | — (not a defect) |

---

## Bottom line

No CRITICAL, HIGH, or MEDIUM findings this round. All three assigned
territories came back clean under direct verification, and this report says
so plainly rather than manufacturing a finding to fill space, per this
round's explicit instruction.

The one thing worth carrying forward, at Low severity: root's `prxAdvance`/
`prxBack` miss-counter logic — the exact code this session's prior commit
(`0642590`) added and fixed a symmetry bug in — has no automated check at
all. `practice-engine-check.mts`'s two new assertions test only `/app`'s
port. This is not a new category of gap (two earlier audits today already
named the same asymmetric-coverage pattern for the best-score compare and the
id-recompute step); it is simply where that same gap now sits. Not escalated
past a note because this session's live manual QA already confirmed root and
`/app` agree on the miss counter behaviorally, and the logic is small enough
that the risk profile is lower than the two previously-found divergences.
