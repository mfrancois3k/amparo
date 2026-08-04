# Amparo — focus group 07: the final-boss scaffold, and did the three shipped fixes stick

Date: 2026-08-03. Run against `8f59cbf` (HEAD). Tag `v2.7.4` = `cda8853`, one
commit earlier — the gap between them is `8f59cbf` itself, the CHANGELOG/
version-history entry for v2.7.4, no application code. Step 7 of `/amparo-loop`.

**Scope, stated plainly up front.** Since `v2.7.3` (`5b46965`), exactly three
commits touched `index.html` — `f205531`, `37e4ffe`, `e586fe4` — and every other
commit in the range (`5a5adb9`, `f6bff30`, `a1790e4`, `d9c5f06`, `d7ee279`,
`cda8853`, `8f59cbf`) is documentation: the entire final-boss module, both
wargame docs, and 12 pages of mockup prompts, with **zero** lines of shipped
code. Confirmed by `git log --oneline v2.7.3..HEAD -- index.html` returning
exactly those three hashes and nothing else. That split — three real fixes,
one large design stack — is this round's actual shape, and Part A / Part B
below follow it exactly.

**Method note.** Part A claims are grepped and read directly out of
`index.html` at `8f59cbf`, cross-checked against each fix commit's own diff
(`git show <hash>`), not taken on the strength of the commit message alone.
Part B is a design review — nothing described in `wargames/10` exists in the
product yet, so personas react to the written spec (scaffold + direction
brief + mockup prompts), not to live behavior. Where a persona's reaction
depends on a claim about the *current* engine (e.g., whether a hook point
already exists for a proposed feature), that claim is grepped against
`index.html` same as Part A, and cited the same way.

---

## Part A — the three shipped fixes, verified

| # | Fix | Where | Result |
|---|---|---|---|
| 1 | **Orphaned hostile `PRX_VAR` lines pruned** (`f205531`) | `3642–3680` | Beats 0, 1, 2, 4, 8 each read exactly 4 entries (`calm, calm, curt, curt`) — grepped, zero `tone:"hostile"` remaining in any of them. Beat 3 (`3655–3659`) is untouched and still carries its 5th, hostile entry: `"Step out. Now. Hands visible."` The commit's own diff removes exactly 8 lines — 2 from beat 0, 2 from beat 1, 1 from beat 2, 1 from beat 4, 2 from beat 8 — matching the commit message's corrected count ("listed 7… missing beat 4's single hostile entry… deleted 8") line-for-line against the actual diff, not just the prose claim. The two stale comments the same commit fixed ("HARD MODE (level 5)" → "4th numbered rung, `PRX_LEVELS` index 3"; "Level 6: fixed Border Patrol checkpoint" → "Checkpoint… deliberately unnumbered") are both present at `3693` and `3741`. |
| 2 | **Hub card no longer leaks a score for Hard Mode** (`37e4ffe`) | `2949` | `${isLk?_t.hub_locked:(i===3?(done?_t.hub_done:_t.hub_start):(best?...))}` — the `i===3` branch now renders only Done/Start text, never a fraction, mirroring the tab strip's pre-existing guard at `4418`. The self-documenting comment directly above it (`2946–2948`) names the exact bug this round's own predecessor found: *"this hub card was written later and never got the same guard, so it leaked a score the results screen itself refuses to show."* Confirmed against the diff: before, the span was one unconditional ternary keyed only on `best`; after, `i===3` is checked first. |
| 3 | **Mute guard added inside `prxSpeakTTS`** (`e586fe4`) | `3979` | `if(prxMuted||!prxTTS) return;` — was `if(!prxTTS) return;`. The diff also closes two adjacent, previously-unguarded autoplay paths in the same commit: `prxPlayLast` (`4082`, now `if(prxLastUrl&&!prxMuted)`) and the recording auto-replay (`4133`, now wrapped in `if(!prxMuted){...}`). All three sit behind one root cause (pausing `prxAudio` rejects its `play()` promise, which fires `prxSpeak()`'s own `.catch()` straight into the TTS fallback with no mute check) and the fix is applied once at the shared function rather than patched at each caller — grepped: `prxSpeakTTS` is the file's only `speechSynthesis.speak` call site, so gating it here closes the hole regardless of which of its 3 callers reaches it. |

**All three: confirmed, real, and precisely what their commit messages claim.**

**One piece of context that matters for Part B and isn't a new finding — it's the fact these three commits *didn't* touch.** FG06's top-ranked, still-open item — that the mute control (`ctrls`, built at `4544`) doesn't exist in the DOM until the same synchronous call that plays the first line of audio, on every level's first exposure — is untouched by any of the three fixes above. Re-confirmed this round: `ctrls` is still concatenated only inside the full scenario render (`4582`), still absent from the warn-screen branch that returns earlier (`4437`). This matters below because the final-boss scaffold (`wargames/10` §6) writes a *new, module-specific* version of this exact requirement as a ship-blocker for scenarios 5 and 6, without addressing the identical, already-open gap on levels 0–4. See Part C, item 2.

---

## Part B — ten persona reactions to the final-boss DESIGN

Ten of the panel's thirteen, chosen for this subject: **Nia and Omar** (required —
this module exists partly because of what they raised in FG03/FG04), plus **Dana,
Marcus, Tony, Rosa, Luis, Devin, Keisha, Wes**. Dropped, consistent with FG06's own
reasoning and re-checked against *this* subject specifically: **Ana** (federal-only
framing doesn't intersect a traffic-stop-flavored module), **Marisol** (her Spanish-
parity lens is fully covered by Rosa for this subject), **Ray** (his audience-boundary
question is real but orthogonal to trauma/execution review — noted, not chased,
per his own standing rule).

