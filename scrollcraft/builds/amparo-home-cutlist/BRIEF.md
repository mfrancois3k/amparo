# BRIEF: Amparo homepage, "The Deal"

Interviewed 2026-09-02 (Michael, via AskUserQuestion, four questions; the other
four were already answered by the live brand, the existing brief and the asset
inventory, and are recorded below with their source so nothing here is
invented). Not self-authored.

Target: the page served at `amparohq.com/` (file: `new/index.html`, via the
`/ -> /new/index.html` rewrite). This build replaces that page's body and motion.
The app at `/pack` and the Arena at `/arena/` are untouched.

## The eight interview answers

1. **Vibe.** "Premium animation site, like motionsites.ai." References given:
   motionsites.ai (dark, glassy, animated-background gallery) and
   vengenceui verse-cards (a deck fanned from a nav trigger, flick to deal).
   Chosen world when the two conflicted with the cream brand brief:
   **"Go dark like motionsites."** Deep navy the brand already owns, glass
   surfaces, gold as the only warm accent, cream for type. Not a black template.
2. **The scroll journey, in his words.** Not re-asked: the page's sections and
   their order are his, shipped and live (arena, how, what, states, privacy,
   bilingual, orgs, share, faq, final). The journey below keeps that order and
   gives each its own cut.
3. **Energy curve.** Not re-asked: the existing brief (amparo-arena-intro)
   states it as "quiet, tightening, release; perform composure, not panic."
   Held. A cutlist is scroll-driven, so nothing moves unless the hand moves:
   fast cuts of restrained material read as precision, which is the product
   ("the words come without thinking"), not as panic.
4. **Feeling, stage by stage, and the one moment.** Curve below. The one moment:
   **"Yes, the six cards fanning out."**
5. **One thing no site does.** The product is six printed cards. The six real
   cards fan out of the header as a deck you can flick through. Nobody else's
   site can do this because nobody else's product is these cards.
6. **Range.** Dark premium, by his choice of world. Not premium-minimal by
   default: the bar is loud, the cuts are fast, the accent is gold not grey.
7. **Structure.** **"Distinct scenes, chaptered."** Not one continuous world.
8. **Assets.** **"Generate what's needed, I'll set KIE_AI_API_KEY."** Key not
   yet set at time of writing. On disk: three generated stills from the cine
   intro (hands on wheel, rearview mirror with lights, hand holding card, plus
   their end frames), two card-scenario photos (traffic stop, checkpoint). No
   photo of the printed cards exists. The card faces will be real HTML built
   from the pack content, not pictures of cards.

## Grammar: rhythmic cutlist

Why the other seven lost, against this interview:

- **Filmic one-shot**: already claimed by `new-homepage-cine-intro`, and it is
  the default the skill exists to refuse.
- **Typographic poster**: claimed by `amparo-arena-intro`.
- **Chaptered editorial**: the paper/editorial family. Forbids a fixed bar, a
  centred hero and media above the fold. Wrong family for a dark-premium brief.
- **Live surface**: bans display type and marketing chrome outright. This is a
  marketing homepage with a two-line thesis; the grammar is unavailable.
- **Continuous world**: he chose distinct scenes, and it needs footage there is
  no key for.
- **Gallery / catalog**: bans kinetic headlines and a single hero claim. The
  page has an argument ("Know your rights is not enough. Practice them.").
  The deck borrows its label-schema discipline; the page does not borrow the
  grammar.
- **Split stage**: tempting, the thesis is genuinely two-sided (know / practice).
  But it demands two live columns for the whole page, and the map, FAQ, orgs
  and share sections have no second side, so it collapses into a zigzag. It
  also bans full-bleed before the resolve, which forbids the deck as a peak.
- **Rhythmic cutlist**: 12 to 20 short hard cuts, no pin, a loud bar. It is the
  exact inverse of the registered filmic build, so the gate clears on all six
  dimensions. And it documents the pattern the peak needs: when the grammar
  bans the device the peak wants, hold the peak in the fixed chrome layer,
  driven from page scroll, outliving the acts underneath. The deck lives in
  the bar. That is also exactly what verse-cards does.

