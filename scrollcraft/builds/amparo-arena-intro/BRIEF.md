# BRIEF — Amparo scroll intro ("The Line")

Self-authored for the interview mechanics, but the scope, style, structure and
placement forks below were answered live by Michael via AskUserQuestion before
any generation — not inferred. Vibe/journey/energy detail is derived directly
from Amparo's own shipped copy and product (index.html, arena/), since the
brand already exists and speaks for itself; nothing here is invented.

## Source prompt vs. what actually ships

The user pasted a 10-section "Grand Master Prompt" (swarm roleplay, DB schema,
50-state legal engine, evidence vault, marketing cron, link auditor, a black-bg
matte-clay-stickman scroll narrative). Confirmed live scope for this build:

- **Sections 2 + 4 only** (hero CTA / thumb-zone, cinematic scroll cards).
  Everything else (Convex `leads` table, `StateStatute` engine changes,
  evidence vault, decompression UI, marketing automation, Python link
  auditor) stays a backlog item, explicitly out of scope this session.
- **Reject the black-bg/matte-clay-stickman world.** It's scrollcraft's own
  banned default (`worlds.md`: clay diorama banned) and it doesn't match the
  live Amparo brand (navy `#1B2A4A`, gold `#E8B84B`, cream `#FAF6EE`, real
  shipped splash/wordmark — no photography anywhere on the site). Michael
  confirmed: stay in brand.
- **Placement:** `index.html` is not a scrollable marketing page — it's a
  fixed-card wizard app (step 0 = a single-viewport welcome card with a gold
  CTA already wired to `arena/`). The 3 scroll cards become a new scroll
  intro *above* that card, on the same page. The wizard card and its existing
  `arena/` CTA are untouched.
- **World type:** distinct scenes (not one continuous worldflight) — matches
  the source prompt's 3 separate concepts as 3 cuts.

## 1. Vibe

Words: **calm authority, rehearsed, exact.** Not the source prompt's
horror-noir (gun drawn, door kicked in, predatory eyes) — Amparo's real voice,
lifted straight from its own shipped copy:

> "Practice the stop before it happens." / "Amparo rehearses a police stop
> with you — out loud, with a real officer's lines — until the words come
> without thinking."

References: the product itself. Navy/gold/cream, a shield-badge wordmark, a
disclaimer that reads like a lawyer wrote it, not a growth hacker.

## 2. The scroll journey (their words → the product's own)

1. Recognition — the ordinary, universal beat of being pulled over
2. Tension — the real risk isn't the officer, it's your own mind going blank
3. Turn — a rehearsed line comes out steady, because it was practiced

Then straight into the existing welcome card (title: "Practice the stop
before it happens.") and its gold CTA into `arena/`.

## 3. Energy curve

Quiet → tightening → release. No noir spike, no siren-red flash — the whole
point of the brand is composure under pressure, so the page should perform
composure, not panic.

## 4. Feeling curve

```
1  Recognition   the ordinary dread of lights in the mirror, named plainly
2  Tension        the real danger is your own blank mind, not the badge
3  Relief/resolve a rehearsed line lands steady — the fixed caption completes
```

Two acts, not three, would flatten this (recognition and tension are
adjacent but distinct: one is external/familiar, the other turns it inward
onto the visitor). Kept short — this is a 3-beat prelude to a working app,
not the whole page's argument.

## 5. The peak

**Act 3 — "Relief/resolve."** The sentence a visitor would say to a friend:

> "The scroll bar at the bottom kept building the exact sentence I'd say to
> a cop — and it finished right as I hit the part of the page that says
> 'practice this.'"

Act 3 gets the largest span, the quietest act (2) sits right before it as
the silence, and its cue holds (feeds straight into the welcome card below,
no fade to empty).

## 6. Signature move — "The Line"

A thin caption bar, fixed at the bottom edge, present across all 3 acts
(persistent — not scoped to one act). It accumulates, word by word, tied
directly to scroll position (not time, not a kit `kinetic` stagger), the
real line Amparo's own arena rehearses — verified in `arena/index.html`,
where the app itself calls it "those nine words":

> "I choose to remain silent. I want a lawyer."

By the time the visitor reaches the end of act 3, the sentence sits complete
in the bar — scrolling the page *is* saying the line, before they've even
opened the wizard. It's not a kit device: not `kinetic` (that staggers by
opacity/transform on a fixed timeline per act, this accumulates letter-exact
against page-wide scroll and persists across three separate acts), not a
`count` (no number), not a trace rail with markers (no waypoints — it's one
continuous phrase, not a log). It is the product's entire selling point —
rehearsing the exact words — made into the one interaction on the page.

## 7. Range

Not brutalist, not maximalist. **Premium-minimal, but in Amparo's own
palette**, not the generic dark-canvas-one-accent default: navy canvas,
cream ink, gold accent, one hairline gold rule as the only ornament. Earned
because the brand already reads this way sitewide — a chosen continuation of
the existing brand, not a decorative default reached for because nobody
decided.

## 8. Assets already owned

No photography, no footage — confirmed (no `KIE_AI_API_KEY` set, and
photoreal imagery of an officer/weapon is wrong for this brand's tone
regardless of budget). Amparo's only real visual asset is its wordmark/badge
SVG (already in `index.html`, inlined) and its type. **World: typographic
poster** (scrollcraft grammar 2.5) — type as the imagery, which is also the
one grammar that fits a brand whose actual product is "the exact sentence."

## Authored silence

The gap between act 1's cue closing and act 2's opening — about 10% of act
2's span — is deliberate: the page holds on the navy ground with nothing
moving while "The Line" bar sits at its act-1 word count, so the tension
beat has something to arrive into rather than continuing a cue that was
already running.