Every reaction below is to the **written design** — the two-scenario split, the §0.1
reframe, and the corrected debrief copy — not to any built behavior.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Two-scenario split:** she never reaches either scenario — gated behind `mUnlocked`
  (three completed levels), and FG04–06 all confirm she exits at the headline. But
  *reachability isn't the only exposure surface.* Per the hub mockup (prompt 10), even
  a **locked** Scenario 6 card sits visibly in the grid with its real title —
  `"🌑 It doesn't stop"` — and Scenario 5's card reads `"No score. Nothing you say
  changes it."` right on the hub, unlocked or not, the moment either card exists at
  all. Splitting one scenario into two didn't just double the content behind the
  gate — it doubled the number of ominous card titles sitting in a screen she might
  still pass through for non-hostile content. That's a real, if narrow, argument that
  the split makes her situation *slightly* worse, independent of whether she'd ever
  tap either card.
- **The §0.1 reframe, read from her specific standpoint:** she'd likely recognize it
  as the *correct* call, and more relevant to her own history than the reframe's own
  legal justification gives it credit for. The scaffold defends "player complies
  physically, declines verbally" mainly as a don't-teach-the-wrong-lesson constraint.
  But a fully-compliant person still getting escalated at is arguably the *more*
  psychologically accurate rendering of powerlessness than a defiant one — closer to
  what "nothing I do matters" actually feels like from the inside. The design doc
  under-sells its own best argument by framing it as legal hygiene rather than
  emotional accuracy.
- **Debrief copy:** "I hope you never need this" (prompt 16) is close to the register
  FG04 already found she responds to — plain, not performative. She'd never see it.
- **Would she play it?** No — unchanged, same reason as every prior round.
- **Would she want it to exist even though she'd never play it?** **Conditional yes.**
  Not for herself — for the version of her that isn't six years past it yet, or for
  someone who processes differently. The condition: the trauma-informed constraints
  in §6 (no siren/impact sound, no children/family, equal-weight idle handling) have
  to actually ship as written, *and* the hub-card-visibility point above needs an
  answer, because right now the module's care is spent entirely on what happens
  after a tap, and none of it on what happens before one.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **Two-scenario split:** structurally neutral to him. His read is sharper on *how*
  each scenario's signature beat is designed to be perceived. Both signature-beat
  mockups are visual-only encodings of the exact data the direction brief spent 500
  lines measuring: prompt 12 renders "the long wait" as a slowly-pulsing dot in a
  third-of-a-screen of blank space; prompt 14 renders "it doesn't stop" as four
  stacked speech bubbles whose **vertical gap shrinks** (the prompt literally specifies
  fixed pixel values — "roughly 20px, then 14px, then 8px, then 4px"). A shrinking
  gap between DOM elements and a pulsing dot's rhythm both convey zero information to
  a screen reader, and neither is mentioned anywhere in the scaffold's own
  implementation checklist (§2) or its trauma-informed constraints (§6). The one
  genuinely strong accessibility idea in the whole mockup set — prompt 8's bracketed
  tone annotation, `"[voice raised, clipped]"`, a text-channel equivalent for
  something audio-only conveys — belongs to the single-scenario prompts 6–9 and is
  **never carried forward** into the two-scenario scaffold's checklist (§2), its
  ship-blockers (§8), or the scenario-specific prompts 10–16. It would have to be
  independently re-derived and re-added; right now it's a good idea that quietly
  didn't make the cut when the doc was split.
