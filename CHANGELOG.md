# Changelog

Version history for Amparo. Every tag is a rollback point:
```bash
git checkout v2.6.0 -- .        # restore files, keep history
git reset --hard v2.6.0         # discard everything after
```

## v2.16.0 — 2026-08-11

v2.16.0 — "One conversation, not a menu and a chat"

Practice hub redesigned around an eight-role expert panel (wargame 01's game
roles + instructional/psych roles), convened live over NLM against the full
Amparo notebook rather than worked from memory.

**Scenario select** is now a vertical card list — thumbnail, title, one-line
"what happens," tone-accent stripe (green → orange → red, the same escalation
ladder the officer actually walks) — replacing the flat tile grid. Subtitle
tells the user the officer's wording changes every run (`PRX_VAR`'s ~45
variants existed since the divergent-turns work but were never surfaced —
Move 6 from wargame 01).

**During a run**, the tile grid is gone entirely. A compact header (back
chip, level name, score ring) replaces it — officer chat is the whole screen,
the way image-1 of the reference mockup showed it. Previously every run
screen re-rendered the full level grid above the chat, which read as "why am
I seeing all these boxes again."

**Score ring** always shows count *and* denominator ("3/5"), never a bare
count — the exact bug a v2.14.1 fix already covered elsewhere, now guarded
here too. Ring is SVG decoration; the number is the signal, colour is never
the only carrier (game-accessibility catch). Hard mode, checkpoint's unscored
siblings, and the two dark final-scenario tracks (`PRX_UNSCORED`) never
render a ring — a score there would imply the escalation was earned, which
was already the house rule for the debrief screens.

No EDITION bump: presentation-only, zero officer lines or citations touched.

## v2.15.0 — 2026-08-11

v2.15.0 — "The rehearsal room matches the roadside"

Practice overlay goes dark — card, bubbles, choice cards, coach boxes, tabs,
rail, results screen, footer. Palette extends what the recording console and
officer panel already used (gold `#F3D48A`, muted `#8fa0bd`, green
`#4ade80`), not a new scheme. Scoped explicitly to `#practiceOverlay` via
targeted overrides — flipping the global `--navy` var would have made the
selected tab white-on-white, since it does double duty as text AND button
background. Six other overlays sharing `.ab-card`, and the printable pack,
verified to stay light.

Caught in visual testing: `.prx-key` (the model answer's highlighted
phrases) inherited text colour and rendered light-on-light on the dark
card — unreadable, on the exact words the user is there to rehearse. Fixed
with explicit dark ink.

Tone atmosphere (v2.12.1) re-tuned for the dark ground.

## v2.14.1 — 2026-08-11

v2.14.1 — "Five fixes the loop's own agents found"

From the v2.14.0 verification pass (focus group 08, `wargames/12`, blind-spot
audit 2026-08-11):

1. **Score-history mismatch** (pre-existing, worst): `prRun` skips
   crisis-tier beats, `prDeck` doesn't — after any crisis disclosure the
   summary showed the wrong officer line per square and the rail dots the
   wrong colour. Fixed with a parallel `prRunIdx[]` map through all five
   reset sites; verified by triggering a real crisis beat mid-run.
2. **Reduced-motion double-tap** double-fired the practice overlay — and the
   first fix attempt was also wrong (synchronous flag reset; same-tick
   clicks slipped through), caught by re-testing the actual double-click.
3. **Demeanor tone label un-hidden** for screen readers — the only textual
   tone signal, `aria-hidden` right as divergence made tone the feedback.
   Now a polite live region.
4. `smCap()` hardcoded English `'federal ✓'` → uses `_t.s_pending`.
5. Dead duplicate `prxBack()` deleted.

## v2.14.0 — 2026-08-11

v2.14.0 — "The officer reacts to how you answer"

Divergent turns — the reference mockup's core mechanic, its last unbuilt
piece. The deck was dealt once at open; now `prxDiverge()` re-deals the next
beat's variant after each answer, direction capped per level by the consent
design ("escalation is chosen, never sprung"):

