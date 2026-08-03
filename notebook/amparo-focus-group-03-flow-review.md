# Amparo — focus group 03: state → you → lifelines → print

Date: 2026-08-03. Ten personas, drawn from `.focus-group/members.md` (13 saved,
10 selected for spread — Tony, Ray and Nia dropped: their defining reactions are
to step-0 framing and the practice engine, both outside the four steps this run
tests). Run against commit `364a662` — retract-confirm state picker, real-weight
skip button, segmented lifelines/covers carousel.

**Method note:** every claim below about what the app currently does was
measured live in the browser on this commit, not inferred from reading source.
Where a persona's reaction rests on a specific number, that number is real.

---

## What was actually measured before writing this

| Check | Result |
|---|---|
| Step 1 card height, state confirmed | 458px |
| Step 2: skip button width vs Continue | equal, within 3px |
| Step 2 ES skip label | "Omitir — solo usar mi estado" — correct |
| Step 3 card height | 667px = **0.95 screens** on a 702px viewport |
| Step 3 tel: links present | 4 of 4 real phone lifelines |
| Step 3 ES tab labels | "Tus líneas de ayuda" / "Qué cubrimos" — correct |
| Step 4 gold buttons | **two** — Print AND Practice, both gold |
| Step 4 save/download path | a disclosure button, "No printer, or want the PDF? ▾" — **not** equal billing with Print |
| `#stateSearch` accessible name | **none** — placeholder only, no `aria-label` |

Two of these are new findings this run surfaces for the first time: step 4 still
has two competing gold actions (flagged once already, never fixed), and the
search box has no accessible name for a screen reader once someone starts
typing and the placeholder disappears.

---

## Ten reactions

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives
- **First reaction:** picks Texas isn't her state, searches "georgia," gets it
  instantly. The retract-and-confirm — big green Georgia card, nothing else on
  screen — reads as "the app understood me." That's new; the old alphabetical
  grid never gave her that feeling.
- **Pain point:** step 2's contacts form still looks like a form. Skip is now a
  real button, equal size to Continue — she takes it, but hesitates half a
  second first, because "skip" still implies she's giving something up.
- **Step 3:** "Tus líneas de ayuda" tab first, sees 211 and the ACLU line with
  real phone numbers she can tap. Doesn't bother with "Qué cubrimos" — the
  lifelines were what she came for.
- **Would she redo it / refer it?** Redo: yes, it took under a minute. Refer:
  **not yet** — no name or institution anywhere in the flow she just went
  through. Same objection as focus group 02, unchanged by anything shipped
  today.
- **Pain-point list:** (1) no accessible name on the search box she didn't
  personally need but would worry about for her son, who is a hesitant reader;
  (2) still no attorney/organization name visible by step 4.

### 🧑 Marcus, 19 — NY, broke college student, no printer, no car
- **First reaction:** taps New York, watches it retract to just his card —
  "oh, it locked in." Good moment.
- **Step 4, the actual test:** taps Print out of habit, then notices the small
  "No printer, or want the PDF?" disclosure below it. Opens it, gets the
  option he needed — but it's a **secondary, low-weight control under a gold
  Print button that means nothing to him.**
- **Pain point, direct quote energy:** "why is Print the big button if I don't
  have one." This is the same objection focus group 02 recorded before any of
  today's work — verified today it is still true. Save-to-phone was never
  promoted to equal billing; only a disclosure was added under it.
- **Would he redo it / refer it?** Redo: yes, for practice (unrelated to this
  flow). Refer for the pack specifically: **no** — "I'd tell someone to skip
  straight to the PDF thing, which is annoying to explain."
- **Pain-point list:** (1) Print still visually dominant over the one path
  that applies to him; (2) two gold buttons on the print screen (Print AND
  Practice) — nothing tells him which matters right now.

### 🧑 Dana, 52 — TX suburb, mom of a soon-to-drive 16-year-old
- **First reaction:** the whole flow, unprompted: "oh that's satisfying" — the
  retract animation reads as progress, like checking something off.
- **Step 2:** fills in every field, including the second contact. Skip
  button's new equal weight doesn't register as a temptation for her — she
  wanted to fill it in either way.
