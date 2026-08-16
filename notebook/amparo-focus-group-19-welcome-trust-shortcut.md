# Amparo focus group 19 — the shortcut that doesn't shortcut (v2.22.4 → v2.22.5)

**Agent A of the `/amparo-loop`, run standalone.**
Build under test: `20f4a00`/`ed71378` (rebase pair, identical patch — see §0.1), tag
**v2.22.5**, `EDITION` unchanged. HEAD at read time is `f2dbe96` (CHANGELOG +
version-history only, no app code, not in scope). Verified by source read only —
`index.html` and `app-src/` at the tagged commit, plus `git show`/`git log` for
history and prior-state comparison. **No live browser or PostHog access this
round**: `posthog` and `github` MCP servers are unauthorized in this session, so
the "9 visitors / 3 reached State / 67% drop / You-step has zero further loss"
figures are reported as *the commit's own claim*, not independently re-derived
from PostHog. Everything about the shipped code — what it does, what it tracks,
what it says about itself — is verified directly against source.

**Excluded by instruction, not re-reported as new:** attorney/lawyer review in
any form (including whether "Just need a lawyer" is backed by an actual
attorney relationship — REVIEW.attorneys is empty, a pre-existing, tracked
condition, not evaluated here).

---

## 0. What is actually new this round, verified

### 0.1 One commit, seen twice

`git log` shows both `20f4a00` and `ed71378` with the identical message
`fix: surface trust reassurance + lawyer/hotline shortcut on Welcome`.
Confirmed by `git diff 20f4a00 ed71378 --stat`: the only difference is
`law-status.json` (16 lines, the same-day cron commit `3157c7f`, not app
code). `ed71378` is `20f4a00` rebased onto the cron commit — not a duplicate
bug, just history. Both are referred to as "this round's commit" below.

### 0.2 The two changes, confirmed against source

**Change 1 — `pilotBanner` now shows on Welcome.** Root: `index.html:3212`
changed from `_pilot.style.display=step===0?'none':'block'` to an
unconditional `'block'` — confirmed via `git show`. `/app`: `App.tsx:97`
adds `<div className="pilot">{t.pilotBanner}</div>` inside `Shell()`, above
`<main>`, so it renders for every route including `welcome` — confirmed by
reading the full file; there is no route-conditional anywhere in it.
Placement matches the claim ("before the ask"): on both surfaces the banner
sits directly under the header, above the stepper/`h1`, not next to the CTA.

**Change 2 — new link "Just need a lawyer or hotline number? →".** Present
in both content banks verbatim, English and Spanish, root and `/app`
(`index.html:1826,2187`; `t.en.json:19`; `t.es.json:19`). Rendered directly
under the primary CTA in both surfaces (`index.html:3281`;
`Welcome.tsx:51`).

### 0.3 What the report below adds

Both changes check out as described. What follows is what the commit message
and its own code comments claim *about* the new link and banner, tested
against what the code actually does when you trace it — not whether the
strings render, but whether the promised behavior is the behavior.

---

## 1. Ten persona reactions

Selected to span privacy/trust (Rosa, Luis, Marisol), the "I'm in a hurry,
I don't want the full flow" test this feature exists for (Keisha, Wes, Nia),
completionism (Dana), budget skepticism (Marcus), state-coverage doubt (Ana),
and accessibility (Omar) — the axes this round's subject (a Welcome-screen
trust fix + a claimed shortcut) actually touches.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, "something useful in her hand inside 30 seconds"

She is the persona this link was built for, by the commit's own words — "a
real stranger asked over Facebook Messenger" for exactly this. She taps it.
It calls the identical function the gold "Build my pack" button calls
(`goM(1)` / `onStart` → `navigate({name:'state'})` — same handler, confirmed
in both `index.html:3280-3281` and `Welcome.tsx:42,51`). She lands on the
state picker, same screen either button produces, still inside the same
5-node wizard stepper (`index.html:1676`, renders unconditionally). She still
has to pick a state, then hit "Skip" on the You screen (`YouStep.tsx:79`,
`i_skip_all`) before she ever sees a phone number. "It asked me a different
question and gave me the same homework. I don't have 30 seconds for the same
homework twice."

