# Focus group 30 — the practice-first hero finally opens straight into a scenario, but it claims "every line links to the statute" when the link is a methodology page, and it wears two headers with two language toggles that don't talk to each other

**Standalone run, 2026-09-19.** Follows `amparo-focus-group-28-orgs-trust.md` (FG28) and
`amparo-focus-group-29-scroll-reveal-animation.md` (FG29). Neither is re-litigated. FG28's five
goldens (the 230-vs-184 trust number, the unbuilt org deliverables, the sitemap/CHANGELOG
mismatch, the privacy-story disagreement, the three coverage sentences) and FG29's five (the
design-system self-contradiction on motion, the Spanish-tree scope gap, the motion-gated
disclaimer, the palette/font mismatch, the hub-vs-state reveal granularity) are **not re-counted**.
This file checks only the new first-run hero and the restored homepage analytics, against the
tree as it stands today. Attorney/lawyer review is excluded as a finding per standing instruction;
it is in scope only where a UI string makes a claim *about* verification.

**Build under test.** `main` @ `47ee601` (2026-09-19 09:51:29 -0400, *"feat(home): first-run
practice hero + restore homepage analytics (rebuild spec sprint 1)"*), the tip of the v2.31.0
tag. Working tree clean (`git status --short` = empty). v2.31.0 tag confirmed present.

**Method.** Direct read/grep only, no live browser (FG19–29 precedent). Read in full: the hero
markup and its `<script>` (`new/index.html:475-603`), the hero CSS block (`:427-473`), the fixed
nav bar markup+CSS (`:80-118, :388-418`), the analytics init (`:28-54`). Read by targeted grep:
`new/cinema-content.js` (anchor IDs the done-screen links target, `amparoCinemaHTML`), the Arena
"routine" scenario source (`arena/index.html:898-907`), `pack.html`/`new/aid.html` (analytics
posture), `privacy/index.html:63` (the disclosure), `CHANGELOG.md:9-33`,
`notebook/amparo-version-history.md:11-16`. Every `file:line` below was opened this session.

**Seating (ten of thirteen in `.focus-group/members.md`).** Spanish-first, distrusts anything
that separates languages → Rosa (GA); the actual teen end-user who would treat practice as a game
and never reaches it → Devin (TX); rideshare, thirty seconds between fares, mobile-only → Keisha
(Atlanta); the parent/buyer who drills with her kid → Dana (TX); retiree who distrusts unearned
confidence → Tony (GA); coverage-honesty, wants her state framed straight → Ana (AZ); PTSD, wants
the non-simulated route and exits escalation → Nia (NY); broke, notices "sharp," distrusts
phone-home → Marcus (NY); non-driver who enters sideways and reads pages against each other → Wes
(Brooklyn); low-vision screen-reader + 200% text → Omar (Phoenix). **Not seated this round:** Luis
and Marisol (the payment-trail/Spanish-precision axes are covered by Rosa for this diff, which
touches no checkout and no new Spanish prose beyond the hero strings); Ray (no firearm content
here).

---

## 0. What actually changed, verified

| Claim (commit / CHANGELOG v2.31.0) | Verified | Where |
|---|---|---|
| New playable practice-first hero at the very top of `new/index.html`, before `<main id="app">` | TRUE | `new/index.html:475` (`<section class="rep" id="first-rep">`), `:505` (`<main id="app">` follows) |
| Hero sits before `#app` because `render()` rebuilds `#app` | TRUE — `render()` does `getElementById('app').innerHTML = amparoCinemaHTML(...)` | `new/index.html:1106`; called on load `:1120` |
| Level-1 answers "taken verbatim from the Arena routine scenario" | PARTLY — answers match; the **officer's line-1 text was swapped** and emoji/branch text trimmed | see golden #5; hero `:515-518` vs `arena/index.html:900-901` |
| 3 lines → level-done screen with progress ring + CTAs | TRUE — `L1` array has 3 items, `finish()` shows `.rep-done` | `new/index.html:514-527`, `:587-593`, ring SVG `:495` |
| Real content ships **2** verified answers per line, not the mockup's 3 | TRUE — every `L1[n].answers` has length 2 | `new/index.html:516-526` |
| EN/ES toggle | TRUE, but it is a **second, unsynced** toggle (see golden #2) | hero `:479-482, :594-600`; bar `:395-398, :894-901` |
| Cinematic film KEPT below, reachable via "Watch the story ↓" (→ `#top`) | TRUE — `#top` exists in the rendered cinema | `new/index.html:502`; `cinema-content.js` emits `id="top"` |
| PostHog restored on the homepage with `autocapture:true` | TRUE | `new/index.html:42` |
| "Config identical to pack.html's" (code comment `:30`) | **FALSE / stale** — `pack.html` now loads **no** PostHog at all (grep = 0) | `new/index.html:30` vs `pack.html` |
| Fires `hero_answer_tapped`, `practice_line_answered`, `sr_practice_level_done` | TRUE | `new/index.html:574, :575, :592` |

**Credit where the build improved since FG28 (measured, not assumed):** `privacy/index.html:63`
now *accurately* discloses the new posture — *"Automatic click capture (autocapture) is on there
[the homepage], with every text input masked… The pack builder, the Practice Arena and the
Find-help page currently load no analytics at all."* That is the direct repair of FG28 golden #4
(the privacy page used to say "analytics disabled" while three pages ran them). It is now true:
`pack.html` and `new/aid.html` both return 0 for `autocapture`/PostHog. This round does **not**
re-flag privacy inconsistency; it credits the fix.

---

## 1. Ten persona reactions

### 🧑 Devin, 16 — TX, the teen end-user who never reached practice before

For four rounds the finding about me was "would treat practice as a game; never reaches it."
This is the first build where the *first thing on the page* is the game. No wizard, no state
picker, no scroll — an officer line (`new/index.html:485`), two buttons, and a tap gives me
"Risky — that's an admission, and now they'll dig" (`:522`) right there. That's the on-ramp my
mom (Dana) could finally text me a link to and have it open straight into a scenario. Where it
loses me: after three lines the reward is "1 of 6 cards practiced" and three buttons that all
send me somewhere *else* to keep playing (`:497-499`). The one thing that hooked me — tapping and
getting a reaction *in place* — stops after ninety seconds, and every next step is a page load. A
game that ends by handing you a menu isn't a game anymore.

### 🧑 Keisha, 34 — Atlanta, rideshare, thirty seconds between fares, mobile-only

This is the fastest the product has ever been useful. On my phone I land, and the officer
question plus both answers are right there — no "choose your state" gate first. I checked the
budget: hero content starts ~90px down (`padding 22` + brand row + `rep-setup` + officer,
`:430,:484-485`), both `min-height:52px` answer buttons (`:444`) land inside the first ~340px, so
on any phone taller than ~380px I never scroll to play. Real win. But two things cost me. First,
the fixed top bar (`:80`, `position:fixed;height:64px`, same navy as the hero at 72% opacity)
sits *on top of* the hero's own "Amparo" and EN/ES row, which has no offset for it (`:430`, no
`padding-top` for `--bar-h`) — so the top of the thing I'm looking at is under a translucent bar
wearing a *second* "Amparo." Second, when I finish, "Pick your state" (`:497`) jumps me past the
entire cinematic film to a section that only names Texas, Georgia and New York — not a picker, and
not my "find Georgia fast" moment.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything that separates languages

I tap ES. The hero turns to Spanish — *"Un oficial se acerca y dice… ¿Qué responde usted?"*
(`:530`) — and that part reads as written, not machine-translated. Credit. Then I scroll into the
film below and it is still in English. I go back up and the top bar's own EN/ES still shows EN.
There are **two** language switches on one screen and they do not agree: the hero's writes
`amparo_lang` and re-renders only the hero (`:597-598`); the bar's `setLang()` re-renders only the
film and sets `<html lang>` (`:894-900`); neither calls the other. So a Spanish-first person like
me gets a half-Spanish page and no single control that makes the whole thing Spanish. This is the
same wound as FG29's "English shipped, Spanish didn't" — except here Spanish ships and then can't
be turned on all the way.

### 🧑 Tony, 61 — GA, retired postal worker, distrusts unearned confidence

I read the small print under the buttons: *"Every line links to the statute."* (`:492`) I clicked
it. It goes to `/how-we-verify/` — a page about *how* they check things, not a statute. Then I
looked at what the "lines" even are: federal constitutional material (the 5th, the 4th, "waives
your strongest 4th Amendment protection," `:526`), and the code itself ships them
`verified:false` until a lawyer reviews them (`:510-511`). So the one sentence selling the
trust — "links to the statute" — is wrong three ways: it isn't a statute, it isn't state-specific,
and it isn't verified. This product's whole selling point is that it *doesn't* overstate. That
sentence overstates.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, wants coverage framed honestly

The rest of the site is careful: the homepage's own headline is *"Federal rights everywhere.
Three states cited to statute."* Only three. Then the hero, on generic federal content that
applies to nobody's specific state, promises *"Every line links to the statute"* (`:492`). Those
two sentences are on the same page and they don't agree about what "cited to statute" means — the
exact ambiguity FG28 golden #5 already flagged, now made sharper by a new line that claims *every*
line is statute-linked. And "Pick your state" (`:497`) took me to a block that lists TX/GA/NY
only — Arizona isn't pickable there, so the button's label promises a choice the destination
doesn't offer for 48 of us.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD, wants the non-simulated route

The hero itself is the gentlest thing this product has ever shown me: no heartbeat, no clock, no
escalation, no ❤️ pressure meter (the thing FG28 kept flagging on the Arena). One officer line,
calm feedback, done. If the whole product were this, I'd use it. But every exit it offers me
pushes toward the thing I flee: "Practice a full stop" → `/rehearse` (`:499`), which is the
escalating Arena with the pressure meter. The hero is a safe doorway that only opens onto the
scary room. Nothing here offers "you've done enough — here's a calm checklist" as a terminal
state; the calm version is only ever a teaser for the intense one.

### 🧑 Marcus, 19 — NY, broke, notices "sharp," distrusts apps that phone home

Two reactions. It looks sharp — the dark hero, the gold accents, the tap-to-reveal feedback read
like somebody's real job, not a template, and that's what makes a broke sixteen-year-old trust it.
But I checked the analytics, because I always do: `autocapture:true` (`:42`) on *this* page — the
one where a nervous kid taps "I do not consent to a search." Autocapture records *which* element I
clicked, by its text. The hero *also* fires named events for the same taps (`:574-575`), so the
broad capture is redundant *and* it's on the single most sensitive page in the product. The
privacy page does disclose it now (`privacy/index.html:63`, credit) — but "disclosed" isn't the
same as "needed." The comment even says the config is "identical to pack.html's" (`:30`) when
pack.html now runs no analytics at all. Disclosed, but heavier than it has to be.

### 🧑 Dana, 52 — TX suburb, the parent/buyer who drills with her kid

I want to drill this with my son, so I ran all three lines twice. Two answers per line means it's
a coin flip — the "good" one is always obviously the calm lawyer-sentence and the other is always
obviously the blurt. He'll pattern-match "pick the quiet one" in thirty seconds without learning
*why* any specific fact matters. The mockup had three answers; the ship has two (`:516-526`), and
with two there's no middle option — no "technically legal but unwise" — which is exactly the gray
zone a teenager needs to feel. The feedback sentences are good; the *choice* is too easy to teach
anything durable.

### 🧑 Wes, 38 — Brooklyn, non-driver, enters everything sideways, compares pages

I opened the source and counted the seams. Two "Amparo" wordmarks on first paint: the fixed bar's
(`:391`) and the hero's own (`:478`). Two EN/ES toggles (`:395-398` and `:479-482`) that, as Rosa
found, don't sync. Three separate "Practice a Traffic Stop" affordances: the bar CTA → `/rehearse`
(`:400`), the film's CTA → `/rehearse` (`:505`), and the hero, which *is* the practice, in place.
So a first-timer meets three things all labeled or shaped like "practice" and has to guess whether
the hero is the practice or an ad for practice happening elsewhere. Nobody notices this without
reading the page against itself — which is the only way I read anything.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

Focus management is genuinely handled: after a pick the "Next" button takes focus (`:580`), and
the done screen takes focus on finish (`:590`) — that's better than most of the site. Three
things stop me. One: the progress dots are `aria-hidden="true"` (`:491`) and there's a dead
`dots:'Line '` string that's never used (`:529`) — so a screen-reader user gets no "line 2 of 3"
position at all. Two: the hero toggle never sets `<html lang>` (only the bar's `setLang` does,
`:898`), so when I switch the hero to Spanish my screen reader keeps reading Spanish words with an
English voice. Three: at 200% zoom the fixed 64px bar (`:80`) eats the hero's top row, and its
translucent same-navy background makes the hero's own EN/ES toggle a ghost underneath — the one
control I'd need to find is the one the layout hides.

**Tally.** Zero unconditional yeses, but the *shape* of the complaints changed. For the first time
the core idea earns real praise — Devin and Keisha both say this is finally the on-ramp they never
had, Nia calls it the gentlest surface in the product, Marcus calls it sharp. Every "where I stop"
lands on one of four seams: an overclaiming trust line (Tony, Ana), two headers / two unsynced
language toggles / three practice entry points (Wes, Rosa, Omar), a done-screen that dead-ends or
mislabels (Keisha, Devin, Ana), or a two-answer format too easy to teach (Dana).

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. "Every line links to the statute" links to a methodology page, on federal content that is neither a statute nor verified

**Evidence.** `new/index.html:492`: the hero footer reads *"Every line links to the statute,"* and
its `href` is `/how-we-verify/` — the "how we check things" explainer, not any statute. The
per-answer *"Why this →"* link (`:577`) also resolves to `/how-we-verify/`. The "lines" are the
`L1` federal answers — 5th/4th-Amendment constitutional material (`:517-526`, e.g. *"Consent
waives your strongest 4th Amendment protection"*), not statutory text, and not tied to any single
state. The script's own header comment states the content ships *"verified:false until attorney
review — no new legal wording"* (`:510-511`). Meanwhile the same page's careful coverage headline
elsewhere says only *"Three states cited to statute"* (the `stateTitle` string).

**Impact.** Highest by integrity cost, and it is brand-new copy this commit introduced. This is the
same failure mode FG28 (the trust page's wrong "230") and FG29 (the design system that forbade the
motion it shipped) already named: a trust-critical sentence that the repository's own data
contradicts. A product whose entire pitch is "we tell you exactly what we've verified" now leads
its most-seen new surface with a claim that a lay reader (Tony) can falsify in one click. "Links to
the statute" is doing marketing work the content can't back.

**Cheapest fix that holds.** Change the sentence to what is true and already the site's own voice —
e.g. *"Every line shows how we checked it →"* (which `/how-we-verify/` actually delivers), or
*"See our sources and review status →"*. Copy-only, one string in `STR.en.trust` / `STR.es.trust`
(`:529-530`) plus the ES mirror *"Cada frase enlaza a la ley"* which has the identical problem.
No research needed; this is choosing an honest verb.

### 2. Two language toggles on one screen that don't sync, and the hero never sets `<html lang>`

**Evidence.** The hero's EN/ES handler (`:594-600`) sets the hero's `lang`, writes
`localStorage['amparo_lang']`, and calls `setChrome()` + `renderLine()` — **hero only**. The bar's
`setLang()` (`:894-901`) sets the module `lang`, toggles the bar pills, sets
`document.documentElement.lang`, and calls `render()` + `renderCine()` — **film only**. Neither
function calls the other, and the hero's does **not** touch `document.documentElement.lang`
(that line lives only in `setLang`, `:898`, and the one-time load at `:886`). So: tap ES in the
hero → hero Spanish, film + bar English, `<html lang="en">` unchanged; tap ES in the bar → film
Spanish, hero English, and `amparo_lang` never written.

**Impact.** This breaks the core promise for the exact center of the target niche (Rosa, Marisol,
and every Spanish-first user). A bilingual product with two half-connected language switches
delivers a half-Spanish page no matter which one you press, and — because the hero never updates
`<html lang>` — a screen reader (Omar) narrates Spanish hero copy in an English voice. FG29's
Spanish finding was "the feature never reached Spanish"; this is worse in kind because Spanish
*is* present and still can't be fully switched on.

**Cheapest fix that holds.** Make the two controls one behavior: the hero handler should call the
page's `setLang(lang)` (which already re-renders the film, sets `<html lang>`, and could be
extended to re-render the hero), and the load path should seed both from `amparo_lang`. One handler
change plus persisting `amparo_lang` inside `setLang`. No new UI.

### 3. Two answers per line collapse the Arena's three-tier grading and mis-mark a legally-neutral answer as "Risky"

**Evidence.** The hero grades binary: `a.good ? S.good : S.risk` → an answer is either "Good" or
"Risky" (`:576-577`). But the Arena source it copies from grades in three tiers via a `p` (points)
field: `p:1` good, `p:-1` bad, **`p:0` neutral**. The routine scenario's line-2 wrong option,
*"Explain your whole evening,"* is `p:0` in the Arena (`arena/index.html:904`) — explicitly *not
penalized*, with feedback *"Not illegal — but every detail can be probed."* The hero ships that
same option as `good:0` (`:522`), so it renders with the red **"Risky"** tag. A legally-neutral
choice is stamped as a mistake.

**Impact.** This is a teaching-integrity defect on the surface whose only job is to teach, and it
answers the brief's explicit question — no, a two-answer binary does not teach well here. With
exactly one obviously-calm option and one obviously-wrong option per line (Dana's coin flip), the
player learns "pick the quiet sentence," not *why* a specific fact matters — and where the Arena
deliberately preserved a gray "not illegal but unwise" middle, the hero erases it and miscolors it
as wrong. That is a factual regression against the product's own more careful source data.

**Cheapest fix that holds.** Carry the Arena's `p` tier into `L1` and add a third tag state
("Okay, but…" / neutral) so `p:0` answers don't render as "Risky"; or, if two options must stay,
pick the Arena's genuine `p:-1` option for the wrong slot so the binary is honest. Either is a data
edit in the `L1` array (`:514-527`) plus one CSS class; better yet, generate `L1` from the Arena's
routine scenario object so the two can't drift (same anti-hand-copy lesson as FG28's "230").

### 4. The fixed nav bar overlaps the hero's own header — two "Amparo" marks, and the EN/ES toggle ghosted beneath a translucent same-color bar

**Evidence.** `nav.bar` is `position:fixed; top:0; z-index:70; height:64px` with
`background:rgba(11,20,38,.72)` and a backdrop blur (`:80-83`) — always visible, no scroll-hide
(no bar transform anywhere; the only `scrollY` logic, `:983-1020`, is the nav-sheet scroll-lock).
The hero `.rep` has `padding:22px 20px 30px` and **no** top offset for `--bar-h` (`:430`), and
there is no `body{padding-top}`. Its background is `#0B1426` = rgb(11,20,38) — the *same* navy the
bar tints at 72%. So the bar's own brand "Amparo" (`:391`) + burger sit directly over the hero's
brand "Amparo" (`:478`) + EN/ES row (`:479-482`). On mobile the bar additionally hides its own
langpill and CTA (`@media(max-width:900px)`, `:104`), so the survivor stack is bar-brand+burger on
top of hero-brand+EN/ES.

**Impact.** Wes's two-headers seam and Omar's hidden-toggle seam are the same root cause. A
first-timer's first ~64px shows two wordmarks for one product, and the hero's language toggle —
the thing a Spanish-first user reaches for first — is the element most likely to be occluded,
because the overlapping bar is the same color and semi-opaque. The *playable* area (officer line +
answers) sits safely below the bar, so nothing is unusable — but the header reads as a rendering
bug, and on a trust product a layout that looks broken costs trust.

**Cheapest fix that holds.** Give `.rep` a `padding-top: calc(var(--bar-h) + 22px)` so the hero's
own top row clears the fixed bar — one line. Then decide whether the hero needs its own brand +
EN/ES at all when the bar already carries both; the lazy answer is to drop the hero's duplicate
brand and keep a single EN/ES (see golden #2). *(CSS-derived; exact on-device pixel occlusion is
RECON — no live browser this session, per FG19–29 precedent.)*

### 5. The level-done screen's primary CTA, "Pick your state," is not a picker and jumps past the whole film to a three-state teaser

**Evidence.** The done screen's primary button is *"Pick your state"* with `href="#states"`
(`:497`). After `render()` rebuilds `#app`, `#states` is the `cine-edition` section —
*"Federal foundations. State-specific detail… Texas, Georgia, and New York have additional statute
citations"* with exactly three state tag links (TX/GA/NY) and no all-state control
(`cinema-content.js`; the same content is visible in the static placeholder at `new/index.html:505`,
the `cine-edition` block). The state picker is not in this flow yet (as briefed for a later
sprint). The anchor *does* resolve — this is not a dead link — but it scrolls the user down past
the entire cinematic film to land on a coverage blurb.

**Impact.** Lower magnitude (nothing breaks; the anchor works — a genuine positive vs. the dead
exits FG26 flagged), but the label over-promises for 48 of 51 jurisdictions: "Pick your state"
implies a choice the destination offers only for TX/GA/NY, and the scroll-jump drops the just-
warmed-up user into the middle of the marketing page with no picker to act on. It's the weakest of
the five precisely because the state picker's absence is a known, scheduled gap — the issue is only
that the button's *wording* writes a check the current flow can't cash.

**Cheapest fix that holds.** Until the picker is in the flow, relabel to what the destination
actually is — e.g. *"See state coverage →"* (`STR.*.donePick`, `:529-530`) — or point the button
at the real `/rights/` hub (which *is* a 51-way index) instead of `#states`. Copy/href only; swap
it for the true picker when that sprint lands.

---

## 3. What must change in the practice MODULES specifically (structure/content, not officer dialogue)

The Arena engine itself is untouched by this commit (the hero is a self-contained `<script>` on
`new/index.html`; `arena/index.html` unchanged). What this round raises for the modules going
forward:

1. **Grade with the Arena's real tiers, and generate `L1` from the Arena data instead of
   hand-copying it.** Golden #3: the hero flattened `p:0` (neutral) into "Risky" and swapped the
   routine's line-1 officer text (*"Do you know why I pulled you over?"*, `:515`) for a line the
   routine doesn't use — the routine's line 1 is *"Do you know why I stopped you?"*
   (`arena/index.html:900`), and the 🛡 marker and the *"Watch what happens"* branch tail were
   trimmed (`:518` vs `arena:901`). "Verbatim from the routine scenario" is therefore loosely
   true. Import the scenario object so the hero and the Arena can never disagree — the same
   anti-drift lesson FG28/FG29 kept surfacing.
2. **Give the hero→Arena handoff continuity.** `finish()` writes `amparo_progress = {l1:true}`
   (`:591`), but nothing reads it: "Practice a full stop" (`:499`) drops the user into `/rehearse`
   with no evidence the Arena resumes past the three lines they just did, and without the Arena's
   own gating pre-question (the probation/parole supervision check, `arena` `supB`) that changes
   which coaching is safe. Decide whether "1 of 6 cards practiced" (`:495,:529`) is a promise the
   Arena honors or just a hero-local number.
3. **Offer a terminal calm state, not only an escalation exit (Nia).** Every done-screen CTA leads
   toward the pressure-meter Arena. The modules need one "you've done enough — here's the
   non-simulated checklist" endpoint so the gentle on-ramp doesn't only open onto the intense room.
4. **Reconsider `autocapture:true` for the practice surface (Marcus).** The hero already emits
   named events for every tap (`:574-575`); autocapture (`:42`) is redundant *and* broad on the
   most sensitive page. It's now honestly disclosed (`privacy/index.html:63`) — the question is
   necessity, not honesty. Explicit events + `autocapture:false` would measure the same funnel with
   a smaller footprint and match the rest of the site's zero-analytics posture.
5. **Carryover, not re-counted (still open from FG26/27/28):** the "(Checked)" receipt with no
   coverage clause, `sw-routing-check` unwired from CI, the two Panic HUDs, the pressure-meter
   screen-reader label, the org-page unbuilt deliverables. None is touched by today's diff; flagged
   only so the module backlog stays visible.

---

## 4. Missing / inconsistent things the personas expect, each checked before claiming

| Expected | Verified state | Who |
|---|---|---|
| "Links to the statute" to link to a statute | Links to `/how-we-verify/` (methodology), on `verified:false` federal content | Tony |
| One language control that flips the whole page | Two unsynced toggles; hero writes `amparo_lang` only, bar sets `<html lang>` only | Rosa |
| Hero ES to set `<html lang>` for AT | It does not (`:594-600`); only `setLang` does (`:898`) | Omar |
| Two answers to teach a real distinction | Binary good/risky; Arena's neutral `p:0` re-marked "Risky" (`:522` vs `arena:904`) | Dana |
| The hero's own header not to collide with the fixed bar | `.rep` has no `--bar-h` top offset; fixed bar overlaps (`:80` vs `:430`) | Wes, Keisha |
| "Pick your state" to pick a state | `#states` = TX/GA/NY coverage teaser, no picker | Ana, Keisha |
| A calm terminal state after practice | All done-CTAs route to the escalating Arena (`:497-499`) | Nia |
| Progress position announced to a screen reader | `rep-dots` is `aria-hidden` (`:491`); `dots:'Line '` string unused (`:529`) | Omar |
| Code comment to match reality | "identical to pack.html's" (`:30`) — pack.html now loads no analytics | Marcus |
| The in-place game to continue | Hero ends after 3 lines; every next step is a page load | Devin |

Not repeated from FG28/FG29 (still open there, untouched today): HUD reachability, the "(Checked)"
receipt, the cite-dialect mismatch, `sw-routing-check` in CI, the org-page unbuilt deliverables,
the design-system palette/motion contradictions, the Spanish rights-tree reveal gap.

---

## 5. Blind-spot questions a top UX researcher would ask, not asked in rounds 28/29

**BS-1. When a user finishes the hero and taps "Practice a full stop," does the Arena skip the
three lines they just did, or replay them?** `finish()` saves `amparo_progress={l1:true}` (`:591`)
but nothing reads it on the Arena side. If the Arena restarts at the identical routine line 1, the
hero has trained the user to expect a dead-end repetition — the "1 of 6" ring (`:495`) becomes a
promise of progression the next surface silently breaks. Nobody has traced this handoff end to end.

**BS-2. Is `autocapture:true` on the single most sensitive page in the product a deliberate,
proportionate choice — or a spec line copied without weighing it?** The page already fires explicit
named events for the taps that matter (`:574-575`), so autocapture adds broad element-level capture
on the one screen where a nervous first-timer selects "I do not consent to a search." It's
disclosed (credit), but disclosure isn't proportionality. Who decided the sensitive page needs the
*broadest* capture mode, and against what measurement need the named events don't already meet?

**BS-3. Which of the three "practice" affordances is a first-timer meant to use, and does the hero
read as the practice or as an ad for it?** Two Amparo headers, two EN/ES toggles that disagree, and
three "Practice a Traffic Stop" paths (bar → `/rehearse` `:400`, film → `/rehearse` `:505`, hero =
in place). Has anyone watched a real first-timer decide whether tapping the hero answers *is* the
practice, or whether they still need to go find "the real one"? The whole rebuild's thesis is
"practice first" — that thesis fails silently if users read the playable hero as a teaser.

**BS-4. Does the hero's two-answer binary measure as *learning* or just as *tap-through*?** With one
obviously-calm and one obviously-wrong option per line, `practice_line_answered.correct` will skew
near-100% for anyone who's seen one line — which looks like success in PostHog and means nothing
about retention. What's the metric that distinguishes "learned the reasoning" from "learned to tap
the quiet button," and does any event capture a *wrong-then-right* correction the way the Arena's
recovery branches do?

**BS-5. On the narrowest real phone, does the fixed-bar overlap make the hero's language toggle
actually untappable, or merely ugly?** Golden #4 is CSS-derived. If the bar's brand/burger sit
over the hero's EN/ES hit-area at 369px, a Spanish-first user may not just fail to *see* the toggle
but fail to *tap* it (the bar's z-index 70 wins the click). This is the one finding that could
escalate from cosmetic to blocking, and it needs one live render at 369px to settle.

**BS-6. Is "1 of 6 cards practiced" (`:495,:529`) an honest denominator?** The Arena "routine"
scenario is one of six escalation levels, so "1 of 6" is defensible — but it's hardcoded (the ring
`stroke-dashoffset` is a fixed 78.5/94.2 ≈ 16.7%, `:495`), not derived from the Arena's real level
count. If the Arena ships 7 levels tomorrow, this says 6 forever. Same "hand-typed number will
drift" shape as FG28's 230 and FG29's palette table — is any progress number on this page computed?

---

## 6. A small thing worth naming: the recurring "hand-copied value drifts from its source" pattern now has a fourth instance

FG27 found the stale "230" in code comments; FG28 found it hand-transcribed onto two public trust
pages; FG29 found the design system's palette/fonts hand-typed and already wrong. This round adds a
fourth of the same shape: the hero's `L1` legal content is hand-copied from the Arena's routine
scenario (`arena/index.html:898-907`) and has already drifted — the officer's line-1 text changed
(`:515` vs `arena:900`), a neutral `p:0` answer became "Risky" (`:522` vs `arena:904`), and the
"1 of 6" ring is a hardcoded fraction. None are related in content; all four are a value that
should have been generated from its source being typed by hand and diverging. The fix pattern is
identical every time: generate from the source, don't transcribe it.

---

## 7. Verification log

- Commit under test: `47ee601` (`git log -1` = 2026-09-19 09:51:29 -0400). Working tree clean
  (`git status --short` empty). `v2.31.0` tag confirmed present.
- Hero markup `new/index.html:475-504`; hero `<script>` `:508-603`; hero CSS `:427-473`; fixed bar
  `:80-118` (CSS) and `:388-418` (markup); analytics init `:28-54` (`autocapture:true` at `:42`).
- `L1` array = 3 lines × 2 answers each (`:514-527`), confirming "2 answers per line, 3 lines."
- Arena "routine" scenario read `arena/index.html:898-907`: line-1 officer = *"Do you know why I
  stopped you?"* (`:900`), not the hero's *"…pulled you over?"* (`:515`); line-2 wrong option
  *"Explain your whole evening"* is `p:0` neutral (`:904`) vs hero `good:0`→"Risky" (`:522`); good
  answers carry 🛡 in the Arena (`:900,:906`), stripped in the hero.
- `render()` rebuilds `#app` via `amparoCinemaHTML` (`:1106`, called `:1120`); `new/cinema-content.js`
  emits `id="top"`, `id="states"`, `id="how"`, `id="join"`, `id="arena"`, `id="privacy"`,
  `id="organizations"`, `id="faq"` — so the done-screen `#states` (`:497`) and "Watch the story"
  `#top` (`:502`) anchors **resolve** (not dead links); `#states` = the `cine-edition` TX/GA/NY
  coverage section, not a picker.
- Language desync: hero handler `:594-600` (writes `amparo_lang`, hero-only re-render, no
  `<html lang>`); `setLang` `:894-901` (film-only re-render, sets `<html lang>`, no `amparo_lang`).
  Neither calls the other.
- Fixed-bar overlap: `nav.bar` `position:fixed;top:0;height:64px;z-index:70;background:rgba(11,20,38,.72)`
  (`:80-82`); `.rep` `padding:22px 20px 30px`, no top offset (`:430`); no `body{padding-top}`; no
  scroll-based bar hide (only `scrollY` use is the nav-sheet lock, `:983-1020`); mobile hides bar
  langpill+CTA (`:104`).
- Analytics posture cross-check: `pack.html` and `new/aid.html` both return **0** for
  `autocapture`/PostHog (grep) — i.e. no analytics, contradicting the "identical to pack.html's"
  comment (`:30`); `privacy/index.html:63` now accurately discloses homepage autocapture-on +
  pack/arena/aid analytics-off (FG28 golden #4 repaired — credited, not re-flagged).
- a11y: `rep-dots` `aria-hidden="true"` (`:491`); unused `dots:'Line '` string (`:529`); focus
  moves to Next on pick (`:580`) and to done on finish (`:590`); reduced-motion guard on `.rep-ans`
  (`:473`).
- CHANGELOG `:9-33` and `notebook/amparo-version-history.md:11-16` (v2.31.0) read; both describe the
  hero, the restored analytics, `autocapture:true`, and note "two verified answers per line, not
  the mockup's three."
- **RECON, not asserted:** exact on-device pixel occlusion of the hero header by the fixed bar at
  369px, and whether the bar's z-index blocks taps on the hero EN/ES (BS-5) — no live browser this
  session; whether the Arena resumes past the hero's three lines (BS-1) — handoff not traced live.
- Excluded per standing instruction: attorney-review as a finding. In scope and flagged: the
  "links to the statute" string, because that is a UI claim about verification, not the review
  itself.

## 8. Signature

Ten seated personas from `.focus-group/members.md` — Devin, Keisha, Rosa, Tony, Ana, Nia, Marcus,
Dana, Wes, Omar. Five goldens, five module items (four new + one carryover pointer), ten
missing/inconsistent expectations, six blind spots, one recurring shape of mistake (a hand-copied
value drifting from its source — fourth instance in four rounds). Every `file:line` was opened this
session against `47ee601`; the language desync, the neutral-to-Risky regrade, and the fixed-bar
overlap were each confirmed by direct read, and the privacy-page repair was credited by direct
comparison, not inferred from the commit message.
