# Amparo — focus group 08: divergent turns, the state map, tone atmosphere, and the Checkpoint tab split

Date: 2026-08-11. Run against `29acc16` (HEAD), tag `v2.14.0`. `index.html` at HEAD
is byte-identical to `038cb41` (`git diff 038cb41..HEAD -- index.html` → 0 lines) —
everything after that commit is CHANGELOG/version-history/HANDOFF documentation, so
every claim below is checked against the actual shipped file, not a summary of it.

**Method note.** Every claim is grepped or read directly out of `index.html` at this
commit, with a line reference. Where a claim concerns whether a file exists (audio
clips), it's checked against the real `audio/` directory, not assumed from the deck
definition. Attorney/UPL review is a known, already-tracked gate — excluded from
findings below per this round's brief. Findings already logged in
`amparo-focus-group-06-mute-fix.md` and `amparo-focus-group-07-final-boss-scaffold.md`
are referenced only as carried context, never re-presented as new.

## 0. What's actually new this round, verified against source

| Feature | Shipped in | Where it lives |
|---|---|---|
| Divergent turns | `038cb41` | `prxDiverge()` (`5040–5051`), wired into `prxAdvance()` (`5052–5061`), direction table `PRX_DIVERGE={1:{g:'calm',b:'curt'},2:{g:'curt',b:'hostile'}}` (`5039`) |
| Checkpoint's own hub tab | `a6460b3` | Three-tab `role="tablist"` (`3282–3286`), `onCheckpoint`/`CK=4` split logic (`3290–3297`) |
| Hub card pick-confirm animation | `b3d3e90` | `prPick()` (`4968–4974`) |
| Tone atmosphere (border glow + Hard Mode scanline) | `a308907` | `.ab-card.firm/.hot/.hardmode-live` CSS (`489–499`), `atmCard.className` write (`5428`) |
| Geographic US state map + silhouette confirm + travelling pill + clickable stepper | `614a982`…`475c5a2`, `ea7abee`, `95766ba` | Map SVG (`3072–3077`), `smShape`/`smCap` (`3582–3634`), `eyebrow()` pill (`2749–2764`), `stepper()` (`2711–2737`) |

Two things worth stating plainly before the persona reactions: **the divergence
variant bank is audio-complete.** I extracted all 37 `id:'v_'` entries from `PRX_VAR`
and checked every one against `audio/{en,es}/{m,f}/<id>.mp3` — **zero missing files**,
including the one hostile variant (`v3_4`) the escalation direction depends on. And
**the FG06 hub-score-leak fix generalized correctly**: `PRX_UNSCORED=new Set([3,5,6,7])`
(`4215`) now gates the hub card (`3320`), the tab strip (`5254`), and the write site
(`5276`) uniformly — not re-derived as a new finding, just confirmed still solid before
building on top of it.

---

## 1. Ten persona reactions

