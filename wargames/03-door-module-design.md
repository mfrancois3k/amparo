# Wargame 03 — "Police at your door" module design + existing-scenario changes

Date: 2026-08-03. Design document only. **No `index.html` edits were made and
none are authorized by this document.**

**Inputs:** direct inspection of `index.html` (practice engine, lines
~3475–4470) at commit `a60717f`; research digest at
`C:\Users\mfran\Obsidian\raw\watched\batch-amparo-trespassing-research-2026-08-03\digest.md`
and per-video reports `video-2/`, `video-3/`, `video-4/`.

---

## CONSTRAINT — the thing that governs every line below

The research inputs are **three YouTube marketing videos from one law firm's
lead-generation channel**. The digest says so itself, in its own opening
paragraph. Nothing in them has been checked against a primary source. Several
case names in video 3 were caption-garbled and could not be confirmed even at
the transcription level.

Project rule 1 is absolute: *never generate statute text or legal citations with
a model.*

So this document designs **structure only**: beat sequence, decision type per
beat, pacing, tone escalation, scoring shape, where the module slots, what the
failure mode is. Every place a legal sentence belongs, there is a
`TODO_ATTORNEY` placeholder with a `SOURCE_HINT` pointing at where the source
video raised the topic — as a *research lead for an attorney*, not as content.

Case names appear in this document exactly twice, both marked. To restate
plainly: **Payton v. New York and Caniglia v. Strom are cited by the source
video (video-4 @03:41 and @04:50). They are UNVERIFIED here. No holding is
asserted. An attorney must confirm the case, the holding, and its applicability
before either name appears in the app.** The same applies, with more force, to
video-3's eight citations, which the digest itself flags as the highest
verification burden in the batch.

---

## 1. Engine fit analysis — exactly what a new level must supply

The practice engine is a **linear deck runner**. There is no branching, no
state carried between beats, and no early exit: a run is `prDeck[0..n-1]`
consumed in order until `prIdx>=prDeck.length`, then the results screen. Any
design that needs branching needs new engine code. This one does not — by
construction (see §2).

### 1.1 The two deck-construction modes

`prxBuildDeck()` (index.html:3746) has two paths:

```js
function prxBuildDeck(){
  if(prLevel===4) return PRX_HARD.map(h=>Object.assign({},h)); // fixed track — no variants, no curveball
  if(prLevel===5) return PRX_CHK.map(h=>Object.assign({},h));  // checkpoint — fixed, legally scripted
  const L=PRX_LEVELS[prLevel];
  const tones=[['calm'],['curt'],['curt','hostile'],['hostile']][prLevel];
  ...
}
```

- **Randomized path** (levels 0–3): pulls officer lines from `PRX_VAR[ci]`
  filtered by that level's allowed tones, and may splice in a curveball.
- **Fixed path** (levels 4, 5): returns a hand-authored array verbatim.

**The door module must use the fixed path.** Three reasons, all load-bearing:

1. The `tones` array at :3750 is a 4-element literal indexed by `prLevel`. A
   level at index 6 evaluates `tones` to `undefined`, and `tones.includes(...)`
   on the next line throws. The randomized path is not reachable at index 6
   without editing that array.
2. `PRX_VAR` has no door beats and authoring ~30 door variants multiplies the
   attorney review surface by 6× for content the user sees once per run.
3. Precedent: the checkpoint (`PRX_CHK`) is fixed and its comment says why —
   *"fixed, legally scripted."* A door module has the same property.

### 1.2 Exact shapes a fixed-track level must supply

**(a) The deck array** — same shape as `PRX_CHK` (index.html:3695):

```js
const PRX_CHK=[
 {ci:30,id:'k30',tone:'calm',
  setter:{en:"Traffic slows. Cones, floodlights, a green-and-white SUV. …",es:"…"},
  officer:{en:"Citizenship?",es:"¿Ciudadanía?"}},
 …
];
```

| Field | Required | Notes |
|---|---|---|
| `ci` | yes | Card index. **Must not collide** with 0–8 (scored traffic bank), 20–22 (hard), 30–33 (checkpoint). Use **40–46** for the door. |
| `id` | yes | Audio clip key → `audio/<en\|es>/<m\|f>/<id>.mp3` (:3847). Without it the beat falls back to browser TTS. Use `d40`…`d45`. |
| `tone` | yes | `calm` \| `curt` \| `hostile`. Drives the demeanor meter (:4406–4409), the bubble colour class (:4410), and TTS rate/pitch (`PRX_TONE`, :3570). |
| `setter` | optional | Italic scene line above the officer bubble (:4417). **The door module's most important field — see §2.** |
| `officer` | yes | `{en,es}`. Rendered in the grey bubble and spoken. |

