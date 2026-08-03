# Amparo — focus group 04: rehearsal-first positioning + step 5 Practice hub

Date: 2026-08-03. Run against commit `fd245a5`, tag `v2.7.0`.
Ten personas drawn from `.focus-group/members.md` (13 saved).

**Method note.** Everything asserted below about what the app does was read out of
`index.html` this run. Nothing was rendered in a browser, so every claim about a
*pixel* height is marked NOT VERIFIED; every claim about a *string, class, branch
or number in source* carries a line reference. Two contrast figures are computed
from the source colour tokens, not read from a tool — labelled as such.

**Roster change from focus group 03.** FG03 dropped Tony, Ray and Nia because
their defining reactions are to step-0 framing and the practice engine, both out
of scope for a four-step wizard test. v2.7.0 makes both of those the subject, so
**Tony and Nia are seated this run**. Dropped instead: Ana (her test — federal-only
state framing on step 3 — was resolved in FG03 and step 3 is untouched here),
Marisol (her test — Spanish parity — was re-verified in source this run and passes
on all ten new keys, see check 33), and Ray (the audience-boundary question is
unchanged by v2.7.0).

---

## 1. What was verified

| # | Check | Where | Result |
|---|---|---|---|
| 1 | Landing headline | `1412` | `w_title:"Practice the stop before it happens."` — confirmed |
| 2 | Practice is bullet 1 of 4 | `1414`, render `2693` | `w_b1:"Rehearse out loud, before you ever need it"`, rendered first in `[[w_b1,'🗣'],[w_b2,'📍'],[w_b3,'🖨'],[w_b4,'🔒']]` — confirmed |
| 3 | Landing primary CTA | `2697–2698` | gold = `w_btn:"Build my pack"` → `goM(1)`. Practice = **ghost**, `w_try:"🚔 Practice a full stop — 2 minutes"` → `practiceIntroOpen()`. **Headline says practice; the single gold button says pack.** |
| 4 | Stepper labels | `1410` / `1717` | `["State","You","Lifelines","Print","Practice"]` / `["Estado","Tú","Líneas","Imprimir","Práctica"]` — 5 nodes, both languages |
| 5 | Step 5 hub exists | `2870–2888` | Yes. `.pr-grid` renders 6 `.pr-card` from `[0,1,2,3,4,5].map` |
| 6 | **Entry points into step 5** | grep `goM(5)`/`go(5)`/`step=5` | **Exactly one**, line `2820` |
| 7 | That entry point's gate | `2817` | inside `<div id="postPrintActions" style="display:${hasPrinted&&!isDemo?'block':'none'}">` |
| 8 | …and its sub-gate | `2818–2820` | the gold `goM(5)` renders only when `!(prx.done[0]||prx.done[1]||prx.done[2])`. Once any of the first three scenarios is done it is replaced by an `arow` → `practiceOpen()` (the overlay, **not** the hub) |
| 9 | What sets `hasPrinted` | `4570`, `4581–4582` | only `window.addEventListener('afterprint', …)`. No other setter |
| 10 | **Resume guard** | `2945` | `if(s.step>=1&&s.step<=4&&s.state) window.__resumeStep=s.step;` — **capped at 4**. A session saved on step 5 gets no resume chip and `restore()` never sets `step` itself |
| 11 | Hub lock rule | `2871–2872` | `mUnlocked=prx.done[0]&&prx.done[1]&&prx.done[2]`; `locked=i=>(i===3||i===4)&&!mUnlocked` — **index 5 (Checkpoint) is never locked** |
| 12 | Overlay lock rule | `4297` | identical predicate — hub and overlay agree; `prStart()` (`4074–4077`) routes through `prxTab` which re-checks |
| 13 | Checkpoint review status, app's own words | `1482` `prx_chk_note` | "…not legal advice, and **not reviewed by an immigration attorney**." |
| 14 | Print button label | `1474` / `1779`, render `2815` | `v_print_pdf:"Print or save as PDF"` / `"Imprimir o guardar como PDF"` — one label, both outcomes, both languages |
| 15 | Ghost demotion after print | `2815`, `4590` | `class="btn ${hasPrinted&&!isDemo?'ghost':'gold'}"`, plus imperative `pb.classList.replace('gold','ghost')` in the afterprint handler |
| 16 | **FG03's two-gold-button defect** | `2815` + `2820` | **Fixed.** Pre-print: Print gold, hub CTA hidden. Post-print: Print ghost, hub CTA gold. Never two golds on step 4 |
| 17 | `#stateSearch` accessible name | `2718–2719` | `placeholder` only, **still no `aria-label`** — FG03's Omar finding, unfixed. Note `prxTypeIn` at `4438` *does* carry `aria-label`, so the pattern exists in-file |
| 18 | "Not your state?" escape hatch | `1568` / `1873`, `3132–3140` | present both languages; `uncollapseStateGrid()` deliberately does not clear `data.state` |
| 19 | Step-3 segmented carousel | `270–283`, `2771–2775` | `.ll-seg role="tablist"`, `.ll-track` with `tabindex="0" role="group" aria-label` — present |
| 20 | Step-3 card height 667px | — | **NOT VERIFIED** this run (needs a browser). Carried from FG03 |
| 21 | Step 5 instrumented | `2621`, `2633` | `STEP_SLUG=['welcome','state','you','lifelines','print','practice']`; `sr_step_viewed` fires on step change. Hub *arrivals* are measurable |
| 22 | Hub events | `4075` | `sr_practice_hub_start {level,lang}` fires on an unlocked card. **A locked-card tap fires nothing** — `2880` emits no `onclick` when locked |
| 23 | Hub score display | `2883` vs `4322` | stored as `sc+'/'+prRun.length`; hub prints `🟩 ${parseInt(best)}` — **denominator dropped** |
| 24 | Beats per level | `3514`, `3635`, `3695` | L1=5, L2=6, L3=2, L4=6, L5=3 (`PRX_HARD`), L6=4 (`PRX_CHK`) |
| 25 | Level 4 deck composition | `3514` | `ids:[0,8,1,2,3,7]` = L1's first four beats + L3's two. **Zero new officer beats** |
| 26 | TTS rate per level | `3514` + `3865` | 0.95 / 1.12 / 1.28 / 1.28 / 1.30 / **1.00** — the Checkpoint speaks slower than levels 2–5 |
| 27 | Curveball scope | `3760–3766` | `if(runs>=1&&prLevel<2)` — **levels 1–2 only**. L3 and L4 never get one; L5/L6 use fixed decks |
| 28 | Variant tone pools | `3750` | `[['calm'],['curt'],['curt','hostile'],['hostile']]` — indices 4/5 return before this line |
| 29 | **Hostile variant coverage** | `PRX_VAR` | beat 0:2, 1:2, 2:1, 3:1, 4:1, 5:**0**, 6:**0**, 7:**0**, 8:2. Level 4 is all-hostile and uses beat 7 ("You're under arrest.") → falls through to the canonical line tagged `tone:'hostile'` |
| 30 | Variant bank totals | `PRX_VAR` | 45 variants: 18 calm, 18 curt, 9 hostile |
| 31 | Escalation consent | `4303–4305` | `prLevel>=2 && !prWarnOk[prLevel]` — per-level opt-in on L3/L4/L5/L6, four distinct warnings (`prx_warn3..6`) |
| 32 | Idle handling | `3813–3835` | 12 000 ms; never arms below `prLevel>=2`; fires at most once (`prxIdleN>=1`); offers replay **or** leave at equal weight; nothing scored, nothing logged |
| 33 | ES parity, v2.7.0 keys | grep | `hub_title, hub_sub, hub_locked, hub_done, hub_start, hub_replay, hub_back_pack, prx_open_cta, pp_step2, v_print_pdf` — all 2 occurrences (EN+ES) |
| 34 | Dead string | `1472` / `1777` | `hub_replay:"Run again"` / `"Repetir"` — authored in both languages, **referenced nowhere** |
| 35 | Attorney slots | `2146–2150` | TX/GA/NY all `name:""` — `isReviewed()` can never return true |
| 36 | Named trust signal | `2131–2133`, `2426–2432` | `REVIEW.founder="Michael Francois"` — a person, not an institution. `REVIEW.org` is `""` |
| 37 | EDITION | `2152–2157` | `"2026-C"`; its own comment says "checkpoint level and its printed section added". No attorney edition matches |
| 38 | Locked-card a11y | `2880` | `<button class="pr-card lock" aria-disabled="true" title=…>` with `onclick` omitted — **still focusable and tabbable**, activating it does nothing, no live-region feedback |
| 39 | Locked-card contrast | `267` + `269` | `.pr-card.lock{opacity:.55}` over `#fffdf8`. **Computed from source, not tool-measured:** status text `var(--muted)` #64707d → ≈ **2.2:1**; level name `var(--navy)` #1B2A4A at 14px/900 → ≈ **3.5:1**. Both below the 4.5:1 AA threshold for their sizes |
| 40 | Two numbering systems | `2423` vs `1466` | eyebrow renders "Step **5** / 5 · Practice"; six lines above it `pp_step2:"Step 2 of 2 — make it stick:"` |
| 41 | TTS opt-out | `3788`, `3857` | `const prxTTS=('speechSynthesis' in window)` — a **capability check, not a preference**. `prxSetGender` exists; there is **no mute**. The officer voice speaks on every beat with no off switch |

