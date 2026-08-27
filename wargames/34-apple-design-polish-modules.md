# 34 — Practice Module Design Review (Root Ladder, Post-v2.26.2)

**Loop step 8 design review — game designer + level designer + instructional designer
lens. 2026-08-27, HEAD `980d3d6` (v2.26.2, tagged locally, not yet pushed).**
Follows `wargames/03-door-module-design.md`, `wargames/29-practice-arena-vs-modules.md`,
`wargames/31-paywall-meets-ladder.md`. Scope is **root `index.html`'s practice engine
only** (`PRX_LEVELS`/`PRX_OPT`/`PRX_VAR` and everything that deals from them) — the
arena (`arena/index.html`) already got a full structural comparison in wargames/29 and
31 and is out of scope here. Structure and mechanics only: every content slot follows
the `TODO_ATTORNEY` (and, where applicable, `TODO_DV_CLINICIAN`) convention from
wargames/03 — no officer dialogue, no legal copy, no coach line is authored in this
document. This round does **not** relitigate attorney/DV-clinician sign-off; that gate
is already tracked (`FINAL_SCENARIOS_ENABLED`, `DOOR_MODULE_ENABLED`, both `false`) and
is not re-argued here.

All line numbers verified by direct read of `index.html` (6665 lines) at this commit.
Claims that could not be verified are marked **unverified**.

---

## 0. The ladder as actually built today — not as remembered from wargames/03

The level set has been restructured since wargames/03 (2026-08-03) and wargames/29
(2026-08-18). The old index-3 "hard stop" (6 beats, `ids:[0,8,1,2,3,7]`, flagged in
wargames/03 §5.6 as "not structurally distinct from level 1") is **gone** —
deleted, not merged. Its swan/unwinnable ending was moved onto what is now Hard Mode
(comment at :4989, confirms this explicitly). A version-stamped migration
(:5290–5329) remaps any returning user's saved progress rather than guessing at it,
and drops the old level's best/done data outright rather than inventing a result for a
level that no longer exists — same "don't invent progress" reasoning the code uses
twice (:5296, :5317).

| Idx | `PRX_LEVELS`/deck source | Beats | Tone pool | Gated | Scored | Live today |
|---|---|---|---|---|---|---|
| 0 | `ids:[0,8,1,2,6]` | 5 | `['calm']` | no | yes | yes |
| 1 | `ids:[0,8,1,2,4,5]` | 6 | `['curt']` | no | yes | yes |
| 2 | `ids:[3,2,7]` | 3 | `['curt','hostile']` | consent gate | yes | yes |
| 3 | `PRX_HARD` (:4997) | 3 | fixed, `bothGood` | **mastery-locked** | **never** (`PRX_UNSCORED`) | yes |
| 4 | `PRX_CHK` (:5061) | 4 | fixed | consent gate only | yes | yes |
| 5 | `PRX_WAIT` (:5087) | 6 | fixed | mastery-locked | never | **dark** (`FINAL_SCENARIOS_ENABLED=false`, :4822) |
| 6 | `PRX_NOSTOP` (:5156) | 6 | fixed | mastery + `done[5]` | never | **dark** (same flag) |
| 7 | `PRX_DOOR` (:5136) | 6 | fixed | mastery-locked, own hub tab | never | **dark** (`DOOR_MODULE_ENABLED=false`, :4831) |

`PRX_LEVEL_IDS` (:4852) is `[0,1,2,3,4]` while `FINAL_SCENARIOS_ENABLED` is false — so
**five tabs actually render** in the ladder select screen today; two "finished but dark"
scenarios and the door module (which lives on its own hub tab, :4855) exist in the
bundle, fully wired, content-empty. Mastery gate and certificate are still exactly the
0/1/2 set (`mUnlocked`/`mUnlocked` at :5725 and :6025; cert loop at :5951) — unchanged
from wargames/03, still correctly excludes the checkpoint.

---

## 1. Continuity check — wargames 03/29/31's open items, re-verified against `980d3d6`

Six items landed since the last time anyone looked. One is a genuine fix that quietly
reopened the same class of bug on different content — that gets its own section (§2).