**(b) `PRACTICE.en[ci]` / `PRACTICE.es[ci]`** — `{o, y}`:

```js
PRACTICE.en[30]={o:"“Citizenship?”", y:"Decline calmly, or answer briefly — but never volunteer where you've been."};
```

`o` is a display fallback. `y` is **the model answer AND the scoring key**.

> **Hard engine constraint, easy to miss:** the free-text matcher extracts
> scoring keywords by regexing `card.y` for curly-quoted spans —
> `(card.y.match(/“([^”]+)”/g)||[])` at :3920 and again at :4051. **If `y`
> contains no `“…”` phrase, `words.length===0`, `good` is forced `false`, and
> the beat is unwinnable via the type-your-own path.** Every door beat's `y`
> must contain at least one curly-quoted sentence. (Two shipped beats already
> violate this — see §5.1.)

**(c) `PRX_OPT[ci]`** — the good/bad pair plus coach lines (:3546):

```js
PRX_OPT[32]={
 g:{en:'…',es:'…'},   // the correct option label
 b:{en:'…',es:'…'},   // one plausible common mistake
 gc:{en:'…',es:'…'},  // coach line shown after the good pick
 bc:{en:'…',es:'…'},  // coach line shown after the mistake
 react:{en:'…',es:'…'}// officer's next line, shown ONLY after the mistake
};
```

Optional `bothGood:true` + `react2` variant (hard mode, :3654) — neither option
is a miss, `prCurTier` is forced `'g'`, and the officer reacts to *both*
choices. **Required for the foot-in-door beat if it ships (§3, beat 7).**

**(d) `PRX_CITES[lang][ci]`** — optional. Existing comment (:3532) restricts
this to *"constitutional / Supreme Court only (state-independent and
verifiable)"*. Door beats get **no cite entries** until attorney sign-off.

**(e) `PRX_DO`** (:3515) — `new Set([3,5,33])`. Membership means the beat is an
action, not a spoken line; it suppresses the record console (`hasConsole`,
:4399). Add door beats whose correct response is a *physical non-action*.

### 1.3 Everything else that must change to add a 7th level

These are the places that hardcode the level count. All of them are cheap; all
of them are easy to miss.

| Location | What's hardcoded | Change |
|---|---|---|
| :4301 | `[0,1,2,3,4,5].map(...)` — tab strip | → `[0,1,2,3,4,5,6]` |
| :2872 (hub) | `[0,1,2,3,4,5].map(...)` — step-5 hub grid | → same |
| :4304 | Nested ternary picking the warn copy: `prLevel===5?prx_warn6:(prLevel===4?…:(prLevel===3?…:prx_warn3))` | **Trap:** index 6 falls through to `prx_warn3` — the *arrest* warning. Must add a `prLevel===6?_t.prx_warn7` branch. |
| :4302 | Tab art: `img/scene-${i+1}.jpg` for i<4; CSS badges `.hardbg` (i=4) / `.chkbg` (i=5) | Needs a `.doorbg` CSS badge or `img/scene-7.jpg`. CSS badge is cheaper and matches the two most recent levels. |
| i18n both blocks (:1479, :1784) | `prx_lvl1…prx_lvl6` | Add `prx_lvl7`, `prx_warn7` in EN and ES. |
| :3750 | `tones` 4-element literal | Only if the randomized path is ever wanted. Not needed for a fixed deck. |
| :4289 | `const L=PRX_LEVELS[prLevel]` | **Dead local** — `L` and `deck` are assigned and never read in `practiceRender`. A `PRX_LEVELS[6]` entry is therefore not strictly required. Add one anyway (defensive, one line) or delete the dead locals. |

### 1.4 Two things that must NOT change

**Progress keys are numeric level indices.** `prx.done`, `prx.best`,
`prx.runs` are objects keyed by `prLevel` and persisted to `localStorage` under
`amparo_prx` (:3779–3786). **Inserting the door module anywhere but the end
silently re-points every existing user's saved progress onto the wrong
scenarios.** Append at index 6. Non-negotiable.

**The mastery gate and certificate are the 0/1/2 set.**
`mUnlocked = prx.done[0]&&prx.done[1]&&prx.done[2]` (:4293), and
`prxCertCanvas` iterates `[prx_lvl1, prx_lvl2, prx_lvl3]` (:4249). Appending at
6 leaves both untouched. Do not add the door to either.

---

## 2. Why a door is not a traffic stop — and the mechanic that follows

### 2.1 The structural difference