Redo? Conditional — the reassurance banner is real, the "shortcut" isn't one
for her specific need.

### 🧑 Nia, 41 — NY, PTSD, wants a non-simulated checklist route, escalation opt-in

Her FG18 ask stands: "a non-simulated checklist route... escalation opt-in."
This link's copy — "just need a lawyer or hotline number" — reads exactly
like the doorway she's been asking for. She taps it and gets routed through
the *same* pack-builder sequence (State → You → Lifelines) as someone
building the full rehearsal-plus-print flow — the practice/simulation steps
come later and she can stop before them, so nothing hostile reaches her, but
the on-ramp itself doesn't distinguish "I want the directory" from "I want
the whole product." "The words matched what I wanted. The screen didn't."

Redo? Still no for hostile content — unaffected here. Conditional yes on
this specific link, same as last round's checklist ask: closer in spirit,
not closed in mechanism.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, skips the wizard, hunts the pack

The panel's one member who already routes around the wizard on purpose. He'd
notice fastest that the tooling to do this honestly already exists in the
same file: `skipToPack()` (`index.html:4152-4155`) jumps straight from State
to Print, skipping You entirely, and fires its own tracked event
(`sr_state_fastpath`). "There's already a real fast lane two screens over.
This new button just points back into the regular line and calls it a fast
lane." He'd take the pilotBanner restore as a genuine, unrelated win — "that
part's just true now on the first screen instead of the third."

Redo? Yes on the banner. The link doesn't change his behavior either way —
he was never going to use the wizard path regardless of label.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything collecting data

The banner is her clearest win this round. *"Gratis. Nada de lo que escribes
sale de tu teléfono — sin cuenta, sin subir nada"* now greets her before she
commits to anything, not three screens deep — confirmed live-equivalent by
source: the Spanish string matches the English 1:1, and it's the first thing
under the header on Welcome now, both surfaces. She would not click the
lawyer/hotline link herself — she came for the pack — but if her son did, she
wouldn't catch the identical-destination issue; nothing on screen signals it.

Redo? Yes, clean win on the banner specifically.

### 🧑 Luis, 27 — TX, DACA, distrusts cloud/payment trails, prepaid data

Same read as Rosa on the banner's new position — "before the ask" lands for
him specifically, since the promise (nothing leaves the phone, no account)
is the exact thing he came in doubting. He would not personally test the
lawyer/hotline link (he wants the full pack), but he'd be the one to ask,
on principle, why a "lower-commitment doorway" (the code's own phrase,
`Welcome.tsx:47`) costs him a state pick and a document-capture screen with
a Skip button on it, same as the full-commitment path. "Lower commitment
should mean less asked of me, not the same thing with a shorter sentence in
front of it."

Redo? Yes on the banner, standing objections elsewhere unchanged.

### 🧑 Marisol, 29 — NY, green-card holder, reads what's actually promised, not what's implied

She'd apply the same literalism she brought to the share-sheet preview in
FG17/18. "The link says 'just need.' Then it takes me through what everyone
else goes through. If the app is going to promise something lighter, the
button should actually be lighter — the label makes a specific claim, the
same shape as the preview overstating Facebook last round, just on a
different screen." She'd also note, approvingly, that the fallback reasoning
(`resolveState(null)` → NY, verified in `statesResolved.ts:48-49`) is real
and sound — state selection genuinely can't be skipped without a correctness
cost. Her complaint is narrower than "skip state entirely": it's that
nothing *after* state selection was shortened either.

Redo? Yes on the honesty of the *reasoning* given in the code comment; no
change to her verdict on the *result* the user actually experiences.

### 🧑 Dana, 52 — TX suburb, the panel's completionist