- **Level 1:** good answer de-escalates — next line drawn from the calm pool;
  mistake keeps it curt. Hostile stays out (no consent gate on L1).
- **Level 2** (consent-gated): mistake draws hostile, good answer curt. Inert
  today — the arrest beat has no hostile variant — lights up when one is
  authored.
- **Level 0** stays static (promised calm, verified). Levels 3+ fixed tracks.

Selection only: every pickable line is the same static, attorney-reviewable
bank with its own recorded voice. Corpus stays closed and finite; UPL memo
§2.2 discloses the mechanic. No new UI — the demeanor meter already reads
tone per beat, so the officer visibly settling is the feedback.

## v2.13.0 — 2026-08-11

v2.13.0 — "Checkpoint gets its own tab"

A fixed Border Patrol checkpoint is a different encounter from a traffic
stop — different rules, applies in all 50 states (unlike the state-cited
traffic content) — but it was buried as the last card in the traffic ladder.

Hub goes from two tabs to three: **Traffic stop | Checkpoint | At your
door**. Traffic tab keeps the four numbered rungs + the progress bar;
checkpoint tab shows the one card with a context note; door tab unchanged.

Hub-grouping change only — same level, same content, same in-overlay tab
strip.

## v2.12.2 — 2026-08-11

v2.12.2 — "The card says yes before the screen turns"

Hub scenario cards confirm the tap with a green pulse (~260ms) before the
practice overlay covers them — from the reference mockup's row-3 flow. The
overlay used to swallow the tap instantly; the pick never registered.