| | Traffic stop (levels 0–4) | Checkpoint (5) | **Door** |
|---|---|---|---|
| Physical frame | Seated, contained, cannot leave | Seated, in a queue | **Standing, mobile, behind a barrier you control** |
| Encounter status at beat 1 | Already a detention | Already a stop | **Voluntary — you may not have to participate at all** |
| Documents | Legally required | One may be requested | **None** |
| Every beat is… | a speech act | a speech act | **a speech act OR a position** |
| Goal | End it fast ("Am I free to go?") | Get through | **Time is on your side — nothing forces resolution** |
| Can the user end it unilaterally? | No | No | **Yes, at every beat** |
| Who else is present | Nobody | Passengers | **Family, roommates, children** |
| Failure mode trained against | Panic | Volunteering | **Politeness** |

### 2.2 The two consequences that actually drive the design

**(a) The central decision is not what you say — it's whether you open.**

The engine renders every beat as *officer line → two text options → coach*.
That maps perfectly onto a car, where the whole encounter is dialogue. At a
door, the highest-value decision at beat 1 is a **physical non-action**, and
the option label for it is not a sentence someone says — it's a thing someone
*doesn't do*.

The engine already has this concept. `PRX_DO = new Set([3,5,33])` marks beats
that are actions, not lines, and `PRX_OPT[3]` shows the authoring pattern:

```js
g:{en:'“Okay, officer.” — step out, hands visible', …}
b:{en:'“Why? I didn’t do anything.” — stay put', …}
```

Label = quoted line + em-dash + physical action. **Reuse that pattern
verbatim.** No new engine concept needed. The door's beat-1 good option is a
line spoken *through* a door plus "— door stays closed."

Caveat that follows from §1.2: a `PRX_DO` beat still needs a `“…”` phrase in
its `y` or the type-your-own path can never score it.

**(b) Position is a resource that degrades irreversibly. The engine cannot
model that.**

In a traffic stop, no beat worsens the legal footing of the next one — each
beat is independent, which is why a randomized deck works there. At a door,
opening at beat 1 changes what beats 2–6 even mean. That is *branching state*,
and the engine has none.

**Do not add branching.** Express irreversibility through **the `setter`
field**, which already exists and already renders (:4417), written on the
assumption that the user held position — with the `bc` coach line naming what
would have been lost. The scenario stays linear; the *narration* carries the
stakes. This is the same move `PRX_HARD` makes: the officer escalates on a
fixed track and the copy does the emotional work, not the state machine.

Concretely: the `setter` on door beats 2–6 is doing far more work than any
setter in the app today. Budget attorney/writer time accordingly.

**(c) A third design consequence: the module should feel *slower* than the
traffic stop.** The car levels are paced by an officer standing at your window
with your licence in his hand. The door has no such clock. The `setter` lines
should stretch time, not compress it — silence, waiting, the officer still
there. That is the single biggest tonal difference and it is entirely a copy
decision, not a code one.

---

## 3. Beat-by-beat scaffold

**Proposed `ci` range: 40–46. Proposed audio ids: `d40`–`d46`.**

Six shipping beats. A seventh is specified but **conditionally excluded** —
see beat 7.

Every `officer`, `g`, `b`, `gc`, `bc`, `react`, `setter`, and `y` value below
is a `TODO_ATTORNEY` placeholder. The *decision type* and *failure mode* on
each beat are the design contribution and are safe to build the review brief
around.

---

### Beat 1 — `ci:40` "The knock" · tone `calm` · **`PRX_DO` member**

```js
{ ci:40, id:'d40', tone:'calm',
  setter:  { TODO_ATTORNEY_COPY: "night, a knock, you are inside — NO children referenced, NO sound effect (see §6)",
             SOURCE_HINT: "video-4 @00:00 cold open, UNVERIFIED — used for scene framing only, no legal content" },
  officer: { TODO_ATTORNEY: "officer's opening line — knock-and-talk, deliberately vague pretext",
             SOURCE_HINT: "video-4 @00:08 and @02:37, UNVERIFIED" } }

PRX_OPT[40] = {
  g:  { TODO_ATTORNEY: "correct option label — a line spoken THROUGH the closed door + '— door stays closed'. Must follow the PRX_OPT[3] label pattern: quoted line, em-dash, physical action." },
  b:  { TODO_ATTORNEY: "the polite reflex — open the door to be helpful. This is the single most common real-world action and must read as sympathetic, not stupid." },
  gc: { TODO_ATTORNEY: "why staying behind the door is the stronger position" },
  bc: { TODO_ATTORNEY: "what opening costs — written WITHOUT blame (see §6.6)",
        SOURCE_HINT: "video-4 @01:39 'plain view' claim and @01:50 'polite reflex', BOTH UNVERIFIED — attorney must confirm whether either framing is accurate before any version of this line exists" },
  react: { TODO_ATTORNEY: "officer's follow-up after the door opens" }
};
PRACTICE.en[40] = { o:"…", y:"TODO_ATTORNEY — MUST contain at least one “curly-quoted” sentence or this beat cannot be scored (§1.2)" };
```