She'd go straight for the analytics gap. The CHANGELOG (`CHANGELOG.md`, this
round's entry) explicitly credits the *previous* commit's
`sr_lifeline_link_clicked` tracking with letting "the next funnel pull show
whether people who reach the directory actually use it" — but says nothing
about tracking clicks on the new lawyer/hotline link itself, and source
confirms why: `ph('sr_step_viewed', ...)` fires on arrival at State
regardless of which of three buttons sent the user there (the gold CTA, this
new link, or the state-pill's own "change" button, `index.html:2996`, all
three call `goM(1)`). "You just wrote in your own changelog that you learned
the lesson about tracking clicks, on the same line as a change that didn't
apply it to itself."

Redo? Yes. Refer? Yes — same strongest-holding verdict as FG17/18, now with
a concrete new instance of the pattern she catches every round.

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

Marcus reads the banner the way it's meant to be read — clean, true, no
notes. He'd be mildly interested in the lawyer/hotline link out of curiosity
rather than need, tap it, and land on the state picker without registering
anything was off — he wasn't promised a different destination in his own
head, he just followed a link. "Didn't feel like a bait and switch to me,
felt like a second button that does the same thing. Not a big deal, just
kind of a shrug." The mildest reaction on the panel — a useful data point
that the defect is real but not universally felt as betrayal.

Redo? Yes, unchanged.

### 🧑 Ana, 31 — Phoenix, wants to know the app covers her state

Not the target of either change directly, but she'd notice the banner's
appearance now precedes any signal about state coverage — "free, private" is
established before "does this even cover Arizona" gets answered, which is
the right order for her too: reassurance first, capability second. She has
no reaction to the lawyer/hotline link — federal-only-state framing was
never her complaint, and this round didn't touch it.

Redo? Yes, unaffected either way — clean pass-through for her specific case.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader

Structurally the same experience as FG18's finding elsewhere on the product:
the new link has no `aria-label`/`aria-describedby` distinguishing it from
the primary CTA (confirmed — `Welcome.tsx:51` has no accessible-name
override, `index.html:3281` no `aria-label`). He'd tab to two full-text
buttons in a row promising different things, activate the second expecting
something different, and land exactly where the first would have put him,
with no programmatic signal either destination differs — the audio
equivalent of Keisha's and Marisol's complaints, arrived at with less
information than a sighted user gets from seeing both buttons stacked.

Redo? Yes for the banner (unambiguous win, confirmed present in the
accessibility tree via plain DOM order). Conditional on the link, same shape
as the rest of the panel.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The "lower-commitment doorway" is the same doorway — `w_lifelines_shortcut` and the primary CTA call the identical handler, and a real shortcut mechanism already exists unused in the same file

**Evidence.** Root: `index.html:3280` (`onclick="goM(1)"`, gold CTA) and
`:3281` (`onclick="goM(1)"`, new link) — byte-identical call. `/app`:
`Welcome.tsx:42` and `:51` both call `onStart`, which `App.tsx:118` binds to
`() => navigate({ name: 'state' })` — same handler, no branch. Downstream:
State → You (`YouStep.tsx`, a 6-field form plus a document-capture prompt,
one tap "Skip" away, `i_skip_all` at `:79`) → only then Lifelines. Contrast:
`skipToPack()` (`index.html:4152-4155`) already exists, already fires its
own event (`ph('sr_state_fastpath', ...)`), and already jumps directly from
State to Print — the exact "real fast lane" pattern this new link needed and
didn't use, one screen away in the same file.

**Impact.** The commit frames this as "a lower-commitment doorway into the
same first step" (`Welcome.tsx:44-50`) — true only in the sense that State
selection is unavoidable (the `resolveState(null)`→NY reasoning is correct,
verified at `statesResolved.ts:48-49`). Nothing shortens the path *after*
State. A user who clicks specifically because they want less than the full
flow gets exactly the full flow, identically labeled buttons notwithstanding.
Keisha and Nia — the two personas this feature is explicitly for — both hit
this.

**Cheapest fix that holds:** give the link its own handler that, after State
is picked, auto-advances straight to Lifelines the way `skipToPack()` already
advances straight to Print — same shape, one screen later, reusing a pattern
that's already built, tested, and instrumented in this file.

### 2. The fix that funnel data justified ships with no way to measure whether *it* — as opposed to the two buttons that already existed — is what moves the funnel

