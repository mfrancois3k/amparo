# Amparo — focus group 13: Level 2 spike fix — the beat that closed one gap opens a narrower one (v2.20.2)

Date: 2026-08-13. Run against `9d54368` (HEAD), tag `v2.20.2`. Subject: the
single-line root fix in `93d0b0c` — `PRX_LEVELS[2].ids` changed from `[3,7]`
to `[3,2,7]`, inserting the already-reviewed consent-to-search beat (`ci:2`)
between the exit order (`ci:3`) and the arrest (`ci:7`). This is root's first
edit of the whole `/app` migration (operator-approved, scoped to one line, per
wargames/16, 17, and 19 all independently flagging the same 2-beat spike).
`app-src/src/content/practice.json` was re-extracted in the same commit and
carries the identical `[3,2,7]` sequence — verified via `node -e`, not
assumed from the commit message.

**Method note.** Every claim below is read directly out of `index.html` or
`app-src/src/content/practice.json`, not taken on the commit message's word.
Verified this round: `index.html:4374` for the `ids` array itself;
`index.html:4441-4478` (`PRX_VAR`) dumped by tone for beats `2` and `7`;
`index.html:5226-5238` (`prxDiverge`) traced line-by-line against
`PRX_DIVERGE={1:{...},2:{g:'curt',b:'hostile'}}` (`:5226`); `index.html:5484`
(`prx.best[prLevel]` write) and `:5459-5460`/`:5451`/`:3478` (every read site
of that same stored string) to check what a returning player's pre-fix best
score does against a post-fix 3-beat run; `app-src/src/content/practice.json`
`node -e` dump confirming `PRX_VAR['2']` and `PRX_VAR['7']` both carry
`["calm","calm","curt","curt"]` in the `/app` content bank too, same as root.
Attorney/UPL review is excluded from findings below — known, already tracked,
not new. Findings already logged in FG06-FG12 are referenced only as carried
context; PRX_VAR[7]'s missing hostile variant is the operator's own explicit,
logged, open decision (not re-litigated as a new finding here).

---

## 0. What's actually new this round, verified against source

| System | File | What it is |
|---|---|---|
| Level 2 beat sequence | `index.html:4374`, `practice.json` | `PRX_LEVELS[2].ids` is now `[3,2,7]` in **both** root and `/app` — the 2-beat spike is closed, content reused (no new dialogue) |
| **New finding 1 — the divergence mechanic now silently no-ops twice, not once** | `index.html:5226-5238`, `PRX_VAR['2']`/`PRX_VAR['7']` | `PRX_DIVERGE[2]` wants a bad pick to escalate the *next* beat to `hostile`. Level 2 now has two beat transitions (3→2, 2→7) instead of one (3→7). Both `PRX_VAR['2']` and `PRX_VAR['7']` have zero `hostile` entries — confirmed identical `["calm","calm","curt","curt"]` for each, in root and `/app`. `prxDiverge()`'s own guard (`:5235`, `if(!pool.length) return`) means both transition points fail silently, with no signal anything was supposed to happen |
| **New finding 2 — a returning player's pre-fix best score can go stale and misleading** | `index.html:5484` vs `:5459-5460`, `:5451`, `:3478` | `prx.best[2]` is stored as the raw string `"sc/total"` (e.g. `"2/2"` from before the fix). The only guard on overwriting it is `sc>parseInt(prx.best[prLevel])` (`:5484`) — a bare numerator comparison that ignores the denominator. A player who scored a perfect `2/2` under the old 2-beat level, then scores `2/3` under the new 3-beat level (identical numerator, lower percentage), sees their stale `"2/2"` persist and keep displaying as their best on the level-select hub (`:3478`, `:5451`) — reading as an unbeaten, complete record when the level underneath it has changed shape |

**Confirmed correct, not a finding:** the reused content itself —
`PRX_VAR['2']`'s four calm/curt lines and `PRX_CITES[2]`'s "4th Amendment —
you may refuse consent to searches" cite — was already attorney-reviewed
material live elsewhere in the app before this fix; the commit message's
claim of "no new dialogue authored" checks out against source.
`PRX_UNSCORED` (`:4373`, level-index set `{3,5,6,7}`) does not include `2`,
so the new beat is correctly scored, matching the commit's "correct
score/debrief" claim. The `sr_practice_level_done` analytics event
(`:5491`) correctly logs the new `total:3` — the drift is confined to the
persisted UI-facing best-score string, not the analytics record.

---

## 1. Ten persona reactions