- **Decision type:** act / don't act. The only beat in the app where the correct
  answer is primarily physical.
- **Trains against:** the politeness reflex.
- **Why first:** it is the module's thesis. Everything after it is a test of
  whether the position taken here holds.

---

### Beat 2 — `ci:41` "The vague reason" · tone `calm`

- **Decision type:** *ask them to name the basis* vs. *start explaining yourself*.
- **Trains against:** filling the silence. The digest's cross-video skeleton is
  `decline → invoke → force the officer to name the legal basis`; this is the
  "force them to name it" move.
- `setter`: the door is still closed; the officer has not said what this is
  about. **Time stretches here.**
- `bc` failure: the user narrates their evening unprompted. Same failure the
  checkpoint's beat 30 trains (`bc`: *"That one sentence handed him foreign
  travel he didn't have"*) — reuse that coach *register*, not its text.
- `SOURCE_HINT`: video-4 @02:37 (vagueness-as-strategy claim) and @03:03
  (claim that officers may state a false reason) — **both UNVERIFIED, and the
  second is the single claim in this batch most in need of attorney
  confirmation before it is stated to a user in any form.**

---

### Beat 3 — `ci:42` "The warrant question" · tone `curt`

- **Decision type:** *ask a specific procedural question* vs. *accept an
  assertion at face value*.
- **Trains against:** treating a claim as a fact.
- `TODO_ATTORNEY`: the entire content of this beat — what may be asked, what
  the answer means, and whether any verification step is realistic or safe to
  teach. `SOURCE_HINT`: video-4 @06:06 and @06:13 (verification-through-glass
  advice), **UNVERIFIED**.
- **Design flag:** this is the beat with the widest gap between "sounds
  empowering in a video" and "is safe advice to rehearse." If attorney review
  finds the verification step is impractical or risky, **cut the beat to five
  and keep the module honest**. It is not load-bearing for the module's thesis.

---

### Beat 4 — `ci:43` "Just step out for a second" · tone `curt` · **`PRX_DO` member**

- **THE SIGNATURE BEAT.** Position loss, offered as a small social courtesy.
- **Decision type:** hold position vs. concede it in a way that feels
  negligible.
- **Trains against:** the belief that a small concession is a small concession.
- The `bc` coach line here is the module's central teaching moment and must
  make one thing explicit: **the position, once given, does not come back.**
  Nothing else in Amparo teaches irreversibility, because nothing else in
  Amparo has it.
- `SOURCE_HINT`: video-3 @01:15 (the "step outside" tactic), **UNVERIFIED**.
- Mirror `PRX_OPT[3]`'s label pattern again — but note the *inversion*: at
  ci 3 (step out of the vehicle) complying is correct; here it is the mistake.
  **That inversion is the most valuable thing this module teaches a user who
  has already played the traffic stop**, and the `gc`/`bc` copy should say so
  out loud, naming the traffic-stop beat by name. Cross-scenario contrast is
  free instructional design — the user has already rehearsed the opposite.

---

### Beat 5 — `ci:44` "The stated reason to come in anyway" · tone `curt`

- **Decision type:** *ask them to state it concretely* vs. *argue the law*.
- **Trains against:** litigating on your doorstep. The user is not going to win
  a legal argument standing there; the goal is a clear record.
- **Do not name a doctrine in the option labels.** If a doctrine name belongs
  anywhere it is in a `PRX_CITES` entry, and only after review — and
  `PRX_CITES`'s own comment restricts it to constitutional/Supreme Court
  anchors.
- `SOURCE_HINT`: video-4 @07:10 (emergency-articulation advice) and @04:50
  (**Caniglia v. Strom — cited by source video, UNVERIFIED, requires attorney
  confirmation of case, holding, and applicability**).

---

### Beat 6 — `ci:45` "We'll come back with a warrant" · tone `hostile`

- **Decision type:** repeat the same line verbatim vs. cave vs. escalate.
- **Trains against:** re-arguing under pressure. The digest names this
  `broken-record-repetition`, present in 2 of 3 videos — it is the one mechanic
  in the batch that is a *behavioural* claim rather than a legal one, and is
  therefore the safest to build on.