Ten of the panel's thirteen. **Ana** is back in the seat this round — dropped by
FG07 as orthogonal to the final-boss subject, but the state map is exactly her
lens (does the product visually admit what it covers and what it doesn't) and she
has fresh, source-verified material this round. **Devin** sits this one out — his
standing complaint (no deep link, discard the tapped index) is unchanged for the
third straight round and nothing in this round's feature set gives him anything
new to react to; re-stating it a third time under his name would be padding, not
finding. **Marisol** and **Ray** stay out for the same reasons FG06/FG07 gave.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Divergent turns:** doesn't change her verdict — she still exits at the headline,
  same as every prior round, and the mechanic only fires inside levels she never
  reaches. But its own design comment (`5022–5028`) frames the philosophy as
  *"escalation is chosen, never sprung"* — worth holding that language against what
  actually happens one wrong answer into Level 2: `PRX_DIVERGE[2]={g:'curt',b:'hostile'}`
  means a single missed keyword mid-level, inside a level she already consented to
  enter, can draw a hostile reply she did not specifically consent to. That's a real
  tension in the stated philosophy, not a bug — the level-level warning covers the
  *level's ceiling*, not the *per-beat trigger*.
- **Tone atmosphere reaches further than mute does, and nobody has asked about it
  yet.** This round's genuinely new fact: the card's border-glow/scanline
  (`atmCard.className`, `5428`) is computed straight from `d.tone` via `moodC`
  (`5383`) — grepped every reference, neither touches `prxMuted`. Mute (`prxSpeak`,
  `4708`; `prxSpeakTTS`, `4737`) gates audio only. For the exact persona the mute
  feature's own commit message was written for, silencing the officer no longer
  means the room stops signaling escalation — a shifting red border and a scanline
  sweep (suppressed only under `sr-motion`, not under mute) still fire. Not
  necessarily wrong — it may be the right redundant signal for most users — but it
  is a genuinely new question this round's features raise for her specifically, and
  nobody has asked it.
- **Redo? No. Refer? No.** Unchanged for the fourth straight round, for the same
  reason: the headline still outranks the button.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The state map's keyboard access is real, not asserted.** Every `<path>` on the
  SVG carries its own `tabindex="0" role="button" aria-label="${STATES[k].name}"`
  plus an `onkeydown` handler for Enter/Space (`3074`) — 51 independently
  keyboard-reachable, correctly-labeled targets, not a single opaque `<svg>` blob.
  Genuinely solid, and the first round where this exact claim was checkable.
- **The hover caption bug (see Rosa, below) is invisible to him specifically** —
  `#smCap` is `aria-hidden="true"` (`3076`), so its contents, hardcoded-English bug
  included, never reach a screen reader. Worth naming precisely: the map's real
  accessible names live on the 51 `<path>` elements, not the caption, so this is a
  case where the caption is decorative *by design* and the architecture happens to
  make an unrelated bug harmless to him even though it's live for a sighted,
  Spanish-reading user.
- **This round's actual finding: the one place tone becomes literal text is hidden
  from him, and it's exactly the mechanism both new features lean on.** The
  demeanor meter renders `_demWord` — `"calm"/"firm"/"tense"` (`prx_dem_calm` etc,
  `1762`/`2097`) next to the label `${_t.prx_dem_label}` ("Officer's demeanor") —
  but the whole `<div class="prx-dem" aria-hidden="true">` wrapper (`5382`) is
  hidden from assistive tech. Divergent turns' own code comment says the payoff
  needs no new UI *because* "the demeanor meter and bubble colour already re-render
  per beat, so the shift is visible" (`5037–5038`) — the entire feedback loop the
  feature was built around is designed on the assumption that "visible" is enough.
  It isn't, for him, and tone atmosphere just added a second and third visual-only
  channel (bubble color, card glow) stacked on the same gap rather than a
  correction to it.
- **Would he play it?** Conditional, functionally an audit — unchanged pattern.
  **Would he want it fixed before he'd call the module accessible?** Yes,
  specifically the demeanor label — it's the cheapest fix on this list (drop one
  `aria-hidden` attribute, the text is already computed) and the one that would
  restore the actual feedback signal both new features were built to deliver.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **Divergent turns is the best-designed reward loop this product has shipped for
  her specific behavior pattern.** She's the panel's proven close reader and repeat
  player — a good answer on Irritated Officer now visibly cools the room (border
  glow softens, next line drawn from the calm pool) rather than the deck simply
  moving on. That's a genuine, verified positive: `prxDiverge()` reads `prCurTier`
  *before* it's cleared (`5053`'s own comment states the ordering constraint
  explicitly), so the reward is causally tied to the answer she just gave, not
  cosmetic.
- **Stepper's clickable "done" nodes are a real quality-of-life win for her
  specifically** — she's tracked progress across three focus-group rounds; now she
  can jump straight back to State or Info from Preview without a Back-button hunt
  (`stepper()`, `2711–2737`, `clickable=cls==='done'` at `2725`). No known issue.