| # | Finding | Prior status | Status now | Evidence |
|---|---|---|---|---|
| 1 | wargames/03 §5.5 — level 2 is a 2-beat spike behind a heavy warning | open | **FIXED** | `ids:[3,2,7]` (:4845) — `ci:2` inserted between exit order and arrest, exactly the fix wargames/03 recommended by name ("the natural insertion... `ci 2` already exists"). Git: `93d0b0c fix: Level 2 practice spike -- insert ci:2 into PRX_LEVELS[2].ids`. |
| 2 | wargames/03 §5.7 — `parseInt(prx.best[i])` drops the denominator, a perfect 2/2 renders worse than a mediocre 4/5 | open | **FIXED** | :6044 now renders `` `🟩${esc(prx.best[i])}` `` — the full stored `"n/m"` string, not `parseInt`'d. A dedicated v3 migration (:5313–5329) also retires any old `"2/2"` best that the level-2 beat-count change made unreproducible, rather than let it sit as an unbeatable stale high score. |
| 3 | wargames/03 §4.2 — warn-copy ternary has no branch for the door's index, falls through to the wrong (arrest) warning | open (a trap, not yet tripped) | **RESOLVED**, by restructuring rather than a patch | Current ternary (:6057) explicitly branches 7→`prx_warn9`, 6→`prx_warn8`, 5→`prx_warn7`, 4→`prx_warn6`, 3→`prx_warn4`, else→`prx_warn3`. The old trap doesn't exist because the level whose warning it stole (old index 3, "ends with an arrest") **is** the fallback case's actual content now — level 2 ends in an arrest beat (`ci:7`) and `prx_warn3`'s text ("...ends with an arrest...") is correct for it today. Verified the gate can only be reached by `prLevel>=2` (:6056), and only 2/3/4 are reachable with both dark-content flags off, so there is no live off-by-one today. |
| 4 | wargames/03 §5.2 — the arrest beat (`ci:7`) has zero hostile `PRX_VAR` variants, so the level that requires hostile tone falls back to robotic TTS on its climactic line | open | **FIXED, twice over** | (a) The deck-fallback branch now always sets `id:'c'+ci` (:5238–5243), routing to a canonical recorded clip instead of TTS — comment at :5238 names the exact prior bug ("previously unreachable... silently dropped to robotic TTS"). (b) Independently, the level that deals `ci:7` today is index 2, whose tone pool is `['curt','hostile']`, not `['hostile']` alone — the filter at :5236 already resolves to `v7_2`/`v7_3` (both `curt`, real recorded variants) without needing the fallback at all. |
| 5 | wargames/03 §3 note — correct-answer screen position alternates on a fixed `prIdx%2` pattern, learnable after one run | noted, not flagged as a bug | **IMPROVED past the ask** | `swap` is now a per-beat coin flip set once at deal time (:5213–5221), not a render-time `prIdx%2` read. Comment explains why: the old scheme "showed the correct answer in the same screen position... on every run of every level, for every player, forever," training "which side to tap" instead of "which words are right." |
| 6 | wargames/03 §5.4 — ~45 authored officer-line variants exist but nothing tells the user the script varies between runs | open | **FIXED** | `prx_sel_sub` ("Two minutes each, out loud. The officer's wording changes every run.") now sits above the level list on the select screen (:6039), and the comment at :6037 explicitly names it: "carries Move 6: users are told the officer's wording changes." Cheaper and better-placed than the original suggestion (a results-screen sentence) — this primes the expectation before the run starts, not after. |
| 7 | wargames/03 §5.3 / wargames/29 / wargames/31 — daily curveball is seeded on date only; same-day replays get the identical curveball at the identical deck position | open, "5th flagging" as of wargames/31 | **STILL OPEN — 6th flagging** | :5250: `seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate()`. `prx.runs[prLevel]` (already tracked, already read one line above at :5248) is still not folded into the seed. One-line fix, unchanged since 2026-08-03. |

Item 4's fallback-audio fix and item 6's Move 6 line are both explicitly named in their
own code comments, which suggests they were done as deliberate, tracked responses to
prior review rather than incidental — worth noting because it means the loop is
actually closing the findings it produces, not just accumulating them.

---

## 2. The unwinnable-beat bug didn't get root-caused — it moved

This is the most important finding in this review, and it's a direct sequel to
wargames/03 §5.1 (CRITICAL).

