# Wargame 02 — Consensus prioritized roadmap (post-v2.5.0)

Date: 2026-08-02. Supersedes the roadmap section of
`wargames/01-panel-and-roadmap.md` — that panel ran before the friend's direct
answers, before the UX audit, and before v2.5.0 shipped. Its analysis stands;
its ordering does not.

**Inputs:** `amparo-user-transcript.md`, `amparo-friend-answers-followup.md`,
`amparo-focus-group.md`, `amparo-ux-audit-2026-08-02.md`,
`amparo-session-log.md`, `amparo-version-history.md`, and direct inspection of
`index.html` / `sw.js` at commit `a60717f`.

**Constraint respected throughout:** no statute text or citation is generated
here; no item requires user data to leave the device; no item claims a
verification that has not happened.

---

## Recon performed for this document (verify-before-asserting)

Three claims were checked in source before being ranked. Two collapsed. Recording
them because a roadmap that ranks already-fixed problems is worse than a short
one.

| Claim considered | Finding | Effect on ranking |
|---|---|---|
| "Spanish-first users bounce because the page loads in English" (Rosa, focus group) | **Already fixed.** `restore()` at index.html:2689 sets `lang='es'` on first visit when `navigator.language` starts with `es`, and flips the pills and banner. | **Dropped.** Would have been ranked top-3 on persona evidence alone. |
| "Voice practice sends audio off-device, contradicting the privacy promise" | **Half true, already disclosed.** `webkitSpeechRecognition` is used (index.html:3471, 3549), and browser speech services are commonly server-side. But `prx_rec_note_sr` (index.html:1391, and :1666 in Spanish) already discloses it: transcription "may leave your device — optional; Amparo stores nothing." | **Downgraded** from violation to claim-altitude mismatch. Item 7. |
| "'Offline-capable' may be overstated" | **Defensible.** `sw.js` precaches the shell (`./` — the entire single-file app) plus manifest and icons, network-first for the page with cache fallback. Sound design. | **Dropped** as a headline item; one narrow residual logged as item 20. |
| `sr_step_viewed` exists | **Confirmed absent** — zero occurrences in index.html. 30 `sr_*` events exist; none records a step being *seen*. | Item 1. |

---

## PART 1 — The panel, and where it actually split

Seats are roles, not named individuals. No quotes are attributed to real people;
the only verbatim quotes in this document are from the project's own transcripts.

### Seat provenance — continuity with wargame 01

This panel is the **union** of the roster defined in
`wargames/01-panel-and-roadmap.md` PART 1 and the seats named for this session.
No seat from the prior panel was dropped.

| Seat | Origin | Group in wargame 01 |
|---|---|---|
| UPL / regulatory attorney | **Both** (carried + re-named) | Blocking |
| Per-state licensed attorney | **Wargame 01** | Blocking |
| Immigration attorney | **Wargame 01** | Blocking |
| Legal-aid / public defender | **Wargame 01** | Blocking |
| Instructional designer / learning scientist | **Both** (= "learning-science / recall-under-stress") | Unnamed-roles |
| Stress-inoculation psychologist | **Wargame 01** | Unnamed-roles |
| Certified ES transcreation specialist | **Wargame 01** | Unnamed-roles |
| Encounter / combat designer | **Wargame 01** | Game roles |
| Level designer | **Wargame 01** | Game roles |
| Systems designer | **Wargame 01** | Game roles |
| Game master / scenario designer | **Wargame 01** | Game roles |
| Tutorial / onboarding designer | **Wargame 01** | Game roles |
| Playtest lead | **Wargame 01** | Game roles |
| Economy designer | **Wargame 01** | Game roles |
| Game accessibility specialist | **Wargame 01** | Game roles |
| Mobile UX | **New this session** | — |
| Privacy / security | **New this session** | — |
| PWA / offline engineering | **New this session** | — |
| Print / web accessibility | **New this session** | — |
| Civil-rights / know-your-rights org | **New this session** | — |
| Growth skeptic | **New this session — reverses an explicit wargame 01 exclusion** | *Deliberately excluded* |

**The one deliberate deviation.** Wargame 01 excluded three seats by name:
growth / performance marketer, backend / DB architect, VR / 3D designer. Two of
those exclusions stand and are reaffirmed below. The growth exclusion is
**reversed**, on its own stated grounds: it was excluded because acquisition
advice would "optimise a leaking bucket at 66 visitors." v2.5.0 patched the leak.
The condition that justified the exclusion no longer holds, so the seat is
seated — as a skeptic, not a marketer.