- **Would she binge Checkpoint immediately after finishing the traffic ladder, now
  that it's a separate tab with its own card sitting one tap away?** Carried from
  FG07 Part C item 4, not re-derived as new — still an open question about whether
  a removed-button-style nudge stops a completionist, and Checkpoint's tab
  promotion doesn't change the mechanism either way.
- **Redo? Yes. Refer? Yes**, unchanged.

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **The map is a genuine upgrade to the one thing his profile cares about most:**
  it now looks like a real product, not a form. A geographic US map with a
  silhouette-confirmation handoff (`SR.stateCollapse`, `1342–1390`) is a more
  screen-recordable moment than a list of 51 alphabetical buttons ever was — this
  is the first round where "looks half-finished," his and Ana's shared allergy, has
  a concrete counter-example to point at.
- **Divergent turns and tone atmosphere still don't move his calculus** — no score,
  no badge, no share button attaches to any of it, unchanged reasoning from FG07.
- **Redo? Yes. Refer? Yes**, unchanged — nothing regressed, one thing got sharper.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Divergent turns' de-escalation direction matches what he actually teaches.**
  "Handle it right and the officer settles down" is close to his own real-world
  advice — a good answer draws the calm pool on Level 1 (`PRX_DIVERGE[1]`), which
  reads as authentic to him rather than a game mechanic, consistent with how he's
  responded to every other piece of well-judged copy across three prior rounds.
- **His standing condition is unchanged and applies equally to every new feature
  this round shipped:** a named institution behind the product. Not a new finding —
  restated because the condition doesn't get satisfied by feature velocity, only by
  provenance, and three more feature commits landed since FG07 without touching it.
- **Redo? Once. Refer? Still no.** Unchanged.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **A fresh, concrete bilingual bug on the very first screen of the wizard.**
  `smCap()` — the caption that shows a state's name and coverage tag on hover/focus —
  correctly localizes the *cited*-state tag (`cited?_t.s_pri_label:...`) but
  hardcodes the *federal-only* tag as a literal English string: `'federal ✓'`
  (`3633`). Every state that isn't TX/GA/NY, including any state her extended
  family might be driving through, shows English on the map even when `lang==='es'`
  — while the legend two lines below it in the same view (`3077`) correctly reads
  `_t.s_rest_label`, `"Derechos federales ✓"` in Spanish (`2136`). Two adjacent UI
  elements describing the identical coverage tier, one localized and one not, on
  the screen she'd land on first.
- **The divergence bank shipped bilingual from day one — a real, checkable
  contrast with the final-boss scaffold FG07 flagged as English-only.** Every one
  of the 37 `PRX_VAR` entries carries both `en` and `es` text (spot-checked
  `4284–4320`); this feature didn't repeat that gap.
- **Checkpoint's own hedge (`prx_chk_note`, `1699`) is honest** — "not reviewed by
  an immigration attorney" — she'd recognize the honesty the same way FG07's Tony
  did about the migration comment, except this one is user-facing, on the tab she'd
  actually read before deciding whether to trust it for her son.
- **Redo? Yes, conditional on the map bug getting fixed before she'd trust it in
  Spanish.** **Refer? Still no**, unchanged — no institution's name attached yet.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **A new, concrete instance of his standing telemetry concern.** `hubTab(i)`
  fires `ph('sr_hub_module',{module:['traffic','checkpoint','door'][i],lang:lang})`
  (`3707`) — a real `posthog.capture` call — the instant anyone taps the Checkpoint
  tab, before any warn screen, before any content loads, with no consent gate in
  front of it. FG07 flagged that "unscored" never answered what gets logged for the
  final-boss content; this round adds a sharper, narrower instance of the same
  gap: merely *browsing toward* immigration-checkpoint content is now itself a
  distinctly-labeled, unconditional analytics event, separate from anything a
  completed scenario logs.