---

## 2. Ten reactions

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **New positioning:** the Spanish headline "Ahora ensáyalo" / "Practica la parada
  antes de que pase" lands. She came for something to give her son; being told to
  *rehearse* rather than *print* matches what she actually pictures doing with him.
- **Step 5:** she never sees it. She builds the pack, prints at the church office
  next Sunday — not on her phone in the moment. `hasPrinted` (check 9) only flips
  on a real `afterprint`, so on the visit where she decided to print later, the
  hub does not exist.
- **Pain point, specific:** the Checkpoint card. When she does eventually reach the
  hub it is a full-brightness, unlocked, one-tap card sitting next to "Calm stop"
  (check 11), and the level's own note tells her it has not been reviewed by an
  immigration attorney (check 13). She reads Spanish carefully; that sentence is
  in the Spanish too. It is the one card she most needs and the one the app itself
  flags as unvetted.
- **Redo?** Yes. **Refer?** **Still no** — unchanged from FG02 and FG03. Verified
  again this run: `REVIEW.attorneys` is three empty objects and the only human name
  on the product is the founder's (checks 35, 36). No institution, no logo, nothing
  her parish would recognise.

### 🧑 Marcus, 19 — NY, broke college student, no printer, no car

- **New positioning:** best reaction on the panel. "Practice the stop before it
  happens" is the first line on the site that describes something he'd actually do.