Cutlist bans, honoured: no `pin`, no `dwell` above 0.1, no `spotlight`, no
`magnet`, no `parallax`, no act over 1.4vh, no crossfades, no drift
interpolation (per-section opaque grounds, hard edges).

## Signature move: "The Deal"

The six real printed cards, as real HTML faces built from the pack's own copy
(title, one line, the fold mark, the gold band), sit stacked behind the header
wordmark. At the peak they fan out across the viewport, driven from **page
scroll** across the peak span (not from any act's `--sc-p`, so they outlive the
cuts underneath). Each card lands on its own stagger and its own slight rotation.
On desktop the pointer can flick the front card away (pointer capture, velocity
handoff, the card leaves in the direction it was thrown); on touch, a swipe. The
last card in the hand is the one that says **Just print the cards**, and it is a
real link to `/pack`. After the peak the deck folds back into the bar and stays
there as a persistent trigger ("Your six cards") that re-fans it anywhere on the
page.

Not in the kit. Not a parameter change. Different from "The Line" (a caption bar
accumulating words) in what it is, what drives it, and what it lets the visitor
do.

## Tell-someone sentence

**It's the site where your glovebox cards fan out of the header as you scroll,
and you flick through your own script.**

## The peak

Act 7. What a visitor would say:

> "I scrolled and the six actual cards fanned out of the top bar like a hand of
> cards, I could flick through them, and the last one was the button to print
> them."

It gets the asset budget (the one generated plate: the glovebox, open, dark,
with empty space where the cards will land), the silence before it (act 6, an
empty navy screen, authored), and the most scroll room (the largest span on the
page, 2.2vh of page scroll for the chrome choreography while two short cuts
pass underneath).

## Authored silence

**Act 6 is intentionally empty**: one navy viewport, no cue, no copy. It is the
breath before the deal. The verification pass must not report it as dead
scroll.

## Feeling curve

```
1   Recognition   lights in the mirror, one cut, gone before it settles
2   Provocation   the claim lands hard on navy: Know your rights is not enough.
3   Unease        the mirror, and the line that names your own blank mind
4   Steadiness    a hand holding the card, the reply already steady
5   Alertness     one officer line, one reply, real demo turn, at speed
6   (silence)     an empty navy screen, authored, the breath before
7   Awe           PEAK: six real cards fan out of the bar, and you can flick them
8   Trust         one card fact: your license and insurance, printed in
9   Grounding     the map, and your own state lands gold
10  Safety        nothing leaves your phone, one line, one lock
11  Belonging     the page speaks Spanish for exactly one screen
12  Generosity    print more, give one away, put your name on it
13  Resolve       abrupt: the two asks, full bleed, and it holds
```

No adjacent repeats. Awe needs the silence in 6 in front of it. Resolve is
defined by the generosity before it: the last thing asked is not for the
visitor, it is for the next driver.

Journey beats (what they learn), for the record, and the curve outranks them:
Recognition, Claim, Cost, Turn, Proof, Silence, The cards, Substance, Where you
drive, Privacy, Both languages, Give one away, Decision.

## Score

Fourteen sections (13 acts plus a compressed FAQ flow), no act over 1.3vh, total
about 12.4vh. Deliberately outside the 6-to-7-acts-at-13.6-13.8vh band both
prior builds landed in.