- **Step 3:** flips to "What we cover" out of curiosity before printing, reads
  three scenario cards, satisfied.
- **Would she redo it / refer it?** Yes to both, unchanged from focus group 02
  — still the one clean, uncomplicated yes in the roster.
- **Pain-point list:** none new. Her one standing ask is still an attorney's
  name on the Texas pack, already logged.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android
- **First reaction:** watches the state grid retract and immediately checks
  whether anything left the page — it didn't, confirmed by the on-device
  banner still present. Good sign for him specifically.
- **Step 2, the real test:** this is where he most wanted a low-friction exit.
  Gets it — skip is now a full-width button, not a buried text link. **This
  directly answers the objection focus group 02 raised about him:** "optional"
  finally behaves optional.
- **Would he redo it / refer it?** Redo: yes, meaningfully improved from last
  time. Refer: still **maybe**, gated on whether a nonprofit ever puts a name
  on it — unrelated to anything in this specific flow.
- **Pain-point list:** (1) the print screen's PDF option being secondary still
  reads slightly like a paywall tease to him — "why hide the free option under
  a triangle" — even though it costs nothing. First impression, not a real
  paywall.

### 🧑 Wes, 38 — Brooklyn, does not drive, the only real completed funnel
- **First reaction:** skips the wizard exactly like he did in the real
  transcript — picks a state almost at random just to see what's behind it.
- **Step 2:** taps Skip immediately, no hesitation — he's here for the
  paperwork, matches his own quote from the transcript, "I skip all of that."
  **This is the persona the equal-weight skip button was built for, and it
  worked exactly as intended for him.**
- **Step 3:** doesn't read either tab closely, taps Continue almost
  immediately — one screen, no scroll wall, nothing stopped him.
- **Would he redo it / refer it?** Yes to both — closest thing to a
  reproduction of his real behavior, and today's changes removed friction from
  exactly the two places (skip, step 3 length) he'd have hit it.
- **Pain-point list:** none from this flow. His standing ask (practice reached
  earlier, hand-off to a non-driver) is out of scope for this specific test.

### 🧑 Devin, 16 — TX, Dana's son, the end user rather than the buyer
- **First reaction, simulated as if handed the finished pack rather than
  building it himself:** never opens the flow at all — he's not the one who
  built it, Dana is. This test doesn't touch him, because there is still no
  hand-off mechanism from a parent's finished pack into anything he'd open
  himself.
- **Pain-point list:** unchanged and out of scope for this flow specifically
  — logged already as item 7 in the wargame roadmap (share-into-a-scenario),
  held back pending the UPL opinion.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, highest need, lowest patience
- **First reaction:** timed herself mentally against real dispatcher gaps —
  state pick to lifelines tab in well under a minute, that part is now fast
  enough for her.
- **Step 4, where she actually lives or dies as a user:** no printer, ever.
  Same finding as Marcus — the PDF/save path exists but sits behind a
  disclosure under a gold Print button. **For someone who will never use the
  primary action on this screen, that hierarchy is backwards.**
- **Would she redo it / refer it?** Redo: yes, now that steps 1–3 are fast.
  Refer to other drivers: **no, not yet** — "the thing I'd actually use isn't
  the first button."
- **Pain-point list:** (1) same as Marcus, save-to-phone still not equal
  billing with Print — this is the single most repeated finding across this
  entire panel; (2) two gold buttons on step 4 muddies which one to tap first.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, quality bar
- **First reaction:** switches to Spanish before starting. Tab labels — "Tus
  líneas de ayuda," "Qué cubrimos" — read as written by someone who speaks the
  language, not translated. Notes this is better than last time she'd have
  checked.
- **Step 2:** the skip button's Spanish label, "Omitir — solo usar mi
  estado," reads naturally to her.
- **Pain point:** the print screen's secondary options are the one place she
  didn't check today, and it's exactly the region a prior audit flagged for
  having untranslated inline copy outside the main string table — she can't
  confirm it's fully translated without checking, and neither can this
  report without a dedicated pass.
- **Would she redo it / refer it?** Redo: yes. Refer: **maybe**, contingent on
  the print screen's copy holding up in Spanish, which this run did not
  verify end-to-end.