- **Then he hits the wall.** The headline promises practice; the only gold button
  says **"Build my pack"** (check 3). The practice CTA directly beneath it is a
  ghost outline. He has no printer and no car. The app has just told him the point
  is rehearsal and then made the pack the one thing it wants him to do.
- **Pain point, structural:** he taps the ghost practice button, gets the overlay,
  plays a scenario — and **never sees step 5 at all**, because the hub's only door
  is behind a print event (checks 6–9). Worse, once he's completed one scenario,
  the branch at `2818` permanently swaps the hub CTA for the plain overlay link
  (check 8). *The user most likely to want a scenario menu is the one the code
  routes around it.*
- **Redo?** Yes, for practice. **Refer?** **Conditional** — he'd send the practice
  link, not the site, and there isn't one. FG03's Print-vs-PDF objection is
  genuinely gone (check 14, 16); this replaces it.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old about to solo drive

- **New positioning:** this is her product now. She runs drills; the headline
  finally names the thing she was already doing manually.
- **Step 5:** the one persona who reaches it cleanly — she prints, `afterprint`
  fires, the gold CTA appears, she lands on a six-card menu. Reads as a curriculum.
  Genuinely good.
- **Pain point:** the progress is unreadable. Her best on Calm stop shows **"🟩 4"**
  and her best on Ordered out shows **"🟩 2"** (check 23) — the denominator is
  dropped and the denominators differ per level (5 / 6 / 2 / 6 / 3 / 4, check 24).
  A lower number on the level she did better on. She's the persona who would
  actually track this across weeks with her son, and the display can't support it.
- **Second pain point:** she taps a locked card. Nothing happens — no message, no
  shake, no toast (check 38). She taps twice more before reading the 11.5px status
  text at ≈2.2:1 contrast (check 39).
- **Redo / refer?** **Yes / yes**, still the cleanest yes on the panel. Standing ask
  unchanged and re-verified: a Texas attorney's name, `REVIEW.attorneys.TX.name`
  still `""`.

### 🧑 Luis, 27 — TX, DACA, privacy-first, older Android

- **New positioning:** neutral. He was never here for a game; he came for exact
  scripts. Leading with rehearsal doesn't move him either way.