**Reaffirmed exclusions:** backend / DB architect (the on-device promise is the
moat; anyone whose instinct is a server is a liability) and VR / 3D designer
(right instinct, wrong decade, prepaid-Android audience). Unchanged from
wargame 01.

**Net effect on this document:** unioning the rosters added **six ranked items**
that the session-named seats alone did not surface — items 3, 5, 8, 12, 18 and 19
below — and materially sharpened item 14. The prior panel earned its keep.

### Seats named this session

**Mobile UX.** The 94.5% drop is the only number that matters, and v2.5.0 may
already have fixed a large part of it. Shipping anything else on top of an
unmeasured fix destroys the read. Measure first, then move.

**Growth skeptic.** Sharpest objection in the room: *at 72 visitors a month,
nothing on this list is measurable.* Detecting a 5.5% → 15% conversion change at
conventional confidence needs low-hundreds of visitors per arm. At current
traffic that is a multi-month wait per decision. Every "ship it and measure"
plan in this project is quietly assuming traffic it does not have.

**Learning science / recall under stress.** Spaced repetition is the single
biggest unexploited lever and remains unbuilt. One rehearsal decays in days. But
concedes: retention mechanics on a base of four monthly converters optimise
nothing. This is a *later* lever, not a *dead* one.

**Privacy / security.** The on-device promise is intact and better implemented
than the docs suggest — typed and spoken content never transmits, analytics carry
only level/beat/boolean/lang/state. One defect: the headline banner makes an
unqualified claim that a feature-level note then qualifies. Two truths at
different altitudes is how trust products acquire their first lie.

**PWA / offline engineering.** Service worker is correct. Real remaining gap is
downstream: the pack terminates in a printer, and the install/offline story is
strongest for exactly the users least likely to own one.

**Civil-rights / know-your-rights org.** Reframes the whole trust problem. Dana
wants an attorney's name; Tony wants the NAACP chapter or his church. **An
organizational endorsement is one to two orders of magnitude cheaper than 47
attorney reviews and, for the actual audience, carries more weight.** Nobody has
priced that path. Also: Rosa waits for someone at church to vouch — the
distribution channel and the trust signal are the same object.

**Print / accessibility.** Marcus is a no on the pack because he has no printer.
Ana is a no for a different reason. The funnel's terminal step excludes a large
share of the target audience by hardware. AirPrint was specifically asked for by
the one real user.

**UPL legal seat.** Holds a veto, not a vote. Four of six legacy roadmap items
build on the scored engine. Inverting the funnel does not merely reorder the
product — it promotes the exposed component to the front door of every visit.
Whatever else happens, the opinion should already be in motion, because it is the
only item measured in weeks rather than hours.

### Seats carried from wargame 01

Listed by what each caught that no session-named seat did. A seat that only
duplicated an existing catch is recorded as duplicate and adds nothing — that is
a finding, not a gap.

**Immigration attorney (blocking).** The loudest catch in the room, and the
session-named panel missed it entirely. **Level 6 — the immigration checkpoint
scenario — is live, is the highest-consequence content in the product, and has
never been reviewed by anyone.** Its material also ships inside the printed pack,
which means it is **not** shielded by the UPL gate: even if the scored engine is
removed tomorrow, that content stays in front of users. Rosa, Luis and Ana — half
the focus-group roster — are the exact readers. → **new item 3.**

**Playtest lead.** Second-loudest, and it dissolves the panel's worst structural
problem. Every conclusion in this corpus rests on n=1 (the friend) or n=6
(simulated personas). The growth skeptic's objection — that 72 visitors/month
cannot validate anything — is answered not by more traffic but by **structured
qualitative observation of five real people**, which is faster, cheaper, and
higher-resolution than waiting a quarter for a significance test. Wargame 01 said
it plainly: "Your user WAS this, unpaid, once." → **new item 5.**

**Certified ES transcreation specialist.** The product is bilingual and no native
professional has ever assessed the Spanish. The failure mode is silent by
construction: "machine-adjacent Spanish fails silently — no bug report, users
just leave." Confirmed this session that Spanish *delivery* works (auto-detect at
index.html:2689) — which is precisely what makes the *quality* gap invisible.
Whether "consent," "detained," and "reasonable suspicion" carry equivalent weight
for a Dominican vs Mexican vs Salvadoran reader is unknown and currently
unknowable from analytics. → **new item 8.**

