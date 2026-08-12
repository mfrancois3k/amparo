# Wargame 17 — Practice modules, second pass: the built UI, not just the engine

Date: 2026-08-12 (amparo-loop Agent B, follow-up review). Design review only.
**No source edits were made and none are authorized by this document.**

**Inputs:** direct inspection of `index.html` (practice engine constants,
lines 4359–5255) at current HEAD; the now-complete React port —
`app-src/src/screens/PracticeStep.tsx`, `app-src/src/screens/practice/
PracticeLevelSelect.tsx`, `PracticeBeat.tsx`, `PracticeDebrief.tsx`,
`app-src/src/engine/practiceEngine.ts`, `app-src/src/engine/
usePracticeAudio.ts`; the i18n bank (`app-src/src/content/t.en.json`); prior
work at `wargames/16-qa-end-to-end-testing-modules.md` and
`wargames/03-door-module-design.md`.

**Scope discipline, unchanged from 03 and 16:** structure only. No officer
dialogue, no legal content, no coach copy authored here. `TODO_ATTORNEY` /
`TODO_DV_CLINICIAN` remain the only placeholder convention.

**Why this pass exists:** wargame 16 reviewed the engine/content layer only
(`index.html` constants + the pure-logic `practiceEngine.ts` port). The
practice UI — level select, the live-beat screen, the debrief — has since
been fully built in `/app`. Two things needed checking: (1) does wargame 16's
open HIGH finding still stand, unaddressed, and (2) does the UI layer change
any finding's severity or add new ones the constants-only read couldn't see.

---

## 0. Status check — wargame 16's findings against current HEAD

**Finding 2.1 (HIGH — level 2 is a 2-beat spike behind a heavy gate) is
STILL UNFIXED.** `PRX_LEVELS[2].ids` is still `[3,7]` (index.html:4374,
mirrored verbatim at `practiceEngine.ts`'s `PRX_LEVELS_RAW` import). The
one-line fix wargame 16 and wargame 03 both recommended — inserting `ci:2`
between the exit order and the arrest — has not landed. See §2 below: the
built UI does not just fail to fix this, it makes the spike more visible
than the constants-only read suggested.

**Finding 3.1 (curveballs never fire on level 2) is STILL UNFIXED.** The
gate is `runs>=1 && level<2` in `practiceEngine.ts:159` (`runs>=1&&prLevel<2`
in `index.html:4742`) — byte-identical condition, both places.

**Finding 3.3 (no on-screen signal that officer lines vary run to run) is
NOW RESOLVED.** `PracticeLevelSelect.tsx:19` renders
`t.prx_sel_sub` above the level tiles, and that string
(`app-src/src/content/t.en.json:73`) is *"Two minutes each, out loud. The
officer's wording changes every run."* — exactly the sentence both prior
documents asked for. Good — mark this fix shape as the template for any
future "make an existing mechanic visible" finding.

**Finding 1.1 (level tiles don't disclose hard mode's no-score rule) is NOW
RESOLVED, and more thoroughly than the minimal fix wargame 16 proposed.**
Three independent signals now exist, not one:
1. Tile subtitle `prx_ld4`: *"You do everything right. It escalates
   anyway."* (`t.en.json:77`).
2. Tile badge: unscored levels render `✓`/blank instead of a score badge
   (`PracticeLevelSelect.tsx:24`, driven by the same `PRX_UNSCORED` boolean
   wargame 16 pointed at).
3. The `PRE_FLIGHT` warn screen (`PracticeStep.tsx`'s `warnKey`, entered
   before every level ≥2) carries level-specific copy — `prx_warn4` for hard
   mode states outright *"you do everything right and he stays hostile
   anyway."*

**wargame 03's "trap, not a gift" (§4.2) is NOW RESOLVED.** The original
concern was that a 7th level would fall through the warn-copy ternary to
`prx_warn3` (the arrest warning) because no branch existed for it.
`warnKey()` (`PracticeStep.tsx:26–33`) now has an explicit branch per level
index 3 through 7 (`prx_warn4` through `prx_warn9`), each level gets its own
warning, and the door module (`prx_warn9`, level 7) already has its own
correct copy waiting behind `DOOR_MODULE_ENABLED`. This was cheap and it
got done — noting it so it isn't re-flagged.

**Finding 4.1/4.2 (carry card) — SUPERSEDED, not fixed.** wargame 16 treated
the carry card as a shipped strength and debated whether hard mode should
get one. **In the built `/app` UI, the carry card does not exist for any
level yet.** `PracticeDebrief.tsx:32–34` says so directly: *"Carry card (G12,
canvas PNG export) is out of Move 5.2's scope... Omitted rather than shipped
as a button with no handler; deferred to a later move."* Same for the
mastery-certificate share (G13, comment at `PracticeDebrief.tsx:102–105`).
Do not carry Finding 4.2's framing forward as-is — there is currently
nothing to withhold from hard mode, because nothing is offered anywhere.
Re-open the "should hard mode get a take-away artifact" question when G12
actually lands, not before.