- **Step 5, the real event for him:** the Checkpoint card. He is the single most
  affected reader of that content in the roster, and v2.7.0 has just promoted it
  from "a tab you find inside an overlay" to "a card in the main funnel, one tap,
  never locked" (check 11) — while levels 4 and 5, which are *less* consequential
  for him, are gated behind finishing three scenarios.
- **Pain point, and it is his alone:** the gate ordering encodes a judgment nobody
  made. Hard mode (3 beats, fictional escalation) is locked. Checkpoint (4 beats,
  real federal consequences, explicitly unreviewed) is not. He would read that as
  the product not knowing which of its own screens is dangerous.
- **On the voice:** no mute (check 41). He practises in a shared apartment on a
  prepaid Android. An officer's voice speaking out loud with no off switch is a
  privacy problem in his own home even though nothing leaves the device.
- **Redo?** Yes. **Refer?** **Maybe**, unchanged, still gated on a nonprofit's name.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **New positioning, and this is the sharpest read of the run:** he does not object
  to rehearsal. He objects to *who is teaching it*. The old headline promised a
  document; a document doesn't claim authority. "Practice the stop before it
  happens" is a claim that this thing knows how the stop goes — and the only name
  attached to it is one man's (check 36).
- **Pain point:** the honesty that would earn him — the Castile/Wright doc overlay
  — is still a 4th-position `linkbtn` at the bottom of step 0 (`2704`), *below* the
  share and about links. Roadmap item 11 identifies this precisely and it has not
  moved. The product raised its claim and left its credential where it was.
- **Step 5:** he'd tap it out of skepticism, hit the Irritated officer scenario,
  and find it fair. Then note that the same product that models a hostile officer
  can't name a single organisation that stands behind it.
- **Redo?** Once. **Refer?** **No.** Unchanged and, on his own logic, slightly
  worse than before v2.7.0 — the claim got bigger and the backing didn't.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, the only real completed funnel

- **New positioning:** finally describes what he actually did. His real transcript
  was "I skip all of that… then at the end it was like, here's some scenarios, and
  that's when I was like, I'm interested now." The headline is now that sentence.
- **Step 5, and this is the finding he exists to surface:** in his real session he
  reached practice **without engaging with the pack**. Under v2.7.0 that path leads
  to the overlay, not the hub — the hub requires `afterprint` (checks 6–9). The
  screen built to solve his exact problem is behind the exact step he skips.
- **Second, source-verified:** if he *does* reach the hub, closes the tab, and comes
  back, the resume guard at `2945` caps at step 4. No resume chip. And if he
  completed one scenario before leaving, the branch at `2818` means the hub CTA is
  gone too. **For him, step 5 can become permanently unreachable.**
- **Redo / refer?** **Yes / yes** — he's still the most engaged user this product
  has ever had. But his yes is now for a screen he mostly can't get to.

### 🧑 Devin, 16 — TX, Dana's son, the end user rather than the buyer

- **New positioning:** works on him for the first time. "Practice" and six named
  scenarios with lock icons is a menu, and he reads menus. FG03 recorded him as
  never opening the app; v2.7.0 gives his mother something worth forwarding.
- **And it can't be forwarded.** There is no URL, hash, or deep link that lands on
  step 5 — the only route is `goM(5)` from a printed session on the same device
  (check 6). Dana prints on her laptop; the hub exists in *her* localStorage.
  Nothing she can text him opens on that screen.
- **Pain point:** the hub is the closest this product has come to the hand-off
  problem logged as roadmap item 7, and it stops one line short of solving it.
- **Redo / refer?** **No** on both — not because the screen is bad, because it is
  unreachable from his side. Same verdict as FG03, different reason, and this time
  the fix is small.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, highest need, lowest patience

- **New positioning:** correct for her. She will never print. Being told the point
  is rehearsal means the product finally describes something she can do at a light.
- **The print label fix landed.** "Print or save as PDF" (check 14) is one label
  covering both outcomes, and the FG03 disclosure-under-a-gold-button hierarchy is
  gone (check 16). Her single loudest objection across two focus groups is
  **resolved** and that is worth stating plainly.
- **New pain point, same shape:** she taps "Print or save as PDF", the OS sheet
  opens, she picks Save as PDF. On the browsers where `afterprint` fires that
  unlocks step 5. On any engine where it doesn't, she is left on step 4 with a gold
  button she already used and no route to the thing the homepage promised. **One
  boolean, one event, one door** (checks 6, 9). RECON, not an asserted defect —
  I did not test browsers.