- **Mechanically elegant:** the correct option at this beat should be
  *textually identical* to the correct option at beat 2 or 5. The user picks
  the same sentence twice. That is the lesson, expressed as an interface fact
  rather than a coach line.
- Closing beat. `setter` should place the officer as still there, still
  waiting — resolve nothing.
- `SOURCE_HINT`: video-4 @07:49, **UNVERIFIED**.

---

### Beat 7 — `ci:46` "The foot in the door" · **CONDITIONAL — recommend excluding from v1**

The source (video-3 @16:16) presents two cases reaching **opposite outcomes on
the same physical act**. The digest flags this as a genuine split *the video
itself acknowledges*, and notes both case names are among the caption-garbled
set.

**Design ruling: there is no correct answer to author here, so do not author
one.**

Two acceptable paths, in preference order:

1. **Ship six beats.** Put foot-in-door on a visible "what we don't teach and
   why" list. Refusing to script an outcome-uncertain physical confrontation is
   consistent with everything else this app does.
2. **If — and only if — attorney review resolves the split**, ship it as a
   `bothGood:true` beat modelled exactly on `PRX_OPT[20]`:

```js
PRX_OPT[46] = { bothGood:true,
  g:{TODO_ATTORNEY:"option A"}, b:{TODO_ATTORNEY:"option B"},
  gc:{TODO_ATTORNEY:"…"},       bc:{TODO_ATTORNEY:"…"},
  react:{TODO_ATTORNEY:"…"},    react2:{TODO_ATTORNEY:"…"} };
```

`bothGood` exists precisely for "neither choice is a mistake and the officer
reacts either way." It is the only honest shape for a beat whose real-world
outcome is contested.

**Never ship this beat as a scored good/bad pair.** A green square on a beat
where courts have split is the app telling a user something the record does not
support.

---

### Deck summary

| # | ci | id | Decision type | Tone | Trains against |
|---|---|---|---|---|---|
| 1 | 40 | d40 | act / don't act | calm | politeness reflex |
| 2 | 41 | d41 | ask vs. explain | calm | filling silence |
| 3 | 42 | d42 | verify vs. accept | curt | claim-as-fact *(cuttable)* |
| 4 | 43 | d43 | hold vs. concede position | curt | small-concession thinking |
| 5 | 44 | d44 | request specifics vs. argue | curt | doorstep litigation |
| 6 | 45 | d45 | repeat vs. re-argue | hostile | escalation under pressure |
| 7 | 46 | d46 | *(bothGood, conditional)* | hostile | *(outcome uncertainty)* |

Tone ladder `calm → calm → curt → curt → curt → hostile` is deliberately
**flatter and slower than the traffic stop**, which reaches hostile by beat 2 on
level 3. A door encounter that turns hostile immediately teaches the wrong
prior: the dangerous version of this encounter is the one that stays polite.

Note the alternating-option-side behaviour at :4435 (`prIdx%2===0 ? g+b : b+g`)
— with six beats the good option renders first on beats 1, 3, 5. Preserved for
free; nothing to do.

---

## 4. Difficulty curve and placement

### 4.1 Read of the existing curve

Levels are not ordered by difficulty — the code comment at :3504 says so:
*"Levels = officer hostility, not 'difficulty'."* Sorting by **failure mode
trained** instead:

| Idx | Level | Beats | Failure mode | Gated | Ends in |
|---|---|---|---|---|---|
| 0 | Calm stop | 5 | learning the script | no | score |
| 1 | Irritated | 6 | holding it under irritation | no | score |
| 2 | Ordered out | **2** | compliance + invocation | consent gate | sober score |
| 3 | The hard stop | 6 | holding under sustained hostility | **locked** | sober score |
| 4 | Hard mode | 3 | **self-blame** | **locked** | debrief, no score |
| 5 | Checkpoint | 4 | **volunteering** | consent gate | score + limits note |
| **6** | **The door** | **6** | **politeness** | **consent gate, not locked** | **score** |

The door adds a genuinely new failure mode. It is the fourth distinct one, and
arguably the most common in real life.

### 4.2 Placement: index 6, appended. Not gated.

**Index 6** — forced by §1.4: progress is keyed by numeric index.

**Not behind the `mUnlocked` lock**, for the reason the code already gives for
the checkpoint at :4296: *"Checkpoint (5) is never gated: it's a different
encounter, not an escalation."* A door encounter is not an escalated traffic
stop. Gating it means the person who opens Amparo *tonight because police are
at the door* cannot reach the one scenario they need. That is the whole product
failing at the moment it matters.