**The mechanism, unchanged and now unified.** Both the typed and spoken answer paths
score against curly-quoted spans pulled from the reviewed script (`card.y`):
`(card.y.match(/"([^"]+)"/g)||[])`, once in `prxCompareShow()` (:5509, voice/compare
path) and once in `prxTypeAnswer()` (:5646, the in-chat typed path). **This part of
wargames/03's root-cause recommendation was taken** — the two call sites are now
identical in shape and comment-linked ("Type mode:... Same matcher... never graded
differently," :5619), a real improvement over the drifted duplication wargames/03
found. But the specific defect survives in both copies:

```js
const good = words.length>0 && hits.length>=Math.ceil(words.length/2);
```

If `card.y` contains no `"…"` phrase, `words.length===0`, `good` is forced `false`,
and — critically — **nothing routes this to the unscored tier.** `prCurTier` becomes
`'y'` (a miss), not `'x'` (unscored, the mechanism the crisis-disclosure path already
uses at :5492 for exactly this "don't score it" purpose). The user sees a generic retry
message with no keyword chips (`words.length` gates the chip row at :5516) and no way
to ever pass, regardless of what they type or say.

**wargames/03 named two victims of this: `ci:5` ("Sign here") and `ci:33` ("Pull over
to secondary"). Both are now safe** — not because their `y` text was fixed, but
because both are members of `PRX_DO` (:4856, `new Set([3,5,33])`), and `hasConsole`
(:6190) is gated `&&!isDo` — the free-text console never renders for a `PRX_DO` beat at
all, so the scoring path that could fail on them is simply never reached. That's a
legitimate fix for those two cards specifically (they're physical-action beats;
suppressing free text on "sign the ticket" loses nothing).

**But the underlying contract — every scored, non-`PRX_DO` card's `y` must contain at
least one curly-quoted phrase — was never asserted anywhere**, and it has since broken
again, live, on two checkpoint beats that are not `PRX_DO` and do show the console:

```js
PRACTICE.en[30]={o:"“Citizenship?”", y:"Decline calmly, or answer briefly — but never volunteer where you've been."};        // :5176 — no “…” span
PRACTICE.en[31]={o:"“Where were you born?”", y:"You don't have to answer. Never lie, and never hand over a foreign document."}; // :5178 — no “…” span
```

Both EN and ES copies of `ci:30`/`ci:31` (:5176–5179) lack a quoted phrase; `ci:32`
(:5180) has one (`"I don't consent to a search."`) and is fine; `ci:33` has none but is
`PRX_DO`-exempt as noted above. **Result: on the Checkpoint level, typing or saying any
answer to "Citizenship?" or "Where were you born?" — including the exact reviewed
line — can never register as correct.** Only the tap-a-button path can pass those two
beats.

**Why this is the sharpest possible place for this bug to reappear, instructionally.**
The checkpoint's own header comment (:5042–5045) states its failure mode explicitly:
*"the other decks train against PANIC — this one trains against VOLUNTEERING. The agent
is businesslike... the mistake is answering a question you never had to answer."*
Volunteering is a free-response failure — it happens in a driver's own words, which is
exactly what the type/voice path exists to rehearse. The two beats where an
over-explaining answer is most realistic ("just visiting family," "I was born in...")
are precisely the two where the free-response path is silently incapable of ever
confirming the *disciplined* version of that same answer. The level can catch you
volunteering, but it cannot ever tell you that you didn't.

**Root-cause fix (this is the fix wargames/03 already specified — it just wasn't
applied broadly enough):**
1. Cheapest, no content authoring: when `words.length===0`, set `prCurTier='x'`
   (unscored) instead of `'y'` (miss) — one guard, both call sites, and it makes any
   *future* card that ships without a quoted phrase fail safe instead of failing
   silent-and-graded. This is the change that actually closes the class of bug, not
   just today's two instances.
2. Content-side, requires no legal authoring, just punctuation: add a `"…"` span to
   `ci:30`/`ci:31`'s existing, already-reviewed `y` text (e.g., wrapping the phrase a
   user is meant to say) — a copy-formatting fix, not a new legal claim, so it doesn't
   need to reopen attorney review.

Both are small. Doing only #2 fixes today's two beats and repeats the wargames/03
mistake of patching instances instead of the contract. Doing #1 (with or without #2)
is the one-line change that stops this from being the second time this exact defect
has had to be found by hand.

---

## 3. Authored content that cannot currently be dealt

Three of `PRX_VAR`'s own inline comments (:4917–4924, :4930–4933, :4956–4959) state
outright that five hostile-tone officer-line variants — `v0_4`, `v0_5` (ci 0),
`v1_4`, `v1_5` (ci 1), and `v4_4` (ci 4) — are **not reachable by any live path**, and
say so explicitly enough that this needed no inference, only confirmation:

- `v0_4`/`v0_5`: Level 0's tone pool is `['calm']` only (:5233) and "Level 0 has no
  `PRX_DIVERGE` entry at all" (§4 below).
- `v1_4`/`v1_5`: Level 1's tone pool is `['curt']` only, and its `PRX_DIVERGE` entry
  "only targets calm/curt, never hostile."
- `v4_4`: `ci:4` only appears in Level 1's `ids`, and "Level 2 (the only
  hostile-capable level) never deals `ci:4`."

