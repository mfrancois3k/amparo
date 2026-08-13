# Amparo — focus group 14: the hub rebuild closes FG12's #1 finding and loses the tab you were standing on (v2.21.0 / v2.21.1)

Date: 2026-08-13. Run against `2fe1087` (HEAD), tag `v2.21.1`. Working tree
clean — `git diff` is empty, so every claim below is read out of committed
source. Subject: `f1af062` (v2.21.0), which replaced `/app`'s flat practice
list with `app-src/src/screens/practice/PracticeHub.tsx` — root's real 3-tab
step-5 hub — and **deleted** `PracticeLevelSelect.tsx` outright; plus
`b5ed755` (v2.21.1), which applied FG13 golden #2's stale-best fix to root
`index.html`, the second-ever root edit of this migration.

**Method note.** Every claim is verified directly against `index.html`,
`app-src/src/*`, or a `node -e` dump of the content banks — never taken on a
commit message's or a prior report's word. Verified this round:
`PracticeHub.tsx` read in full (133 lines) against `index.html:3415-3484`
line by line; `index.html:3864-3865` for `_hubTab`'s storage class and
`hubTab()`'s mutation, versus `PracticeHub.tsx:42`'s `useState(0)` and
`PracticeStep.tsx:134`'s IDLE-only mount; `index.html:3467` (`aria-disabled`,
no `disabled`) against `PracticeHub.tsx:113-117` (`disabled` **and**
`aria-disabled`); `index.html:5436-5439` for root's own written rationale on
keeping locked levels reachable; `index.html:5493` and
`practiceEngine.ts:296-302` compared side by side to confirm the v2.21.1 root
fix and the `/app` fix are the same algorithm; `node -e` dumps of
`t.en.json`/`t.es.json` for all fourteen `hub_*` keys (all present, all
bilingual) and for `prx_ld1`-`prx_ld5`/`prx_sel_sub`/`prx_locked` (present,
bilingual, and now **unrendered anywhere in `app-src/src`** — grepped);
`practice.json` dumps confirming `PRX_LEVEL_IDS=[0,1,2,3,4]`,
`PRX_UNSCORED=[3,5,6,7]`, `PRX_LEVELS[2].ids=[3,2,7]`; `shell.css:59-60` and
`LifelinesStep.tsx:81-88` against `PracticeHub.tsx:72-76` for the shared
`.ll-seg` ARIA contract; `app-src/package.json` scripts for the
`verify:content` build gate; `practice.css:28-80` for every class the hub
renders. Attorney/UPL review is excluded from findings — known, tracked, not
new. `PRX_VAR[2]`/`PRX_VAR[7]`'s missing hostile variants and the resulting
`PRX_DIVERGE[2]` double no-op are the operator's own logged open decision and
are **not** re-litigated here.

---

## 0. What's actually new this round, verified against source