**But it does get a consent gate**, and gets it automatically: the check at
:4303 is `prLevel>=2 && !prWarnOk[prLevel]`, and 6 ≥ 2. **This is a trap, not a
gift** — the warn-copy ternary at :4304 has no branch for 6, so it falls
through to `prx_warn3`, which warns about *an arrest during a traffic stop*.
Wrong scenario, wrong register, and it would be the first thing a door user
reads. `prx_warn7` is mandatory, in both language blocks.

**Two side effects of `prLevel>=2` worth deciding deliberately:**

- **Idle escalation arms** (`prxIdleArm`, :3816: `if(prLevel<2 …) return`). See
  §6.4 — this needs door-specific handling, not the default.
- **The Back button hides until consent is given** (:4292). Correct, unchanged.

**Curveballs do not fire** (`runs>=1 && prLevel<2`, :3762). Correct for a fixed
deck. If curveballs are ever wanted here, both that condition *and* the `tones`
literal at :3750 need extending — note it, don't do it.

**Scene art:** levels 4 and 5 use CSS-only badges (`.hardbg`, `.chkbg`,
:416–432). Follow that — a `.doorbg` badge is cheaper than a photo, ships in
the single HTML file, and avoids a stock image of a police officer at a
residential door, which is exactly the image this audience does not need on a
tab strip.

---

## 5. Changes recommended to the six existing scenarios

Ordered by severity. Each is verified against source, not inferred.

### 5.1 CRITICAL — two beats are unwinnable via the type-your-own path

The free-text matcher scores against curly-quoted phrases pulled from `card.y`
(:3920, :4051). Two shipped beats have **no curly-quoted phrase in `y`**:

- **ci 5, "Sign here"** (:3487, and all three `PRX_SIGN` state overrides at
  :3520–3530) — `y` is *"Sign it. Signing is a promise to appear…"*, no `“…”`.
- **ci 33, "Pull over to secondary"** (:3716) — `y` is *"Comply with where to
  park…"*, no `“…”`.

Result: `words.length===0` → `good` forced `false` → `prCurTier='y'` →
**guaranteed yellow square, no matter what the user types**, with no
explanation shown (the `prx-match` hit bar is also skipped because
`prxSaidTotal===0`). ci 5 is in level 1; ci 33 is in level 5. Both display a
score.

*(Hard-mode beats 20–22 share the defect but are invisible there — that level
shows a debrief, not a grid.)*

**Root-cause fix, not per-beat:** the matcher is **duplicated** at :3918–3924
and :4049–4054. This is the same duplication that already caused a shipped
drift bug — the code comment at :3880 records that the crisis list had
diverged between the typed and voice paths, missing three phrases including two
Spanish ones. Extract one `prxScore(text, card)` used by both, and inside it
treat "no keywords available" as **unscored** (`prCurTier='x'`, the mechanism
crisis disclosures already use at :4113) rather than a miss. One guard, both
call sites, every future beat covered — including all seven door beats.

### 5.2 HIGH — the gated level's climactic beat has no audio and no hostile line

Level 3 ("The hard stop") is `ids:[0,8,1,2,3,7]` at `tones:['hostile']`.
**`PRX_VAR[7]` (the arrest beat) contains four variants — two `calm`, two
`curt`, zero `hostile`.** The filter at :3753 returns an empty pool, so the
fallback at :3756 fires:

```js
:{ci,officer:{en:PRACTICE.en[ci].o,es:PRACTICE.es[ci].o},tone:tones[0]};
```

No `id` → no `audio/…/h*.mp3` → browser TTS. So the **arrest** — the emotional
climax of a level users must unlock three others to reach — is the one line in
the level that sounds robotic, on a level where every other line is a recorded
neural clip.

Fix: author 1–2 hostile variants for beat 7 and record clips, or record a clip
for the base line and give it an id. Either is a small diff. This is a level-
design fix, not a legal one — the reviewed *answer* doesn't change.

### 5.3 HIGH — the anti-repetition mechanic is the most repetitive thing in the run

```js
const d=new Date(), seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate();
const cb=PRX_CURVE[seed%PRX_CURVE.length];
deck.splice(1+(seed%(deck.length-1)),0,{…});
```
(:3763–3765)

Seeded on **date only**. A user who replays level 0 five times in an evening
gets the **same curveball at the same deck position** all five times. The
stated intent — everyone gets the same daily curveball so shares are comparable
— is good and worth keeping.

Fix: fold `prx.runs[prLevel]` into the seed. The **first** run of the day stays
globally comparable; replays rotate through the other nine. Same one-line
shape, keeps the sharing property, restores the mechanic's actual purpose.