---

## 1. What the demeanor meter changes about the curve findings

`PracticeBeat.tsx:50–53,71–79` renders a per-beat "demeanor" track — a
labelled dot sliding along calm→firm→tense (`demPct`: 12/52/88, colour-coded
green/orange/red) driven directly by `beat.tone`. This is new since wargame
16's read (the constants alone don't show how tone is surfaced to a player)
and it changes the stakes of §2's curve findings, not the findings
themselves:

**The pressure curve wargame 16 described abstractly is now something a
player watches move, beat by beat, on screen.** For level 2 specifically:
`PRE_FLIGHT` shows a dedicated full warning screen (headline + coach copy +
a gold "go" button — a real screen, not an inline banner), the player commits
to it, and then the demeanor dot moves exactly twice before the run ends —
calm-adjacent on the exit order, straight to the red end of the track on the
arrest. The mismatch wargame 16 called "the warning-to-payoff ratio" is no
longer just a count of beats; it is a short, visually complete escalation
gesture (dot slides all the way right) that resolves in two taps, right
after the single most ceremonial screen in the whole run. If anything this
is a stronger argument for landing the `ci:2` insert than the original
finding had, purely because the UI now spends more visual budget setting the
level up than the level spends paying it off.

**No severity change to Finding 2.1** — same fix, same one-line array edit,
still recommended. This section exists to update *why it matters*, not
*what to do*.

---

## 2. New finding — the divergence mechanic and the audio gap silently cancel each other on level 2

This is not visible from either wargame 03 or wargame 16 alone; it only
shows up cross-referencing `PRX_DIVERGE` against `PRX_VAR[7]`, both of which
are unchanged since wargame 16 but neither of which that document connected.

`PRX_DIVERGE={1:{g:'calm',b:'curt'},2:{g:'curt',b:'hostile'}}`
(index.html:5226, ported verbatim at `practiceEngine.ts:61` /
`divergeDeck` at :172–185). For level 2 ("ordered out"), a **bad** pick on
beat 1 (the exit order, `ci:3`) should divert beat 2 (the arrest, `ci:7`)
toward a `hostile` variant — `want='hostile'` at `divergeDeck`'s line 178.

But `PRX_VAR[7]` (index.html:4471–4474, unchanged) has **four variants, zero
of them `hostile`** — two `calm`, two `curt`. `divergeDeck`'s own guard
(`practiceEngine.ts:180`, `if(!pool.length) return deck`) means this is not
a crash, it's a silent no-op: the "worse" path a player earns by picking
badly on beat 1 produces **no visible difference whatsoever** on beat 2. The
divergence mechanic — the single best replayability primitive in the app per
wargame 16 §4 — is dead on exactly the level that most needs its beats to
feel consequential, because it's the shortest one.

This is the same root cause as wargame 16's still-open Finding 5.2 (no
hostile `PRX_VAR[7]` variants means the arrest beat also falls back to
robotic browser TTS on level 3's hostile-only pool). **One fix closes both
gaps**: author 1–2 hostile variants for `ci:7`. No new legal content — the
reviewed answer for that beat doesn't change, only the officer's wording
does, same authoring shape as every other `PRX_VAR` bank entry.

---

## 3. Pacing — idle-timeout copy is still level-blind, confirmed at the audio-hook layer

