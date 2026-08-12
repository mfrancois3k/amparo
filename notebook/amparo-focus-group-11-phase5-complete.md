# Amparo — focus group 11: Phase 5 closes — practice UI, officer audio, overlay a11y (v2.19.0)

Date: 2026-08-12. Run against `70a41d4` (HEAD), tag `v2.19.0`. `app-src/src/` is the
live source for `/app`; root `index.html` is untouched and out of scope this round
(per `wargames/15` §0 rule 1 — root was FG06-FG09's subject and its findings stand
unchanged). Moves 5.1-5.3 of wargame 15 have now shipped: the practice engine core
FSM (5.1, reviewed structurally in FG10 with zero UI consumers), and — new this
round — its full UI (level select, live-beat chat thread, demeanor meter, typed-answer
matcher, crisis detection, results/debrief), officer audio (clip+TTS fallback,
mute/gender/voice-lang), and the overlay accessibility framework (focus trap, inert
background, Escape-close, keyboard-only pass). The full `/app` funnel is now built
end to end: welcome → state → you → lifelines → print → practice.

**Method note.** Every claim below is read directly out of `app-src/src/*`, or is a
direct `node -e` dump of the extracted JSON content banks. Verified this round, not
assumed: `PracticeStep.tsx:54-64` traced against `usePracticeAudio.ts` to confirm the
mute-before-first-audio gap now exists in shipped, reachable code (golden #1);
`node -e` dumps of `PRX_LEVEL_IDS`, `PRX_LEVELS`, `PRX_DIVERGE`, and `PRX_VAR['7']`
to confirm the divergence-to-missing-hostile-variant chain is live, not merely
structural, now that Move 5.2 renders it (golden #3); a full read of
`useOverlayA11y.ts` and its one call site in `DocsOverlay.tsx:63` to confirm FG10
golden #3 (no focus trap) is fixed. Attorney/UPL review is excluded from findings
below — known, already tracked (wargame 15 §0 condition 2 and Appendix B), not new.
Findings already logged in FG06-FG10 are referenced only as carried context, and
distinguished explicitly from what's newly verified this round.

---

## 0. What's actually new this round, verified against source

| System | File | What it is |
|---|---|---|
| Level select | `screens/practice/PracticeLevelSelect.tsx` | Card list over `PRX_LEVEL_IDS` (`[0,1,2,3,4]` — verified via `node -e`); locked cards now get a real `disabled` attribute, not just `aria-disabled` (line 30-31) |
| Live-beat screen | `screens/practice/PracticeBeat.tsx` | Chat thread, demeanor meter (`aria-live="polite"` status region), rail, typed-answer + option buttons, crisis-tier reveal branch |
| Officer audio | `engine/usePracticeAudio.ts` | Clip-first (`/audio/{lang}/{gender}/{id}.mp3`), TTS fallback on error/rejected play, latched so only one fallback path ever fires (line 122-129) |
| Results/debrief | `screens/practice/PracticeDebrief.tsx` | Score grid, streak/best/levels-done stats, breakdown rows, `dangerouslySetInnerHTML` scoped to two static content fields only (verified both call sites) |
| Overlay a11y | `hooks/useOverlayA11y.ts` | Focus trap, bidirectional Tab-wrap, inert `#app-root`, focus-restore-to-trigger, Escape-close — now wired into `DocsOverlay.tsx:63`, closing FG10 golden #3 |

**Confirmed fixed since FG10, not re-derived as a new finding:** `DocsOverlay` now
calls `useOverlayA11y(cardRef, true, onClose)` (`DocsOverlay.tsx:63`) — Tab no longer
walks past the overlay into `YouStep` content behind it. Locked practice cards now
carry a real `disabled` attribute (`PracticeLevelSelect.tsx:30`), not just
`opacity`+`aria-disabled` — the FG09/FG10 module-list item "implement real disabled"
is done. The crisis-tier reveal renders correctly (`PracticeBeat.tsx:178-179`,
`state.curTier === 'x'` swaps in `t.prx_crisis` in place of scoring language) — the
CHANGELOG's claimed fix for "crisis-tier reveal never actually rendered" checks out
against live code. Zero analytics calls anywhere in `app-src/src` (`grep -r
"posthog\|ph("` — no hits), still holding.

---

## 1. Ten persona reactions

**Selection rationale.** Wes, Ana, Rosa, Luis, Marcus, Dana, Tony, Omar, Keisha, Nia
— same ten as FG10, deliberately: this round's subject (Move 5.2/5.3) is the first
time the practice module has a screen at all, so the two personas who had nothing to
evaluate last round (Keisha, Nia) are the headline change, and holding the panel
constant makes that shift legible. Devin, Marisol, Ray sit out for the same reasons
as FG09/FG10 — no new surface touches their standing complaints.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He finally has something to read.** The FSM he could only inspect as pure code
  in FG10 now has a UI, and the phase-to-render mapping in `PracticeStep.tsx:127-153`
  matches the doc comments exactly (`IDLE`→level select, `PRE_FLIGHT`→consent copy,
  `OFFICER_SPEAKING`/`AWAITING`/`BEAT_COMPLETE`→`PracticeBeat`, `DEBRIEF`→results).
  For his explore-before-tap pattern, the code being legible was already a plus in
  FG10; now the legibility maps 1:1 onto what he'd click through.
- **A genuine new finding: the mute-before-audio gap he'd have flagged in root is now
  reproducible in `/app` too.** `PracticeStep.tsx:54-64`'s effect fires
  `audio.speak(beat, lang, ...)` the instant `state.phase` becomes
  `OFFICER_SPEAKING` — no gate, no confirmation step, nothing that waits for the
  mute button in `PracticeBeat.tsx:92-95` to render and be reachable first. He'd
  notice this from the code alone, without needing to click through.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **The deferred-scope discipline continues, and it's the thing that keeps her
  allergy quiet.** `PracticeDebrief.tsx:32-34` names exactly what's cut and why: the
  carry-card PNG export and share-cert button are "out of Move 5.2's scope... Omitted
  rather than shipped as a button with no handler." Same pattern Ana credited in
  FG10 for the print pack.
- **A real, verified promise kept: locked cards are now actually disabled, not just
  grayed out.** `PracticeLevelSelect.tsx:30-31` — `disabled={locked}
  aria-disabled={locked}`, a genuine HTML disabled state. This was explicitly on
  FG09's and FG10's must-fix list for "when Move 5.2 builds them"; it shipped.
- **The root-read bridge is still idle — her FG10 finding, now confirmed unchanged.**
  `readRootPractice`/`readRootDocs`/`readRootPrefs` still have zero callers outside
  `storage.ts` (re-grepped this round, same result). Move 5.2 built an entire
  practice engine and UI without touching this. Not a new finding, but worth
  confirming it wasn't quietly picked up as a side effect of this move — it wasn't.
- **Redo? Yes for what's built. Refer? Leaning conditional** — unchanged from FG10.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **The practice module's new UI strings are fully bilingual, checked directly.**
  `node -e` dumping `t.en.json`/`t.es.json` for `prx_mute`, `prx_dem_label`,
  `prx_dem_calm/firm/tense`, and `prx_crisis` shows real, distinct Spanish for every
  one — including the 988 crisis line, word-for-word translated, not a stub. This is
  a clean pass for the highest-stakes new content in this release.
- **The tone-tier prefix gap (FG09 golden #1) is no longer a future risk — it's now
  live and unaddressed.** `t.en.json`'s `prx_ld1`-`prx_ld5` still carry no
  "Calm:"/"Escalates:"/"Hostile:" prefix (re-checked this round); `/app` now actually
  renders these strings in `PracticeLevelSelect.tsx:42` where FG09 asked for the fix
  a full release ago. For her specifically this isn't new — the underlying string
  gap has always been there — but it shipped to a real screen for the first time.
- **Redo? Yes.** Same as FG10, no change to her verdict on this content specifically.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **Officer audio makes zero network calls beyond static assets, verified by reading
  the fetch path.** `usePracticeAudio.ts:120` requests `/audio/{lang}/{gender}/
  {beat.id}.mp3` — a same-origin static file, not an API call — and the TTS fallback
  is `window.speechSynthesis`, entirely local to the browser, no network round-trip.
  For a persona whose standing complaint against root was an unconsented analytics
  event firing on a tab-tap, this is the cleanest possible answer for the highest-risk
  new surface (audio, voice preference, gender selection) in this release.
- **Audio preferences write through the same shape-enforced boundary as everything
  else.** `usePracticeAudio.ts:139,145,146` calls `writeApp('mute'|'voice'|
  'voiceLang', ...)` — same `app_` prefix enforcement as FG10 verified for docs/you.
  No new key-write surface introduced by this move.
- **Redo? Yes — no open condition.** Unchanged from FG10.

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **The score ring and breakdown grid are genuinely shareable-looking now, and there's
  still no way to share them.** `PracticeStep.tsx:116-124` renders an SVG progress
  ring with `${ringGood}/${ringTotal}`; `PracticeDebrief.tsx:87-88` renders a score
  line and an emoji grid (`🟩🟨` per beat). This is exactly the kind of compact,
  visual result he'd screenshot — but there's no share button, and the beta banner
  (`App.tsx:82-90`, unchanged since FG10) still announces "Preview build" on the same
  screen. The visual material to be shareable now exists for the first time; the
  mechanism to share it still doesn't.
- **Redo? Yes. Refer? Conditional on shareability** — same standing gap, now with a
  concrete "here's what he'd have wanted to share" artifact to point at.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **The breakdown rows are exactly the close-reading material she's asked for across
  five rounds.** `PracticeDebrief.tsx:99-101` renders one row per beat —
  outcome icon plus a truncated officer line — so she can review a run
  beat-by-beat with her son afterward, not just see a final score. `prx_bd-row`
  matches root's own breakdown table shape (ported, not simplified).
  `stats` (line 92-96) surfaces streak, best score, and levels-done together, all
  three things she'd track across repeated drills.
- **The "next level" CTA understands her progression, correctly gated.**
  `PracticeDebrief.tsx:107-111`: only shows the gold "advance" button when
  `!master && level < 2` — she won't be offered a level she's already mastered or one
  still locked. Verified against `isLocked()`'s own three-completions gate.
- **Redo? Yes. Refer? Yes** — unchanged, and this round's UI is the first that
  actually rewards her repeat-player behavior with visible progress artifacts.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Nothing here moves his standing condition.** The beta banner
  (`App.tsx:82-90`) is unchanged from FG10 — still the honest "Preview build...the
  live app is at amparohq.com" framing that, while correct, keeps stacking a second
  credibility hurdle on top of his real ask (an institution's name behind the
  product).
- **The content he'd recognize is faithfully carried, not re-authored.** The consent
  gate copy (`t.prx_warn3` etc., rendered at `PracticeStep.tsx:137`) matches the
  register he credited in FG07-FG10 — measured, not alarmist.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **His FG10 finding is fixed, verified directly, not assumed from a changelog
  entry.** `useOverlayA11y.ts:34-75` implements a real trap: focus moves into the
  container on open (line 53-55), Tab wraps at both ends (line 57-65), Escape closes
  (line 58), and focus restores to the trigger on close (line 71). `DocsOverlay.tsx:
  63` is its only call site, wired in. Tab can no longer walk out of the overlay into
  `YouStep` fields behind it.
- **The demeanor meter is a correctly-built live region — a genuine accessibility
  win in new territory.** `PracticeBeat.tsx:74`: `role="status" aria-live="polite"`
  on the text label (`demWord`), while the visual track (line 76, `aria-hidden=
  "true"`) is correctly hidden as decoration. A screen-reader user gets "tense" or
  "calm" announced without needing to parse a colored dot's position.
- **A new, concrete gap this round: the crisis-tier reveal has no live region at
  all.** `PracticeBeat.tsx:178-179` swaps in `t.prx_crisis` (the 988 message) as
  plain content inside a `.prx-coach` div — no `role="alert"`, no `aria-live`. Compare
  to the demeanor meter three lines away, which got exactly this treatment. For a
  screen-reader user who types something that trips crisis detection, the highest-
  stakes message in the entire product is not guaranteed to be announced
  automatically — it depends on where focus already sits when the DOM swaps.
- **The tone-escalation-in-text gap he asked for in FG09 is still open, now on a
  live screen.** Same finding as Rosa's, from his lens: `prx_ld` strings still carry
  no tone hint, so his one-glance-for-difficulty use case (paired with Keisha's
  speed-scan) still requires reading each card's situational description rather than
  a difficulty cue.
- **Would he want it fixed? Yes, both — but the crisis-reveal live region is the
  higher-stakes of the two:** a missed "Calm/Escalates" hint costs him navigation
  time; a missed 988 announcement costs him the message.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **For the first time in five rounds, there is something in `/app` for her.**
  `PracticeLevelSelect.tsx` renders a scannable card list identical in shape to
  root's (thumbnail, title, one-line description, lock/status badge) — the exact
  glance-and-tap pattern her described use case needs. This is the headline reversal
  of this round: FG10 named her as the persona with the least of anything to
  evaluate; that's no longer true.
- **The between-fares math still works against her on first play.** The mute
  gap (Wes's finding above, golden #1) means her first run — the one that matters
  most if she's testing this during an actual short break — auto-plays officer audio
  the instant she taps a level, with no chance to silence it first. For a persona
  whose context is explicitly "between fares" (possibly a passenger nearby, possibly
  a quiet car), this is the sharpest real-world hit of any persona on this finding.
- **Redo? Yes, now that there's something to redo.** New verdict — FG10 had no basis
  to render one.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **Her standing hub-exposure concern (FG09 golden #4) is now moot for the content
  that used to trigger it.** `PRX_LEVEL_IDS` is `[0,1,2,3,4]` (verified via
  `node -e`) — indices 5/6/7 (the finals FG09 flagged, including "🌑 It doesn't
  stop") are not in this array and do not render in the card list at all. The one
  locked card she'd see today is index 3, titled "🌒 Hard mode" (`t.en.json:
  prx_lvl4`) — a materially less alarming label than what FG09 found, though whether
  that's a deliberate content choice or simply "the finals aren't built yet" is
  unverifiable from source alone.
- **The consent gate she can now actually test, and it behaves as the FSM promised
  in FG10.** `PracticeStep.tsx:134-141` renders `PRE_FLIGHT` as a single explicit
  screen with the level's warning copy and a "go" button — she can read the warning
  and leave before anything plays, for levels 2+. This is the first round she can
  verify this rather than read it as a pure-function guarantee.
- **She can now exit a live run and see what that looks like.** `back()`
  (`practiceEngine.ts:305-316`) returns to level select at `idx<=0`, no coach
  judgment, no forced completion. Verified this is reachable from the UI:
  `PracticeBeat.tsx:166-170` renders the back button whenever `state.idx > 0`, and a
  path exists at `idx===0` too (implicit in `back()`'s own guard) via the header's
  "back to levels" control (`PracticeStep.tsx:112-114`) — no gate holding her in.
- **Redo? Still no for hostile content. Refer? Conditional yes, sharper this round**
  — she has real material to react to for the first time, and the two things that
  mattered most to her (locked-content exposure, an honest exit) both check out.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Gate the officer's first line on the mute control being reachable — this shipped un-fixed a second time, exactly as FG10 warned

**Evidence.** `PracticeStep.tsx:54-64`: the `useEffect` watching `state.phase` calls
`audio.speak(beat, lang, state.level >= 2)` the instant phase becomes
`OFFICER_SPEAKING` — no confirmation step, no delay tied to user action.
`usePracticeAudio.ts:49`: `muted` defaults to `readApp('mute', false)` — off unless a
prior visit set it. The mute button itself only exists inside `PracticeBeat.tsx:
92-95`, which renders in the same phase branch the audio effect fires from
(`PracticeStep.tsx:144-147`) — there is no interaction window between "the screen
with a mute button appears" and "audio starts playing" for a first-time player. FG10
named this precisely: "this round's subject... doesn't yet have audio wired to
anything (Move 5.2) — but it must not be allowed to ship un-fixed a second time in a
second codebase." Move 5.2 shipped, and it did. Impact: **the exact standing
complaint from FG06 through FG10 — four rounds and five features running — is no
longer a risk statement about root alone; it is now verified, live, reachable code in
`/app`, hitting Keisha's between-fares context hardest of any persona.**

### 2. Add a live region to the crisis-tier reveal

**Evidence.** `PracticeBeat.tsx:178-179`: `{state.curTier === 'x' ? <div
className="prx-coach good">{t.prx_crisis}</div> : ...}` — plain DOM content, no
`role="alert"` or `aria-live` attribute. Three lines away, the demeanor meter
(`PracticeBeat.tsx:74`) gets exactly this treatment: `role="status"
aria-live="polite"`. The crisis-detection path itself (`usePracticeAudio.ts:
isCrisisText`, called from `PracticeStep.tsx:83`) is real and works — the CHANGELOG's
claim that this cycle fixed the reveal rendering at all is verified correct — but the
reveal's accessibility wasn't part of that fix. Impact: **for a screen-reader user
who types something that trips crisis detection, the single highest-stakes message in
the product (the 988 line) has no guarantee of being announced — it depends on where
screen-reader focus happens to be when the DOM swaps in the new content. This is a
one-attribute fix (`role="alert"` or `aria-live="assertive"`) on the highest-stakes
sentence in the app.**

### 3. Author `PRX_VAR[7]`'s missing hostile variant — no longer structural, now a live gap

**Evidence.** `node -e` dumping `PRX_LEVELS[2].ids` shows `[3,7]` — beat 7 (the
arrest beat) is reachable at level index 2 ("Ordered out," per `t.en.json:prx_lvl3`),
which is in `PRX_LEVEL_IDS` and therefore live and playable today.
`PRX_DIVERGE["2"]` reads `{"g":"curt","b":"hostile"}` — a bad pick on this level
should escalate beat 7's tone to hostile. `PRX_VAR['7']` still has zero `hostile`
entries (four total, tones `calm, calm, curt, curt`). `divergeDeck()`
(`practiceEngine.ts:172-185`) filters the variant pool by wanted tone and returns the
deck unchanged if the pool is empty (line 180) — no error, no fallback message, the
deck simply doesn't escalate. FG10 called this "one Move away from being live"; Move
5.2 is the move, and it happened. Impact: **a real player who picks badly at this
exact point in this exact level gets a silent non-escalation instead of the designed
consequence — indistinguishable from the divergence system simply not firing, which
is a worse failure mode than an error would be, because nothing signals that anything
was supposed to happen.**

### 4. Wire the root-read bridge, or record explicitly that it stays idle through beta — unchanged from FG10, re-verified, now covers a bigger surface

**Evidence.** Re-grepped this round: `readRootPractice`, `readRootDocs`,
`readRootPrefs` (`services/storage.ts:128-182`) still have zero callers outside
`storage.ts` and `i18n.ts` (language only). This was FG10 golden #1 against the
wizard alone; it now also means a returning root user's practice progress —
including any unlocked Hard Mode — is invisible to `/app`'s engine.
`initialState()` (`practiceEngine.ts:202-207`) always seeds from
`readApp<PracticeProgress>('prx', emptyProgress())`, `/app`'s own key, never root's
`amparo_prx`. This directly answers FG10's BS-1: yes, `isLocked()` evaluated against
a fresh empty `PracticeProgress` re-locks content a returning root user already
earned — the migration logic in `storage.ts:128-159` is correct and complete, and
still unconsumed. Impact: **the surface this affects just grew from "the wizard looks
blank" to "a returning user's unlocked practice content looks locked," a sharper hit
for the same root cause.**

### 5. Decide whether `disabled` (real HTML attribute, now shipped) changes the locked-card exposure tradeoff Nia's concern was built around

**Evidence.** `PracticeLevelSelect.tsx:30-31` now sets `disabled={locked}` in
addition to `aria-disabled={locked}` — the FG09/FG10 module-list fix genuinely
shipped. But a native `disabled` button is typically removed from the tab order and,
on some screen readers, announced differently (or not focused at all in sequential
navigation) than an `aria-disabled` button, which stays focusable-but-inert. FG09's
original ask and FG10's carry-forward both assumed the `aria-disabled` shape (focusable,
so a screen-reader user could still discover "this exists, here's why it's locked").
Whether the switch to real `disabled` was cross-checked against that assumption, or
was a drive-by correctness fix that happens to also change the a11y contract, isn't
recorded anywhere in the diff. Impact: **a legitimate improvement (semantically
correct disabled state) may have silently traded away the "discoverable but inert"
property Omar and Nia's personas both depend on — worth a five-minute screen-reader
check before calling this item fully closed.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to `engine/`, `screens/practice/`, `hooks/useOverlayA11y.ts`, and their
content banks** — not the wizard, not the map, not the print pack.

- **Gate first-audio playback on a reachable mute control** (golden #1) — the
  highest-priority item across six rounds of this loop, now a live defect instead of
  a risk statement.
- **Add `role="alert"` or `aria-live="assertive"` to the crisis-tier reveal**
  (golden #2) — one attribute, highest-stakes sentence in the product.
- **Author `PRX_VAR[7]`'s hostile variant** (golden #3) — the divergence chain that
  needs it is now live and reachable, not theoretical.
- **Add tone-tier text prefixes to `prx_ld1`-`prx_ld5`** (Calm:/Escalates:/Hostile:,
  EN+ES) — FG09 golden #1, banked in wargame 15 §1.3 as a must-port fix, now shipped
  to a real screen (`PracticeLevelSelect.tsx:42`) without it.
- **Verify the `disabled` vs `aria-disabled` tradeoff on locked cards was a
  deliberate a11y decision** (golden #5), not just a correctness fix that happened to
  also change what's reachable via Tab.
- **Confirm `readRootPractice` migration semantics for a returning user before Move
  5.2 (already shipped) goes to promotion** — golden #4, now overlapping a bigger
  surface than FG10 flagged it against.
- **`isLocked()`'s three-completions gate is correctly enforced end-to-end, worth
  recording as confirmed-correct, not just re-verified**: `PracticeLevelSelect.tsx:15`
  and `practiceEngine.ts:121-126` compute `mUnlocked` identically
  (`done[0]&&done[1]&&done[2]`), and the level-4 gate additionally requires
  `done[5]` — matches root's semantics, no drift found this round.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06-FG10

**BS-1. Given the wargame's own rule that root stays untouched, is there a
structural reason the mute-before-audio bug (golden #1) can only ever be fixed in
`/app`, never in the live product — and if so, does anyone plan to fix root at
promotion time, or does root ship this gap permanently by policy?** Six rounds have
named this as the single highest-priority fix, and it has now shipped unfixed in a
second codebase. Nobody has asked whether "root untouched" as a migration rule
quietly became "root's bugs are permanent" for this specific one.

**BS-2. Does anyone re-run a screen-reader pass specifically against the crisis
detection path, given that `isCrisisText()` triggers on typed free-text and the
consequence of a missed announcement is materially different from a missed UI label?**
Every other a11y finding in this loop (FG08's map, FG10's DocsOverlay, this round's
demeanor meter) concerns navigation or discovery. The crisis reveal is the first
piece of UI in this project where an accessibility gap has a plausible real-world
safety cost, not just a usability one — and it hasn't been tested against a real
screen reader, only read from source.

**BS-3. When `divergeDeck()` silently no-ops because a variant pool is empty
(golden #3's mechanism), is that failure mode logged or observable anywhere — in
dev, in a future analytics layer, anywhere — or does a content gap like `PRX_VAR[7]`
stay invisible until someone happens to read the source or manually trigger the exact
divergence path in a browser?** FG08 and FG10 both found this gap by reading code;
nobody has verified whether it's *discoverable* by playing the app, which matters for
whether future content gaps like it get caught before or after they ship live.

**BS-4. The demeanor meter, the mute button, and the level-select tone stripe all
encode the same underlying signal (how hostile is this beat) in three different
UI surfaces with three different levels of accessibility completeness — was the
demeanor meter's `aria-live="polite"` a deliberate choice to make *that specific*
signal accessible while the others (tone-tier text hint, crisis-reveal live region)
lagged, or is the inconsistency incidental to which files got touched in which
move?** If deliberate, there's an implicit priority ordering worth stating
explicitly; if incidental, it's worth an audit pass across all three before Move 5.2
is considered accessibility-complete.

**BS-5. Now that officer audio plays automatically and unprompted the moment a level
is entered, has anyone checked what happens on a locked-down work or school network,
or a device with autoplay-with-sound blocked by the browser — does the `.play()`
promise rejection correctly fall through to the TTS fallback (`usePracticeAudio.ts:
122-129`'s `fallback()` latch), or does a blocked-autoplay rejection look different
from a missing-file rejection to the browser, in a way this code doesn't
distinguish?** The fallback logic is written for "clip missing," not explicitly for
"clip blocked by browser policy" — those may hit the same `onerror`/`catch` path, or
they may not, and nobody has tested on a network/device combination where autoplay is
actually restricted.

---

## 5. Group read

**Would-evaluate-favorably verdict: 7 yes/conditional-yes (Wes, Rosa, Luis, Dana, Ana,
Omar, Keisha) / 2 neutral, standing conditions unchanged (Tony, Marcus) / 1
conditional-improved (Nia, sharper than FG10's "nothing to react to").** This is the
first round where every persona on the panel has real material — the practice module
finally has a UI. That shift alone is this round's biggest structural change from
FG06-FG10.

**Biggest objection by theme.** Three of five golden-standard items are the same
shape: something the FSM/content layer was already correctly *designed* to prevent
(a per-beat consent gate, a complete hostile-variant pool, a prefilled progress
state) that the shipped UI layer doesn't yet enforce or doesn't yet have the content
for. This is the identical pattern FG10 named for the wizard — components built ahead
of their consumers — recurring one layer up, in the layer that's supposed to be the
consumer.

**Highest-leverage fix, this round's subject specifically.** Golden standard item
1 — gate first-audio on the mute control being reachable. It is the one item this
loop has flagged in every round since FG06, it is now demonstrably live and not
theoretical, and it is the cheapest fix on this list (a boolean check before the
first `audio.speak()` call) relative to its accumulated priority.

**Highest-leverage fix, across the whole product regardless of surface.** Unchanged
in substance from FG06-FG10, but the framing has to change: this is no longer "the
pre-audio mute gap in root, and don't repeat it in /app." It has been repeated. The
next highest-leverage move is deciding, explicitly, whether root ever gets this fix
under the "untouched" policy — see BS-1 — because as of this tag, the answer that
matters to a real user is "not yet, in either codebase, for a first-time visitor with
default settings."

**Who this still isn't for.** Tony (no institutional backing, unchanged across seven
rounds) and Marcus (no share mechanism for content that's now visually shareable for
the first time). Both are unaffected by this round's subject matter, which is honest
to state rather than stretch a finding to reach them.

---

## 6. Signature

Generated by Amparo Focus Group 11 (Phase 5 completion review, ten-persona panel).
**Panel:** Wes, Ana, Rosa, Luis, Marcus, Dana, Tony, Omar, Keisha, Nia.
**Scope:** `/app` React strangler migration, wargame 15 Moves 5.1-5.3 (v2.19.0) —
practice engine UI, officer audio, overlay accessibility framework. Root
`index.html` unchanged and out of scope this round.
**Verdict date:** 2026-08-12.

All findings tied to live source in `app-src/src/`, or to direct `node -e` dumps of
the extracted content banks. No speculation beyond what a real future move
(promotion, root-fix policy decision) would need to resolve — those are named
explicitly as open decisions, not treated as defects.