**Evidence.** `ph('sr_step_viewed',{step,name,...})` (`index.html:3220`) is
the only event that fires on arrival at State, and it fires identically
regardless of which of three affordances triggered `goM(1)`: the gold CTA,
the new link, or the state-pill's own "change" control (`:2996`). Grepping
`ph('sr_` for any call inside the new link's `onclick` returns nothing. This
round's own CHANGELOG entry contrasts itself against the *previous* commit's
`sr_lifeline_link_clicked`, crediting it with letting "the next funnel pull
show whether people who reach the directory actually use it" — a standard
this round's own new link doesn't meet for its own click.

**Impact.** The whole justification for this round was "real PostHog funnel
data... the biggest single loss in the whole product." The team now has no
way to close the loop on whether this specific link contributed anything —
if State-arrivals go up next pull, there's no way to attribute it to the new
link versus the pilotBanner's reassurance effect on the *existing* CTA, or
normal variance at n≈9-12 visitors. Same shape as FG16's "claims outliving
what they verify," here applied to the fix's own success metric rather than
a user-facing claim.

**Cheapest fix that holds:** one `ph('sr_lifelines_shortcut_clicked',{lang})`
call in the `onclick`, matching the existing `sr_state_fastpath` /
`sr_you_skipped` naming pattern already in this file.

### 3. `/app`'s new CSS comment documents a guard that doesn't exist in the code it sits next to, in the same commit that wrote both

**Evidence.** `shell.css:65-68` (added whole-cloth in this commit, confirmed
via `git log -p` — no prior version of this comment exists): *"pilot banner
— ported verbatim from index.html:76. Hidden on welcome (route.name ===
'welcome'), same as root hides it at step===0 (index.html:3212) — no
reassurance needed before there's anything to reassure about yet."* Reading
the full `App.tsx` (not just the diff) confirms: there is no `route.name`
check anywhere in the file; `.pilot` renders unconditionally in `Shell()`
for every route, welcome included — which is the correct, intended behavior,
matching what the commit set out to do. Both halves of the comment are also
now false about root: `index.html:3212` was rewritten in this same commit
from `step===0?'none':'block'` to unconditional `'block'` — so "same as root
hides it at step===0" describes root's *pre-fix* state, not its current one.

**Impact.** A comment authored in the same commit as the code it describes,
already wrong about both the file it's in and the file it cites, on the
Welcome screen that is this round's entire subject. A future maintainer who
trusts the comment (rather than re-deriving from the JSX, the way this
report had to) could "restore" the guard it describes and silently
reintroduce the exact 67%-drop condition this round shipped to fix.

**Cheapest fix that holds:** delete the two false clauses; keep only "ported
verbatim from index.html:76, shown on every step to match root."

### 4. The Welcome-screen stepper renders the same 5-node wizard chrome for both entry points — a user following the "low-commitment" link still lands inside a fully-numbered process shell

**Evidence.** `stepper()` (`index.html:2958-2978`) populates
`#stepper` (`:1676`) on every render where `stepChanged||langChanged`
(`:3221`), with no gating on which control initiated the step change — it
renders identically whether `goM(1)` was called from the gold CTA or the new
link. The breadcrumb shows all step labels, unfilled, on Welcome itself, and
becomes "1 of N, filled" on arrival at State either way.

**Impact.** Independent of golden #1's routing identity: even a user who
never inspects *where* the link goes still receives the same "you are now
inside a multi-step process" visual framing the full-pack path uses. Nothing
in the diff softens or removes wizard chrome for the doorway the commit
itself calls lower-commitment — the framing argument (Mobbin research on
trust-heavy apps, cited in the commit body) was applied to the reassurance
banner but not carried through to the stepper a "just need X" user
immediately sees next.

**Cheapest fix that holds:** none required if golden #1 ships (a real jump to
Lifelines would reasonably keep the stepper as orientation) — listed
separately because it's a distinct mechanism (visual framing, not routing)
and would still be worth revisiting even if #1 is fixed differently than
proposed.

### 5. Root's `w_lifelines_shortcut` and the state-pill's "change" control are now two structurally different affordances that produce the identical outcome, with nothing in the UI or the codebase's own naming conventions marking them as siblings

