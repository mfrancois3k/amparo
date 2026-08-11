# Wargame 13 — Expert-panel hub redesign: module-design and structure review

Date: 2026-08-11. Module design review only. **No dialogue authoring, no attorney decisions, no code edits authorized by this document.**

**Context:** Amparo v2.16.0 introduced a UI redesign for the practice hub. Scenario select moved from a tile grid to a vertical card list ("what happens" one-liner per level). The runs view changed from tile grid to officer chat + score ring. No beat structure, pacing, or scenario count changed — this is pure UI. This review audits whether the new presentation accurately signals module difficulty, tone, variant replayability, and gating logic.

---

## 1. Problems identified

### 1.1 MEDIUM — Card descriptions are complete but miss tone progression signal

**Current card descriptions (per i18n):**
- L1: "A routine stop, by the book. Learn the rhythm."
- L2: "Same stop, shorter patience. Keep your footing."
- L3: "You're ordered out of the car. Higher stakes."
- L4: "You do everything right. It escalates anyway."
- L5: "Border Patrol checkpoint — a different encounter, same in all 50 states."

**What the code actually does:**
- L1: 5 beats at tone filter `[calm]` only, 4 variants per beat, curveballs enabled.
- L2: 6 beats at tone filter `[curt]` only, 4 variants per beat, curveballs enabled, same 4 beats as L1 (0,8,1,2) + 2 new (4,5).
- L3: 2 beats at tone filter `[curt]` only, MINIMAL replayability (ci 3 and 7 only, no variants in the pool for L3's tone restrictions), no curveballs. This is the gating level that unlocks L4 and L5.
- L4: 3 beats, fixed "hard mode" track (bothGood scoring), no variants, no randomization. Labeled "You do everything right" — and it does, correctly.
- L5: 4 beats, fixed checkpoint track, no variants, no randomization. Different encounter type, separate legal framing.

**Mismatch:** "Keep your footing" signals a calibrated difficulty step; the code shows L2 as *identical to L1 except tone filters narrower and beat count +1*. Four of six beats are shared with L1. Users who master L1 face no new beat structure in L2, only a subset of variants (curt tone only). The card description doesn't hint at this reuse.

**Also:** L3 "Higher stakes" signals escalation, but it is a 2-beat spike — the shortest level in the ladder. No tone progression language ("Ordered out" is stage-setting, not a tone signal). Users see 🟩2 after consent, which reads worse than the level's actual structure.

### 1.2 MEDIUM — Variant pools are invisible, missed replayability signal

**Fact:** PRX_VAR contains ~37 officer lines across 9 beats (ci 0–8). Pool sizes per beat:
- ci 0, 1, 2, 4, 5, 6, 8: 4 variants each (calm and curt tones)
- ci 3: 5 variants (calm, curt, and one hostile)
- ci 7: 4 variants (calm and curt tones only; **zero hostile**, see wargame 03 §5.2)

A level-0 run shows **5 beats** pulling from these pools, typically **4 variants each** when filtered to the level's allowed tone. That means ~4^5 = ~1,000 possible deck permutations per run at level 0 (before curveballs).

**Current UI signal:** None. The results screen says "Run it again" but does not say "the officer's words change every run." Compare to a game that says "45 unique officer lines — you've heard 8." This is Wargame 03 §5.4: 45 authored variants, zero marketing of their existence.

**Design impact:** Replayability is purchased and invisible. Users who replay are likely chasing the score, not discovering variety. First-time players have no signal that a second run will feel different.

### 1.3 MEDIUM — Divergent-turn mechanics (L1, L2) not signaled; users may think levels are independent

**Mechanic:** Both L1 and L2 use the same first four beats (ci 0,8,1,2). The officer lines are different each run (variant pool), but the *question* is the same. The answers are also the same (PRX_OPT is keyed by ci, not by level).

**What this means:** Performance on beat 2's consent decision in L1 does not affect what happens in beat 3 of L1 (linear deck). But beat 2 establishes a pattern — "I don't consent" — that L2 then tests under pressure. L2 is designed as a *follow-on*, not a re-skin.

**Current UI signal:** The new card list shows each level as its own card. Visually, they appear independent. Nothing says "level 2 repeats questions from level 1 under higher pressure" or "your strategy from level 1 is being tested here."

**Real-world impact:** A user might beat L1 by accident (choosing "I don't consent" without internalizing why), then fail L2 on beat 2 (same beat, higher pressure) and believe they made a new mistake rather than understanding they're being tested on the same decision with less margin.

### 1.4 HIGH — Hard mode gating is clearly marked, but the gating *breadth* is confusing

**Current UI:** Levels are shown as cards, L4 and L5 show a lock and the text "Finish the first three stops to unlock these" (hub_locked i18n key).

**The code:** Level 4 (hard mode) and Level 5 (checkpoint) are both locked behind `mUnlocked = prx.done[0]&&prx.done[1]&&prx.done[2]` — meaning finish L0, L1, L2 to unlock both simultaneously.

**The problem:** A user who beats L0 and L1 (and **gets stuck on L2, never finishes it**) cannot access L5 (checkpoint), which is *explicitly not* a progression step — it's a "different encounter, same in all 50 states." The checkpoint scenario is more relevant to a user at a border than a user rehearsing car stops. Gating it behind the car-stop ladder means someone who crosses the southern border without rehearsing the stops can still't reach the checkpoint scenario.

**Design question (not a bug):** Is that gating intentional? The checkpoint's own description and warning copy say "this is a different kind of stop" — which implies it is not an escalation. If that is true, why lock it behind completing the escalation ladder?

**UI clarity:** The card UI makes the lock visible (✓ clear) but does not explain *why* this particular level is locked or why both hard-mode levels gate together.

### 1.5 MEDIUM — Checkpoint card replication: tabs vs. scenario list

**Current structure:** 
- Traffic-stop ladder: L0–L3 appear as cards in the "Traffic stop" tab.
- Checkpoint: L4 appears as a separate card in the "Checkpoint" tab (based on i18n hub_m3 and hub_m1 / hub_m2 / hub_m3 keys).
- Door module: Not visible (DOOR_MODULE_ENABLED=false).

**Potential confusion:** If the checkpoint is *also* shown as its own card on a separate tab, users see the same level in two places. The tab structure makes sense ("traffic stop" vs. "checkpoint" as encounter types), but card replication could feel like a redundant card in a list.

**Inspection needed:** Grep the template or prxHubRender() function to confirm whether checkpoint appears:
- (A) Only on the Checkpoint tab (correct), or
- (B) Both in the main scenario list AND on the Checkpoint tab (confusing).

### 1.6 HIGH — Hidden final scenarios (L5, L6, dark modes) and door module: wrong default

**Current state:**
- `FINAL_SCENARIOS_ENABLED = false` (line 4359)
- `DOOR_MODULE_ENABLED = false` (line 4368)
- `PRX_LEVEL_IDS = FINAL_SCENARIOS_ENABLED ? [0,1,2,3,4,5,6] : [0,1,2,3,4]` → currently `[0,1,2,3,4]`
- `PRX_DOOR_IDS = DOOR_MODULE_ENABLED ? [7] : []` → currently `[]`

**What's hidden:**
- L5 (index in PRX_LEVELS): "The long wait" (ids:[50,51,52,53,54,55]) — fixed deck, escalating silence between officer lines.
- L6: "It doesn't stop" (ids:[60,61,62,63,64,65]) — fixed deck, success-that-fails scenario.
- L7 (door module): Separate tab, 6 fixed beats (d40–d45).

**The issue:** The redesign does not change these flags, so the final scenarios and door remain invisible on the hub. The wargame-03 document specified these as "FINAL_SCENARIOS_ENABLED conditionally excluded" — meaning they were designed *knowing* they might not ship. That decision is fine; the implementation is correct.

**Design concern:** The UI now shows a clean 5-level ladder (L0–L4) with no visual hint that more content exists. A user who completes checkpoint has "finished Amparo's practice" and closed the overlay. There is no "coming soon" or "in development" signal. For the door module especially, this is a hard stop at the most useful scenario.

**Related:** wargame-03 §6.2 says "No children in any setter. No family members" because the app must not populate the user's household — Amparo's job is to hold composure. That rule was written knowing the door module might not ship v1. If the module stays hidden, that rule matters less. If it ships, that rule is load-bearing.

---

## 2. Design solutions

### 2.1 Solution: Better card descriptions for L2 and L3

**For L2 ("Irritated officer"):**
Current: "Same stop, shorter patience. Keep your footing."
Proposed: "Same questions, less patience. Your answers get tested."
Rationale: Explicitly signals that L2 is L1's beats under pressure, not new beats. "Your answers get tested" hints at the divergent-turn mechanic without over-explaining.

**For L3 ("Ordered out"):**
Current: "You're ordered out of the car. Higher stakes."
Proposed: "You're ordered out. Hold your ground."
Rationale: "Hold your ground" echoes "Keep your footing" (L2) and names the core skill being trained. The current "Higher stakes" is true but abstract.

**Implementation:** Two i18n string edits, no code change. Spanish translations needed.

### 2.2 Solution: Mark variant availability on the results screen

**Add a one-liner to the results screen post-run:**
"The officer's words were different this run — find a new conversation every time you replay."

**Spanish equivalent:**
"Las palabras del oficial fueron diferentes — hay una conversación nueva cada vez que repites."

**Where:** After the score display, before the "Run it again" button. Uses existing i18n mechanism. No scoring logic change.

**Rationale:** Wargame 03 §5.4 noted this as the cheapest win capturing 80% of the replayability signal. One sentence, zero new state. Measure via session telemetry whether it improves replay rate.

**Follow-up:** If replay rate increases, consider a coverage line ("you've heard X of ~40 officer lines") behind a toggle or rollout. Leave it out of v1; ship the sentence.

### 2.3 Solution: Add a deck-composition callout to L2

**In the level's intro screen (prx_intro):**
Append for L2 only:
"Same beats as Level 1 — same answers work. You're practicing the *holding steady* part."

**Rationale:** Explicitly names the divergent-turn structure, calibrates expectations, frames L2 as a skill test not a content test.

**Implementation:** Conditional i18n key `prx_intro_l2_note`, displayed below the standard intro. One i18n edit + one line of template logic (`if(prLevel===1)` in the render path).

### 2.4 Solution: Clarify hard-mode and checkpoint gating in the UI

**Option A (quick):** Update lock copy:
Current: "Finish the first three stops to unlock these."
Proposed: "Finish levels 1–3 (traffic stops). Checkpoint and Hard Mode unlock together."

**Option B (better):** Separate the lock logic.
- Keep `mUnlocked` gating L4 (hard mode).
- Gate L5 (checkpoint) separately: `prx.done[0] || prx.done[4]` — i.e., after *any* scenario is complete, checkpoint unlocks. (The checkpoint is a different kind of stop, so completing a car stop OR another checkpoint run should unlock it.)
- Update lock copy to explain each level's gate independently.

**Rationale for B:** The checkpoint is not an escalation of the car-stop ladder; it is a *parallel* scenario. Gating it behind completing all traffic stops contradicts its own framing and contradicts the goal of "reach the scenario you actually need tonight."

**Cost:** Option A is two i18n edits. Option B is one logic change (~1 line: change `&&` to `||` in mUnlocked derivation for L5) + i18n updates. Medium testing (ensure lock state refreshes on level completion).

**Recommendation:** Start with Option A (ship in next patch), then evaluate Option B (may need attorney/DV-clinician sign-off, since it changes access to checkpoint).

### 2.5 Solution: Visibility toggle for hidden scenarios

**If L5, L6, or door module are intended to ship at a later date:**
Add a developer-only or beta-toggle setting:
```
SHOW_FINAL_SCENARIOS = false;
```
Update the hub to show these levels as "Coming soon" cards with their names visible:
- "🌙 The long wait" (locked, "Coming soon")
- "🌑 It doesn't stop" (locked, "Coming soon")
- "🚪 At your door" (locked, "Coming soon")

**Rationale:** Users who reach checkpoint get a signal that more scenarios exist. The door module especially — if a user is at the hub after a real encounter at their door, seeing "At your door" on the horizon is crucial context.

**Cost:** 3 stub cards (labels, no content), one beta toggle. No changes to locked-level logic.

**For v2.16.0 (now):** Keep FINAL_SCENARIOS_ENABLED=false, DOOR_MODULE_ENABLED=false. But add the toggles to the code so future PRs can flip them without hunting for hardcodes.

---

## 3. Structural observations (no changes needed)

### 3.1 One-liner accuracy

The five card descriptions accurately describe the *scenario framing* (what's happening, not how many beats). They are complete given the constraint of one line per card. The ambiguity is not in the descriptions themselves — it is in what the code does that the descriptions don't explicitly name.

### 3.2 Variant pool sizes are actually healthy

~37 variants (4–5 per beat) across 9 beats is solid for replayability. A 5-beat level at 4 variants per beat (L0, L1) yields ~1,000 deck permutations even before curveballs. Current UX simply doesn't market this. The pool is working; the communication is silent.

### 3.3 Pacing is flat by design

PRX_LEVELS `rate` values: 0.95 (L0) → 1.12 (L1) → 1.28 (L2) → 1.3 (L3) → 1.0 (L4/L5). The rates control TTS pitch/speed. L0 is slowest (allows time to think), L3 is fastest (pressure). L4 and L5 reset to 1.0 (checkpoint and hard-mode have their own pacing). This is correct and by design.

### 3.4 The deck linearity is actually a feature

No branching between beats was a deliberate choice in wargame 03. The setter text (italic scene lines) handle irreversibility narratively rather than state-wise. This means every run can be compared fairly (same order, same beats, different variants). It also means users can't "cheat" an unlucky beat by choosing differently — the only tool is better execution. That's the teaching point of hard mode.

---

## 4. Recommendations (ranked by impact)

| Priority | Issue | Solution | Effort | Ship in v2.16? |
|----------|-------|----------|--------|---|
| HIGH | Checkpoint gating blocks door-scenario access | Separate checkpoint gate from hard-mode gate (Option B) | Medium (1 logic line + testing) | No — needs review |
| HIGH | Hidden scenarios have no "coming soon" signal | Add stub cards for L5, L6, door with toggle | Low (3 cards + 1 flag) | Yes, as toggle default-off |
| MEDIUM | L2 feels like a copy, not a test | "Same questions, less patience" + intro callout | Low (2 i18n edits) | Yes |
| MEDIUM | Variant replayability is invisible | Add one-liner to results screen | Low (1 i18n edit) | Yes |
| MEDIUM | L3 gating UI is vague | Clarify in lock copy (Option A) | Low (1 i18n edit) | Yes |
| MEDIUM | L3 is confusingly short | Consider adding one beat (wargame 03 §5.5) | Medium (legal + audio) | No — scope separate |
| LOW | L7 audio needs hostile variants | Wargame 03 §5.2 | Medium (audio) | No — scope separate |

---

## 5. TODO (for async review)

- **TODO_DV_CLINICIAN:** If checkpoint gate is separated from hard-mode gate (Option 2.4.B), the checkpoint becomes accessible to users who have not completed the car-stop ladder. Confirm that checkpoint content does not assume prior car-stop knowledge. Confirm domestic-violence call scenarios are handled. (Checkpoint is federal BP only; domestic risk should not be present, but surface check needed.)

- **TODO_ATTORNEY:** If door module ships (currently hidden), confirm that the visible UI lock states accurately describe gating rules for all three scenarios. Today's gate is "finish L0–L2" for both L3-and-L4; if this changes per recommendation 2.4.B, attorney review needed that gating statement is accurate on the UI.

- **Verify:** Checkpoint card replication in hub. Grep for tab rendering of L4 to confirm it appears only on the "Checkpoint" tab, not also in the main scenario list.

---

## Summary

The redesign is solid: card UI is clean, descriptions are complete, one-liner accuracy is strong. The module structure (beat count, variants, gating) is working correctly; the redesign faithfully preserves all of it.

**Three communication gaps emerge:**
1. L2 is a re-test of L1's questions, not new content — users need to know.
2. Variant pools are 3–5× deeper than visible — signal this replayability.
3. Checkpoint and hard-mode gate together — this may be wrong, needs review.

None of these are UI failures; all are design-intent issues that the old tile grid would have missed equally. The vertical card list makes the gating *clearer* than before; these gaps are pre-existing.

**Recommendation:** Ship v2.16.0 as-is with solutions 2.1 (card descriptions) and 2.2 (variant signal). Defer 2.4.B (gating refactor) to a future review with DV clinician and attorney present. Add 2.5 (stub cards) as a developer-only toggle so L5, L6, door are visible to internal testers but not to users.

