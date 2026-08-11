# Amparo blind-spot audit — 2026-08-11

Scope: `index.html` (5,660 lines / 527,838 bytes) at HEAD (`29acc16`, v2.14.0), weighted
toward the day's changes — `feat: divergent turns` (`038cb41`), the geographic state map
(`fdec44b`/`614a982`/`26c447d`), the tone-atmosphere CSS (`a308907`), the hub pick-confirm
animation (`b3d3e90`), and the Checkpoint hub tab (`a6460b3`).

Methodology: read every function named in the brief end to end, cross-referenced against
`git log -p` for the commits that introduced each area, and confirmed claims either by
reading the source directly or by running small Node scripts against the file (never
asserted from memory). Every finding below cites a file:line. Items marked **VERIFIED
FINE** were hypotheses in the brief that I checked and could not reproduce/confirm as
bugs — reported so the next reviewer doesn't re-spend time on them.

---

## 1. `prxDiverge()` and the re-dealing logic

**Verified fine — the mechanism itself is correctly guarded.**

- **Last beat of a deck**: `const next=prDeck[prIdx+1]; if(!next||next.curve) return;`
  (index.html:5043-5044). `prDeck[prIdx+1]` is `undefined` past the end of the array, the
  `!next` check catches it, and JS array indexing never throws — confirmed no
  out-of-bounds crash on the final beat.
- **Interaction with `prxBack()`**: divergence works by mutating `prDeck[prIdx+1]` in
  place (`Object.assign(next,{officer,tone,id})`, index.html:5050), not by rebuilding the
  deck. Going Back does **not** call `prxBuildDeck()` (unlike `prxAgain()`/`prxTab()`), so
  a beat that was diverged once stays diverged in memory. But re-tracing the logic: every
  future call to `prxDiverge()` on that same slot re-compares the *desired* tone
  (`want`) against the slot's *current* tone (`next.tone===want`) before deciding whether
  to re-roll — so re-answering the earlier beat differently after a Back correctly
  re-diverges the next beat to the new direction. The only "stale" behavior is that
  re-answering **the same way twice** keeps the same previously-rolled variant rather than
  re-rolling among the tone pool — that matches the code's own comment ("already there —
  keep the dealt line and its audio") and looks intentional, not a bug.
- **Crisis-intercept tier (`'x'`)**: `if(!dir||prCurTier==='x') return;` (index.html:5042)
  — confirmed no beat reached via a crisis disclosure (voice at :4783, typed at :4927/:4942)
  ever steers tone, matching the commit message's claim.
- **Curveball beats**: `next.curve` is checked before any mutation, so curveballs are
  never re-dealt — matches the "their wording IS the curveball" comment.
- **Analytics**: `git show 038cb41 -- index.html | grep '^+.*ph('` returns nothing — this
  commit added **zero** new PostHog calls. Divergence is pure client-side state; there is
  no analytics-honesty surface here at all.

## 2. `prRun` / `prDeck` desync — a real, verified bug (pre-existing, not from today)

In the run summary, the beat-by-beat breakdown does this (index.html:5340-5343):

```js
const bdRows=prRun.map((t2,i)=>{
  const ln=prDeck[i]?prDeck[i].officer[lang]:'';
  ...
```

`prRun` and `prDeck` are **not the same length** whenever a crisis-tier (`'x'`) beat
occurred: `prxAdvance()` only pushes into `prRun` `if(prCurTier!=='x')`
(index.html:5058), by design — crisis disclosures are deliberately excluded from the
score and the grid. But `prDeck` still has an entry for that beat. Once one `'x'` beat has
been skipped, `prRun`'s index `i` no longer lines up with the same beat in `prDeck`, and
every row after the skip in the "beat-by-beat breakdown" prints the **wrong officer
line** next to a given 🟩/🟨 square (shifted by however many crisis beats preceded it).

- Reachable today: `prCurTier='x'` is set from the free-text "own words" panel (voice at
  :4783/`prxCompareShow()`, typed at :4927/`prxTypeAnswer()`), which renders on **every**
  unanswered beat regardless of level (index.html:5409-5412), not just new-feature levels.
- The summary screen that shows `bdRows` is reached by levels **0, 1, 2, 4** — the levels
  currently live in production (`PRX_LEVEL_IDS=[0,1,2,3,4]` since
  `FINAL_SCENARIOS_ENABLED=false`, index.html:4201/4223). Level 3 (Hard Mode) and levels
  5-7 exit through a separate debrief branch before `bdRows` is ever built, so they're
  unaffected.