**Evidence.** Three separate call sites now reach `goM(1)`: the primary CTA
(`:3280`), the new link (`:3281`), and the state-pill "change" button
(`:2996`, pre-existing). All three are visually and semantically distinct
controls (a primary button, a low-emphasis text link, and a small pill
sitting in a completely different part of the UI on a later screen) that a
reader of the source would not obviously group together without tracing each
`onclick`.

**Impact.** Lowest magnitude here — nothing user-facing breaks, and this is
partly a byproduct of #1 rather than a fully separate defect. Included
because it's the same "does the codebase reflect that these things are the
same thing" gap golden #1 and #2 both hinge on: three buttons share a
destination and none of the three know about the other two, so a future
change to one (say, adding the fast-path fix from #1 to the new link only)
would silently create a *fourth* inconsistent state rather than closing the
gap. Worth a shared constant or comment cross-referencing all three call
sites, cheap insurance against exactly that.

---

## 3. What must change in the practice MODULES specifically

**Nothing — stated plainly, not invented.** This round's diff touched exactly
five source files: `App.tsx`, `Welcome.tsx`, `t.en.json`, `t.es.json`,
`shell.css` in `/app`, plus `index.html` at root. None of `StateStep.tsx`,
`YouStep.tsx`, `LifelinesStep.tsx`, `PrintStep.tsx`, `PracticeStep.tsx`,
`DocsOverlay.tsx`, or `practiceEngine.ts` were touched — confirmed by
`git show --stat` on the commit. No defect is reported *inside* any practice
module this round.

The one cross-cutting observation, not a module bug: golden #1's fix would
be built by wiring the new Welcome link into machinery that already lives
partly in `YouStep.tsx` (`i_skip_all`/`skipInfo()`'s "skip with one tap"
pattern) and partly in root's own `skipToPack()`. Nothing there needs to
change — the modules already provide the pieces; the Welcome screen just
doesn't call them.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG18

**BS-1. One commit before this round's, the project scaffolded Clerk auth
and Stripe payments — explicitly named as "a deliberate pivot from the 'no
accounts, no server, no database' design" — and this round's fix spent its
entire budget amplifying that exact promise on the highest-traffic screen in
the product. Has anyone written down what happens to `pilotBanner`'s text the
day any feature actually uses that plumbing?** Verified: commit `f0ced57`
("feat: scaffold Clerk auth, Convex database, Stripe payments infra"), one
commit before this round's, states in its own body: *"Deliberate pivot from
the 'no accounts, no server, no database' design... No feature yet uses any
of this — plumbing only, per explicit scope."* `api/create-checkout-session.ts`
exists, inert, unlinked from any UI — confirmed by the commit's own
description and file list. Today, `pilotBanner`'s claim is fully true — the
plumbing is genuinely inert. But this round's fix moved that exact claim from
"one line among several, three screens deep" to "the first thing every
visitor reads, confirmed by real funnel data to be disproportionately
load-bearing for conversion." The more effective the promise becomes at
building trust, the more expensive it becomes to walk back the day a paid
tier or an account-gated feature ships. Is there a tripwire — a comment, a
test, a checklist item — that fires when the Clerk/Convex/Stripe scaffolding
gains its first real caller, forcing a review of every trust-copy string that
currently asserts "no account, no upload, nothing leaves your phone"? Right
now nothing connects those two parts of the codebase at all, which is
correct for today and is exactly the kind of gap that stops being noticed
once it stops being new.

**BS-2. The project now has three independent code paths that reach the
same screen (`goM(1)`/`navigate({name:'state'})`) and zero shared
abstraction naming them as equivalent — is "does this button do what its
neighbor already does" a question anyone asks before adding a fourth?**
Raised concretely in golden #5. The pattern that produced golden #1 (a new
control wired to an existing handler without asking whether the existing
handler's *behavior*, not just its destination, matches the new control's
promise) has no check anywhere in this project's process — CI runs
`content-verify`/`storage`/`sw-routing`/`practice-engine` suites (per FG18),
none of which would catch "two buttons with different copy do the exact same
thing." Is that worth a lint-shaped check — e.g., a script that flags any
`onclick`/`onClick` handler shared by two or more visibly-distinct controls
on the same screen, for a human to confirm intentional vs. accidental?

