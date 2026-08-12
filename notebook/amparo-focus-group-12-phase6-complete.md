# Amparo — focus group 12: Move 6.2 parity audit surfaces two new gaps — the wrong practice entry screen, and a silent print confirmation (v2.20.0)

Date: 2026-08-12. Run against `844f30a` (HEAD), tag `v2.20.0`. `app-src/src/` is
the live source for `/app`; root `index.html` is untouched and remains the
shipped product (per `wargames/15` §0 rule 1). Phase 6 has shipped: Move 6.1
(`/app`'s own service worker + PWA manifest) and Move 6.2, a full parity audit
of `/app` against wargames/15's own inventory (`wargames/18-app-parity-report.md`),
which is the source this round verifies against and extends with fresh persona
reactions — not repeats.

**Method note.** Every claim below is re-verified directly against
`app-src/src/*` or `index.html`, not taken on the parity report's word alone.
Verified this round: `index.html:3420-3478` read in full to confirm root's
step-5 hub is genuinely a 3-tab structure (`hubTab0/1/2`, `.ll-seg` segmented
control) with checkpoint (`CK=4`) on its own tab, not folded into the ladder;
`PracticeLevelSelect.tsx` (all 53 lines) read to confirm `/app` renders one
flat `.prx-list` over every ID in `PRX_LEVEL_IDS` with no tab grammar at all;
`node -e` dumps of `t.en.json`/`t.es.json` confirming `hub_m1/m2/m3`,
`hub_progress`, `hub_ck_note`, `hub_title` are fully extracted and bilingually
correct in **both** languages but have zero renderers anywhere in
`app-src/src` (grepped); `index.html:4285-4295` and `:5775-5789` read to
confirm root's `afterprint` handler renders a visible checkmark-SVG
confirmation banner (`#printedBanner`, `_t.done_t`) and reveals post-print
actions, versus `PrintStep.tsx:115-119`, where the only visible effect of a
completed print is a button label swap (`gold`↔`ghost`) — no banner element
exists in the component at all. Attorney/UPL review is excluded from findings
below — known, already tracked, not new. Findings already logged in FG06-FG11
are referenced only as carried context.

---

## 0. What's actually new this round, verified against source

| System | File | What it is |
|---|---|---|
| Service worker + manifest | `app-src/vite.config.ts` (vite-plugin-pwa) | Move 6.1 — `/app`'s own SW, precache + runtime CacheFirst for `/audio/**`/`/img/**`, own cache names, root's `sw.js` untouched |
| Parity audit | `wargames/18-app-parity-report.md` | Move 6.2 — full row-by-row PORTED/DEFERRED/N-A pass against wargames/15 Appendix A; 20 DEFERRED items, most deliberate and previously logged, but two are **genuinely new findings from this audit itself**, verified again independently this round |
| **New finding 1 — wrong entry screen** | `PracticeLevelSelect.tsx` vs `index.html:3420-3478` | `/app`'s practice entry ports the overlay's internal flat-list fallback (root's own "← All scenarios" escape hatch), not root's actual step-5 hub — a 3-tab structure that deliberately splits checkpoint out from the traffic ladder |
| **New finding 2 — silent print confirmation** | `PrintStep.tsx:29-43,115-119` vs `index.html:5775-5789` | Root's `afterprint` shows a checkmark-SVG banner and reveals post-print actions; `/app`'s `afterprint` handler only flips `printed` state to swap two button styles — no visible confirmation exists |

**Confirmed unused-but-ready, not re-derived as a finding:** the 3-tab hub's
own strings (`hub_m1`/`hub_m2`/`hub_m3`/`hub_progress`/`hub_ck_note`/
`hub_title`) are fully extracted and correctly bilingual in both `t.en.json`
and `t.es.json` (verified via `node -e` dump) — this is the same
"content is ready, nothing renders it yet" shape FG10 found for the root-read
bridge, recurring in a new place.

---

## 1. Ten persona reactions

**Selection rationale.** Nia, Keisha, Dana, Ana, Wes, Omar, Marcus, Rosa,
Devin, Tony. Eight carry forward from FG10/FG11 because both of this round's
new findings sit exactly on their standing lenses (trauma-sensitivity,
speed-scan urgency, print-completionism, half-finished allergy, code
legibility, screen-reader confirmation, shareability, bilingual content,
institutional trust). Devin swaps in for Luis this round — Luis's standing
complaint (payment-trail/analytics) is untouched by either new finding, while
Devin, the actual practice-module end user rather than the buyer, has a
direct stake in which screen he lands on first. Marisol and Ray sit out for
the same reasons as prior rounds — no new surface touches their standing
complaints.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Root split checkpoint into its own tab for a reason that maps almost
  exactly onto her stated need, and `/app` undoes it.** `index.html`'s own
  comment at the hub (`:3435-3439`): checkpoint is "a different encounter
  with different rules... it was reading as just another traffic level buried
  at the end of the ladder." That's root drawing a boundary between
  "escalating traffic stop" and "fixed immigration checkpoint" — precisely
  the kind of categorical distinction a trauma-sensitive user benefits from,
  since the two scenarios carry different anticipatory dread. `/app`'s flat
  `.prx-list` (`PracticeLevelSelect.tsx:20-48`) renders checkpoint (index 4,
  `chkbg` class) as just another card in the same list as levels 0-3, with no
  visual or structural separation — exactly the "buried" framing root's own
  comment says it moved away from.
- **Her standing concern from FG09 (hub exposure) doesn't get worse, but
  this is a related regression she hasn't been asked about.** FG09's finding
  was about a locked card's title being visible; this is about a *different*
  scenario category losing its categorical separation. Distinct finding, same
  persona.
- **Redo? Still no for hostile content. Refer? Conditional yes** — unchanged
  overall verdict, but this is a genuine new data point against the specific
  screen this round audited.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **The flat list is not obviously worse for her — worth stating plainly
  rather than reflexively flagging it as a regression.** Her described use
  case is glance-and-tap in under 30 seconds; one scrollable list with no tab
  switch is arguably fewer taps than root's tab-first hub. This is the one
  persona reaction this round that complicates the "3-tab hub is strictly
  correct" framing.
- **But she loses the one piece of glanceable progress root gives her.**
  `hub_progress` (`index.html:3459-3462`) is a `role="status" aria-live="polite"`
  bar reading "{n} of {t} done" — exactly the kind of at-a-glance status her
  described urgency rewards. Confirmed via `node -e`: the string exists,
  correctly bilingual, in `t.en.json`/`t.es.json` — but nothing in
  `PracticeLevelSelect.tsx` renders a progress bar at all; each card shows its
  own status inline instead, which requires scanning the list rather than
  reading one number.
- **Redo? Yes — the list itself still works for her.** Nuanced from FG11: not
  every deviation from root's screen is a loss for every persona.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **A genuinely new finding for her lens: printing gives no visible
  confirmation it worked.** `PrintStep.tsx:115-119` — the print button's only
  observable change after `window.print()` completes is a style swap between
  itself and the practice CTA (`gold`↔`ghost`). Compare to root's
  `afterprint` handler (`index.html:5775-5789`): a checkmark-SVG banner
  reading `_t.done_t` ("Printed" / done confirmation), revealed post-print
  actions, and (if applicable) an email-receipt line. She's the panel's
  demonstrated repeat-printer across five prior rounds — reprinting for her
  son, checking the pack is current. For her specifically, a print flow that
  changes nothing visible except a button's color is indistinguishable from
  "nothing happened, did the dialog even fire," especially since
  `afterprint` also fires on Cancel — the ambiguity her repeat-use pattern
  would actually notice.
- **The print-DOM-identity guarantee she's credited every round still holds
  and is unaffected.** `PrintStep.tsx:47-70`'s clone mechanism (unchanged
  since FG10) still guarantees the thumbnail can't drift from what prints.
- **Redo? Yes for the wizard. Refer? Yes** — unchanged in substance, but this
  round adds a concrete, printable-today gap in the one flow she uses most.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **This is the first scope gap in this migration that isn't logged at its
  own decision point — worth naming precisely, because that's exactly the
  pattern her allergy is tuned to.** `PrintStep.tsx:1-11`'s header comment
  lists deferred items explicitly: "no demo banner... no full post-print rail
  (email button, restart/printForFamily/reprint-reminder, print-feedback
  prompt) — each needs its own decision, still deferred." It does **not**
  mention the missing print-confirmation banner itself — a different, more
  basic gap than the post-print rail (which is about *additional* actions
  after a confirmed print; this is about there being no confirmation at all).
  Every other scope cut this migration has earned her trust specifically by
  being logged at the point it was cut (`Welcome.tsx:32-36`,
  `YouStep.tsx:65-68`, `StateStep.tsx`'s `skipToPack` comment). This one
  isn't, and the wargames/18 audit itself calls it out as "new finding this
  audit, not previously logged" (F5) — her allergy would flag exactly this
  distinction between a documented cut and an undocumented gap.
- **The wrong-entry-screen finding reads to her as the more forgivable of
  the two, because it IS logged — extensively.** Both `wargames/18`'s
  headline finding and this report's section 0 above document it in detail.
  Her allergy responds to whether a gap is acknowledged, not just whether it
  exists.
- **Redo? Yes for what's built. Refer? Leaning conditional** — unchanged
  shape from FG10/FG11, but this round sharpens exactly what triggers her
  specifically.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He'd catch the entry-screen divergence from the code alone, the same
  way he's caught every prior structural gap.** Reading `index.html:3420`'s
  comment block against `PracticeLevelSelect.tsx`'s own header comment ("G11
  select-list... Ported from index.html:5445-5454") would tell him
  immediately that the port cites the *overlay's* internal fallback list, not
  the step-5 hub — the line numbers alone are enough for his profile to spot
  the mismatch without clicking through anything.
- **The unused hub strings are exactly his kind of find.** `hub_m1`,
  `hub_progress`, `hub_ck_note` sitting fully translated and correct in both
  language banks with zero call sites is the same "components built ahead of
  their consumers" pattern FG10 named for the root-read bridge and FG11 named
  for the practice engine itself — now a third instance, and his profile is
  the one most likely to notice the pattern repeating across three separate
  audits rather than treating each as isolated.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The missing print confirmation is a second live-region gap this loop,
  in the same shape as FG11's crisis-reveal finding.** Root's `hub_progress`
  bar is a real `role="status" aria-live="polite"` region
  (`index.html:3459`) — gone entirely in `/app` since nothing renders it.
  Separately, root's `afterprint` banner, while not itself marked
  `aria-live` in the snippet read, is at minimum a real DOM element a screen
  reader can discover; `/app`'s print flow has no announcement and no new
  element at all — a button changing CSS class is not something most screen
  readers surface as a state change unless the button's accessible name or
  `aria-pressed` state changes with it, and `PrintStep.tsx:115` does neither.
  For him, a completed print action currently produces zero accessible
  signal beyond whatever the OS print dialog itself announces.
- **The checkpoint-merged-into-the-ladder change has a smaller but real a11y
  angle too.** Root's checkpoint tab gets its own `aria-selected` tab
  semantics (`role="tab"`, `index.html:3441-3443`); folded into a flat list,
  checkpoint is just another `role="button"`-equivalent card with no
  signal that it's categorically different from the traffic scenarios around
  it — a sighted user gets a visual cue (position, framing) that a
  screen-reader user relying on the tab's accessible name would have gotten
  explicitly and now doesn't.
- **Would he want both fixed?** Yes, but the print-confirmation gap is more
  urgent — it affects every single successful print, not just the specific
  moment of navigating to checkpoint content.

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **Neither of this round's findings changes his standing calculus, but
  the flat list is mildly, incidentally in his favor.** A single scrollable
  card grid screenshots more cleanly than a tabbed interface (no
  "which tab was I on" ambiguity in a static image) — not a finding he'd
  raise unprompted, but if asked to compare the two entry screens for
  shareability, the flat list edges out.
- **The still-missing print confirmation doesn't touch him** — he's never
  been the panel's printer.
- **Redo? Yes. Refer? Conditional on shareability** — unchanged.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **The would-be hub strings are correctly, fully bilingual — worth
  crediting even though nothing renders them yet.** `node -e` confirms
  `hub_m3`→"Retén", `hub_ck_note`→a full, natural Spanish sentence (not a
  stub), `hub_progress`→"{n} de {t} completados". If Move 6.2's audit had
  found these strings missing or partial in Spanish, that would have been the
  finding; instead the content layer is fully ready, which is a clean pass
  for the highest-stakes content type in this product.
- **The print confirmation gap applies identically in Spanish** — there's no
  language-specific angle to it, since there's no banner text to translate in
  either language currently.
- **Redo? Yes.** Unchanged verdict; the extracted-but-unused strings are a
  positive data point for her specifically, distinct from the structural
  finding itself.

### 🧑 Devin, 16 — TX, Dana's son, actual end user rather than buyer

- **The flat list is not obviously bad for how he'd actually use this, but
  the mixed-in checkpoint changes the narrative shape he'd engage with as a
  game.** His described pattern ("would treat practice as a game... says yes
  when his mother can send him something that opens straight into a
  scenario") suggests he wants a clear escalating ladder to beat, not a
  grab-bag of unrelated scenario types. Root's 3-tab structure gives him
  exactly that: a "traffic stop" tab that reads as one continuous ladder
  (levels 0-3, hard mode) with checkpoint deliberately elsewhere. `/app`'s
  flat list puts checkpoint (a fixed, different-rules encounter) in the same
  visual row as "beat level 2 to unlock level 3" — for a 16-year-old
  approaching this as a game to clear, that's a tonal break in the middle of
  what should read as one progression.
- **If Dana sends him a link into `/app` today, he lands one level deeper
  than she'd expect.** She'd assume a link to "the practice module" puts him
  where root's hub would — at the top of the traffic ladder. `/app`'s flat
  list still works, but there's no hub screen for a deep link to land on in
  the first place; this is a smaller, second-order version of the same
  finding, not independent.
- **Redo? Would try it either way — the underlying game loop (rehearse,
  score, repeat) is unaffected by which screen sits in front of it.** New
  verdict — no prior round had a surface for him to react to at all.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Neither finding moves his standing condition.** The beta banner
  (`App.tsx:82-90`, unchanged) is still the credibility hurdle his verdict
  has hinged on for six rounds; a wrong entry screen or a missing print
  confirmation doesn't touch the institutional-backing gap he's named every
  round.
- **The print-confirmation gap is the kind of thing he'd actually notice in
  person, worth flagging even though it doesn't move his verdict.** His
  described use ("gives the talk to grandkids himself") implies he'd
  physically hand someone a printed pack and expect the app to visibly
  confirm it printed before moving on — the exact moment `/app` currently
  goes silent.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Build the actual 3-tab practice hub — the content is fully ready, only the screen is missing

**Evidence.** `index.html:3420-3478` is root's real, current step-5 entry
screen: a `.ll-seg role="tablist"` with three tabs (`hub_m1`/`hub_m3`/`hub_m2`
— traffic/checkpoint/door), a `hub-progress` `aria-live="polite"` bar scoped
to the traffic tab only, and a `pr-grid`/`pr-card` layout per tab.
`PracticeLevelSelect.tsx` instead ports `index.html:5445-5454` — the practice
overlay's internal "← All scenarios" fallback list, a flat `.prx-list` with
no tab grammar, mixing checkpoint back into the same list root split it out
of. Both screens are real and both work; `/app` shipped the wrong one as its
primary entry point. Newly and additionally verified this round: every
string the correct screen needs — `hub_m1`, `hub_m2`, `hub_m3`,
`hub_progress`, `hub_ck_note`, `hub_title` — is already fully extracted and
bilingually correct in `t.en.json`/`t.es.json` (`node -e` confirmed), with
zero renderers anywhere in `app-src/src`. Impact: **this is not a
content-authoring task, it's a build task against content that's already
done — the cheapest of the five golden items relative to what it fixes, and
the one wargames/18 itself calls the single most significant DEFERRED item
in the whole audit.** Hits Nia hardest (the categorical separation her
trauma-sensitivity benefits from is undone) and Devin second (the game-loop
narrative shape he'd engage with is broken mid-ladder).

### 2. Give a completed print a visible confirmation

**Evidence.** `index.html:5775-5789`: root's `afterprint` handler shows a
checkmark-SVG banner (`#printedBanner`, text `_t.done_t`, plus an email
receipt line when applicable) and reveals post-print secondary actions.
`PrintStep.tsx:29-43,115-119`: `/app`'s `afterprint` handler sets `printed`
to `true`, whose only visible effect is swapping the `gold`/`ghost` CSS class
between the print button and the practice CTA button — no banner element, no
confirmation text, exists anywhere in the component. Distinct from the
already-logged post-print-rail deferral (email/restart/reprint-reminder
actions) — this is about there being no confirmation of the print itself,
a more basic gap. Impact: **Dana's demonstrated five-round repeat-print
pattern is the direct hit — a flow that changes nothing visible except a
button color is indistinguishable from "did that work," especially since
`afterprint` also fires on Cancel in every browser, meaning ambiguity is
baked into the event itself and only a banner resolves it.**

### 3. Log the print-confirmation gap at its decision point, the same way every other scope cut in this migration has been

**Evidence.** `PrintStep.tsx:1-11}`'s header comment lists deferred items
by name (demo banner, post-print rail, print-feedback prompt) — a pattern
consistent across `Welcome.tsx:32-36`, `YouStep.tsx:65-68`, `StateStep.tsx`'s
`skipToPack` comment, all cited approvingly by Ana and Dana across five
rounds specifically because the cut is acknowledged where it happens. The
missing `afterprint` banner (golden item 2) has no equivalent comment
anywhere in `PrintStep.tsx` — it was caught only by this audit reading the
event handler's actual behavior against root's, not by a self-documenting
scope note. `wargames/18` itself independently flags this as "new finding
this audit, not previously logged anywhere" (F5). Impact: **the one thing
that's kept Ana's "looks half-finished" allergy quiet for five straight
rounds is that every cut announces itself; this is the first one that
didn't, and it's worth fixing the documentation gap even independently of
fixing the banner itself, because the pattern that earned trust is what's at
stake, not just this one instance.**

### 4. Decide whether checkpoint's flat-list placement is acceptable through beta, or gates promotion

**Evidence.** Root's own code comment (`index.html:3435-3439`) states the
design rationale for splitting checkpoint out explicitly: "it was reading as
just another traffic level buried at the end of the ladder." `/app`'s flat
list (`PracticeLevelSelect.tsx:20-48`) reproduces exactly that buried
framing — checkpoint (index 4) renders in the same `.prx-list` as the
traffic-ladder levels, with the same card shape, no tab boundary. This is
inherited from porting the wrong screen (golden item 1) rather than an
independent decision, but it deserves separate framing because it is the one
sub-effect of the wrong-screen finding with a plausible safety/trauma
dimension (Nia's reaction above) rather than a purely structural one.
Impact: **worth an explicit operator decision on whether this specific
sub-effect is acceptable to ship through beta while golden item 1 is being
built, given it's the one part of the wrong-screen finding that isn't just
"looks different" but "may read as more alarming to the exact persona this
product is trying hardest not to alarm."**

### 5. Confirm the missing `hub_progress` region doesn't leave Keisha's speed-scan use case worse off than root, or replace it with an equivalent

**Evidence.** `index.html:3459-3462`: `hub-progress` is a
`role="status" aria-live="polite"` region reading "{n} of {t} done," scoped
to the traffic tab. `PracticeLevelSelect.tsx` has no equivalent — status is
per-card (`status` variable, line 24) rather than a single glanceable
summary. The string (`hub_progress`) is extracted and bilingually correct
but unrendered, same underlying gap as golden item 1, but this item isolates
the one part of it that's arguably a *usability* regression rather than a
purely structural difference — Keisha's between-fares use case specifically
rewards a single number over scanning a list. Impact: **the lowest-magnitude
of the five items (it's a sub-effect of item 1, not an independent defect),
but worth naming on its own because it's the one place this round's findings
produced a genuinely mixed reaction (Keisha's flat-list-isn't-obviously-worse
take) rather than a clean regression — the fix for item 1 should specifically
preserve or replace this progress signal, not just port the tabs and drop
it.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to `screens/practice/`, `engine/`, and their content banks** — not
the wizard, not the print pack (print findings are listed separately since
`PrintStep.tsx` sits outside the practice module boundary the loop has used
in prior rounds).

- **Build the real 3-tab hub as the practice entry point** (golden #1) —
  content fully extracted and bilingually verified; this is a pure build
  task against `PracticeLevelSelect.tsx`, replacing the flat-list port with
  the tabbed structure, including the door tab's honest "unbuilt and why"
  message (`hub_m2_h`/`hub_m2_body`, already extracted, unrendered).
- **Preserve or replace the `hub_progress` glanceable status region** (golden
  #5) when building the hub — don't let the tab rebuild silently drop the
  one thing the flat list's per-card status doesn't give Keisha's use case.
- **Make an explicit, recorded decision on checkpoint's interim placement**
  (golden #4) while the hub is being built — either accept the flat-list
  framing as a temporary and named tradeoff, or treat it as a
  promotion-blocking issue given its overlap with Nia's trauma-sensitivity
  concern specifically.
- **Carry-forward, unchanged since FG11 (not re-verified as new this
  round, still open per wargames/18 G7):** `PRX_VAR[7]`'s missing hostile
  variant remains unauthored — the divergence chain that needs it is live
  and reachable, still a content gap not a code gap.
- **Carry-forward, unchanged since FG11 (per wargames/18 G8, "found and
  fixed this loop"):** the mute-before-first-audio gap and the crisis-reveal
  live-region gap are recorded by wargames/18 as fixed this cycle — worth a
  fresh screen-reader pass to confirm before calling either fully closed,
  since neither has been independently re-verified by this focus group round
  (out of this round's audit scope, which centered on Move 6.2's own
  findings).

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06-FG11

**BS-1. Given that the 3-tab hub's own content strings were already fully
extracted and bilingually correct before Move 6.2 even ran, why did the
audit process not catch the wrong-screen divergence earlier — was the
extraction pipeline verified against root's *current* screen, or against
whichever screen the original wargame's line-number citation happened to
point at?** `PracticeLevelSelect.tsx`'s own header comment cites
`index.html:5445-5454` as its source — a real, valid citation, just to the
wrong screen. If the extraction and porting process trusts a single cited
line range without cross-checking it's still root's *primary* screen for
that step (root itself may have moved the hub between when the citation was
written and when it was ported), the same class of drift could recur
elsewhere in the migration without another full audit catching it.

**BS-2. Is there a reason `afterprint` gets a full visible confirmation in
root but was ported as a bare state flip in `/app`, or did the port simply
stop at "the button needs to know printing happened" without asking "does
the user need to know"?** The distinction matters because it changes the
fix: if it's an oversight, a banner component is the fix; if there was a
deliberate reason (e.g., avoiding a second `dangerouslySetInnerHTML` for
banner markup, or deferring anything email-related since `/app` has no email
feature), the fix should account for that reason rather than blindly porting
root's implementation.

**BS-3. Now that `/app` has its own service worker (Move 6.1) with its own
cache names, does a returning user who visited `/app` before Move 6.2's
hub-strings extraction see a stale cached bundle that's missing the newly
extracted content until the SW's own update-and-reload cycle runs?** Nobody
has checked whether `/app`'s SW update flow (mirrored from root's
`controllerchange` reload guard, per wargames/18 A6) actually delivers
content-only changes like this round's string additions promptly, or
whether a returning beta tester could be stuck on a stale precache for one
extra visit.

**BS-4. wargames/18's own abort condition triggered at 20 DEFERRED items
against a threshold of 10, and the audit's own text says this "needs
operator review and sign-off before /app is called a parity candidate" —
has that sign-off happened, and if not, does this focus group round's
existence (auditing the audit) implicitly stand in for it, or is a distinct,
explicit sign-off step still owed?** This isn't a code question but a
process one: the wargame's own gate is more conservative than "the findings
are logged," and nothing in the current material states who signs off or
when.

**BS-5. Devin's reaction above assumes a future deep-link ("mother sends a
link straight into a scenario") — does any such link exist today, or is his
entire described use case currently unreachable regardless of which entry
screen `/app` builds?** Nobody has checked whether `/app`'s strictly linear
navigation (per wargames/18 B4, "a router now would be building for a need
that does not exist yet") can even represent a deep link to a specific
practice level, which would make golden item 1 necessary but not sufficient
for the exact use case it's partly justified by.

---

## 5. Group read

**Would-evaluate-favorably verdict: 6 yes/conditional-yes (Wes, Rosa, Ana,
Dana, Devin, Marcus) / 2 neutral, standing conditions unchanged (Tony,
Keisha — her flat-list reaction is genuinely mixed, not negative) / 2
conditional with a real new complaint this round (Nia, Omar).** This round's
subject — a self-audit rather than new UI — produced a different shape of
panel reaction than FG10/FG11: no persona saw new *functionality*, so
verdicts moved less than usual, but two personas (Nia, Omar) surfaced
concrete, specific new objections against a screen that has shipped and
works, not a gap in something unbuilt.

**Biggest objection by theme.** Both new findings share the same underlying
shape: content or behavior that root implements correctly and completely was
ported from the *wrong source location* (the overlay's fallback list instead
of the step-5 hub; a bare state flip instead of the `afterprint` handler's
full behavior) rather than omitted. This is a different failure mode than
FG10's "built but not wired" pattern — here the thing that shipped is a
real, working, but structurally different substitute for what root actually
does today.

**Highest-leverage fix, this round's subject specifically.** Golden standard
item 1 — build the real 3-tab hub. The content is fully done; this is
entirely a rendering task, and it's the item wargames/18 itself calls the
single most significant deferral in the whole 20-item list.

**Highest-leverage fix, across the whole product regardless of surface.**
Unchanged in substance from FG06-FG11: the pre-audio mute gap (recorded by
wargames/18 as fixed this cycle, not independently re-verified by this
round's panel). This report's own scope was Move 6.2's findings specifically;
a future round should re-confirm the mute fix and the crisis-reveal live
region hold under a live session, not just a source read.

**Who this still isn't for.** Tony (no institutional backing, unchanged
across eight rounds) and, in a new and more precise sense this round, Keisha
— not because nothing exists for her (FG11 reversed that), but because this
round's findings are a wash for her specifically: the flat list she'd
actually navigate faster loses the one glanceable summary that would've
helped her most.

---

## 6. Signature

Generated by Amparo Focus Group 12 (Phase 6 / Move 6.2 parity-audit review,
ten-persona panel).
**Panel:** Nia, Keisha, Dana, Ana, Wes, Omar, Marcus, Rosa, Devin, Tony.
**Scope:** `/app` React strangler migration, wargame 15 Move 6.1-6.2 (v2.20.0)
— service worker/manifest, and the full parity audit's two newly surfaced
findings (wrong practice entry screen, silent print confirmation). Root
`index.html` unchanged and out of scope this round except as the comparison
baseline the audit itself requires.
**Verdict date:** 2026-08-12.

All findings tied to live source in `app-src/src/` or `index.html`, or to
direct `node -e` dumps of the extracted content banks. No speculation beyond
what a real future move (the hub rebuild, the print-banner fix, the
promotion sign-off) would need to resolve — those are named explicitly as
open decisions, not treated as defects.
