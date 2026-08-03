# Wargame 04 — Mobbin component audit: 5 custom surfaces vs. shipped patterns

Date: 2026-08-03. Design reference document only. **No `index.html` edits were
made and none are authorized by this document.** Amparo stays a single static
HTML file — every recommendation below is vanilla JS/CSS, reusing classes and
state that already exist in the file. No framework or library is proposed.

**Method:** read each surface's actual implementation in `index.html` first
(cited by line), then queried Mobbin (`search_screens`) for shipped products
solving the same interaction problem, then compared what they do differently
from what Amparo does. All Mobbin links below are `mobbin_url` values returned
by the tool, current as of this audit.

---

## 1. Practice hub — progress bar ("{n} of 4 done")

**Current implementation:** `index.html:2929-2934` computes `rungsDone` over
the 4 numbered rungs only (checkpoint excluded by design — see comment at
2925-2928), renders `_t.hub_progress` ("{n} of {t} done") as text next to a
`<span class="bar"><i style="width:{pct}%">` continuous fill. CSS at
`index.html:278-280`: 6px rounded bar, `--ok` green fill, `width` transition.
Progress is also echoed per-card via the `.pr-donebadge` "Done" badge and the
🟩-prefixed best-score line (`index.html:2938-2944`) — i.e., the same
completion state is shown twice: once aggregated (the bar), once per-item
(the badge).

