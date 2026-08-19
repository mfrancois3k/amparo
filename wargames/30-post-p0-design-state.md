# 30 — Post-P0 Design State of the Practice Arena

**Loop step 8 design review (game/level/instructional designer lens), 2026-08-18, v2.24.0 (commit c17e5f7 / bfa9ba9).**
Follows `wargames/29-practice-arena-vs-modules.md`. Structure and mechanics only; every
content slot follows the `TODO_ATTORNEY` convention from `wargames/03`. All line
references verified against current source (`arena/index.html`, 1561 lines; root
`index.html`). Matcher math in §3c was executed with the source's own algorithm
(exact port of :1391–1393), not estimated. Unverified claims are marked.

---

## 1. Did wargames/29's P0 items land? (grep evidence)

| P0 item (29 §4.1) | Status | Evidence |
|---|---|---|
| a. Per-turn free-text matcher + crisis check | **LANDED** (with new flaws, §3c) | Global `KEY` list deleted (zero matches in file). `submitFree` :1375–1397 matches against `goodC.t` for THIS beat only — majority word overlap (:1391–1393), same shape as root `prxCompareShow` (cited in-code :1389–1390). Crisis net ported: `PRX_CRISIS` :689–690, `prxIsCrisisArena` :691–694, checked **before** scoring :1377–1382, shows 988 line, never scored. |
| b. Swan flag + celebration suppression | **PARTIAL** | `isSwanLvl` :1126 (`i===3` any situation, plus `step` i≥2 — matches the "Tests & cuffs" CHANGELOG claim). Consent `confirm(T('hardQ'))` on tab click :1136. Confetti+win-sfx skipped for swans :1331. **But** the finish modal still shows the score `base+' / '+max` :1332, still says `mT` "Scenario complete!" (:678), and still presents the $3.99 upsell (`mBuy`, same modal :1345). Root's rule is *no score at all* (`PRX_UNSCORED` "must never show a score"). Gate also has bypass paths — §3a. |
| c. Door situation held | **LANDED** | `HELD_SITS={door:1}` :1071 with the root-parity comment. Sidebar renders 🔒 at .62 opacity, `heldB` reason string, no progress bar, click → `alert(T('heldB'))` :1102–1106. Saved pre-hold state reset :1363. Auto-advance (`nextUnfinished`) skips held sits :1359. `heldB` copy is honest and bilingual :679/:684. |
| d. Unlock/consent gating on escalation rungs | **NOT SHIPPED** (scoped down) | The v2.24.0 round gated only swan rungs (item b). Rungs 1–2 (Irritated / Pressure-Commanding, incl. `tension` guns-drawn at rung 2 of traffic) remain freely tappable as a first-ever drill with no sequential unlock and no interstitial (`renderTabs` :1127–1138 has no lock branch). wargames/29 §2c's concern stands for non-swan escalation. CHANGELOG does not claim otherwise — recorded here as consciously open, not regressed. |

Also landed from the same round (verified in passing): honest checkout (`payOkT`
"Preview complete — no charge was made" :679, no receipt line, `payEmail` optional),
supervision banner strings :677, state-law "you must" lines removed from render —
`DUTY_INFORM`/`STOP_ID` kept as data with `TODO_ATTORNEY` comment :1069–1073.

---

## 2. wargames/29 items NOT in the P0 round — all six still open (current-source line numbers)

1. **Streak accrues on page-open.** IIFE at :1050–1054 increments `A.streak.n` at load,
   before any drill. Root earns it at run completion. **OPEN.**
2. **Readiness ignores answer quality.** :1114 and `readyPct()` :1437 are both
   `done/TOTAL*70 + min(streak,6)*5` — `A.done[id]` is set on any completion at any
   score (:1322 keeps *best*, but the readiness term counts keys, not values). A
   0-point run on every level plus a 6-day open-the-page streak still reads high on
   the shareable card (:1445–1459 "Can you beat it?"). **OPEN.**
3. **Pressure-mode copy says 10 seconds, code gives 6.** Copy: :619 + UI strings
   :678 (en) and :683 (es) — "⚡ Replay under pressure — 10 seconds per line".
   Code: `baseT=(A.lvl===3?5:7)+(A.pressure?-1:0)` :1193 → 6s normal, 4s hard; plus
   pressure shrinks the steadiness zone ×0.8 :1242 and speeds the needle ×0.7 :1241.
   The tutorial (`tut3B` :678) correctly says "7 seconds (5 on Hard)". **OPEN** —
   fix the two strings or the math, one line either way.
4. **Heat penalizes neutral p:0 choices.** `if(p<1) A.heat=Math.min(3,(A.heat||0)+1)`
   :1295; 13 `p:0,g:0` neutral choices exist in SCEN (grep count). Heat −1 only on a
   perfect run :1324. A deliberately-neutral legal choice still makes the officer
   "remember how the last one went" :1163. **OPEN.**
5. **Decks verbatim on replay.** Zero `v:[` variant arrays in SCEN (grep), exactly
   one `branch:true` turn in the whole file (:713). Every replay of every level is
   word-for-word identical; replay variety is still only pressure mode + heat. **OPEN.**