- **The §0.1 reframe / debrief copy:** not his primary lens; he'd note only that both
  are plain text and therefore accessible by default, consistent with FG06's finding
  that text-based surfaces are where this product's a11y work is already solid.
- **Would he play it?** Conditional, and functionally an audit rather than personal
  rehearsal — consistent with how he's engaged the rest of the app across three
  rounds.
- **Would he want it to exist?** **Yes, conditional** — specifically conditional on
  prompts 12 and 14's cadence being given a real non-visual equivalent (the
  bracketed-annotation pattern from prompt 8 is the obvious candidate, since it
  already exists) *before* ship, not audited in afterward the way the `#stateSearch`
  gap has sat NOT VERIFIED since v2.5.0.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **Two-scenario split:** she is exactly the persona §6's own last bullet worries
  about — *"two heavy scenarios back to back is itself a load… a 'one more' pull at
  exactly the wrong time."* She's cleared the full ladder in every prior round and
  tracks progress across weeks with her son; nothing about her established behavior
  suggests she stops at a missing "next scenario" button. The design's actual
  mitigation (prompt 16: *"Deliberately NO button offering another scenario"*) is a
  removed affordance, not a lock — she already knows how to get back to the hub in
  two taps, and Scenario 6's own card is sitting right there, merely relabeled from
  locked to unlocked the instant `done[5]` flips. A missing button is a nudge; it
  reads as a hard stop only to someone who wasn't already going to look for the next
  thing.
- **The §0.1 reframe:** she'd likely recognize "comply physically, decline verbally,
  say nothing further" as the literal shape of the drills she already runs with her
  son — the strongest persona-match on the panel for whether this reframe reads as
  authentic rather than sanitized. Her answer: authentic, because it's what she
  already teaches.
- **Debrief copy — and a specific catch.** She's the panel's proven close reader (she's
  the one FG06 credits with noticing the hub's leaked "3/3" precisely *because* she
  reads status text carefully). Set against the operator's own corrected principle —
  recorded verbatim in `f6bff30`'s commit message, *"negating a win condition still
  centers winning as the frame"* — Scenario 5's debrief heading, **"You waited him
  out"** (prompt 15), is a live instance of the same shape the correction was written
  to catch: "waiting someone out" is a siege idiom, a contest with an implied winner,
  even though it never says "win" or "lose." Worth noting precisely what *is* clean:
  Scenario 6's debrief (prompt 16) reuses the corrected "I hope you never need this"
  language almost verbatim and has no such leak; Scenario 5's own body text below the
  heading ("your record was" [what mattered]) is clean too. It's the four-word
  heading specifically that didn't get the same scrutiny the rest of the copy did,
  most likely because it was written in a later commit (`d7ee279`/`cda8853`) than the
  correction itself (`f6bff30`).