**Tutorial / onboarding designer.** Reframes the headline number: the drop before
the state picker "is a **tutorial failure**, the most studied problem in games."
There is no first-run orientation of any kind — a cold visitor is dropped
straight into a wizard with no statement of what the thing is or how long it
takes. Distinct from the mobile-UX seat's fix, which improved the picker itself
but not the absence of any preamble. → **new item 12.**

**Stress-inoculation psychologist.** Sharpens rather than adds. The session panel
scoped the trauma concern to the *score*. This seat scopes it to the *design*:
whether escalating hostility inoculates or **sensitises**, since "the same
literature that justifies rehearsal also documents making anxiety worse with
badly-paced exposure." Level 5 is deliberately unwinnable. For the friend that
was the best moment in the product; for a genuinely traumatised user it may be
the worst. → **merged into item 14, which was a copy task and is now a design
question.**

**Per-state licensed attorney (blocking).** Catches an omission: the session
panel ranked an organizational endorsement (item 4) as the cheap trust path and
then never ranked the expensive one at all. Per-state review is still the only
thing that can make a cited statute *correct*, as opposed to *credible*. It
belongs on the list, low and gated. → **new item 18.**

**Legal-aid / public defender (blocking).** Partial duplicate. Its unique catch —
"what actually happens after the stop: bail, arraignment, what signing binds you
to" — is a product-scope question the panel declines to open now (the product
deliberately ends at the stop). Its second contribution is real and already
banked: legal aid *is* the endorsing organization in item 4, so this seat and the
civil-rights seat converge. → **folded into item 4; scope question logged as
BS-E.**

**Systems designer / game master / scenario designer.** Duplicates. Their catches
— what the score asserts, and improvised rewording so answers can't be memorised
— are already items 14 and 15, both raised independently by the transcript.
Recorded as confirmation, not as new work.

**Level designer.** Mostly resolved since wargame 01. Its concern was that Hard
Mode's meaning "depends on gating that is currently soft." Verified this session
that gating exists — `PRX_LEVELS` is a fixed six-level sequence and v2.0.0 shipped
locked-not-hidden levels. Residual: nobody has checked whether the gate is
*sufficient*, only that it exists. → **folded into item 19.**

**Encounter / combat designer, economy designer, game accessibility specialist.**
Low-value at present, for three different reasons. Encounter design is craft
polish on a component that may not survive the UPL opinion. Economy design has
nothing to price — the pricing fork resolved to "free pending UPL," and there is
still no payment integration in the codebase. Game accessibility's headline
concerns are partly pre-empted: the engine already has no fail state, and result
feedback carries text rather than colour alone. → **batched into item 19.**

### Where they argued

**Argument 1 — measurement vs. traffic. (Mobile UX vs. Growth skeptic.)**
UX wants instrumentation so v2.5.0 can be read. Growth says instrumentation on
72 visitors/month produces a number nobody can act on for a quarter.
*Resolution:* both, in that order, and stop pretending otherwise. Instrumentation
is hours of work and permanently useful; it is cheap enough that the traffic
argument does not defeat it. But the panel adopts Growth's larger point as a
standing correction: **wargame 01 excluded a growth marketer on "don't optimise a
leaking bucket" grounds. The bucket was patched in v2.5.0. That exclusion has
expired.** Distribution is now a ranked item, not a deferred one.

**Argument 2 — does the doc-capture step come back? (Print/a11y + UX vs. Growth skeptic.)**
The friend explicitly wants it and needs a private moment. Growth's objection is
brutal and correct: **that is n=1, from a man who does not drive, about a feature
whose removal has never been measured.** Nobody has checked whether removing it
in v2.1.0 helped or hurt.
*Resolution:* the rebuild is real work (493 lines and 32 functions were deleted)
and it is being justified by one interview. It ranks mid, behind the cheap
things, and it ranks explicitly as skippable-and-resumable — never as a restore.

**Argument 3 — invert the funnel, or not? (Everyone vs. the legal seat.)**
Wargame 01 ranked this Move 2. The legal seat blocks it: promoting the scored
engine from "buried behind a wizard" to "the first thing every visitor touches"
materially expands the exposed surface before anyone has ruled on it. The
red-team pass in wargame 01 independently landed a second hit — it optimises for
the engagement of a man who will never be stopped.
*Resolution:* two independent gates, both must clear. It drops from #2 to #9.

**Argument 4 — attorney name, or organizational endorsement? (Civil-rights vs. the field.)**
Dana: one licensed Texas attorney's name flips her from user to evangelist. Tony:
the NAACP chapter or his church. Rosa: someone at church vouching. Two of three
trust signals cost nothing but outreach.
*Resolution:* the panel treats these as **separate items with different prices**
and ranks the cheap one higher. This is the clearest thing the panel surfaced
that no prior document ranked.