6. **Root curveball date-only seed** (flagged since wargames/28 §5.3 — 4th flagging).
   index.html :5132–5136: `runs` only gates *whether* a curveball deals; the seed is
   `year*372+month*31+day` — same-day replays get the identical curveball at the
   identical deck position. `seed+runs` remains a one-line fix. **OPEN.**

---

## 3. New design questions raised by the P0 changes themselves

### 3a. The swan gate is a native `confirm()` — and it leaks

**Fit:** `T('hardQ')` text is localized (:679/:684) but the OK/Cancel buttons are
browser chrome — unlocalized, unstyled, visually alien to a page whose whole language
is warm cards and gold accents. The arena already owns two better in-page patterns:
the pre-drill physical-safety interstitial (`safeT`/`safeGo`/`safeSkip` :679) and the
supervision gate modal (:562). Structure rec: render `hardQ` as a swan interstitial
card in the arena panel using the safety-card pattern — no new strings needed, the
copy already exists and is already in the attorney queue.

**The bigger problem is placement, not skin.** The check lives only in the tab
`onclick` :1136, guarded by a page-global `window.__swanOK`:

- **One consent covers all swans:** accepting the gate on traffic Hard sets
  `__swanOK=true` for step-out "Tests & cuffs" and every other swan until reload.
- **Bypass 1 — sidebar:** situation click :1106 sets `A.lvl` to the first unfinished
  level; if 0–2 are done that's level 3 (swan) with no confirm.
- **Bypass 2 — "Practice another scenario":** `nextUnfinished()` :1355–1361 can land
  on a swan the same way (:1364–1369 renders directly).
- **Bypass 3 — reload:** `A.lvl` persists (validated 0–3 :1046) but `__swanOK`
  doesn't, so a saved swan renders with no re-consent.

Fix shape: move the check into `renderArena()` (fires on every path), store consent
per-situation in `A` (e.g. `A.swanOk={traffic:1}`), render the interstitial instead
of the level until consented. That single relocation fixes skin, scope, and all
three bypasses at once.