These are recorded lines — the restoration comments (:4917, :4939) describe them being
pulled back from a deletion, matched against existing audio in all four voice folders,
and round-tripped through a transcription check before restoring, i.e. this is
finished, reviewed-bank content, not a stub. Structurally, though, it means **Levels 0
and 1 have a hard ceiling: no matter how many times a user replays them, or which daily
curveball lands, the officer's tone on beats 0, 1, and 4 can never reach hostile.** All
of the ladder's tonal range past `curt` is concentrated in Level 2 and Hard Mode.

That may be exactly the intended curve — Level 0/1 are named "Calm stop" and
"Irritated officer," not "hostile," so never dealing a hostile line there is arguably
correct *by design*, not a bug. But if so, the five lines are pure carrying cost: audio
files, review surface, code volume, with zero path to a user ever hearing them. Two
honest resolutions, in laziness order:
1. **Cheapest:** leave a short comment at each site marking them intentionally-dead
   floor content (the calm/curt ceiling for those levels is a design choice), and stop
   returning to them as a "reachability" question each time someone reads the bank —
   they're already three-times-documented as unreachable; a fourth confirmation is
   wasted review time.
2. **If the intent was ever for Level 1 to spike hostile on repeated failure or a
   curveball:** extend `PRX_DIVERGE[1]` (§4) to target `'hostile'` as a bad-answer
   consequence, or add `'hostile'` to Level 1's tone-pool literal (:5233) — content
   already exists, reviewed, recorded; this is a one-line wiring change, not new
   authoring.

---

## 4. `PRX_DIVERGE` is the ladder's real escalation mechanic — and it's better than it looks from the data shapes alone

wargames/03 stated flatly that the engine has "no branching, no state carried between
beats." That was true of the engine at the time; it undersells what shipped since.
`PRX_DIVERGE` (:5762) is a small, real, cross-beat reactivity mechanic:

```js
const PRX_DIVERGE={1:{g:'calm',b:'curt'},2:{g:'curt',b:'hostile'}};
function prxDiverge(){
  const dir=PRX_DIVERGE[prLevel];
  if(!dir||prCurTier==='x') return;
  const next=prDeck[prIdx+1];
  if(!next||next.curve) return;
  const want=prCurTier==='g'?dir.g:dir.b;
  if(next.tone===want) return;
  const pool=(PRX_VAR[next.ci]||[]).filter(v=>v.tone===want);
  if(!pool.length) return;
  const v=pool[Math.floor(Math.random()*pool.length)];
  Object.assign(next,{officer:{en:v.en,es:v.es},tone:v.tone,id:v.id});
}
```

Called from `prxAdvance()` (:5776) *before* `prCurTier` is cleared. In plain terms: on
Levels 1–2 only, picking the good option re-rolls the **next** beat's officer line
toward a calmer/curter variant; picking the bad option re-rolls it toward curter/more
hostile. The beat sequence itself (which `ci` comes next) never changes — this is mood
branching, not decision branching — but it is a genuine, verified instance of the
officer's demeanor responding to what the player just did, not merely to a fixed
tone-pool-per-level schedule.

**This is a real answer to the brief's "does the escalation teach the right instinct or
just test recall" question**, and it earns a positive callout: a user who handles a
beat well is rewarded with a calmer follow-up line; a user who fumbles gets a curter
one. That models something true (tone begets tone) without ever letting the *content*
of the next decision depend on a wrong answer — nobody is punished with a harder
question, only a harder-sounding one.

