# Amparo — focus group 15: the ARIA promise root can't keep (v2.21.3)

Date: 2026-08-13. Run against `469ed17` (HEAD), tag `v2.21.3`. Subject:
`469ed17` — `prx.best` escaped at both remaining `innerHTML` sites in root,
`/app`'s first `ErrorBoundary`, and real tab/tabpanel ARIA on the
practice-hub and lifelines tablists in root **and** both `/app` ports, with
roving tabindex + arrow/Home/End nav added in `/app` only.

Working tree at read time: `CHANGELOG.md` and
`notebook/amparo-version-history.md` modified (docs only, this loop's own
step 2-3 output). Every finding below is read from committed source at
`469ed17` or measured live in a browser; nothing is read from the dirty pair.

**Method note.** This round is the first in fifteen where the subject is
almost entirely *behavior* rather than content, so it is the first where
reading markup was not enough. Findings marked **LIVE** were measured by
running the built product in a real browser (root served at
`127.0.0.1:8000`, `/app`'s committed build at `/app/`) and reading
`document.activeElement`, `aria-*`, `tabIndex` and DOM node identity before
and after real events — not inferred from source. That method change is
itself a finding (see BS-6). Also verified this round: all four check
suites run to completion (`npm run check`: content PASS, storage 14, sw 12,
engine 21); `node -e` dumps of `t.en.json`/`t.es.json` for `c_retry` and a
regex sweep of all 463 keys for any existing error-state string; the
`esc()` definition at `index.html:2841` and all four `prx.best` render
sites; `hubTab()`/`llTab()` bodies at `index.html:3870` and `:3876-3907`;
`PracticeStep.tsx` in full; `PracticeHub.tsx` in full;
`ErrorBoundary.tsx` in full; `PrintStep.tsx:30,41,115,119`;
`a0bd4a2`'s full commit body. Attorney/UPL review and the two unsent memos
are excluded from findings — known, tracked, gating, and re-reporting them
wastes the round.

---

## 0. What's actually new this round, verified against source or measured live

| System | File | What it is |
|---|---|---|
| XSS escaping completed | `index.html:3482`, `:5473`, `:5593` | All three `innerHTML` render sites for `prx.best` now wrapped in `esc()` (`:2841`). Grepped every `prx.best` reference: the only remaining unescaped one is `:5406`, which is `fillText` on canvas, not HTML — correctly left alone. **Complete, verified, no gaps.** |
| First ErrorBoundary in `/app` | `components/ErrorBoundary.tsx` (new, 53 lines), `App.tsx:103-146` | Class component above the Suspense boundary, wrapping all of `<main>`'s body. `console.error` only, nothing off-device. Header, language toggle, beta note and disclaimer survive a throw. |
| Tablist ARIA, root | `index.html:3314`, `:3441-3448` | `ll-track` `role="group"` → `role="tabpanel"`; hub tabs gained `aria-controls="hubPanel"`; a new `<div id="hubPanel" role="tabpanel" aria-labelledby="hubTab${_hubTab}">` wraps the swapped content. **LIVE-confirmed working:** `aria-labelledby` tracks the active tab correctly through a switch. |
| Tablist ARIA + keyboard, `/app` | `PracticeHub.tsx:81-96,108-114,172`, `LifelinesStep.tsx:78-91,102-115` | Same ARIA, **plus** roving tabindex and Left/Right/Home/End. **LIVE-confirmed working** in the committed build: ArrowRight/End/Home each moved focus, `aria-selected`, `tabIndex` and the panel's `aria-labelledby` together, in both the hub (3 tabs) and lifelines (2 tabs). |
| **New finding 1 — root's hub tablist destroys keyboard focus on activation** | `index.html:3870` vs `:3876-3907` | **LIVE:** focus `hubTab1` → activate → `document.activeElement` is `BODY`. `hubTab()` calls `render()`, a full `innerHTML` rebuild; node identity confirmed destroyed (`tab1NodeReused:false`, `panelNodeReused:false`). The lifelines tablist is the counterexample in the same file: `llTab()` does a targeted update and **LIVE** focus survives (`llTab1` → `llTab1`, node reused). One file, one CSS class, two opposite keyboard behaviors — now both formally declared tablists. |
| **New finding 2 — the keyboard half of the fix shipped only to the app nobody uses by default** | `index.html:3441-3443` vs `PracticeHub.tsx:109-111` | **LIVE:** root's three hub tabs return `tabindex: null` — all three in the Tab order, no roving, and no `keydown` handler anywhere in root for them (grepped). `/app`'s return `ti=0/-1/-1` and full arrow-key nav. Root is the live product at `/`; `/app` is explicitly **not** the default entry (HANDOFF §"Not done, and deliberately so"). The markup went to both; the behavior went only to the one with no users. |
| **New finding 3 — `/app` removes the escape hatch from the consent gate; root doesn't** | `PracticeStep.tsx:108` vs `index.html:5484-5486` | `showHeaderBack = phase !== 'IDLE' && phase !== 'PRE_FLIGHT'` hides "← All scenarios" on the pre-drill warning screen. Root builds `hdr` — which *contains* `← ${_t.prx_all}` → `prxLevels()` — and prepends it to the warn branch. **LIVE:** on `/app`'s PRE_FLIGHT the only buttons are `EN / ES / ← Back / I'm ready`, and `← Back` exits practice entirely to the Print step. |
| **New finding 4 — the failure card says nothing and announces nothing** | `ErrorBoundary.tsx:44-51` | The entire fallback is `<div className="card"><button className="btn ghost">{t.c_retry}</button></div>`. No heading, no `role="alert"`, no `aria-live`, no focus move. `c_retry` dumped from both banks: `"Try again"` / `"Intentar de nuevo"` — authored at `index.html:2000` next to `c_enable:"Enable camera"`, i.e. it is the **camera** retry string. |
| **New finding 5 — neither tablist has an accessible name** | root + both `/app` ports | **LIVE:** `document.querySelector('.ll-seg[role=tablist]').getAttribute('aria-label')` is `null` in root's hub, root's lifelines, `/app`'s hub and `/app`'s lifelines. Four tablists, zero names. |

**Confirmed correct, not findings** — each checked rather than assumed:
the escaping fix is complete and `:5406` is correctly excluded; the
`ErrorBoundary`'s placement above `Suspense` is right for its stated
reason (a lazy chunk rejects into the boundary above the one that
suspended) and its `location.reload()` cannot loop, because `/app` does
not persist route (`App.tsx:43`, `useState({name:'welcome'})`) — a reload
lands on Welcome, never back on the screen that threw; `llTab()`'s
`addEventListener('scroll', llSync)` on every switch does **not** stack
listeners (same named function reference + same options dedupes per spec);
root's `ll-track` `tabindex="0"` on a `role="tabpanel"` is correct APG
because that panel has **LIVE**-confirmed zero focusable descendants;
`/app`'s `document.getElementById(...).focus()` immediately after
`onTabChange` is safe despite React's batching, and was measured working;
and the whole panel of FG14's golden items is now closed — tab persisted
(`PracticeStep.tsx:52` + props), native `disabled` removed
(**LIVE:** locked Hard Mode card reads `aria-disabled=true`, `disabled=false`,
`tabIndex=0`, `title` present, and its `hub_locked` text renders visibly
in the card), the parity comment corrected (`PracticeHub.tsx:44-50`), the
orphaned `.prx-*` CSS deleted with a logged note (`practice.css:56-57`),
and the pick-pulse timer cleaned up (`:58`).

**Correction to the record.** FG14 §Dana and FG14 golden-carry-forward both
report FG13's stale-best-score fix as shipped and correct in both banks.
It was **reverted** in `a0bd4a2`, and the revert was right: `run.length` is
not a per-level constant (crisis-tier beats shrink it, the daily curveball
grows it), so the denominator-aware compare demoted a 5/5 to a 1/6 and — worse —
demoted a 3/3 to a 2/2 *after a crisis disclosure*, penalising the one
interaction that must never cost a user anything. Root and `/app` are both
back to the numerator-only compare (`index.html:5517`,
`practiceEngine.ts:288`), with the genuine problem handled as a one-time
`prx.v>=3` migration that drops a `best[2]` ending in `/2`
(`index.html:4808-4814`). FG14's celebration of that fix is now stale and
should not be carried forward as a closed win.

**Small correction to this round's own claim.** "2437 strings still
byte-identical" is not quite what the gate reports. `--verify` output:
*"2437 (2292 byte-identical, 145 via source escapes/entities)."* The
invariant holds; the number 2437 is "verified present", not "byte-identical".

---

## 1. Ten persona reactions

**Selection rationale.** This round's subject is invisible to anyone who
does not use a keyboard, does not hit a failure, or does not read Spanish —
so the panel is weighted toward the people the change actually reaches, and
deliberately keeps three who it does not, to say so honestly.

- **Omar** (SR + 200% text) — the round is majority his by subject matter; mandatory.
- **Nia** (PTSD, exits the engine fast) — owns finding 3 exactly: the removed control is on the *consent gate*.
- **Keisha** (rideshare, 30-second patience, no printer) — the persona most likely to hit the ErrorBoundary in the wild and least able to pay its cost.
- **Rosa** (Spanish-first, mixed-status) — judges the product on whether Spanish is a first-class surface, including in failure.
- **Marisol** (Spanish-first, register-not-translation) — "Intentar de nuevo" is a correct word in the wrong register; that distinction is her entire lens.
- **Wes** (analytical side-entry, reads diffs) — the root-vs-`/app` divergence read.
- **Ana** (half-finished allergy, tuned to comment-vs-code distance) — "one shared grammar" now shipping two contracts.
- **Dana** (completionist, prints, drills with her kid) — the print path and the reload cost.
- **Luis** (DACA, older Android, prepaid data) — **swapped in.** Sat out ten rounds because no surface touched his lens. An error boundary whose likeliest trigger is a chunk that did not download, and whose only recovery is a full reload, is *his* device and *his* data plan. First round he has anything to react to that is not the payment trail.
- **Tony** (institutional trust, "a card won't stop a bad cop") — standing condition, plus the one who reads a wordless failure as an app hiding something.

Marcus, Devin and Ray sit out: no share surface, no game-loop surface, no
audience-boundary surface moved this round.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The `/app` half is genuinely good, and it is worth saying before the
  complaint.** I ran it: ArrowRight, End and Home each moved focus *and*
  selection across the three module tabs, `tabIndex` roved 0/-1/-1 correctly,
  and `hubPanel`'s `aria-labelledby` followed. FG14's golden #2 is also fully
  closed — the locked Hard Mode card is still tabbable, still carries its
  `title`, and now renders "Finish the first three to unlock" as *visible
  text inside the card*, not just a hover tooltip. That last part is more than
  was asked for and it is the right more.
- **Finding 1 is his round's headline and it is worse than a missing
  feature.** In root — the product he would actually land on — activating a
  hub tab with the keyboard throws his focus to `<body>`. Measured, not
  inferred. So the sequence is: Tab to the Checkpoint tab, press Enter, and
  he is now at the top of the document, with the entire header, language
  toggle, banners and stepper between him and the panel he just opened. To
  reach the second tab he does it again. To reach the third, again. Before
  v2.21.3 these were three buttons that happened to look like tabs and a
  screen reader described them as buttons. Now they announce as "tab, 1 of 3"
  in a tablist that controls a panel — a promise that arrow keys work and
  that activating one lands him in or near its content. Neither is true in
  root. **A correct ARIA role that the behavior contradicts is worse than no
  role**, because it tells him to use an interaction model that does not
  exist.
- **Finding 5 compounds it.** All four tablists are unnamed. He hears "tab
  list" with no indication of what it selects.
- **Finding 4 is the one that would actually frighten him.** If a screen
  fails, `<main>`'s content silently becomes a card containing one button
  reading "Try again". Nothing is announced — no `role="alert"`, no
  `aria-live`, no focus move. He does not get an error; he gets a page that
  quietly became almost empty. For a sighted user that is confusing. For him
  it is indistinguishable from the app having finished loading something.
- **Which first? Root's focus loss.** It is the only one that makes a
  keyboard user's *primary* navigation worse than it was last week.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Finding 3 is hers, precisely and by mechanism.** The screen `/app`
  removes the escape hatch from is the PRE_FLIGHT gate — the one that says
  "You will do everything right… and he will speed up" (`prx_warn8`) or "This
  one is mostly waiting… there is no score" (`prx_warn7`) and then asks her
  to press "I'm ready". That screen exists *because* escalation must be
  chosen and never sprung; root's own comment says so at `index.html:5485`.
  It is, by design, the screen where the answer is most likely to be no.
- **And it is the only screen in the entire practice flow with no way back to
  the list.** Measured live: the buttons are `← Back` and `I'm ready`, and
  `← Back` does not return her to the hub — it ejects her from practice
  entirely, back to the Print step. Root, on the same screen, offers
  "← Todos los escenarios" and returns her to the hub with her module tab
  intact. So the product she'd meet at `/` lets her decline a specific drill;
  the port lets her decline the whole module. **A consent gate with only one
  exit, and that exit leaves the building, is not really a consent gate.**
- **Every other change this round is neutral-to-good for her**, and the
  ErrorBoundary is mildly positive: a screen that fails now degrades to a
  card instead of a white page, which for someone who has learned to read
  app failure as "this thing was never real" matters more than it sounds.
- **Redo? Still no for hostile content. Refer? Conditional yes** — unchanged,
  but finding 3 is the first thing in three rounds she would name unprompted.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **She is the person the ErrorBoundary is *for*, and the one it serves
  worst.** Her session is one minute long, on a phone, on whatever signal a
  parking lot has. The likeliest way `/app` ever throws is a lazy chunk that
  did not arrive. When it does, she gets a card with one button and no
  sentence. She does not know whether the app is broken, her phone is, or she
  did something. She closes it.
- **The recovery costs her the whole walk.** `location.reload()` is the only
  action, and `/app` does not persist route (`App.tsx:43`) — she lands on
  Welcome. Her state selection survives (`pack` is read from storage at `:44`),
  but she is four taps from where she was: Build my pack → Continue →
  Continue → Preview my pack → Practice. Measured that path myself. For the
  persona explicitly defined by "something useful in her hand inside 30
  seconds," a failure costs her more than the feature was worth.
- **Finding 3 costs her too, for a different reason.** She samples. Tapping a
  scenario, reading the warning, deciding it is not the one she wants, and
  being thrown out of practice altogether is exactly the friction her profile
  is defined by.
- **The tab work is irrelevant to her** — she is a toucher, not a keyboard
  user. Saying so plainly rather than manufacturing a reaction.
- **Redo? Yes, unchanged. But this is the third round running where the
  findings net out badly for the persona with the highest real need.**

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **The Spanish is fine everywhere it was touched, and that is not nothing** —
  `hub_m1`→"Parada de tráfico", `hub_m3`→"Retén", `hub_locked`→"Termina los
  primeros tres para desbloquear", `ll_aria`→"Desliza para verlas una por
  una". All dumped from `t.es.json`, not assumed. No new untranslated surface
  shipped.
- **The failure card is the exception, and it is the surface where being
  Spanish-first hurts most.** Her son's phone shows a card containing the two
  words "Intentar de nuevo". In English "Try again" is at least a familiar
  browser-ish idiom. In Spanish, alone on an otherwise empty card, it reads as
  a fragment — an instruction with no subject. She would not know whether the
  app failed, the internet failed, or the app is refusing her.
- **She would notice, correctly, that this is a translation problem the
  translators never got a chance at**, because the string was never written.
  The project's rule that no copy is hand-typed in `/app` is the right rule
  and it produced this: rather than author a bad sentence, the boundary
  authored none. **The honest completion is one new sentence in
  `index.html`, EN and ES, re-extracted. It is not statute text, not a
  citation, not officer dialogue. Hard rule 1 does not block it.**
- **Redo? Yes.** Unchanged.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts

- **Her lens is register, and this is a register failure, not a translation
  failure.** "Intentar de nuevo" is the correct rendering of "Try again". The
  problem is what it is being asked to carry. Traced it to source: `c_retry`
  lives at `index.html:2000`, immediately beside `c_enable:"Enable camera"` —
  it was authored for the document-capture overlay, where the user just tapped
  a camera button and knows exactly what failed. Lifted onto a crashed screen,
  the same two words have no antecedent.
- **Compare what this product usually sounds like.** `hub_m2_body` explains,
  at length and in both languages, why the door module is not built —
  including "preferimos publicarlo tarde que publicarlo mal". `d_quota` says
  "Tu navegador se quedó sin espacio para fotos… nada se envió a ningún
  lado" — it explains the cause *and* reassures about privacy in the same
  breath. `em_fail` says "tu carpeta sigue funcionando". This product's own
  established voice, in Spanish, is to explain and reassure at the exact
  moment something fails. The one place it now says nothing at all is the
  place a user is most likely to assume the worst.
- **Her standing payment-trail objection is untouched** and this report does
  not manufacture a surface for it.
- **Redo? Yes on content quality — with the failure card named as the one
  place the voice drops out.**

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He would find finding 1 in two greps, and finding 2 in one.**
  `hubTab(i)` is `{ _hubTab=i; ph(...); render(); }` (`index.html:3870`) —
  a full `innerHTML` rebuild. `llTab(i)` (`:3876-3907`) rewrites
  `tr.innerHTML` and then explicitly patches the two tab buttons' classes and
  `aria-selected` in place. **Same visual control, same CSS class, two
  completely different update strategies, and only one of them can preserve
  focus.** Then: grep `.focus()` across all 5,913 lines of `index.html` —
  two hits, both inside the overlay focus trap at `:5908-5909`. Root has no
  focus-restoration machinery of any kind.
- **The structural read he'd give it is sharper than "a bug".** Root's
  renderer is destroy-and-rebuild-everything. That is not a defect of
  `hubTab()`; it is the architecture. Which means **every** interaction in
  root that goes through `render()` loses focus, and every future
  accessibility improvement to root runs into the same wall. `llTab()` works
  only because someone hand-wrote a targeted DOM patch to avoid `render()`.
  There is no third option that isn't one of those two.
- **Finding 3 is his second read.** `PracticeStep.tsx:108` is a single
  boolean, and the port's own header comments are meticulous about explaining
  every deliberate divergence from root — this one has no comment at all,
  which for his profile is the tell that it wasn't a decision.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **The commit is another good example of the discipline that keeps her
  quiet.** `ErrorBoundary.tsx`'s header explains why it's a class, why it
  reloads instead of resetting, why `console.error` is the entire report, and
  why the copy is one extracted string. `LifelinesStep.tsx:107-112` explains
  why *that* panel deliberately uses `aria-label` instead of
  `aria-labelledby` while the hub panel does the opposite — a two-line note
  pre-empting exactly the "these two are inconsistent" objection someone
  would otherwise raise. That is the acknowledged-cut pattern working.
- **And FG14's BS-5 got answered in the worst possible way.** FG14 asked who
  owns `.ll-seg`'s accessibility contract now that it is shared. The answer
  this round delivered: **the two consumers were given identical ARIA and
  non-identical behavior, and the codebase still calls it "one shared
  segmented-control grammar."** In `/app` both consumers got roving tabindex.
  In root neither did, and one loses focus while the other doesn't. The name
  now covers four implementations with three different keyboard contracts.
- **Two things are unlogged, which is her actual allergy, not the gaps
  themselves.** (a) Nothing anywhere records that root deliberately did *not*
  get the keyboard nav that `/app` got — the commit describes what shipped,
  not what shipped to only one of two products. (b) Nothing records that the
  error fallback is missing an explanatory sentence and why (the string does
  not exist yet). `ErrorBoundary.tsx:11-15` explains the *constraint*
  beautifully, but stops one sentence short of "so this is an open item."
  Constraint-explained is not the same as cut-logged.
- **Redo? Yes for what's built. Refer? Leaning conditional** — unchanged.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **Her round's find is small and old and now has a sharper name.**
  `PrintStep.tsx:30,41` keeps a `printed` flag set on the browser's
  `afterprint` event, and its **only** consumer is `:115` and `:119`, which
  swap `btn gold` ↔ `btn ghost` on two buttons. So `/app`'s entire
  confirmation that her pack printed is *a colour change*. FG12 called this
  "the missing print banner" and it has been open three loops; the accurate
  description is narrower and worse: **the print confirmation is conveyed by
  colour alone** (WCAG 1.4.1), which means Omar gets no confirmation at all
  and Dana gets one she has to notice.
- **She'd read the reload cost as the ErrorBoundary's real price.** Her
  pattern is print → run drills with her son → reprint. If practice throws
  mid-session, the reload puts her back on Welcome. Her state pill survives;
  her place doesn't.
- **She'd want to know FG13's fix got pulled.** Her stale-best-score finding
  shipped and was then reverted two days later because it demoted a 3/3 to a
  2/2 after a crisis disclosure. She'd back the revert immediately — of the
  two behaviors, "the app punished someone for saying they were in distress"
  is not a close call — but she is the persona who tracks exact numbers across
  replays, and she would want to hear it from the operator rather than
  discover it.
- **Redo? Yes. Refer? Yes** — unchanged.

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data

- **First round in eleven with a surface aimed at him, and it half lands.**
  `/app` ships a 21-entry, ~518 KiB precache and lazy-loads its screens. On
  prepaid data in a warehouse parking lot, "a chunk did not arrive" is not an
  edge case; it is Tuesday. Before this commit that produced a white page.
  Now it produces a card. That is a real improvement and it is aimed exactly
  at his conditions.
- **But the card cannot tell him the one thing he needs to know**, which is
  whether this is the app failing or *his connection* failing — and for
  someone whose threat model is "does this thing behave differently than it
  claims," an app that goes blank and says two words is the shape he is
  trained to distrust. `location.reload()` on a bad connection may simply
  reproduce the same failure with no new information and another few hundred
  kilobytes spent.
- **What he'd credit without prompting:** the boundary reports to
  `console.error` and nowhere else, and the file says so explicitly and
  explains that `connect-src 'self'` means there is nowhere off-device to
  send it even if someone wanted to. A crash handler that does not phone home
  is the version of that feature he can accept. Verified in source — no
  network call anywhere in `ErrorBoundary.tsx`.
- **His standing objection is untouched** and no surface here touches it.
- **Redo? Unchanged.**

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Nothing this round moves his standing condition.** The beta banner is
  unchanged; escaping, error handling and tab semantics do not touch
  institutional backing, which is the only thing his verdict has ever hinged
  on across eleven rounds.
- **But finding 4 rhymes with the one project rule he'd care about most.**
  Hard rule 3 exists because a badge once read "sources auto-checked daily"
  while all four sources were 403ing — "the failure wasn't the check breaking,
  it was breaking *quietly while still making its claim*." A screen that
  fails and displays a card with one button and no explanation is the same
  species of quiet. This product is unusually good at saying what it hasn't
  built (`hub_m2_h`: "Not built yet — and we won't fake it"); it should be
  equally plain about what just broke.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Make root's hub tablist survive a keypress, or stop calling it a tablist

**Evidence.** **LIVE, measured:** focus `#hubTab1`, activate it, read
`document.activeElement` → `BODY`. Node identity before/after: `hubTab1`
destroyed, `hubPanel` destroyed. Cause: `index.html:3870`,
`function hubTab(i){ _hubTab=i; ph(...); render(); }` — `render()` rebuilds
the screen's `innerHTML` wholesale. Grep of `.focus()` across `index.html`:
two hits, both in the modal focus trap at `:5908-5909`; root has no focus
restoration. Contrast, same file, **LIVE**: `llTab()` (`:3876-3907`) patches
`tr.innerHTML` plus the two buttons' `class`/`aria-selected` in place —
focus survives, node reused. Additionally **LIVE**: root's hub tabs return
`tabindex: null` (all three tabbable, no roving) and root has no `keydown`
handler for them, so arrow keys do nothing.

**Impact.** Before v2.21.3 these were buttons that a screen reader described
as buttons, and losing focus after a click was ordinary. v2.21.3 declared
them `role="tab"` inside a `role="tablist"` with `aria-controls` pointing at
a real `role="tabpanel"`. That declaration is a contract: arrow keys move
between tabs, and activating one puts you at its panel. Root honors neither,
and this is the product 100% of real users land on. **An ARIA role the
behavior contradicts is worse than the plain buttons it replaced**, because
it instructs the user to use a model that does not exist. Two options, both
cheap: (a) after `render()` in `hubTab()`, restore focus —
`document.getElementById('hubTab'+_hubTab)?.focus()` — and add the same
keydown handler `/app` already has, or (b) rewrite `hubTab()` as a targeted
patch the way `llTab()` already is. Omar's finding by name; Wes seconds it
from the diff.

### 2. Restore "← All scenarios" on `/app`'s PRE_FLIGHT consent gate

**Evidence.** `PracticeStep.tsx:108`:
`const showHeaderBack = state.phase !== 'IDLE' && state.phase !== 'PRE_FLIGHT'`.
`:121-123` renders the `← ${t.prx_all}` link only when that is true. Root,
`index.html:5484-5486`: `hdr` is built containing
`<button class="prx-hdr-back" onclick="prxLevels()">← ${_t.prx_all}</button>`
and the warn branch renders `b.innerHTML = hdr + <div class="prx-warn">…`,
so root shows it. **LIVE** on `/app`'s Checkpoint warn screen: the only
controls are `EN`, `ES`, `← Back`, `I'm ready`, and `← Back` (`:118`,
`onClick={onBack}`) leaves the practice route entirely — landed on the Print
step, confirmed by the reappearance of "🎴 Practice the script".

**Impact.** This is the opt-in escalation gate — root's own comment calls it
"escalation is chosen, never sprung." It is the screen most likely to get a
"no", it fires for every level ≥ 2 (Ordered out, Hard mode, Checkpoint), and
it is the single screen in `/app`'s practice flow where the way back to the
list is removed. A user who declines a drill is ejected from the module.
Nia's finding by mechanism, Keisha's by cost. One boolean:
drop `&& state.phase !== 'PRE_FLIGHT'`. **Unlike every other divergence in
this port, this one carries no comment explaining it** — which is the
evidence it was not a decision.

### 3. Give the failure card a sentence, an announcement, and focus

**Evidence.** `ErrorBoundary.tsx:44-51` renders exactly
`<div className="card"><button className="btn ghost">{t.c_retry}</button></div>`.
No heading, no `role="alert"`, no `aria-live`, no focus move on mount.
`c_retry` dumped from both banks: `"Try again"` / `"Intentar de nuevo"`,
authored at `index.html:2000` beside `c_enable:"Enable camera"` — the
**camera** retry string. Regex sweep of all 463 keys for
`wrong|error|fail|problem|sorry|reload|refresh`: the only near-misses are
`em_fail` ("Couldn't send right now — your pack still works…") and `d_quota`
("Your browser ran out of room for photos… nothing was sent anywhere"), both
bound to their own features. **The file's reasoning is correct** — no
suitable string exists and authoring copy in `/app` would break the
extraction invariant.

**Impact.** The fix is one new EN+ES sentence in `index.html`, re-extracted
— and **it is not blocked by hard rule 1**: it is not statute text, not a
citation, not officer dialogue. Two things should ride with it: `role="alert"`
so a screen-reader user learns the screen failed rather than silently
receiving an almost-empty page (Omar), and a note that this is what a
returning user's recovery costs, because `/app` doesn't persist route
(`App.tsx:43`) so a reload returns to Welcome. Look at what this product's
own voice does elsewhere in the same situation — `d_quota` names the cause
*and* reassures about privacy in one line — and the gap is obvious. Rosa,
Marisol, Omar, Luis, Tony all land on this one from five different
directions, which is unusual.

### 4. Name the four tablists

**Evidence.** **LIVE**, `.ll-seg[role=tablist]` `aria-label` is `null` in
all four instances: root hub, root lifelines, `/app` hub, `/app` lifelines.
Source-confirmed: `index.html:3310`, `:3440`, `PracticeHub.tsx:108`,
`LifelinesStep.tsx:102` all read `role="tablist"` with no naming attribute.

**Impact.** The smallest item here and the only one that is four identical
one-attribute edits. A screen reader announces "tab list" with no indication
of what it selects — on the hub, the three tabs *are* the product's three
modules, which is exactly the information the split was created to convey
(FG14 §Nia). Two suitable strings almost certainly already exist in the
banks (`hub_title`, `l_sub`'s neighbours); if not, an `aria-label` is UI
chrome, so the same one-sentence-in-`index.html` route as golden #3 applies.
Ranked below #3 because it degrades an experience rather than hiding a
failure.

### 5. Stop conveying the print confirmation with colour alone

**Evidence.** `PrintStep.tsx:30` `const [printed, setPrinted] = useState(false)`;
`:41` `const onAfterPrint = () => setPrinted(true)`; the **only** two
consumers are `:115` `className={`btn ${printed ? 'ghost' : 'gold'}`}` and
`:119` `className={`btn ${printed ? 'gold' : 'ghost'}`}`. Grepped — there is
no third reader of `printed` in the file. Root's equivalent is a whole
`postPrintActions` block (`index.html:3367`, `:5808-5841`), listed as an
accepted deferral in `wargames/18`.

**Impact.** FG12 called this "the missing print confirmation" and it is now
three loops open, which on its own would not earn a slot. The reason it does
is that the accurate description is narrower and is an accessibility defect
rather than a missing nicety: **the app's confirmation that the user's pack
printed is a colour swap and nothing else** — WCAG 1.4.1, invisible to Omar
entirely, and easy for Dana to miss. The *rail* is a signed-off deferral and
should stay deferred; what should not is a state flag whose sole rendering
is colour. `role="status"` on a one-line text change, using an existing
extracted string, is the minimum. Lowest magnitude here because the flow
still works — the user just isn't told it did.

---

## 3. What must change in the practice MODULES specifically

**Scoped to `screens/practice/`, `PracticeStep.tsx`, `engine/`, root's step-5
hub and practice overlay, and their content banks** — not the wizard, not the
print pack except where noted.

- **Restore `← All scenarios` on PRE_FLIGHT** (golden #2) —
  `PracticeStep.tsx:108`. One boolean. Root already behaves correctly
  (`index.html:5484-5486`); this is the port diverging without a comment, on
  the module's consent gate, for every level ≥ 2.
- **Fix root's hub tab focus loss and add its keyboard nav** (golden #1) —
  `index.html:3870`. Either restore focus after `render()` or convert
  `hubTab()` to a targeted patch like `llTab()`. `/app`'s handler
  (`PracticeHub.tsx:86-96`) is a working, measured reference implementation
  that can be ported almost verbatim.
- **Name the hub tablist** (golden #4) — `index.html:3440`,
  `PracticeHub.tsx:108`. On the hub specifically this is not cosmetic: the
  three tabs *are* the module taxonomy the v2.13.0 split created.
- **Derive the hub progress denominator once** — `PracticeHub.tsx:127-128`
  still reads `t.hub_progress.replace('{t}', '4')` on one line and
  `rungsDone / RUNGS.length * 100` on the next. Last unfixed sub-item of FG14
  golden #5, and the same two-expressions-of-one-fact shape that produced the
  best-score bug. Verified still present at `469ed17`.
- **Decide what the orphaned `prx_ld*` strings are for, or delete them**
  (FG14 golden #3, **half-closed**). Verified: the dead CSS *is* gone and the
  deletion *is* logged (`practice.css:56-57`). But `prx_ld1`-`prx_ld5`,
  `prx_sel_sub` and `prx_locked` are still in `t.en.json`/`t.es.json`, fully
  bilingual, with **zero renderers anywhere in `app-src/src`** (grepped).
  They are alive in root (`index.html:5472`, the `lc-d` span on the in-run
  flat list), so `--verify` will never flag them — see BS-2. `/app` still has
  no screen that says what a scenario is before you enter it.
- **Do not carry FG14's stale-best-score win forward.** `index.html:5490-5493`
  and `practiceEngine.ts:296-302` as FG14 described them no longer exist;
  both banks reverted to the numerator-only compare (`index.html:5517`,
  `practiceEngine.ts:288`) plus a `prx.v>=3` migration
  (`index.html:4808-4814`). The revert was correct — the "fix" demoted a 3/3
  to a 2/2 after a crisis disclosure.
- **Carry-forward, unchanged, operator's own explicit decision (not a new
  finding):** `PRX_VAR[2]`/`PRX_VAR[7]`'s missing hostile variants and the
  resulting double no-op in `PRX_DIVERGE[2]`. Needs officer dialogue this
  project never authors.
- **Carry-forward, verified closed this round:** FG14 goldens #1 (hub tab
  persisted — `PracticeStep.tsx:52` + props), #2 (native `disabled` removed,
  **LIVE**-confirmed the locked card is tabbable, titled and now shows its
  lock text as visible copy), #4 (parity comment corrected,
  `PracticeHub.tsx:44-50`), and the uncleaned pick-pulse timer (`:58`).

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG14

**BS-1. All four check suites passed on a build where root's primary
navigation loses keyboard focus — so what, exactly, are the gates for?**
`npm run check` runs content extraction (2437 strings), storage-key shape
(14), service-worker routing (12) and practice-engine math (21). Every one
of them is a *static* assertion about bytes, keys, routes or arithmetic.
**Not one of them touches the DOM, and none of them could have caught a
single finding in this round.** Focus loss, missing arrow keys, a wordless
error card, an unnamed tablist, a colour-only confirmation, a hidden back
link — all invisible to the entire test suite, by construction. The project
has 47 automated assertions and zero behavioral ones. The question isn't
"add E2E tests" (that's an answer, and probably the wrong-sized one); it's:
*which single behavior, if it silently broke, would hurt a real user most —
and is it currently protected by anything other than someone remembering to
click it?* Every accessibility improvement across fifteen rounds is
currently unprotected against its own next refactor.

**BS-2. `extract-app-content.mjs --verify` compares banks to `index.html`,
not renderers to banks — has anyone stated that boundary out loud?** FG14's
BS-2 asked this; this round answers it and the answer has teeth. Seven
bilingual strings (`prx_ld1`-`5`, `prx_sel_sub`, `prx_locked`) have zero
`/app` renderers and passed the gate cleanly again this release, because
they are legitimately used *in root* and the verifier's whole job is
root↔bank equality. That is not a bug in the verifier; it is the verifier
working as designed. But the invariant everyone repeats — "content can't
drift" — is doing less work than it sounds like. It guarantees `/app` never
*invents* copy. It guarantees nothing about `/app` ever *showing* copy. Two
different promises, one sentence, and the second one is the one the
personas keep catching.

**BS-3. Root's `render()` destroys and rebuilds — so is "root cannot manage
focus" a bug, or is it a permanent property that belongs on the `/app`
promotion decision?** HANDOFF Task 2 lists four factors for that call:
bundle size, view-source auditability, 19 deferrals, and analytics
blindness. **Accessibility is not on the list.** This round makes it a
candidate: `/app` has working roving tabindex and arrow-key nav because
React reconciles and preserves nodes; root does not and structurally cannot
without hand-writing a targeted DOM patch per control, which is exactly what
`llTab()` already is and `hubTab()` already isn't. That is not one bug — it
is a per-control tax on every future a11y improvement to root, forever. It
may not change the decision. It has not been priced.

**BS-4. What is the threat model that made escaping `prx.best` this
release's headline?** The fix is correct and cost nothing, so this is not a
criticism of doing it — it's a question about what sets priority.
`prx.best` is written at exactly one place (`index.html:5517`) with a
value the app itself computes as `sc+'/'+prRun.length`. Reaching those
`innerHTML` sites with a payload requires an attacker who can already write
to `localStorage` on this origin — i.e. devtools, or another app on the same
origin, which for a static single-file site is nobody. Meanwhile the same
release's genuine user-facing risk — a screen that fails and says two words
— shipped incomplete. Is there a written threat model anywhere, and if not,
how were `esc()`, the CSP and the "never off-device" rule chosen? Those three
are excellent decisions; the concern is that they may be excellent
*instincts*, and instincts do not rank a stored-XSS-with-no-attacker against
a silent failure with a real one.

**BS-5. The calibration log in `.focus-group/members.md` is still empty
after fifteen rounds — what would one 20-minute screen-reader session cost?**
Verified: the file's last line is still
`Calibration log: (add real-user feedback here as it arrives)`. Omar has now
generated accessibility findings in eight consecutive rounds and Omar is a
persona. Every a11y conclusion this loop has produced — including this
round's, which is the loop's most technically confident output yet — was
reached by reading source or scripting a headless browser, and neither of
those is a screen reader. The product has one real user transcript on file
and that user is not one. **A single NVDA or TalkBack pass over the hub and
the failure card is the cheapest thing available that could confirm or
invalidate an entire class of this loop's output** — including the
possibility that findings 1 and 5 are worse in practice than modeled here,
or that some are noise.

**BS-6. Root's hub focus loss predates this release and three prior reviews
of this exact tablist missed it — is the review method the reason?** FG14
§Omar analyzed `PracticeHub.tsx:73-75` against `LifelinesStep.tsx:82-85`
attribute by attribute and concluded the gap was `aria-controls` and roving
focus. `wargames/21` flagged the same tablist as structurally incomplete.
Both were right about the markup and both missed that root's version drops
focus on the floor, because **the bug does not exist in the markup**. It
exists in the difference between two functions that produce identical
markup. Every round of this loop until now has reviewed source; this round
found its two biggest items by running the thing and reading
`document.activeElement`. The generalizable question: *what else in this
codebase is markup-correct and behavior-broken?* The candidate list starts
with everything that goes through root's `render()` — the stepper's
clickable completed nodes, the state pill, the search box Omar has been
"RECON, not asserted" on since v2.5.0 — and none of it has ever been
measured. (Marked explicitly: those three are **UNVERIFIED**. I did not test
them. They are named as the obvious next place to look, not asserted as
broken.)

**BS-7. Nobody has decided what a failure should cost the user.** `/app`
holds route in `useState` (`App.tsx:43`) and the boundary's only recovery is
`location.reload()`, so any crash anywhere returns the user to Welcome and
costs four taps back to practice — while `pack` survives because it is
persisted at `:44`. That asymmetry is an accident of which pieces of state
happened to get persisted, not a decision about what a user should lose when
something breaks. And the two failures the boundary will actually see are
completely different events — a code bug (rare, the developer's fault,
reload probably fixes it) and a chunk that didn't download (common on
Luis's and Keisha's connections, nobody's fault, reload may just fail again
and cost data). Today both produce the identical wordless card. Should they?

---

## 5. Group read

**Would-evaluate-favorably verdict: 6 yes/conditional-yes (Dana, Wes, Ana,
Rosa, Marisol, Nia) / 2 neutral, standing conditions unchanged (Tony, Luis) /
2 conditional with real new complaints (Omar, Keisha).** No verdict moved on
its own merits — this is a hygiene release and the panel treats it as one.

**Biggest objection by theme.** Every new finding this round is a variation
on one shape, and it is a shape none of the previous fourteen produced:
**the release added correct declarations without the behavior they
declare.** Root's tabs now announce as tabs and do not act like tabs. The
error boundary now catches errors and does not report them. The tablists
now control panels and cannot be named. The print flag now tracks a real
event and renders it only as a colour. FG10's pattern was "built but not
wired"; FG12's was "ported from the wrong source"; FG14's was "rebuilt
without the incidental behaviors." This one is *declared without the
behavior* — semantics shipped ahead of mechanics, which is a specific and
recurring failure mode of accessibility work done by reading a spec instead
of using the thing.

**Highest-leverage fix, this round's subject specifically.** Golden #1 —
root's hub focus loss. It is the only finding that makes the live product
*worse for a keyboard user than it was before the release*, it was measured
rather than reasoned, and `/app` already contains a working reference
implementation of the fix.

**Highest-leverage fix, across the whole product regardless of surface.**
Golden #3 — the failure card's missing sentence. Five of ten personas reach
it independently from five different directions (Spanish register, screen
reader, prepaid data, institutional trust, plain confusion), it costs one
EN+ES sentence in `index.html` plus a re-extract, and hard rule 1 does not
block it. Nothing else on this list has that ratio.

**Who this still isn't for.** Tony (no institutional backing, unchanged
across eleven rounds). And Keisha, for the third round running — this
release's headline improvement is a failure handler she cannot read, on a
recovery path that costs her more time than the feature saves.