**Plus finish parity:** suppress the score line and upsell for swans (§1b) — root's
rule is explicit ("must never show a score"). Structural: `finish()` branches on
`isSwanLvl` to a reflective completion card; its one paragraph of reframing copy is
`TODO_ATTORNEY` (root's "no trophy on the swan" comment is the spec).

### 3b. The held door card and completion pressure

Verified caps with door held: badge counter reads at most **20 / 24** (:1113,
`TOTAL=24` sums all SIT levels incl. door :1047), readiness caps at
`round(20/24*70)+30 = 88%` — "100% READY" is unreachable, and the situation list
shows 5-of-6 forever-incomplete. The share card (:1452) prints "20 / 24 drills" to
family. For a completionist — and this audience is being *told* to treat readiness
as preparation — that's a standing itch pointed at content that is locked *for their
safety*.

How other games handle permanently/indefinitely-gated content (general design
knowledge, not verified against specific current builds): the dominant pattern is
**excluding unearnable content from completion denominators** — course-progress
meters count only released units; achievement systems hide unobtainable achievements
until they become earnable; live-service games list "coming soon" content in a
separate section outside the progress ring, precisely because counting it teaches
players the meter is dishonest.

Rec (structure only): keep the locked card visible with its honest reason — the hold
explanation is a trust feature, arguably the best copy in the arena — but exclude
`HELD_SITS` levels from `TOTAL`, badge counts, and `readyPct` while held.
One caveat to handle: users who completed door1–4 before the hold have those ids in
`A.done`; filter done-keys symmetrically or 22/20-style overflow appears (readiness
already clamps at 100 :1114, the badge line doesn't).

### 3c. The new matcher, tested with its own math

Method: exact port of :1391–1393 run in Node against real SCEN good lines
(scratchpad `matcher.js`/`scan.js`, results reproduced below). Corpus facts: 100
good-choice lines; **15 carry stage-direction prefixes** outside the quotes
("When they return:", "Comply — and say:"); **18 are pure action descriptions** with
no quoted speech at all ("Exit slowly, hands visible, say nothing"); **11 have ≤2
keywords**, so majority = 1 word.

**Too strict for honest paraphrase** (each row is the algorithm's actual output):

| Correct line (keywords, need) | Typed answer | Result |
|---|---|---|
| "I choose to remain silent." (choose/remain/silent, 2) | "I stay silent" | **MISS** 1/2 |
| same | "I plead the fifth" | **MISS** 0/2 |
| "I choose to remain silent. I want a lawyer." (5 kw, need 3) | "I want a lawyer" | **MISS** 2/3 |
| same | "I'm staying silent and I want an attorney" | **MISS** 2/3 |
| "My documents are in the glovebox — reaching for them now." (4 kw, need 2) | "My papers are in the glovebox" | **MISS** 1/2 |

The miss path is soft (p:0 + "Solid instinct…" + no-penalty retry :1308–1313), but
p<1 still adds heat :1295 and costs steadiness/clock — a correct answer in the
user's own words is mechanically punished.

**Broken by stage directions:** `When they return: "Am I free to go?"` extracts
`when/they/return/free`, need 2 — so typing the *exact correct quoted phrase*
"Am I free to go?" is a **MISS (1/2)**. Fifteen lines have this defect; the 18
action-only lines are unmatched-able by any spoken answer at all.

**Too loose on short lines — the v2.24.0 changelog's own test phrase still passes.**
For `"I do not consent to a search."` the keywords are `consent/search`, majority
= 1. The algorithm's output for **"yes go ahead and search everything, I consent"**
is **HIT (2/1) → p:1 "Good choice" + the refusal feedback**. The exact failure the
changelog says was fixed ("scored 'yes go ahead and search, I consent' as correct")
is fixed *globally* but reappears verbatim on all 5 consent turns and 6 other
2-keyword turns (list in scratchpad scan: "Not without a warrant", "No questions.
Am I free to go?", "Silence.", "I'd rather not guess" ×2, "Thank you. Am I free to
go?"). Severity: **CRITICAL** — praising consent-granting on the consent-refusal
turns is the same class of bug the release closed.

Fix shape (no content authoring):
1. Extract keywords only from inside `“…”`/`«…»` when present (kills the 15
   stage-direction defects); for the 18 action-only lines, route free-text to the
   p:0 fallback unconditionally (you cannot *say* an action) — or add an optional
   per-turn `say:{en,es}` spoken-equivalent field (strings = `TODO_ATTORNEY`).
2. Floor the threshold: `need = max(2, ceil(gw.length/2))`, with `gw.length < 2`
   lines routed to fallback. Kills every single-keyword hit incl. the consent
   regression.
3. (Optional, later) negation/opposite guard: if the typed text overlaps a `p:-1`
   choice's keywords more than the good line's, serve *that* choice's existing
   feedback — reuses reviewed strings, authors nothing.
4. Strictness stops hurting once a paraphrase miss doesn't add heat: exempt
   free-text p:0 from :1295 (pairs with §2 item 4).

---

## 4. Two-trainers: smallest next structural step (from 29 §P2 — read-only cross-store display)

Verified current state: root/app never reads `amparoArena` (only a comment at
index.html:3676); the arena never reads `amparo_prx` (zero matches — it reads only
`sr_save` :1061–1066 and `amparoGuidedFlow` :1057). So P2 is fully open. Sketch,
both halves read-only, no shared mutable state (the 29 §P2 argument stands):

**Root side — the hub card that already links to the arena (index.html:3675–3682):**
```js
// inside the practice-hub render, next to the hub_arena card
let ar=null; try{ar=JSON.parse(localStorage.getItem('amparoArena'))}catch(e){}
const arDone=ar&&ar.done?Object.keys(ar.done).length:0;
// if arDone>0, append one line to the card's .pr-st:
//   `${arDone}/24 drills · ${(ar.streak&&ar.streak.n)||0}-day streak`  (+es twin)
```
Pure numerals + existing nouns — no legal content, no `TODO_ATTORNEY` needed. The
moment any wording implies *preparedness* ("you're ready for…"), that sentence is a
`TODO_ATTORNEY` slot per wargames/03 — readiness claims are coaching content.

**Arena side — next to the existing `sr_save` read (arena/index.html:1061):**
```js
let rootPrx=null; try{rootPrx=JSON.parse(localStorage.getItem('amparo_prx'))}catch(e){}
// render one sidebar footer line if root progress exists:
//   "Quick drills at amparohq.com: N done →" (link back to /#practice)
```
Field names inside `amparo_prx` must be confirmed against index.html:5157–5213
before wiring (**unverified here** — shape was read in wargames/29, not re-verified
this round). Same rule: counts only, no preparedness language.

Both are display-only, one file each, no migrations, and they make the two stores
visible to each other's users — the prerequisite for ever arguing about deeper
merging with data instead of vibes. Everything further (P1 attorney-pile
convergence, P3 variant porting) stays sequenced behind this per wargames/29 §4.

---

## 5. Verification log

- CHANGELOG v2.24.0 read; commits c17e5f7/bfa9ba9; tag v2.24.0 exists.
- Arena current source: matcher :1375–1397; crisis :686–694; swan :1123–1126, :1136,
  :1316–1345 (score/upsell still shown, confetti skipped :1331); door hold :1071,
  :1102–1106, :1359, :1363; streak IIFE :1050–1054; readiness :1114/:1437; pressure
  copy :619/:678/:683 vs math :1193/:1241/:1242; heat :1295/:1324; SIT/TOTAL
  :1030–1047; sidebar/tab renderers :1096–1141.
- Matcher tests run with an exact port of the source algorithm (Node, scratchpad);
  corpus scans counted 100 good lines / 15 prefixed / 18 action-only / 11 need-1.
- Root: curveball seed :5126–5139; hub arena card :1931, :3675–3682; no
  `amparoArena` reads.
- **Unverified:** `amparo_prx` field shape this round (see §4); legal accuracy of any
  line (attorney's job); whether 198 audio files cover all SCEN lines post-P0.