wargame 16 §3.2 flagged `prxIdleArm`'s 12-second constant as applied
uniformly regardless of level, as a judgment call rather than a bug. The
ported `usePracticeAudio.ts` confirms the same is true of the *implementation
that ships*: `armIdleTimer` (`usePracticeAudio.ts:89–92`) is a single
12000ms constant with no level parameter, and `PracticeBeat.tsx:150–158`
renders one idle-offer copy string (`prx_idle_h`) with no per-level branch.
Still a judgment call, not a defect — flagging only to confirm the UI layer
didn't quietly resolve or worsen it. It didn't; it's exactly as described.

---

## 4. Replayability — what actually ships today vs. what wargame 16 assessed

Re-stating wargame 16 §4's strengths against the **shipped `/app` UI**
specifically, since that document was written against `index.html` (the
still-live production surface) and this review's job is the port:

- **Streak** (`progress.streak.n`) — ships, unchanged logic, rendered in
  both `PracticeLevelSelect.tsx:50` and `PracticeBeat.tsx:69`. No change.
- **Divergence** — ships (see §2 for the level-2 dead spot). Still
  under-marketed in the same way wargame 16 noted: nothing on screen tells
  the player a good pick just changed what's coming. The demeanor meter
  (§1) is adjacent infrastructure that *could* carry this signal cheaply —
  a one-frame pulse on the dot when a diverge actually fires would be a
  small addition reusing an existing element — but nothing does today.
- **"Different every run" messaging** — ships and is *new* relative to
  wargame 16's read (§0 above).
- **Carry card / mastery certificate** — do **not** ship in `/app` yet
  (§0 above). Any replayability assessment of the current build should
  treat these as absent, not as a design tradeoff to weigh.
- **"Rehearsed N times" framing** (`prx_rehearse1`/`prx_rehearseN`,
  `PracticeDebrief.tsx:31`) is a small, good addition not present in the
  `index.html` read wargame 16 did — it reframes repetition as skill-building
  rather than grinding a score, which fits the app's existing streak
  philosophy (counts days, not perfection) well. No action needed, noting
  it as a positive addition in the same register as the sibling documents'
  "what's already strong" sections.

---

## 5. Summary table

| # | Finding | Status | Severity | Fix shape |
|---|---|---|---|---|
| — | Level 2 is a 2-beat spike behind a heavy gate (wargame 16 §2.1) | **STILL OPEN** — UI makes the mismatch more visible, not less | HIGH | insert `ci:2` into `PRX_LEVELS[2].ids` — unchanged, still a one-line fix |
| — | Curveballs never fire on level 2 (wargame 16 §3.1) | **STILL OPEN** | MEDIUM | extend `runs>=1&&level<2` gate, or accept as intentional |
| NEW | Divergence is a silent no-op on level 2's bad path — no hostile `PRX_VAR[7]` variants | **NEW**, same root cause as wargame 16 §5.2 | MEDIUM | author 1–2 hostile `ci:7` variants — fixes this AND wargame 16's robotic-TTS-on-arrest finding at once |
| — | Level tiles don't disclose hard mode's no-score rule (wargame 16 §1.1) | **RESOLVED** — tile subtitle + badge + PRE_FLIGHT copy, three signals | — | none needed |
| — | No on-screen signal that officer lines vary run to run (wargame 16 §3.3 / wargame 03 §5.4) | **RESOLVED** — `prx_sel_sub` on level-select | — | none needed |
| — | 7th-level warn-copy trap (wargame 03 §4.2) | **RESOLVED** — `warnKey()` branches per level 3–7 | — | none needed |
| — | Carry card withheld on hard-mode debrief (wargame 16 §4.2) | **SUPERSEDED** — carry card ships for no level in `/app` yet | INFO | re-open when G12 (carry card) lands |
| — | Idle-timeout copy is one constant across a non-uniform curve (wargame 16 §3.2) | **STILL OPEN**, confirmed unchanged at the audio-hook layer | LOW / judgment call | per-level idle copy, mirrors wargames/03 §6.4 |

Net: the port is a faithful, careful translation of the reviewed engine —
it introduced no new regressions, closed three findings for free as a side
effect of good UI work (level-select subtitle, warn-copy branches, tile
disclosure), and surfaced one finding the constants-only read structurally
could not see (§2, the divergence dead-end). The one HIGH item from wargame
16 is unchanged and remains the single highest-leverage fix available: a
one-line edit to `PRX_LEVELS[2].ids`, reusing an already-reviewed beat.