---

## PART 2 — THE CONSENSUS RANKED LIST

One list, highest value first. Effort: **S** ≈ hours, **M** ≈ 1–3 days,
**L** ≈ a week or more. "UPL gate" means: do not start until the opinion is in.

---

### 1. Instrument the funnel — `sr_step_viewed` + a feedback path for non-converters ✅ SHIPPED 2026-08-02
**Status.** Built and verified in-browser this session. `sr_step_viewed` fires on
every step render with a stable English slug (`welcome/state/you/lifelines/print`),
deduped so same-step re-renders and language toggles do not double-count, and
fired from `render()` rather than `go()` so a restored or deep-linked first paint
still counts. Verified: correct slug per step, no duplicate on re-render, hidden
on step 0, both languages.

**Feedback component — the other half, and the reason it belongs here.** The
product already had usage feedback, but it only appears for a **returning user who
already printed** — roughly the 5% who convert. **The 95% who leave had no way to
say why.** Added a quiet stuck-strip on every wizard step: a low-weight link that
opens four fixed reasons (`find` / `why` / `trust` / `looking`) plus the existing
`feedbackMailto()`. Only the reason slug is ever transmitted; free text goes
through the user's own mail client. New events: `sr_stuck_opened`,
`sr_stuck_feedback`. Deliberately low visual weight so it does not worsen item 10.

**Why this pairing matters.** `sr_step_viewed` tells you *where* people leave;
the strip is the only mechanism that can tell you *why* — and with autocapture
permanently off for privacy, it is the sole substitute for rage-click data.
Focus group 02 makes the case concrete: three of twelve members leave at step 0
on trust, which the funnel previously could not distinguish from a step-1 bounce.

**Remaining under this item.** CTA impression events not yet added.

---

### 1b. Original framing (kept for the record)
**What.** Fire a lightweight event when each wizard step is *rendered*, carrying
the step name and nothing else. Same for the practice CTA being on screen.
**Why.** Confirmed absent — zero occurrences in `index.html`, against 30 existing
`sr_*` events, all of which record actions. The UX audit named this precisely:
you cannot currently distinguish "60 people saw the picker and 56 left" from
"only 6 ever scrolled far enough to render it." **v2.5.0's entire state-picker
fix is presently unfalsifiable.** Also settles the friend's "I saw a lot of
buttons... I just might not have clicked" — impression-vs-click is exactly the
missing measurement.
**Effort.** S.
**Gate.** None. No user content, no new data class, privacy promise untouched.
**Dependency.** Blocks items 13 and 15 from being judgeable.

---

### 2. Get the UPL opinion moving
**What.** Send `notebook/amparo-upl-engagement-memo.md` to 3–5 regulatory/UPL
attorneys. Retain one.
**Why.** Only item on this list measured in weeks. Gates items 13, 14, 15, 16 —
four of the twenty substantive items. *Upsolve v. James* reaches New York, one of
three cited states. Building four features on a component that may have to be
removed is the most expensive mistake still available.
**Effort.** S to send, then calendar time. ~$1–2K.
**Gate.** None. Start today; it runs in parallel with everything below.

---

### 3. Immigration-attorney review of the live checkpoint level *(wargame 01 seat)*
**What.** Retain an immigration attorney to review level 6 — the checkpoint
rehearsal scenario — and the checkpoint section that ships inside the printed
pack. Review only; no new content authored.
**Why.** Wargame 01 listed this seat as **blocking** and it has never been
actioned. The level shipped in v2.0.0 and is the highest-consequence content in
the product: it names a federal felony exposure for leaving a checkpoint and
tells users what to do when asked about place of birth. It has been live for
weeks with **zero review by anyone**. Half the focus-group roster — Rosa
(mixed-status family), Luis (DACA), Ana (mixed-status household, drives I-10
weekly) — are precisely these readers. Rule 1 of this project exists for exactly
this content.
**Why it is not UPL-gated.** The checkpoint material ships in the printed pack as
well as the practice engine. Even if the UPL opinion forces removal of the scored
engine, this content stays in front of users. It needs review either way.
**Effort.** S to commission; cost likely comparable to the UPL engagement.
**Gate.** None. Runs in parallel with item 2 — different specialist, different
question. Do not display any reviewer's name until sign-off exists in writing,
and bump EDITION if any wording changes.

---

