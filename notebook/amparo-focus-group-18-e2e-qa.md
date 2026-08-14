# Amparo focus group 18 — the honesty fixes' own honesty (v2.22.2 → v2.22.3)

**Agent A of the `/amparo-loop e2e-qa` verification.**
Build under test: `0642590`, tag **v2.22.3**, `EDITION = "2026-E"`. HEAD at
read time is `d3a0f12` (a same-day cron commit to `law-status.json` only —
no app code, not in scope). Measured live in a real browser against
`http://127.0.0.1:8000/index.html` (root `index.html`, unmodified, served
from the actual repo — not a copy) at 375×812, plus source reads of
`index.html` and `app-src/`. `npm run check` run to completion in
`app-src/`: all four suites **PASS** (content-verify, storage-14,
sw-routing-12, practice-engine-24 — 24 now, up from 21 at FG16's read, and
2481 strings verified present, up from 2465).

**Excluded by instruction, not re-reported as new:** attorney/lawyer review,
the two unsent memos, empty `ci:7`, curveball drill-coverage inversion,
`/app` having no share sheet, whether an immigration-checkpoint result
should be shareable at all, and the GSAP tab-hidden animation freeze on
`target="_blank"` targets. **Also not re-reported as new, confirmed correct
in passing:** the ×2 chronic-miss badge; `.sh-row{flex-wrap:wrap}` now
shows every target with no scroller (re-measured at 375px this round:
`scrollWidth===clientWidth===295`, five DOM-rendered targets — `navigator.share`
is `false` in this environment so "More" doesn't render, matching real
desktop-without-share behavior — all with `visible:true` bounding rects);
the sheet closes 250ms after a destination tap (`shareVia`); `sms:` no
longer carries `target="_blank"` (confirmed per-scheme on live anchors:
`wa`/`fb`/`x` → `_blank`, `sms` → `null`); the checkpoint share's taunt line
is correctly suppressed only for levels 4/7 (confirmed live end-to-end via
`prxShareRun` with `prLevel=4`: message reads `Amparo 🚔 🚧
Checkpoint\n🟩🟨🟩🟩 3/4` with no traffic-stop line, grid and score still
present); `prxShareCert`'s own unconditional taunt line is **not** a bug —
traced its only gate (`master`, requires `prx.done[0]&&[1]&&[2]&&!swan`) and
confirmed it can never fire for level 4 or 7, only full traffic-ladder
mastery, where the taunt is true.

---

## 0. What is actually new this round, verified

Two commits since FG17: `c20e799` (v2.22.2, the overflow regression fix +
three honesty defects) and `0642590` (v2.22.3, the message preview + three
more). Both tag annotations' central claims **check out** on the four
items each names — confirmed above. What follows is what those tags did
**not** catch.

### New finding — the clipboard-failure message is invisible to a screen reader when triggered from the row's own Copy button, the exact path this release shipped to fix that silence

`shareCopy` (`index.html:6056-6074`) is bound from two places with
identical `onclick="shareCopy(this)"`: the row's icon tile (`:6026`,
`class="sh-t"`, has a `.lb` span) and the link-field's plain button
(`:6031`, no `.lb` span). On failure it does:

```js
const lb=btn.querySelector('.lb')||btn;
lb.textContent=_t.sh_copy_fail;
const w=document.querySelector('.sh-link'); if(w) w.setAttribute('role','status');
```

`lb` is scoped to `btn` — whichever element was actually tapped. `w` is
**always** `document.querySelector('.sh-link')`, the separate link-field
`<div>` at the bottom of the sheet, regardless of which button fired.