- **The external CDN dependency for all of this round's new choreography is real
  but degrades safely.** `gsap.min.js` loads from `cdnjs.cloudflare.com` (`975`)
  async, with a 400ms poll before falling back to instant, non-animated transitions
  (`1588–1597`) — a real network call to a third party on every load, but one that
  fails safe rather than white-screening. He'd flag the call, credit the fallback.
- **Redo? Conditional**, same standing condition as FG07 — an answer on what
  `sr_hub_module` is used for and retained how long. **Refer? Maybe**, unchanged.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **Tone atmosphere is a genuine, new capability that fits her described context
  better than anything that existed before it.** Pre-this-round, tone was only
  legible via audio and a small chat-bubble color. Now the *entire card* signals
  escalation through a border glow and (Hard Mode) a scanline sweep — a fully
  silent, dashboard-mounted phone can now communicate "this is getting worse"
  without a sound, which her described environment (a passenger in the back seat)
  specifically needs. Unlike Nia's more ambiguous read above, this is close to a
  clean win for her.
- **The Checkpoint-tab routing mismatch (see Ana, below) is not hypothetical for
  her** — she's the panel's realistic candidate to actually tap that tab
  specifically, mid-shift, worried about a route that runs through a checkpoint.
- **The mute pre-audio gap — this round's actual scoreboard.** Six feature commits
  have shipped since FG06 first ranked closing it as the single highest-leverage
  item (`614a982` through `038cb41`), and none of them touched `ctrls`'
  construction (`4544`, unchanged location and logic). Not re-derived as new — worth
  stating plainly as a running count: three focus-group rounds, six shipped
  features, one untouched top-ranked item.
- **Redo? Yes. Refer? Yes**, unambiguous, unchanged.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, the only real completed funnel

- **The map's legend does the explaining work without requiring interaction** — 
  "Fully cited" vs "Federal rights ✓" (`3077`) reads as a coverage key on sight,
  which matters for a persona whose established pattern is entering analytically
  rather than through a hover-and-discover flow.
- **The stepper's clickable nodes are exactly the transparency his profile wants**
  — but only retroactively: `clickable=cls==='done'` (`2725`) means only already-
  finished steps are jumpable, so it doesn't help him skim ahead before finishing,
  only backtrack after. Worth naming as a boundary, not a flaw — the standard
  breadcrumb contract the code comment cites (`2720–2724`) is the right one; it
  just isn't a table of contents.
- **Checkpoint's three-tab split reads like a sitemap** — Traffic stop / Checkpoint
  / At your door — which is closer to how he already engages the product than any
  prior structure, unprompted validation of the split's stated goal.
- **Redo? Yes. Refer? Yes** — unchanged, still the cleanest funnel on the panel.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, mixed-status household, "products that look half-finished" allergy

- **The map is the clearest direct answer her standing ask has ever gotten.**
  Arizona renders on the map as a plain, uncited state — same fill as every
  non-TX/GA/NY state — and both the legend and (English-only, per Rosa's finding)
  the hover caption frame it as `"Federal rights ✓"`, a checkmark, not a warning.
  `STATES.AZ` doesn't even exist as a keyed entry (`grep` for `AZ:{` inside the
  `STATES` object returns nothing — only `US_STATE_NAMES` names it); it falls
  through to the federal baseline by the design the code comments at `2328–2340`
  describe. This is the first round where her ask — "federal-only states framed by
  what they cover, not what they lack" — is checkable against actual pixels and
  actual strings, not just prose intent, and it holds up.