### 4. Pursue one organizational endorsement
**What.** Approach local legal-aid orgs, NAACP chapters, immigrant-rights
groups, and churches for a named endorsement and a distribution channel. Not an
attorney sign-off — an organization willing to say "we looked at this, we hand it
out."
**Why.** Three of six focus-group personas independently name this as the thing
that flips them: Tony ("would hand it to grandsons if the NAACP chapter or his
church put their name on it"), Rosa ("waits for someone at church to vouch";
looks for "a logo she recognises — parish, legal-aid group, consulate"), and Dana
by analogy. **It is one to two orders of magnitude cheaper than the $19–38K of
per-state attorney review, and for this audience it is better evidence.** It also
solves item 6 simultaneously — the endorsing org *is* the distribution channel.
Ranked above every code item because no code change moves Rosa or Tony.
**Effort.** M — outreach, not engineering.
**Gate.** None. Do not claim any endorsement until it exists in writing (rule 3).

---

### 5. Structured playtesting — five real users, observed *(wargame 01 seat)*
**What.** Recruit five people, watch each use the product cold without help, take
notes against a fixed observation script. No survey, no interview afterward until
the session is done.
**Why.** This is the panel's answer to its own worst structural problem. Every
conclusion in this corpus rests on **n=1** (the friend, who does not drive) or
**n=6 simulated personas**. The growth skeptic's objection — 72 visitors/month
cannot validate anything — is real, and the resolution is not more traffic but
better-resolution evidence. Five observed sessions produce more usable signal in
a week than the analytics funnel will produce in a quarter, and they capture
exactly what autocapture-off makes permanently invisible: **what people click and
try before they leave.** Wargame 01 named this seat and noted the gap precisely:
"Your user WAS this, unpaid, once."
**It also de-risks four other items.** Items 13 (invert), 17 (doc capture), 12
(first-run) and 10 (CTA weight) are all currently justified by one interview.
Five sessions either confirm or kill them before any code is written.
**Effort.** M — recruitment is the cost, not the observation.
**Gate.** None. Do not record or transmit anything from sessions; observe and
take notes. The on-device promise applies to playtesting too.

---

### 6. Decide the distribution question, explicitly
**What.** Name the intended traffic source and commit, or explicitly accept that
Amparo stays a slow-burn artifact. Write the decision down.
**Why.** 72 landings / 30 days makes every A/B judgement on this list a
multi-month wait. Wargame 01 excluded a growth marketer because the bucket was
leaking; **v2.5.0 patched the leak, so that exclusion has expired, and nobody has
revisited it.** This is a fork the project has never consciously made — it has
been defaulted into. The honest options are (a) endorsement-driven distribution
via item 4, (b) deliberate community seeding, or (c) accept the pace and stop
gating decisions on measurements that will not arrive.
**Effort.** S to decide, unbounded to execute.
**Gate.** None. Interlocks with item 4.

---

### 7. Reconcile the headline privacy claim with the voice-transcription exception
**What.** Amend the global banner — "Nothing you enter leaves your phone" — so it
survives contact with the one disclosed exception, or scope the claim to typed
and stored data. The feature-level note (`prx_rec_note_sr`) is already honest;
the headline is not qualified.
**Why.** The banner is unqualified in both languages (index.html:1287, 1529).
The mic note correctly discloses that the browser's speech service "may leave
your device." Both are true at different altitudes — but this product's own
recorded lesson is that *"a check that breaks quietly while still making its
claim is worse than one that fails loudly."* An adversarial reader finds the
exception and the whole promise is suspect. Cheapest trust-preserving fix on the
list.
**Effort.** S — copy, both languages.
**Gate.** None. Content-only, no legal content, **no EDITION bump** (not legal
guidance).

---

### 8. Spanish transcreation audit by a native professional *(wargame 01 seat)*
**What.** Have a certified ES transcreation specialist review the Spanish across
the app and the printed pack — not for grammar, but for whether the legal weight
survives. Regional register included.
**Why.** The product is fully bilingual and **no native professional has ever
assessed the Spanish.** Wargame 01 named the failure mode and it is the reason
this ranks above most engineering: "machine-adjacent Spanish fails silently — no
bug report, users just leave." Confirmed this session that Spanish *delivery*
works — `restore()` auto-selects Spanish for Spanish-dominant browsers — which is
exactly what makes a *quality* problem undetectable: those users arrive in
Spanish, bounce in Spanish, and register as ordinary drop-off. Whether
"consent," "detained," and "reasonable suspicion" carry equivalent weight for a
Dominican, Mexican, or Salvadoran reader is currently unknown and cannot be
learned from analytics.
**Effort.** M — outside specialist, finite corpus.
**Gate.** None to audit. **Any wording change to legal content bumps EDITION**
and drops attorney badges. Findings that touch legal meaning route to counsel,
not to a translator's discretion.