| # | Beat | Device | Span | Ground | Why this one |
|---|---|---|---|---|---|
| 1 | Recognition | `flow` + `in`, still, corner copy | 1.0 | #0B1426 | The existing mirror still, cut before it settles. No greet-and-hold. |
| 2 | Claim | `flow` + `in`, kinetic-free, type only | 1.1 | #101B33 | The thesis in two lines, trail-anchored. Type carries it, nothing behind it. |
| 3 | Cost | `reveal` (up) on the mirror still | 1.2 | #0B1426 | A wipe is a change of state: the same mirror, now it is about you. |
| 4 | Turn | `flow` + `in`, hand-and-card still, lead copy | 1.0 | #16223A | The answer. Short, because the answer is short. |
| 5 | Proof | `flow` + `in` at 40ms stagger, real demo turn | 1.2 | #0B1426 | Real officer line, real reply, from the Arena's own data. Not a fake screen. |
| 6 | Silence | nothing | 0.8 | #070E1C | Authored empty screen. |
| 7 | PEAK | chrome: The Deal, driven from page scroll; underneath, `flow` glovebox plate | 2.2 | #070E1C | The peak lives in the bar. The act under it is the plate the cards land on. |
| 8 | Substance | `reveal` (left) on card face 2, one fact | 1.0 | #101B33 | One card, one line: license and insurance printed in. |
| 9 | Where you drive | `reveal` (iris, the one use) on the real map | 1.3 | #0B1426 | The map already exists. Iris once, on the thing that earns it. |
| 10 | Privacy | `flow` + `in`, one line, one lock glyph | 0.9 | #16223A | Compressed. It is a promise, not a section. |
| 11 | Both languages | `flow` + `in`; the whole screen renders in ES | 1.0 | #101B33 | The bilingual claim demonstrated, not stated. |
| 12 | Give one away | `flow` + `in`, share + orgs merged, two lines | 1.0 | #0B1426 | Two sections that were one idea. |
| 13 | Decision | `flow` + `in`, full-bleed CTA pair, single-value cues, holds | 1.1 | #E8B84B (gold ground, navy ink, the one inversion) | Abrupt. The last cut is the ask. Footer inside it, so nothing trails. |
| FAQ | administrative | plain `flow`, short stagger, between 12 and 13 | 0.6 | #0B1426 | Information, not experience. Compressed per feel.md 5. |

Device families used: `flow`/`in`, `reveal`, pointer (the flick, in the chrome),
and the bespoke chrome choreography. Four. `count` is not used: the page has no
verified figure to count, and the brand forbids invented numbers. No `scrub`,
no `pin`.

Two-stop accent: the page is dark throughout except the close, which inverts
to the gold ground. Gold on navy for twelve acts, navy on gold for the last one.
One hue.

## Type and colour

Faces: the brand's own system stack (the site's CSP is `font-src 'self'`, so a
hosted face would be blocked; the brand has never named a face). Display at
weight 800, `--sc-track-tight`, max ~6rem, stepped to `--sc-t-2xl` under 700px.
Light-on-dark compensation: one step more weight, a touch more tracking, more
leading on body.

Six roles: canvas #0B1426, surface #16223A, ink #FAF6EE, ink-soft #A9B7D4,
accent #E8B84B, accent-ink #1B2A4A. Grain on. Glass surfaces only on the bar
and the cards, where the effect is specific, not as decoration.

## Assets

Reused (existing shoot, one preamble already): `c1-start/end` (hands on wheel),
`c2-start/end` (mirror, lights), `c3-start/end` (hand holding card). Two card
photos (`card1-stop`, `card2-checkpoint`) are not used; they belong to the
scenario cards the Arena section no longer needs at this size.

To generate, once the key is set, under one verbatim preamble (low-key
cinematic, graded to the navy family):

1. **Glovebox plate** for act 7: an open glovebox in a dark car interior at
   night, dashboard glow, large empty space across the centre and upper frame
   where the cards will land. No cards in the shot; the cards are markup.
2. **Dashboard at night** for act 1 alternative, only if the existing mirror
   still does not survive a 1.0vh cut.

Nothing else. Two stills, roughly 56 credits at published rates. The card faces
are HTML. No text in any image.

## Fingerprint gate