**Mobbin references:**
- [Centr](https://mobbin.com/screens/c86e3f26-9de2-4aee-8353-3b0c793799e7) (fitness) — shows a thin continuous "Progress 1/84" bar for the *program* (large set), but for the *current week* (a small fixed set, same shape as Amparo's 4 rungs) it switches to a row of 5 numbered circles with a checkmark/fill per completed day. Two different visual grammars for two different set sizes.
- [Deel](https://mobbin.com/screens/e69b658b-6b4c-45f9-916d-6213f1119eb1) — "Complete your onboarding — 100% COMPLETED" continuous percentage bar directly above a checklist, each row with its own "Continue" pill. Same continuous-bar choice Amparo made, for a similarly small onboarding set.
- [Duolingo](https://mobbin.com/screens/21f4097f-290b-438c-8f84-85f616578231) — no aggregate bar at all for the skill path; completion is read entirely off the path nodes themselves (stars/lock state), no separate summary widget.

**What's different:** Centr is the only reference that special-cases the
*small, fixed* set the way Amparo's rungs are — and it deliberately drops the
continuous bar in favor of discrete numbered circles for that case, reserving
the smooth-gradient bar for the large 84-item program. Deel keeps a continuous
bar for a small set and it reads fine. So the field is split, not settled —
Amparo's choice isn't wrong, it's just the less-common of two legitimate
options for a set this small (4 items).

**Verdict: keep as-is.** Deel validates the continuous-bar choice directly,
and Duolingo shows a summary bar isn't even required when per-item state is
legible on its own — Amparo's badge-per-card already provides that redundancy,
so the current bar+badge combo is over-signaled if anything, not under-tested.
If ever revisited, Centr's discrete 4-segment bar (four flex divs instead of
one gradient `<i>`) is the one concrete upgrade worth 10 minutes, since it
would let a glance count "which 2 of 4" without reading the text label — but
this is a nice-to-have, not a fix for a broken pattern.

---

## 2. Practice hub — "At your door" empty/not-yet-built tab

**Current implementation:** `index.html:2922-2923` renders a `.pilot` block
in place of the progress bar + grid when `_hubTab===1`. Copy at
`index.html:1488-1489` (EN) / `1802-1804` (ES): a heading ("Not built yet —
and we won't fake it.") plus **two full paragraphs** explaining *why* — every
line needs attorney review, and a knock at the door is often a DV call, which
changes what safe advice looks like. No button, no link, no way to do
anything but read and switch tabs back.

**Mobbin references:**
- [Digg](https://mobbin.com/screens/5a5f0814-32cf-489f-a596-6ce747a60fb3) — "Community Creation Coming Soon," icon + heading + two short sentences on *why* it's not ready yet. Closest match in spirit (an actual reason, not just "soon"), but roughly a third the length of Amparo's copy and on its own full-screen route, not living inside a tab a user can flip back out of.
- [Poolsuite FM](https://mobbin.com/screens/712f2982-1ac6-4077-8a69-e6ecdc96e98f) — "A transmission from the tropics... coming soon" plus a **"Notify Me" button**. The one reference that gives the user an action instead of only prose.
- [Pillow](https://mobbin.com/screens/44055721-dadb-465e-aaa2-ad6231e85d58) — segmented pill tabs (Tips / Insights / Challenges) above content, exact structural twin of Amparo's `.ll-seg`-above-empty-content layout — but the empty tab itself is just "No items yet." One line, no explanation at all.
- [Coursera](https://mobbin.com/screens/5c9a68a2-8d38-45f4-9128-f3bda5093cf3) — empty "Notes" tab under a tab strip: "You haven't saved any notes yet." Same one-line convention.

**What's different:** every shipped reference here is a one-liner except
Digg, and even Digg is shorter than Amparo's two paragraphs. None of them
match Amparo's move of explaining the *legal and safety* reasoning behind the
delay — because none of them have that reasoning to give. That's the
tell: Amparo's copy length isn't an unconsidered overshoot, it's answering a
specific, already-litigated problem the code comment names directly (hiding
the module entirely made "47 federal-only states" read as broken). The one
thing every reference *does* have that Amparo doesn't is Poolsuite's action —
a way to do something other than read and leave.

**Verdict: keep the copy, add one cheap action.** Don't trim the explanation
— it's load-bearing and the in-code comment shows the shorter/hidden version
already failed in practice. But Amparo already collects `data.email` earlier
in the funnel (used by `sendPackEmail()`, gated on `REVIEW.emailEnabled &&
data.email` — `index.html:2861`). Wire a "let me know when this ships" line
into the existing `.pilot` block that reuses that same email-capture state
instead of the prose being a dead end — zero new infrastructure, same
pattern Poolsuite uses, scoped to a few lines of vanilla JS.

---

## 3. Practice hub — locked content (Hard mode gated on 3 completions)

**Current implementation:** `index.html:2907-2908` — `mUnlocked =
prx.done[0]&&prx.done[1]&&prx.done[2]`, `locked = i=>(i===3)&&!mUnlocked`.
Rendered at `2938-2944`: locked card gets `.lock` (opacity .55, `cursor:
default`, hover disabled — CSS `265-266`), `aria-disabled="true"`, a
`title` tooltip, **and** its status line shows `_t.hub_locked` = "Finish the
first three to unlock" as visible on-card text (`2944`), not just a hover
tooltip. `onclick` is the empty string when locked — fully inert, no
navigation. Enforced again at the engine level in `prxTab()`
(`index.html:4195-4200`), which pulses a `.prx-lockhint` if someone reaches
level 3 another way.

**Mobbin references:**
- [Duolingo](https://mobbin.com/screens/21f4097f-290b-438c-8f84-85f616578231) / [Duolingo ABC](https://mobbin.com/screens/7599d3b5-26c2-466e-98a3-2687ac207c95) — grey circle + lock glyph on path nodes, dotted connector line. No visible reason on the node itself; the "why" (if surfaced at all) requires a tap.
- [Tolan](https://mobbin.com/screens/e158d7ae-629d-4258-a35d-f3458ec4d089) — flat list rows, "Level N" + trailing lock glyph, greyed text. Closest layout to Amparo's card (a list of numbered levels), same silent-lock convention as Duolingo.
- [Bloom](https://mobbin.com/screens/cd97cdeb-d0ea-4bbd-afb9-7b47b2887614) — a "LOCKED" badge in the card corner **plus an actual "Unlock term" button** with a lock glyph inside it, inside the card. The card stays tappable/interactive rather than going dead.
- [Life Reset](https://mobbin.com/screens/cb3e87ef-1183-486f-bd20-2f465417d486) — dark habit-path, lock icons on future nodes, one highlighted "current" node. Path metaphor, same silent-lock convention.

**What's different:** three of four references (Duolingo, Duolingo ABC,
Tolan, Life Reset) communicate *only* "locked," not *why* or *what unlocks
it* — that information is either absent or hidden behind a tap. Amparo
already beats that: `hub_locked`'s "Finish the first three to unlock" is
static, visible, on-card text, no tap required. Only Bloom does better, and
it does it by a different mechanism — it keeps the locked card **tappable**
(an actual button, presumably routing to whatever unlocks it) instead of
inert.

**Verdict: keep the visible-reason text (it already outperforms most of the
reference set); consider making the locked card actionable.** Amparo's
locked `.pr-card` has `onclick="${isLk?'':...}"` — i.e., nothing happens on
tap. Bloom's pattern suggests a specific, scoped change: route a tap on the
locked card to whichever of levels 0–2 isn't done yet
(`[0,1,2].find(i=>!prx.done[i])` → `prStart(i)`), turning a dead end into a
one-tap shortcut to the thing that actually unlocks it. This is optional —
the current static-text version is already above the reference-set median —
but it's a small diff if picked up.

---

## 4. State picker (step 1)

**Current implementation:** `index.html:2746-2774` — a 3-column CSS grid
(`.state-grid`, CSS `131`) of 50+ `.state-btn` tiles, cited states floated to
top (`s_pri_label`/`s_rest_label` split), free-text search via `#stateSearch`
(`oninput="filterStates(this.value)"`, logic at `3054-3077`, page-scroll-only,
deliberately no nested scroll container per the comment at `126-130` citing
94.5% pre-pick drop-off and Texas sitting at position 44/51). On pick
(`pickState`, `3089-3101`), the grid **retracts in place**: all other tiles
get `hidden`, the chosen tile becomes a full-width `.confirmed` row (CSS
`554-563`), and a `stateChangeLink` ("Change") appears as the escape hatch
(`uncollapseStateGrid`, `3202-3206`).

**Mobbin references:**
- [Monzo](https://mobbin.com/screens/eeb6acce-7440-4f32-ba83-e478c0f8625b) — search bar + flat checklist (flag + name + checkbox), fixed "Next" CTA. Selecting doesn't collapse anything — the list stays exactly as long as it started.
- [Vivid](https://mobbin.com/screens/a09ec382-2a5d-4713-b204-02ffb7a6cd66), [Chase UK](https://mobbin.com/screens/896a3572-be4a-4dc6-b478-331266ab2d59), [Docusign](https://mobbin.com/screens/19ac4b2a-19d8-4fce-9dab-a67ccafd3fcf) — same job (search + pick 1 of ~50+ countries), but all three run it as a **modal sheet**: tapping a row dismisses the sheet and returns you to the parent screen. There's no "collapsed state" to design because the full list was never inline on the main screen to begin with.
- [Life Reset](https://mobbin.com/screens/77a871d8-907a-4604-bf57-470831db26c2) — closest analog: search narrows to a single matching tile, shown selected (checkmark, colored border) under the search field, with a fixed "Confirm" button. Still a search-to-one-result flow, not a 50-tile grid physically retracting.

**What's different:** none of the five references solve Amparo's actual
constraint. The standard shipped answer to "pick 1 of ~50 region options" is
to **not** keep the list inline at all — push it to a sheet/route and dismiss
on selection (Monzo, Vivid, Chase UK, Docusign). Amparo can't do that without
restructuring the step-based wizard shell (every other step is a single
in-place card; a sheet would be the only modal-routed selection in the whole
flow). Life Reset gets closest to the *spirit* of collapsing to one answer,
but even it only ever renders one result row, never retracts a populated
grid.

**Verdict: keep as-is.** This is the one surface where Mobbin has no direct
precedent to hold Amparo to — the collapse-in-place behavior exists because
the standard solution (sheet-and-dismiss) doesn't fit the single-card wizard
shell, not because nobody thought to look. The in-code comments already show
this was iterated against real usage data (the 94.5% drop-off, "Texas at
position 44 of 51," the explicit "not your state?" escape hatch requirement)
rather than designed in a vacuum. Nothing in the reference set is a better
fit for this specific constraint.

---

## 5. Lifelines/covers carousel (step 3)

**Current implementation:** `index.html:2807-2816` — `.ll-seg` segmented
tab pair (`_t.seg_lines` / `_t.seg_covers`) directly above one `.ll-track`
(CSS `288-290`: `overflow-x:auto`, `scroll-snap-type:x mandatory`,
scrollbar hidden), `.ll-card` at 86% width so the next card always peeks
(CSS `291-295`). `llTab()` (`3128-3159`) swaps the track's content between
`st.lifelines` and `SCEN[lang]` depending on which tab is active — one
track, two datasets, never two parallel carousels. `llSync()`
(`3162-3171`) derives the active dot from scroll position (no duplicated
index state); `llGo()` (`3172-3176`) scrolls to a card on dot-tap. Continue
is never gated on swiping through the cards (comment at `3123-3127`
explicitly rejects that, citing a real user who "skips all of that").

**Mobbin references:**
- [KOHO](https://mobbin.com/screens/4b23b4c0-71cb-4baf-a742-9ee66a6256c7) — "Discover / My Perks" pill segmented control directly above one horizontal card carousel, dot pagination below. Structural twin of `.ll-seg` + `.ll-track` + dots.
- [Cleo AI](https://mobbin.com/screens/27d8b550-e413-4ea9-b31d-ee17af67e2ea) — "Overview / Budget / Debt" pill tabs above a swipeable card carousel, dots underneath. Same shape again.
- [MyFitnessPal](https://mobbin.com/screens/ac2bee90-71be-488f-9f1b-21f71450d01e) — "EXPLORE / MY ROUTINES" underline-style segmented tab gating which horizontal carousel section renders below.
- [Apple Fitness](https://mobbin.com/screens/92e0f8b7-069a-460a-a2e7-6574d44a9b9e) — pill tab row at the page level, with a second, independent peek-carousel ("Activity Types") underneath it.

**What's different:** nothing, structurally. KOHO and Cleo AI in particular
are near-exact matches for pill-segment-above-one-track-plus-dots. The
in-code comment at `index.html:255-258` already cites this exact rationale
(Apple Fitness, KOHO, Vivid, Nu, GoHenry — "every two-dataset reference
pattern resolves it the same way: one content area, a segment picker
above it") — the Mobbin search independently confirms the same set of
precedents rather than surfacing anything the implementation missed. The
one place Amparo goes further than KOHO/Cleo is instrumentation: `llSync`
drives a live `aria-live` card counter ("card 1 of 6") off scroll position,
which neither reference app exposes — that's a net accessibility add, not a
gap.

**Verdict: keep as-is.** This is a textbook implementation of an
already-well-tested pattern, not a custom risk needing review. No change.

---

## 6. Mute control (practice engine)

**Current implementation:** `index.html:3884-3895` — `prxMuted` boolean,
persisted to `localStorage['amparo_muted']`. `prxMuteTgl()` flips it, tears
down any in-flight `prxAudio`/`speechSynthesis`, and calls
`prxWaveTgl(false)`. Rendered at `4544` inside `.prx-ctrls` (CSS `369-370`):
a `<button class="prx-hear">` whose *only* state signal is its own text
swapping between `_t.prx_mute` ("Mute") and `_t.prx_unmute` ("Unmute") —
same visual weight/class as its sibling "🔊 Hear it again" button, which
itself **disappears** when muted (`${prxMuted?'':...}`) rather than changing
state. The row also holds gender (m/f) and, in Spanish mode, voice-language
(EN/ES) toggle pills — four to five small text buttons of equal visual
weight competing for attention.

**Mobbin references:**
- [Character AI](https://mobbin.com/screens/8c6b1b4b-0b90-40e4-b4b5-b6e3d3830363) — closest product-shape match: an AI character delivers lines over a full-bleed avatar, exactly like Amparo's officer bubble. When muted, a **persistent "Muted" caption** floats over the avatar itself (not just the button), plus a circular mic-slash icon button labeled "Unmute" below.
- [LINE](https://mobbin.com/screens/aa48eed0-dad9-463f-b021-d7a5388162b7) / [WeChat](https://mobbin.com/screens/b779925a-5f37-4346-a779-f18562aa9987) / [Messages FaceTime](https://mobbin.com/screens/d51b6f2c-8ea8-4b45-90f3-bc43a358ac40) — circular icon-first buttons: mic-slash glyph above a one-word label, in a row of similarly-iconed controls (speaker, keypad, end). State reads off the icon, not just the word.
- [Snapchat](https://mobbin.com/screens/3c6fb957-acf0-49a1-b546-3afd25f818db) — inline toggle **switch** labeled "Mute Snap Audio" inside a capture toolbar — text+switch instead of icon, but the switch position is an unambiguous binary-state signal on its own.
- [Grok](https://mobbin.com/screens/16fde1d6-8682-4e22-b9fe-26cc9a20dcf4) voice mode — row of circular icon buttons; the active/toggled mute button is filled **orange**, color-coding the on-state against neutral-grey siblings.

**What's different:** every reference gives the muted state a signal that
survives *not reading the button text* — a persistent caption over the
talking character (Character AI), an icon swap (LINE/WeChat/FaceTime), a
physical switch position (Snapchat), or a color fill (Grok). Amparo's is the
only one of the five that relies solely on a text-label swap inside a row of
otherwise-identical text pills, and the row visibly shrinks when muted
(the "Hear it again" sibling vanishing) rather than the mute control itself
visibly changing — which can read as a button disappearing, not as mute
engaging.

**Verdict: specific change.** Two small, scoped moves, both reusing patterns
already in the file rather than inventing new ones: (1) give `.prx-hear`'s
mute button an icon — the file already hand-rolls inline SVGs elsewhere
(e.g. `.prc-home svg`, `index.html:373`), so this is consistent, not novel;
(2) apply an `.on`/active class to the mute pill when `prxMuted` is true,
reusing the exact `.prx-vbtn.on` filled-state grammar already defined two
buttons to its right in the same row (gender/voice toggles). Both are CSS +
one class-toggle in `prxMuteTgl()`, no new state, no new dependency.

---

## 7. Print screen — primary action + secondary disclosure

**Current implementation:** `index.html:2851-2864` — `#printBtn` is `gold`
(primary) until a real print completes, then demotes to `ghost`
(`index.html:4712`); `#postPrintActions` starts `display:none` and is only
revealed (`4706`) inside the `afterprint` listener (registered `4692`,
handler body from `~4695`). The reveal is gated on a real
`window.addEventListener('afterprint', ...)` firing — a genuine browser
event that only fires after the OS print dialog closes — **not** on the
button click itself. The code's own comment at `4666` is candid about the
limit of that signal: "afterprint fires on Cancel too — browsers can't tell
us the outcome," so `hasPrinted` is still optimistic, just optimistic-after-
a-real-dialog-interaction rather than optimistic-on-click. Once revealed,
`postPrintActions` exposes a primary "Open practice" `.arow` plus a
collapsible "▾ more" section (email pack, reprint reminder, family print,
restart) — i.e., a second layer of disclosure *within* the already-gated
block.

**Mobbin references:**
- [Numo](https://mobbin.com/screens/8ca51327-83b0-4603-a93a-0f8dcf9dccf9) — the one direct match: after an image finishes generating/downloading, a confirmation pill ("Image downloaded") appears **and** a row of secondary actions (Instagram / Download / More) appears below it, gated behind that completion — same two-step reveal shape as Amparo's `printedBanner` + `postPrintActions`.
- [eBay](https://mobbin.com/screens/3f6d2b8e-52bf-4bff-b5a4-507ab4091c63) — "Nice work!": primary (filled) and secondary (outline) buttons both visible immediately, nothing gated. The more common shipped shape.
- [CVS Health](https://mobbin.com/screens/e14ec076-0dcf-4e3b-beec-30180011d646) — primary filled button + a plain-text link below ("Reconnect records"), both immediately visible — matches Amparo's `.arow`-vs-`.linkbtn` weight split, minus the gating.
- [Lyft](https://mobbin.com/screens/3378f833-81d1-494c-a32a-da4d08ad565d) — same immediate-both-visible shape (filled "Let's go" / lighter "Got it").

**What's different:** the dominant shipped pattern (eBay, CVS Health, Lyft,
and the earlier Copilot Money / Cosmos hits) shows every action immediately
— weighted by emphasis, never hidden. Numo is the only reference that gates
secondary actions behind a completed primary action the way Amparo does,
and Amparo's trigger is arguably stronger: Numo's "downloaded" state is a
resolved JS promise (optimistic the moment the client thinks it's done),
while Amparo's is a real OS `afterprint` event — closer to the metal, even
if (per the code's own admission) it still can't distinguish a completed
print from a cancelled dialog.

**Verdict: keep as-is.** The gating is intentional and matches the one
close shipped precedent found (Numo), the "never two gold buttons" rule is
already enforced exactly the way the majority reference set enforces it
(one filled button max, everything else outline/link-weight), and the
`afterprint`-vs-click distinction is already a more honest signal than most
apps bother to reach for. No change.

---

## Summary

| # | Surface | Verdict |
|---|---------|---------|
| 1 | Hub progress bar | Keep as-is (Deel validates continuous bar; Centr's discrete-segment alternative is optional) |
| 2 | Hub empty "At your door" tab | Keep copy, add a "notify me" action reusing `data.email` |
| 3 | Hub locked Hard mode | Keep visible-reason text; consider making the locked card route to the unfinished prerequisite (Bloom pattern) |
| 4 | State picker | Keep as-is — no shipped precedent fits the inline-wizard constraint better |
| 5 | Lifelines carousel | Keep as-is — textbook match to KOHO/Cleo AI |
| 6 | Mute control | Specific change — add an icon + reuse existing `.prx-vbtn.on` active-state class |
| 7 | Print screen disclosure | Keep as-is — matches the one close precedent (Numo), signal is stronger than most |