### 5.4 HIGH — 45 authored variants nobody knows exist

`PRX_VAR` holds ~45 officer lines across 9 beats. A level-0 run shows 5.
**Nothing in the UI ever tells the user the officer's words change between
runs.** The replay motivation on the results screen is the score, the streak,
and the daily curveball — none of which signals variety.

This is a pure marketing-of-existing-content problem: the replayability is
already built and paid for, and it is invisible.

Cheapest fix that captures most of the value: **one sentence on the results
screen** — the officer's words are different every run. No new state, no new
storage, one i18n key per language.

If more is wanted later, `prx.runs[level]` already exists and could drive a
coverage line ("you've heard 14 of 45 lines"). That needs a new store and per-
variant tracking — do the sentence first, measure, and only then decide.

### 5.5 MEDIUM — level 2 is a two-beat spike behind a heavy warning

`ids:[3,7]` — exit order, then arrest. The user reads `prx_warn3` (*"…ends with
an arrest. It can feel heavy…"*), consents, and the level is over in two
decisions. It also gets no curveball (`prLevel<2`) and it is the level that
unlocks the two locked ones.

As pacing: the ramp is missing. Two beats is not enough runway for the arrest
to land as anything but abrupt, and the `🟩2` on its tab reads as *worse* than
level 0's `🟩5` despite being a perfect run (`parseInt("2/2")` at :4302 drops
the denominator — see 5.7).

Recommend: **3–4 beats.** The natural insertion between the exit order and the
arrest is a consent/search beat — `ci 2` already exists with a reviewed answer,
and `PRX_VAR[2]` has exactly one `hostile` variant (index 4), so the pool is
thin but non-empty. No new legal content required; reuse a reviewed beat. If a
second hostile variant for ci 2 is authored, the level also stops feeling
identical across replays.

### 5.6 MEDIUM — level 3 is not structurally distinct from level 1

Level 3 `ids:[0,8,1,2,3,7]` vs. level 1 `ids:[0,8,1,2,4,5]`. Four of six beats
are shared; the only differences are tone (all hostile) and the last two beats.
A user who has played levels 0–2 has already seen 5 of level 3's 6 beats.

Its distinct value is *sustained* hostility, which is real — but it is
currently sold as a separate scenario and plays as a re-skin. Two options, in
laziness order:

1. **Reframe it in copy** as an endurance run of the same stop rather than a
   new one — zero content cost.
2. Add one beat that only exists here.

Prefer (1) until there's evidence users feel misled. Also note this is the
level most damaged by 5.2 — fix the audio first; it may resolve the complaint
on its own.

### 5.7 LOW — score legibility across levels of different length

`🟩${parseInt(prx.best[i])}` (:4302) renders `"4/5"` as `🟩4` and `"2/2"` as
`🟩2`. Across a tab strip where levels are 2–6 beats long, a perfect short run
looks worse than a mediocre long one. Show the stored string as-is (it is
already `"n/total"`), or drop the number and show a ✓ for a perfect run.

### 5.8 LOW — dead locals in the hot render path

`const L=PRX_LEVELS[prLevel], deck=PRACTICE[lang];` (:4289) — neither is read
anywhere in `practiceRender`. Delete, or note as intentional. Relevant here
because it is the reason `PRX_LEVELS[6]` is not strictly required (§1.3).

---

## 6. Trauma-informed check — what a door needs that a traffic stop didn't

The app already does the hard parts: crisis-phrase interception on both input
paths (`PRX_CRISIS`, :3886), unscored disclosure (`prCurTier='x'`, :4113), no
analytics on disclosure (with the reasoning written out at :3905), exit-offered-
on-freeze instead of officer-repeats (:3821–3833), streaks that count days not
perfection (:4313), and per-level opt-in consent (:3770).

Seven things change when the scenario moves to the user's own front door.

### 6.1 The traffic stop is somewhere the user isn't. The door is where they are.

Every existing setter describes a place the user must imagine travelling to.
The door setter describes **the room they are sitting in while they read it**,
very possibly at night, very possibly alone. `prx_setter` — *"You're pulled
over at dusk"* — carries almost no load. The door's setter carries all of it.

Practical rule for the writer: the setter establishes *situation*, never
*threat*. It is scene-setting, not a cold open. Which leads directly to:

### 6.2 Do not use the source video's hook.

Video-4 opens with children asleep in bed (@00:00–00:08). That is a lead-
generation fear device engineered to hold attention on YouTube. Amparo's job is
the opposite: hold *composure*.