Against `amparo-arena-intro`: grammar (cutlist vs typographic poster) differs;
nav (loud full-width bar with deck trigger vs none) differs; hero (one-screen
hard cut, no hold vs pin + kinetic) differs; act shape (13 cuts + flow, ~12.4vh
vs 3 acts ~4.5vh) differs; close (abrupt full-bleed gold CTA cut that holds vs
hand-off into existing card) differs; move (The Deal vs The Line) differs.
**6 of 6.**

Against `new-homepage-cine-intro`: grammar (cutlist vs filmic) differs; nav
(loud bar vs translucent floating) differs; hero (hard cut vs pin + photo +
kinetic greet-and-hold) differs; act shape (13 cuts vs 3 pins ~5.8vh) differs;
close (gold inversion, holds vs hard-cut into cream hero) differs; move (The
Deal vs The Line) differs. **6 of 6.**

Passes.

---

## Build record (appended after Step 5)

### Assets, as shipped
The `c1/c2/c3-*.webp` files the registry describes as the photographic cine
stills are NOT that on disk: they are a clay cartoon set with a speech bubble
baked into the image (an officer at a door, a figure in a car). Someone swapped
them after that build. The photographic portrait originals survive as
`act1-hands`, `act2-mirror`, `act3-card`, and those are what ship: mirror under
"Lights in the mirror" (act 1), hands under "your own mind going blank" (act 3),
the card in hand under "the words come without thinking" (act 4). One plate
generated: the glovebox (seedream/5-pro, low-key cinematic preamble, landscape;
the portrait reroll failed 402, so phones get a right-weighted 9:16 crop).
Spend: one still. Balance after: 0.

### Feel check (cold, one word per act, before rereading the curve)
```
intended        felt
Recognition     recognition
Provocation     provocation
Unease          held breath     (the hands still is warm and calm; the copy carries the unease)
Steadiness      steadiness
Alertness       alertness
(silence)       silence         (reads as intended, not as a failed load)
Awe             awe             (largest change on the sheet, most frames)
Trust           clarity
Grounding       grounding
Safety          safety
Belonging       belonging       (early frames thin; heading cue moved earlier)
Generosity      generosity
Resolve         resolve         (last frames gold with content on them)
```
Two soft misses, neither a repeat of its neighbour, so neither is filler. The
felt words are recorded as felt; the intended curve is not rewritten to match.

### Verification (lab7, the shipping build)
- Desktop 1280, mobile 390x844, reduced motion: **contrast clears 4.5:1 at the
  worst frame on every cue**, all three profiles.
- Dead scroll: only 88-91%, the FAQ, which is not an act and is authored above.
- Flick verified by synthetic pointer sequence (deals on a committed throw,
  springs back on a nudge). Bar trigger, Escape, focus return, ES switch and
  the act-11 language flip verified in the browser. No horizontal overflow at
  375, 1024, 1440.
- Fixes the harness forced: front-loaded cues went static after 60% of each
  cut (late sub-line cues added); the peak's glass was painted on the copy
  element, which the harness hides to measure the ground, so it was never
  measured (three identical 1.87:1 readings) until it became a sibling; act 1's
  copy moved top-left because the mirror still has light flares in its lower
  corners; act 8's card sat under the lead column at 1.02:1 until pushed right.

### Not verified
A real phone. Headless Chrome cannot reproduce iOS touch scrolling, Low Power
Mode or the way `touch-action:none` on the cards interacts with page scroll on
a real device. The flick on touch is authored, not device-tested.

---

## Interview v2 (2026-09-02, after the first ship)

Michael's feedback on the shipped page, in his words, then his answers to the
three questions it raised. Everything below overrides the sections above where
they conflict; nothing above is deleted, because the registry row describes
what shipped.

1. **The photo cuts feel empty on desktop.** "They should be video like how
   Apple does it, multiple pictures so when the user scrolls it feels like a
   seamless move." Reference given: the GSAP ScrollTrigger demos (the
   image-sequence one in particular) and Apple product pages.
2. **The empty section makes no sense.** Act 6's authored silence read to him as
   a blank, not a breath. "It needs to have something, like what to say."
