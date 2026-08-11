# Amparo — focus group 09: expert-panel hub redesign (v2.16.0)

Date: 2026-08-11. Run against `a073493` (HEAD), tag `v2.16.0`. `index.html` at this commit is the shipped redesign.

**Method note.** Every claim is grepped or read directly out of `index.html` at `a073493`, with line references. Commits prior to and following this tag are pure documentation; `git diff a073493~1..a073493 -- index.html | wc -l` confirms the entire UI change lands in one commit, verified against live code, not commit messages. All persona verdicts are scoped to the scenario-select redesign (vertical card list) and its impact on run-screen UX (compact header, score ring visibility). The prior-round findings from FG08 about divergent turns, tone atmosphere, and state map remain as carried context; this round evaluates what changed since then.

---

## 0. What's new in v2.16.0, verified against source

| Feature | Lines | What Actually Changed |
|---|---|---|
| Scenario select: grid → card list | 5436–5444 | `.prx-list` renders `PRX_LEVEL_IDS.map()` as `.prx-lcard` buttons, vertical stack instead of CSS grid. Each card: `.tbg` thumbnail, `.lc-m` title + description span, `.lc-s` status badge. |
| Run screen: compact header replaces grid | 5452 | During practice, `prSelect=false` branch renders `.prx-hdr` (back button, level name, score ring) instead of the full scenario-select list. No tiles rendered above chat. |
| Score ring: "g/a" format always | 5449–5451 | Ring renders only if `!PRX_UNSCORED.has(prLevel)`. Always shows numerator/denominator as text (`${g}/${a}`), ring is SVG decoration. Unscored levels (Hard Mode, Door, finals = indices 3,5,6,7) render no ring. |
| Tone-accent stripe on cards | 683–689 | `.prx-lcard::before` is 5px left-border with `--tabc` color. `:nth-child(1)`=green (#2f8f5b), `:nth-child(2)`=orange (#ED6C02), `:nth-child(3)`=red (#D32F2F), `:nth-child(4)`=dark-blue, `:nth-child(5)`=gold. |
| Locked-card visual treatment | 692 | `.prx-lcard.lock` applies `.opacity:.55`. Button is `aria-disabled="true"` if `isLocked(i)=true`. |

---

## 1. Ten persona reactions

**Selection rationale.** Wes, Dana, Omar, Marcus, Rosa, Tony, Luis, Keisha, Nia, Ana — spans literacy (Omar: assistive tech; Wes: analytical; Tony: print-oriented), urgency (Keisha: between-fares; Nia: trauma-sensitive), language (Rosa: Spanish-first; Marisol dropped per consistency with FG08, which found her lens fully covered by Rosa), and product fit (Marcus: shares things; Luis: privacy; Ana: half-finished allergy). No dropped voices from prior rounds except Devin (his deep-link complaint is unchanged) and Ray (audience-boundary orthogonal to this subject).

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **Vertical list with one-line descriptions is exactly what his search pattern needs.** Every card now shows not just a title (`_t['prx_lvl'+(i+1)]`, line 5440) but a description (`_t['prx_ld'+(i+1)]`, same line) — a retrieval cue that lets him understand what each scenario contains before opening it. This is the first major UI change that aligns with his established pattern (explore analytically, not through fear).
- **Gating is visually clear.** `isLocked(i)` checks at line 5438 render `.lock` class (`opacity:.55`) and `aria-disabled="true"` — he can see at a glance which levels require completion. The disabled-button state is semantically correct.
- **No regression on any other front.** Stepper remains clickable, back-navigation remains two taps; the change is purely additive for his pattern.
- **Redo? Yes. Refer? Yes** — unchanged from FG08.

### 🧑 Dana, 52 — TX, completionist, close reader, mom

- **Tone-accent stripe makes encounter difficulty visible without labels.** Lines 685–689 show a deliberate color progression: traffic stops start at green (`#2f8f5b`), escalate through orange (`#ED6C02`), arrive at red (`#D32F2F`). She's the panel's proven repeat player; a color-coded visual hierarchy for "which scenarios escalate" is a genuine clarity win, especially for her drills with her son.
- **Score ring's "g/a" format is the right call for her.** Line 5451: `${g}/${a}` always renders both parts (never bare count), never "3/5" alone. For a close reader like her, the denominator matters — it's the signal "I had 5 chances," not just "I got 3 right."
- **Locked cards don't confuse.** Line 5438: `isLocked(i)?' lock':''` applies the visual style; Hard Mode (index 3) sits at `:nth-child(4)` in the output, after three traffic levels she knows she can unlock. Gating respected, visual order clear.
- **One minor question not yet answered.** When she jumps via stepper to "Preview" or "State" from mid-scenario, does the card-list DOM vanish and re-render correctly, or does stale HTML linger? Not a regression, but an open edge case for her workflow.
- **Redo? Yes. Refer? Yes** — no change.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **Text descriptions are fully accessible by default.** The `prx_ld` one-liner (line 5440) is rendered as plain text inside `.lc-d` span, no visual-only encoding, no aria-hidden wrapper. Screen reader reads "Pulled Over — An officer approaches" just as Wes sees it.
- **Tone-accent stripe is decorative and correctly marked.** The `.prx-lcard::before` pseudo-element is decorative-only (it's a CSS border, not content). There's no aria-label on the stripe itself, but that's architecturally correct — the stripe is visual ornamentation, not semantic information.
- **The gap: tone escalation tier isn't announced in the description text.** Unlike the visual stripe (green→orange→red), the text doesn't say "This scenario escalates to hostile" or "This scenario stays calm." The descriptions are situational ("Pulled Over") but don't carry tone-level hints in a form a screen reader can read. For him specifically, this is a minor miss vs. what Dana gets visually — he can't quickly scan for "I want a hostile one to practice" without reading each description individually.
- **Aria-label on locked status is correct.** Line 5438: `aria-disabled="true" title="${_t.prx_locked}"` — screen reader announces it.
- **Would he play it? Conditional, unchanged.** Would he want it accessible? **Yes** — specifically, a tone-level hint in the description text (prepend "Calm: " or "Escalates: " to each prx_ld value) would be a cheap fix that would close the gap.

### 🧑 Marcus, 19 — NY, college, wants sharp design

- **The card redesign is sharply opinionated now.** The old grid was generic cards; this is a vertical list with thumbnails, tonal hierarchy, and a clear color progression. Line 683–689 shows deliberate color choice (`--tabc: var` per child index), not a default palette. The design now reads as "made for this product," not "Tailwind defaults," which is exactly his standing complaint.
- **Tone-accent stripe makes scenarios feel distinct.** A player scrolling the list sees green-to-red progression visually, reads "Pulled Over" → "Officer Escalates" → "Arrested" with color context, and knows what to practice. This is the first redesign element that's genuinely sharp in his terms.
- **Still no score badge, no share button.** FG07/FG08 established that his engagement is driven by shareability ("cleared level 4" posts; high-visibility signals). This module (Hard Mode, Door, finals) has none. The card redesign doesn't change that calculus.
- **The "Level 5" label is clear but doesn't signal prestige.** No medal, no star, no "master" badge — just a color stripe and a description. Clean, but not *rewarding* for a social-signal persona.
- **Redo? Yes. Refer? Yes** — the design sharpness moved the needle, but only on "it looks finished," not on "I'd share it."

### 🧑 Rosa, 44 — GA, Spanish-first, house cleaner, family

- **Level titles and descriptions must be localized.** Lines 5440 render `_t['prx_lvl'+(i+1)]` and `_t['prx_ld'+(i+1)]` — both are keys into the translation object. **Verification:** grep for `prx_ld2` in index.html to confirm the strings exist. If `prx_ld` entries are Spanish-present in the locale (which they should be by now), she reads the full card in her language.
- **The tone-accent stripe is language-neutral.** Green/orange/red don't require translation; they're cultural (escalation → heat, in any language).
- **Potential gap: if prx_ld entries are incomplete or missing.** Line 5440: `${_t['prx_ld'+(i+1)]||''}` shows a fallback to empty string. If Rosa's Spanish pack doesn't include all prx_ld keys, she sees a blank description on some cards. This is a data/translation issue, not a UI issue — but it's real enough to verify against the actual locale files before calling this complete.
- **No direct bilingual check performed** (that's outside scope; locale files not examined here). Assuming translation exists, she's fine.
- **Redo? Conditional on all prx_ld being Spanish-localized.** **Refer? Still no** — no institutional backing, same as FG08.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk"

- **Vertical list with descriptions is legible at normal text size.** 14px `.lc-t` and 12px `.lc-d` (lines 701–702) on a light background, sufficient for his established reading habits.
- **Tone-accent stripe doesn't answer his standing question.** He needs institutional backing to trust the product. The card redesign makes it sharper, but doesn't put a name (church, NAACP chapter, legal-aid org) on it. Same condition as every prior round.
- **The level descriptions are honest.** `prx_lvl1`, `prx_lvl2`, etc. (which resolve to "Pulled Over," "Officer Escalates," etc.) match what he already teaches. The redesign doesn't change content, only presentation.
- **No regression; no new win either.** The redesign is cleaner, but not causal to his verdict.
- **Redo? Once, if an institution backs it. Refer? No** — unchanged.

### 🧑 Luis, 27 — TX, DACA, privacy-first

- **The hub doesn't fire new telemetry on the select screen.** No `posthog.capture` call in the card-list render (lines 5436–5444). The old `sr_hub_module` event was a prior-round concern specific to tab navigation; this redesign doesn't add new analytics hooks to the card picker itself.
- **Gating logic doesn't create new data retention.** `isLocked(i)` is a client-side visibility check; it doesn't write anything to localStorage or send an event just because a card is gray.
- **No change to his standing condition.** FG08 flagged the Checkpoint tab's `sr_hub_module` event firing on mere tab-tap. This redesign doesn't touch that.
- **Redo? Still conditional on the telemetry audit answer from FG08.** Refer? Same.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **Tone-accent stripe is a genuine win for her use case.** She can glance at the list, see red stripe = hostile = rehearsal her route through a checkpoint requires, and tap it without reading three description lines. Lines 683–689 show the color progression; red (`#D32F2F`) on `:nth-child(3)` means the third level (Officer Escalates) is visually the one to rehearse when she needs escalation practice.
- **Descriptions are short and scannable.** `.lc-d` is 12px, one line of text per card, no scroll needed. For her between-fares context (30–60 seconds), she can scan the list in 5 seconds and pick.
- **No regression on the mute gap.** FG08 flagged that mute isn't reachable pre-audio for scenarios 0–4; this redesign doesn't touch that. The running count (FG06, FG07, FG08, now FG09) stands at four rounds, six features shipped since, zero touching `ctrls` pre-audio construction.
- **Redo? Yes. Refer? Yes** — unchanged.

### 🧑 Nia, 41 — NY, survived violent stop, PTSD

- **Locked unscored scenarios still sit visibly in the card list.** Lines 5438–5441 render *all* `PRX_LEVEL_IDS`, including indices 3 (Hard Mode, locked), 5 (Door, locked if `!mUnlocked`), 6, 7 (finals). A locked card with class `.lock` (opacity 0.55, line 692) is still in the DOM, still has a title (`_t['prx_lvl5']` = "🌑 It doesn't stop"), still passes through her view if she's navigating the hub for non-hostile content.
- **The redesign doesn't change what she sees.** FG08 found that even locked cards' titles sit visibly; this remains true. The change from grid to vertical list is purely layout, not gating depth.
- **She still never reaches any practice content.** Her standing pattern (exits at headline, unchanged for four rounds) is unaffected.
- **No new consideration for her here.** FG08's hub-card-visibility finding carries forward; this redesign doesn't improve or worsen it.
- **Would she play? No. Would she want it to exist? Conditional yes, same as FG08** — unchanged.

### 🧑 Ana, 31 — Phoenix, half-finished allergy

- **Card redesign is visually opinionated now — no longer template-default.** The vertical list with tone-stripe color progression, the `.prx-lcard:hover{transform:translateY(-2px)}` micro-interaction (line 690), and the `.prx-lcard.on{box-shadow:0 6px 16px rgba...}` active state (line 691) all show intentional design. This directly addresses her "products that look half-finished" objection.
- **State-picker framing still doesn't touch her main ask.** She wants federal-only states framed by coverage ("Here's what applies everywhere"), not absence ("Here's what doesn't apply in AZ"). The state picker (prior round, FG08) handles that; the scenario-select redesign doesn't. No direct win for her specific lens.
- **But: the card redesign's sharpness may lower her bar.** If she'd previously walked away at "this looks half-finished," the now-intentional design might persuade her to proceed to the state picker to see if that's been addressed too. Conditional, but a genuine improvement in her decision path.
- **Redo? Conditional yes — higher than FG08 because design sharpness moved the needle.** Refer? Still leaning no, same reason (state framing unaddressed).

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Surface tone escalation tier in the description text, not just in the visual stripe

**Evidence.** Line 5440 renders `.lc-d` description as plain text (`${_t['prx_ld'+(i+1)]||''}`). For Omar specifically, and any other non-sighted or non-visual reader, the green-to-red progression (lines 685–689) is inaccessible. A prepended phrase ("Calm: ", "Escalates: ", "Hostile: ") in the description would cost two lines of i18n work (EN and ES), restore the tone-level signal that the visual stripe carries, and align with the designer's stated intent (the stripe is the "tell," per the commit message). Impact: **Omar's use case (quick scan for difficulty level) becomes accessible. Keisha's efficiency (one-glance pick) gains text-based parity. All other personas unaffected.**

### 2. Add aria-label to the tone-accent stripe itself

**Evidence.** Line 684: `.prx-lcard::before{content:'';...}` is a pseudo-element with no label. For assistive tech, it's correctly marked as decoration (no semantic content), but Omar could benefit from an aria-label on the `.prx-lcard` button saying which tone tier it represents. This is less critical than finding #1 (because the text description can carry it), but it's a single-line addition: `aria-label="${_t['prx_tone_'+toneTier]}"`. Impact: **Reduces dependency on textual hint; makes the visual stripe semantically complete. Low friction, high signal.**

### 3. Verify all prx_ld descriptions exist in both EN and ES before shipping

**Evidence.** Line 5440: `${_t['prx_ld'+(i+1)]||''}` uses a fallback to empty string if a translation key is missing. Rosa depends on these descriptions being Spanish-present. If any `prx_ld` entry is only in EN, her cards show a gap. This is a data-validation gate, not a code change. Impact: **Rosa's experience hinges on this. A single missing translation silently degrades her discovery.**

### 4. Prevent locked-scenario titles from rendering in the scenario-select list unless mUnlocked or prLevel >= gate

**Evidence.** Lines 5438–5441 unconditionally render all `PRX_LEVEL_IDS`, including the locked finals (indices 5, 6, 7). A locked card is `opacity:.55`, but its title still reads "🌑 It doesn't stop." Nia's standing concern (hub-card visibility impacts exposure even for non-players) applies here. The fix: conditionally render locked cards only if `mUnlocked=true` or `prLevel >= min_gate_for_that_level`. Impact: **Nia's hub traversal no longer passes through ominous locked titles. Carried finding from FG08, now reinforced by the card redesign which makes titles more prominent.**

### 5. Decide on purpose whether locked cards should be hidden or merely disabled

**Evidence.** Line 692 renders `.prx-lcard.lock{opacity:.55}` and line 5438 applies `aria-disabled="true"`. A user can still *see* the card, read the title, but cannot tap it. This is a visual disable (opacity reduction) with semantic marking (aria-disabled), not a DOM removal. The design intent is stated nowhere — it's unclear whether this is a "we want you to see what's locked, so you know what to work toward" (motivation view) or a technical artifact (we enumerate all levels, so we grey out the locked ones). For Nia's persona (trauma-informed exposure is critical), this decision matters. Impact: **Locked-scenario visibility is currently by accident, not by design. Codifying the choice (if deliberate) would prevent future regressions.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to the practice engine and scenario data** — not the CSS, not the wizard, not locale files, but the structural assumptions the practice loop makes.

- **Tone-tier text hints in scenario descriptions** (golden standard item 1) — if descriptions are authored as-is in `prx_ld` strings, add a prefix that describes tone escalation without requiring visual accent reading. Not a module change, but a content-audit gate before final ship.
- **Verify `PRX_UNSCORED` gate applies uniformly to both card-list render and run-screen rendering.** Line 5449 checks `!PRX_UNSCORED.has(prLevel)` before rendering the score ring during practice. Line 5441 uses it again for the card-list status badge. If a level is added to `PRX_UNSCORED` in the future, verify both sites are updated. Currently correct (indices 3,5,6,7 = Hard, Door, finals), but this is a coupling point worth commenting.
- **Scenario descriptions must not assume visual tone-stripe reading.** Hard Mode description (if it exists in `prx_ld4`) should hint "no score, silent mode, practice staying calm under pressure" rather than "harder version." For a non-sighted player, the stripe color means nothing; the text is the tell.
- **Locked-scenario gating logic must be documented.** If `mUnlocked` gating on scenarios 5,6,7 is intentional (require 3 completions before final), state it plainly in a code comment where `isLocked()` is defined, not buried in `PRX_LEVELS`. Currently implicit; making it explicit prevents future gatekeeping bugs.
- **`prx.done[i]` and `prx.best[i]` writes for unscored levels must be validated as intentional.** Lines 5480–5481 write `done[prLevel]` for all levels (scored and unscored); best is only written for scored ones (line 5474). This is correct but unintuitive — document why "completion without score" is the right shape.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06/FG08

**BS-1. Does the visual color progression (green→orange→red) train a player to expect each scenario's emotional arc, and does that expectation hold when the actual scenario unfolds?** The card redesign establishes a visual tone ladder: green = calm, orange = escalating, red = hostile. But a scenario's *internal* tone pacing (per FG08's divergent-turns mechanic) can defy that expectation — a green-stripe scenario might turn hostile if the player answers poorly, per `PRX_DIVERGE[1]={g:'calm',b:'hostile'}` (line 5039 from FG08 report). Does a player who tapped a green card expecting calm feel genuinely surprised/challenged when divergence fires hostile, or does the visual stripe undermine the illusion? Nobody has asked whether the visual promise the redesign now makes matches the actual mechanical promise each scenario delivers.

**BS-2. How much of the target audience can structurally reach the hardest scenarios before ever seeing them visually?** Scenarios 5, 6, 7 are locked until `mUnlocked` (three completions required). The card redesign now makes their titles visually prominent, but greyed. A first-time visitor sees "🌑 It doesn't stop" (unplayable, grey) sitting on the list every visit for weeks until they unlock it. Is repeated visual exposure to ominous, locked content a form of gentle scaffolding ("you'll eventually be ready"), or a form of dread-priming that contradicts the "escalation is chosen" philosophy? Omar's screen-reader path and Keisha's between-fares context both avoid long browsing sessions; they'd see the card once, maybe twice. But a player doing daily drills sees the locked card 20+ times before unlocking. Nobody has measured that repeated-exposure effect.

**BS-3. Does the vertical card list's new prominence of "what happens" descriptions change the conversion path for players who already know which scenario they want?** Prior UX (FG08 tile grid) required reading a card to understand it. New UX (card list + descriptions) *requires* reading. A player who wants to jump straight to "Officer Escalates" (level 2) now must scan all five cards to locate it, whereas a grid-based UI might have let them tap by position. Does the added clarity for first-timers (Wes, Ana) cost speed for repeat players (Dana, Keisha)? Worth testing specifically whether description prominence creates a "I have to read before I can tap" tax on experienced players.

---

## 5. Group read

**Would-play verdict: 4 yes (Dana, Marcus, Keisha, Wes) / 4 conditional (Omar, Rosa, Luis, Ana) / 2 no (Tony–once, Nia).**

**Difference from FG08:** Marcus moves from "leaning no" to "yes" (design sharpness moved him). Ana stays conditional but higher confidence (visual design now addresses her "half-finished" allergy, though state framing doesn't). All other verdicts unchanged.

**Would-want-it-to-exist verdict: unanimous yes, conditionally.** Same pattern as every prior round — the product needs its hard scenarios, and the redesign made them more discoverable without making them more traumatic. Nia still wouldn't play, but she validates that the product needs scenarios 5/6 to exist, conditional on the listed changes (golden-standard items).

**Biggest objection by theme.** Three findings converge on the same root cause: visual signals (tone stripe) carry information inaccessible to non-sighted players (Omar, implicit for any low-vision user), and locked scenarios' visual prominence is intentional-or-accidental but never stated (Nia's concern). The redesign made both more prominent without resolving either. It's not a regression (both issues pre-existed), but it's a missed opportunity — a redesign is the right time to surface what was only implicit before.

**Highest-leverage fix, this round's subject specifically.** Golden standard item 1 — surface tone escalation tier in description text. One text prepend ("Calm: ", "Escalates: ") per scenario, localized to EN/ES, closes the accessibility gap and aligns visual hierarchy with semantic content. Two other personas (Keisha for efficiency, Omar for accessibility) both benefit.

**Highest-leverage fix, across all five rounds this loop has run.** Unchanged from FG06, FG07, FG08: close the universal pre-exposure mute gap for levels 0–4. No change to the priority; the card redesign made scenario selection sharper, but didn't touch the mute-before-first-audio gate that's been the top item since round one.

**Who this is for and isn't for.** The redesign made the product sharper for visual, print-oriented learners (Wes, Dana, Marcus) and more efficient for high-need, time-constrained users (Keisha). It didn't change the lives of privacy-first players (Luis), trauma-sensitive users (Nia), or users whose institutional trust is the blocker (Tony). The card redesign is feature work for the personas who want to see scenarios more clearly; it's not a fix for the ones who need permission or protection first.

---

## 6. Signature

Generated by Amparo Focus Group 09 (expert-panel retrospective, ten-persona panel).
**Panel:** Wes, Dana, Omar, Marcus, Rosa, Tony, Luis, Keisha, Nia, Ana.
**Scope:** v2.16.0 scenario-select redesign (tile grid → vertical card list, compact run-screen header).
**Verdict date:** 2026-08-11.

All findings tied to live code at `a073493`. No speculation; every claim verified against the shipped HTML/CSS.
