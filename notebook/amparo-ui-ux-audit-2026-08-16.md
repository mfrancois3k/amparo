# Amparo — UI/UX design audit, 2026-08-16

Scope: full-product design pass across all six screens, driven live in-browser
(root at `localhost:8000`, /app at `localhost:5173`, both at 320px, 375px and
485px viewports). Welcome and Lifelines' discoverability were reworked earlier
today (commit `ed71378`) based on real PostHog funnel data — this pass does
not re-litigate those two changes. It covers the four remaining screens
(State, You, Print, Practice) plus anything on Welcome/Lifelines not already
touched by that fix.

Every finding below was reproduced against the running app (screenshots,
computed-style inspection, or DOM/JS reads — not guessed from source alone)
and checked against the code's own history before being written up, so
deliberate prior decisions (documented in code comments) are treated as
context, not re-opened.

Traffic reality: 9–16 unique visitors/month. Every recommendation is scoped
to something one operator can ship solo — nothing here assumes a redesign
budget or a team.

---

## Ranked findings (highest leverage first)

### 1. "Add your documents" row fractures mid-word on narrow phones — CSS-only, one line

**Screen:** You. **Effort:** trivial (one CSS property, two files).

At ≤~360px width (iPhone SE class devices, and the low-end/older Android
phones this audience is disproportionately likely to be using), the "Add your
documents" row breaks like this:

```
Add
your
docu
ment
s
```

Root cause, confirmed via computed styles: `.docrow .di` (the camera-icon box)
is a fixed `flex:none;width:46px`, and `.docrow .dt` correctly shrinks
(`flex:1;min-width:0`) — but `.docrow .dt .n,.docrow .dt .s{overflow-wrap:
anywhere}` forces the browser to break *anywhere*, including mid-syllable,
the moment the remaining column gets tight. At 320px the text column measured
43px wide — not enough for any whole word, so `anywhere` shatters it.

Same rule, same bug, in both surfaces:
- `index.html:896` (production)
- `app-src/src/styles/you.css:12` (ported "verbatim")

**Fix:** change `overflow-wrap:anywhere` → `overflow-wrap:break-word` (only
breaks a word that truly can't fit on its own line — normal word-wrap handles
everything else) in both files. This is the exact row where a stressed user
is asked to photograph their license/insurance/registration — it's the worst
possible screen for the UI itself to look broken.

### 2. State search has no "this is unambiguous, just pick it" shortcut

**Screen:** State. **Effort:** small — one `keydown` handler, ~10–15 lines,
both surfaces.

This is deliberately scoped as an addition, not a reversal — the code
documents the actual decision:

> "The map replaced the alphabetical list (per Michael, 2026-08-10) — but the
> collapse-to-confirmed-chip mechanic is built from this grid's buttons, so
> the grid stays in the DOM and only ever shows in its collapsed form. Search
> now dims map tiles" — `index.html:208`

That redesign already solved the harder problem: `smPlaceLabels()`
(`index.html:3847`) gives every state — including slivers like RI/DE/DC/CT —
a full-size text-label tap target layered on the map, not just the raw SVG
polygon, so the earlier tiny-target risk is already handled well.