---

### 9. Make the pack survive a phone with no printer — including AirPrint
**What.** Promote save-to-phone to equal billing with print. Verify the AirPrint
path on real iOS. Verify a retrievable artifact on real Android.
**Why.** The strongest multi-source finding in the corpus. Marcus: "**No** to the
pack — no printer, would never print." Ana is a second no. The friend: "download
worked but I wanted to see if I could just air-print the doc, I just never had
the opportunity" — the print pathway is **unverified, not broken**. The focus
group's own summary flags this as still open. The funnel currently terminates in
hardware a large share of the target audience does not own.
**Effort.** M.
**Gate.** None — this is the reference pack (Half A), not the scored engine.

---

### 10. Reduce visual competition around the primary CTA
**What.** Establish one primary action per screen. Demote the rest to secondary
weight.
**Why.** Direct quote, previously under-weighted: "I saw a lot of buttons, while
being busy and distracted, I just might not have clicked." The follow-up document
correctly separates this from funnel *order* — "too many buttons of similar
visual weight is its own failure mode, independent of ordering," and "neither
substitutes for the other." Cheap, and it makes item 13 legible if that ever
clears its gates.
**Effort.** S–M.
**Gate.** None. Pairs with item 1's CTA-impression event.

---

### 11. Lead with the honesty that is currently buried
**What.** Surface the doc-overlay framing — naming Philando Castile and Daunte
Wright, placing blame on the system rather than the individual — above the fold
instead of behind a small bottom link.
**Why.** Tony's conversion condition, verbatim from the focus group: it is "the
first thing that reads as written by someone who knows," and "that honesty is
buried behind a small link at the bottom." Marcus independently names Hard Mode's
framing as "the first thing on a rights site that felt honest instead of
preachy." **The product's most persuasive asset is its least visible one.** This
also front-loads the exact quality that makes an endorsing org (item 4) willing
to attach its name.
**Effort.** S–M. Layout and copy placement; no new legal content.
**Gate.** None, provided existing reviewed copy is moved rather than rewritten.
If wording changes, bump EDITION.

---

### 12. First-run orientation — the missing tutorial *(wargame 01 seat)*
**What.** A short, skippable first-run panel before the wizard: what this is, how
long it takes, what it costs (nothing), and where the data goes (nowhere).
**Why.** The tutorial/onboarding seat reframes the headline number: the drop
before the state picker "is a **tutorial failure**, the most studied problem in
games." There is currently no orientation of any kind — a cold visitor is dropped
directly into step 1. The mobile-UX seat's v2.5.0 fix improved the picker itself
but did not address the absence of any preamble, and these are different failures:
one is "I can't find my state," the other is "I don't know what this is yet."
Also carries item 7's honest privacy line to the first screen, where Luis needs
it, instead of a banner he may scroll past.
**Effort.** S–M.
**Gate.** None. Judgeable only once item 1 exists.

---

### 13. Invert the funnel — practice playable from the landing screen
**What.** Make a scenario playable cold, with the pack as the reward.
**Why.** Real evidence: "I skip all of that... then at the end it was like,
here's some scenarios, and that's when I was like, I'm interested now." Marcus
wants exactly this. Verified in wargame 01 that the engine runs with
`data.state = null`, so it is routing, not a refactor.
**Why it dropped from #2 to #9.** Two independent gates. **(a) UPL:** this
promotes the scored engine — the specifically exposed component — to the front
door of every visit. **(b) Measurement:** wargame 01's own red-team pass requires
judging it on `sr_state_selected` conversion for cold mobile arrivals over ≥30
visitors, which needs item 1 to exist and item 6 to supply traffic. Shipping it
now also contaminates the unmeasured v2.5.0 read.
**Effort.** M.
**Gate.** **UPL gate.** Plus items 1 and 6.

---