**The one thing worth flagging is a sequencing question, not a bug**, and the code may
already have it half-answered: Levels 1–2 spend their whole runtime teaching (via
`PRX_DIVERGE`) that calm, correct answers visibly ease the officer's tone. Hard Mode —
unlocked immediately after — exists specifically to break *"the belief that a bad
outcome means the driver did something wrong"* (:4990). Played back to back, the
ladder teaches the (mostly true, worth-building) intuition first, then deliberately
breaks it. That's a defensible arc if it's intentional, and `prx_hard_b2` ("You can't
always control how an officer acts... when it isn't, the fault is not yours") already
does real work naming the contrast, though it never explicitly says "unlike the last
two stops." Given how much load-bearing work the wording already does, this is a
one-line-if-ever polish, not a gap — flagged for awareness, not as a fix to make.

---

## 5. Minor findings

**(a) The debrief screen renders a duplicate button on the three dark levels — a small
recurrence of the exact bug class `PRX_UNSCORED` was created to prevent.**
`PRX_UNSCORED`'s own comment (:4832–4835) explains its origin: a one-off `i===N` guard
"had to be found and edited at three separate sites, and one of them was missed," so it
became a `Set` instead. One function away, the same pattern has reappeared in
miniature. The shared debrief footer (`foot`, :6105–6112) suppresses its own
carry-card link with a literal `prLevel===3` check (:6107) — but the wait/nostop/door
branch (:6115–6128) *and* the Hard Mode branch (:6130–6143) both already render an
explicit, differently-styled carry-card button of their own before appending `${foot}`.
The `===3` guard only catches Hard Mode; on Levels 5/6/7 (dark today, but fully wired)
the debrief will render two "print your wallet card" buttons, one primary-styled, one
link-styled, both calling `carryOpen()`. One-line fix: change the guard at :6107 from
`prLevel===3` to `PRX_UNSCORED.has(prLevel)` — which is the exact fix `PRX_UNSCORED`
was introduced to make trivial. Currently invisible (both dark-content flags are
`false`), so zero user impact today, but it ships broken the moment either flag flips
unless caught first.

**(b) The checkpoint's own cited legal spine never surfaces as a `PRX_CITES` badge.**
`PRX_CHK`'s header comment (:5047–5056) names `Martinez-Fuerte`, `Ortiz`, and two
federal statutes as the level's "legal spine (settled, decades old)" — more explicit
constitutional grounding than any other level's header comment carries. But
`PRX_CITES` (:4875–4878) has no entries for `ci:30`–`33`; the ⚖️ "why you can" badge
(rendered at :6248 for whatever `ci` the live beat is) simply never appears on the
checkpoint. Every other level with a citable beat (`ci:1,2,3,4,6,7,8`) gets the badge.
This may be deliberate — the comment also says state-statute cites belong on the state
page, "not baked into a rehearsal script" — but if federal/constitutional cites are the
one class `PRX_CITES` exists to carry (per its own comment at :4873), the checkpoint
reads like an omission rather than a choice. Structural-only flag; the citation text
itself is `TODO_ATTORNEY` if it doesn't already exist reviewed elsewhere.

**(c) Hub tab order doesn't match its own constant names.** The 3-tab hub strip
(:3735–3737) renders `hub_m1` (Traffic), then `hub_m3` (Checkpoint), then `hub_m2`
(Door) — i.e., visually Traffic/Checkpoint/Door while the constants are named
1/2/3=Traffic/Door/Checkpoint. Purely a naming residue from whenever the visual order
was last reshuffled; harmless, but a renumbering (`hub_m1/hub_m2/hub_m3` →
`hub_traffic/hub_door/hub_checkpoint`) would remove a "why doesn't m2 render second"
trap for the next person reading this file cold.

---

## 6. What the curve looks like today, and the one open pacing question

| Idx | Level | Beats | Failure mode trained | Structurally distinct from its neighbors? |
|---|---|---|---|---|
| 0 | Calm stop | 5 | learning the script | yes — sole `['calm']` pool |
| 1 | Irritated | 6 | holding it under irritation | yes — adds DWI/signature beats |
| 2 | Ordered out | 3 | compliance + invocation, ends in arrest | yes — only scored level with an arrest ending |
| 3 | Hard mode | 3 | self-blame | yes — only `bothGood`, only unscored-and-masterable-adjacent |
| 4 | Checkpoint | 4 | volunteering | yes — sole federal/non-hostile encounter |

Every live level is now doing distinct instructional work — wargames/03 §5.6's "level 3
isn't structurally distinct from level 1" finding doesn't have a current analogue,
because the level it was about no longer exists and its replacement (today's index 2)
earns its slot on its own beats.

**The one open pacing question, not a finding:** the level directly *before* Hard Mode
now climaxes in a scored arrest (index 2, 3 beats), and Hard Mode immediately after it
also climaxes in escalation but explicitly refuses to score it. Back-to-back, that's
two consecutive "it ends badly" scenarios with opposite scoring philosophies. Given §4
above, this reads as the intended one-two structure (teach that calm answers usually
help, then deliberately show the case where they don't) rather than an accident — but
it's worth watching once there's usage data, since it's the one place in the live
ladder where two adjacent levels could plausibly read as redundant rather than
progressive if the contrast isn't landing. No action recommended; flagged for
awareness only.

---

## 7. If one thing gets fixed from this document

**§2's root-cause fix** — route `words.length===0` to `prCurTier='x'` in both
`prxCompareShow()` (:5509–5513) and `prxTypeAnswer()` (:5646–5651), instead of letting
it fall through to a forced, unexplained miss. It's a one-guard, two-call-site change,
touches no legal content, and closes a defect that has now independently appeared
twice on live, scored, non-`PRX_DO` beats (`ci:5`/`ci:33` originally, `ci:30`/`ci:31`
today) precisely on the level whose entire teaching goal — don't volunteer, in your own
words — depends on the free-response path actually being scoreable.

---

## Verification log

- Level table (§0): `PRX_LEVELS` :4845–4849, `PRX_LEVEL_IDS` :4852, `PRX_DOOR_IDS`
  :4855, `PRX_UNSCORED` :4836, `FINAL_SCENARIOS_ENABLED` :4822,
  `DOOR_MODULE_ENABLED` :4831, mastery gate :5725/:6025, cert loop :5951, level-index
  migration :5290–5329.
- §1 items: level-2 ids :4845 + git `93d0b0c`; score string :6044 + migration
  :5313–5329; warn ternary :6056–6058; audio fallback :5238–5243 + tone pool :5233,
  5236; `swap` :5213–5222; `prx_sel_sub` copy :2005 + wiring :6037–6039; curveball seed
  :5248–5252.
- §2: matcher :5481–5519 (`prxCompareShow`), :5632–5654 (`prxTypeAnswer`); `PRX_DO`
  :4856; `hasConsole`/`isDo` :6185, :6190; `ci:30`/`31`/`32`/`33` EN+ES :5176–5183;
  crisis unscored precedent :5488–5499.
- §3: `PRX_VAR` restoration comments :4917–4924 (v0_4/v0_5), :4930–4933 (v1_4/v1_5),
  :4939–4946 (v2_4, confirmed independently reachable — see below), :4956–4959 (v4_4);
  tone pools :5233.
- §4: `PRX_DIVERGE` :5762, `prxDiverge` :5763–5774, call site :5776; Hard Mode intent
  comment :4989–4996; `prx_hard_b2` copy :2071 (en) / :2426 (es).
- §5a: `PRX_UNSCORED` origin comment :4832–4835; `foot` :6105–6112; branch usages
  :6115–6128 (wait/nostop/door), :6130–6143 (hard mode).
- §5b: `PRX_CHK` header :5037–5060; `PRX_CITES` :4873–4878; render site :6248.
- §5c: hub tab strip :3735–3737; `hub_m1/2/3` i18n :2030 (en), :2393 (es).
- §6: derived from §0's table; no new line refs.
- Commit verified: `980d3d6` (`git rev-parse HEAD`), 2026-08-27, matches the task's
  stated "just shipped" tag.
- **Unverified / explicitly out of scope:** whether `v2_4` (ci 2, hostile) is reachable
  was cross-checked against the current tone pool for Level 2 (`['curt','hostile']`,
  :5233, filtering `PRX_VAR[2]` at :4935–4946) and found reachable via the plain random
  pool today, independent of the restoration comment's claim that `PRX_DIVERGE` is
  "the feature that reaches it" — the comment predates the level-2 `ci:2` insertion
  (item 1, §1) and is stale but not wrong; not treated as a finding since the content
  is reachable either way. Audio-file existence for any clip id named in this document
  (`c<ci>.mp3`, `v<beat>_<n>.mp3`) is asserted by code comments, not independently
  confirmed against the `audio/` directory. Attorney/DV-clinician review status of any
  `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` content — out of scope per this loop step's
  instructions, tracked elsewhere.