What's left: `filterStates(q)` (`index.html:3894`) only ever *dims*
non-matches — it has no `keydown` binding at all. Type "Texas" (a full,
unique match) and the system already knows exactly what you want, but you
still have to visually locate the one non-dimmed region on a small map and
tap it. Compare [Airbnb's location search](https://mobbin.com/screens/37719019-919d-4508-a315-e1b9fc7c076c), [Amazon's autocomplete](https://mobbin.com/screens/0ba85e42-f985-4d8b-8657-e01d9259ed7a), or [Turo's search-with-history dropdown](https://mobbin.com/screens/6c1ca533-7868-46dc-8261-bf2e81a7eca8) — all let a keyboard `Enter`, or a single visible result row, finish the job the moment the query is unambiguous.

**Fix:** on `Enter` in `#stateSearch`, if exactly one `.state-btn` currently
lacks `.nomatch`, call `pickState()` on it directly. Same win for anyone
typing on a real keyboard (desktop) and for low-vision/motor-impaired mobile
users who did the hard part (typing the exact name) and shouldn't have to
also do the precise part (hit a small shape).

### 3. Print pack thumbnails are decorative — no way to verify content before spending paper

**Screen:** Print. **Effort:** medium, but cheaper than it looks — the full
content already exists in the DOM.

`print.css:103`: `.mini{transform-origin:top left;pointer-events:none}`. The
six on-screen page thumbnails in the carousel are non-interactive scaled
miniatures — you cannot tap, pinch, or otherwise enlarge them to actually
read a page before printing. At the on-screen thumbnail width (~90–140px on
mobile) none of the bilingual statute text, rights list, or lifeline numbers
is legible. The *only* way to see a page at readable size is to already tap
"Print (AirPrint) or save as PDF" and trust the OS print sheet — i.e., commit
to the print flow before you can check what you're printing.

For an audience being asked to spend actual paper/ink on this (the whole
point of the pack), that's backwards. Compare [Zillow's lease preview](https://mobbin.com/screens/5c933738-b081-48a6-9a7d-2c3e8912b6c2) (thumbnail rail + zoom controls + page counter, all before any download/print action), [Aboard's PDF viewer](https://mobbin.com/screens/e3d5820d-0096-4a1a-905f-00e61e547767), and [Dovetail's document viewer](https://mobbin.com/screens/f0316fd5-dbf1-4bf7-be47-5bd05255d1a1) — in all three, tap-to-zoom on a thumbnail is the baseline, not a stretch feature.

**Fix:** the full-resolution pages already exist in the DOM at all times
(`#printRoot`, hidden via `display:none` except `@media print` —
`print.css:1-17`). A tap on a thumbnail could open that exact same markup in
a scrollable/pinch-zoomable full-screen overlay instead of building new
preview content from scratch — the hard part (accurate bilingual page
layout) is already done and already correct.

---

## Smaller notes (lower leverage, still worth a line)

- **You screen, copy-only, optional:** the intro line ("Every field is
  optional — fill in what helps you, skip the rest") covers all six fields,
  but only two labels ("Backup contact (optional)", "Attorney or legal aid
  number (optional)") repeat the tag inline; the first three don't. Minor
  inconsistency, not worth fixing in isolation — mention only if you're
  already touching that copy for another reason.
- **Print screen, product decision, not a bug:** every printed page is
  bilingual EN+ES regardless of the in-app language toggle (intentional —
  the window card needs to be readable by an officer of either language).
  Worth a deliberate look at whether the *practice sheet* and *wallet card*
  pages specifically (meant for the user's own rehearsal, not an officer)
  would serve a Spanish-primary user better as ES-only/larger type — but
  that's a content-architecture question, not a quick fix, and out of scope
  for a leverage-ranked list at this traffic size.

## What's already good (no action needed)

- **Practice's step-reorder recall** (`prepRenderRecall`, `index.html:3132`)
  is a genuinely well-built tap-to-place sequencing exercise — closer to
  [Duolingo's task-completion pattern](https://mobbin.com/screens/f6d7324a-7926-4c13-9fea-9c9e2cd19a24) than a generic form, and it already ships full
  keyboard support (`role="button" tabindex="0" onkeydown`) on every slot and
  chip — most teams ship the tap-only version and stop there.
- **The dialogue rehearsal card** (officer demeanor meter, replay/silence
  controls, immediate "why this answer is right" reinforcement) matches or
  beats the [Codecademy interview-simulator](https://mobbin.com/flows/3e0ddc80-8a26-4ce8-8efe-b6f85c874e35) pattern, and unlimited replay (vs.
  Duolingo's one-shot audio) is the right call for a rehearsal tool, not a gap.
- **Phone fields already use `type="tel" inputmode="tel"`** — correct native
  keypad behavior on mobile, already checked in code, not assumed.
- **The state map's small-state handling** (full-size text-label tap targets
  layered over sliver states) already solves the exact problem a naive
  "add search" fix would have re-solved worse.

---

## Method note

Driven live via the Browser tools against `app-dev` (Vite, :5173) and `root`
(static server, :8000) launch configs already defined in `.claude/launch.json`.
Screens exercised end-to-end: Welcome → State (map + search, both English
copy and the Texas selection path) → You (full form + document row at 320px
and 375px) → Lifelines (both tabs, full 6-card carousel) → Print (full page
content via `innerText`, thumbnail interactivity via computed styles) →
Practice (scenario picker → pre-arrival checklist × 5 steps → step-reorder
recall → dialogue quiz, one full round-trip). Every CSS claim above was
confirmed against `getComputedStyle()` output on the live DOM, not inferred
from source reading alone.