**Selection rationale.** Nia, Dana, Wes, Keisha, Omar, Rosa, Ana, Marcus,
Devin, Tony — the same ten FG12 used, kept deliberately: this fix lands on
exactly the lenses that panel already represents (trauma-sensitivity,
repeat-play completionism, code legibility, speed-scan urgency,
screen-reader parity, bilingual content, half-finished-allergy,
shareability, teen end-user narrative, institutional trust), and holding the
panel constant makes a single-line fix's real blast radius legible against
the same baseline. Luis, Marisol, Ray sit out for the same reason as prior
rounds — no surface here touches their standing complaints (payment-trail,
card-payment trail, firearm-declaration boundary).

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **This is the one round where a fix is unambiguously good for her, and
  it's worth saying plainly rather than immediately hunting for the catch.**
  The 2-beat spike — exit order straight to arrest, nothing between — was
  the single most abrupt escalation shape in the entire scored ladder. The
  inserted consent-to-search beat gives her a beat of agency (decline
  consent, calmly) between the two highest-tension moments in the level.
  Confirmed the reused content (`PRX_OPT[2]`, `index.html:4420`) is the same
  calm-register script credited across FG07-FG12, not new or harsher
  material.
- **The divergence no-op (new finding 1) is a real miss but reads to her as
  lower-stakes than it sounds.** A silent non-escalation means the officer's
  tone *doesn't* worsen when the mechanic intends it to — for her
  specifically, a bug that fails toward *less* hostility rather than more is
  the safer direction for a bug to fail in, even though it's still an
  unintended gap.
- **Redo? Still no for hostile content. Refer? Conditional yes, more
  confidently this round** — the spike fix directly answers a shape of
  escalation her standing concern has flagged since the panel first reacted
  to this level.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **New finding 2 lands squarely on her, by name, for the first time in this
  loop.** Her five-round pattern is reprinting and re-running drills with
  her son to check progress. If she or her son cleared level 2 before this
  fix shipped, their `prx.best[2]` is a stale `"2/2"` today — and the hub
  (`index.html:3478`) will keep showing it as their record even after they
  replay the now-3-beat level and score `2/3`, because `2` isn't greater
  than the stale `2`. For a completionist tracking exact numbers across
  repeat drills, a best score that silently stops updating on a genuine
  improvement is the kind of thing she'd notice and distrust.
- **The fix itself, read as content, is exactly what she'd want.** A 3-beat
  "ordered out" level that includes the consent question is closer to what
  she'd actually rehearse with her son than the 2-beat version.
- **Redo? Yes. Refer? Yes** — unchanged verdict, but new finding 2 is a
  concrete "would ask about this" item the next time she replays this
  specific level.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He'd catch the divergence no-op from the code alone, the same way he's
  caught every prior structural gap.** Reading `PRX_DIVERGE[2]` against
  `PRX_VAR['2']`'s tone list is a two-file check — no need to play the level
  or trigger the exact bad-pick path. The pattern is one he's now seen
  three times across this loop (FG10's root-read bridge, FG11's `PRX_VAR[7]`
  finding, this round's `PRX_VAR[2]`): a mechanic that's live and reachable,
  gated on content that doesn't exist for it.
- **The best-score staleness is the sharper find for his profile, because
  it's a genuine logic bug, not a missing-content gap.** `sc>parseInt(...)`
  discarding the denominator is a one-line read that would jump out at him
  immediately — the kind of bug that's invisible from playing the app once
  but obvious from the diff.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **The level is one beat longer now, which cuts slightly against her
  between-fares math, but not in a way she'd object to.** Going from 2 to 3
  beats adds roughly 30-50% more time to clear the level — for a persona
  whose described use case is "useful in her hand inside 30 seconds," more
  content in the one level that used to be the shortest is a real if minor
  cost. She'd still say yes; the content itself (consent to search) is
  exactly the kind of high-value, high-frequency scenario her real-world
  stops involve.
- **New finding 2 doesn't touch her specifically** — she's described as a
  first-pass, glance-and-tap user, not a repeat-drill completionist; the
  stale best-score bug is Dana's finding, not hers.
- **Redo? Yes — the list itself still works for her.** Unchanged.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The new beat inherits the same accessibility shape as the rest of the
  scored ladder — checked, not assumed.** `PRX_OPT[2]`'s options render
  through the same button/coach-line structure as every other beat in the
  deck; nothing in the fix touches the demeanor meter, the officer-audio
  path, or any live region. A single-line `ids` array change is, correctly,
  invisible to his screen-reader pass.
- **The stale best-score string is a smaller but real a11y-adjacent gap for
  him too.** The hub's status text (`index.html:3478`) reads the stored
  `"2/2"` string as plain content — a screen reader announces a stale
  "complete" record with no indication the underlying level changed shape,
  same misleading signal Dana would notice visually, but with no way for
  him to cross-check it against the level's actual current length the way a
  sighted user glancing at the card count might.
- **Would he want both fixed? The best-score staleness is the more concrete
  ask; the divergence no-op has no accessible signal either way, since
  nothing currently announces tone escalation to begin with.**

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **The reused content is correctly, fully bilingual — worth confirming
  directly rather than trusting the commit message.** `PRX_OPT[2].g.es`
  ("«No doy consentimiento para ningún registro, oficial.»") and
  `PRX_CITES.es[2]` ("Por qué puedes: 4ª Enmienda...") are the same Spanish
  already live elsewhere in the app (the consent-decline beat exists
  independently at level index 1). No new translation was needed and none
  was introduced with a gap.
- **The stale best-score string applies identically in Spanish** — there's
  no language-specific angle, since `"2/2"` is numeric, not translated
  text.
- **Redo? Yes.** Unchanged verdict; a clean pass for the highest-stakes
  content type in this product.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **This fix is the cleanest example yet of the pattern that's kept her
  allergy quiet for eight rounds — the cut that's still open is logged at
  the exact point it was made.** The commit message (`93d0b0c`) states
  plainly: "`PRX_VAR[7]`'s missing hostile variant... was NOT fixed... needs
  genuinely new officer dialogue, which this project never authors.
  Operator chose to leave it open, logged." That's the acknowledged-cut
  pattern she's credited repeatedly (`Welcome.tsx:32-36`,
  `PrintStep.tsx:1-11` being the one exception FG12 flagged).