**LIVE, both paths tested.** Tapping the row's tile (denied clipboard
stubbed): the tile's own label correctly changes to *"Couldn't copy — it's
selected, copy it manually"* — but `role="status"` lands on `.sh-link`,
whose own children (`<input>`, `<button>`) are provably untouched
(`linkDivButtonTextUnchanged: "Copy link"` — measured, not assumed). A
screen reader listening for a live region on `.sh-link` hears nothing,
because nothing in that subtree changed; the actual text change happened in
a sibling element with no live-region semantics at all. Tapping the
link-field's own button: `lb === btn === w`'s child, so role and mutation
share a subtree and the announcement works as designed.

This is not a subtle timing question about dynamically-added live regions
(a real, debatable ARIA edge case) — it is unambiguous, because `.sh-link`
receives **zero** content mutation on the row-button path. The v2.22.3 tag
claims *"a denied clipboard now shows a failure message instead of silently
doing nothing (verified live)"* — true for a sighted mouse/touch user on
either button, and true for a keyboard/screen-reader user **only** on the
link-field button. On the row's icon tile — the more prominent, first-listed
Copy affordance, sitting where "WhatsApp / Messages / Facebook / X" already
are — it is silently doing nothing to assistive tech, on the release
written specifically to stop a clipboard failure from silently doing
nothing.

**Secondary, same defect, visual rather than assistive-tech:** the failure
text also reflows the tile itself. Measured live: the row tile's
`getBoundingClientRect()` height goes from **78.5px to 131.5px** to wrap a
52-character sentence in a 71px-wide flex item, and the whole `.sh-row`
grows to **227px tall** for the 4-second duration before the text reverts.
Not broken — `flex-wrap` absorbs it, nothing clips — but a fixed-width icon
tile visibly lurching to accommodate a full sentence is a rougher landing
than the link-field's button, which sits in a normal-width row built for
text.

**Root cause worth naming.** FG17's module list explicitly recommended
*"Dedupe the two Copy link buttons (`:5955` and `:5960`) … keeping the
field's and dropping the row's"* — not acted on. Had that dedup shipped
before this round's clipboard-failure fix, this defect would not exist:
there would be exactly one Copy button, it would live inside `.sh-link`,
and `role="status"` would already be scoped correctly by construction. The
two open items compound each other.

### New finding — the message preview is a specific, verbatim promise, and Facebook is now a documented, silent exception to it

`sh_preview` didn't exist before v2.22.3. Its entire job, per the tag
annotation, is *"a verbatim preview of the outgoing message"*. LIVE,
confirmed verbatim: `.sh-msg`'s `textContent` is exactly `msg` (level line +
grid + score + taunt-if-traffic + URL), byte-for-byte what the four network
targets' hrefs carry — except Facebook's, which the commit's own comment
admits: *"Facebook receives only the link … the preview overstates what
that one target gets — the safe direction to be wrong in."*

That framing is only half true, and the half that's false is new, because
before this round there was no promise to break. FG17 found *"the sheet
shows a link and sends a score"* — a **general** trust gap, the same for
every button, closed by this round's preview for three of four targets.
What v2.22.3 introduces in its place is a **specific, textually verbatim**
claim ("this exact block is what you're about to send") that is true for
WhatsApp, SMS and X and false for exactly one button sitting between two
true ones in the same row, same size, same affordance — this is FG17
golden #4 restated with a fix half-applied to it. And the failure mode now
cuts both directions, not one:

- **Under-promise, already named by FG17:** a user who reads *only* the
  target labels (skips the preview) still doesn't know X carries more than
  Facebook.
- **Over-promise, new this round:** a user who *reads the preview* — the
  thing it exists for — sees their full grid, level and score rendered as
  literal text, then taps **Facebook** believing that block is what's
  leaving. Tony's own standing case (FG17): he wants Facebook specifically
  because it *doesn't* carry the score, and would be reassured to see
  that in writing. The preview instead shows him the score is "about to be
  sent" and never says otherwise for the one button he'd choose — a user
  who trusts the preview literally could be needlessly deterred from the
  one target that was always safe, which is the opposite harm from
  Marisol's original complaint but the same root cause: one preview, four
  different realities, no per-target disclosure.

