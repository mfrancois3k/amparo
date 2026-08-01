# Wargame 01 — Expert panel, blind spots, and the sequencing decision

Wargamed from three inputs: the **real user transcript** (first complete-funnel
user, Brooklyn, Android), the AI topic summary, and an outside AI's product
prompt. Executor: a mid-tier model. Nothing here is executed by the war-gamer.

## Recon (read-only, completed)

| Claim to verify | Finding |
|---|---|
| Practice has scoring | Yes — 20 references, `prx.best` per level |
| Question rewording exists | **Partly already built**: `PRX_VAR` ~45 officer-line variants, `PRX_CURVE` ~10 curveballs |
| Practice level count | 6 |
| Any payment integration | **None.** No Stripe, no checkout |
| Statute auto-check | Daily via Actions; TX/NY reached, **GA unreachable from CI** |
| Attorney review | **Zero attorneys engaged.** Badge scaffold exists, never filled |

**RECON NEEDED — the outside AI's prompt asserts two things that are false today.**
It says "attorney sign-off per state is still in progress" (no attorney has been
contacted) and "statute sources are auto-checked daily" (true for 3 of 4; GA
403s the runner). Any copy generated from that prompt inherits both errors.
Check that settles it: read `research/law-watch.json` `_comment`, and confirm
`REVIEW.attorneys` in `index.html` is still all-empty strings.

---

## PART 1 — The panel

Roles are listed by **what they'd catch that nobody else would**. A role that
duplicates another's catch is not on the panel.

### Blocking (cannot scale without)

| Role | Unique catch |
|---|---|
| **UPL / regulatory attorney** | Whether the *scored* practice engine is unauthorised practice of law. `Upsolve v. James` (2d Cir. 2025) held a state may bar free nonprofit "what to say" guidance. Scoring a specific person's specific words is the exposed part — not the statute pages. |
| **Per-state licensed attorney** | Whether each state's cited rule is still correct. Nothing else on this list can sign that. |
| **Immigration attorney** | The checkpoint level. Already shipped, highest consequence, unreviewed. |
| **Legal-aid / public defender** | What actually happens after the stop — bail, arraignment, what signing binds you to. Appellate-minded lawyers do not have this. |

### The roles nobody on your panels has named

| Role | Unique catch |
|---|---|
| **Instructional designer / learning scientist** | The product's premise is *recall under stress*, and it has **no spaced repetition**. One rehearsal decays in days. This is the single biggest unexploited lever and no game or legal role will raise it. |
| **Stress-inoculation psychologist** | Whether escalating difficulty *inoculates* or *sensitises*. Same literature that justifies rehearsal also documents making anxiety worse with badly-paced exposure. |
| **Certified ES transcreation specialist** | Whether "consent", "reasonable suspicion", "detained" carry the same weight for a Dominican vs Mexican vs Salvadoran reader. Machine-adjacent Spanish fails silently — no bug report, users just leave. |

### Game roles (the lens you asked for — and it is the right lens)

The transcript proves it: your user **spontaneously gamified it.** "I was
gamifying that, I was like yo I got that wrong… I was pissed. I better see a
6 out of 6." That is not a legal-tool reaction. That is a player.

| Role | Unique catch |
|---|---|
| **Encounter / combat designer** | The escalation beat is an encounter, not a quiz. Pacing of officer aggression, tell-then-strike rhythm, whether the player can read the turn. Closest existing discipline to what Hard Mode is doing. |
| **Level designer** | Difficulty curve and **gating**. Hard Mode's lesson only lands if the easy levels came first — entered cold it reads as a broken app, not a truth. |
| **Systems designer** | What the score *means*. "4/6" currently implies the player failed. For a game audience that is motivating; for a person who has actually been through a stop it may be harmful. This is a systems decision, not a copy tweak. |
| **Game master / scenario designer** | Improvised rewording so answers can't be memorised — your user asked for exactly this. `PRX_VAR` already does ~45 variants; the gap is that it isn't *surfaced* as replayability. |
| **Tutorial / onboarding designer** | The 97% pre-state-picker drop is a **tutorial failure**, the most studied problem in games. |
| **Playtest lead** | Structured observation instead of one friend's goodwill. Your user WAS this, unpaid, once. |
| **Economy designer** | If anything is ever priced, this is who decides whether 99¢ on the pack is correct. See the fork below — it is not obviously correct. |
| **Game accessibility specialist** | Distinct from web a11y: colour-blind score states, timing pressure, no-fail modes for players who freeze. |