- **But new finding 1 — that the same gap now also blocks the 3→2
  transition, not just 2→7 — isn't mentioned anywhere in the commit or a
  code comment.** The operator's log covers "PRX_VAR[7] is still missing a
  hostile variant" as a known, standing fact. It does not cover "and the
  level-2 fix just shipped now depends on that same missing content at a
  second point in the same level's flow." That's a materially different,
  narrower claim than what's logged, and her allergy is tuned to exactly
  this distinction.
- **Redo? Yes for what's built. Refer? Leaning conditional** — unchanged
  shape, but this round is the sharpest example yet of "the acknowledged
  cut and the actual scope of the cut aren't quite the same sentence."

### 🧑 Marcus, 19 — NY, broke college student, shares things that look sharp

- **The share grid is one square longer now, and that's a small net
  positive for him.** `index.html:5409-5410`'s share text renders one
  emoji per `prRun` entry — level 2 goes from a 2-square grid to a
  3-square grid. A slightly longer, more populated grid reads as more
  substantial in a screenshot; not a finding he'd raise unprompted, but a
  minor plus if asked.
- **Neither new finding touches him** — he doesn't replay levels for a
  best-score record, and the divergence mechanic's tone shift isn't visible
  in the share text at all (only the good/miss grid is).
- **Redo? Yes. Refer? Conditional on shareability** — unchanged.

### 🧑 Devin, 16 — TX, Dana's son, actual end user rather than buyer