- **Checkpoint's own tab promotion makes her sharpest allergy fire on the exact
  feature built to prevent it.** The whole stated point of `a6460b3` was that
  Checkpoint "was reading as just another traffic level buried at the end of the
  ladder" (`3277–3281`) — a real UX problem, correctly diagnosed. But tap that
  tab's card as a genuine first-timer and the routing is unchanged: `prPick(el,4)`
  → `prStart(4)` → the `seen` check (`4980`) discards the tapped index and opens
  `practiceIntroOpen()` → the same five `PREP_STEPS` about mounting a phone and
  turning on a dome light (`2805`, unchanged content, confirmed present at this
  commit). A tab that visually promises "a different encounter, different rules"
  (`hub_ck_note`, `1679`) hands a first-timer traffic-stop-flavored onboarding the
  instant they act on that promise. This is not FG06's routing bug re-flagged —
  it's the discovery that promoting Checkpoint to its own tab raised the stakes on
  a bug that already existed, because the tab now makes a claim the routing
  doesn't honor.
- **Redo? Yes, conditional on the Checkpoint routing actually matching its own
  tab's promise.** **Refer? Leaning yes** — the map is the first feature that's
  made her want to, though her standing "half-finished" allergy isn't fully quiet
  yet.

---

## 2. Golden standard — exactly 5, ranked, each tied to evidence above

### 1. Un-hide the demeanor label — the one text version of tone both new features assume exists

**Evidence.** `#practiceOverlay`'s `.prx-dem` wrapper is `aria-hidden="true"`
(`5382`) around a computed, human-readable string (`_demWord`, `5379`:
`{calm:'calm',curt:'firm',hostile:'tense'}[d.tone]`, both languages present at
`1762`/`2097`). Divergent turns' own inline comment explicitly designs around this
text existing as the feedback mechanism ("the demeanor meter... already re-renders
per beat, so the shift is visible without any new UI," `5037–5038`); tone
atmosphere (`a308907`) then stacked two more visual-only channels — bubble color
and card border-glow — on the identical gap rather than closing it. Omar's reading
above is the direct persona hit; this is the cheapest fix on the list (one
attribute) and the one that restores a feedback loop two separate commits were
each individually built to deliver.

### 2. Make Checkpoint's routing match the promise its own new tab makes

**Evidence.** `a6460b3`'s stated purpose — stop Checkpoint reading as "just another
traffic level" (`3277–3281`) — is real and correctly diagnosed, but `prStart()`'s
first-timer branch (`4980–4981`) still discards which card was tapped and always
opens the traffic-stop-flavored `PREP_STEPS` (`2805`). Ana's reaction above is the
direct hit: a tab built specifically to say "this is different" hands a first-timer
identical, irrelevant onboarding the moment they act on that claim. Not a
re-flagged FG06 finding — the tab split is what raises this bug's stakes, and it
shipped since FG06/FG07 without the routing being revisited.

### 3. Decide whether tone atmosphere needs its own visibility control, independent of mute

**Evidence.** `atmCard.className` (`5428`) and the bubble-color `moodC` (`5383`)
are both computed directly from `d.tone`, with zero reference to `prxMuted`
anywhere in the file (grepped every `prxMuted` use site: `4708`, `4737`, mute
toggle logic only). Mute silences audio; it does not flatten the visual escalation
signal. Nia's and Keisha's reactions above land on opposite sides of the same fact
— a mute-proof visual channel is a genuine win for Keisha's discretion use case and
an open, unexamined question for Nia's startle-sensitivity one. Nobody has asked
which reading the product should optimize for, and the two new features (divergent
turns' de-escalation payoff, tone atmosphere's glow) both depend on this channel
staying exactly as visible as it currently is.

### 4. Fix the hardcoded-English coverage tag on the state map's hover caption

**Evidence.** `smCap()` (`3628–3634`): the cited-state branch correctly reads
`_t.s_pri_label`; the federal-only branch is a literal string, `'federal ✓'`
(`3633`), with no Spanish counterpart — while the legend two lines away in the same
view (`3077`) correctly localizes the identical concept via `_t.s_rest_label`. This
is the state-picker screen, first in the wizard, and Rosa's reaction above is the
direct hit. Cheap, mechanical fix: swap the literal string for `_t.s_rest_label`.

### 5. Close the mute pre-audio gap before shipping a fourth feature that doesn't touch it

**Evidence, restated plainly rather than re-derived.** Three focus-group rounds
(FG06, FG07, this one) have now ranked this the single highest-leverage open item.
Six feature commits (`614a982` through `038cb41`) have shipped since FG06 first
named it, none touching `ctrls`' construction site (`4544`) or the synchronous
`practiceRender();prxSpeak()` pairing (`practiceOpen`, unchanged location and
logic). Keisha's reaction above updates the count, not the finding. Ranked 5th
here specifically because it is carried, not because it matters less than items
1–4 — it stays on every version of this list until it's fixed.

---

## 3. What must change in the practice MODULES specifically

Scoped to the practice engine and levels — not the wizard, not the map, not
marketing copy.

- **Un-hide `.prx-dem`** (golden standard item 1) — module-engine fix, one
  attribute, restores the feedback loop divergent turns and tone atmosphere both
  assume is already accessible.
- **Author a hostile variant for `PRX_VAR[7]`** (the arrest beat) so Level 2's
  escalation leg stops being structurally inert. The code already discloses this
  plainly — "kept because the logic is tone-pool-driven and lights up the day the
  bank grows" (`5030–5032`) — this is a content-authoring task the engine is
  already built to consume the moment it exists, not an engineering change.
- **Give divergence a screen-reader-audible transition, not just an updated
  snapshot.** Even with item 1 fixed (demeanor label un-hidden), a screen reader
  only reads the label on next render — there's no `aria-live` region anywhere
  in `practiceRender()`'s demeanor/atmosphere output announcing that the officer's
  tone *changed* between beats specifically because of the player's last answer.
  The sighted signal (color shift, glow) is transitional and immediate; the
  non-visual signal, once fixed, would still be a static re-read. Worth a small
  `aria-live="polite"` region carrying one line ("The officer's tone eased" /
  "sharpened") the moment `prxDiverge()` actually swaps a beat.
- **Give Checkpoint (index 4) its own short onboarding path, or explicitly route
  first-timers through the generic one on purpose.** Golden standard item 2 is a
  routing bug; the module-level fix is either a Checkpoint-specific two-line intro
  (a fixed federal checkpoint isn't a traffic stop; skip the phone-mount/dome-light
  prep entirely) or, if the generic onboarding is deliberately shared across all
  entry points, say so in a code comment the way the migration and consent logic
  already do — right now it reads as an oversight, not a decision.
- **`prWarnOk` still doesn't persist across sessions** (carried from FG06 item 4,
  not new) — worth folding in here because Checkpoint's warn screen (`prx_warn6`)
  is now reachable via its own dedicated tab, meaning a returning user who has
  already cleared Checkpoint once will see the full immigration-checkpoint warning
  again every single visit to that tab, a decision that was already flagged as
  possibly unintentional and still hasn't been made on purpose either way.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06/FG07