- Everything else that reads `prRun` (score, share-grid, `prx.best`) stays internally
  consistent — only the text paired with each grid square in the summary can drift. Low
  severity (cosmetic, requires a crisis-language disclosure mid-run), but genuinely wrong
  output that would be easy for a reviewer to trigger by testing the crisis-safety path.

## 3. Duplicate `function prxBack(){...}` — pre-existing, not from today's commits

There are **two** top-level declarations of `prxBack` in the file: index.html:5015-5021
and index.html:5064-5068. JS silently lets the later declaration win; the first is 100%
dead code — no code path can ever reach it. Confirmed via
`git show 038cb41^:index.html | grep -n "^function prxBack"`, which shows **both** copies
already existed one commit before today's `prxDiverge` work, so this isn't something the
divergent-turns feature introduced. `git log -S"function prxBack(){"` traces it back to
two much older commits both titled `feat: Back and Home navigation in the practice drill`
(`e36bcbd`, `83bdbe8`). The two copies aren't identical — the second (live) version resets
`prxChosen`/`prxChoseGood`/`prxPickedAlt` that the first doesn't, and drops the first
version's `prCurTier=null` reset (harmless, since `prCurTier` is unconditionally cleared
by `prxAdvance()` before a Back is ever reachable). Functionally inert, but exactly the
kind of thing a hostile reviewer finds in thirty seconds of `grep -c "function prxBack"`.

## 4. State map — `US_PATHS`, `SM_BOX`, `smShape()`, `smPlaceLabels()`

**Payload size** (verified with a Node script against the live file):
- `US_PATHS` (the SVG path data, index.html:3567): **41,790 bytes** inline — 7.9% of the
  527,838-byte file. `SM_BOX` (precomputed per-state bounding boxes, index.html:3577):
  1,500 bytes. Both are 51 entries (50 states + DC), one-to-one with each other and with
  the `STATES` object (see item 6).
- This matches the `fdec44b` commit message's own estimate ("index.html 458 -> 502 KB")
  and its explicit deferral: "the measured transfer cost is what the next perf pass
  should check, not the raw size" — i.e., this is disclosed, known, and intentionally
  unmeasured. I did not measure gzip/brotli transfer size (no build/server step to test
  against) — **unverified**, flagging exactly as the original commit did.

**DOM node count / layout cost — verified fine, no thrashing:**
- The map renders 51 `<path class="sm-st">` elements (index.html:3074) plus, on first
  paint of step 1, 51 `<text class="sm-lb">` labels created by `smPlaceLabels()`
  (index.html:3588-3627) — ~102 SVG nodes total. Not a heavy DOM.
- `smPlaceLabels()` calls `p.getBBox()` once per path inside a `forEach` (index.html:3598).
  The only DOM write inside that same loop is `p.style.animationDelay=...` — and
  `animation-delay` is not a layout-affecting CSS property, so it does not invalidate the
  browser's layout tree between reads. That means this is **not** the classic
  read-write-read layout-thrashing pattern despite superficially looking like one; the
  labels themselves (`t`, appended to a detached `<g>`) aren't attached to the live SVG
  until after the loop finishes, so they can't dirty layout mid-loop either. Verified by
  reading the property being written, not by profiling in a live browser — flagging that
  distinction, but the CSS-property argument is a direct source read, not a guess.
- The function is idempotency-guarded via `svg.dataset.labeled` (index.html:3589) and
  bails without setting that flag while the map is `hidden` (index.html:3591-3592,
  collapsed/resumed sessions). It correctly re-invoked on reveal by
  `setStateCollapsed(false)` (index.html:3784: `if(!on) smPlaceLabels();`), and the guard
  makes that call a no-op once a given SVG node has already been labeled — confirmed this
  reveal path does **not** re-add duplicate labels or duplicate listeners.
- One real, minor nuance: step 1's entire card (including the SVG) is torn down and
  rebuilt via `S.innerHTML=` on every *full* `render()` of step 1 (e.g., navigating back
  to step 1 via the eyebrow state-pill, `goM(1)`, index.html:2760). Each such visit gets a
  brand-new SVG node, so the labeling pass (51 `getBBox()` reads + 51 new elements + 51
  new listeners) re-runs from scratch on every full re-entry to step 1 — it is "once per
  node," not "once per session." `setLang()` (index.html:2689) does **not** trigger this —
  confirmed it patches text nodes directly rather than calling `render()`. Not a bug, just
  worth knowing it's not truly one-time.

## 5. Tile-cartogram dead code — none found, cleanly removed

Searched the whole file for `cartogram|tile-map|sm-tile|TILE_|smTile|SMAP` — zero hits.
Diffed `fdec44b` (the commit that replaced the tile cartogram with the geographic map):
it removed the `.sm-tile` CSS block, the `SMAP` coordinate table, and the tile-grid markup
in the same commit that added the geographic version. `filterStates()`
(index.html:3635-3637) was also correctly updated to query `.sm-st`/`.sm-lb` (the new
class names), not the old `.sm-tile`. No leftover dead code from the tile-cartogram era.