**Impact.** The fix that was supposed to close the sheet's central honesty
gap (FG17 golden #2, "shows a link, sends a score") closes it for 3 of 4
network targets and, for the fourth, upgrades a *general* ambiguity into a
*specific, falsifiable* claim sitting directly above the button that
falsifies it. The cheapest closing move remains what FG17 already named: a
one-line caveat under the Facebook tile, or beneath the preview itself —
*"Facebook posts the site only, not this message."* Existing-string-family
work, no new legal content, no EDITION implication.

---

## 1. Ten persona reactions

Same panel as FG17 — the subject is still the share sheet, now one release
further along, and continuity lets the panel judge whether last round's
findings actually closed rather than re-selecting personas for their own
sake. Rationale per persona below.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

Two outcomes, opposite directions, same screen.

The **overflow fix landed clean for him.** Re-measured at 375px: `wrap`
active, five rendered targets (this environment has no `navigator.share`,
so "More" is absent — exactly what a real desktop-without-app browser would
also show) all fully inside the viewport, none behind an invisible
scroller. His round-15/17 pattern — "a working control one screen from a
broken twin" — does not repeat here; the whole row works the same way now.

Then he'd hit the new one, and it's his exact axis: he taps the row's Copy
icon (first Copy affordance in the tab order, same visual weight as
WhatsApp/Messages/Facebook/X), clipboard is denied, and — measured, not
inferred — nothing is announced. The visible text change is real; it is
simply attached to a `role="status"` node with no relationship to what
changed. "The project fixed the silence and I still get the silence,
because the fix listened to the wrong div."

Redo? Yes for the overflow work. Refer? Conditional, unchanged from FG17 —
the specific new blocker replaces the old one rather than adding to it.

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data

He reads the preview as confirmation, not comfort. "Now I don't have to
guess. It says right there: level, grid, score, link. That's what I
suspected before and now it's typed out in front of me before I tap
anything." He'd credit the honesty of it even though it changes nothing
about whether he taps — he still wouldn't, for the same reasons as FG17.

He'd also be the one to catch the Facebook exception fastest, because
distrust is his baseline: "So the box lies for one of the six buttons. On
purpose, they say — but I don't get told which one when I'm looking at it,
I have to already know Facebook is different." `sms:` no longer stranding a
blank tab is a real, if small, win for his exact device class — one less
dead browser tab on a phone he can't spare cycles on.

Redo? Unchanged, standing objection untouched. Refer? Unchanged.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

The preview reads correctly in Spanish — checked live, matches her earlier
praise register: *"Lo que vas a enviar"* is plain, not stiff. For the first
time she can actually read, before tapping, what she'd be sending her son —
closing exactly the confusion FG17 recorded (*"¿Por qué me está ofreciendo
Facebook?"*): she can now see for herself that what leaves is the score
block, not a mystery.

She would not independently notice the Facebook exception — she reads
Spanish carefully, not source code — which is itself the finding: the gap
is invisible to the literal reader the preview was built for, not because
her reading skipped anything, but because the sheet never says it exists.

Redo? Yes, unchanged. The one addition this round (the preview) is a real
improvement for her specifically, with a caveat she has no way to discover.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts

Her FG17 complaint — *"the sheet shows me one thing and transmits
another … nobody told me"* — is the complaint the preview exists to answer,
and for three of four targets it does, cleanly, in both languages. She'd
say so plainly rather than move the goalposts.

Then: "It still shows me one thing and transmits another. Just for a
smaller set of buttons now, and the one exception is the one they call
`safe`." Her read on "safe direction to be wrong in" (the commit's own
phrase): safe for *whom* depends on what the user wanted. A user who wanted
Facebook to carry the score (nobody today, but the sheet doesn't know that)
is told a false negative; a user who reads the block and avoids Facebook
out of caution loses the safest button for no reason. "The design isn't
dishonest. It's just still solving my exact problem for most of the row and
calling that finished."

Redo? Yes on content quality, unchanged. This is the sharpest read on the
one open thread from this round, same as FG17.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, always between fares

The `sms:` fix is squarely hers: no more blank tab left behind mid-shift
after handing off to Messages. She wouldn't notice it fixed — same shape as
the offline-chip fix from FG16 — she'd just stop getting burned by it.

She is not a screen-reader user, so golden #1's live-region half misses her
entirely, said plainly rather than manufactured. The visual half might
still catch her thumb: if her clipboard is ever denied (a real state on a
locked-down work phone), the row jumping from a tidy grid to a
227px-tall block for four seconds, mid-tap, on a screen she's using for
thirty seconds total, is the kind of thing that reads as "broke" even
though it isn't.

Redo? Yes, unchanged — third round running where nothing lands badly on the
highest-real-need persona, second round where at least one fix (`sms:`)
lands squarely on her conditions specifically.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

She'd go straight back to the thing she flagged last round: "Two buttons
still both say Copy link, right next to each other." Confirmed — `:6026`
and `:6031`, unchanged, still identical labels, still adjacent, still not
deduped despite her own round-17 finding and the module list naming the
fix. She'd connect the dots the way only a completionist does: "And now one
of those two duplicate buttons is the one that goes silent for the next
person who needs to hear it. If you'd fixed the thing I already told you
about, the new bug wouldn't have anywhere to hide."

She'd still credit the preview as a straightforward win — "I finally see
what my son would be posting before he posts it, that's the whole ask" —
and still separately want the Facebook exception spelled out, for the same
reason she wanted the badge's "3 of 4" made explicit in FG16: partial truth
stated as if it were complete truth is the one thing she reliably catches.

Redo? Yes. Refer? Yes — unchanged, still her strongest-holding verdict.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

He is the direct target of the new over-promise direction, and he'd catch
it by trying to do exactly what he did in FG17: "I tap Facebook because I
already know — you told me last time — it doesn't send the score. Now
before I even tap it, the box shows me the score sitting right there like
it's about to go out. If I hadn't already been told Facebook is different,
I'd have backed out of the one button that was always safe for my
grandson's practice score."

That is the whole finding in one line from the persona who represents "a
reasonable person who reads what's on screen and acts on it." The safety
property he cares about (Facebook posts no score) still holds. What's new
is that the product's own honesty fix, read literally, argues against
using it.

Redo? Once, if an institution backs it. Refer? Still no — unchanged, and he
separates this cleanly from his standing condition, same as every prior
round.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

Short, and it lands differently than her FG17 line.

"Before, I didn't know exactly what would go out if I tapped something. Now
it's printed in front of me before I choose anything — my grid, my score,
sitting there as a block of text I have to look at to get past this
screen." She is not saying this is worse than not knowing; she is saying it
is not obviously better for her specifically. Making the artifact more
legible before the choice is made can read as more honest to Rosa and more
exposing to her, in the same interaction, from the same change.

She confirms, unprompted, that nothing about the traffic-vs-checkpoint
taunt fix touches her (she doesn't reach a shareable debrief on the levels
she uses), and that the escalation-consent boundary from FG16 (no hostile
content wired into L0/L1) remains exactly where it was.

Redo? Still no for hostile content. Refer? Conditional yes — unchanged, and
for the second round running nothing new works against her, even the item
that could plausibly have cut either way.

### 🧑 Marcus, 19 — NY, Black college student, new driver, shares things that look sharp

The one persona who wants this feature outright, and the preview is a
genuine win for him specifically: "Now I can actually read the caption
before I post it instead of guessing. That's just good — I'd want to see
what I'm putting up regardless of the privacy angle."

He'd still clock the Facebook/X asymmetry, same instinct as FG17 but sharper
now that there's a concrete block of text to compare against: "The preview
says one thing, Facebook does another thing, and there's still nothing on
the button itself that says so." He'd take the checkpoint-taunt fix as a
quality signal even though it's not his use case — traffic ladder is where
he actually plays.

Redo? Yes, unchanged — still the strongest yes on the panel for this
specific feature.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user

Would still post the grid immediately, enthusiastically, on any level —
that hasn't changed and the report doesn't pretend otherwise.

What changed under him without his noticing: if he'd run the checkpoint tab
(he doesn't reliably distinguish it from the traffic ladder, per HANDOFF
and FG17), the share text no longer captions it *"Do you know your rights
at a traffic stop?"* — verified live, `_nonTraffic` correctly drops the
line for `prLevel===4`. FG17's factual-error finding is closed for exactly
the persona who would never have caught it himself. He would not notice the
Facebook/preview gap either — he posts to whatever's first and shiny — so
golden #2 doesn't reach him, said plainly rather than invented.

Redo? Unchanged, enthusiastic. The fix that helps him most this round is
one he'll never know happened.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The clipboard-failure announcement is wired to a `<div>` that never changes, for the button most likely to be tapped

**Evidence — LIVE, both paths.** `shareCopy` (`index.html:6056-6074`).
Failure branch: `lb=btn.querySelector('.lb')||btn` (scoped to whichever
button fired) writes the visible message; `w=document.querySelector('.sh-link')`
(always the same, unrelated div) receives `role="status"`. Tapping the
row's tile (`:6026`): visible text updates correctly inside the row;
`.sh-link`'s children — measured — are untouched
(`linkDivButtonTextUnchanged:"Copy link"`). Tapping the link-field's own
button (`:6031`): role and mutation share a subtree, works as designed.
Secondary, measured: the row tile's height goes 78.5px → 131.5px to wrap
the 52-character failure sentence in a 71px-wide flex item; `.sh-row` grows
to 227px for the 4-second duration.

**Impact.** This is the release's own headline claim under direct test —
*"a denied clipboard now shows a failure message instead of silently doing
nothing (verified live)"* — and it is true for a mouse or a finger and
false for a screen reader, on the more prominent of the two Copy buttons.
Omar's case exactly. Compounded by an item this project already had on
record and didn't act on: FG17 named the two duplicate Copy buttons as
redundant and recommended dropping the row's copy — had that shipped
first, this bug has no button to attach to.

**Cheapest fix that holds:** either move `role="status"` onto `lb` itself
(the element that actually changes, whichever button fired) instead of a
hardcoded `.sh-link` lookup, or finally dedupe the two Copy buttons per
FG17's own recommendation, which removes the ambiguous target entirely.
The second option closes two open items with one deletion, same shape as
FG17's own note about it.

### 2. The new message preview is a verbatim promise with one undisclosed exception, and the exception now cuts in both directions

**Evidence.** `.sh-msg`'s `textContent` is byte-identical to `msg`, which
three of four network hrefs (`wa`, `sms`, `x`) carry in full; Facebook's
href carries `?u=` only (`index.html:6008`, unchanged since FG17). The
v2.22.3 commit names this explicitly: *"the preview overstates what that
[Facebook] target gets — the safe direction to be wrong in."* No per-target
caveat exists anywhere in `#shareBody` — same zero-prose gap FG17 found for
the whole sheet, now narrowed to one button.

**Impact.** Before this round, no user could read a wrong promise because
no promise was shown (FG17 golden #2). Now one is, and reads correctly for
3 of 4 destinations. Marisol's FG17 complaint (score leaves, sheet shows
link) and Tony's FG17 case (relies on Facebook posting no score) both
resolve to the same undisclosed gap, now sharper because the preview
invites literal trust in a way a bare link field never did. The claimed
"safe direction to be wrong in" is only safe for the under-share reading;
it actively risks steering a cautious, literal reader like Tony away from
the one button that was always safe.

**Cheapest fix that holds:** one line under the preview or the Facebook
tile — *"Facebook posts the site only, not this message."* Existing-string
work, no new legal content, no EDITION bump.

### 3. `/app`'s print confirmation is still colour-only

**Evidence.** Re-checked this round, unchanged since FG16/FG17:
`PrintStep.tsx:30,115,119` — `printed` state flips two class names
(`btn ${printed?'ghost':'gold'}` and its inverse), no text, no `role`. Root's
equivalent print-outcome honesty work (v2.21.5) never touched this file.

**Impact.** Not re-ranked as new — carried forward at reduced position
because two rounds' worth of higher-severity share-sheet items now sit
above it — but still the single largest a11y/honesty gap in the product by
FG15/16/17's own standard: a colour-only success/failure signal, invisible
to Omar, easy for Dana to miss, on the one screen `/app` shares in kind
with root's now-honest print banner.

### 4. Orphaned bilingual share strings, still growing, still unrendered in `/app`

**Evidence.** `sh_preview`/`sh_copy_fail` (new this round) join the seven
FG17 already found (`sh_title`, `sh_sms`, `sh_copy`, `sh_more`, `sh_copied`,
`sh_link_a11y`, `sh_close`). Grepped `app-src/src` (excluding `content/*`):
**zero** renderers for any of the nine. `--verify` passes 2481 strings
clean because they're legitimately used in root — same structural blind
spot FG14 first named for `prx_ld*`.

**Impact.** Not new as a category — flagged three rounds running now — but
the count keeps moving in one direction while nothing decides what `/app`
does about a share surface it doesn't have. Worth a slot because "keep
extracting, never resolve" is now visibly compounding, two strings at a
time, every release that touches root's share sheet.

### 5. Root's two `.ll-seg[role=tablist]` instances are still unnamed

**Evidence.** Re-checked: `hub` (`index.html:3517`) and `lifelines`
(`:3387`) tablists both carry `role="tablist"` with no `aria-label`, in both
root and `/app`'s `LifelinesStep.tsx:102`. FG16 golden #4, unchanged across
two rounds since.

**Impact.** Lowest magnitude here, included because it is the same
per-control-not-per-shared-component pattern that produced this round's
golden #1: the share sheet, a brand-new surface, got real ARIA work this
release (`role="status"` reasoning, however imperfect) while an
already-flagged, cheaper gap two screens over did not move at all.

---

## 3. What must change in the practice MODULES specifically

Scoped to the share sheet (`shareOpen`/`shareCopy`/`shareVia`/`prxShareRun`,
`index.html:5988-6084`) and its `/app` non-parity.

- **Fix the live-region target in `shareCopy`'s failure branch** (golden #1)
  — `:6056-6074`. Scope `role="status"` to `lb` (the element that actually
  changes), not a hardcoded `.sh-link` lookup.
- **Actually dedupe the two Copy link buttons** (FG17 module note, still
  open, now doubly worth doing) — `:6026` and `:6031`. Removes golden #1's
  ambiguous second target and reclaims row width in the same stroke.
- **Add a one-line Facebook caveat near the preview or the Facebook tile**
  (golden #2) — existing-string-family work, both languages, no EDITION
  implication.
- **Give `/app`'s `PrintStep.tsx` a text state, not just colour** (golden
  #3) — carried, unchanged, `:30,115,119`.
- **Decide the nine orphaned `sh_*`/`prx_ld*`-family strings** (golden #4)
  — render on an `/app` equivalent or delete with a logged note, per FG14's
  original framing.
- **Add `aria-label` to both root `.ll-seg[role=tablist]` instances**
  (golden #5) — `:3387`, `:3517`.
- **Carry-forward, verified closed this round, LIVE:** six-target overflow
  (FG17 golden #1); sheet not closing after a tap (FG17 golden #5); `sms:`
  `target="_blank"` (FG17 golden #5's second half); checkpoint taunt
  mislabeling (FG17 golden #3's copy half — the shareability decision
  itself remains open and excluded per instruction); root/`/app` miss-count
  persistence asymmetry (new open issue #6 addendum, source-verified in both
  `prxAdvance`/`prxBack` and `practiceEngine.ts`'s `advance`/`back`, matching
  `prxSave()` placement).
- **Carry-forward, unchanged, NOT re-verified this round:** FG16 goldens #4
  (hub_progress denominator) and the four-tablist item beyond root's two
  checked above — `/app`'s hub/lifelines tablist `aria-label` state was
  outside this round's diff; do not assume closed without checking directly.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG17

**BS-1. The project verifies "does a change appear" and "does a change get
announced" as if they were the same test, and golden #1 shows they aren't
— has anyone written down the difference as a check, or does each instance
still need a human to notice the DOM subtree is wrong?** Every prior
`role="status"`/`aria-live` addition in this project's history (the
Georgia badge, the ErrorBoundary sentence, the tablist ARIA work) was
verified by confirming the attribute exists and the text changed —
correctly, because in those cases the element that changed and the element
carrying the live-region role were the same node. This round is the first
case where they weren't, and "attribute present, text changed somewhere on
screen" passed every check that ran, including a human's own "verified
live" claim in the tag annotation. The generalizable test — *does the live
region's own subtree contain the mutation, not just does a mutation occur
anywhere* — has never been written down as a checklist item anywhere in
this project's process. Is it worth one, given this is the second
consecutive round (FG17's BS-7/BS-8) where a defect was measurable the
whole time and simply wasn't the specific thing anyone checked?

**BS-2. The preview was built to close a trust gap and, for one button,
inverts which direction the dishonesty points — has the project considered
that "show the maximum, it's the safe direction" is a per-feature judgment
call that won't always be true, and should be tested rather than assumed
each time it recurs?** This round's own reasoning ("the safe direction to
be wrong in") is sound for a user who *doesn't* want their score shared and
might accidentally send it. It is backwards for a user who specifically
*wants* the safer option (Facebook) and gets talked out of it by an
overstated preview. Both users exist on this exact panel (Marisol and Tony,
respectively, wanting opposite things from the same button). "Safe
direction to be wrong in" assumes a single risk model; this feature has at
least two, held by different real personas. Is there a standing test for
"which direction is safe" that gets applied before shipping the next
claim-scoped-back fix, or is it re-judged intuitively each time, the way
BS-1 asks about announcement testing?

**BS-3. Two consecutive rounds now, the fix for one release's honest-copy
finding has itself contained an honesty gap of the same shape, one level
down — is this pattern-recursive, and where does it stop?** FG16 found
"claims outliving what they verify" as an explicit, named pattern
(`a964f58`'s own commit body). FG17 found the share sheet itself was an
instance of that pattern at the feature level (shows a link, sends a
score). This round finds two more instances *inside the fix for FG17's
finding* — the preview overstates one target's payload, and the
"verified live" claim for the copy-fail message overstates its own
assistive-tech coverage. Each fix has been narrower in scope and closer to
shipped than the last, and each has still contained one more layer of the
same shape. Is there a bottom to this, or does every fix for "a claim
outliving what it verified" get one more round to reveal its own version of
the same problem, indefinitely, simply because the codebase is large enough
that no single pass sees all of a claim's edges?

**BS-4. `sr_share_via` fires on copy success and never on copy failure —
is a failure event a privacy leak or a missing signal, and has anyone
decided which?** Verified: `ph('sr_share_via',{target:'copy'})` sits only
in the success branch (`:6060`); the catch block never calls `ph()`.
Consistent with the product's minimal-analytics posture (a failed clipboard
permission reveals nothing about the user worth protecting), but also means
the operator has no visibility into how often golden #1's failure state
fires at all, on any device, ever. If it's rare, golden #1 is a smaller
practical problem than its severity suggests; if it's common (denied
clipboard permissions are not rare on locked-down or non-HTTPS contexts),
it's a larger one. Nobody can currently tell which, by design. Is that
gap acceptable for a UI-state signal (not personal data) the way it clearly
is for user-typed content?

**BS-5. The calibration log is still empty — fourth round asking, and this
round's two headline findings are exactly the kind a real user would
surface in one sentence, unprompted, without any instrumentation.**
Unchanged: `.focus-group/members.md`'s last line is still `Calibration log:
(add real-user feedback here as it arrives)`. Tony's line in this report —
*"I'd have backed out of the one button that was always safe"* — is not a
finding that requires source-reading; it is what a real person who trusts
on-screen text literally would actually say, out loud, the first time they
used the feature. The project keeps building the infrastructure (LIVE
DOM testing, live-region subtree checks, per-scheme href verification) to
approximate what one real conversation would answer directly. The question
FG15 first asked stands unanswered a fourth round running.

---

## 5. Group read

**Would-evaluate-favorably verdict: 8 yes/conditional-yes (Rosa, Marisol,
Dana, Luis, Keisha, Marcus, Devin, Nia) / 1 conditional with a real,
different objection than last round (Omar) / 1 neutral, standing condition
unchanged (Tony).** All four items FG17 flagged as this-round's-subject
closed cleanly and were re-verified live: the overflow, the missing
preview, the checkpoint mislabeling, the sheet staying open. Nobody nets
out worse than FG17 for a feature they'd already accepted as improved.

**Biggest objection by theme.** Both new findings are the same shape
inverted: golden #1 is a fix whose own claim ("verified live") didn't cover
the audience it mattered most for; golden #2 is a fix whose own honest
framing ("the safe direction to be wrong in") is only honest for half its
actual audience. Neither is a regression in the FG16 sense — nothing that
worked before now fails — both are the specific, narrower shape FG16's BS-1
predicted: the general pattern ("a claim outliving what it verified") now
recurring **inside the fixes for the last round's instances of itself**,
one layer deeper each time.

**Highest-leverage fix, this round's subject specifically.** Golden #1 —
the live-region misattachment. Directly contradicts a claim this exact
release makes about itself, hits the panel's a11y persona by name, and has
a one-line fix (retarget `role="status"` to the actual mutated node) plus a
zero-line fix already on record (FG17's own duplicate-button
recommendation, still not taken).

**Highest-leverage fix, across the whole product regardless of surface.**
Golden #3 — `/app`'s colour-only print confirmation. Same ranking as FG16
and FG17, now three rounds running, and harder to justify each round the
honesty-copy work continues to land everywhere except this one file.

**Who this still isn't for.** Tony — no institutional backing, unchanged
across thirteen rounds, and this round is the first time a *fix* built to
help his exact case (the Facebook safety property, verified true) shipped a
side effect that argues against using it. He would still separate that
cleanly from his standing condition, on the record, same as every round
before this one.

---

## 6. Signature

Agent A, `/amparo-loop e2e-qa`. Ten personas from `.focus-group/members.md`,
same panel as FG17 (subject continuity): Omar, Luis, Rosa, Marisol, Keisha,
Dana, Tony, Nia, Marcus, Devin.

All source citations are `index.html` at `0642590` / v2.22.3 unless noted.
Overflow geometry, preview text, per-scheme `target` attributes, checkpoint
share composition, and the clipboard-failure live-region/layout measurements
were all measured LIVE in a browser against a local server serving the
actual repo file, not inferred or assumed from the commit message. `npm run
check` run to completion, all four suites PASS, 2481 strings verified
present. Items marked UNVERIFIED in FG17 (mobile app-link interception of
`wa.me`/`x.com`, `sms:`+`target="_blank"` on real iOS) were not re-tested
this round — the `sms:` half is now moot regardless, since `target="_blank"`
no longer applies to that scheme at all, confirmed by source and live DOM
read.