- **No mute** (check 41): she practises between fares, sometimes with a passenger
  seat that isn't empty. A hostile officer voice with no off switch is a scenario
  she will not run in the car, which is the only place she is.
- **Redo?** Yes. **Refer?** **Not yet** — "I'd have to explain that you have to
  fake-print first."

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **New positioning:** this is the reaction the operator should sit with. The old
  headline offered a document. The new one **leads with the simulation she came
  here to avoid**, and the practice bullet is now the first thing under it (checks
  1, 2). FG02 recorded her as wanting the information without the simulation.
  v2.7.0 makes the simulation the product's opening claim.
- **What actually protects her, and it is real:** the idle handler at `3813–3835`
  no longer re-speaks the hostile line after 12 s of silence. It opens a panel
  offering **replay or leave at equal weight**, fires at most once, and logs
  nothing (check 32). The comment above it names freezing as the most common trauma
  response. That is genuinely good work and she would feel it.
- **What doesn't:** there is no mute (check 41). Escalation is opt-in per level
  (check 31) but *voice* is not opt-in at all. She cannot read a scenario silently.
  There is also no non-simulated route from step 5 — the hub is six scenarios and
  a ghost "Back to my pack"; there is no checklist door.
- **Redo?** She reaches step 0 and leaves. **Refer?** **No.** She is the one hard
  no on this panel and v2.7.0 moved her further away, not closer.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **FG03's finding is unfixed.** `#stateSearch` still has `placeholder` and no
  `aria-label` (check 17). The damning detail this run: `prxTypeIn` at `4438`
  *does* have one. The pattern exists in the same file, six hundred lines away.
- **Step 5, three new findings:**
  1. Locked cards are `<button aria-disabled="true">` with `onclick` omitted
     (check 38). He tabs onto them, presses Enter, nothing happens, nothing is
     announced. `aria-disabled` tells him it's disabled but the silent no-op after
     activation reads as a broken control.
  2. The best-score badge announces as "green square 4" (check 23). No unit, no
     denominator, and the emoji is not `aria-hidden` while `pr-ic` above it is.
  3. Computed from the source tokens (check 39): a locked card's status text is
     ≈2.2:1 and its name ≈3.5:1 against `#fffdf8`. At 200% zoom, opacity doesn't
     scale — those stay at 2.2:1.
- **Redo?** Yes for the wizard. **Refer?** **Conditional**, and the condition is
  now two items instead of one.

---

## 3. Exactly five things needed to make this the golden standard

Ranked. Each is tied to a line in `index.html` or a named persona, not to taste.

### 1. Give step 5 a second door that does not require a print event

**Evidence.** `goM(5)` appears exactly once in 4 660 lines (check 6), inside a div
gated on `hasPrinted && !isDemo` (7), which is set only by `afterprint` (9), and
that CTA additionally disappears once any scenario is complete (8). The resume
guard caps at step 4 (10), so a session saved on the hub returns to step 0 with no
chip. **Wes** reached practice in the real transcript *by skipping the pack* — the
one documented completed funnel takes a path v2.7.0 does not serve. **Keisha** and
**Marcus** own no printer. **Rosa** prints days later, elsewhere. **Devin** cannot
be sent there at all.

This is not a hub problem. The hub is well built and correctly instrumented
(`STEP_SLUG[5]='practice'`, check 21). It is a reachability problem with a
one-line shape: the landing's existing ghost practice button, the resume guard's
`<=4`, and the `!(prx.done[0]||…)` branch are three independent places where the
door could be opened.

### 2. Make the landing's gold button agree with the landing's headline

**Evidence.** `w_title` = "Practice the stop before it happens." `w_btn` = "Build
my pack", rendered `btn gold`. `w_try` = "🚔 Practice a full stop — 2 minutes",
rendered `btn ghost` (check 3). The positioning shipped in the copy and not in the
hierarchy. **Marcus**: no printer, no car, told the point is practice and handed a
pack button. **Tony**: reads the raised claim and the unchanged backing as
overreach. **Nia**: the one persona for whom leading with rehearsal is a cost, and
she pays it in the headline while the button still offers her the document she
actually wanted.

Roadmap item 10 (one primary action per screen) was applied correctly to steps 0–4
and step 4's two-gold defect is genuinely fixed (check 16). Step 0 is the screen
where the *wrong* single action is now gold.