- **Would she play it?** Yes.
- **Would she want it to exist?** Yes — and she'd want it enough to eventually hand it
  to her son, which is the real question (see Devin, below).

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **Two-scenario split:** doesn't change his calculus much either way — what changes
  his calculus is that this module has **no score, no badge, and (prompt 16,
  explicit) no share button**, the one mechanism FG05/FG06 established actually
  drives his engagement ("cleared level 4" is something he'd post; nothing here is).
  That's very likely the *correct* design call — this content shouldn't be a flex —
  but it means the module has zero instrumental pull for him specifically, split or
  not.
- **The §0.1 reframe, from his lens rather than a legal one:** every option in both
  scenarios is `bothGood:true` (§4) — nothing he taps is ever wrong, same mechanic
  Hard Mode already uses. For a persona who engages partly through the social
  performance of *choosing well*, a mechanic where no choice matters risks reading as
  being on rails rather than rehearsed, even though the design has a real reason
  (nothing here *should* have a wrong answer). He'd clock this as a tradeoff, not a
  flaw — but a tradeoff worth naming since it directly cancels the one lever that's
  worked on him so far.
- **Debrief copy:** wouldn't linger on it — it's not built for his read.
- **Would he play it?** Leaning no — low friction and shareability are what pull him
  in, and this module is gated behind three finished levels and explicitly built to
  be un-shareable.
- **Would he want it to exist even though he probably wouldn't play it?** **Yes.** He'd
  recognize — same instinct as his "products that look half-finished" allergy,
  borrowed from Ana's throughline — that a rights-rehearsal app with nothing to say
  about the worst case would read as incomplete, even to someone who isn't its
  audience.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Two-scenario split:** his lens isn't UX, it's standing — does this match what he's
  actually taught his grandkids, and does the product own, *in the product*, that
  these are performed and researched rather than real. It does, in `wargames/10` §7
  — "original, attorney-reviewed, performed by a directed voice actor," explicit
  provenance language — but that statement lives in a design document, not anywhere
  a user like him would ever read it. Same exact finding FG06 gave him about the
  migration comment ("the honesty exists in the codebase; it just isn't in a place he
  could ever read it") — carried forward and now true of this module too, not
  re-flagged as new, just recurring.
- **The §0.1 reframe:** the strongest real-world-authority "yes" available on the
  panel — comply physically, hold your tongue, is what he actually tells his
  grandkids. He'd read it as correct, not sanitized.
- **Debrief copy:** "get through it, and get home" is exactly his register — plain,
  unadorned, no flourish. Matches FG04's finding about what he trusts.
- **Would he play it?** Once — unchanged pattern.
- **Would he want it to exist?** Yes, and probably the single strongest yes on the
  panel for this specific module — conditional on the same thing that's blocked his
  "refer" for three straight rounds: a named institution standing behind it. Not a
  new finding; his standing condition, now applied to new content.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **Two-scenario split:** more relevant to her actual fear than Checkpoint is — the
  scaffold's own placeholder scene-setting (`"scene: night, roadside"`, §5) puts this
  squarely in traffic-stop territory, which is where her son actually drives, not a
  border checkpoint. She'd likely find the module *more* relevant to her household
  than most of the existing ladder, not less.
- **The §0.1 reframe:** she'd read it the way Dana and Tony do — comply, stay quiet,
  don't give them anything — because it's the same advice she'd already give her son.
- **Debrief copy:** can't evaluate register yet — both scenarios are EN-only in the
  scaffold (§8 item 5: *"Spanish authoring of all 12 beats. A monolingual level is not
  shippable."*). Worth putting her voice on that line specifically rather than leaving
  it as a checklist bullet: if this ships English-only even temporarily, it isn't
  for her family at all, regardless of how well the rest of it is built — half a
  language isn't a smaller version of the product for her, it's a different product.
- **Would she play it?** Conditional — on Spanish actually landing at ship, and on
  previewing it herself before her son ever sees it. Which raises a real question:
  **§6 names "Preview mode" as non-negotiable** ("a non-scored, non-logged
  pass-through so a parent can hear it before a teenager does") but it's asserted in
  prose only — it has no line item in §2's implementation checklist or §8's
  ship-blocker list the way the harder engineering items (warn strings, `PRX_LEVELS`
  entries) do. She'd want that promoted from a sentence to a tracked requirement
  before she'd trust it's actually going to exist on day one.
- **Would she want it to exist?** Yes, conditional on both of the above.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **Two-scenario split:** not his primary lens — his question is what a completed
  Scenario 5 or 6 *proves exists on the phone*, split or not. §4 is explicit that
  `prx.best[5]`/`prx.best[6]` are never written — no score. It is equally explicit
  that `prx.done[5]`/`prx.done[6]` **are** written — "completion is real, a score is
  not." A completion flag with zero score attached is still a permanent local record
  that this profile finished the hostile-officer module. For the one persona on the
  panel whose entire standing objection is about what a device can be made to prove
  ("Distrusts: card payments creating identity trails, anything cloud"), that
  distinction — unscored vs. unrecorded — is exactly the one the design doc doesn't
  draw.
- **A sharper version of the same concern, grepped rather than assumed.** `ph()`
  (`1291`) is `posthog.capture(ev, props)` — a real network call, not a local stub.
  Existing practice events already fire it with identifying props regardless of
  answer quality (FG06 cites `sr_practice_mute:{muted,lang}` and
  `sr_practice_self_record:{level,state,lang,transcript}` firing unconditionally on
  their triggers). The scaffold never states whether completing Scenario 5/6 fires an
  equivalent event with `level:5`/`level:6`. And the document's own word choice hints
  the answer is yes: §6 describes Preview mode as *"non-scored, **non-logged**"* — a
  distinction that only means something if the **regular**, non-preview attempt at
  5/6 is logged somehow. Nobody has said logged as what, sent where, or under what
  consent, for content this sensitive.
- **The §0.1 reframe / debrief copy:** secondary to the above for him; no complaint on
  either.
- **Would he play it?** Conditional on that telemetry question getting a real answer
  before he'd trust "unscored" means what he'd need it to mean.
- **Would he want it to exist?** Yes, same condition.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user rather than the buyer

- **Two-scenario split:** irrelevant to him the way everything behind `mUnlocked` is —
  he's never shown, across three rounds, to open the practice engine at all. Same
  root cause here: gated behind three finished levels plus, now, his mother's
  curation via Preview mode. That's two layers of adult gatekeeping stacked on the
  single heaviest content in the app, for the one persona whose defining trait is
  not wanting to be handed things by a parent.
- **The §0.1 reframe:** he wouldn't engage with the legal reasoning — his version of
  the same question is blunter: why does the player have to stay calm and polite
  about it. That's worth recording as a real, if unresolved, reaction rather than
  smoothing it into the adult framing above it.
- **Debrief copy — the one place his read cuts differently from every adult on this
  panel.** "I hope you never need this" is well-judged for Nia, Dana, Tony, all of
  whom read it as caring rather than paternal. Devin's whole established character is
  built on resisting exactly that voice regardless of how well-intentioned it is —
  his bio: *"wants: not to be lectured by a parent."* There may not be a version of
  this line that doesn't read, structurally, as an adult institution speaking gently
  *at* a 16-year-old right after a scary simulation. That might be fine. Nobody has
  actually asked a 16-year-old.
- **Would he play it?** No — same root cause, unchanged.
- **Would he want it to exist?** The most genuinely unresolved answer on the panel.
  Dana wants it to exist *for* him. Whether *he'd* want it hinges on how it arrives —
  his throughline across three rounds is that he'd engage with a direct link, not a
  destination behind two adults' worth of gatekeeping. The highest-stakes content in
  the product currently inherits the exact same distribution gap that's been the
  panel's #1 complaint for three rounds running.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **Two-scenario split:** a real time-cost question for her specifically — two 6-beat
  scenarios plus two gate screens plus two debriefs is a heavier commitment than a
  single scenario would have been, and her described context ("practises between
  fares") is short-window by definition.
- **The §0.1 reframe:** not her primary lens, but she'd recognize the compliance
  discipline as literally what she needs — she's a working driver who gets pulled
  over, not hypothetically.
- **A distinct angle on §6's "no siren, no impact sound" constraint.** Nia's version
  of this concern is about her own reaction; Keisha's is about the passenger in her
  back seat. Even without sound effects, the hostile *voice itself* is still the
  thing she can't have audible mid-fare. That makes the still-open, module-specific
  mute-before-first-audio gate (§6, and see Part C item 2) matter for her in a
  different, equally real way — and unlike Nia, she routinely *does* clear
  `mUnlocked`, so she is a realistic candidate to actually hit this gate live,
  mid-shift, not a hypothetical one.
- **Debrief copy:** the sparse, no-lingering layout actually suits her — fast to read,
  nothing to scroll past.
- **Would she play it?** Plausible yes — she has the most literal real-world use case
  on the panel for rehearsing an escalating stop.
- **Would she want it to exist?** Yes, unambiguous.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, the only real completed funnel

- **Two-scenario split:** he's the panel's best judge of whether the hub's
  presentation is legible *without* a fear-context primer, since his established
  pattern is entering sideways and exploring without dread driving him. The divider
  text ("When you're ready for the hardest two") and the heavier card styling
  (prompt 10) would need to explain themselves to someone who arrived analytically —
  worth user-testing specifically against someone who isn't already afraid, since
  every other persona on this panel is reading the copy through some version of
  fear or protectiveness.
- **The §0.1 reframe / debrief copy:** he'd read both dispassionately rather than
  emotionally — an intentional contrast to Nia's read, and useful precisely because
  it's the panel's least fear-inflected reaction.
- **A small, on-character observation.** Both debriefs end at "Back to the hub" with
  no way to mark or export "I did this" anywhere — consistent with the rest of the
  product's paper-trail ethos (the whole point of Amparo elsewhere is a printable
  pack) breaking specifically here. He'd likely conclude, on reflection, that this is
  the one place that ethos *should* break — but he's the persona most likely to
  notice the inconsistency in the first place, per his stated want to "see what the
  paperwork says."
- **Would he play it?** Yes — plausible, given he's the one persona shown actually
  exploring the practice engine unprompted across three rounds.
- **Would he want it to exist?** Yes — probably the most purely-interested yes on the
  panel: no personal need, no advocacy for someone else, just a recognition that
  it's the most substantive content in the product.

---

## Part C — exactly 5 things needed before this could ship

Ranked by UX leverage, each evidence-tied. Attorney review and the UPL opinion are
real, pending, and already named in the scaffold's own §8 — not re-listed here as
new findings.

### 1. Promote §6's "non-negotiable" list into real, checkable ship-blockers

**Evidence.** `wargames/10` §6 asserts several things as non-negotiable in prose —
Preview mode, a scenario-specific `prx_idle_h` variant, `bc` coach lines in Hard
Mode's register, the mute-before-audio gate — but only the mute gate appears in §8's
actual ship-blocker checklist. Preview mode has no line in §2's implementation table
or §8. The idle-copy variant has no line either. Omar's finding (prompts 12/14 have
no non-visual equivalent, and prompt 8's tone-annotation pattern that *would* solve
it quietly didn't survive the split into two scenarios) is the same shape of gap
again: a real commitment, stated once, with nothing tracking whether it actually
ships. §8 is legal- and production-complete (attorney sign-off, voice performances,
Spanish, audio generation, the `prx.best` guard) and UX-feature-incomplete. This is
the throughline touching the most personas above (Omar, Rosa, Nia's hub-card point,
Luis's telemetry point) — closing it is the single highest-leverage move available
on the document itself, because it's a gap about gaps: every item below this one is
a specific instance of the same failure mode.

### 2. Decide whether the new mute-before-audio gate unifies with the old one, or ships a second parallel system

**Evidence.** §6 requires, correctly, that "mute must be reachable before the first
line plays" for scenarios 5 and 6, tied explicitly to "a known open finding." Part A
above reconfirms that finding is *still open* for levels 0–4, untouched by any of
the three commits this round verified. The scaffold never states whether building
this gate for the new module will retroactively close the old, identical gap (making
`ctrls` finally reachable pre-audio everywhere), or whether Amparo ships two mute
implementations — one gate screen pattern for scenarios 5/6, one still-missing
pre-audio window for scenarios 0–4. This is the single most repeatedly-flagged item
across FG05 and FG06; a third round should not be the one that lets it quietly
bifurcate into two different fixes instead of one.

### 3. Answer, in writing, what "unscored" means for telemetry, not just for the hub

**Evidence.** §4 is precise about scoring (`prx.best` never written for level 5/6)
and silent on logging. §6's own word choice — calling out Preview mode specifically
as unscored **and unlogged**, a pairing rather than a synonym — implies by contrast
that the regular attempt *is* logged. `ph()` (`1291`) is a real `posthog.capture` call, not a local-only stub, and
existing practice events already fire with `level` and other identifying props
unconditionally. For the personas whose objections are shaped around device-level
proof (Luis explicitly; Rosa adjacently), a completion flag plus an unaddressed
analytics event is a bigger gap than the UI-level "no green squares" treatment
suggests.

### 4. Make the anti-binge design match its own stated intent

**Evidence.** §6: *"neither should be the first thing a scared first-time visitor
stumbles into"* and *"the debrief after 5 should not offer 6 as its primary action."*
The actual mechanism is a removed button (prompt 16) — a nudge, not a gate. Dana's
reaction above is the concrete counter-example: a completionist persona this panel
has watched clear the full ladder in every round is not stopped by an absent button
when the very next card in the hub is sitting there, freshly unlocked. If the
two-scenarios-per-sitting outcome is genuinely unwanted, the mechanism should carry
real friction (a same-session soft-lock, a "come back another day" framing, anything
stronger than an omission) rather than relying on a UI element's *absence* to do a
gate's job.

### 5. Treat the locked/unplayed hub cards themselves as a dosage decision

**Evidence.** Nia's reaction above: prompt 10 puts both final-scenario titles —
including the literal string "It doesn't stop" — visibly in the hub grid regardless
of lock state or `mUnlocked` status. The scaffold's gating logic (§3) carefully keeps
these scenarios off the progress bar and the mastery gate for good stated reasons,
but never asks whether the cards' mere textual presence needs the same care the
audio-gate got. This is the cheapest fix on the list — copy and/or placement, no new
engineering — and it directly touches the persona the module exists partly because
of.

---

## Part D — what needs to change in the scaffold specifically

**The §0.1 reframe has an unstated side effect: it pulls Scenario 5 and Scenario 6
thematically closer together than §0's own comparison table implies.** Before the
reframe, the table's contrast (non-compliant subject → widening dread vs. compliant
subject → contracting futility) gave the two scenarios genuinely different premises.
After the reframe — the player complies physically throughout *both* scenarios,
per §0.1's own requirement — the distinction narrows to cadence shape (widening vs.
contracting) and framing sentence (record vs. de-escalation), while the underlying
player experience in both is "I did everything right and it escalated anyway."
That's not necessarily wrong — it may be the honest shared thesis of both scenarios —
but §0 should say so explicitly rather than leaving the two-reference-video framing
to imply a bigger difference than the reframed design actually delivers. Worth one
added sentence in §0, not a redesign.

**Scenario 5's back half compounds this.** Its own beat table (§5a) goes hostile-tone
at beats 4–6 of 6 — three of six beats — despite "The long wait" being pitched as the
*dread/silence* scenario, distinguished from Scenario 6's more overtly hostile
register. Wargame 09's own 5-stage spine (§3.2) treats hostility as a brief, late
"verdict flip," not half a scenario. Recommend re-checking Scenario 5's tone budget
against that spine before authoring — right now it risks spending down the exact
contrast (silence vs. escalation) that's supposed to separate it from Scenario 6.

**"You waited him out" (prompt 15's heading) is the one piece of copy that didn't get
the same scrutiny the rest of this content did.** Detailed under Dana's reaction
above — flagged here again because it belongs in any punch list of scaffold changes,
not just persona color: measure it against the same standard `f6bff30` already
established (negating an outcome still frames the scenario as a contest) before
voice recording locks it in.

**Gating mechanics themselves check out.** `mUnlocked` and `done[5]` as the two gate
conditions are the right level of ceremony, and the scaffold's instruction not to
extend the hub progress bar to 6 (§3) is consistent with the same reasoning that
already kept Checkpoint off it. No change needed there beyond Part C item 4's
friction question.

---

## Part E — blind-spot questions a top UX researcher would ask

**BS-1. What emotional register does the hub return the player to immediately after
either debrief, and has anyone looked at that transition specifically?** Both
debriefs route to "Back to the hub" only. The hub is built for a completely
different register — green checkmarks, a progress bar, "2 of 4 done." Nobody has
asked whether landing back in that cheerful chrome seconds after "I hope you never
need this" undoes some of the debrief's own careful pacing, or whether a module this
deliberately unhurried needs a softer landing than the same screen every other level
returns to.

**BS-2. Does pre-announcing unwinnability change how the decision points function as
practice?** Both gate screens (prompts 11/13) tell the player up front that nothing
they say changes the outcome. Hard Mode discovers `bothGood` as a *debrief*
revelation — the player doesn't know it going in. Scenarios 5/6 announce it as a
precondition. Nobody has asked whether moving the reveal earlier changes engagement
with the beat-level decisions ("wait through a long silence," "say the one sentence
that matters") from genuine rehearsal into passive click-through, once the player
already knows the choice is inert.

**BS-3. Given the gating, how many real users are structurally capable of ever
reaching the beat wargame 09 calls "the highest-value beat in the module"?**
`mUnlocked` + `done[5]` means four completed scenarios minimum before Scenario 6.
Across three focus-group rounds, only Dana has actually been walked through
`mUnlocked`-gated content start to finish. Two of the four remaining ship-blockers
(voice performance, Spanish authoring) roughly double in cost for splitting one
scenario into two, per the scaffold's own scope note. Nobody has weighed that
production cost against how much of the target audience the gating structurally
permits to ever arrive at the content it's spent on.

**BS-4. What can be reconstructed from `prx.done[5]`/`done[6]` alone, independent of
any score, and by whom?** Covered from Luis's angle above as a design gap; the
sharper version of the question is a threat-model one nobody has posed directly: for
a mixed-status household, a completion flag with zero score attached is still
proof-of-engagement if the device is ever searched, seized, or simply picked up by
someone else. "Unscored" answers a UX question; it doesn't answer a forensics one.

**BS-5. Has the existing idle/freeze path actually been validated for this content,
or is it inherited by assumption because the mechanism already exists?** §6 asserts
`prLevel>=2` idle handling "already routes correctly" and only needs a copy variant.
Neither FG05 nor FG06 live-tested idle handling at all — it's absent from both
reports' verified-check lists. A player freezing at Scenario 6's signature beat
("obeying isn't stopping it") is the single most emotionally consequential moment
for that path to fail silently, and it is currently the least-verified mechanism the
module depends on.

**BS-6. Does the reference footage's sub-second cadence data survive an engine where
the player, not a timeline, controls pacing between beats?** The direction brief
measures repeat intervals to two decimal places (0.72s, 6.2s). The deployed engine
advances beats on a player tap (`prxAdvance`), not a clock — so a beat's internal
cadence can only survive as baked-in timing *inside* a single audio clip, matching
the brief's own production note ("perform each stage as one continuous unbroken
take"). That's coherent for audio. But prompt 14's visual — the compressing
stacked-bubble mockup — specifies **fixed, hardcoded pixel gaps** (20/14/8/4px), not
values derived from the real clip's actual waveform timing. Nobody has specified
whether the visual is supposed to stay synced to the real audio once a placeholder
becomes a 0.9-to-0.7-second performed take, or whether it's simply illustrative and
allowed to drift. Worth answering before audio generation, not after — it's a much
cheaper question now than a re-sync pass later.

---

## Part F — group read

**Would-play verdict: 4 yes (Dana, Tony–once, Keisha, Wes) / 3 conditional (Omar,
Rosa, Luis) / 3 no (Nia, Marcus–leaning, Devin).** A clean three-way split that
happens to mirror FG06's own 4/3/3 shape without being forced there — this round's
subject is different, the math landed the same way independently.

**Would-want-it-to-exist verdict: effectively unanimous, conditionally.** Every
persona who said no to playing it — Nia, Marcus, Devin — still said yes to it
existing, each with a specific, named condition attached (hub-card visibility for
Nia; nothing instrumental changes his own answer but he validates the product needs
it for Marcus; delivery mechanism for Devin). **Nobody rubber-stamped it, and nobody
rejected the concept either** — the module has real buy-in, and the pushback this
round is entirely about execution, not premise, exactly as scoped.

**Biggest objection, by theme rather than raw count this time:** the gap between §6's
prose commitments and §8's actual ship-blocker list. It's the thread running through
Omar (non-visual cadence), Rosa and Dana (Preview mode as a sentence, not a tracked
requirement), Nia (hub-card presence never treated as exposure), and Luis (telemetry
silence) — five different personas converging on one structural cause.

**Highest-leverage fix, this round's subject specifically:** Part C item 1 — turn
every §6 "non-negotiable" into a real, trackable ship-blocker with the same weight
`prx_warn7`/`prx_warn8` already get. It's the fix that would have caught four of this
round's five ship-blockers as a side effect of catching the first one.

**Highest-leverage fix, across all three rounds this loop has now run:** unchanged
from FG06, and now touching a third round — close the universal pre-exposure mute
gap for levels 0–4, and decide on purpose whether the new module's version of the
same fix unifies with it or ships as a second, parallel system. Three rounds have
now named this the top item; this is the first round to find the project actively
about to build a *second* implementation of it without ever having shipped the
first.

**Who this still isn't for:** Nia and Devin, same as every prior round, for old
reasons that this round's new content doesn't change — and both still voted, on
balance, for the module's right to exist anyway.