### Deliberately NOT on the panel

- **Growth / performance marketer** — you have 66 visitors and one completed
  funnel. Acquisition advice now optimises a leaking bucket.
- **Backend / DB architect** — the on-device promise is the moat. Anyone whose
  instinct is a server is a liability here.
- **VR / 3D designer** (raised in the transcript re: gun scenarios) — correct
  instinct, wrong decade. Costs 100× the current build for an audience on
  prepaid Android.

---

## PART 2 — Blind spots

Ranked by cost of being wrong.

### BS-1 — Your most engaged user does not drive

> "I don't drive, I just want to see what the paperwork says."

He is not the target user, and he is the **only person who completed the
funnel.** Every persona, every funnel, every CTA assumes a driver. If the
strongest engagement comes from a non-driver, the addressable audience is
"people who fear police contact", not "drivers" — and passengers, teenagers
being taught by parents, and people who just want to know are all currently
funnelled through a driver-shaped wizard.

### BS-2 — He came for the paperwork and stayed for the game. The flow is inverted.

> "I skip all of that… then at the end it was like, here's some scenarios, and
> that's when I was like, I'm interested now."

Current order: wizard → pack → *then* practice is offered. He had to fight
through the thing he wanted in order to accidentally discover the thing that
hooked him. The gold post-print practice button exists and he **still didn't
tap it** — because by then he had what he came for.

### BS-3 — I was wrong about the document step, and the transcript proves it

Earlier this session I saw `sr_doc_added` in his event log and recommended
holding the removal. **The transcript overrides that inference.** He was
skipping *toward* the paperwork; the doc step was in the way. Your other friend
independently said the ID placeholder is redundant because people already keep
insurance in the glovebox. Removing it was correct. Event logs showed the
action; only the interview showed the intent.

### BS-4 — The score creates a failure identity, and that cuts both ways

He got 4/6 and was "pissed" — engagement. But the target audience includes
people who have been genuinely traumatised by a stop. A number telling them
they failed at surviving a police encounter is a different experience for them
than for a competitive friend. **Nobody on any panel so far has raised this.**

### BS-5 — Hard Mode's meaning depends on gating that is currently soft

The whole moral payload — *you did everything right and it still went wrong* —
requires having first experienced levels where doing it right worked. Reached
cold, it reads as a bug.

### BS-6 — No spaced repetition, in a product whose entire premise is recall under stress

One rehearsal, then nothing. No reminder, no decay model, no second exposure.
He returned after two days **on his own**, with nothing pulling him. That is
demand for a return mechanic that does not exist.

### BS-7 — The outside AI's prompt encodes two false facts

"Attorney sign-off in progress" (nobody contacted) and "sources auto-checked
daily" (3 of 4). Anything generated from that prompt will confidently state
both. This is how a trust product acquires a lie.

---

## PART 3 — The fork that decides everything else

**FORK-1: does anything cost money?**

Your user proposed 99¢ for the personalised PDF. It is a good instinct about
*where* value concentrates, and it collides with three things you already built:

1. **The privacy promise.** Payment creates an identity and payment trail —
   the one thing "nothing leaves your phone" currently guarantees against.
2. **The Luis persona**, verbatim from your own focus group: has the money,
   *won't leave a payment record for this product*.
3. **The positioning.** You'd be charging for the fire alarm and giving away
   the fire drill.