### 3. Decide the Checkpoint's gate before step 5 goes wide — and write the decision down

**Evidence.** `locked=i=>(i===3||i===4)&&!mUnlocked` (check 11). Index 5 is never
locked. The level's own copy says it is "not reviewed by an immigration attorney"
(13). `EDITION="2026-C"` and its comment records that this level was added in this
edition (37); no attorney edition matches (35). Wargame 02 ranks immigration review
of exactly this level at **#3, from a blocking seat, never actioned**, and notes it
is *not* UPL-gated because the same content ships in the printed pack.

v2.7.0 changes the exposure profile without changing the content: before, reaching
the checkpoint meant opening the practice overlay and selecting a tab; now it is
one of six equal cards on a screen in the main funnel, at full brightness, while
two lower-stakes levels sit locked beside it. **Luis** and **Rosa** are the exact
readers. This is the risk the step-5 promotion creates. The decision itself is the
operator's — the finding is that the gate currently encodes a priority nobody
chose, and it should be chosen deliberately rather than inherited from an
`i===3||i===4` written before the hub existed.

### 4. Make hub progress mean something

**Evidence.** Score is stored `sc+'/'+prRun.length` (4322) and rendered
`🟩 ${parseInt(best)}` (2883) — denominator dropped, and denominators differ per
level: 5 / 6 / 2 / 6 / 3 / 4 (check 24). So "🟩 2" on Ordered out is a perfect run
and "🟩 4" on The hard stop is not, and the hub shows the perfect run as the lower
number. **Dana** is the persona who would track this weekly. Locked cards compute
to ≈2.2:1 / ≈3.5:1 contrast (39) and are focusable no-ops (38) — **Omar**.
`hub_replay` is authored in both languages and rendered nowhere (34), so a
completed card says "Done" where the copy already exists to say "Run again".

### 5. Fire an event when someone hits the lock wall

**Evidence.** `sr_step_viewed{name:'practice'}` measures hub arrivals (21) and
`sr_practice_hub_start{level}` measures departures into a scenario (22). Between
them sits the hub's only real friction — the lock on levels 4 and 5 — and it emits
nothing, because locked cards render without an `onclick` (2880). With autocapture
permanently off for privacy, a tap that produces no event produces no evidence at
all. Wargame 02's item 1 shipped precisely to stop this class of blindness; the
new screen reintroduces one instance of it on its most consequential control.

---

## 4. What needs to change in the practice modules

Measured shape of the six modules, all from source:

| # | Name | Deck | Beats | TTS rate | Tone pool | Variants/beat | Curveball | Idle prompt | Gate |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 😌 Calm stop | `ids[0,8,1,2,6]` | 5 | 0.95 | calm | 2 | yes, run 2+ | no | none |
| 2 | 😠 Irritated officer | `ids[0,8,1,2,4,5]` | 6 | 1.12 | curt | 2 | yes, run 2+ | no | none |
| 3 | 🚨 Ordered out | `ids[3,7]` | **2** | 1.28 | curt+hostile | 3 / 2 | no | yes | `prx_warn3` |
| 4 | ⚫ The hard stop | `ids[0,8,1,2,3,7]` | 6 | 1.28 | hostile | 2,2,2,1,1,**0** | no | yes | `prx_warn4` |
| 5 | 🌒 Hard mode | `PRX_HARD` | 3 | 1.30 | fixed | — | no | yes | `prx_warn5` + **locked** |
| 6 | 🚧 Checkpoint | `PRX_CHK` | 4 | **1.00** | fixed | — | no | yes | `prx_warn6`, **not locked** |

**A. The difficulty curve is non-monotonic in every dimension it has.**
Length runs 5 → 6 → **2** → 6 → 3 → 4. Speech rate runs 0.95 → 1.12 → 1.28 → 1.28
→ 1.30 → **1.00**. The two modules named as hardest are the second- and
third-shortest, and the Checkpoint speaks more calmly than everything above level 2.
The naming promises escalation; the parameters deliver a sawtooth. If the intent is
that the Checkpoint's difficulty is *cognitive* rather than *emotional* — the warn6
copy says exactly that — the hub gives a user no way to know that, because all six
cards are rendered identically.

