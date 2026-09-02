# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| amparo-arena-intro | Typographic poster | None — no persistent bar; hands off into the existing wizard's own header | `pin` + kinetic-line hero, greet cue, centred, no media | 3 acts, ~4.5vh: `pin`(kinetic) → `flow`(reveal wipe) → `pin`(kinetic + scale-from-`--sc-p`, the peak). Short by design: a prelude feeding an existing product, not a full page | Peak act's single-value cue holds, no fade; hands off directly into the pre-existing welcome card below (cream ground, gold CTA) — not a scrollcraft-authored close | "The Line": fixed caption bar accumulates, word-by-word off summed `--sc-p` across all 3 acts, the real line the product's own Arena calls "those nine words" ("I choose to remain silent. I want a lawyer." / ES equivalent) | Type-only, no photography/generated assets (no `KIE_AI_API_KEY` spend) — Amparo's real navy/gold/cream brand, not a generated world | index.html, embedded above an existing multi-step app, not a full page |
| new-homepage-cine-intro | Filmic-leaning (photographic pin acts, no worldflight) | Same fixed translucent nav as the rest of `new/index.html` — floats over the dark intro unmodified, not intro-specific chrome | `pin` + full-bleed generated photo (seedream/5-pro, 9:16 native) + bottom-band scrim + kinetic-line greet-and-hold headline | 3 acts, ~5.8vh: `pin`(photo+kinetic) → `pin`(photo+kinetic) → `pin`(photo+kinetic, the peak, largest span). All three same device family — the photographic-hero grammar leans on `pin`/`kinetic`/`drift` and doesn't have a second family to reach for the way the typographic build used `flow`; noted as a deliberate deviation from the variety rule, not an oversight | Peak act's single-value cue holds; hard-cuts (no drift) from the intro's dark navy ground into `new/index.html`'s own cream hero immediately below — same "hand off into existing chrome" pattern as the first build | Same "The Line" bar, reused deliberately (see below) | Photographic — 3 generated stills (driver's hands on wheel / rearview mirror with police lights / hand holding glovebox card), one reused style preamble, no faces or weapons by design | `new/index.html`, above its own hero, not a full page |

| amparo-home-cutlist | Rhythmic cutlist | Loud fixed full-width glass bar: wordmark, links, EN/ES, a "Your six cards" deck trigger and the CTA at the wordmark's weight; the bar is where the peak lives | One-screen hard cut, no greet-and-hold: the mirror still full-bleed, h1 top-left over the dark headliner, gone in 0.9vh | 13 short unpinned `flow` cuts + a compressed FAQ, ~13.5vh, nothing over 2vh except the peak (2.0) with an authored empty screen (0.7) before it; per-section opaque navy grounds, no drift; `reveal` on three cuts (one `iris`, on the map), late sub-line cues so no cut goes static | Abrupt full-bleed inversion to a gold ground with navy ink, the two asks, colophon inside the act, single-value cue that holds | "The Deal": the six real printed cards as HTML faces, fanned out of the fixed bar by page scroll across the peak act, flickable (pointer capture, velocity handoff, spring-back), last card is the real link to /pack, re-openable from the bar anywhere on the page; publishes `data-sc-verify-state` | Photographic, low-key cinematic graded to the navy family: three existing portrait stills (mirror, hands, card in hand) plus one generated glovebox plate (seedream, one preamble) with a right-weighted 9:16 crop for phones; card faces are markup | `new/index.html`, served at `/` via rewrite; the whole homepage, not a prelude |

*(First real build. Two things future builds on this project should avoid
repeating without a reason: typographic-poster-as-default, and "no nav chrome,
hand off into existing UI" as the close pattern — both were earned by this
specific brief (no photo budget, an existing product below the fold), not
picked as a house style.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Typographic poster grammar (amparo-arena-intro) — earned by no photo/video
  budget and a brand whose whole product is one exact sentence. Don't reach
  for it by default next time; check whether the next brief actually shares
  that constraint.
- "Hand off into pre-existing page chrome" as a close pattern (amparo-arena-intro)
  — only applies when scrollcraft is a prelude bolted onto an existing product,
  not building the whole page.
- "The Line" signature move (amparo-arena-intro) — a fixed accumulating-caption
  bar driven by summed act progress. Taken.
- Rhythmic cutlist grammar (amparo-home-cutlist) — earned by a "premium
  animation site" brief on a product whose voice is composure: fast cuts of
  restrained material, scroll-driven so nothing moves unless the hand does.
- Peak held in the fixed chrome layer (amparo-home-cutlist) — the loud bar
  hosts the choreography while short unpinned cuts pass underneath. This is the
  cutlist's documented answer to its own pin ban; do not reach for it on a
  grammar that allows `pin`.
- Gold-ground inversion as the close (amparo-home-cutlist) — the page's one
  light ground, navy ink, the asks and the colophon inside the act.
- "The Deal" signature move (amparo-home-cutlist) — real product cards as HTML
  faces fanned out of the header by page scroll, flickable, last card is the
  ask. Taken.
- The 13-cuts-at-~13.5vh band (amparo-home-cutlist).
- **amparo-home-cutlist v2 (2026-09-02, same row, revised after the owner's
  feedback; the row above describes what first shipped).** Shape now: 13
  unpinned cuts + FAQ at ~12.6vh; hero is a full-bleed clip SCRUBBED inside an
  unpinned cut (`data-sc-scrub` on a flow act, poster held under reduced
  motion), then a type claim, then three ENCOUNTER cuts (traffic stop as a
  30-frame `data-sc-sequence` canvas, checkpoint as a still wiped in, the door
  as type on the deepest ground with a gold rule and the Arena's warrant
  exchange), a WHAT TO SAY cut (the pack's five rights lines, staggered, over
  the card-in-hand clip scrubbing: the quiet act before the peak, carrying
  content instead of silence), the deck peak, a LAWYER cut (card 3, real
  lifeline channels for TX/GA/NY), the map drawing in state by state, then the
  admin cuts and the gold close ("Practice every encounter before it happens").
  Kinetic line assembly on one heading per act. Two scrubs, one sequence, one
  wipe, one chrome peak: five device families, none adjacent. Motion built from
  the three photographic stills with ffmpeg zoompan/xfade at zero spend and
  encoded with the skill's encode.sh; the hero clip's push-in sits in its
  second half because an unpinned first act starts at p≈0.5 on load. Taken:
  a scrubbed clip and a frame sequence inside UNPINNED cuts as the cutlist's
  answer to "Apple-style motion without pinning".

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