3. **The text should be animated** to carry the story.
4. **It is all police encounters, not traffic stops.** "One of them is
   warrants. Rework the sections regarding this, the viewer would think only
   traffic stops. This is why I had the clay pictures, it shows this
   perfectly." The clay set stays banned as a world (baked-in text, cartoon),
   but its CONTENT (the knock at the door, the warrant) was the point, and the
   page lost it.
5. **Emphasise that one card carries a lawyer to call from your state.** "These
   are key features."
6. Use Mobbin and the GSAP ScrollTrigger demos as references; consider other
   GSAP components.
7. Orchestrate with sub-agents, fanned out.

Answers to the three open questions:
- **Motion source: zero spend.** Motion built from the existing photographic
  stills with ffmpeg (push-ins, dissolves), encoded for scrubbing. The kie key
  is no longer in `~/.env` and the balance is spent; real clips can replace the
  stills-motion later without changing the page structure.
- **Encounter set: traffic stop, checkpoint, at your door.** In that order, per
  the Arena's own scenarios, coming-soon ones labelled as such.
- **Peak: The Deal stays.**

Decisions taken from this:
- The three photo cuts become **frame sequences** scrubbed by scroll, using the
  engine's own `data-sc-sequence` on a `<canvas>` inside an unpinned cut. It
  attaches to any act's progress, so the cutlist's pin ban still holds and no
  GSAP is needed for the sequence itself. GSAP from cdnjs (the CSP allows it)
  is reserved for whatever the research pass shows the engine cannot do.
- Act 6's silence is replaced by a **What to say** beat: the pack's own five
  rights lines, animated line by line (`data-sc-kinetic="lines"`), which is the
  content he asked for and keeps a quiet, type-only act in front of the peak.
- The encounter beats become three cuts (stop, checkpoint, door), each with a
  real officer line and reply from the Arena's data, before the peak.
- A **lawyer beat** follows the deck: the lifelines card, real channel names
  from `STATE_LEGAL_AID`, and the honesty line about numbers that answer.
- Headlines animate with the engine's kinetic lines, one per act at most.

## v2 build record (2026-09-02)

Orchestrated as asked: three fanned-out agents (GSAP/Mobbin research; asset
inventory plus a zero-spend motion feasibility test; copy sourced from the
codebase) and one integrator. Their reports: the research pass found the engine
already ships the Apple pattern (`data-sc-sequence` on a canvas, driven by act
progress) and measured GSAP core + ScrollTrigger at 45.6KB gzipped, 2.5x the
whole vendored engine, to duplicate pin/scrub/reveal it already does; so no
GSAP. The asset pass proved Ken Burns and cross-dissolves from the three
photographic stills survive a 3.2x upscale on night bokeh and that
`encode.sh` accepts them, and recommended scrubbed mp4 over canvas frames
(one request, sub-frame seeking). The copy pass (`copy-v2.md`) found three
places the brief was wrong against the codebase: no printed card carries door
guidance (the lawyer point belongs to card 3, the wallet card), the flagship
states keep their lifelines on `STATES.*` not `STATE_LEGAL_AID`, and the door
scenario is fully written but held behind `HELD_SITS` pending attorney review,
so it is labelled coming soon, not missing.

### Journey, v2
```
1  Recognition   the mirror, scrubbed under the hand (kb-mirror, push in its second half)
2  Claim         the thesis, type, kinetic lines, new sub naming all three encounters
3  Encounter     traffic stop: hands as a 30-frame sequence + "Do you know why I stopped you?"
4  Encounter     checkpoint: the still wiped in + "Citizenship?" (immigration caveat shown)
5  Encounter     at your door: type on the deepest ground, "We have a warrant. Open up." (coming soon)
6  What to say   the five rights lines, staggered, over the card clip scrubbing (the quiet act)
7  PEAK          The Deal
8  Lawyer        card 3: "A real lawyer, in your state." + three real channels
9  Grounding     the map, state by state
10 Safety        privacy
11 Belonging     the other language
12 Generosity    share
   FAQ
13 Resolve       gold, "Practice every encounter before it happens."
```
Spans 0.9 1 1 0.9 0.9 1.1 2 1 1 0.7 0.7 0.6 1 = 12.8vh + FAQ. Outside the
13.6-13.8 band. Two scrubs, one sequence, one wipe, one chrome peak; no device
family twice in a row. The authored silence is gone: act 6 does its job of
being quieter than the peak while carrying the content he asked for.