**BS-1. Can a first-time player's very first officer line already read as curt or
hostile purely from the initial random deal, before divergence has anything to
react to?** `prxBuildDeck()` picks each beat's opening tone randomly from the
level's tone pool (`4568–4572`) before any answer exists. Divergent turns only
adjusts *subsequent* beats. Nobody has asked whether a first beat that happens to
land curt on Level 1 — a level whose own promised experience is calm — undermines
the "de-escalation is earned" narrative before the mechanic has had a single
chance to run.

**BS-2. Does a mistake-triggered hostile reply on Level 2 feel like a fair
consequence of the player's own answer, or like a trap sprung after a consent
screen that only described the level's ceiling?** The warn screen (`prx_warn4`)
frames what Level 2 *can* contain; it does not say "one wrong keyword mid-level can
draw a harsher reply than the level's opening tone." Nobody has user-tested whether
the gap between level-level consent and beat-level consequence reads as fair play
or as a bait-and-switch, especially for a player who is not the panel's most
practiced.

**BS-3. Is merely tapping the Checkpoint tab now its own distinguishable,
unconsented telemetry signal, separate from anything a completed scenario logs?**
`hubTab(1)` fires `sr_hub_module:{module:'checkpoint'}` (`3707`) before any content
loads and before any warn screen. Luis's reaction above names the general shape;
the sharper, unasked question is whether "a device merely browsed toward
immigration-checkpoint content" is itself a signal anyone has reasoned about
retaining, sharing, or not sharing.