- **Trigger for Route A (stay free):** if the UPL attorney says the scored
  engine is exposed. Charging money converts an educational tool into a
  commercial legal service and worsens every UPL argument.
- **Trigger for Route B (charge 99¢ for the pack):** if UPL clears AND you
  accept losing the Luis segment entirely. Requires a cash-like or
  no-account path, or you lose exactly the users who need it most.
- **Route C (recommended pending UPL):** charge nothing; treat the pack as the
  product and the practice as the retention loop. Revisit only after an
  attorney has signed at least one state.

**Do not resolve this fork by intuition. It is the one decision that is
expensive to reverse.**

---

## PART 4 — The roadmap, as moves

### Move 1 — Ask the four questions, then decide the docs step
- **Action:** send your user the four questions already drafted (print worked? why the 2-day return? did you see the practice button? were the licence photos useful?).
- **Expected observation:** four answers. Specifically an answer on whether print produced paper.
- **Failure → signal → counter-move:** he gives vague positives → you led him → re-ask neutrally, one question per message, no implied answer.
- **Fork trigger:** if print did NOT produce paper → Move 2 becomes priority-1 and the whole print funnel is the bottleneck, not the CTA.
- **Abort:** none. This is free and blocks nothing.
- **Verification:** four discrete answers written down. Pass = you can quote each.

### Move 2 — Invert the funnel: practice first, pack second
- **Action:** make a scenario playable from the landing screen with no wizard. Pack build becomes the *reward*, offered after the first scenario.
- **Expected observation:** `sr_practice_*` events fire for users with no `sr_state_selected`. The 97% pre-state drop moves measurably.
- **Failure → signal → counter-move:**
  - practice needs state data → scenario errors on `data.state` null → run the state-agnostic federal deck (already exists for the 48 pending states) until a state is chosen.
  - engagement rises but pack completion falls → fewer `sr_pack_printed` → re-offer pack at scenario end AND in the nav, not only post-print.
- **Fork trigger:** if Move 1 reveals print was broken, do Move 3 before this.
- **RECON SETTLED (verified in browser):** practice runs fine with `data.state = null` — overlay opens, 5-beat deck builds, both options render, officer line reads normally. So Move 2 is a **routing change, not a refactor**: the engine already works stateless. This was the move's biggest assumed cost and it is not real.
- **Abort:** if practice cannot run without a state after 1 hour of investigation, stop and flag — the refactor is larger than this move.
- **Verification:** open site in a clean profile → tap practice from landing → complete one scenario without ever picking a state. Pass = no errors, events fire.

### Move 3 — Make the pack survive a phone with no printer
- **Action:** promote "save to phone" to equal billing with print. Explicit PDF/image save path, not a link under the fold.
- **Expected observation:** a save action distinct from `beforeprint` fires; users on Android complete without printing.
- **Failure → signal → counter-move:** iOS Safari has no true download → the file opens in a new tab → provide "Add to Photos" instructions or render the card as a saveable image.
- **Fork trigger:** if Move 1 says print worked fine, drop this to priority 3.
- **Verification:** on a real Android and a real iPhone, complete the pack without a printer. Pass = artifact retrievable offline afterwards.

### Move 4 — Spaced repetition (the unexploited lever)
- **Action:** one local notification / calendar file at +3 days and +2 weeks: "Two minutes. Still know the four sentences?" Fires a 3-question retrieval check, not a full level.
- **Expected observation:** return visits with no external prompt; repeat `sr_practice_*` from the same person.
- **Failure → signal → counter-move:** PWA notifications unreliable on iOS → downloadable `.ics` reminder (the reprint reminder already does this — reuse it).
- **RECON NEEDED:** does the existing `downloadReprintReminder()` generalise? Check: read it; it already emits an ICS.
- **Abort:** do not build a push server. Cloud push breaks the on-device promise.
- **Verification:** generate reminder → open the file → confirm it schedules. Pass = calendar entry appears.