### Feel check, v2 (cold, one word per act)
```
intended        felt
recognition     recognition
provocation     provocation
unease          unease         (the hands, moving, and "your mind going blank")
alertness       alertness      (floodlights, "Citizenship?")
dread           dread          (a knock; the warrant line on the deepest ground)
steadiness      steadiness     (the card, the five lines arriving one by one)
awe             awe            (largest change on the sheet, most frames)
trust           trust          (a named lawyer channel in your own state)
grounding       grounding
safety          safety
belonging       belonging
generosity      generosity
resolve         resolve        (gold, holds, the new close line)
```
No misses this time; the two soft misses from v1 (held breath, clarity) were on
acts that no longer exist in that form.

### Assets, v2
Zero spend, per his choice. `new/assets/motion/`: `kb-mirror(.mp4/-m.mp4)`
1.8MB/405KB, `kb-card` 2.0MB/474KB (ffmpeg zoompan 1.00 -> 1.12 over 120
frames, landscape from a 16:9 band of the portrait still, portrait full-frame
for phones, both through `encode.sh` desktop/mobile), and `hands/f-01..30.webp`
1.2MB for the canvas sequence. The checkpoint uses the existing
`card2-checkpoint.webp` still. Masters and check frames in `motion/`. The clay
set stays out: a cartoon world in a photographic page, and three of its six
frames carry baked-in text. Upgrade path, unchanged: real image-to-video clips
drop into the same `data-sc-src` slots once the key is restored and topped up,
and a photographic door still is the first thing to generate.

### Verification, v2 (lab7)
Desktop 1280 and 390x844: every cue clears 4.5:1 at its worst frame; the
harness's frozen-clip check reports both scrub clips moving whenever on screen;
dead scroll only at the FAQ, which is not an act. (A first pass at 12.6vh
opened a 2% seam between two 0.6vh entry-reveal cuts; restoring them to 0.7
removed it.) Runtime probe: 13 acts, 2 clips, hero scrubs 2.6 -> 4.2s and the
card 2.4 -> 4.0s under scroll, the sequence canvas DPR-sized and drawing, five
rights lines, three encounters, three lifelines, no console errors, no overflow
at 1440 or 375, the phone deck inside the viewport.

Reduced motion reports the same class of reading as v1 (exact 1:1 on one of
six samples with 4-17:1 means on the rest, now also on the kinetic ramps).
The cause is documented above: no lerp to wait on, so the harness can shoot a
jump-scrolled frame before the engine's next read un-parks a cue. A continuous
scroll never produces that state; the reduced-motion sheet reads legibly
throughout. Animated text was chosen over silencing that artifact.

### Not verified
A real phone, as before: the scrub clips' decode and the sequence canvas on
iOS, Low Power Mode, and touch flicking on the deck are authored, not
device-tested. Two clips at ~2MB each are fetched only when their cut is within
three viewport-heights, not on load.

### v2.1 (2026-09-02, later the same day): routes and the asks
Copy-only pass after the engine refactor brief. Every "Practice a stop" ask
became "Enter The Arena" and points at /rehearse (a Vercel rewrite onto the
Arena; /arena/ still answers). The hero's secondary ask is now "Need
real-world help?" to /aid (rewrite onto new/aid.html, made indexable, its
script path made root-absolute so the rewrite can serve it). The print path
keeps its own buttons in The Deal, the close and the colophon. The price line
follows the ladder that replaced the $3.99 pack. No act, cue, asset or span
changed; the v2 verification stands.