---

## 6. Signature

Generated by Amparo Focus Group 15 (v2.21.3 hygiene-release review,
ten-persona panel).
**Panel:** Omar, Nia, Keisha, Rosa, Marisol, Wes, Ana, Dana, Luis, Tony.
Luis swapped in for the first time in eleven rounds; Marcus, Devin and Ray
sit out with reasons stated.
**Scope:** `469ed17` (v2.21.3) — `esc()` at `index.html:3482`/`:5473`/`:5593`,
`app-src/src/components/ErrorBoundary.tsx` + `App.tsx:103-146`, and tablist
ARIA in `index.html:3314`/`:3441-3448`, `PracticeHub.tsx` and
`LifelinesStep.tsx`. FG14 goldens #1/#2/#4 verified closed; #3 verified
half-closed; #5's denominator sub-item verified still open. FG13 golden #2
verified **reverted** and the revert verified correct. Attorney/UPL review
and the two unsent memos excluded by instruction.
**Verdict date:** 2026-08-13.

Every finding is tied to committed source at `469ed17`, to a `node -e` dump
of the extracted banks, to a completed `npm run check` run, or to a live
browser measurement of the running product. Items marked **LIVE** were
measured, not inferred. The only claims in this document I could not verify
are named as **UNVERIFIED** in BS-6 — root's stepper nodes, state pill and
search box are flagged as the next place to look, not asserted as broken.
