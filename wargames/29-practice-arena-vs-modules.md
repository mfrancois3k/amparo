# 29 — Practice Arena vs. Root Practice Modules

**Loop step 8 design review (game designer + level designer + instructional designer lens), 2026-08-18.**
Scope: structure and mechanics only. No legal content is authored here; every content
slot follows the `TODO_ATTORNEY` convention from `wargames/03-door-module-design.md`
(§ "structure only": decision type, pacing, tone escalation, scoring shape are the design
contribution; every legal sentence is a placeholder for counsel).

All file/line references verified against source at HEAD (v2.23.1, commit 3827122).
Claims that could not be verified are explicitly marked **unverified**.

---

## 0. The two systems, as actually built

| | Root modules (`index.html`) | Arena (`arena/index.html`) |
|---|---|---|
| Content unit | Beat bank: `PRX_LEVELS` (:4729) deals beats (ci 0–8, 20–22, 30+) from `PRX_OPT` (:4771) + officer variants `PRX_VAR` (:4796) | 24 fixed scenarios `SCEN` (:683), each ~3–6 `turns` of `{o:{en,es}, c:[{t,p,f,g,nx}]}` |
| Grouping | Ladder of 5 live levels (8 defined; 3 gated off by flags :4706/:4715) | 6 situations × 4 levels (`SIT` :1018), `TOTAL=24` (:1035) |
| Progress store | `amparo_prx` localStorage (:5157, :5214) — **not** `sr_save`; `sr_save` carries state/lang/zip only (arena reads it read-only at :1051) | `amparoArena` (:1029) |
| Unlock gating | Levels 3 & 5 locked until 0–2 done; 6 after 5; door (7) behind flag (:5908, :3613) | **None** — every tab/situation freely clickable (:1090, :1116) |
| Unwinnable content | Hard mode `PRX_HARD` (:4881): `bothGood`, officer escalates regardless, `PRX_UNSCORED` Set (:4720) suppresses scores, "no trophy on the swan — wrong emotional register" (:6028) | **None** — all 24 levels winnable, scored, confetti'd (:1303) |
| Attorney status | Reviewed bank + `TODO_ATTORNEY` pipeline; unreviewed levels flag-gated off | Whole corpus from the design tool; CHANGELOG v2.23.0 puts it "in the same attorney-review pile"; About modal admits "Pending independent attorney review before launch" (:673) |

---

## 1. The free-text matcher — QA observation verified, and it's worse than observed

**Mechanism (arena :1346–1356):**

```js
const goodC=t.c.find(c=>c.g);
const gw=goodC.t[L].toLowerCase()...split(...).filter(w=>w.length>3);
const overlap=gw.filter(w=>lower.includes(w)).length;
const hit=overlap>=2||KEY.some(k=>lower.includes(k));
if(hit) answer('“'+text+'”',1,goodC.f[L],1);
```

`KEY` (:682) is a **global** whitelist: `silent, silencio, consent, lawyer, abogado,
remain, search, registro, documents, glovebox…`. Any typed answer containing any one
of those words is scored `p=1` on **any** turn and receives **that turn's canned good
feedback** (`goodC.f`). That is exactly the v2.23.1 QA observation: "remain silent +
lawyer" typed on turn 1 of `routine` returns "Announcing movement keeps hands
accounted for" — feedback about a different answer than the one given.