- **The 3-beat structure reads better as a game to clear than the 2-beat
  spike did.** His described pattern treats practice as something to beat,
  not study. "Exit order → immediate arrest" telegraphed its own outcome
  with no room to make a choice that mattered; "exit order → consent
  question → arrest" gives him one real decision point in the middle where
  his pick can visibly matter (even though, per new finding 1, it currently
  doesn't visibly escalate the tone either way).
- **If he replays a level he already scored before the fix, new finding 2
  might read to him as the game not tracking his improvement** — a
  16-year-old re-clearing a level for a better score and having the record
  not move is the kind of thing that reads as "broken," not "the level
  changed," since he has no visibility into what changed under the hood.
- **Redo? Yes, more so than before** — the extra beat gives the game loop
  one more real decision point, which is a net win for how he'd actually
  engage with it.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **Neither finding moves his standing condition.** The beta banner
  (unchanged) is still the credibility hurdle his verdict has hinged on for
  eight rounds; a beat-sequence fix and a stale-score display bug don't
  touch the institutional-backing gap he's named every round.
- **The consent-to-search beat itself is exactly the kind of concrete
  moment he'd walk a grandkid through in person** — "don't consent, say it
  calmly, they might search anyway" is precisely his own register. Worth
  noting even though it doesn't move his verdict: the fix strengthens the
  one thing he already credits this app for (measured, non-alarmist
  content), it just doesn't address the one thing he's asking for.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Decide whether the level-2 divergence mechanic's double no-op needs its own fix, or gets folded into the existing open PRX_VAR[7] decision

**Evidence.** `PRX_DIVERGE={1:{...},2:{g:'curt',b:'hostile'}}`
(`index.html:5226`) wants a bad pick anywhere in level 2 to escalate the
*next* beat's tone toward hostile. Level 2's new 3-beat sequence
(`[3,2,7]`) has two such transitions (beat 3→beat 2, beat 2→beat 7).
`node -e` confirms both `PRX_VAR['2']` and `PRX_VAR['7']` carry
`["calm","calm","curt","curt"]` — zero hostile entries in either, in root
**and** in `app-src/src/content/practice.json`. `prxDiverge()`'s own guard
(`index.html:5235`, `if(!pool.length) return`) means both transition
points fail identically and silently — no error, no fallback, nothing
signals a divergence was supposed to happen. This is not a new content gap
(the operator's own commit message already logs `PRX_VAR[7]` as open); it
is a new fact about the *scope* of that gap — before this fix, level 2 had
one transition and one silent no-op; it now has two. Impact: **the fix that
closed the panel's highest-ranked structural complaint (the 2-beat spike)
simultaneously widened, by exactly one instance, the panel's other standing
open item — worth an explicit operator decision on whether that widening
is itself notable enough to log separately, even while the underlying
content-authoring decision (write hostile dialogue) stays deliberately
deferred.**

### 2. Fix the best-score staleness before a returning player hits it

**Evidence.** `index.html:5484`: `if(!PRX_UNSCORED.has(prLevel) &&
(!prx.best[prLevel]||sc>parseInt(prx.best[prLevel]))) prx.best[prLevel]=
sc+'/'+prRun.length;` — the update guard compares raw numerator only.
`index.html:3478` and `:5451` both render the stored string verbatim on the
level-select hub. A player with a pre-fix `prx.best[2]` of `"2/2"` (a
perfect score under the old 2-beat level) who replays the new 3-beat level
and scores `2/3` (identical numerator, lower ratio) will not have their
best score updated — display stays `"2/2"`, silently misrepresenting a
level that no longer has 2 beats. Impact: **hits Dana's five-round
completionist pattern directly and by name — the panel's most consistent
"reviews exact numbers across repeat drills" persona. A one-line fix (parse
and compare a percentage, or version-stamp the stored best when `ids`
changes) closes it; left alone, it's a data-integrity bug that will surface
the first time any returning player re-clears this specific level.**

### 3. Log the double-no-op scope change at the point it was introduced, matching this migration's own established pattern

**Evidence.** `93d0b0c`'s commit message explicitly names `PRX_VAR[7]`'s
missing hostile variant as the one open finding left unfixed, and states
the operator's reasoning for leaving it open. It does not mention that the
fix itself introduces a second silent-no-op point (`PRX_VAR[2]`) that
didn't previously exist, because the level only had one transition before.
This is the same class of gap FG12 flagged for `PrintStep.tsx` — a real cut
that's logged, sitting next to a real scope change that isn't. Impact:
**cheap to fix (one sentence in the commit message or a code comment at
`PRX_DIVERGE`'s definition) and directly protects the pattern Ana's allergy
has kept quiet for eight rounds — every other cut in this migration
announces itself at the point it's made; this is the first time a *fix*
quietly expanded an already-logged gap's scope without saying so.**

### 4. Confirm the fix's effect on level 2's Hard-Mode unlock gate, if any

**Evidence.** `index.html:4492-4498`'s comment block for Hard Mode (level
index 3) references "the swan/unwinnable ending" and sits immediately after
the levels array in source, but the unlock gate itself (`isLocked()`,
referenced but not re-read in full this round) was not re-verified against
the new 3-beat level 2 as part of this fix's own regression check per the
commit message ("pinning the exact `[3,2,7]` ci sequence" — a content
check, not necessarily an unlock-gate check). Impact: **lower-magnitude
than items 1-3 because nothing found this round suggests the gate is
actually broken — this is a verification gap, not a confirmed defect. Worth
a five-minute check that "level 2 completed" still triggers whatever
downstream unlock it always did, now that completion means 3 beats instead
of 2.**

### 5. Decide whether the share-grid length change (2 squares → 3) needs any copy adjustment

**Evidence.** `index.html:5409-5410`'s share text template renders one
emoji per `prRun` entry with no level-specific wording — the grid simply
grows by one square for level 2 along with everyone else's runs. Nothing
in the template assumes a fixed length, so nothing is broken. Impact: **the
lowest-magnitude item on this list — included because it's the one
consequence of the fix with zero downside found, worth naming explicitly
as "checked, confirmed fine" rather than leaving it as an unstated
assumption, the same discipline FG11 applied to `isLocked()`'s gate math.**

---

## 3. What must change in the practice MODULES specifically

**Scoped to the level-2 beat sequence, its divergence mechanic, and its
score-persistence path** — not the wizard, not the print pack, not the
practice hub UI (the `/app` hub rebuild remains FG12's open golden #1,
untouched by this fix).

- **Decide on and, if warranted, log the level-2 divergence mechanic's
  widened scope** (golden #1) — `PRX_VAR[2]` now silently no-ops the same
  way `PRX_VAR[7]` already does, and the operator's existing "left open,
  logged" decision for `PRX_VAR[7]` doesn't currently cover this second
  instance.
- **Fix the best-score persistence bug** (golden #2) — either compare by
  percentage instead of raw numerator, or version-stamp `prx.best` entries
  so a content-shape change (new `ids` length) invalidates a stale record
  instead of silently outliving it.
- **Add one sentence to the fix's own log (commit message or a code
  comment near `PRX_DIVERGE`) naming the scope change** (golden #3) —
  cheapest item on the list, protects the acknowledged-cut pattern this
  migration has otherwise held to for eight rounds.
- **Re-verify the Hard Mode unlock gate against the new 3-beat level 2**
  (golden #4) — not confirmed broken, but not confirmed clean either; the
  regression check added in `93d0b0c` pins the content sequence, not
  necessarily the downstream unlock condition.
- **Carry-forward, unchanged, operator's own explicit decision (not a new
  finding):** `PRX_VAR[7]`'s missing hostile variant stays open by
  deliberate choice — needs new officer dialogue, which this project never
  authors.
- **Carry-forward, unchanged since FG12 (not re-verified this round, out of
  this round's scope which was the root-only fix):** the `/app` 3-tab
  practice hub rebuild (FG12 golden #1), the missing print confirmation
  (FG12 golden #2), and the `hub_progress` glanceable status region (FG12
  golden #5) — none of these surfaces were touched by `93d0b0c` and none
  were re-checked this round.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06-FG12

**BS-1. Now that root has taken its first edit of the whole migration, does
the "root is untouched, `/app` is the strangler target" policy (wargames/15
§0 rule 1) need an amendment describing when a root edit is warranted — or
was this treated as a one-off exception without a documented rule change?**
The commit message says the operator was asked explicitly before this edit,
which is good process for the single instance, but nothing in the material
reviewed states whether the *next* similarly narrow, high-value root fix
gets the same treatment automatically, needs the same explicit ask every
time, or whether "untouched" as a stated rule is now effectively "untouched
except by explicit one-line exception" without that having been written
down anywhere the rule itself lives.

**BS-2. Was the regression check added in `93d0b0c` ("pinning the exact
`[3,2,7]` ci sequence") run against a fresh `localStorage` state only, or
was it also run against a simulated returning-user state with a pre-fix
`prx.best[2]` value already set?** New finding 2 (stale best-score) would
only surface in the second scenario — a fresh-state check, which is the
more common thing to test, would pass cleanly while the actual bug sits
undetected in the returning-user path, which is presumably the more common
real-world path for a level a beta tester already cleared before this
release.

**BS-3. `PRX_DIVERGE` is keyed by level index, and this fix changed what
"level 2" *means* in terms of beat count and transition count — is there
any other code path in the practice engine that assumes a level's beat
count from before this fix (a hardcoded "2 beats" somewhere in analytics,
a QA script, a content-authoring tool) that wasn't part of this specific
regression check and wouldn't be caught by a check scoped to the `ids`
array alone?** Nobody has grepped beyond the divergence mechanic and the
best-score path this round; the level-index-keyed structure used
throughout this codebase (`PRX_DIVERGE`, `PRX_UNSCORED`, `isLocked()`) means
any of those other consumers could carry the same latent, level-shape
assumption this round happened to catch in exactly two places.

**BS-4. The commit message states this fix was "live-verified in both
languages: 3 beats, correct tone pool, correct score/debrief" — does
"correct score/debrief" in that verification cover a *first-time* player's
run only, or was a returning player's stale-best scenario (new finding 2)
part of what "correct" was checked against?** The phrasing is consistent
with either reading; worth confirming explicitly which scenario the
live-verification pass actually covered, since the two scenarios produce
different, easily-conflated results (a first-time player's fresh `2/3` is
correct and unremarkable; a returning player's stale `2/2` next to it is
the actual bug).

**BS-5. Three independent reviews (wargames/16, 17, 19) all converged on
the 2-beat spike as a finding before this fix shipped — did any of those
three reviews also flag the divergence mechanic's dependency on
`PRX_VAR[2]`/`PRX_VAR[7]` as a *combined* risk (i.e., "fixing the spike by
inserting beat 2 will double the mechanic's blind spot"), or did all three
reviews evaluate the spike and the missing-hostile-variant gap as
independent findings, meaning nobody was positioned to see the
interaction effect between fixing one and widening the other until this
round read both pieces of code side by side?** This matters for process,
not just this instance: if independent reviews structurally can't see
interaction effects between two findings they each treat as separate, that
is a gap in the review methodology itself, not just in this one fix.

---

## 5. Group read

**Would-evaluate-favorably verdict: 7 yes/conditional-yes (Nia, Dana, Wes,
Rosa, Ana, Marcus, Devin) / 2 neutral, standing conditions unchanged (Tony,
Keisha — her reaction is a genuine minor cost, not a complaint) / 1
conditional with a real new but lower-stakes note (Omar).** This is the
first round in the loop where the subject is a single-line content fix
rather than a new UI surface, and the panel's reaction reflects that: no
verdict moved on its own merits, but the fix directly and positively
answers Nia's and Devin's standing structural complaints about this exact
level, while surfacing two genuinely new, narrowly-scoped bugs (the
divergence no-op's widened footprint, the stale best-score string) that
none of the three reviews which prompted the fix were positioned to catch,
since both require reading the fix's effect against adjacent code rather
than the beat sequence in isolation.

**Biggest objection by theme.** Both new findings share a shape distinct
from every prior round's pattern: this isn't "built but not wired" (FG10)
or "ported from the wrong source" (FG12) — it's a correct, narrowly-scoped
fix whose side effects touch code that wasn't part of the fix itself
(`prxDiverge()`, `prx.best`'s persistence). A one-line data change had a
wider blast radius than the line itself, because two other systems key off
the same level index and beat sequence without either being part of what
the fix's own regression check covers.

**Highest-leverage fix, this round's subject specifically.** Golden
standard item 2 — the stale best-score bug. It is the one item on this
list that is a confirmed defect (not an open decision or a verification
gap), it is cheap to fix, and it hits the panel's most consistent
repeat-player persona (Dana) by name by an exact evidenced mechanism.

**Highest-leverage fix, across the whole product regardless of surface.**
Unchanged in substance from FG12: the `/app` 3-tab practice hub rebuild
remains the single most significant deferred item across both this loop's
architecture (React strangler migration) and its content (root's now-fixed
Level 2 spike doesn't change what `/app`'s `PracticeLevelSelect.tsx` still
ports the wrong screen). This round's subject was root-only and doesn't
move that verdict.

**Who this still isn't for.** Tony (no institutional backing, unchanged
across nine rounds) — the fix strengthens content he already credits the
app for without touching the one thing his verdict actually hinges on.

---

## 6. Signature

Generated by Amparo Focus Group 13 (Level 2 practice spike fix review,
ten-persona panel).
**Panel:** Nia, Dana, Wes, Keisha, Omar, Rosa, Ana, Marcus, Devin, Tony.
**Scope:** root `index.html`'s first-ever edit of this migration (`93d0b0c`,
v2.20.2) — `PRX_LEVELS[2].ids` changed from `[3,7]` to `[3,2,7]`, and its
verified downstream effects on the divergence mechanic (`prxDiverge()`) and
best-score persistence (`prx.best`). `app-src/src/content/practice.json`
checked for parity, confirmed synced. The already-open `PRX_VAR[7]` decision
and the FG12 `/app` findings (wrong hub screen, silent print confirmation)
are carried forward, not re-litigated.
**Verdict date:** 2026-08-13.

All findings tied to live source in `index.html` or
`app-src/src/content/practice.json`, or to direct `node -e` dumps of the
extracted content banks. No speculation beyond what a real future move (the
best-score fix, the divergence-scope decision, the unlock-gate check) would
need to resolve — those are named explicitly as open decisions, not treated
as defects beyond what's confirmed.