### Move 5 — Score copy, reviewed by the systems designer lens
- **Action:** keep the number, change what it asserts. Not "4/6 wrong" — "you got the two that matter. Here are the two to run again."
- **Expected observation:** retry rate rises; no drop in completion.
- **Fork trigger:** if the trauma-informed reviewer says any score is harmful for this audience → make the number opt-in, default to a checklist of phrases mastered.
- **Verification:** run levels 1-3 at a deliberate 50% → read every result string aloud. Pass = none of them tell a person they failed at surviving.

### Move 6 — Surface replayability that already exists
- **Action:** `PRX_VAR` already holds ~45 officer-line variants and `PRX_CURVE` ~10 curveballs. Users are not told the questions change. Say so, and add a "shuffle" entry point.
- **Expected observation:** repeat runs of the same level by the same person.
- **Failure → signal → counter-move:** variants feel identical → the pool is too small per beat → this becomes a content task for the scenario designer, not an engineering one.
- **Verification:** run level 1 three times. Pass = at least two beats differ in wording.

---

## PART 5 — Model routing (token discipline)

| Work | Model | Why |
|---|---|---|
| Legal content, UPL calls, statute wording, anything where wrong = harm | **Capable (Opus-class)** | A wrong sentence here gets someone arrested. Never delegate. |
| War-gaming, architecture forks, this document | **Capable** | Judgment, once, kept forever. |
| Implementing a specified move, refactors, tests, a11y fixes | **Mid (Sonnet-class)** | The wargame removed the judgment; execution is mechanical. |
| Changelog, file moves, formatting, commit messages, renames | **Cheap (Haiku-class)** | No judgment at all. |
| Generating statute text or citations | **NONE** | No model. Research + primary source + attorney. This is the line. |

**Practical savings, in order of size:**
1. Hand the moves above to a mid model with this doc as the brief. You already
   paid for the judgment.
2. Stop re-deriving context: the codebase facts are in `DEPLOYMENT.md`,
   `research/law-watch.json` `_comment`, and `CHANGELOG.md`. Point the executor
   at those instead of re-reading `index.html` (≈380 KB).
3. One mission per session. This session did audit, ICE mode, 50 states, DNS,
   a different project's images, cron, and analytics — every context switch
   re-loads the world.

---

## Red-team pass

**Attack that FAILED:** "The game framing is a distraction — this is a legal
utility, and gamification trivialises police violence." It fails against the
transcript: the user's most-cited moment is Hard Mode, whose whole value is
that it *refuses* to be winnable. Game design is what makes the refusal land.
The design is already using game grammar to deliver a non-game truth.

**Attack that LANDED, and the patch:** "Inverting the funnel (Move 2) optimises
for the engagement of a man who does not drive and will never be stopped."
That is real. One playtester's delight is not demand.
**Patch:** Move 2 ships behind a measurement gate, not a belief. Move 1 runs
first, and Move 2 is only judged a success if `sr_state_selected` conversion
rises for *mobile users who arrive cold* — not on time-on-site or scenario
completion, which a non-driver would inflate. If state-selection does not move
within 30 real visitors, revert the order.

---

## Abort conditions (whole roadmap)

- UPL attorney says the scored engine is exposed → **stop all practice-engine
  work**, do not build Moves 5 or 6, re-scope before writing another line.
- Any move requires user data to leave the device → stop. The on-device promise
  is the product.
- Any move requires generating statute text with a model → stop.

## Verification for the roadmap as a whole

1. A cold mobile visitor reaches a scenario without picking a state. Pass = works offline too.
2. Pack completes on a phone with no printer, artifact retrievable later.
3. Every result string read aloud; none tells a person they failed at surviving.
4. `sr_state_selected` conversion for cold mobile arrivals, before vs after Move 2, ≥30 visitors.
5. One licensed attorney has signed one state, and `EDITION` matches their review.
