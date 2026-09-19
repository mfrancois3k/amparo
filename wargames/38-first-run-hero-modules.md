# Wargame 38 — First-run hero micro-level: onboarding-level review + hero→Arena handoff

Date: 2026-09-19. Game-design / level-design / instructional-design review of the
**new homepage first-run hero micro-level** (`new/index.html`, `#first-rep`) and its
handoff into the Arena's full level system (`arena/index.html`). **Structure and pacing
only — no officer dialogue, legal claim, or statutory content is authored below.** Every
slot that would need new wording is marked `TODO_ATTORNEY`, the convention from
`wargames/03-door-module-design.md`. All line numbers verified by direct read at HEAD
(v2.31.0 tree; commit `47ee601` added the hero).

Prior passes read and **not** relitigated: `wargames/37` (Arena internals: heat mechanic,
branch reuse, level-length drift, door CRITICAL) and `wargames/36` (Arena onboarding funnel:
gentle default, skipped tutorial, meter relabel). This is the **first** review of the surface
*upstream* of both — the homepage micro-level and the seam where it hands the player to the
Arena. Where a finding compounds a 36/37 item, that is stated, not re-argued.

---

## 0. What actually exists — verified against source

**The hero (`new/index.html`).**
- Static markup `#first-rep` at `:475–504`; done-screen CTAs at `:496–500`; the "1 of 6 cards
  practiced" ring label at `:495` (and its string `ring` at `:529`).
- Inline engine at `:512–600+`. The level data is `L1` at `:514–527`: **three** officer lines,
  each with **two** answers (one `good:1`, one `good:0`), an immediate feedback string, and a
  `Why this →` link. No timer, no heart-rate, no branch. Flow: officer line → 2 answers →
  lock + colored feedback → Next → ×3 → done screen. Dots at `:550–553`; `pick()` at `:568–581`;
  `finish()` at `:587–593`.
- On finish the hero writes `localStorage['amparo_progress'] = {l1:true,lang,ts}` (`:591`) and
  fires `sr_practice_level_done` (`:592`).

**The three `L1` lines are a verbatim subset of the Arena's `routine` scenario.**
- Hero line 1 "Do you know why I pulled you over?" (`:515–518`) == Arena `routine` **turn 2**
  (`arena/index.html:899–901`), the admission-trap beat.
- Hero line 2 "Where are you coming from tonight?" (`:519–522`) == Arena `routine` **turn 3**
  (`:902–904`), the silence beat.
- Hero line 3 "Mind if I take a quick look in the car?" (`:523–526`) == Arena `routine`
  **turn 4** (`:905–907`), the consent-to-search beat.