### 14. Rewrite score copy so it never tells a person they failed at surviving
**What.** Keep the number; change what it asserts. Verify every result string.
**Why.** Blind spot BS-4, raised by no external panel: the audience includes
people genuinely traumatised by a stop, and "4/6" reads differently to them than
to a competitive friend. Partially mitigated already — the engine has no fail
state by design and the retry copy is encouraging — so this is smaller than
wargame 01 implied, but the aggregate score screen is unaudited.
**Sharpened by the stress-inoculation seat *(wargame 01)*.** The session panel
scoped this to the *score*. That is too narrow. The open question is whether
escalating hostility **inoculates or sensitises** — "the same literature that
justifies rehearsal also documents making anxiety worse with badly-paced
exposure." Level 5 is deliberately unwinnable. For the friend that was the best
moment in the product ("you did everything right… that made it real"); for a user
genuinely traumatised by a stop it may be the worst. **This is now a design
question with a copy component, not a copy task.** It cannot be answered from
this chair — it needs either the specialist seat or item 5's observed sessions.
**Effort.** S for the copy pass; M if the pacing question opens.
**Gate.** **UPL gate** — practice-engine surface. Note: the memo's question 3
asks specifically whether displaying a score changes the analysis, so the
opinion may dictate this item's shape.

---

### 15. Surface the replayability that already exists
**What.** Tell users the questions change. Add a shuffle entry point.
**Why.** The friend asked for exactly this feature, unaware it was already built:
"he asked you this, but it's kind of worded differently, so it makes you think."
`PRX_VAR` holds ~45 authored officer-line variants and `PRX_CURVE` ~10
curveballs, confirmed in source. **The product is already doing the thing its one
real user requested and is not telling anyone.** Pure marginal value.
**Effort.** S.
**Gate.** **UPL gate** — practice-engine surface.

---

### 16. Spaced repetition — local reminder only
**What.** Downloadable `.ics` at +3 days and +2 weeks firing a 3-question
retrieval check. Reuse the existing reprint-reminder ICS path
(`sr_reminder_downloaded` exists, so the mechanism is present).
**Why.** The product's premise is recall under stress and there is no second
exposure. Learning-science seat calls it the biggest unexploited lever.
**Why it is not higher.** The friend-answers document explicitly tempers it: his
2-day return was "ADHD" plus "I promised you I would give honest feedback" — *"not
evidence of organic retention, it's evidence of a personal favor."* The need
stands; the proof does not. And a retention mechanic on four monthly converters
optimises almost nothing until item 6 resolves.
**Effort.** M.
**Gate.** **UPL gate** (drives users into the scored engine). No push server,
ever — that breaks the on-device promise.

---

### 17. Document capture — skippable and resumable, not restored
**What.** Reintroduce optional document photography that can be deferred and
returned to later from a private moment. Never a forced in-flow choice.
**Why.** The friend: "It's useful but it is something I wasn't willing to do in
public so I had to wait for an opportunity to do so in a private space. I'm lazy
so I do like taking the photo." The follow-up document's conclusion: "The actual
friction was never the feature; it was that the flow offered no way to defer the
step."
**Why it is this low.** Three reasons the panel would not waive. (a) n=1, from a
non-driver. (b) A second friend independently called the placeholder redundant
because people keep insurance in the glovebox. (c) Luis's reaction to the *old*
version was disqualifying — "under the old flow he'd have hit 'let Amparo use
your camera' and closed the tab instantly." Rebuilding costs real work (493 lines
/ 32 functions were deleted in v2.1.0) to serve one interview against one
persona's flat rejection.
**Effort.** L.
**Gate.** None legally — but gate it on item 1 showing the v2.1.0 removal
actually helped or hurt. Do not rebuild blind.

---

### 18. Per-state licensed attorney review *(wargame 01 seat)*
**What.** Retain licensed counsel in TX, GA and NY to review and sign that
state's cited content. Fill `REVIEW.attorneys` only on written sign-off, against
the exact EDITION reviewed.
**Why.** Wargame 01 listed this seat as **blocking** — "nothing else on this list
can sign that." It is the only thing that can make a cited statute *correct*, as
distinct from item 4's endorsement, which makes the product *credible*. Dana's
conversion condition is specifically a Texas attorney's name. The machinery
already exists and is empty: three states, all fields blank, `isReviewed()`
requiring an edition match.
**Why it is this low.** Cost (project estimate $19–38K at full scope), and it is
strictly downstream of item 2 — reviewing content in an engine that may have to
be restructured wastes the review. Start with **one state**, not 47.
**Effort.** L, and the largest cash item on the list.
**Gate.** After item 2. Any content change afterward bumps EDITION and drops
every badge — sequence content work *before* sign-off, never after.

---

### 19. Practice-engine craft batch *(wargame 01 game seats)*
**What.** Four small items from the game-design seats, batched because none
justifies its own slot and all touch the same component:
- **Level designer** — verify the Hard Mode gate is *sufficient*, not merely
  present. Gating exists (`PRX_LEVELS` is a fixed six-level sequence; v2.0.0
  shipped locked-not-hidden levels), but nobody has checked a user can't reach
  level 5 cold, where its lesson reads as a bug.