**The design bug underneath the cosmetic one:** on compliance turns the same mechanism
awards a point for the *wrong action*. On `tension` turn 1 ("Turn off the engine and
drop the keys" :720) or `intense` turn 3 (exit order, Mimms :712), typing
"I don't consent to a search" hits `consent`+`search` → **"✓ Good choice" +1**. The
arena's own choice buttons teach that refusing there is the dangerous answer
("This one you must obey" :714). The free-text path directly contradicts the module's
own safety teaching on precisely the turns root treats as comply-only (`PRX_DO`
Set :4740 — "an action, not a spoken line").

**Root's matcher for contrast (:5528–5535):** keywords are extracted per-beat from the
*reviewed* script's curly-quoted phrases (`card.y`), require ≥ half of them, show
per-word chips, and route crisis language to 988 first (`prxIsCrisis` :5519). The
arena's `submitFree` has no crisis check (**verified absent** in :1346–1356).

**Fix shape (no content authoring needed):**
1. Per-turn keywords derived from `goodC.t` only; delete the global `KEY` fallback, or
   demote a KEY-only hit to the `p:0` "Solid instinct — strongest version is…" path
   (`T('fallback')` already exists :1354).
2. Turns whose good choice is compliance get a `comply:true` structural flag; rights-
   assertion keywords on those turns route to a `p:0` coach slot —
   `TODO_ATTORNEY: "why this turn is comply-first"` (one line per flagged turn, ~8 turns).
3. Port root's crisis check into `submitFree` before scoring.

Severity: **CRITICAL** (a trainer that praises the unsafe action on exit-order turns),
plus the cosmetic mismatched-feedback bug.

---

## 2. Beat structure & difficulty curve

### What the arena does well (genuinely better than root)

- **Coherent macro-shape:** 6 situations × 4 rungs with a consistent mood ladder —
  `CALM / TENSE / COMMANDING / HOSTILE` keyed to level index (:1141), officer bubble
  darkening per level (:1143), needle zone 38→16 and period 1.7s→0.65s (:1213–1214),
  timer 7s→5s on hard (:1163). The difficulty *system* escalates on four coupled axes
  (mood, steadiness window, clock, BPM) — root escalates mainly on tone + beat count.
- **Branching:** `nx` pointers let a bad answer spawn a consequence turn
  (`routine` turn 2 bad → "So how fast do you think you were going?" branch :701,
  `branch:true` excluded from `mainMax` :1112). Only **one** scenario uses it
  (single `branch:true` in the file — verified count 1), but the mechanic is the best
  instructional idea in either system: it *shows* the cost of an admission instead of
  narrating it. Root has divergent turns (`PRX_DIVERGE`, per :4816 comments) but no
  recovery-turn pattern.
- **Physiological feedback loop:** BPM rises on misses, drives needle speed
  (`lvlPeriod` reads `__BPM` :1213), tension drone above 105 BPM (:1232), clockBonus
  ±3s earned/lost (:1262). Failure begets pressure begets failure — a real difficulty
  spiral, opt-out via gentle mode. Root has nothing comparable.
- **Supervision-safe mode** (probation/parole coaching adjustment, `supB` :673) —
  root has no equivalent (**verified**: no parole/probation/supervision matches in
  root). This is an instructional-safety idea root should inherit, reviewed by counsel.

### Where the arena contradicts root's deliberate design decisions

**(a) No black-swan level — and hard modes are celebrated.** Root's hard mode is
*deliberately unwinnable*: "its purpose is not skill — it's to break the belief that a
bad outcome means the driver did something wrong" (:4873), every choice `bothGood`,
score suppressed (`PRX_UNSCORED` :4720 — "must never show a score"), and explicitly
no trophy (:6028 "wrong emotional register"). The arena's four hard-mode rungs and
`tension` (guns-drawn felony-style stop, cuffed interrogation :718–731) are all
winnable, scored X/4, and a clean run gets `sfx('win')` + confetti + "Scenario
complete!" + a $3.99 upsell modal (:1288–1317). The emotional register root spent a
design cycle protecting — *you can do everything right and still end up cuffed* — is
inverted into a slot-machine win screen at the exact scenario (cuffs, loudspeakers)
where root suppresses it. Structural fix: an `unscored:true`/`swan:true` flag on
designated SCEN entries that routes `finish()` to a no-confetti, no-score,
no-upsell completion screen; the reframing copy is one `TODO_ATTORNEY` slot per swan
level (root's :5961 comment pattern).

**(b) The door module.** Root: `DOOR_MODULE_ENABLED=false` (:4715) — blocked *beyond*
the attorney gate because DV-response research found the planned correct answer (calm
repeated refusal at the threshold) matches what DV training tells officers to read as
the assailant's presentation; the flag "does not flip on an attorney's sign-off alone;
it needs a domestic-violence clinician too." The arena ships **four live door levels**
(`door1`–`door4` :862–901) teaching exactly that pattern ("I don't consent to entry.
We can talk through the door"), including an impatient-banging variant (`door2`) that
is adjacent to the modal "we got a call about this address" DV case, plus an ICE
I-200/I-205 warrant-reading level (`door3`). Whatever one thinks of the underlying
call, the repo currently *enforces a clinical gate on one surface and ships the
gated content on another*. Structural options: hide `SIT` id `door` behind the same
flag/reasoning until the DV-clinician review clears it, or record an explicit
decision memo that the arena's door framing differs enough to be exempt
(**that judgment is not this reviewer's to make** — it's the DV clinician's).

**(c) Consent to escalation.** Root: "escalation is chosen, never sprung" — per-level
consent warnings (`prWarnOk` :5147), hostile tone only dealt behind consent gates
(:5117), hard mode locked until 0–2 are done (:5908). Arena: any user can tap
`tension` (multiple units, loudspeaker, kneeling at gunpoint) as their **first ever
drill** — no unlock, no warning interstitial beyond the generic pre-drill physical-
safety card (`safeBg`, :1128, traffic-family situations only; it does not fire for
`door`). For an audience that includes stop survivors (the root codebase repeatedly
designs for them, e.g. :5380 crisis note), springing a guns-drawn scenario cold is
the exact failure root's consent design exists to prevent. Fix: sequential unlock
within a situation (Calm must be completed once before Irritated, etc.) *or* root's
consent-interstitial pattern on rungs 2–3. Cheap: `A.done` already has the data;
`renderTabs` (:1110) needs a `locked` branch — root's `.prx-tab.lock` CSS pattern
already exists as prior art (:487).

**(d) State-dependent content shipped uniformly.** Root's `PRX_SIGN` (:4745) exists
because "Sign here" is wrong-by-state (TX refusal = arrestable). The arena's `hard`
level teaches "I don't sign anything without my lawyer" with a caveat clause
("except the ticket itself" :811) but never applies the state override the page
*already knows* (`flowState` is read and used for duty-to-inform/stop-and-ID banners
:1058–1059, :1131–1132). Structure exists; the per-state text is `TODO_ATTORNEY`.

**(e) Voice-line provenance.** Root's bank carries per-line audit comments ("not
model-generated", restoration provenance, reachability caveats :4801–4830). SCEN has
zero per-line provenance. Any merge should preserve root's convention: reviewability
line-by-line is the reason the banks are static (:4791).

### Curve-shape notes (minor)

- Mood labels are uniform by level index, so `door3` ("We have a warrant") renders
  as COMMANDING and `l304` as HOSTILE regardless of the scene's actual register —
  acceptable, but the label is cosmetic, not content-driven.
- `mPressure` UI copy promises "10 seconds per line" (:674) but pressure mode
  *subtracts* one second (baseT 7→6, hard 5→4, :1163) and shrinks the steadiness
  zone ×0.8 (:1214). Copy/code mismatch — **verified**; fix the string or the math.
- Scoring: `A.pts=Math.max(0,A.pts+p)` (:1274), base clamped to `mainMax`, +1 clean
  run, +1 avg steadiness ≥70 (:1292). Coherent. But `A.done[id]` is set on *any*
  completion regardless of score (:1294), and…

---

## 3. Replayability: streaks, badges, curveballs, heat

| Mechanic | Root | Arena |
|---|---|---|
| Streak | Earned at **run completion** (:5948, inside the run-complete block at :5944) | Earned at **page open** — IIFE at load (:1038–1042). Opening the tab daily without practicing keeps the streak. |
| Badges | Per-level ✓/best; master trophy only for scored levels, "no trophy on the swan" (:6028) | Per-situation 🏅 when all 4 rungs *done at any score* (:1089); ⭐ only for a perfect best (:1113). Badge count = completions. |
| Readiness | n/a | `done/24*70 + min(streak,6)*5` (:1098, :1397). **Scores are ignored** — a user who picked every wrong answer on all 24 levels with a 6-day open-the-page streak shows "100% READY" on a shareable card (:1398) urging family to beat it. |
| Curveball | `PRX_CURVE` (:4861): static reviewed bank, curveball changes the *question* never the *answer*, injected from run 2, levels 0–1 only, date-seeded (:5134). `wargames/28` §5.3 flag **still open — verified**: seed still ignores `prx.runs`, so same-day replays get the identical curveball at the identical position. | **No curveball system at all.** Replay variety = pressure-replay mode + heat. Every officer line, order, and answer is fixed per scenario; a second run of any level is verbatim. |
| Heat | n/a | `A.heat` 0–3: +1 on any `p<1` incl. neutral `p:0` (:1267), −1 only on a perfect run (:1296), persisted in `amparoArena` across sessions (whole-`A` save :1036) → "He remembers how the last one went" (:1133) + "(cutting you off)" at heat ≥2 (:1150). Best pure-game-design idea in the arena: cross-run officer memory. Note it also punishes deliberately-neutral `p:0` choices. |

**Design verdicts:**
- Arena wins the *session* loop (needle, BPM, clock, heat, weakest-moment recap
  :1308, pressure replay). Root wins the *content* loop (variants per tone, dated
  curveballs, per-beat miss tracking `prx.miss` :5173 — the arena tracks nothing
  per-turn across runs).
- The arena's fixed decks mean its 24 levels exhaust faster than root's 5:
  root's Level 0 deals tone-pooled variants every run (:5119); the arena's `routine`
  is the same five lines forever. Porting the *shape* of `PRX_VAR`/`PRX_CURVE` into
  SCEN turns (a `v:[…]` variant array per `o`, dealt like :5119) is pure structure;
  the lines themselves are `TODO_ATTORNEY` — and the audio-hash keying (:1194,
  `audioKey(lang+':'+txt)`) already supports per-variant clips, since Voicebox files
  are keyed by exact rendered text.
- The visit-based streak and score-blind readiness both inflate. Cheapest honest
  fix: move the streak increment into `finish()` (mirror root :5948) and add a
  score term to `readyPct` (e.g., Σbest/Σmax weighted). No content involved.
- The wargames/28 curveball-seed one-liner (`seed + runs`) remains unfixed in root
  — third flagging; it also becomes the template for any arena variant dealing.

---

## 4. The two-trainers problem — recommended structure

**Recommendation: Arena becomes the flagship trainer. Root's practice section
becomes the 2-minute quick path + the content pipeline. No second content
authoring track, ever.**

Reasons: the arena's session mechanics are strictly richer and already carry the
198-line Voicebox investment; root's 6.5k-line file cannot absorb the arena UI
without breaking its size discipline; but root owns the only *trustworthy content
process* (attorney gate, provenance comments, flag-gated unreviewed levels, DV
block, state overrides, crisis routing). Direction of flow: **root's guardrails
migrate into the arena; the arena's mechanics do not migrate into root.**

Phased, structure-only:

1. **P0 — safety parity inside the arena (before any growth):**
   a. Free-text fix per §1 (per-turn keywords, comply-turn guard, crisis check).
   b. Swan/unscored flag + celebration suppression per §2a.
   c. Door situation behind the DV-gate decision per §2b.
   d. Unlock/consent gating per §2c.
   All four are ports of decisions root already litigated; none author content
   beyond marked `TODO_ATTORNEY` slots.
2. **P1 — one attorney pile, explicitly:** the arena's ~24×5×2 choice/feedback
   strings + 198 officer lines enter the same review queue as `PRX_WAIT`/
   `PRX_NOSTOP`/`PRX_DOOR`. Where SCEN duplicates root's reviewed beats (the
   `routine` scenario is beats 0/8/1/2/6 in different words — compare :686–700 with
   PRX_OPT 0/8/1/2/6), converge on the *reviewed* root wording so each sentence is
   reviewed once. An `attorney: 'pending'|'reviewed:<edition>'` field per SCEN entry
   mirrors root's edition-locked sign-off note (:2741).
3. **P2 — shared progress, one direction:** keep `amparoArena` and `amparo_prx` as
   separate stores (their shapes are genuinely different), but (i) root's practice
   hub reads `amparoArena` to display arena progress/readiness on the hub card it
   already links from, and (ii) arena reads `amparo_prx.done` to pre-mark the
   equivalent `routine` rung. No two-way write merging — the v2/v3 migration scars
   in root (:5174–5213) are the argument against shared mutable state.
4. **P3 — root practice ladder freezes at its 5 live levels** as the "2-minute
   glovebox drill" (no new root-side levels; PRX_WAIT/NOSTOP/DOOR ship as arena
   swan levels instead when their reviews land). Variant/curveball dealing ports
   into SCEN per §3.

Rejected alternatives: full merge into `index.html` (size, and root's overlay is a
different product register — coach vs. game); killing root modules (they are the
only surface usable in 2 minutes with no audio, and the only attorney-reviewed one
today); shared single store (migration risk, above).

---

## 5. Verification log

- `PRX_LEVELS`/`PRX_OPT`/`PRX_VAR`/`PRX_CURVE`/`PRX_HARD`/`PRX_UNSCORED`/flags — read
  at index.html :4706–4899, :5106–5138.
- Root store is `amparo_prx` (:5157, :5214); **the tasking's "root's `prx` in
  `sr_save`" is incorrect** — `sr_save` holds setup state (state/lang/zip), which the
  arena maps postal→FIPS read-only (:1049–1054).
- Arena SCEN 24 entries = 3 inline + push batches (:683–1017); SIT 6×4 (:1018–1025);
  TOTAL 24 (:1035). All 24 turn trees spot-read; door/tension/hard read in full.
- Free-text matcher, KEY, timer, needle, heat, BPM, finish/confetti, streak IIFE,
  readiness formula, share card — read at :682, :1029–1042, :1093–1103, :1123–1176,
  :1213–1317, :1346–1370, :1397–1422.
- Root matcher + crisis path (:5380–5403, :5518–5537); gating (:3609–3613, :5908);
  streak-on-completion (:5944–5951); curveball seed still ignores runs (:5134).
- `wargames/03` TODO_ATTORNEY convention (§ quoted at lines 23–28, 242–245);
  `wargames/28` §5.3 curveball flag (lines 174–195, 335–337).
- **Unverified / out of scope:** whether the arena's legal statements are accurate
  (attorney's job — every flagged slot above is `TODO_ATTORNEY`); whether all 198
  audio hashes cover every SCEN line (CHANGELOG claim, not re-derived here); mobile
  behavior of the retry/say-it-back widget (:1283) under the freeze-timeout path.
