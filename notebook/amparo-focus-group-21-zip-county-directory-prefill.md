# Amparo focus group 21 — the shortcut that skips the field built the day before (v2.22.12 → v2.22.13)

**Agent A of the `/amparo-loop`, run standalone.**
Build under test: HEAD `b8230a1` (docs commit for tag **v2.22.13**). Feature commit `60dc876`/`1f09102`
(rebase pair, same message — `feat: ZIP/county input on You step, pre-fills state directory search`), one commit
after `d0cd28a` (daily statute check, non-app), two commits after `273cd56` (v2.22.12, `fix: Welcome's
lawyer/hotline shortcut now actually skips You`) — same session, same day, confirmed by `git log`. Verified by
direct source read — `index.html` and `app-src/src/**` at HEAD — plus `git show`/`git log` for commit bodies and
stats, `CHANGELOG.md` for the project's own claims, and `notebook/amparo-directory-feasibility-2026-08-16.md` for
the research this feature both extends and, in one section, reverses.

**Excluded by instruction, not re-reported as new:** attorney/lawyer review in any form.

---

## 0. What is actually new, verified

### 0.1 The commit trail this round sits inside

Same-day sequence, oldest to newest: `273cd56` (v2.22.12 — the Welcome "just need a lawyer" shortcut link now
*really* skips You and lands directly on Lifelines, closing FG19 golden #1) → `d0cd28a` (unrelated cron check) →
`60dc876`/`1f09102` (this round — a ZIP/county field added to You, feeding three states' directory links) →
`b8230a1` (docs). The adjacency matters directly: see golden #1.

### 0.2 The mechanism, confirmed against source

Root: `index.html:3469-3470` adds `<input id="f_zip">` to the You-step form, `oninput="data.zip=this.value;persist()"`.
`LifelinesStep`'s equivalent read (`:4157`) builds the enhanced href only when three things are all true —
`c.href` exists, `L.zipParam` is set on that lifeline entry, and `data.zip` is non-empty:
`` `${c.href}${c.href.includes('?')?'&':'?'}${L.zipParam}=${encodeURIComponent(data.zip)}` ``. `zipParam` is defined
on exactly three lifeline entries project-wide — `grep -n zipParam index.html` returns only NY (`:2597`,
`coverage_area`), DC (`:2689`, `location`), SC (`:2705`, `location`) — confirmed, no other state carries the field.
`/app`: `YouStep.tsx:74-77` (the field, with a code comment citing this exact research lineage),
`LifelinesStep.tsx:55,134-136` (identical three-condition gate, `readApp` reads the ZIP once on mount, not
reactively). The printed pack shows `ZIP / county` conditionally on `data.zip`/`you.zip` being truthy, independent
of directory support, on both surfaces — root `index.html:4468-4469`, `/app` `PrintPack.tsx:236` — confirmed
identical conditional structure, matching the commit's own "always useful printed on the pack" claim.

51 total jurisdictions in this product's state table (50 states + DC). 3 cited states with fully researched
content (TX, GA, NY — `states.json`). 24 `STATE_LEGAL_AID` states with a directory link but no cited rules
content. Of all 51, exactly **3** (NY, SC, DC) carry `zipParam`; the other **48** — including 21 of the 24
`STATE_LEGAL_AID` states — render a plain, unenhanced link exactly as before this round shipped.

---

## 1. Ten persona reactions

Selected to cover: the two intersecting features this round's diff touches (the ZIP field itself, and its
interaction with v2.22.12's shortcut, shipped in the same session) — residents of the 3 zipParam states who can
test the enhancement directly (Marisol, Wes, Marcus — all NY), residents of non-enhanced states who test the
degrade-gracefully path (Rosa/GA, Ana/AZ, Dana/TX, Luis/TX), the privacy axis this feature raises for the first
time in the product's history (Luis, Rosa, Marisol), accessibility (Omar), and the two personas the shortcut
itself was purpose-built for and who therefore never reach this round's new field at all (Keisha, Nia).

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, "something useful in her hand inside 30 seconds"

She is, by the CHANGELOG's own framing across two consecutive commits, the target of *both* features this session
touched — v2.22.12 built her a real shortcut past You; v2.22.13 built the exact thing she'd have wanted on the
screen the shortcut just taught her to skip. She taps "Just need a lawyer or hotline number," which sets
`_wantLifelinesShortcut=true` (`index.html:3368`) and lands her on Lifelines via `stateContinue()`'s branch
(`:4301-4309`, confirmed: `goM(3)`, never `goM(2)`/You) — the same jump `/app`'s `App.tsx:133,148-153` makes,
routing straight to `'lifelines'`, never `'you'`. GA isn't one of the 3 zipParam states either way, so she
wouldn't have benefited from typing a ZIP even had she seen the field — but the shape of the miss is the point:
"You built the fast lane and the thing that would make the fast lane actually useful in the same afternoon, and
they don't meet."

Redo? Conditional — unaffected personally (GA has no zipParam entry), but the strongest evidence on the panel for
golden #1.

### 🧑 Nia, 41 — NY, PTSD, wants a non-simulated checklist route, escalation opt-in

NY is one of the 3 zipParam states — she is the single persona on this panel for whom every piece could have
lined up: her state supports it, her stated need (a fast, non-simulated path to real help) is exactly what a
pre-filled directory search serves. She takes the Welcome shortcut, same as Keisha, and for the identical
code-verified reason (`_wantLifelinesShortcut` skips `goM(2)`) never sees `f_zip`. She reaches Lifelines and gets
the plain `lawhelpny.org/find-legal-help` link — functional, but the blank-form problem this whole round exists to
solve is still there for her specifically, the one persona positioned to get the full benefit. "The lawyer link
works. It's the same blank form Rob Hannes had. I just took the door you built for exactly my situation."

Redo? Conditional — same shape as her FG19 read: closer in spirit, not closed in mechanism. New instance, not a
repeat: FG19 flagged the shortcut's destination; this flags what the shortcut still skips one round later.

### 🧑 Marisol, 29 — NY, green-card holder, reads what's actually promised

She takes the primary "Build my pack" path (not the shortcut), reaches You, and is the panel's one member who'd
actually fill in the ZIP field as intended — NY, one of the 3 states, real payoff available. She'd read
`i_zip_ph` first, in the field itself: *"Helps narrow the legal-aid directory to your area"* — unqualified,
no scope. Only after typing would she notice the smaller note below it, `i_zip_note`, which correctly scopes the
promise: *"For the states with a matching directory (NY, SC, DC so far)..."* (`index.html:2078`). "The bigger
text made a promise the smaller text immediately narrowed. I happen to be one of the three it's true for — I'd
have believed the big text either way, so this time it didn't cost me anything. It would for anyone in the other
48." She'd follow through and confirm the payoff is real: her ZIP lands in the query string exactly as promised,
`?coverage_area=`, `target="_blank"` (`:4161`) — a real external navigation, which she'd immediately connect to
the banner two screens back.

Redo? Yes on the mechanism working as documented for her own state. Flags golden #3 and #4 unprompted — same
literalism she's brought every round since FG17.

### 🧑 Wes, 38 — Brooklyn, NY, doesn't drive, hunts the pack on purpose

NY resident, one of the 3. He's the panel member most likely to test the field out of curiosity rather than need,
and the one most likely to actually click through to the external site rather than just reading the URL in
source. He does — a real tab opens to `lawhelpny.org/find-legal-help?coverage_area=`, his own test ZIP appended,
readable in the address bar the instant the page loads. "The banner up top says nothing I type leaves my phone.
I just watched my ZIP code leave my phone, in a URL, in a new tab, the second I tapped a normal-looking link."
He'd credit the mechanism for working exactly as engineered — `lifeContact()`'s type detection, the query-param
splice, the `rel="noopener noreferrer"` on the new tab — all correct, all deliberate. His objection isn't that
anything is broken; it's that the trust copy never updated to describe the one path in the product where it's
no longer literally true.

Redo? Yes on the mechanics. New, sharpest read on golden #2 — nobody in FG19/20 tested this because nothing in
the product sent user-entered data off-device before this round.

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

NY resident, one of the 3, and the panel's reliable low bar for "does an ordinary user register this as a
problem." He'd type a ZIP because the field's right there, tap through Lifelines, and not think twice about the
URL — same shrug energy as his FG19/20 reads. "Didn't even look at the address bar. Clicked a lawyer link, got a
lawyer page." Useful data point: for a sighted, non-completionist user who isn't specifically checking the trust
banner against the mechanism, nothing about this round reads as broken. He would notice, unprompted, that the
placeholder tells him what to type and the field label calls it optional — clear, no friction, exactly what he'd
want from a form he doesn't want to spend time on.

Redo? Yes, unaffected by this round's findings — same mildest-reaction role he's played every round since FG19.

### 🧑 Ana, 31 — Phoenix AZ, wants to know the app covers her state

Arizona is one of the 24 `STATE_LEGAL_AID` states (added v2.22.9) but NOT one of the 3 zipParam states — she
reaches You, sees the ZIP field, fills it in expecting it to matter (her state already got a directory upgrade
two rounds ago, so "will this help my specific search" is a reasonable read of the field's presence), and gets
the plain `AZLawHelp.org` link unchanged from before this round shipped. She'd re-read `i_zip_note` and find her
own state isn't on the three-state list, same disappointment shape as her FG20 read on the QR gap — "you gave my
state's directory a real upgrade in v2.22.9. This round gave three *other* states a second upgrade on top of the
first one and left mine where it was." Not a new complaint category — a second concrete instance of FG20 golden
#1's "new machinery didn't extend to states that would benefit most" pattern, now on a different mechanism.

Redo? Conditional — the underlying AZ directory link still works exactly as it did last round; the disappointment
is proportional (a field that visibly exists and doesn't do anything for her specific case), not a regression.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

AZ resident, same non-zipParam state as Ana. He tabs to `f_zip`, hears the label (*"Your ZIP or county
(optional)"*) and the placeholder if his screen reader announces it — no `aria-describedby` ties the input to
`i_zip_note` on either surface (confirmed: root `index.html:3469-3470` and `/app` `YouStep.tsx:74-77` are a bare
`<label>`+`<input>`+sibling `<p>`, no `id`/`aria-describedby` pairing). This is the same unlinked-note pattern the
form already uses for `i_ec2_note` two fields up — not a new gap this round introduced, so not counted as a fresh
finding on its own — but it lands differently here: for every *other* optional field on this screen, the
unlinked note is cosmetic elaboration; for this one, it's the only place the three-state scope limit lives. A
screen-reader user who doesn't independently discover the sibling paragraph gets the unqualified promise only.

Redo? Conditional — not a new defect category, but a new consequence of an old one, worth a mention rather than a
ranked golden on its own (see golden #4, which covers the sighted version of the same gap).

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything collecting data

GA — cited state, not zipParam. She is the panel member most primed to notice golden #2 on principle even without
testing it herself: the pilotBanner's Spanish text (*"Nada de lo que escribes sale de tu teléfono"*) is the exact
promise she came in checking, confirmed unchanged this round (`index.html:2219`). She would not personally fill
in the ZIP field — nothing she types is supposed to go anywhere, by her own reading of the banner, and for her
state that remains true: GA has no `zipParam` entry, so even if she typed a ZIP, `LifelinesStep`'s three-condition
gate (`href && zipParam && zip`) never fires and the link stays plain. Her risk is narrower than Wes's or
Marisol's: if she ever visited a zipParam state's content (she wouldn't, GA is her own state's content) or if her
son used the app in NY, the same gap would apply to him without him necessarily reading the small-print note
first.

Redo? Yes, unaffected in her own case — the mechanism's honesty holds exactly for her state, which is the
majority case (48 of 51).

### 🧑 Luis, 27 — TX, DACA, prepaid data, distrusts anything cloud/trackable

TX — cited state, not zipParam. He is the panel's sharpest reader of exactly this class of gap, on principle
(FG19/20: "distrusts card payments creating identity trails, anything cloud"). He'd read `i_zip_note`'s
qualifier as the load-bearing sentence in the whole feature and, unprompted, ask the harder question behind
golden #2: "if I'm ever in one of the three states this actually works for, does anything about the form warn me
*before* I type, not after, that this field is different from every other field on this screen — the one that
can put something I wrote into a URL a third-party site can log?" TX doesn't carry `zipParam`, so his own use is
unaffected; his objection is architectural, same shape as his FG19 read on the Welcome shortcut's unfulfilled
promise: the field's actual behavior should match what a user assumes on first read, and right now that gap is
resolved by a note below the fold rather than a distinction built into the form itself.

Redo? Yes on his own case (TX degrades to a plain link exactly as promised). Flags golden #2 from principle, same
as Wes flags it from direct observation.

### 🧑 Dana, 52 — TX suburb, the panel's completionist

TX — cited state, not zipParam. She'd go looking for the freshness question that's been her throughline since
FG16: does the ZIP field's own copy match its actual current scope? It does, exactly — `i_zip_note` says "NY, SC,
DC so far," present tense, no stale date claim the way the print-header date has been in prior rounds. Clean on
that specific front. She'd instead land on the commit trail itself: `git log` shows `273cd56` (the shortcut fix)
landed two commits before `60dc876` (this round), same session, same day. "You fixed the shortcut to skip You,
then in the very next feature commit built something on You that the fix you just shipped skips. Did anyone
click through the shortcut path after adding the field, or only the direct path?" The commit body for `60dc876`
describes verifying "in browser on both surfaces" — but its own text only names the direct path's URL output,
never mentions the shortcut.

Redo? Yes. Refer? Yes — same strongest-holding verdict as FG16-20, this round's clearest concrete instance is
golden #1 itself.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The Welcome shortcut fixed one commit earlier in the same session now skips the field this round exists to build — the fast path built for "just need a lawyer" and the ZIP field built for "help me find a lawyer near me" were shipped four commits apart and never tested together

**Evidence.** `index.html:3368`: the Welcome shortcut link sets `_wantLifelinesShortcut=true` then calls `goM(1)`.
`stateContinue()` (`:4301-4309`, the State screen's own Continue handler) branches on that flag: when true, it
calls `goM(3)` (Lifelines) and explicitly `return`s — never reaching `goM(2)` (You), where `f_zip` lives
(`:3469-3470`). `/app`'s identical branch: `App.tsx:133` sets `wantLifelinesShortcut` via `onSkipToLifelines`,
`:148-153` routes to `'lifelines'` inside the `'state'` screen's own next-handler, never `'you'`. `git log`
confirms the sequence: `273cd56` ("Welcome's lawyer/hotline shortcut now actually skips You" — v2.22.12) lands
two commits before `60dc876`/`1f09102` ("ZIP/county input on You step" — v2.22.13, this round), same session,
same day (`git log --oneline -5`).

**Impact.** Both features are independently correct and well-built — verified above, nothing to fix in either
mechanism on its own. The gap is interaction: the two personas explicitly named as this project's motivating
cases for the shortcut (Keisha, Nia, both cited by name in FG19 and this round) are structurally the two personas
who will never see the field built specifically to help "someone like Rob Hannes" (the CHANGELOG's own phrase,
v2.22.9/13) find a lawyer near them. The real user story that justified this whole round — a stranger messaging
over Facebook for help finding a pro bono lawyer near Hudson Valley, NY — describes exactly the low-friction,
"I don't want the full flow" behavior the shortcut was built to serve, and that path bypasses the fix.

**Cheapest fix that holds:** when `stateContinue()`'s shortcut branch fires, don't skip past the one field the
shortcut's own destination now depends on for its best result — either surface a single ZIP prompt inline on
Lifelines itself when arriving via the shortcut (reusing the same `i_zip`/`i_zip_ph` strings), or let the
shortcut land on You with everything *except* the ZIP field pre-skippable via the existing one-tap
`i_skip_all` pattern already in `YouStep.tsx:93`. Either reuses machinery already in the file; no new component.

### 2. The product's headline privacy claim — "nothing you enter leaves your phone" — is now literally false at the exact moment a NY/SC/DC user taps their enhanced Lifelines link, and nothing in the product's copy marks that this field is different from every other field on the same screen

**Evidence.** `pilotBanner` (`index.html:1692`, `:1856` en / `:2219` es): *"Free. Nothing you enter leaves your
phone — no account, no upload."* Unconditional, shown on every screen including Welcome and You (confirmed FG19).
`LifelinesStep`'s href builder (`:4157`) splices `data.zip` directly into an outbound URL:
`` `${c.href}${...}${L.zipParam}=${encodeURIComponent(data.zip)}` ``, rendered as a real anchor with
`target="_blank" rel="noopener noreferrer"` (`:4161`) — a browser navigation to `lawhelpny.org` or `lawhelp.org`
carrying the ZIP in the query string, sent over the network to a third-party server the instant the user taps it.
Every other field on the same screen (`name`, `ec`, `ecp`, `att`) either never transmits anywhere or only reaches
another party via a channel the user separately composes and sends themselves (e.g. an `sms:`/`tel:` link they
fill in and choose to send). This is the first field in the product's history where Amparo's own generated link
carries user-entered content off-device automatically, with no separate user-composition step.

**Impact.** Highest-trust-cost finding of the round because it directly touches the exact promise FG19 identified
as the product's most load-bearing trust copy, on the screen where it was recently made *more* prominent
(FG19 golden context: pilotBanner moved to Welcome and made unconditional across every step). ZIP codes are
low-specificity on their own, which limits real-world harm — but the banner makes no such qualification; it's a
blanket, unconditional claim, and Wes's read above shows a real, unprompted user catching the contradiction with
nothing more than watching the address bar.

**Cheapest fix that holds:** scope the claim rather than rewrite the banner: add one qualifying clause to
`i_zip_note` (already the field's dedicated disclosure string, `index.html:2078`) — e.g. "...also pre-fills the
search on Lifelines (this is the one field that leaves your phone when you tap that link)." No architecture
change; the note already exists and is already the field-specific disclosure surface.

### 3. This round's own verification claim, in both the commit body and the CHANGELOG, demonstrates the live result for NY only — SC and DC are asserted as supported, never shown to actually work

**Evidence.** `git show 60dc876` (commit body): *"threaded through to Lifelines via the new zipParam on the 3
states (NY, SC, DC) whose directory sites support a real location query param -- confirmed live against
lawhelpny.org before shipping... verified live in browser on both surfaces:
lawhelpny.org/find-legal-help?coverage_area=10001"* — SC and DC named in the same sentence as "confirmed live"
but the only concrete evidence cited (a real URL, a real result) is NY-specific. `CHANGELOG.md` v2.22.13 repeats
the same asymmetry verbatim: *"For the 3 state directories confirmed to support a real location query param (NY,
SC, DC — verified live against lawhelpny.org before shipping)... Verified live in browser on both surfaces:
selecting New York, entering a real ZIP (10001), and reaching Lifelines produces
lawhelpny.org/find-legal-help?coverage_area=10001 — confirmed in a real tab to return actual filtered results
('24 Organization(s) found')."* No equivalent sentence for `lawhelp.org/sc/find-legal-help?location=` or
`lawhelp.org/dc/find-legal-help?location=` appears anywhere in the commit, the CHANGELOG entry, or the research
notebook.

**Impact.** Recurring FG16-20 pattern ("claims outliving what they verify"), now inside this round's own ship
note rather than a prior round's code comment. Lower risk than golden #1/#2 because SC and DC share the same
LawHelp Network platform as the already-verified `BASE_LIFELINES` national finder (`lawhelp.org/find-help`,
researched in the 2026-08-16 feasibility doc), which raises the likelihood the param genuinely works — but
"likely, by platform inference" and "verified live" are different claims, and the CHANGELOG states the stronger
one for all three states equally.

**Cheapest fix that holds:** one more live check (SC or DC, either suffices to confirm the shared platform's
`location` param behaves the same way `coverage_area` does for NY) — or, if that's deferred, soften the CHANGELOG
line to name NY as directly verified and SC/DC as "same platform, same param convention, not independently
re-tested."

### 4. The in-field placeholder promises unconditionally what only 3 of 51 states deliver; the correct scope lives in a separate, unlinked note most users encounter after already reading the promise

**Evidence.** `i_zip_ph` (`index.html:2078`): *"Helps narrow the legal-aid directory to your area"* — no
qualification, rendered directly inside the input via the `placeholder` attribute (`:3469`, `/app`
`YouStep.tsx:76`), the first and most prominent text a user sees when they reach the field. The accurate scope —
*"For the states with a matching directory (NY, SC, DC so far)..."* — lives in `i_zip_note`, a separate `<p>`
below the input, visually smaller (`font-size:12px` in both root and `/app`), with no `aria-describedby` or other
programmatic link tying it to `f_zip` (confirmed: bare `<label>`+`<input>`+sibling `<p>` on both surfaces).

**Impact.** Directly the "does 'county' do real work" question this round's brief was built to ask: the field's
most-visible copy (the placeholder) doesn't distinguish the 3 states where it's true from the 48 where it isn't;
only the least-visible copy (a small note below) does. A user in one of the 48 states who reads only the
placeholder — plausible, since placeholders are designed to be glanced at, not read as prose — forms the same
unqualified expectation Marisol's literalism catches even in a state where the promise happens to hold.

**Cheapest fix that holds:** shorten `i_zip_ph` to something state-neutral that doesn't promise narrowing
("Optional — printed on your pack") and let `i_zip_note` carry the conditional claim alone, since it already
does so correctly — a copy-only change, no new logic.

### 5. Every concrete verification of the "or county" half of the field's own name and label tests a ZIP only — no county-name string has been shown to work anywhere the project has checked

**Evidence.** The field is labeled `i_zip: "Your ZIP or county (optional)"` and printed as `"ZIP / county"`
(`index.html:4469`, `PrintPack.tsx:236`) on both surfaces. Every verification cited — the commit body, the
CHANGELOG, this report's own re-derivation — uses `10001`, a five-digit ZIP, as the test value.
`lifeContact()`'s href builder (`:4157`/`LifelinesStep.tsx:134-136`) is agnostic to content — it
`encodeURIComponent`s whatever string is present, so a county name would technically pass through the same code
path without erroring — but whether `coverage_area=Dutchess+County` or `location=Dutchess+County` returns
anything useful on the receiving site has never been checked, live or otherwise, anywhere in this project's
history.

**Impact.** Lowest magnitude of the five — nothing breaks; the code doesn't discriminate on input shape, and nine
users in ten will likely type a ZIP regardless of what the label offers. Included because it's the cleanest,
most literal reading of the round's own naming choice: the field, the placeholder, and the printed pack all say
"or county" three separate times, and the "county" half of that promise has exactly zero verified instances
behind it, versus one for the "ZIP" half.

**Cheapest fix that holds:** none required to ship correctly today (the code already handles either input
shape); worth one live spot-check of a county-name string against lawhelpny.org's actual `coverage_area` handler
before the "or county" language is repeated a fourth time in some future surface.

---

## 3. What must change in the practice MODULES specifically

**Nothing — stated plainly, not invented.** `git show --stat 60dc876` touches exactly: `index.html`,
`app-src/src/screens/YouStep.tsx`, `app-src/src/screens/LifelinesStep.tsx`, `app-src/src/screens/youTypes.ts`
(the `YouInfo` type gaining a `zip` field), `app-src/src/content/statesResolved.ts`, `app-src/src/content/states.json`,
`app-src/src/components/PrintPack.tsx`, `t.en.json`/`t.es.json`. `PracticeStep.tsx`, `practiceEngine.ts`,
`DocsOverlay.tsx`, and `PackZoomOverlay.tsx` do not appear in the diff. No defect is reported *inside* any
practice module this round — the ZIP field's only downstream consumer is the Lifelines directory link and the
printed pack, neither of which is a practice-simulation surface.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG20

**BS-1. This round's research doc — the same one this feature cites as its lineage — explicitly considered and
rejected a "county" field on Amparo's own forms four versions ago. Was that reversal a deliberate, reconsidered
call, or did this round's implementation simply not cross-reference its own project's prior decision?** Verified:
`notebook/amparo-directory-feasibility-2026-08-16.md`'s own "What was deliberately not built" section (written for
v2.22.6, the same day) states: *"A 'county' input field on Amparo's own forms... adding a duplicate county field
to Amparo's own UI with nothing real behind it would be exactly the 'convincing stub' pattern this codebase's own
Welcome.tsx comment already warns against. Revisit only if a future feature needs Amparo itself to know the
user's county for something Amparo does directly."* This round's ZIP field arguably satisfies that exact
condition — it now feeds something real (three states' query params) — so the reversal may be entirely
justified. Nothing in the commit, the CHANGELOG, or the code comments references that this is a deliberate
revisit of an explicit prior "not built" call in the same research file, versus an independent decision that
happened to arrive at the same UI. Worth asking plainly: is checking a feature against the project's own prior
"deliberately not built" log part of the build step, or did this one just happen to land on the right side of it?

**BS-2. Given golden #4/#5 — the field promises more than it verifiably delivers for 48 of 51 states, and "county"
has zero verified instances — would a Rob-Hannes-style stranger (someone who found the app cold, via a link
shared once, with no context on which three states are enhanced) actually benefit from this field, or would they
type a ZIP, see a plain link exactly like before, and never know a better version exists for a few other states?**
Not a defect — a design question about whether the feature's value is legible to the exact persona who inspired
it, absent the small-print note being read.

**BS-3. Root sets `inputmode="text"` explicitly on `f_zip` (`index.html:3469`); `/app`'s equivalent
(`YouStep.tsx:75`) sets no `inputMode` at all, which defaults to the same behavior — both surfaces agree, and
both deliberately avoid a numeric keypad. Was that a considered choice because the field also accepts county
names (which a numeric-only keypad would block), or an oversight that happens to be harmless for most of the
94% of users who will type a five-digit ZIP?** Genuinely ambiguous from the diff alone — the code is consistent
across both surfaces, which argues for "considered," but nothing documents the reasoning the way other
input-mode choices in this file are commented (e.g. `f_ecp`'s `type="tel" inputMode="tel"`, an explicit numeric
choice for a field that's ZIP-only-shaped, never "or county").

**BS-4. The calibration log is still empty — sixth round asking, now with a second concrete instance of the same
real-user datum (Rob Hannes) driving a second consecutive feature.** Not counted as a new blind spot on its own
(FG19 BS-4 already raised this exact gap) — noted here only because this round is the first time the *same* real
user's message has now justified two separate shipped features (v2.22.12's shortcut and this round's ZIP field)
without either one becoming the first line in the log FG19 asked about.

---

## 5. Group read

**Would-evaluate-favorably verdict: 6 yes/conditional-yes (Marcus, Rosa, Luis, Dana, Marisol, Wes — Marisol and
Wes conditional on goldens #2-4) / 3 conditional with a real, specific objection (Ana, Omar, Nia) / 1 conditional
purely on the cross-feature interaction (Keisha).** Nobody found the ZIP mechanism itself broken — every trace
(the three-condition gate, the query-param splice, the printed-pack fallback) does exactly what its own commit
message claims, for the three states it claims to cover. The findings are almost entirely about *scope* and
*disclosure*: what the feature promises versus what it verifiably does (goldens #3-5), what it costs versus what
it discloses (golden #2), and — the round's single highest-magnitude finding — whether the feature is even
reachable by the users it was built for, given a fix shipped four commits earlier in the same session (golden
#1).

**Biggest objection by theme.** Two well-built, independently-correct features from the same session — a fast
path past You, and a field that lives on You — were never tested against each other. Same "new machinery, old
machinery, no cross-check" shape as FG19's Welcome-shortcut finding and FG20's QR-gap finding, now recurring a
third time as an interaction between two features instead of a gap within one.

**Highest-leverage fix, this round's subject specifically.** Golden #1 — reconcile the shortcut path with the
ZIP field, reusing the `i_skip_all` one-tap pattern already built for exactly this kind of optional-field bypass.
The fix that would make the round's own motivating user story (Rob Hannes) actually reachable via the path this
project's own prior round built for people in his situation.

**Highest-leverage fix, across the whole product regardless of surface.** Unchanged from FG16-20: `/app`'s
colour-only print confirmation (`PrintStep.tsx:119`, not touched this round, not re-verified — carried forward,
not re-ranked, since this round's diff didn't reach that file).

**Who this still isn't for.** Not evaluated this round — Tony, Ray, and Devin's standing conditions are untouched
by a ZIP-field addition to a screen none of their FG18/19 findings concerned. Marcus, Rosa, Dana, Luis carried
forward from FG19/20 verdicts on unrelated axes, re-tested only where this round's diff actually reaches them.

---

## 6. Signature

Agent A, `/amparo-loop`, standalone run. Ten personas from `.focus-group/members.md`: Keisha, Nia, Marisol, Wes,
Marcus, Ana, Omar, Rosa, Luis, Dana — chosen for this round's actual subject (a ZIP/county field on You, its
three-state directory payoff, and its interaction with the immediately-preceding Welcome-shortcut fix), with an
explicit note that only 3 of the panel's represented states (NY, via Marisol/Wes/Marcus) can exercise the
enhanced path directly.

All source citations are `index.html` and `app-src/src/**` at HEAD (`b8230a1`, v2.22.13) unless noted, verified by
direct grep/read/`git show`/`git log`, not assumed from commit messages. `CHANGELOG.md` and
`notebook/amparo-directory-feasibility-2026-08-16.md` quoted directly where their own claims are the subject of a
finding. No live browser session was used this round (source-only verification, consistent with FG19/20
precedent); no finding depends on unverified live behavior — where the project's own "verified live" claim itself
is the subject (golden #3), that is stated as a documentation-completeness finding, not a re-test. Attorney/lawyer
review excluded per instruction throughout, including as a blind spot.