| System | File | What it is |
|---|---|---|
| 3-tab practice hub | `PracticeHub.tsx` (new, 133 lines) | FG12 golden #1 is **closed**. Traffic / Checkpoint / Door tabs, checkpoint filtered out of the ladder (`:47`), progress bar counting only rungs 0-3 (`:33,48`), checkpoint's own context note (`:86`), the door tab's honest unbuilt panel (`:80`). All fourteen `hub_*` strings render, bilingually. |
| Flat list deleted | `PracticeLevelSelect.tsx` (gone) | One enumeration screen, not two. `PracticeStep.tsx:117`'s "← All scenarios" now returns to the hub. |
| Stale-best fix, root | `index.html:5490-5493` | FG13 golden #2 shipped to root. Shape-aware: `_sameShape` gates the numerator compare, otherwise replace. `practiceEngine.ts:296-302` is the identical algorithm — verified, not assumed. |
| `.ll-seg` promoted | `shell.css:59-60` | Moved out of `lifelines.css` (`:13-14` left as a pointer). Two consumers now: lifelines tabs, hub tabs. |
| Build gate | `app-src/package.json` | `build` = `verify:content && tsc -b && vite build`; `check` runs four suites. Content drift can't ship silently. |
| **New finding 1 — the hub forgets which tab you were on** | `PracticeHub.tsx:42` vs `index.html:3864` | Root's `_hubTab` is a module-scope `let`, mutated by `hubTab()` (`:3865`), never reset — it outlives the screen. `/app`'s is `useState(0)` in a component `PracticeStep.tsx:134` unmounts the instant you pick a level. Leave the Checkpoint tab, come back, you're on Traffic. |
| **New finding 2 — locked cards are keyboard- and screen-reader-unreachable** | `PracticeHub.tsx:113-117` vs `index.html:3467` | `/app` adds native `disabled`. Root deliberately does not — it uses `aria-disabled` + an omitted onclick, and states why at `:5437-5439`. A `disabled` button leaves the tab order, and its `title` (`hub_locked`, the only explanation of the lock) never surfaces. |
| **New finding 3 — the delete orphaned real bilingual content** | `t.en.json`/`t.es.json`, `practice.css:57-79` | `prx_ld1`-`prx_ld5` (the "what happens" one-liners), `prx_sel_sub`, `prx_locked` — all present and fully bilingual, all now with zero renderers. `.prx-list`/`.prx-lcard`/`.prx-lockhint` CSS (23 lines) is dead too. `/app` no longer has any screen that says what a scenario *is* before you enter it. |

**Confirmed correct, not a finding:** the hub's fourteen strings are all
present and natural in both banks (`node -e` dump, §1 Marisol below); every
CSS class the hub renders exists in `practice.css`/`shell.css`; `PRX_UNSCORED`
correctly suppresses Hard Mode's score on the hub card (`PracticeHub.tsx:106-108`,
closing the leak root's own comment at `:3470-3477` describes); the streak
counter survives the deletion (`PracticeBeat.tsx:69`, `PracticeDebrief.tsx:93`)
and is not part of finding 3; and the reduced-motion branch in `pick()`
(`:56-57`) correctly skips the 260 ms pulse delay rather than shipping it as
latency.

---

## 1. Ten persona reactions

**Selection rationale.** Nia, Keisha, Devin, Omar, Dana, Wes, Ana, Rosa,
Marisol, Tony. Eight hold from FG13 because this round's subject is the exact
screen their standing lenses own (categorical separation, speed-scan,
game-loop narrative, screen-reader parity, completionism, code legibility,
half-finished allergy, institutional trust). **Marisol swaps in for Marcus**:
the hub is the first screen to actually *render* six previously-extracted
Spanish strings, and register-not-translation is her named lens, while
Marcus's shareability lens has no new surface here (share text untouched).
Luis and Ray sit out for the same reason as prior rounds.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Her FG12 complaint is answered, cleanly and in full.** Checkpoint is back
  on its own tab (`PracticeHub.tsx:46-47` filters `CK=4` out of the ladder and
  renders it alone), with its own context note (`:85-87`, `hub_ck_note`:
  "A fixed Border Patrol checkpoint — not a traffic stop"). The categorical
  boundary root drew for the reason her lens cares about
  (`index.html:3435-3439`) exists in `/app` again. This is the fix, delivered.