**BS-3. The commit that shipped this round explicitly credits the previous
commit for learning to track a click it previously missed
(`sr_lifeline_link_clicked`) — and then, in the same breath, ships a new
click on the same screen without applying that lesson to itself. Is
"we just fixed a tracking gap" being read as "the project now tracks
gaps," rather than "this one instance of a gap is fixed"?** This is FG18's
BS-3 pattern (a fix's own fix contains one more layer of the same shape)
recurring a third round running, now inside a commit message that names the
lesson explicitly and doesn't apply it two paragraphs later. Worth asking
plainly: does anyone re-read a commit message against its own diff before
tagging, the way this report just did?

**BS-4. The calibration log is still empty — fifth round asking.**
Unchanged: `.focus-group/members.md`'s last line is still `Calibration log:
(add real-user feedback here as it arrives)`. This round's Facebook
Messenger stranger — cited directly in the commit message as the reason for
the lawyer/hotline link — is the closest this project has come to real
calibration data landing anywhere. It arrived, got acted on for one round,
and nothing suggests it was written down anywhere durable. Is there a reason
that one real conversation didn't become the first line in that log?

---

## 5. Group read

**Would-evaluate-favorably verdict: 7 yes/conditional-yes (Rosa, Luis,
Marisol, Dana, Marcus, Ana, Omar) / 2 conditional with a real, specific
objection (Keisha, Nia) / 1 neutral-shrug, correctly the mildest reaction on
the panel (Wes, whose own habits route around the defect entirely).** The
pilotBanner restore is an unqualified win across the panel — nobody found a
problem with it, live or in source. The new link is where the round splits:
everyone who'd actually use it as advertised (Keisha, Nia) found the same
defect independently; everyone who wouldn't have needed it anyway (Rosa,
Luis, Marcus, Ana) is unaffected or only theoretically bothered.

**Biggest objection by theme.** A fix aimed at the single biggest loss point
in the product shipped two changes of very different rigor: the banner
restore is a straightforward, low-risk copy/CSS change that does exactly
what it says. The "shortcut" link is a new promise (less commitment) riding
on old machinery (the full-commitment handler) — the same "claim outliving
what it verifies" shape FG16 first named, now appearing in a brand-new
feature on its first day rather than in a fix for a prior one.

**Highest-leverage fix, this round's subject specifically.** Golden #1 — give
the link real fast-path behavior using the pattern (`skipToPack()`) that
already exists in the same file. It is the difference between "the funnel
data drove a cosmetic change" and "the funnel data drove a structural one,"
and the fix is a reuse, not new design.

**Highest-leverage fix, across the whole product regardless of surface.**
Unchanged from FG16/17/18: `/app`'s colour-only print confirmation
(`PrintStep.tsx:30,115,119`, not touched this round, not re-verified this
round — carried forward, not re-ranked, since this round's diff didn't reach
that file).

**Who this still isn't for.** Not evaluated this round — Tony, Ray, and
Devin's standing conditions are untouched by a Welcome-screen copy/routing
change and weren't re-tested; carrying their FG18 verdicts forward rather
than re-asserting them without evidence.

---

## 6. Signature

Agent A, `/amparo-loop`, standalone run. Ten personas from
`.focus-group/members.md`: Keisha, Nia, Wes, Rosa, Luis, Marisol, Dana,
Marcus, Ana, Omar — chosen for this round's specific subject (Welcome-screen
trust copy + a claimed low-commitment shortcut), not the full FG17/18 panel.

All source citations are `index.html` and `app-src/src/**` at `20f4a00`/
`ed71378` (v2.22.5) unless noted, verified by direct grep/read, not assumed
from commit messages. PostHog funnel figures and the "You step has zero
further loss" claim are reported as the commit's own stated basis — not
independently re-derived; `posthog` MCP was unauthorized this session.
Attorney/lawyer review excluded per instruction throughout, including as a
blind spot.