- The in-file comment at `:509–511` states this openly ("Level-1 content is taken verbatim from
  the Arena's 'routine' scenario … ships `verified:false` until attorney review").

**The handoff routing works** (I initially suspected a broken bridge; corrected): `vercel.json:181–186`
rewrites `/rehearse` and `/rehearse/` → `/arena/index.html`. So every "Practice a full stop / a
traffic stop" link (hero `:499`; cinema page `:505` in several places) lands in the **Arena**, not
in the legacy `new/rehearse.html` (that file is now unreachable at `/rehearse`; it only back-links
to `index.html`/`aid.html`). The Arena's default entry for a first-timer is `A.sit='traffic', lvl=0`
= the `routine` scenario (`arena/index.html:1275`, `SIT` traffic ladder `:1263`), gentle-on by
default (`:1280`, `:2416`), tutorial suppressed (per `wargames/36 §1`).

---

## 1. Game-designer lens

**1.1 — Two-option, obviously-weighted answers are the RIGHT call for an onboarding level (confirmatory, no change).**
Each hero beat pairs one clearly-strong line against one clearly-weak one (e.g. `:525` "I do not
consent" vs "Go ahead, I have nothing to hide"). A first level should telegraph its answer and
let the player win — that is how a tutorial level teaches a pattern and builds confidence. The
teaching load is carried by the *feedback*, not the difficulty of the choice, and the feedback
does explain *why* (the `Why this →` link, `:577`). **Do not** add a decoy third option or a
timer here; the tension in an onboarding level should be near-zero by design. The curve needs
somewhere to climb *to*, and the Arena is that somewhere.

**1.2 — The hero has no "you just did this" bridge, so the handoff RESETS the player instead of ADVANCING them (structural, HIGH).**
Because the hero is a verbatim subset of `routine` turns 2–4 and the Arena's default first-run
IS `routine` (all six turns, from turn 1), the very first thing a player does in the Arena is
**re-play the identical three lines they just finished on the homepage**, plus the three they
have not seen. The hero's completion (`amparo_progress`, `:591`) is written to a key the Arena
never reads — the Arena reads `amparoArena` (`arena/index.html:1274`) — so the Arena treats the
player as brand-new and shows `routine` as unfinished. Repetition of a phrase is *good* for a
reflex builder (`wargames/37 §3.1` praises exactly this), but repeating it **silently and
unacknowledged, as if for the first time**, reads as a stutter, not a rep. See §4.1 for the fix
(advance the entry point, don't reset it).

**1.3 — Progress feedback denominator is invented.** The done ring says "1 of 6 cards practiced"
(`:495`/`:529`). The player practiced **3 dialogue turns of one scenario**, not one of six cards.
"6 cards" is the printable Deal deck (`new/index.html` Deal/`Explore the six cards`), a different
object entirely. And the Arena's own ladder is 7 situations (`SIT`, `arena:1262–1270`) scored
against `TOTAL`, not 6. The "1 of 6" sets a denominator that nothing downstream honors. LOW, but
it is a truth-in-progress claim → treat copy as `TODO_ATTORNEY` if reworded (the `doneTitle`
"first 30 seconds of a stop" at `:494` is already the honest frame; the ring should match it).

## 2. Level-designer lens

**2.1 — The difficulty jump is not in mechanics, it is in NAVIGATION (structural, HIGH).**
Hero L1 and the Arena's gentle first-run are mechanically *the same* — 2 options, no clock, no
heart, tap to answer. The real cliff is choice-architecture: the hero ends on **three co-equal
CTAs** ("Pick your state" / "Build my pack" / "Practice a full stop", `:496–500`), and the one
that leads to practice drops the player into the Arena's **quick-setup modal followed by a
7-situation × 4-level grid** with no single recommended next drill. That is two stacked
decision screens back-to-back at the exact moment a just-onboarded player has the least context.
The Arena already computes the right answer for them — `nextUnfinished()` (`arena:1746–1752`) —
but the hero never routes to it. See §4.2.

**2.2 — Reflex ORDER is defensible but omits the hands/announce-movement beat (MEDIUM).**
Hero order is admission-trap → silence → consent-to-search (`:515`→`:519`→`:523`), which tracks a
real stop's escalation and is a sound instructional sequence. But it drops the beat the Arena
puts **first** in `routine`: "License and registration … reaching for them now / announce
movement, keep hands accounted for" (`arena:896–898`). That beat is the one physical-safety
reflex in the set; a "what to say" onboarding that omits "and keep your hands visible while you
say it" front-loads legal protection over the thing most likely to keep the encounter from
escalating. Adding a hands/movement beat to the hero needs new wording → `TODO_ATTORNEY` (§5).

## 3. Instructional-designer lens

**3.1 — "Say it OUT LOUD" — the product's single most load-bearing instruction — is absent from the hero (MEDIUM).**
The Arena tutorial `tut1` calls it "the single most load-bearing behavioral instruction in the
product" (`wargames/36`; `arena:810`). The hero is entirely tap-driven and silent, and its
foot-copy is "Free. No account. 2 minutes." (`:492`). A first-timer's first practice rep is
therefore taught as a *reading/tapping* exercise, which trains the wrong motor pattern before the
Arena ever gets to correct it. The hero does not need voice input, but one line of copy telling
the player to speak the answer aloud would align the reflex from turn one → `TODO_ATTORNEY` (§5).

**3.2 — Gentle-on-gentle-on-gentle: the funnel now has THREE calm surfaces before any pressure (MEDIUM, compounds `wargames/36 §1–2`).**
`36` established that the Arena's median first session contains zero stress rehearsal (gentle
default + skipped tutorial). The hero adds a **third** upstream calm surface: no clock, no heart,
no mention that pressure exists. So the whole path homepage → Arena first-run can complete without
the player ever meeting the mechanic the About copy says the game exists for (`arena:718`). The
hero is the natural place to *name* that a harder, timed mode exists ("this was the calm version")
so the Arena's pressure gate isn't the first the player hears of it. Structural signpost only; the
copy is `TODO_ATTORNEY`.

**3.3 — The `Why this →` link over-promises specificity (LOW).** Foot copy says "Every line links
to the statute" (`:492`), but every `Why this →` (`:577`) and the trust link point to the single
generic `/how-we-verify/` page, not a per-line statute. Consistent with `verified:false` /
attorney-pending, so not a defect today — but the copy claims a per-line citation the structure
does not yet deliver. Fold into the §4.5 cleanup.

## 3.9 — Dead data found in passing

The bilingual **`arena*` promo strings** (`new/index.html:640–649` EN, `:754–763` ES —
`arenaEyebrow/Title/Sub/Scenarios/Chips/Safety/Cta/Link`) are defined but **rendered nowhere**:
no DOM node and no JS in `index.html` or `cinema-content.js` references them (grep-verified). A
full "Practice Arena" section's worth of copy is orphaned — a section was removed or never wired.
Delete or wire; it is currently maintenance weight that reads as live. LOW.

---

## 4. Findings, severity-ranked

### 4.1 HIGH — Handoff resets the player onto the three lines they just finished (§1.2)
Anchors: hero `L1` `new/index.html:514–527` == Arena `routine` turns 2–4 `arena/index.html:899–907`;
hero writes `amparo_progress` `new:591`, Arena reads `amparoArena` `arena:1274`; Arena default
`traffic/routine/lvl0` `arena:1263,1275`.
Structural options (cheapest first):
- **(a)** Point the hero's primary CTA at the *next* beat, not the default. The Arena already
  parses `?sit=…&lvl=…` deep-links (`arena:1285+`), e.g. `/rehearse?sit=trap` (the standalone
  admission-trap ladder) or `…?sit=traffic&lvl=1` (Irritated). One-attribute change to `:499`.
  This turns the repeat into a *progression*. **Recommended — smallest diff, no new copy.**
- **(b)** Have the Arena read `amparo_progress.l1` on load and pre-mark `routine`'s first three
  turns seen / open on turn 4. Larger, cross-file, and fights the "repetition is good" grain.
Prefer (a).

### 4.2 HIGH — No single recommended next; two decision screens stack at the handoff (§2.1)
Anchors: three co-equal CTAs `new:496–500`; Arena quick-setup + grid on first-run; unused
`nextUnfinished()` `arena:1746–1752`.
Structural fix: make **one** hero CTA primary ("Practice a full stop") and have it deep-link to a
single specific drill (per §4.1a); demote "Pick your state" / "Build my pack" to secondary (the
markup already styles them `.secondary`, `:498–499` — this is a hierarchy/target change, not new
UI). Goal: the player leaves the hero pointed at exactly one next action.

### 4.3 MEDIUM — Reflex set omits the hands/announce-movement beat (§2.2)
Anchor: present at `arena:896–898`, absent from hero `L1` `:514–527`. Fix needs new copy →
`TODO_ATTORNEY` (§5.1).

### 4.4 MEDIUM — "Say it out loud" absent from the first rep (§3.1); pressure never named across the funnel (§3.2)
Anchors: hero foot `:492`; `tut1` `arena:810`; About thesis `arena:718`. Both are one-line copy
signposts → `TODO_ATTORNEY` (§5.2, §5.3).

### 4.5 LOW — Cleanup: invented "1 of 6" denominator (§1.3), dead `arena*` strings (§3.9), over-promised statute link (§3.3)
Anchors: `new:495,529`; `new:640–649,754–763`; `new:492,577`. Delete the orphaned strings; make
the ring label match the honest `doneTitle` frame; reconcile the "links to the statute" claim with
the generic target. Ring/label rewrites that assert progress or citations → `TODO_ATTORNEY`.

---

## 5. TODO_ATTORNEY-convention placeholders (structure only)

These are the *only* content slots the changes above open. No wording is authored here; each is a
labeled hole for the attorney/author, exactly as `wargames/03` and `wargames/37 §5` do it.

- **5.1** `TODO_ATTORNEY` — an optional hands/announce-movement hero beat (new officer line + two
  answers + feedback), if §4.3 is taken. Port-candidate source is `arena:896–898`, which is itself
  `verified:false`; do not ship either without sign-off.
- **5.2** `TODO_ATTORNEY` — one line of hero copy instructing the player to speak the answer aloud
  (§4.4 / `:492` foot area).
- **5.3** `TODO_ATTORNEY` — one line naming that a timed/pressure mode exists ("this was the calm
  version") for the done screen (§4.4 / `:494` done block).
- **5.4** `TODO_ATTORNEY` — reworded progress ring label if "1 of 6 cards" is replaced (§4.5 /
  `:495,529`).

## Open items requiring a human before anything ships

- The hero content is `verified:false` and so is its Arena source; none of §5 ships without
  attorney review (same gate as `wargames/37`).
- §4.1a's deep-link target is a product decision (does a first-timer's *second* rep go to the
  Irritated level, or sideways to a different situation like `trap`?) — a level-design choice for
  the operator, not a mechanical one.
- Confirm the `/rehearse` → `/arena/index.html` rewrite (`vercel.json:181–186`) is the intended
  permanent route and that `new/rehearse.html` is meant to be dead; if not, that is its own bug.
