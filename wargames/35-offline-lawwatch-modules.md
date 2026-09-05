# 35 — Arena Practice Module Design Review: The Ladder, the Badge, the State Panel, the Panic View

**Loop step 8 design review — game designer + level designer + instructional designer lens.
2026-09-04, read-only.** Scope: `arena/index.html` only. Root's step-5 practice engine is a
"Thank You → Arena" redirect and `/app`'s duplicate drill engine was deleted 2026-09-04; the
Arena is the only practice surface and the only one reviewed here. Structure and mechanics
only — no officer dialogue or legal content is authored below; every content slot follows the
`TODO_ATTORNEY` convention from `wargames/03-door-module-design.md`. `HELD_SITS` (door module,
gated for attorney + DV-clinician review) is treated as structure-only, same as the brief asks;
no content is proposed for it.

All file/line references verified directly against source at HEAD (`c0b6311`,
`arena/index.html`, 2298 lines, `git status` clean). Four surfaces named in the brief —
the pricing ladder, the micro-win badge, the state panel, the full-screen panic view — all
landed in `1a46f8d` ("jurisdiction data layer, idempotent Stripe fulfilment, Panic HUD, Armor
card, Arena ladder") and its two follow-ups, and none has had a design-lens pass before this one.

---

## 0. What this extends, what this is new territory

`isSwanLvl` (the no-score "stop already went wrong" gate) has a five-report paper trail —
`wargames/08`, `19`, `29`, `30`, `31` — that this review verifies against today's code and
extends with one gap none of the five caught. The pricing ladder's *checkout wiring and
timing* was reviewed in `wargames/31` §2. The badge, the state panel, and the panic view are
genuinely new (Sept 2–4) and appear in no prior report. §2 below is the extension; §§3–6 are
first passes.

---

## 1. Beat structure & difficulty curve, levels 0–3

| Situation | Lvl 0 | Lvl 1 | Lvl 2 | Lvl 3 | Curve shape |
|---|---|---|---|---|---|
| `traffic` (:1218) | `routine` — calm, 5 scored turns + 1 branch (:862) | `intense` — agitated, 4 turns (:882) | `tension` — multiple units, loudspeaker, **on your knees, cuffs** (:896) | `hard` — friendly officer, trick questions, no cuffs (:977) | Physical intensity peaks at 2, **drops** at 3; cognitive difficulty peaks at 3 |
| `trap` (:1221) | `trap1` calm (:1082) | `trap2` irritated (:1095) | `trap3` "pressure," pounding heart, doubled-fine bluff (:1108) | `trap4` friendly, stacked lies (:1121) | Pure dialogue the whole way — no physical axis to switch, curve is monotonic in cognitive load |
| `last30` (:1222) | `l301` docs returned (:1137) | `l302` irritated (:1150) | `l303` K9 threat (:1163) | `l304` fabricated tip + re-detention (:1179) | Same shape as `trap` — monotonic, no cuffs anywhere in this arc |
| `step` (:1223) | `step1` calm exit order (:910) | `step2` irritated (:929) | `step3` field sobriety tests **+ cuffs, arrest** (:945) | `step4` trunk bait, passenger lie, no cuffs but still roadside (:961) | Stays on one axis (still detained, still roadside) — closest to a clean escalation |
| `pass` (:1220) | `passenger` calm (:994) | `pass2` irritated (:1010) | `pass3` ordered out + frisk (:1020) | `pass4` wedge tactic, phone unlock bait (:1030) | Same physical-peak-then-cognitive-switch pattern as `traffic`, milder |
| `chk` (:1224) | `chk1` — single level, no escalation (:1203) | — | — | — | By design: a checkpoint doesn't have an officer-temperament ladder. Not a defect, just worth naming since the brief asks about "levels 0–3" and this situation only has a 0. |
| `door` (held, :1235) | — | — | — | — | Content gated; not reviewed |

**The one real pacing problem:** for `traffic` (and to a lesser extent `pass`), the dramatic
peak and the cognitive peak are different beats. `tension` — loudspeakers, kneeling, cuffs — is
the most viscerally intense turn in the whole arc, and it sits at level **2**, one full level
before the tab labelled "🏆 Hard mode." A player who clears `tension` and walks into `hard`
expecting the escalation to continue instead gets a calmer, one-on-one, seated conversation.
That's a legitimate content choice (trick questions *are* a different, real skill), but as
built it reads as the difficulty curve cooling right before the finish line rather than
capping it. This is the same beat that turns out to matter for the swan gate in §2 — the two
findings are one root cause wearing two hats.

---

## 2. The swan gate still doesn't cover the scenario it was built for

**The thread, in order:**

- `wargames/29` (2026-08-18) named the scenario by hand: *"the arena's four hard-mode rungs
  and `tension` (guns-drawn felony-style stop, cuffed interrogation) are all winnable, scored,
  and a clean run gets confetti + upsell... where root suppresses it."* Its recommended fix
  was explicitly **content-based**: *"an `unscored:true`/`swan:true` flag on designated SCEN
  entries."*
- What shipped instead was `isSwanLvl`, a **positional** rule:
  `function isSwanLvl(sitId,i){return i===3||(sitId==='step'&&i>=2);}` (:1340) — last index of
  the situation, not the scenario named above.
- `wargames/31` §2b/§2c (2026-08-19) audited the new rule, declared *"every swan is covered"*
  and separately flagged that `trap:3`/`last30:3` carry a "🏆 Hard mode" trophy label the swan
  gate then silently de-scores — a labelling mismatch, filed as a free chrome fix.
- **Verified today:** `tension` is `traffic`'s index **2**. `isSwanLvl('traffic',2)` returns
  `false`. It is not held. `finish()` (:1629) scores it, plays `sfx('win')` and `confetti()`
  when clean (:1645), shows the score ring, the recap, the badge, the $9.99/$19.99 ladder and
  the Deep Pack teaser — the exact "slot-machine win screen at the cuffs scenario" `wargames/29`
  raised seventeen days ago. Two subsequent reports verified the *shipped rule* was internally
  consistent and both, in doing so, silently stopped checking it against the *original* content
  criterion. The gap was never closed; it just stopped being visible to the audit.

**Why it happened:** the gate was implemented as "last rung = hardest = swan," which is true
for `step` (where `step3`'s cuffs *are* at index 2, correctly caught by the `step&&i>=2`
special case) but false for every other situation, where the cuffs/loudspeaker beat sits one
level earlier than the trophy-labelled finale (§1). The rule matches the situation it was
special-cased for and silently misses the pattern for the rest.

**Fix, still no new copy required:** replace the positional check with the content-based flag
`wargames/29` originally asked for — a small explicit id set,
e.g. `const SWAN_IDS={hard:1,pass4:1,trap4:1,l304:1,step3:1,step4:1,tension:1,...}` (or a
`swan:true` field directly on the affected `SCEN` entries, cleaner still), checked instead of
the index arithmetic. Whichever shape, `tension` has to be in it. `hardQ`'s existing copy
("this level rehearses a stop that has already gone wrong — shouted orders, handcuffs") is
already written for exactly this content and needs no rewrite once the gate actually fires on
it — it just needs to *also* fire on `tension`, and can be reconsidered for `hard`/`trap4`/
`l304`/`pass4`, which are trick-question content the same warning currently over-describes.

**Severity: HIGH.** Not a crash, but the exact "reward for a stop that went wrong" pattern the
product has spent three prior reviews trying to close is still open, on the highest-traffic
situation in the deck (`traffic` is level 0's default and the first tab most players see).

---

## 3. The micro-win badge (new): a threshold that can't reach the level it's named for

`finish()` (:1667–1669):

```js
const ratio=max?base/max:0;
const badgeT=((A.pressure||A.lvl===3)&&ratio>=0.7)?T('badgeHard'):(ratio>=0.9?T('badgeClean'):'');
const badgeEl=document.getElementById('mBadge'); badgeEl.textContent=badgeT; badgeEl.classList.toggle('hiddenEl',!badgeT||swan);
```

`badgeHard` reads, in full: **"You survived Hard Mode"** (`badgeHard:`, bank entry alongside
`badgeClean:'Clean run'`).

**The `A.lvl===3` half of that OR is dead code.** Every situation's index 3 is swan
(§2 — `i===3` is unconditional in `isSwanLvl`), and `badgeEl` is force-hidden whenever `swan`
is true, regardless of `badgeT`. So the only way `badgeHard` can ever actually appear on screen
is `A.pressure` being true — a **"Replay under pressure"** run — at a level that is *not*
swan, i.e. any of levels 0–2 (or 0–1 for `step`). A player can earn a pill that says
**"You survived Hard Mode"** by pressure-replaying `routine` — the calmest traffic scenario in
the deck — and never touch the scenario the badge is named after. Meanwhile the actual felony-
style `tension` scenario, unprotected by the swan gate (§2), *can* earn `badgeClean` on a first
clean attempt, which is the inverse of what both texts imply.

**`badgeClean`'s 90% floor is not a distinct tier — it collapses to "100% only."** `ratio` is
`base/max` where `max` is a scenario's non-branch turn count; every scenario in this file runs
4–6 such turns (verified by inspection — none reaches 10). For any `n<10`, `(n-1)/n<0.9`, so
the only way to land inside `[0.9,1.0)` — a near-miss that still earns the "clean" pill — does
not exist for any scenario in the deck. `ratio>=0.9` is mathematically identical to
`ratio===1` here, which is *also* exactly the condition for the ✨ composure bonus
(`bonus=(base===max?1:0)+(avg>=70?1:0)`, :1633). The badge pill and the bonus sparkle are
built as two separate reward signals but fire on the same event every time — the badge adds a
pill without adding a distinguishable achievement.

**Fix, both one-line, no new copy:**
1. Drop the dead `||A.lvl===3` from the `badgeHard` condition — it's cosmetic, since `swan`
   already hides it, but leaving it in reads as though the review that adds the `SWAN_IDS` fix
   in §2 would suddenly make `A.lvl===3` runs eligible for a badge they still shouldn't get
   (level-3 stays swan under the content-based fix too, for the situations where index 3
   really is "already gone wrong"). Gate `badgeHard` on `A.pressure` alone, and name it for
   what it actually measures — surviving the *pressure modifier*, not Hard Mode specifically.
   `TODO_ATTORNEY` not needed; this is UI chrome, not legal copy.
2. Either lower `badgeClean`'s floor to something reachable below 100% (e.g. `>=0.8`, which
   *is* distinct from a perfect run for `n=5,6`), or delete the pill and let the ✨ bonus be the
   one "you nailed it" signal. Two pills for one event is noise, not a bolted-on upsell exactly,
   but a bolted-on *duplicate*.

**Severity: MEDIUM** (cosmetic/trust issue, not a scoring-integrity bug — the underlying score
is correct; only the badge label lies about what earned it).

---

## 4. The pricing ladder's position in the completion beat

`wargames/31` §2c already proposed **"Earned Ask"** — gate the purchase prompt to
`base===max`, at most once per situation per day — and it is still not shipped: `finish()`
today hides the ladder only when `swan` (:1671, `document.getElementById('ladder').style
.display=swan?'none':'';`), with no score or frequency check. A 0-point completion of any
non-swan level shows the full $9.99/$19.99 ladder and the Deep Pack teaser exactly as often as
a perfect one. That finding stands unchanged; it isn't re-litigated here.

**What's new this pass is the beat *order* inside the modal itself**, independent of how often
it fires. Transcribed from source (:734–766), the completion modal renders, top to bottom:

1. "Scenario complete!" (h2)
2. `mBadge` — the pill from §3
3. `mMetrics`, `mScore` — the score ring
4. `mPath` — steadiness %, bonus
5. `recap` — key phrases to master (the actual pedagogical payoff)
6. `weakest` — your weakest moment
7. `mHook` — streak/print nudge
8. `.mList` — three feature bullets *for the paid Master Script* (checklist / flashcards / PDF)
9. **`.ladder`** — $9.99 / $19.99 pricing, `buyScript` CTA
10. **`.deep`** — Deep Pack teaser, "peek" reveal
11. `mAgain` — **"Practice another scenario →"**
12. `mPressure` — **"⚡ Replay under pressure"**
13. `mRemind`, `mClose`

The two buttons that continue the actual rehearsal loop — the entire point of the product,
per its own About copy ("Rehearsal under mild stress is what makes words available") — sit
*downstream* of two full monetization blocks, on every single completion, with no cap. A player
who just finished a scenario and wants to immediately do another has to scroll past a feature
pitch, a price, and a locked-product teaser first, every time. This is a sequencing problem the
Earned-Ask frequency fix doesn't solve by itself: even on the completions where Earned Ask
would legitimately show the ladder, the continue-practicing buttons would still be buried below
it.

**Fix:** move `mAgain`/`mPressure` to sit immediately after the debrief (`recap`/`weakest`),
ahead of `.mList`/`.ladder`/`.deep`. The monetization block becomes the thing you scroll to if
you want it, not the toll booth between the debrief and the next rep. Pairs cleanly with
Earned Ask: once that ships, the reordered ladder would show *rarely* and *after* the loop's
own CTA, which is the shape a rehearsal-first product wants on both axes.

**Severity: MEDIUM** (no data leaves the device, pricing is honest and clearly labelled — this
is a friction/tone problem, not a dark pattern; it's the concrete version of "reads as bolted
on" the brief asked about).

---

## 5. The state panel: an answer key sitting beside the quiz

`statePanel` (:590–597) is new — the "YOUR STATE" card in the left sidebar, populated from
`/data/hud.json` (baked inline as of today's commit for offline-first, background-refreshed
after). It lists up to 10 categories in a fixed order (`ORDER`, :2181:
`silence, documents, search, sign, passenger, firearm, recording, unmarked, reason, footage`),
each a short cited line, with `EMPH`-flagged categories visually bolded.

**It is open by default during a live drill on desktop.** `render()` (:2243) computes
`open = A.spOpen ?? matchMedia('(min-width:861px)').matches` — i.e. unless a player has
explicitly collapsed it before, it defaults **open** on any viewport ≥861px, and stays open
across every render, including mid-scenario. The categories it lists — silence, search
consent, signing, passenger rules, firearms — are the same categories the graded dialogue
options in `SCEN` are testing (§1, every situation's "good" choice is a silence/consent/sign/
passenger line). On a wide-enough screen, the correct answer to the officer's question sitting
in the chat pane on the right is often restated, cited, almost verbatim, in the panel sitting
open on the left, the whole time the countdown clock and steadiness needle are trying to
measure whether the player can produce that line **from memory, under mild pressure** — which
is the entire mechanic the product is built around (`tut2`/`tut3`'s own copy: "the needle is
your voice," "earn the composure bonus"). A reference panel is genuinely useful *before* a
drill (setup) and *after* one (debrief, printing) — open by default *during* a scored run, it's
an answer key sitting next to the quiz it's supposed to be testing recall against.

**On mobile, the same panel adds scroll distance in front of the thing it's supposed to
support.** `.wrap` is a 290px+1fr grid ≥861px and collapses to a single column below that
(:310–311). The sidebar div — setup-gate warning, drill-of-the-day card, **the state panel**,
situation search/list, stats, share card, pack upsell — is the *first* child of `.wrap`; `.arena`
(the actual chat/HUD/response UI) is the second. On any phone, that whole stack, now lengthened
by the ~10-line HUD panel, renders **above** the practice interface. Nothing auto-scrolls a
first-time visitor down to it: `drillBtn`'s handler (:2159) sets state and re-renders but never
touches scroll position, while `resumeBtn`, four rows below it in the same file, does exactly
that (:2142: `window.scrollTo({top:document.querySelector('.arena').offsetTop-70,
behavior:'smooth'})`). The fix pattern already exists in this file for a different button.

**Fix, both cheap:**
1. Default `spBody` closed while a drill is in progress regardless of viewport width — open it
   automatically between scenarios (on `finish()`, or on the sidebar's own toggle), closed the
   moment `A.turn>=0` and `A.hist.length===0` (a fresh turn). One extra condition in `render()`.
2. Copy `resumeBtn`'s `scrollTo` line onto `drillBtn`'s `onclick` (:2159). One line.

**Severity: MEDIUM** (the immersion/pedagogy concern) **+ LOW** (the mobile scroll gap, purely
mechanical and trivially fixable).

---

## 6. The panic view: the emergency screen doesn't know it's not an emergency

`#panicView` (:2167, styled :412–424) is the full-screen, black, large-type version of the same
HUD lines, reachable mid-session via the sidebar's "Full screen" button (`spFull`, :2273) or a
direct `?panic=1` link (:2292–2294) — built, correctly, to be usable roadside for real.

**It does not pause the drill it's opened over.** Every *other* overlay in this file —
`safeBg`, `aboutBg`, `supBg`, `orgsBg`, `privBg`, the completion `modal`, `payBg`, `tutBg` — is
a `.modalBg`, and `overlayOpen()` (:1527) is exactly the shared gate that pauses the per-line
countdown clock (`tick()`, :1435: `if(overlayOpen()){return;}`) and the steadiness needle
(:1547) whenever one is open:

```js
function overlayOpen(){return window.__paused||document.querySelector('.modalBg.on')||document.getElementById('introBg').style.display==='flex';}
```

`panicView` has no `modalBg` class — it's a bespoke `div` with its own `.on` toggle — so
`document.querySelector('.modalBg.on')` never sees it, and `openPanic()` (:2257) never sets
`window.__paused` either. The result: tap "Full screen" mid-turn, and the countdown clock
(5–7 seconds per line, §7) keeps ticking behind the black overlay. Read for eight seconds and
come back, and the turn has already auto-failed — `tick()`'s own fallback fires
`answer('(froze — said nothing)', -1, ..., 0)` (:1435) — docking a point and adding `heat`
(:1608) for the exact behavior of stopping to check a safety reference. Every other overlay in
the file pauses correctly through the shared mechanism; this is the one built outside it.

**Why this matters beyond a timer glitch:** the brief asks whether opening the "real roadside
moment" view mid-practice creates a confusing precedent. The visual framing is fine — it should
look and read identically whether it's a drill or the real thing, since muscle memory only
transfers if the screen doesn't change. The actual risk is behavioral, not visual: if checking
the safety reference mid-rehearsal silently costs a point, a player can come away having
learned, unconsciously, that opening the panic view is expensive — which is the opposite lesson
a know-your-rights tool wants to teach about its own emergency feature.

**Fix:** either add `modalBg` to `#panicView`'s classes (and audit its bespoke CSS doesn't
collide with the shared `.modalBg`/`.modal` rules), or the two-line targeted version —
`window.__paused=true` in `openPanic()`, restored (to its prior value, not force-`false`) in
`closePanic()`. Either way it's reusing a pause mechanism that already exists and already works
for eight other overlays, not building a new one.

**Severity: HIGH.** Concrete, reproducible, and it actively punishes using the one feature this
product would most want someone to reach for without hesitation.

---

## 7. Replay-under-pressure: mechanics vs. copy (confirming a still-open minor item)

Mechanic, verified current: `tick()`'s base countdown is `(A.lvl===3?5:7)+(A.pressure?-1:0)`
(:1433), floored at 3 and nudged ±1 per answer by `clockBonus`. Pressure mode also shrinks the
steadiness zone (`lvlZone()×0.8`, :1529) and speeds the needle (`lvlPeriod()×0.7`, :1528). The
tutorial's own copy matches this exactly: *"every response has a countdown — 7 seconds (5 on
Hard mode)"* (`tut3B`).

`wargames/31` §1 item 3 already flagged that the button's *live* copy was fixed to
`'⚡ Replay under pressure — a shorter clock on every line'` (no number, so it can't be wrong)
but the **static HTML fallback still says "10 seconds per line."** Verified still true today,
16 days later: `arena/index.html:763` —
`<button ... id="mPressure" data-i18n="mPressure">⚡ Replay under pressure — 10 seconds per
line</button>`. `applyLang()` overwrites it on every real load, so this is cosmetic (visible
only in a flash-of-unlocalized-content window or if JS fails), but it's a one-line, already-
identified fix that's still sitting there. Restating it here so it doesn't fall off the list a
second time.

**Severity: LOW.**

---

## 8. Confirmatory notes (not action items)

- **Swan levels still count toward progress, just not celebration.** `A.done[s.id]` is written
  in `finish()` (:1635) before the `swan` branch, so a swan completion still advances
  `totalDone`/readiness/`badgeN` (:1327–1331) even though the modal shows no score, badge, or
  ladder. This reads as intentional — track that the rep happened, withhold the fanfare — and
  is consistent with the "no trophy on the swan" philosophy rather than a violation of it. Flagging
  only so it's confirmed as deliberate rather than assumed.
- **`chk` (checkpoint)** correctly sits outside the four-level curve — a fixed-procedure federal
  checkpoint doesn't have an officer-temperament ladder the way a discretionary stop does. Not a
  gap; noted in §1 for completeness since the brief asks about "levels 0–3" by name.
- **No door-module content was proposed anywhere above.** `HELD_SITS={door:1}` (:1235) is
  respected throughout; the state-panel HUD data and panic view draw only from the
  jurisdiction bank (`hud.json`), which has no door-specific content to leak.

---

## 9. Priority punch list (smallest diff → biggest effect)

1. **§6 panic view pause** — two lines (`window.__paused` set/restore in `openPanic`/
   `closePanic`), fixes an active player-punishing bug. Do this first.
2. **§5.2 `drillBtn` scroll** — one line, copy `resumeBtn`'s existing `scrollTo` call.
3. **§7 stale fallback copy** — one line, already identified in `wargames/31`, still open.
4. **§3.1 drop dead `A.lvl===3` badge branch** — one line, no copy change required.
5. **§5.1 default-collapse the state panel during an active turn** — one condition in `render()`.
6. **§4 reorder the completion modal** — move `mAgain`/`mPressure` above `.mList`/`.ladder`/
   `.deep`; no new elements, pure reorder.
7. **§2 swap `isSwanLvl`'s positional check for a content-based id set, and add `tension`
   to it** — the largest of the seven, and the one with the longest paper trail; still worth
   doing first among the "real content" fixes because it's the one that's been re-flagged three
   times without landing.
8. **§3.2 badge/bonus redundancy** — cosmetic; fold into whichever of the above touches
   `finish()` next rather than a standalone pass.

---

## Verification log

- `arena/index.html` — 2298 lines, HEAD `c0b6311` (2026-09-04), `git status` clean at review
  time. All line numbers above cited against this file as read directly, not from a prior
  report's line numbers (the file has grown since `wargames/29`–`31`, which cite older builds).
- `SIT` array: `:1217`. `SCEN` array: `:861` + two `SCEN.push` blocks (`:1009`, `:1081`) +
  checkpoint `SCEN.push` (`:1202`).
- `isSwanLvl`: `:1340`. `HELD_SITS`: `:1235`. `finish()`: `:1629`. `overlayOpen()`: `:1527`.
  `tick()`: `:1433–1436`. `statePanel` HUD IIFE: `:2179–2295`. `panicView`: `:2167`,
  `openPanic()`/`closePanic()`: `:2257`/`:2272`.
- Commit history checked: `1a46f8d` (feature landed), `e119853`, `3a0c19f`, `c0b6311` (today) —
  confirmed none of the four reviewed surfaces' current behavior differs from what's described
  above; `c0b6311`'s change is the inline-HUD offline mechanism, not a behavior change to the
  gate/badge/ladder logic reviewed here.
- Prior reports consulted for continuity, not re-derived: `wargames/08` §1.2, `wargames/19`
  (checkpoint ordering), `wargames/29` §"no black-swan level," `wargames/30` §1b/§3a,
  `wargames/31` §1 item 3, §2b, §2c ("Earned Ask").
- Turn-count claim in §3 (no scenario reaches 10 non-branch turns, so a 90% floor can't land
  short of 100%) verified by inspection of every `SCEN` entry's `turns` array; the longest
  runs 6 (`step1`–`step4`, `routine`).