- **And new finding 1 takes part of it straight back.** She is the persona
  most likely to use Checkpoint *instead of* the escalating ladder — that's
  the whole point of the split. Every time she finishes or exits a checkpoint
  drill, `PracticeStep.tsx:134` unmounts the hub and remounts it at
  `useState(0)` — Traffic. She lands on the escalation ladder she was
  deliberately routed away from, with Hard Mode ("You do everything right. It
  escalates anyway.") visible on the grid, on every single return trip. Root
  does not do this: `_hubTab` (`index.html:3864`) survives.
- **Redo? Still no for hostile content. Refer? Conditional yes** — unchanged
  in verdict, but this is the first round where a fix aimed at her lens and a
  regression against the same lens shipped in one commit.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **FG12 golden #5 is closed for her by name.** `hub_progress` renders
  (`PracticeHub.tsx:89-92`) as a real `role="status" aria-live="polite"` bar,
  "{n} of {t} done" plus a fill. That is the single glanceable number FG12
  said the flat list cost her, and it's back.
- **But the flat list she was measured as navigating faster is gone, and
  finding 3 is the part that actually bites.** `prx_ld1`-`prx_ld5` are one-line
  descriptions of what each scenario *is* — "You're ordered out of the car.
  Higher stakes." — rendered by root's list (`index.html:5450`, `lc-d`) and by
  nothing in `/app` now. Hub cards are title + status only. For a persona who
  decides in under 30 seconds which single drill is worth her time between
  fares, "Traffic stop 3" with no description is strictly less decidable than
  the flat list she had last round. She gained a progress number and lost the
  copy that tells her what to pick.
- **Redo? Yes — narrower than FG12's "the list works for her."** The tabs cost
  her a tap; the missing descriptions cost her the decision.

### 🧑 Devin, 16 — TX, Dana's son, actual end user rather than buyer

- **The ladder finally reads as a ladder, which is the thing he wanted.**
  Four numbered rungs on one tab, a progress bar counting exactly those four
  (`:33,48`), checkpoint out of the run of cards it was interrupting. FG12's
  "tonal break in the middle of what should read as one progression" is gone.
- **The progress bar says "0 of 4" and one of the four cannot be started.**
  `RUNGS=[0,1,2,3]` includes Hard Mode, and `isLocked(3, …)`
  (`practiceEngine.ts:122-123`) is true until 0, 1 and 2 are all done. A
  first-time player is told he's 0 of 4 through a set whose fourth item is
  locked from a screen that doesn't explain the lock to him in text. Root is
  identical here (`index.html:3456`), so this is inherited, not introduced —
  but the hub is the first `/app` screen to state it as a *number*, which is
  what makes it readable as a target rather than implied by an icon.
- **Redo? Yes, more so than FG12** — the game shape is right now.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **New finding 2 is his round's headline, and it's a genuine regression
  against root, not a deferral.** `PracticeHub.tsx:114` sets native
  `disabled` on locked cards. A `disabled` button is removed from the tab
  order and its `title` is not announced — so `hub_locked` ("Finish the first
  three to unlock"), the *only* text explaining why a card is dim, is
  unreachable for him. Root refuses to do this on purpose and wrote down why
  (`index.html:5437-5439`): "hiding them made them undiscoverable, and a
  locked tab still tells you the level exists." `index.html:3467` carries
  `aria-disabled="true" title="…"` and simply omits the onclick — reachable,
  announced, not activatable. `/app` is the stricter and worse of the two.
- **New finding 1 hits him harder than a sighted user.** A sighted user
  glancing at the hub sees instantly which tab is active. He gets
  `aria-selected` on re-focus — but only if he goes looking. Being silently
  relocated to a different module between drills is exactly the kind of
  context loss a screen-reader user pays the most for.
- **The `.ll-seg` promotion moved the CSS and left the ARIA behind.**
  `shell.css:59-60` is now shared by two consumers.
  `LifelinesStep.tsx:82-85` gives its tabs `aria-controls="llTrack"` pointing
  at a real `role="group"` container (`:88`) — root does the same
  (`index.html:3311-3314`). `PracticeHub.tsx:73-75` has `role="tablist"`,
  `role="tab"`, `aria-selected` and nothing else: no `aria-controls`, no id or
  `role="tabpanel"` on the panel it swaps, and neither consumer has
  arrow-key roving focus. Root's hub tabs are equally bare
  (`index.html:3440-3443`), so this is inherited — but the codebase now
  describes `.ll-seg` as "one shared segmented-control grammar"
  (`lifelines.css:13-14`, `practice.css:26`) while shipping two different
  accessibility contracts under that one name.
- **Would he want all three fixed? The `disabled` attribute first** — it's one
  attribute, it's a regression from root rather than a deferral, and it
  silences the only explanatory text on the screen.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **FG13 golden #2, her finding by name, shipped to root — verified, not
  taken on the commit's word.** `index.html:5490-5493` now computes
  `_pbTotal`/`_sameShape` and replaces an incomparable best outright rather
  than letting a stale `"2/2"` outlive a `"2/3"`. `practiceEngine.ts:296-302`
  is the same algorithm in `/app`. Both banks fixed, one loop after she raised
  it. That is the fastest turnaround from persona finding to shipped fix in
  fourteen rounds.
- **The hub gives her the record view she's been reading off the cards.**
  `PracticeHub.tsx:108` renders `🟩 {best}` as a whole fraction per card, and
  the progress bar gives the aggregate. For a repeat-drill parent tracking
  exact numbers, this is the screen she wanted.
- **New finding 1 costs her one tap per replay and nothing more** — she runs
  the traffic ladder, which is tab 0, so the reset lands where she already
  was. Naming this explicitly because it's the counterexample: finding 1 is
  not universal, it is specific to anyone whose module isn't the default.
- **Redo? Yes. Refer? Yes** — unchanged, and this is her strongest round.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He'd read `PracticeHub.tsx:38-41`'s own comment and catch finding 1 from
  it.** The comment says: "Root keeps this in a module-scope `_hubTab` because
  its render is a full innerHTML rebuild; component state is the direct
  equivalent." It is not the direct equivalent, and the file two doors down
  proves it — `PracticeStep.tsx:134` mounts `PracticeHub` only under
  `phase === 'IDLE'`, so root's variable outlives the screen and React's state
  does not. This is a comment asserting a parity that the code adjacent to it
  breaks; his profile finds those from the diff alone.
- **Finding 3 is the sharper structural read for him.** The header comment
  argues at length (`:15-21`) for collapsing two screens into one, and the
  argument is sound — `/app`'s practice is a route, not a modal, so a second
  in-run list would reintroduce mixed-in checkpoint one click deeper. But the
  argument doesn't account for what root's second screen was *carrying*: seven
  bilingual description strings and a lock hint. Deleting the renderer was
  right; nothing picked up its payload. Twenty-three lines of dead CSS
  (`practice.css:57-79`) are the tell he'd notice first.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **The rebuild is the best example this migration has produced of the
  pattern that keeps her quiet.** `PracticeHub.tsx:1-22` states what was
  wrong, cites the audit and the two independent reviews that found it, and
  explains the deletion rather than leaving dead-but-reachable UI. That is the
  acknowledged-cut discipline, applied to a fix rather than a deferral.
- **And it contains one sentence that is now false.** `:38-41`'s "component
  state is the direct equivalent" (finding 1). Her allergy is not tuned to
  gaps — it's tuned to the distance between what a comment claims and what the
  code does. This is a smaller instance than FG12's `PrintStep` gap but a
  sharper one: an unlogged cut is silence, an incorrect parity claim is a
  wrong answer sitting in the file a future porter will trust.
- **Finding 3 is unlogged in the same way FG12's print banner was.**
  `PracticeHub.tsx`'s comment defends the deletion of the *screen*; nothing
  anywhere records that seven bilingual strings and a lock hint lost their only
  renderer with it.
- **Redo? Yes for what's built. Refer? Leaning conditional** — unchanged
  shape.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **All fourteen hub strings render in both languages — dumped and read, not
  assumed.** `hub_m3`→"Retén", `hub_ck_note`→a full natural sentence,
  `hub_progress`→"{n} de {t} completados", `hub_m2_h`→"Todavía no está listo —
  y no vamos a fingir que sí." The door tab's honesty survives translation
  intact, which is the line she'd judge the product on.
- **Finding 3 costs her more than it costs an English reader.** The seven
  orphaned strings are fully translated Spanish that someone wrote, reviewed
  and shipped, and no Spanish-speaking user will ever see them. Her son
  picking a scenario in `/app` gets a title and a status; in root he gets "Te
  ordenan bajar del auto. Más en juego."
- **Redo? Yes.** Unchanged; the hub itself is a clean bilingual pass.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts

- **First round with a surface for her lens, and the Spanish reads as
  written, not translated.** "Retén" for checkpoint is the word actually used,
  not a calque of "checkpoint." `hub_m2_h`'s "y no vamos a fingir que sí"
  carries the English's refusal-to-fake tone rather than flattening it into a
  neutral "próximamente." `hub_sub` keeps the glovebox image. This is the
  register test she's defined by, and the hub passes it.
- **Her standing payment-trail objection is untouched** — no surface here
  touches it, and this report does not manufacture one.
- **Finding 2 has a language-neutral cost she'd still flag:** `hub_locked`
  exists correctly in Spanish ("Termina los primeros tres para desbloquear")
  and, on a `disabled` button, is unreachable in either language.
- **Redo? Yes on content quality.** New verdict — no prior round had a screen
  for her to react to.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Nothing here moves his standing condition.** The beta banner
  (`App.tsx:82-90`) is unchanged; a rebuilt entry screen and a score-compare
  fix don't touch institutional backing, which is the only thing his verdict
  has ever hinged on across ten rounds.
- **The door tab is the part he'd credit out loud.** `hub_m2_h`: "Not built
  yet — and we won't fake it." A product that lists a module it hasn't built
  and says so plainly is the register he trusts from institutions and almost
  never gets from apps. Worth recording even though it doesn't move him.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Persist the hub's tab across a drill

**Evidence.** `index.html:3864`: `let _hubTab=0;` — module scope.
`index.html:3865`: `function hubTab(i){ _hubTab=i; …; render(); }` — mutated
on tap, never reset anywhere in the file (grepped: the only other reads are
`:3441-3443`, `:3445`, `:3454`). Root's hub re-renders from `innerHTML` on
every navigation, and the variable survives all of it, so root returns you to
the module you left. `PracticeHub.tsx:42`: `const [tab, setTab] = useState(0)`.
`PracticeStep.tsx:134`: `{state.phase === 'IDLE' ? <PracticeHub … /> : null}` —
the component unmounts the moment `selectLevel` moves the phase, and remounts
at 0 when `toLevels` (`:117`) or the debrief's close (`:154`) returns to IDLE.
The file's own comment (`PracticeHub.tsx:38-41`) asserts these are equivalent;
they are not. Impact: **the Checkpoint tab is the entire reason this rebuild
happened, and it is the one tab a user cannot stay on. Every checkpoint drill
ends by depositing the user on the escalating traffic ladder — the exact
recombination root split apart, re-created as a navigation behavior instead of
a layout. Hits Nia directly (she is the persona routed to checkpoint on
purpose), Keisha and Devin secondarily. Fix is one line: lift `tab` into
`PracticeStep`'s state, or a module-scope `let` mirroring root exactly.**

### 2. Drop the native `disabled` from locked hub cards

**Evidence.** `PracticeHub.tsx:113-117` renders locked cards with
`disabled={locked}` **and** `aria-disabled={locked}` **and**
`title={locked ? t.hub_locked : undefined}`. `index.html:3467` renders the same
card with `aria-disabled="true" title="${_t.hub_locked}"` and no `disabled`
attribute — the onclick is simply omitted. Root states the intent at
`index.html:5437-5439`: "The two hostile levels stay GATED but no longer
hidden — hiding them made them undiscoverable, and a locked tab still tells
you the level exists." A native `disabled` button is not focusable, is skipped
by keyboard navigation, and does not surface its `title`; `hub_locked`
("Finish the first three to unlock" / "Termina los primeros tres para
desbloquear") is the only text on the screen that explains the lock, and it is
the text that goes silent. `aria-disabled` is already there and already does
the announcing job correctly. Impact: **a one-attribute deletion. It is a
regression against root rather than a deferral, it is language-neutral, and it
removes the explanation for a UI state from exactly the users who cannot infer
that state visually. Omar's finding, Marisol's second.**

### 3. Decide where the orphaned scenario descriptions go, or delete them

**Evidence.** `node -e` dump: `prx_ld1`-`prx_ld5` ("A routine stop, by the
book. Learn the rhythm." … "Border Patrol checkpoint — a different encounter,
same in all 50 states"), `prx_sel_sub` ("Two minutes each, out loud. The
officer's wording changes every run."), and `prx_locked` are all present and
fully bilingual in `t.en.json`/`t.es.json`. Grep across `app-src/src`: zero
renderers for any of them. Their only consumer was
`PracticeLevelSelect.tsx` (root's `lc-d` span, `index.html:5450`; the lock
hint at `:5453`), deleted in `f1af062`. `practice.css:57-79` still carries 23
lines of `.prx-list`/`.prx-lcard`/`.prx-lockhint` styling with nothing to
style. Net effect: `/app` has no screen anywhere that tells a user what a
scenario is before they enter it; root still does, on its overlay list.
Impact: **the deletion was correct — `PracticeHub.tsx:15-21`'s argument for
one enumeration screen holds. What's missing is the second half of the move:
either fold the one-liners into the hub cards (root's hub doesn't show them,
but root has a second screen that does, and `/app` deliberately doesn't), or
record the loss the way every other cut in this migration is recorded. Hits
Keisha's decide-fast use case hardest and Rosa/Marisol's "translated work
nobody will see" second.**

### 4. Fix the parity claim in `PracticeHub.tsx:38-41`, independently of fixing the behavior

**Evidence.** The comment reads: "Root keeps this in a module-scope `_hubTab`
because its render is a full innerHTML rebuild; component state is the direct
equivalent." Golden #1 shows it isn't. This is listed separately from #1
because it is a distinct class of debt: FG12's `PrintStep` finding was a cut
that *wasn't* logged; this is a cut that was logged *incorrectly*, which is
strictly worse for the next porter — silence prompts a check, a confident
wrong answer prevents one. Impact: **cheap (one sentence), and it protects the
specific mechanism that has kept Ana's allergy quiet for nine rounds. Worth
doing even if #1 ships in the same commit, because the comment should describe
what the code does rather than what it was intended to do.**

### 5. Confirm the "0 of 4" progress denominator is the intended first-run reading

**Evidence.** `PracticeHub.tsx:33`: `const RUNGS = [0, 1, 2, 3]`.
`practiceEngine.ts:122-123`: `isLocked(3, …)` is true until `done[0] &&
done[1] && done[2]`. A brand-new player therefore reads "0 of 4 done" on a
grid whose fourth card is locked, with the explanation for the lock reachable
only by hover (and per golden #2, not reachable at all by keyboard or screen
reader). Root is identical (`index.html:3456`, `:3425`), so this is a faithful
port and **not** a confirmed defect. Impact: **lowest-magnitude item here —
a verification question, not a bug. Worth five minutes because the hub is the
first `/app` screen to express the ladder as a number rather than a row of
icons, which is what makes it readable as a target. Related, sub-trivial: the
denominator is written twice, once as the literal `'4'` (`:90`) and once
derived from `RUNGS.length` (`:91`) — the same two-expressions-of-one-fact
shape that produced the best-score bug FG13 found.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to `screens/practice/`, `engine/`, and their content banks** — not
the wizard, not the print pack.

- **Persist the hub tab across level entry/exit** (golden #1) — lift into
  `PracticeStep` state or mirror root's module-scope `let`. This is the one
  item on the list that undoes part of the rebuild's own purpose.
- **Remove `disabled` from the locked `pr-card`; keep `aria-disabled`**
  (golden #2) — `PracticeHub.tsx:114`. Root's behavior is the correct one and
  is already documented at `index.html:5437-5439`.
- **Resolve the orphaned `prx_ld*`/`prx_sel_sub`/`prx_locked` strings and the
  dead `.prx-list`/`.prx-lcard`/`.prx-lockhint` CSS** (golden #3) — render
  them on the hub cards, or delete both string and style and log the cut.
  Leaving reviewed bilingual content with no renderer is the same
  "content ready, nothing renders it" shape FG10 and FG12 each found once.
- **Correct `PracticeHub.tsx:38-41`'s parity claim** (golden #4).
- **Confirm or adjust the "0 of 4" first-run reading, and derive the
  denominator once** (golden #5) — `PracticeHub.tsx:33,90-91`.
- **Consider the `.ll-seg` ARIA contract now that it is a shared control**
  (Omar's third note, not ranked as a golden item because it is inherited
  from root rather than introduced) — `LifelinesStep.tsx:82-85` carries
  `aria-controls`, `PracticeHub.tsx:73-75` does not, and neither has
  arrow-key roving focus. If `.ll-seg` is going to live in `shell.css` as one
  grammar, the grammar should include its ARIA.
- **Carry-forward, unchanged, operator's own explicit decision (not a new
  finding):** `PRX_VAR[2]`/`PRX_VAR[7]`'s missing hostile variants and the
  resulting `PRX_DIVERGE[2]` double no-op stay open — needs new officer
  dialogue, which this project never authors.
- **Carry-forward, now closed and verified this round:** FG12 golden #1 (the
  3-tab hub) and golden #5 (`hub_progress`) are built and rendering; FG13
  golden #2 (stale best score) is fixed in **both** banks
  (`index.html:5490-5493`, `practiceEngine.ts:296-302`), algorithms compared
  directly.
- **Carry-forward, still open, not re-verified this round (out of scope):**
  FG12 golden #2, the missing print confirmation in `PrintStep.tsx` — no
  banner element exists in that component and nothing in `f1af062` or
  `b5ed755` touched it.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06-FG13

**BS-1. Root's `_hubTab` persistence is an emergent property of module-scope
state, not a decision anyone recorded — so which behavior is actually
correct?** Nobody has written down whether "return to the module you left" is
intended design or an accident of how root stores the variable. The port
changed it silently, which means whichever answer is right, the change was
made without anyone choosing it. This matters beyond this instance: root has
other module-scope `let`s driving UI (`_hubTab`, `prLevel`, `prWarnOk`), and
each one is a persistence decision that React's component lifecycle will
silently answer differently unless somebody states the intent per variable.

**BS-2. `npm run build` is now gated on `extract-app-content.mjs --verify` —
does that verifier compare content *banks*, or content *as rendered*?** The
bug this rebuild fixed was right strings, wrong screen: every `hub_*` string
was correctly extracted and bilingually perfect for a full phase while nothing
rendered them, and FG12 had to read two files side by side to catch it. A
JSON-to-JSON verifier cannot see that class of drift by construction. Finding
3 is the same shape running the other direction — strings that pass extraction
and have no consumer — and it shipped through the new gate this round. Worth
knowing whether the gate is expected to catch orphaned strings or explicitly
isn't.

**BS-3. Deleting `PracticeLevelSelect.tsx` removed `/app`'s only mid-run
"see all scenarios" list — has anyone walked the mid-run exit path end to end
with a stopwatch?** `PracticeStep.tsx:117`'s "← All scenarios" now unmounts
the run and mounts the hub, which resets to tab 0 (finding 1) and shows no
scenario descriptions (finding 3). Root's equivalent exit lands on a list with
descriptions, a lock hint, and the streak line, and preserves nothing about
tab state because the hub is a different screen underneath the modal. These
are two genuinely different exit experiences and only the code-level
difference has been reviewed; nobody has run the actual "I'm two beats in and
want out" flow in `/app` and compared what's on screen at the end of it.

**BS-4. `PracticeHub.tsx:54-60`'s `pick()` holds a 260 ms `setTimeout` with no
cleanup on unmount — has anyone checked what happens if the parent unmounts
the hub during that window?** In the current flow nothing else can move the
phase in those 260 ms, so it is almost certainly harmless today. But the guard
that makes it safe is "nothing else navigates," which is a property of the
current strictly-linear nav (`nav.ts`), not of the component. If `/app` ever
gains a router — which FG12's BS-5 already flagged as necessary for Devin's
deep-link use case — this becomes a pending timer firing `onPick` into an
unmounted tree. Cheap to answer now, expensive to find later.

**BS-5. The `.ll-seg` control now has two consumers and the codebase calls it
"one tab grammar" — who owns that grammar's accessibility contract?** The CSS
moved to `shell.css:59-60` and both `lifelines.css:13-14` and
`practice.css:26` now point at it as shared. But `aria-controls` lives in one
consumer and not the other, arrow-key roving focus lives in neither, and
`shell.css` cannot enforce either. Promoting a component from local to shared
usually implies promoting its behavior too; here only the paint moved. The
process question is whether "shared control" in this codebase means shared
styling or shared semantics, because right now the two `.ll-seg` instances
answer that differently and nothing marks which one is the reference.

---

## 5. Group read

**Would-evaluate-favorably verdict: 7 yes/conditional-yes (Dana, Wes, Ana,
Rosa, Marisol, Devin, Nia) / 1 neutral, standing condition unchanged (Tony) /
2 conditional with a real new complaint this round (Omar, Keisha).** This is
the first round in the loop where the subject is a *fix landing*, and the
panel reflects it: FG12's #1 finding and FG13's #2 finding are both verifiably
closed, and two personas (Dana, Nia) got the thing they'd been asking for
across three and four rounds respectively. Verdicts improved more this round
than in any prior one.

**Biggest objection by theme.** All three new findings share a shape none of
the previous thirteen rounds produced: **a correct rebuild that didn't carry
over the parts of the old thing that weren't the bug.** The tab state, the
locked-card focusability, and the scenario descriptions were each working
before — in root, or in `/app`'s own deleted file — and each was lost to a
rebuild aimed at something else. This is neither FG10's "built but not wired"
nor FG12's "ported from the wrong source": it's *ported from the right source,
and the source's own incidental behaviors weren't in scope.*

**Highest-leverage fix, this round's subject specifically.** Golden #1 — the
tab reset. It is one line, it is a confirmed behavioral divergence from root
with the storage class of both variables read directly, and it is the only
finding that partially undoes the rebuild's stated purpose. Golden #2 is
nearly as cheap (one attribute) and is the only item that is an accessibility
regression rather than a usability one.

**Highest-leverage fix, across the whole product regardless of surface.**
FG12 golden #2 — the missing print confirmation in `PrintStep.tsx` — is now
the oldest open confirmed defect in `/app`, two loops unaddressed, and it sits
on the flow Dana uses most. With the hub rebuild closed, it is the next
uncontested item.

**Who this still isn't for.** Tony (no institutional backing, unchanged across
ten rounds). And, newly and precisely this round, Keisha — the round gave her
back the glanceable progress number FG12 said she'd lost and simultaneously
removed the scenario descriptions she'd use to decide which drill to spend her
one free minute on. Second round running where the findings net out to a wash
for the persona with the highest real need.

---

## 6. Signature

Generated by Amparo Focus Group 14 (practice hub rebuild review, ten-persona
panel).
**Panel:** Nia, Keisha, Devin, Omar, Dana, Wes, Ana, Rosa, Marisol, Tony.
**Scope:** `f1af062` (v2.21.0) — `PracticeHub.tsx` built as `/app`'s practice
entry, `PracticeLevelSelect.tsx` deleted, `.ll-seg` promoted to `shell.css`;
and `b5ed755` (v2.21.1) — root's stale-best-score fix. FG12 golden #1/#5 and
FG13 golden #2 verified closed against source. FG12 golden #2 (print
confirmation) and the `PRX_VAR[2]`/`[7]` hostile-variant decision are carried
forward, not re-litigated.
**Verdict date:** 2026-08-13.

All findings tied to live source in `index.html` or `app-src/src/`, or to
direct `node -e` dumps of the extracted content banks. Working tree verified
clean before reading. No speculation beyond what a real future move (the tab
fix, the `disabled` removal, the orphaned-string decision) would need to
resolve — those are named explicitly as open decisions, not treated as
defects beyond what is confirmed.