## 6. `STATES` / `US_PATHS` key parity — verified fine

Checked whether every key in `US_PATHS` (used to render map paths and drive
`smPlaceLabels()`'s `STATES[k].name` lookups) is guaranteed present in `STATES` at
runtime, since a mismatch would throw `Cannot read properties of undefined` mid-render.
`STATES` is hand-authored for 3 states only (`TX`/`GA`/`NY`, index.html:2294-2326), then
back-filled for the other 48 states from `US_STATE_NAMES` at index.html:2391
(`STATES[k]={name:...,pending:true,...}` for every key in `US_STATE_NAMES` not already
present). `US_STATE_NAMES` (index.html:2340) and `US_PATHS`/`SM_BOX` all contain the
identical 51-key set (50 states + DC) — confirmed programmatically, zero mismatches in
either direction. No crash risk.

## 7. Tone-atmosphere CSS/JS (`atmCard`, `hardmode-live`)

**Verified fine.** This is a pure `className` string assignment, not `classList.add`
accumulation and not an event listener — nothing here can leak.
- Reset unconditionally at the top of `practiceRender()`, before any of the function's
  five early-return branches (locked-level reset, warn-gate, and the three different
  "done" screens — sober debrief, hard-mode debrief, scored summary) — confirmed all five
  exit before reaching the one line that sets a non-plain class (index.html:5427-5428), so
  no debrief screen can inherit a stale `hot`/`firm`/`hardmode-live` class from the prior
  beat.
- Setting `className` to the same string on a same-beat re-render is a DOM no-op (browsers
  don't restart CSS transitions/animations on a no-op class write), matching the commit's
  own claim — confirmed this is standard DOM/CSS behavior, not something special this code
  does.

## 8. Hub pick-confirm animation (`prPick`, `_prPickBusy`) — real double-fire gap

`_prPickBusy` exists specifically to stop a double-tap on a hub scenario card from firing
`practiceOpen()`/`prxTab()` twice ("two `prStart()` calls would stack `practiceOpen`'s
speech twice" — index.html:4963-4966). But the guard only applies on the **standard
motion** path:

```js
let _prPickBusy=false;
function prPick(el,i){
  if(_prPickBusy) return;
  if(document.documentElement.classList.contains('sr-motion')){ prStart(i); return; }
  _prPickBusy=true;
  el.classList.add('picked');
  setTimeout(()=>{ _prPickBusy=false; prStart(i); },260);
}
```

When `sr-motion` is set (`prefers-reduced-motion: reduce`, applied at index.html:1258 —
a real, non-trivial share of phones default this on) the function calls `prStart(i)`
**immediately and unconditionally**, never touching `_prPickBusy` at all. A double-tap or
accidental double-click on a hub card under reduced motion is not deduplicated: `prStart`
runs twice, synchronously, back to back — which means:
- `ph('sr_practice_hub_start',{level:i+1,lang})` (index.html:4976) fires **twice** for one
  real user action — a direct, verified instance of the analytics-honesty question the
  brief asked about.
- `practiceOpen(i!==0)` and `prxTab(i)` both run twice — the exact stacking bug the busy
  flag was built to prevent, just left open on this one branch.
- The audible/visual impact is muted because `prxSpeak()` cancels any in-flight audio/TTS
  before starting new playback (index.html:4711: `if(prxAudio){prxAudio.pause();...}
  if(prxTTS) speechSynthesis.cancel();`), so this does not produce overlapping voices —
  confirmed by reading `prxSpeak()`, not assumed.
- Net effect: no audible glitch, but a real duplicate PostHog event and duplicate internal
  state reset on every reduced-motion double-tap. Fix would be to set/clear
  `_prPickBusy` around the `sr-motion` branch's `prStart(i)` call too (or just always run
  the busy-window regardless of motion preference).

## 9. Other `ph()` events named in the brief

- **`sr_state_selected`** (index.html:3685, inside `pickState()`): verified honest.
  `pickState()` opens with `if(data.state===k) return;` (index.html:3671) specifically to
  stop re-tapping the already-selected state from re-firing animations *and* the event —
  confirmed the guard covers the analytics call too, since it's a single early return
  before either happens.
- **`sr_hub_module`** (index.html:3707, inside `hubTab()`): the only new `ph()` call added
  by the Checkpoint-tab commit (`a6460b3`). Fires once per real click (inline `onclick`
  handlers are replaced wholesale on every `render()`, so there's no listener
  accumulation to double-fire from). It does fire again if a user re-clicks the
  *already-active* tab — but that's still a real tap, not a synthetic duplicate; not
  flagging as dishonest.
- **`sr_practice_hub_start`**: see item 8 — the one confirmed double-fire path.

## 10. Error handling / null-guards

- `prxDiverge()`: guarded against `undefined` next-beat and `undefined`/empty variant
  pools (`if(!pool.length) return;`, index.html:5048) — no crash surface found.
- `prPick(el,i)`: `el` is always a real button node from an inline `onclick="prPick(this,i)"`
  handler; no null-deref risk found.
- `smPlaceLabels()`: guarded against a missing `#smSvg` and a hidden `#stateMap`
  (index.html:3589-3592) before touching `getBBox()`. `STATES[k]` lookups inside it are
  safe per item 6.
- Eyebrow state-pill (`eyebrow()`, index.html:2754-2763): the pill only renders when
  `st&&step>1&&STATES[st]` all hold, so `goM(1)` is only ever wired up once there's a
  valid state — no guard is missing here; `goM(1)` itself just re-renders step 1
  unconditionally, which doesn't depend on the pill's state at all.
- No missing null-guard was found in any of the four functions named in the brief that
  isn't already covered by an existing check.

## 11. Service worker (`sw.js`) — verified fine, no staleness risk found

Read `sw.js` in full. Navigation requests (`e.request.mode==='navigate'`) are
**network-first**: fetch fresh, clone-and-cache on success, fall back to the cache only
`.catch()` (offline). This means freshness for a returning user does **not** depend on the
service worker script itself being "updated" — every normal reload/reopen of the tab
re-fetches `index.html` from the network regardless of which SW instance is currently
controlling the page. The one-time `location.reload()` on `controllerchange`
(index.html:5546-5549) is a nice-to-have for the (separate) case where `sw.js` itself
changed, guarded against looping (`_swReloaded`), but the app's day-to-day freshness
doesn't rely on it.
- Real, inherent (not SW-specific) limitation: a tab that's already open and never
  navigates again won't pick up a new deploy's JS until the user manually reloads — true
  of any client-rendered single-page app, and the code's own comment
  (index.html:5541-5544) shows this was already deliberately weighed against the cost of
  force-reloading first-time visitors.
- Cache-first for `/audio/`, `/img/`, and `og.png` (index.html sw.js:56-64) is correct for
  content-addressed/immutable files. **Unverified**: whether any existing officer-line
  audio filename (`PRX_VAR[...].id`, e.g. `v3_1.mp3`) is ever re-recorded/replaced in place
  rather than shipped under a new id — if that ever happens, a returning user's cache-first
  fetch would keep serving the old clip. I did not find evidence this has happened; flagging
  it as a real risk of the cache-first *strategy*, not something I found broken today.

## Summary table

| # | Area | Status | Severity |
|---|---|---|---|
| 1 | `prxDiverge()` mechanics (last beat, Back, crisis tier, curveballs) | Verified correct | — |
| 2 | `prRun`/`prDeck` index desync in beat-by-beat breakdown after a crisis (`'x'`) beat | **Real bug, pre-existing** | Low (cosmetic, needs crisis-language trigger) |
| 3 | Duplicate `function prxBack(){}` (dead first copy) | **Real, verified, pre-existing** (not from today) | Low (dead code, not a live behavior bug) |
| 4 | State map payload size / DOM cost / `getBBox()` thrashing | Verified fine, one nuance noted (re-runs per full step-1 re-entry) | — |
| 5 | Tile-cartogram dead code | None found — clean removal | — |
| 6 | `STATES`/`US_PATHS` key parity | Verified fine | — |
| 7 | Tone-atmosphere CSS/JS leaks | Verified fine | — |
| 8 | `prPick`/`_prPickBusy` double-fire under `sr-motion` | **Real, verified bug** | Medium (duplicate analytics event + duplicate internal reset on reduced-motion double-tap) |
| 9 | `sr_state_selected`, `sr_hub_module` honesty | Verified honest | — |
| 10 | Null-guards in `prxDiverge`/`prPick`/`smPlaceLabels`/eyebrow pill | None missing | — |
| 11 | Service worker staleness | Verified fine; one unverified cache-first content-drift risk noted | — |

**Bottom line**: the divergent-turns feature shipped today (`038cb41`) is solid — its own
logic has no bugs I could find or reproduce. The two real, verified issues (#2 and #3)
both predate today and live in adjacent, older practice-drill code that this feature
happened to touch; #8 is the one new-code issue, in the hub pick-confirm commit
(`b3d3e90`), and it's a narrow, real gap (reduced-motion users only) rather than a
widespread double-fire problem.