**B. Level 3 is two beats and it is the gatekeeper.**
`ids:[3,7]` — "Step out of the vehicle." and "You're under arrest." Completing it
is one third of the requirement to unlock levels 4 and 5. The shortest module in
the product is load-bearing for the entire progression, and it is also where
hostility first appears in the tone pool (`['curt','hostile']`, check 28). Two
beats is not enough surface for a level that both introduces a tone and gates two
others.

**C. Level 4 introduces no new officer beat, and its climax has no authored line.**
`[0,8,1,2,3,7]` is level 1's first four beats plus level 3's two (check 25). Its
only novelty is tone — and beats 5, 6 and 7 have **zero hostile variants**
(check 29). Level 4 is all-hostile, and its final beat is 7. So the arrest line
falls through `pool.length?pick(pool):null` to the canonical string, tagged
`tone:'hostile'` so the TTS *sounds* angry while the *words* are identical to level
3's. The most escalated moment in the product is a voice filter over the calm
script. **Marcus** named Hard Mode's framing as the first honest thing on a rights
site; level 4 is where that honesty thins out and it is the level immediately
before it.

**D. Four of six modules are byte-identical on every replay.**
The curveball fires only when `runs>=1 && prLevel<2` (check 27) — levels 1 and 2.
Levels 3 and 4 never receive one despite having variant pools; levels 5 and 6 return
fixed decks before the variant code runs. Roadmap item 15 ("surface the
replayability that already exists") is worth re-scoping on this evidence: the
replayability exists on **two** modules, not six, and the real user's request —
"he asked you this, but it's kind of worded differently, so it makes you think" —
is unmet on exactly the modules where re-running matters most. The curveball is
also date-seeded, so a user replaying five times in one sitting gets the same
curveball five times.

**E. There is no mute, and that is the biggest single gap.**
`prxTTS` is a capability check, not a preference (check 41). Escalation is opt-in
per level and that machinery is good (check 31), but *voice* is not opt-in at all.
This blocks **Nia** (cannot read a scenario silently), **Keisha** (in a car, often
with a passenger), **Luis** (shared apartment), and **Wes**, whose own transcript
says he waited for a private space before doing something the app asked of him. A
silent-read mode costs nothing legally and unblocks four of ten personas.

**F. Missing entirely from the module set.** The exit — "am I being detained /
am I free to go" — appears once, as beat 6 in level 1 only ("The stop seems to be
over"), and never in a hostile or escalated context. It is the mechanism the whole
pack exists to deliver and it is rehearsed exclusively in the easiest module.
Wargame 02 item 3b already establishes that the word *detained* is undefined in
the product; that gloss is an attorney task and **nothing here proposes authoring
it**. The module-level observation is narrower and needs no new legal text: the
existing reviewed beat 6 is used in one of six scenarios.

**G. `hub_replay` should replace `hub_done`** on completed cards (check 34) — the
string exists in both languages and would turn a terminal state into an invitation,
which is the entire point of a rehearsal product.

---

## 5. Blind-spot questions a top UX researcher would ask that the operator has not

**BS-1. What is the hub's *retention* job, and why is it built for first-timers only?**
Line `2818`: the gold route into the hub renders only when
`!(prx.done[0]||prx.done[1]||prx.done[2])`. A screen showing progress and lock
state is, by construction, a *returning-user* surface — and the code hands it to
first-timers and takes it away the moment progress exists. Nobody has asked which
visit the hub is for. This inverts the feature's own premise and no document in the
corpus notices.

**BS-2. Does the rehearsal claim survive one rehearsal?**
The headline is now "Practice the stop before it happens" — a claim about recall
under stress. `sr_practice_level_done` fires with score and total, but nothing in
the product measures a *second* exposure, and roadmap item 16 (spaced repetition)
is still unbuilt and UPL-gated. v2.7.0 raised the product's central claim to the
headline while the mechanism that would make it true remains the lowest-ranked
practice item. Nobody has asked whether leading with rehearsal creates a promise
the product cannot currently keep.

**BS-3. `hasPrinted` does not mean printed. What is it actually counting?**
It flips on `afterprint` (check 9), which fires in most engines even when the user
cancels the OS dialog. So `hasPrinted` means "opened the print sheet", and it is
now load-bearing for three separate things: the ghost demotion, the stale-pack
reminder, and — new in v2.7.0 — **the sole gate on step 5**. Every funnel number
the operator reads about "printing" is really about dialog-opening, and the newest
feature inherits that ambiguity as its entry condition. Nobody has audited the
semantics of this boolean since it acquired a third job.

**BS-4. Who decided Hard mode is more dangerous than the Checkpoint?**
`i===3||i===4` (check 11) predates the hub. Applied to a six-card menu it now reads
as an editorial statement: fictional escalation is protected, real federal
consequences are not. The immigration review is tracked (wargame 02 item 3) but the
*gating* question is separate from the *content* question and nobody has asked it.
It is answerable today, for free, without counsel.

**BS-5. The stepper promises five steps from step 1. What happens to the people
who never get the fifth?**
`stepLabels` has five entries and the eyebrow renders "Step *n* / 5" from step 1
onward (check 4, `2423`). Every user sees a five-step contract at the start. Only
users who fire `afterprint` can complete it. Nobody has asked what an unfinishable
progress indicator does to a product whose entire pitch is trustworthiness — and
this is the same class of defect the project's own recorded lesson names: *a check
that breaks quietly while still making its claim.*

**BS-6. Two numbering systems are on screen at once.**
`pp_step2:"Step 2 of 2 — make it stick:"` sits directly above the button that
navigates to a screen whose eyebrow says "Step 5 / 5" (check 40). Small, but it is
evidence of the larger unasked question: is Amparo a five-step wizard or a two-part
product (pack, then rehearsal)? v2.7.0 committed to both simultaneously and nobody
has picked one.

**BS-7. Nobody has asked what the hub costs the personas it wasn't built for.**
Every prior focus group measured whether a change *helped* someone. Nia is measured
as harmed by this one — the simulation moved from a buried overlay to the headline
and the stepper. The corpus has no mechanism for recording a change that is net
positive but has an identified loser, and so the roadmap will not carry her cost
forward into the next decision.

**BS-8. The hub is the closest thing to a shareable artifact this product has ever
had, and it has no address.**
No hash route, no query param, no deep link (check 6). Devin's blocker, Rosa's
church, Tony's chapter, and Keisha's driver network are all *distribution* problems
that a linkable scenario would partly solve — and wargame 02 item 6 ("decide the
distribution question") is still open. Nobody has connected the routing decision to
the distribution decision, and v2.7.0 is the first build where they are the same
decision.

---

## 6. Group read

**Consensus:** 4 clear yes (Dana, Wes, Marcus-for-practice, Omar-conditional-yes) /
4 conditional (Rosa, Luis, Keisha, Devin) / **2 no** (Tony, Nia). The zero-hard-no
result of FG03 does not hold. Both no's are on the *positioning* change, not on any
screen: Tony because the claim grew while the backing didn't, Nia because the
simulation she avoids is now the first sentence.

**What genuinely improved, stated without hedging.** FG03's two loudest findings are
fixed and verified in source: step 4 no longer renders two gold buttons (check 16),
and "Print or save as PDF" is one label covering both outcomes in both languages
(14). Keisha's and Marcus's single most-repeated objection across two focus groups
is resolved. The idle handler's replay-or-leave design (32) is the best piece of
trauma-aware engineering in the file. The hub itself is instrumented correctly
before shipping (21), which is the discipline wargame 02 item 1 was meant to
install and it took.

**Biggest objection, by count — 6 of 10 personas:** step 5 is unreachable for them.
One `goM(5)` in the file, behind `hasPrinted`, behind `afterprint`, and additionally
behind having done no scenarios; plus a resume guard that stops at step 4. Rosa,
Marcus, Wes, Devin, Keisha and Luis all fail at least one of those conditions. The
product's new headline promises the thing most of the panel cannot get to.

**Second objection — 3 personas, and it is the cheapest fix on the list:** the
landing's gold button says "Build my pack" under a headline that says practice.

**Third, and the one to escalate:** the Checkpoint is the only unreviewed,
highest-consequence content in the product, it is now a full-brightness one-tap card
in the core funnel, and it is the *only* one of the three escalated levels that is
not gated. Flagging the risk, not re-litigating the decision — but note it is
answerable today at zero cost, independently of the pending immigration and UPL
reviews.

**Highest-leverage fix:** open a second door into step 5. It is the difference
between a well-built screen that 4 of 10 personas can reach and one that all 10 can.
Everything else on the list is refinement of a screen most users never see.

**Who this is not for:** Nia, explicitly and by design as of v2.7.0. There is no
non-simulated route out of step 5 and no way to run a scenario silently. That is a
decision the product has now made in its headline; it should be made on purpose.