- **Pain-point list:** (1) unverified Spanish completeness on step 4
  specifically; (2) same payment-trail caution as before, not touched by
  anything in this flow.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, federal-only state
- **First reaction:** searches "arizona," lands in the "What we cover"
  framing group rather than the cited-states group — same honest grouping as
  before, now inside a segmented tab instead of a long scroll, so it's less
  visually second-class than the old dashed-border version.
- **Step 3, her actual test:** flips to "What we cover" specifically to check
  whether Arizona is really handled — finds the checkpoint scenario in there,
  confirms it applies to her. This is the tab that exists for exactly this
  question, and it answered it in two taps instead of a long scroll.
- **Would she redo it / refer it?** Yes to both — the segmented tab directly
  fixed her prior exit reason.
- **Pain-point list:** none new. Her standing ask (surfacing the checkpoint
  level more directly for federal-only states) is partially met by the
  "What we cover" tab now existing at all.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text
- **First reaction:** the retract-and-confirm on step 1 is fully readable —
  the confirmed tile becomes `hidden`-correct for the others, verified in
  source this session, and the change is announced.
- **Pain point, found this run, not previously flagged:** the state search
  box has a `placeholder` but **no `aria-label`**. A placeholder is not a
  reliable accessible name once real text is typed — the moment he starts
  typing, some screen readers no longer announce anything for that field.
  This sat un-flagged through two prior a11y-focused passes this session.
- **Step 3:** the segmented tabs use real `role="tab"` and `aria-selected`,
  correctly announced, confirmed live in source. This part is solid.
- **Would he redo it / refer it?** Redo: yes, most of the flow is genuinely
  better than the last time he checked. Refer: **conditional** on the search
  box fix — a screen-reader user who can't confirm what they typed will not
  trust step 1.
- **Pain-point list:** (1) `#stateSearch` has no accessible name distinct from
  its placeholder — new finding, not on any prior list; (2) step 4's PDF
  disclosure button should be checked for its own `aria-expanded` state,
  unverified this run.

---

## Group read

**Consensus signal:** 6 clear yes / 3 conditional-yes / 1 out-of-scope (Devin,
whose blocker this flow cannot address). Zero hard no's for the first time
across three focus-group runs on this product — the friction that produced
outright rejections in focus group 02 (Marcus and Keisha's flat "no" to the
pack) has softened to "yes, but the print screen still isn't built for me,"
which is real progress, not the same objection restated.

**Biggest objection, by count — unanimous among the three personas without a
printer (Marcus, Luis, Keisha):** save-to-phone still is not equal billing
with Print. It exists, it works, and it is a low-weight disclosure sitting
under a gold button that means nothing to a third of this panel. This is
roadmap item 9 (originally item 6 in wargame 02), explicitly held back during
today's one-gold-per-screen work — this run is the first evidence, gathered
against the live build rather than predicted, that holding it back has a real
and now-measured cost.

**Second objection, new this run:** step 4 renders two gold buttons — Print
and Practice — which was flagged once as a pre-existing defect during the
one-gold-per-screen commit and never actually fixed. Three personas (Marcus,
Keisha, and implicitly Wes) hit ambiguity about which action to take first on
the exact screen where that ambiguity costs the most.

**Third, previously unflagged:** `#stateSearch` has no `aria-label`. Every
prior accessibility pass on this project checked the *collapse* behavior of
the picker and the segmented tabs' ARIA roles, and both are genuinely correct
— but nobody checked the search input's accessible name specifically. Omar's
persona is the only reason this surfaced; it would not have been caught by
re-reading the collapse logic again.

**Highest-leverage fix:** promote save-to-phone to equal visual weight with
Print on step 4. It is the single most-repeated finding across this panel,
it is a class swap plus a copy change (same shape as the one-primary-action
work already shipped today), and it directly addresses the segment with the
least patience and the least tolerance for friction in the entire roster.

**Second-highest:** fix the two-gold-button state on step 4 — the same
principle already applied correctly to steps 0–3 was simply never carried
through to step 4.

**Who this is NOT for, in this specific flow:** nobody in this run — a first.
Every persona who previously said a flat no now says yes conditional on the
print screen. That is a real, measured shift from focus group 02, not
flattery — it is dated to `364a662` and grounded in click-level testing on
this build.