- **Encounter designer** — pacing of the escalation beats; whether the player can
  read the turn before it lands.
- **Game accessibility** — confirm no result state is conveyed by colour alone
  (text labels are present, so this is verification not construction), and
  consider a no-timing mode for players who freeze.
- **Economy designer** — nothing to price. The pricing fork resolved to "free
  pending UPL" and there is still no payment integration in the codebase.
  Recorded as closed, not deferred.
**Why.** Real craft, low marginal value against the items above, and all of it
sits on a component that may not survive item 2.
**Effort.** M in aggregate.
**Gate.** **UPL gate.**

---

### 20. Honest-machinery backlog
**What.** Three small items of the same class, batched:
- **Georgia has no CI-reachable statute source.** Genuinely checked only on local
  runs. Either find a datacenter-friendly source or make the badge state per-state
  freshness rather than a single global date.
- **Confirm the GSAP CDN dependency degrades cleanly offline.** The shell and
  icons are precached; an external script is not. RECON, not an asserted defect —
  test a cold offline start with the CDN blocked.
- **Re-add the two new notebook documents** (this file and the UPL memo) as
  NotebookLM sources, deleting stale duplicates by ID in the same step.
**Why.** This project's defining failure mode is machinery that breaks quietly
while still making its claim. The GA gap is a live instance: a single global
freshness date implies uniform checking that does not happen.
**Effort.** S each.
**Gate.** None.

---

## PART 3 — Blind spots the panel raised that are not on the list above

Not ranked because each is a question to answer, not a task to execute.

**BS-A — The audience may not be "drivers," and every surface assumes it is.**
The most engaged user in the product's history does not drive. Every persona,
CTA, and wizard step is driver-shaped. If the real audience is "people who fear
police contact," that includes passengers, teenagers being taught by parents, and
people who simply want to know. Testing this costs a copy variant, not a rebuild
— but it would reorder this entire list if true. Carried forward from wargame 01
BS-1, still unaddressed, and the panel flags that *nothing on the ranked list
tests it.*

**BS-B — Trust is being priced as a legal problem when it is a social one.**
The project's plan spends $19–38K on per-state attorney review to earn trust. The
focus group says two of three trust-blocked personas would be moved by a church
or a chapter, not a bar number. The legal review may still be necessary for
*correctness*; it is being over-relied on for *credibility*. Item 4 is the wedge.

**BS-C — Every decision on this list is gated on measurements the traffic cannot
produce.** Named by the growth skeptic and adopted by the panel. This is the
structural reason the roadmap keeps generating items that never get judged.

**BS-D — The product ends at the stop, and the legal-aid seat says that is where
the consequences begin.** *(wargame 01 seat)* Its unique catch: "what actually
happens after the stop — bail, arraignment, what signing binds you to.
Appellate-minded lawyers do not have this." The product rehearses the encounter
and stops at the roadside. Beat 5 already tells a user that signing a citation is
a promise to appear rather than an admission — a statement *about* what signing
binds them to, made with no post-stop content behind it. The panel declines to
open this scope now, but records that a blocking seat from wargame 01 believes
the product's boundary is drawn in the wrong place, and that no item on the
ranked list tests that belief.

**BS-E — Success has never been defined.** Not in any document reviewed. Three
prints in 30 days is either catastrophic or fine depending on an unstated goal.
Without it, item 6 cannot be decided and no result on this list can be called a
pass. The panel considers this the most consequential omission in the corpus.

---

## Abort conditions (unchanged, restated)

- UPL opinion says the scored engine is exposed → **stop items 13–16 and 19**, re-scope
  before writing another line of practice-engine code.
- Any item comes to require user data leaving the device → stop.
- Any item comes to require a model generating statute text or citations → stop.
- Any badge or claim would assert a verification that has not happened → stop.

## Verification for the list as a whole

1. `sr_step_viewed` fires on every wizard step; a funnel query distinguishes
   picker-viewed from picker-acted.
2. A written UPL opinion exists and answers memo questions 1–4 unambiguously.
3. One organization has agreed in writing to be named. Nothing is displayed until
   it has.
4. A stated traffic decision exists in the repo, with a number attached.
5. The pack is retrievable offline afterward on a real Android and a real iPhone,
   with no printer.
6. Every user-facing privacy claim survives being read aloud next to
   `prx_rec_note_sr`.
7. A written definition of success exists.