**No children in any setter. No family members. No "they're already inside."**
The user supplies their own household; the app must not populate it.

### 6.3 No knock sound. Ever.

The engine's audio design comment is explicit (:3810–3812): idle escalation
uses *"impatience through repetition, never noise or sirens."* The app has
deliberately never made a threatening sound.

**A knock is the door scenario's siren.** It is the exact sound that produces
the freeze response this audience carries. Render the knock as **text in the
setter**; keep `audio/*/d4*.mp3` to spoken officer lines only, same as every
other level.

### 6.4 Idle escalation needs door-specific copy — and it needs it precisely because it arms automatically.

`prxIdleArm` fires at `prLevel>=2`, so index 6 gets it with no code change.
The current behaviour is already good (12s of silence → an offer to replay *or*
to leave, at equal weight, nothing scored, nothing logged).

But the *copy* (`prx_idle_h`) is written for a car. At a door, freezing is not
a lapse — **not answering is a legitimate response to a knock**, and in some
readings the strongest one. The generic "want to hear that again?" framing
turns the module's own thesis into a failure state.

Recommend a door-specific `prx_idle_h`: silence is an available answer here,
and leaving the drill and closing the door are the same gesture. Also confirm
the removal of the officer re-speak still holds at index 6 — the current
implementation replaced it globally, so it does, but a door module that
re-spoke a hostile line at someone who froze would be the single worst thing
this app could do.

### 6.5 A second disclosure class the traffic stop never surfaced.

"We got a call about this address" is, in the real world, very often a domestic
violence call. A user typing their own words into beats 1–2 may disclose that
they are the person the call is about, or that they are afraid of someone
inside the house.

`PRX_CRISIS` is a suicidality list only. It will not catch this.

Recommend a second intercept list routing to a DV resource, reusing the exact
existing mechanism (`prCurTier='x'`, unscored, no analytics, resource line in
place of a coach line). **Flagged with the same rule as the legal content:
this list must be authored/reviewed by a domestic-violence clinician or
advocacy organisation, not by a model, and not by me.** Wrong phrasing in a DV
intercept fails a person the same way a wrong citation does.

Do this **before** shipping the door module, not after. The traffic stop never
put the user in a house with another person in it; this one does, at beat 1.

### 6.6 The `bc` coach line on beat 1 needs Hard Mode's register, not level 1's.

Every existing `bc` is written as correction — *"Asking before you comply can
read as confrontational,"* *"'Sure' gives up a protection you didn't have to
give up."* That register is right when the mistake is hypothetical.

Beat 1's mistake — opening the door to be polite — is a thing an enormous
number of users **have already done**, possibly with a consequence they are
still living with. Its `bc` is the most likely line in the entire app to be
read as *"this happened to you because you were stupid."*

Write it in the register `PRX_OPT[20].bc` uses for Hard Mode: *"His reaction is
not about what you did."* Name the cost without assigning the fault. This is
also the beat most likely to trip the crisis intercept, which is another reason
6.5 lands before ship, not after.

### 6.7 Being seen practicing matters more here.

The comment at :4457–4464 records that the quick-exit button was **removed**
rather than left as a panic button that didn't wipe state — correct call, and
the note specifies what a future one must do (null every field of `data`
including photos, `clearSave()`, *then* navigate).

The door module is the scenario where a user is most likely to be practicing in
a shared home, with the person the scenario concerns in the next room. Nothing
to build now — but if a quick-exit is ever reconsidered, this module is the
argument for it, and the constraints are already written down at :4459.

---

## Open items requiring a human before any of this ships

1. **Attorney review** of every `TODO_ATTORNEY` in §3. The `SOURCE_HINT`s are
   research leads pointing at unverified marketing videos — they are *where to
   start looking*, never a source to quote.
2. **Attorney ruling on beat 7.** Default is exclusion. Only a resolved split
   justifies including it, and only as `bothGood`.
3. **Attorney ruling on beat 3** (warrant verification). If impractical or
   unsafe to rehearse, cut to five beats.
4. **DV-clinician review** of the §6.5 intercept list. Blocks ship.
5. **Spanish authoring** of all seven beats plus `prx_lvl7` / `prx_warn7` — the
   engine is fully bilingual and a monolingual level is not shippable.
6. **Audio generation** for `d40`–`d45` in `audio/{en,es}/{m,f}/`, matching the
   existing authoring-time-TTS pipeline (:3800–3802). 6 beats × 2 langs × 2
   voices = 24 clips.
7. **Decide 5.1's fix shape** before adding door beats — otherwise the door
   ships with the same latent defect on any `PRX_DO`-style beat.