**BS-4. What happens to an open practice overlay if a user backs out through the
new travelling state pill or a clickable stepper node mid-scenario?** Both new nav
affordances (`eyebrow()`'s pill, `2749–2764`; `stepper()`'s clickable "done" nodes,
`2711–2737`) call `goM()`, which is wizard-step navigation. Neither shipped
alongside, or was tested against, a check for whether `#practiceOverlay` is
currently open. These are two independently-shipped features from different weeks
that have never been exercised against each other.

**BS-5. Is a robotic TTS fallback voice mid-escalation a good failure mode for
this specific content, or does it undercut the realism right when it matters
most?** This round confirmed the divergence bank is 100% audio-complete today
(zero missing files across 37 variants × 2 languages × 2 genders) — but the
fallback path (`prxSpeakTTS`, gated correctly per FG07's own mute-guard fix) exists
precisely for the day a new variant ships without its recording yet. Nobody has
asked whether a suddenly-synthetic voice appearing specifically on a *hostile*
divergent turn reads as an acceptable degrade or as an immersion-breaking tell at
the exact moment the feature is trying hardest to land.

**BS-6. Now that three separate GSAP-choreographed sequences ship in the same
session (map entrance, state collapse, stepper fill), has anyone measured whether
they compound into a single first-load moment that reads as slower or busier than
any one of them tested in isolation?** Each was verified individually across three
different commits; nobody has run the combined first-visit sequence end-to-end and
timed it as one experience.

---

## 5. Group read

**Would-play verdict: 4 yes (Dana, Tony–once, Keisha, Wes) / 4 conditional (Omar,
Rosa, Luis, Ana) / 1 no (Nia).** Marcus sits outside the practice-engine question entirely (his
verdict is about the wizard/map, not the modules this round's subject centers on)
— not counted either way, consistent with how FG07 handled personas whose primary
reaction fell outside the round's core surface.

**Would-want-it-to-exist verdict: unanimous, same pattern as every prior round.**
Even Nia, who never reaches any of this round's subject, would want the demeanor
label un-hidden and the tone-atmosphere/mute question answered *for the version of
her that might one day get past the headline* — the same conditional-yes shape
FG07 first established for her on the final-boss module.

**Biggest objection, by theme:** two independent features (Checkpoint's tab split,
divergent turns' visual-only feedback) each shipped complete and well-designed on
their own terms, and each one's completeness is what exposed a pre-existing gap
more sharply than before — the tab split didn't fix the routing bug, it raised its
stakes; tone atmosphere didn't create the demeanor-label accessibility gap, it
stacked two more channels on top of it. The throughline is the same shape FG07
named: real commitments, well executed, without anyone checking whether the
surface one layer away from the new work still agrees with it.

**Highest-leverage fix, this round's subject specifically:** golden standard item
1 — un-hiding `.prx-dem`. One attribute, and it's the single fix that would have
made both of this round's headline features (divergent turns, tone atmosphere)
accessible to the exact channel their own design comments assume is sufficient.

**Highest-leverage fix, across all four rounds this loop has now run:** unchanged
from FG06 and FG07 — the universal pre-exposure mute gap. Four rounds, six feature
commits since it was first ranked, zero of them touching it. This report will not
be the last one to say so if the pattern holds.

**Who this still isn't for:** Nia, same reason as every prior round — and this
round adds a genuinely new, unresolved wrinkle to her case rather than a repeat of
the old one: even in the counterfactual where she gets past the headline and finds
mute, the room itself can still visibly escalate at her. Nobody has decided whether
that's acceptable redundancy or a second gap wearing the first one's clothes.