Cards route through `prPick()`: pulse, then `prStart()` launches. Reduced
motion launches immediately. Busy flag eats double-taps (two `prStart()`
would stack `practiceOpen()`'s spoken line twice). Locked cards keep their
empty onclick.

Every other screen in the mockup is already live — map (v2.11), state pill
(v2.12.0), tone atmosphere (v2.12.1), typed/voice input (long-standing), hub
dashboard (v2.7.0). Paid completion screen (mockup 4x4) NOT built —
contradicts the 10-persona pricing panel.

## v2.12.1 — 2026-08-11

v2.12.1 — "The room feels the tone now"

Practice card gets a tone-atmosphere border glow (amber curt, red hostile),
plus a red vignette + animated scanline for Hard Mode — the beat screen used
to look identical to a calm level while playing it, badge and banner aside.

Border glow via `box-shadow` only, never touches text color. Card is a
stable parent, so setting its className no-ops on same-beat re-renders.
Reset unconditionally before `practiceRender()`'s several early-return
debrief paths, so a debrief never inherits a stale Hard Mode class.

Not built: a ring turn-counter from the reference mockup — the existing
linear demeanor bar already carries that information.

## v2.12.0 — 2026-08-11

v2.12.0 — "The pick travels with you"

The chosen state now stays visible after step 1 instead of vanishing when the
picker collapses. A pill in the eyebrow row on steps 2-5 carries the same
silhouette shown at confirmation, plus abbreviation and full name — tapping
it jumps back to step 1, matching the clickable-stepper contract from
v2.11.0.

Placed opposite the step counter so it reads as carried-over context, not a
competing control. Animates in a beat after the card. Under 380px the full
name drops; silhouette + abbreviation still answer "which state." Reuses
`smShape()`/`SM_BOX` from v2.11.1 — no new geometry.

Not built: the module dashboard from the reference mockup already exists
(step 5, since v2.7.0). Not built: a paid-script completion screen from the
same mockup — contradicts the 10-persona pricing panel (all 10 declined
$3.99, none on price).

## v2.11.1 — 2026-08-11

v2.11.1 — "The map hands off properly now"

**Search-fade regression.** Typing a state name had stopped dimming the rest
of the map. `filterStates()` was tagging non-matches correctly — the failure
was purely visual. The entrance wave used `animation-fill-mode: forwards`,
and a finished animation's held `opacity:1` sits in the animations cascade
layer, which outranks ordinary author rules regardless of specificity. So
`.nomatch{opacity:.1}` could never win, from first paint. The map now drops
the animation class once the wave lands.

**Confirmation shows the state.** The confirmed chip is the state's own
silhouette above ✓ + name — same artwork the map just animated, cropped to
that state's bounding box (all 51 measured once and baked in, no layout pass).

**Handoff is choreographed.** The map→chip transition was a 0.18s cut; now
three beats over ~900ms — pick lifts off the map as the country recedes, the
plate leaves exactly as the DOM swap hides it, silhouette lands before the
name. "Not your state?" reverses it.

Note for future work: the silhouette needs **two** injection points —
`render()` for a session that loads already-collapsed, and the click path
separately, because picking a state only toggles classes and never re-runs
`render()`. Testing via reload alone hides this; the chip is empty on every
real click.

## v2.11.0 — 2026-08-11

v2.11.0 — "A real map, and a stepper that actually steps"

**State picker.** The alphabetical button list is gone; a real geographic US
map is the one way to pick a state now. Public-domain path data (Wikimedia's
Blank US Map), 51 jurisdictions, labels placed at runtime from each shape's
own bounding box. Sliver states (RI, DE, DC, NJ, CT, MA, NH) get their label
pulled outside the polygon and wired as a full click/hover target — for those
states the label *is* the tappable state. Hover writes the name + coverage
tier to a caption bar; TX/GA/NY stay gold; selection retracts to the same
confirmed-chip flow the button list always used.

**Stepper.** The five-dot State/You/Lifelines/Print/Practice stepper's
completed nodes now jump back to that section — same `goM()` every Back
button calls. Current and future steps stay inert (standard breadcrumb
contract). Real buttons, translated `aria-label`s, keyboard parity.

Found in passing: `[hidden]` was a silent no-op on `.linkbtn` app-wide (an
author `display:block` rule beat the UA default). One global rule fixed it
everywhere the attribute is used, not just the map.

`index.html` 458 → 502 KB (the map's path data).

## v2.10.0 — 2026-08-10

v2.10.0 — "Four answers from the only real user, all four closed"

The one real user answered four direct questions about his own session. Every
change here traces to one of them; nothing was invented.

**1 · Print worked, AirPrint didn't announce itself.** He wanted to AirPrint and
never realised the button already does that — `window.print()` opens the OS
dialog where AirPrint lives. Label now names it, both languages.

**2 · Nothing brought him back.** He remembered, and he'd promised feedback. A
personal obligation is not a retention mechanic. Added a downloadable `.ics`
reminder — the only channel that reaches a closed app with no server, account,
or push token. Lands tomorrow evening, because he named privacy as the blocker.
No guilt, no streak.

**3 · The practice CTA got lost.** *"I saw a lot of buttons but while being busy
and distracted I just might not have clicked."* The button was already right; it
arrived at the bottom of a dense screen the moment his task completed. Now
scrolls itself into view.

**4 · Document capture returns.** Useful and liked — what stopped him was doing
it in public. Back as an optional **overlay**, not the wizard step v2.1.0
removed: native OS-camera file input, no `getUserMedia`, ~90 lines instead of
493. Photos persist under their own key (`sr_docs`) so the reminder has
somewhere to land. Printed window card gets pockets back only when photos exist.

The join is the point: not somewhere private → reminder → resume → add them.
Three of the four were placement or labelling defects, not missing features.

Also fixed: `.btn` at `width:100%` overflowing inside flex rows, and
`.docrow .dt` missing `min-width:0` at 320px in Spanish. Both pre-existing.

## v2.9.0 — 2026-08-04

v2.9.0 — "The door has words now — and they stay behind the flag"

The door module (ci 70-75) went from placeholder scaffold to a complete,
testable draft: authored setters, officer lines, response options, coach
lines, and model answers in EN + ES; 24 audio clips in the app's canonical
voices, 24/24 round-trip-verified; hub card, tab, and CSS door badge wired
behind `DOOR_MODULE_ENABLED`.

Officer lines are modeled on phrasing patterns corroborated by a six-video
bodycam research batch (`notebook/amparo-door-raid-research-2026-08-04.md`),
never verbatim from identifiable incidents. The two DV-critical beats are
drafted so neither choice is ever marked a mistake; clinician-review markers
stay.

**The flag stays FALSE.** The flip still requires attorney + DV-clinician
sign-off in the same commit. What changed is what reviewers receive: a
concrete, playable draft instead of a blank page.

> **⚠️ REVERTED — this release's door-module content is no longer in `main`.**
> Pulled at Michael's direction in `df974b7`: the draft paraphrased phrasing
> patterns from the bodycam research rather than using the source clips, which
> was not the approach asked for. The flag was never on and nothing reached
> users. `PRX_DOOR` is back to `TODO_ATTORNEY` / `TODO_DV_CLINICIAN`
> placeholders; the 24 audio clips and `tools/gen_door_voices.py` are gone.
> The research that informed it survives in
> `notebook/amparo-door-raid-research-2026-08-04.md`.
> Recorded here rather than left to mislead a future session.

## v2.8.1 — 2026-08-04

v2.8.1 — "Ten personas said no, and not one said the price"

A synthetic 10-persona panel plus a UI/UX researcher synthesis, run against
the live site, asked about pain points and a hypothetical $3.99 module-script
purchase. All 10 declined — for ten different reasons, none of them price:
payment-trail risk, no institutional backing, content already free elsewhere,
wrong-shaped for the user, incomplete state coverage.

Shipped the two findings buildable without touching legal content: a
fast-path from the state-pick screen straight to the printable pack
(`skipToPack()`), and a reworded federal-only state screen that leads with
what's verified across all 50 states before the cited-vs-federal gap. Same
facts, reordered — EDITION unchanged.

Also drafted a DV clinician engagement memo for the door module (unsent,
alongside the UPL memo).

## v2.8.0 — 2026-08-04

v2.8.0 — "The recorded voices finally play"

**The recorded voices had never played.** `PRX_VAR` and `PRX_HARD` carried no
`id` field, so the deck builder read `undefined` on every variant and the engine
fell through to browser TTS on every level except Checkpoint. `git log -S`
confirms the ids were never written — not lost. All 53 wired, index alignment
verified first.

**Double voice, two independent causes.** `prStart()` called `practiceOpen()`
(which speaks level 0) and then `prxTab()` (which speaks the target level) — two
overlapping lines on every hub card but the first. Separately, a missing clip
fires *both* `onerror` and a `play()` rejection, and each called the TTS
fallback. Both fixed.

**18 new Spanish clips**, generated through Voicebox's local API using native
kokoro Spanish presets. Each was transcribed back and compared to source;
`k30`/`k33` failed across all three Spanish voices and were deleted rather than
shipped — a Border Patrol agent mispronouncing "ciudadanía" is worse than a
correct robotic fallback. `audio/es/` 49 → 58 per voice.

**Built, dark behind flags:** the two final scenarios (levels 5/6) and the door
module (level 7) — decks, locks with the sequential rule, warn branches,
unscored guards, debrief branches, both languages. Every officer line is
`TODO_ATTORNEY`; two door beats are `TODO_DV_CLINICIAN`. `PRX_UNSCORED` and
`PRX_LEVEL_IDS` replace the scattered `i===N` literals that caused the original
score leak.

Nothing user-facing changed. Open: attorney review, DV-clinician review, two
voice performances, `k30`/`k33` Spanish, UPL opinion.

## v2.7.4 — 2026-08-03

v2.7.4 — "Three fixes from the mute-fix loop's own agents"

**Pruned unreachable dialogue + stale comments.** The v2.7.2 level merge left
8 officer lines mathematically unreachable — traced by hand which levels can
select which beat/tone combination, corrected the source agent's count by one
in the process. Fixed two comments still calling the ladder "level 5/level 6"
after the merge changed the numbering. Caught and reversed a self-inflicted
syntax error mid-edit (a premature comment close took the whole script down)
before it ever reached a commit.

**Hard Mode's hub card was leaking a score.** The results screen has always
deliberately shown no score for the swan/unwinnable level; the newer hub card
never got the same guard, so a played Hard Mode showed "🟩 3/3" on the one
screen designed to say nothing scored happened there.

**CRITICAL — the mute button could trigger the sound it exists to stop.**
Muting mid-line paused the in-flight audio, which rejected its own play()
promise, which fell through to the TTS fallback with no mute check — so
tapping mute could make the officer's line speak a second time, unmuted.
Fixed at the single call site; also gated the recorded-answer auto-playback,
same underlying gap.

Design-only, not shipped: a two-scenario "final boss" module — see
`wargames/10-final-boss-module-scaffold.md`. Gated on attorney review, two
voice performances, and the UPL opinion.

## v2.7.3 — 2026-08-03

v2.7.3 — "Loop verification pass, subject: officer-voice mute"

Nothing new shipped in code beyond what v2.7.2 already covered — this tag
marks the state a verification loop (10-persona focus group, module design
review, blind-spot audit) is being run against. Loop subject: the officer-
voice mute shipped in `8ce9639`, persisted, gating both the MP3 and TTS
output paths at the single `prxSpeak()` entry point.

Also backfills three tags that were pushed without a CHANGELOG entry —
`.claude/skills/amparo-loop/` codifies this sequence going forward so that
doesn't happen again.

## v2.7.2 — 2026-08-03

v2.7.2 — "Hard mode absorbs the hard stop; progress becomes visible"

**Level merge.** "The hard stop" and "Hard mode" collapsed into one.
Correcting the record: the unwinnable ending ("you did everything right and
the officer stays hostile anyway") belonged to "The hard stop", not "Hard
mode" as stated earlier in this project. The merge kept Hard mode's beats
because they were the only original late-game content — "The hard stop"
recycled 100% of its beats from levels 1 and 3 — and moved the unwinnable
ending onto them. Ladder is now four numbered rungs plus an unnumbered,
ungated Checkpoint. A version-stamped, idempotent localStorage migration
re-points every returning user's saved progress onto the new indices; the
deleted level's result is dropped, never remapped.

**Module tabs.** Hub now shows [Traffic stop] [At your door], reusing the
segmented control from step 3. The door tab is an honest empty state — not
built, and why: pending attorney review, and because a knock at the door is
frequently a domestic-violence call. Full research in
`notebook/amparo-door-module-research-2026-08-03.md`.

**Progress visibility.** "{n} of 4 done" with a fill bar under the tabs, plus
a green completed-state on cards. Checkpoint deliberately excluded from the
count.

**Also in this line:** mute for the officer voice (persisted, gates both
audio paths), full score fractions instead of a truncated integer, an
aria-label on the state search input.

Open: door module unbuilt by design; UPL opinion still pending.

## v2.7.1 — 2026-08-03

v2.7.1 — "The hub nobody could reach, and the pack that didn't know its own edition"

Fixes for defects introduced or exposed by v2.7.0, all found by a focus
group and a blind-spot audit run against the shipped build.

**Reachability.** The step-5 practice hub had exactly one entry point,
behind printing AND behind having completed zero scenarios — so it vanished
the moment progress existed. Six of ten personas could never reach the
screen the new headline promises. Now reachable from the landing page, from
both post-print branches, and resumable.

**Honesty.** A printed pack never recorded which EDITION it was printed
under, so a content correction never triggered a reprint warning — now
stamped at print and checked. Every first visit reloaded because
`controllerchange` had no existing-controller check, inflating the exact
population the 94.5% drop is measured from. PostHog Surveys was never
disabled and defaulted on — a remotely-injectable modal with input fields,
in a product that promises nothing leaves your phone. Off, with dead-click
capture.

**Settled.** React/Next + Tailwind rebuild rejected on measured evidence.
Cloud TTS rejected; voices stay authoring-time MP3s + on-device speech.

## v2.7.0 — 2026-08-03

v2.7.0 — "Rehearsal is the product"

The through-line of this release: the app kept presenting itself as a pack
generator that also had practice, when practice was always the point.

**Repositioned.** Landing headline now leads with rehearsal ("Practice the
stop before it happens") in both languages. Practice moved from the fourth
of four bullets to the first. New step 5, "Practice", in the stepper and as
a real screen: a hub listing the six existing scenarios with live progress
and lock state.

**Funnel and layout.** Step 3 went from 2449px (3.5 screens) to 667px (1.0
screen): lifelines became a peek-card carousel, then lifelines and scenarios
collapsed into one segmented track. State picker retracts to the picked
state. Print screen: one label covers both outcomes ("Print or save as
PDF"), and the print button demotes to ghost once printed so Practice is the
only gold action.

**Honesty and correctness.** Spanish lifeline names never translated —
affecting ~47 states and the printed pack. The language toggle could
silently no-op. Dialog aria-labels were frozen in English while
`documentElement.lang` was correctly maintained. `document.title` appeared
nowhere in the JS.

Open at this tag: UPL opinion still pending — step 5 promotes the scored
engine in the core funnel, shipped on the operator's explicit decision with
the gate still logged in `wargames/02`.

## v2.6.0 — 2026-08-02

v2.6.0 — "The safety net had a hole, and the boot path never ran"

Two shipped features and four defects that made the product quietly claim more
than it did.

Shipped
- sr_step_viewed: the funnel could see THAT people left, never WHERE. All ~30
  existing sr_* events recorded actions; none recorded a step being seen, so
  "56 saw the picker and left" was indistinguishable from "only 6 rendered it,"
  and v2.5.0's picker fix was unfalsifiable. Fired from render() so a restored
  or deep-linked first paint counts, deduped so re-renders and language toggles
  don't double-count.
- A feedback path for the 95% who leave. usageFeedback already existed but only
  appeared for a returning user who had already printed — the ~5% who convert.
  The new stuck-strip sits quietly on every wizard step: four fixed reasons plus
  the existing mailto. Only a reason slug is ever transmitted. With autocapture
  permanently off for privacy, this is the only possible substitute for
  rage-click data.

Fixed
- restore() was never called at boot. Two call sites: its definition and
  demoExit(). Autosave, resume and the first-visit Spanish auto-detect were all
  dead code — a Spanish-dominant phone landed in English the whole time.
- Session replay ran on steps 0-1 with no masking configured. The scoping
  argument ("those screens are structurally un-recordable") was true when step 1
  was 51 buttons; v2.5.0 added a text input and nobody revisited it. Masking now
  pinned at init.
- The crisis safety net missed the natural spelling of its own trigger: the
  normalizer never stripped apostrophes, so "I can't go on" was not intercepted
  while "I cant go on" was. The phrase list was also duplicated and drifted —
  the typed path missed three phrases the voice path caught, two of them
  Spanish. And a disclosure was scored as a MISS, rendering as a yellow square
  in the results grid and carried into the shareable summary.
- sr_crisis_phrase_shown removed. Clean properties, but the event's existence
  transmitted off-device that a session disclosed suicidal ideation, and at this
  traffic volume it could inform no decision.
- A freeze is no longer answered with escalation. Twelve seconds of silence used
  to re-speak the hostile officer line; it now offers replay and exit at equal
  weight.
- Consent to escalation is per-level. One global boolean meant clearing level 3
  silently consented you to Hard Mode and the checkpoint, and their own warnings
  never displayed.

Docs: UPL attorney engagement memo (sendable), consensus roadmap unioning the
wargame 01 panel with new seats (20 ranked items), focus group 02 (twelve
simulated members, step-by-step).

No legal content changed. EDITION remains 2026-C.

Open at this tag: the six UI/UX fix specs are designed but unapplied; GA still
unreachable from CI; no state attorney-reviewed; Upsolve v. James unresolved for
the scored practice engine.

## v2.5.0 — 2026-08-02

Amparo v2.5.0 — Edition 2026-C

Fixed the actual bounce driver, found by verifying the data rather than
trusting the dashboard number.

PostHog's aggregate bounce metric read ~50%. The real 30-day funnel: 72 people
landed, 4 ever picked a state — a 94.5% drop concentrated on one screen.

Reproduced the cause on a real 375x812 viewport instead of guessing:
- .state-grid carried max-height:52vh + overflow-y:auto — a scrollable box
  nested inside a page that already scrolls. On touch, the gesture is captured
  by the inner box and the screen reads as stuck.
- Texas, one of only three states with real cited statutes, sat alphabetically
  at position 44 of 51 inside that trapped box. NY was 33rd, GA 11th.
- No search across 51 buttons.

Fix:
- Nested scroll removed; the page's own scroll carries the list.
- TX/GA/NY always render first under a "Fully cited" heading; the other 48 sit
  below under "Federal rights". Positions are now 1-3.
- Client-side search filtering by name or abbreviation. Zero network calls —
  nothing typed leaves the page, consistent with the rest of the product.

Deliberately NOT built: geolocation auto-detect. It would require sending
coordinates to a reverse-geocoding API, breaking "nothing you enter leaves your
phone" — the specific promise this audience trusts the product on. Recorded as
an explicit fork for a human decision, not shipped by default.

Also: NotebookLM source documents moved from a session scratchpad into
notebook/ so their paths survive across sessions and stay versioned with the
code. Includes the auth gotchas (nlm needs --cdp-url in a sandboxed shell;
cookie-only import fails without a CSRF token; nlm <= 0.8.6 hardcodes the
retired notebooklm.google.com domain).

Open at this tag
- Georgia still unreachable from CI for the daily statute check.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) unresolved for the scored practice engine.
- The document-capture removal (v2.1.0) now looks wrong: the user wanted the
  feature but needed a private moment for it. The fix is skippable-and-
  resumable, not removal.

## v2.4.0 — 2026-07-31

Amparo v2.4.0 — Edition 2026-C

The daily statute check now actually runs, and cannot lie when it doesn't.

- GitHub Action is live (09:17 UTC daily + manual). Getting it pushed needed
  `gh auth setup-git`: the token had `workflow` scope, but git was configured
  with credential.helper=manager and was authenticating with a different,
  older PAT from Windows Credential Manager.

- Sources moved to public.law for TX and NY. Probed from a real runner rather
  than guessed: FindLaw and Justia 403 GitHub's datacenter IPs every time
  while answering a residential IP normally, which is exactly why local
  testing was misleading. Georgia stays on FindLaw — public.law has no Georgia
  subdomain and every other GA source tested (lawserver, onecle, elaws,
  casetext, legis.ga.gov) 404s, 503s or serves a JS shell. GA is therefore
  only genuinely checked on a local run.

- Fixed a false-assurance bug the first cloud run exposed: with all four
  sources 403ing, the job still wrote lastChecked = today and the site showed
  a green "sources auto-checked daily" badge while nothing had been checked.
  lastChecked now advances only when at least one source is actually reached;
  otherwise the old date carries forward and lastAttempt records the run. No
  date means no badge, because no badge is honest and a date is not.

Verified on the runner: 3 of 4 sources reached, hashes matched, status file
committed and live.

Still open
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) open for the scored practice engine.

## v2.3.0 — 2026-07-31

Amparo v2.3.0 — Edition 2026-C

Documentation release. No user-facing change since v2.2.0.

- CHANGELOG.md, generated from tag annotations, covering v2.0.0 onward.

Generating it exposed four bugs in the changelog-generator skill, fixed at
source: a hardcoded project name from another repo, backticks mangled inside a
here-string, an em dash emitted as mojibake because Windows PowerShell 5.1
reads BOM-less UTF-8 as ANSI, and release notes taken from the commit at each
tag instead of the tag's own annotation. Its SKILL.md also documented a
preserve-manual-entries behaviour that was never implemented; the doc now says
the file is overwritten.

Carried over from v2.2.0, still open
- The GitHub Action that runs the daily statute check is STILL not in the repo.
  The push token lacks `workflow` scope, so .github/workflows/law-watch.yml
  remains local-only and law-status.json does not refresh. The freshness badge
  on the site is therefore frozen at its last manual run.
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.2.0 — 2026-07-31

Amparo v2.2.0 — Edition 2026-C

Analytics correctness and a daily source watch.

- sr_pack_printed now counts one event per print. Android Chrome fires
  beforeprint more than once; production data showed a real user's two events
  686ms apart, so every historical print count was inflated. Debounced 4s so a
  genuine reprint still registers.
- Daily statute source check (tools/law-watch.mjs) plus an honest freshness
  badge. It detects when a source statute page's TEXT changes and flags it for
  a human. It does not claim the law was verified — the site states "sources
  checked" and "attorney review" as two separate facts, because only one of
  them is something a script can do.
- Analytics routed through the ph.amparohq.com reverse proxy.
- Custom 404, focus-group copy fixes on the state picker, micro-interactions.

Known limits
- The GitHub Action that runs the daily check is NOT in the repo yet: the push
  token lacks `workflow` scope. File is at .github/workflows/law-watch.yml and
  must be added separately. Until then law-status.json does not refresh.
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.1.0 — 2026-07-30

Amparo v2.1.0 — Edition 2026-C

- Document-capture step removed entirely (4-step flow: state, you, lifelines,
  print). Drivers already carry their documents; the camera prompt was mid-flow
  friction for the most privacy-sensitive users. 493 lines and 32 functions of
  capture engine deleted with it.
- All 50 states + DC selectable. TX/GA/NY keep cited statutes; the rest show the
  verified federal floor (Mimms, Rodriguez, Berghuis/Salinas, 4th Amendment),
  marked "federal ✓" — no state statute is invented anywhere.
- Custom 404 in the site palette, with a home button and micro-animations.
- Price messaging removed from the state picker, replaced with the on-device
  privacy promise, per focus-group review of the 97% drop-off.
- Micro-interactions throughout, compositor-only, reduced-motion safe.

Known limits: only 3 states attorney-researched; 10 more staged in
research/state-law-matrix.md. No state is attorney-REVIEWED for this edition.
Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.0.0 — 2026-07-29

Amparo v2.0.0 — Edition 2026-C

Installability
- Web app manifest plus icons: the app can now be installed to a home screen.
  This was load-bearing, not polish — iOS evicts storage for non-installed
  sites after roughly 7 days idle, and the product's whole pitch is "set it up
  once, need it months later at the roadside."
- Service worker precaches the manifest and icons so a cold offline start works.

Security and privacy
- vercel.json: CSP, HSTS, nosniff, DENY framing, no-referrer, Permissions-Policy.
- Subresource integrity pinned on the GSAP CDN script.
- Removed a dead "quick exit" that never wiped anything and left captured
  licence photos one Back gesture away via bfcache.
- Session replay scoped in code to the landing and state-picker screens only,
  and permanently latched off from the contacts step onward, so documents, the
  camera and the printed pack are un-recordable by construction.
- PostHog: IP anonymisation on, input masking on, media blocked, console and
  network capture off.

Accessibility
- Escape, focus trap, focus restore and background inert across all overlays.
- Prep drill operable by keyboard (Enter and Space).
- Emergency-contact fields properly labelled; they had been announcing the
  placeholder instead of the question.
- Canvas carry card given real alt text built from the user's own answers.
- Gold-as-text contrast raised from 1.71:1 to 7.24:1.
- Practice voice toggles padded to a 44px hit area.

Content
- Immigration guidance corrected: voluntary departure and stipulated removal
  named explicitly, and the caveat that silence can lengthen a stop rather than
  end it.
- New checkpoint rehearsal level built on settled law — Martinez-Fuerte (1976),
  Ortiz (1975), Brignoni-Ponce (1975), 8 USC 1357, 8 CFR 287.1 — including that
  leaving a checkpoint is a federal felony under 18 USC 758.
- Gated practice levels shown as locked rather than hidden.
- Carry card: a fill-in recall card rendered to a saveable PNG.
- "Practice genuinely lowers your risk" reworded to what the evidence actually
  supports: it lowers how threatening you appear.

Known limits
- Coverage is still TX, GA and NY. research/state-law-matrix.md holds ten more
  states of sourced findings, none of them shippable yet.
- No state is attorney-reviewed for this edition; every badge is dropped.
- Upsolve v. James (2d Cir., 9 Sep 2025) is an open question for the scored
  practice engine and should be reviewed before per-state content widens.

