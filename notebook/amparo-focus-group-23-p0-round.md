# Amparo focus group 23 — the round that fixed the sentences and kept the seams (v2.23.1 → v2.24.0)

**Agent A of the `/amparo-loop`, run standalone.**
Build under test: HEAD `bfa9ba9` (docs commit for tag **v2.24.0**; `git describe` = `v2.24.0-1-gbfa9ba9`).
Round commits: `8746ab9` (v2.23.2 — blindspot audit: false claims, storage crash, self-XSS) and
`c17e5f7` (v2.24.0 — the P0 round: matcher, supervision, door hold, honest checkout, swan gating,
state-law lines pulled, Voicebox-only audio). Verified by direct grep/read of `arena/index.html`
(1,561 lines at HEAD), `index.html`, `app-src/src/screens/practice/PracticeHub.tsx`,
`app-src/src/content/t.en.json`, plus `git log`/`git show --stat`, `CHANGELOG.md`, and
`wargames/29-practice-arena-vs-modules.md`. No live browser session (source-only, consistent with
FG19–22 precedent). **Primary job this round:** verify each FG22 golden actually closed in source,
then find what's new.

**Excluded by instruction:** generic attorney-review findings. UPL-adjacent risks newly present in
source are in scope (golden #4, BS-2).

---

## 0. FG22 golden-by-golden closure audit — grep-verified, not assumed

| FG22 golden | Status | Source evidence |
|---|---|---|
| #1 Supervision banner-not-coaching | **PARTIAL** | Persistent amber `#supBanner` (`:490`), toggled/populated every render (`:1153-1154`) — real, always on screen during practice. Modal copy now honest: "You'll see a standing supervision warning while you practice" (`supB`, `:677`) — the "We will adjust the coaching" promise is gone. Print card still appends `supOn` (`:1518`). **Surviving:** the Yes button still reads "Yes — use supervision-safe coaching" (`supYes`, `:563,:677`) — "coaching" names a thing that is still a banner; scoring is unchanged — every consent-refusal line still `g:1`, still +1, still "Good choice"; and the completion modal's "KEY PHRASES TO MASTER … Say each one out loud twice" (`:1334-1335`) lists the refusal lines with no supervision caveat, in a modal that overlays the banner. See golden #3. |
| #2 Fabricating checkout | **CLOSED** | Email input removed from the pay modal markup entirely (`:654-663` — no input element; `payPriv`: "no email required, nothing uploaded"). Button renders "Preview checkout — $X" (`:1416`). Success screen: `payOkT` "Preview complete — no charge was made.", `payOkSub` "Payments aren't live yet — this checkout is a preview.", `payDl` "🖨 Print the free pack" (`:679`, es `:684`). The static-HTML "Purchase confirmed!" at `:666` is an inert default overwritten by the `data-i18n` pass (`:1085`) before any modal can open. Residue: dead `payEmail` string in both banks (`:679,:684`) — never rendered. |
| #3 Keyword matcher | **PARTIAL** | Global `KEY` list deleted (only a comment naming it remains, `:1386`). `submitFree` now matches against **this beat's own** correct line: >3-char words, majority overlap (`:1391-1393`), same shape as root's `prxCompareShow`. Crisis net ported: `PRX_CRISIS` (`:686-693`) checked first (`:1377-1382`), renders the 988 string instead of a grade. The v2.23.1 QA case (silent+lawyer praised on the documents turn) is fixed — zero overlap → honest `fallback` + strongest line. **Surviving:** the negation case — see golden #1. |
| #4 Wipe overpromise + false fonts claim | **CLOSED** (v2.23.2) | `p2`: "Fonts are bundled with this page (self-hosted)" (`:677`, es `:682`). `wipeQ`/`p4` scoped to "Practice Arena data … the pack builder at amparohq.com keeps its own separate save" (`:677`). Copy was scoped to match the two-key wipe rather than the wipe widened — the honest direction FG22 offered as acceptable. |
| #5 Unverified state-law "you must" lines | **CLOSED** | Both render lines commented out with the reason inline (`:1156-1162`); `DUTY_INFORM`/`STOP_ID` preserved as never-rendered data under `TODO_ATTORNEY` (`:1070-1073`). Grep confirms no other render path touches either list. |

Also verified from the round's own claims: door-knock hold is mechanically complete —
`HELD_SITS={door:1}` (`:1071`), 🔒 icon + `heldB` copy + click-blocked (`:1102-1106`), saved states
redirected (`:1363`), auto-advance skips held (`:1359`). Officer audio is Voicebox files only —
the single remaining `speechSynthesis` mention is the comment saying it was removed (`:1209`);
`speakOfficer` plays `audio/<hash>.mp3`, `onerror` nulls the handle silently (`:1218-1226`).
v2.23.2's `escT` escaper exists (`:1145`); `saveA` fails soft per its changelog claim.

---

## 1. Ten persona reactions

Same panel as FG22, deliberately: this round exists to verify FG22's findings, so the people who
made them get to check the receipts. Devin (matcher), Nia (crisis/swan/door), Dana (checkout),
Tony (attorney upsell), Luis (privacy), Rosa (voice provenance, ES), Marcus (share/readiness),
Omar (a11y, silent beat), Keisha (first-run stack), Wes (door content, seams).

### 🧑 Dana, 52 — TX, gave the round's first hard no on the fake receipt

She re-runs her FG22 trace end to end. The email field she typed into is *gone from the markup*,
not hidden. The button says what it does ("Preview checkout — $3.99"), the confirmation says what
happened ("Preview complete — no charge was made"), and the download button stopped calling the
free card a purchased PDF ("Print the free pack"). "That's the whole list I gave you. You didn't
dress the demo up — you took the costume off." One eyebrow left: the completion modal still
advertises "Digital Legal Vault Pass — $19" and a vetted attorney line (see Tony) — the checkout
got honest; the shop window above it didn't.

Redo? **Yes — her no reverses.** First reversal on the panel since FG16. Refer? "When the $19 card
and the attorney line meet the same standard the checkout just did."

### 🧑 Devin, 16 — TX, the user who'd screenshot the matcher

His FG22 party trick — type something flippant with "search" in it, collect praise — is dead on
most turns: the global keyword list is gone and off-turn junk now gets the honest "Solid instinct.
The strongest version is:" fallback. But he finds the new version of the trick in one try, because
it's the obvious one: on the "I do not consent to a search" turn, he types **"yes officer go ahead
and search, I consent"** — the good line's only >3-char words are *consent* and *search*, majority
threshold is 1, both hit → full point, "Protects you in court even if they search anyway."
"You fixed it everywhere except the one turn where it's funniest." He'd also notice there are no
per-word hit chips (root has them), so the matcher is still a black box to the user.

Redo? Yes — the arena is still his surface. But golden #1 is his screenshot, again.

### 🧑 Nia, 41 — NY, PTSD, wants the information without the simulation

Three things she asked for arrived in some form, and she checks each. The crisis net: real — typed
or spoken crisis language now gets the 988 line instead of a score (`:1377`), and the crisis footer
renders permanently (`:1512-1513`). The swan gate: the `hardQ` consent text is exactly the register
she wanted ("There is no winning line here; the goal is staying safe"). Then she traces entry paths
and finds the gate only guards the level-tab click (`:1136`): finish level 3 of a scenario, tap
"Practice another →", and `nextUnfinished()` (`:1364-1368`) can drop her into Hard mode with no
question asked. And the instrument is a native `confirm()` — one Enter key blows through it, and
one yes covers every swan level all session (`window.__swanOK`). "You built the right sentence and
put it behind the wrong door, on one of three doors." The freeze-timeout still auto-scores
"(froze — said nothing)" at −1 by default (`:1196`) — her FG22 objection, untouched.

Redo? Conditional, unchanged — but this is the closest round yet: the crisis net is the first
thing shipped that treats distress as a signal instead of a score.

### 🧑 Tony, 61 — GA, checks whether it does what it says

He re-reads the completion modal. The checkout under it got honest; the upsell list above it did
not: "Talk to a local traffic attorney — **vetted**, state-specific — free case review, no
obligation" (`mW2a/mW2b`, `:679`) is still a static div with no id, no handler, no network, no
vetting behind it. "You ran a round called 'tells the truth' and the one sentence I named — the
attorney who doesn't exist — is the sentence you skipped." He'd also read the new `heldB` card:
"the door-knock coaching **is with** the attorney and DV-clinician reviewers." Present tense, named
reviewers. "If that's true, it's the best sentence in the product. If those reviewers don't have it
in hand today, you just wrote a new one of the old kind."

Redo? No — but for the first time his objection list got shorter instead of longer. The gap
between him and yes is now two sentences, both nameable.

### 🧑 Luis, 27 — TX, DACA, reads every privacy claim literally

His FG22 findings were the round's worst; he re-checks both. Fonts: `p2` now says self-hosted —
true, matches the zero-external-URL grep. Wipe: the copy was scoped down to what the handler
actually deletes, and now explicitly tells him the pack builder "keeps its own separate save" —
"the first time the product told me a limit instead of me finding it." He'd have preferred the wipe
widened to cover `sr_docs` (his document photos), but a true sentence about a narrow wipe beats a
false sentence about a total one, and the pointer to the other surface is the part he needed. New
literal read: the footer `fine` string still says "Voice uses your browser's speech engine"
(`:676`) — with the fallback deleted, that sentence is now *only* true of the mic and flatly false
for every officer line he hears. See golden #5.

Redo? **Conditional-yes — up from no.** Both of his named falsehoods are fixed; the remaining one
is Rosa's.

### 🧑 Rosa, 44 — GA, Spanish-first, "whose voice is that?"

The ES side of every P0 fix shipped in parallel — she checks `supB`/`heldB`/`payOkT`/crisis in the
ES bank (`:682-684`) and they're written Spanish, not echoes. Her FG22 question is now sharper,
not answered: the officer's voice is a cloned real person ("Miles" — still named nowhere in the
product, grep confirmed), and the only sentence about voice provenance describes a speech engine
the P0 round itself deleted. "You removed the robot and kept the sentence about the robot." For
the persona whose trust runs through *what the product says about itself*, this is now the last
false self-description left in the arena.

Redo? Conditional — one string away, and she can name the string.

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

Nothing he liked broke: share card still canvas-only on device, family challenge intact, free tier
untouched, readiness formula unchanged (`readyPct` `:1437` — drills×70% + streak, streak capped at
6 days). The checkout now says "Preview" before he taps instead of an 11px footnote after — "the
version of honest that doesn't need good eyesight." His exploit note from FG22 shrinks: streak
still farms readiness, but the matcher no longer hands out keyword points, so the number is harder
to fake. "It's a slightly more honest brag now."

Redo? Yes, unconditional — unchanged, and the round removed his one embarrassment risk (the
matcher screenshot going around his group chat).

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

Nothing in the P0 round touched his findings: the steadiness needle is still a visual-timing test
scored as composure, gentle mode is still labeled as the no-pressure option rather than the
accessible one, and the control soup still has no landmarks. New for him: officer audio is now
files-only with a silent `onerror` (`:1224`) — a missing file, a blocked autoplay, or a muted
device are all indistinguishable from "there was no audio," and nothing on screen says a line was
supposed to be spoken. For a screen-reader user who *relies* on the audio channel, silence is now
a failure mode with no signal. Text is always on screen — the drill survives — but the product
can no longer tell him when its primary channel failed.

Redo? No for the arena, unchanged. "The main app learned my lesson two months ago. Third round of
the new page not inheriting it."

### 🧑 Keisha, 34 — Atlanta, rideshare, 30 seconds between fares

Her stopwatch trace is byte-identical to FG22: intro (`:1487`) → 3-panel tutorial (`:1488`) →
supervision question (`:1152`) → safety checklist (`:1151`) → first line. Five gates, none
collapsed, none batched — FG22 BS-4 asked whether anyone had summed them; the P0 list didn't
include it. The one first-run change is that the supervision gate got *more* prominent (a
persistent banner if she answers yes). Return-visit surfaces (resume, daily drill) still excellent,
still locked behind the slowest first run in the product.

Redo? Conditional, verbatim from FG22. "You fixed six things and the stopwatch number is the same."

### 🧑 Wes, 38 — Brooklyn, does not drive, enters sideways

The content that made the arena his — the door-knock situation — is now a 🔒 he can't open. He
checks the hold the way he checks everything: the lock is real on all three paths (click `:1106`,
saved state `:1363`, auto-advance `:1359`), and the reason is printed in full sentences instead of
silently greying out. "Locking my content honestly beats shipping it half-checked — FG02 me can
wait." His FG22 seam report is still open, though: `'hard'` is still a dead entry in the
safety-gate list (`:1151` — situation ids are traffic/door/pass/trap/last30/step; `'hard'` is a
*level* id, `:1031`), and `'last30'` — a traffic stop — is still excluded from the safety card.
Modules item #6, not in the P0 six.

Redo? Yes — held is a state he respects. He'd ask to be told when the lock opens.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The rebuilt matcher still scores "yes officer, go ahead and search, I consent" as a full-credit good choice — on exactly the consent-refusal turns the product exists to train

**Evidence.** `submitFree` (`:1383-1396`): good-line words are filtered to >3 chars
(`filter(w=>w.length>3)` — so *not*, *do*, *no* never survive), and a hit needs
`ceil(gw.length/2)` matches. For the canonical refusal turns the good line is short: "I do not
consent to a search." (`:708`, also `:817,:837,:852`) reduces to `gw=['consent','search']`,
threshold 1. Typing the FG22 poison sentence — "yes officer, go ahead and search, I consent" —
matches both words → `answer(…,1,goodC.f[L],1)`: full point, "Good choice," and the turn's
righteous feedback ("Protects you in court even if they search anyway"). The CHANGELOG's own claim
("the old list scored 'yes go ahead and search, I consent' as correct **on any turn**. Now each
answer is matched against that beat's own correct line") is true and insufficient: the cross-turn
form died; the same sentence still scores on the beats where consenting is the exact failure being
trained against. Negation never enters the algorithm — the three words that flip the meaning
(*yes*, *not*, *go ahead*) are either filtered by length or invisible to bag-of-words overlap.

**Impact.** Highest of the round: it's the surviving core of FG22 golden #3, on the
safety-critical turns rather than the comic ones, and it now hides behind a fix the CHANGELOG
describes as closing this exact sentence. Root's matcher (`index.html:5390`) has the same
bag-of-words shape — this is a both-trainers defect — but root shows per-word hit chips, so its
user can at least see *why* they passed; the arena shows nothing.

**Cheapest fix that holds:** a negation guard before the overlap check — if the good line contains
"not/no" + a keyword and the answer contains that keyword without the negator (or contains
yes/sí/go ahead/okay + the keyword), route to the `fallback` path instead of the hit. One regex
family, no content changes, fixes both trainers if applied to the shared shape. Rendering root's
hit chips in the arena is the same change FG22 already specced.

### 2. The swan consent gate guards one of three doors — auto-advance and scenario-card clicks drop users into "the stop has already gone wrong" with no consent, and one browser confirm covers every swan level all session

**Evidence.** `isSwanLvl` (`:1126`) marks level 4 everywhere plus step-out 3–4. The consent
confirm exists *only* in the level-tab click handler (`:1136`,
`if(isSwanLvl(s.id,i)&&!window.__swanOK){if(!confirm(T('hardQ')))return;…}`). Two other paths set
`A.lvl` to a swan level with no gate: the situation-card click (`:1106` — lands on the first
unfinished level, which is 3 once 0–2 are done) and "Practice another scenario →" →
`nextUnfinished()` (`:1364-1368`, `:1355-1362`). A user who finishes level 3 and taps the obvious
continue button is *in* the handcuffs scenario, no question asked. The gate that does exist is a
native `confirm()` — Enter accepts it — and `window.__swanOK` makes the first yes cover all swan
levels until reload. The no-celebration half is real but partial: confetti/fanfare skipped
(`:1331`) — yet the score still displays (`:1332`), points/bonus still accrue, and the level still
counts toward badges, where root's `PRX_UNSCORED` suppresses scoring on swans entirely.

**Impact.** The CHANGELOG claims "now ask consent before entry" — false for two of three entries.
This is the trauma-facing fix of the round (Nia's axis), and the most likely path into a swan
level for a normal user is the ungated one (natural progression), not the gated one (deliberate
tab click).

**Cheapest fix that holds:** move the check out of the tab handler into the one place every entry
converges — the top of `renderArena()` (or a guard in `saveA`-adjacent level assignment): if
`isSwanLvl(A.sit,A.lvl)` and not consented, show the gate before rendering turn 0. One relocation,
all three doors covered. Whether `__swanOK` should be per-level rather than per-session is a
design question (BS-4); per-entry-point coverage is not.

### 3. Supervision mode is now honestly described and permanently visible — and still drills, scores, and tells supervised users to "master" the exact lines its own banner warns them about

**Evidence.** The closure is real: persistent banner (`:490,:1153-1154`), honest modal copy
("You'll see a standing supervision warning" — the false "We will adjust the coaching" is gone),
print-card warning retained (`:1518`). What survives, verified: the Yes button still promises
"supervision-safe **coaching**" (`supYes`, `:563`) — the one word the modal body just stopped
claiming; with `A.sup=true`, every scenario still presents "I do not consent to a search" /
"Am I free to go?" as `g:1` good choices, still +1, still "Good choice:" feedback; and `finish()`
builds "KEY PHRASES TO MASTER" from exactly those `c.g` lines with the instruction "Say each one
out loud twice before you close this" (`:1334-1335`) — inside a modal that visually covers the
banner. The banner warns; the reflex-builder underneath it still builds the warned-against reflex,
and the recap is where the product most explicitly says *make this automatic*.

**Impact.** FG22 golden #1's honest-promise half closed; its drilling half — the actual safety
mechanism — did not. Is a permanent banner enough? For *seeing* the warning, yes, and that's a
real improvement over the scrolled-away prefix. For the product's own theory of value ("rehearsal
under mild stress is what makes words available") the answer is no: it is still rehearsing
supervised users on refusal lines, now with better signage.

**Cheapest fix that holds:** FG22's unshipped second half, unchanged: when `A.sup`, append the
`supOn` line to the recap block and to each `c.g` feedback string, and rename `supYes` to what it
does ("Yes — keep the warning on screen"). String-level, no scenario variants required.

### 4. The honesty round left the two remaining fabrications standing: a "vetted" attorney-referral service that does not exist, and a $19 Vault Pass — advertised on the same modal whose checkout just learned to tell the truth

**Evidence.** `mW2a/mW2b` (`:679`, es `:684`): "Talk to a local traffic attorney — vetted,
state-specific — free case review, no obligation." Still a bare `<div>`: no id, no handler, no
attorney network, nothing behind "vetted" — byte-identical to FG22, shipped through a round whose
theme was removing promises with nothing behind them. `mW1a/mW1b`: "Digital Legal Vault Pass —
$19 — your state scripts as an Apple/Google Wallet card" — no wallet-pass generator exists
anywhere in the repo. Both render in the completion modal directly above the now-honest preview
checkout, so the modal simultaneously demonstrates the new standard and violates it.

**Impact.** Tony's named objection, now the *only* member of FG22's "sentences that aren't true"
list left standing — which raises rather than lowers its salience: the fix pattern is proven
(three string edits closed golden #2), so the survivors now read as chosen. The attorney line is
also the arena's sharpest UPL-adjacent exposure in scope this round: advertising a vetted-referral
legal service that does not exist is a different class of claim than practice-content wording.

**Cheapest fix that holds:** same pattern as the checkout fix — either delete the two divs (they
have no handlers; nothing references them) or relabel as roadmap ("Planned: …"). One edit, EN+ES.

### 5. The last false self-description in the arena: the footer still attributes the officer's voice to "your browser's speech engine" — a system this round deliberately deleted — while the real voice, a cloned human, remains disclosed nowhere in the product

**Evidence.** `fine` (`:676`): "Voice uses your browser's speech engine and is never recorded by
Amparo." At v2.23.x this sentence described the fallback and was misleading; at v2.24.0 the
speechSynthesis fallback is removed (comment `:1207-1214`, grep confirms no call sites), so for
the officer path — the only voice a user *hears* — the sentence is now unconditionally false.
The actual provenance (198 pre-generated MP3s; EN through the cloned voice of a real person,
"Miles") appears in the CHANGELOG and repo tooling only; `grep -in miles arena/index.html` still
returns nothing. The mic half of the sentence remains true, which is exactly what makes it
convincing.

**Impact.** FG22 BS-2 escalated to a false-claim finding by this round's own change: the P0 round
removed the system the sentence describes and kept the sentence. It's the last item in the
product's "honest version" family that fails a literal read (Luis/Rosa axis), and it blocks the
provenance question no one has answered (does the voice donor's consent cover playing a hostile
cop in a shipped product?) from even being visible to users.

**Cheapest fix that holds:** rewrite `fine`'s voice clause (EN+ES): "Officer lines are pre-recorded
studio audio bundled with this page; voice *input* uses your browser's speech engine and is never
recorded by Amparo." One string, two banks. The donor-consent question stays open regardless —
flagged, not asserted, as it depends on facts outside the repo.

---

## 3. What must change in the practice MODULES specifically — the two-trainers problem

**Status since wargames/29: essentially nothing shipped.** Checked item-by-item against FG22 §3 /
wargames/29 at HEAD:

1. **Canonical-trainer decision** — not made. Root hub copy still ranks: "The full training
   ground" (`index.html:1931-1932`, es `:2294-2295`; `/app` `t.en.json:101`).
2. **`/app` carryover contradiction** — intact, verbatim: the string promises "your state carries
   over" (`t.en.json:101`) while the comment six lines above the link still admits `/app` "does
   NOT write" `sr_save.state` (`PracticeHub.tsx:176-177`); grep confirms zero `sr_save` writes in
   `app-src/`.
3. **Progress cross-read** — none. `amparo_prx` (`index.html:5157,:5214`) and `amparoArena`
   (`arena:1029`) still ignore each other; a user done with all root levels still opens the arena
   at readiness 0%, and vice versa.
4. **Matcher port** — the only item touched, and only as an *approach* port: the arena reimplements
   root's majority-overlap idea (`arena:1385-1393` cites `index.html:5390` in its comment) rather
   than sharing code, without root's hit chips, and with golden #1's negation hole — which root
   also has. The product now has two hand-rolled copies of the same imperfect algorithm that will
   drift independently. The crisis-net port (`PRX_CRISIS` duplicated at `arena:686`) has the same
   two-copies shape.
5. **Voice-story unification** — moved *further apart*: root's officer is speechSynthesis with a
   gender toggle; the arena's is now cloned-human MP3s with no fallback at all. Golden #5.
6. **Dead `'hard'` in the safety-gate list / `'last30'` exclusion** — still there (`arena:1151`).
7. **Dead `amparoGuidedFlow` read** — still unwritten by any file in the repo.

**Next smallest step, concretely:** item 2 — resolve the `/app` carryover contradiction. It is one
line either direction (write the postal code into `sr_save.state` in the arena-card click handler,
or cut the "your state carries over" clause from `t.en.json`/`t.es.json`), it closes a
promise-vs-refutation pair that ships six lines apart in the same file, and it requires no design
decision about which trainer is canonical. Second smallest: item 6 (two one-line list fixes).
The matcher negation guard (golden #1) is the highest-*value* module change and should be applied
to the shared shape in both trainers — ideally by finally making it one function, which would also
retire one of the two `PRX_CRISIS` copies.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG22

**BS-1. A silent beat is now indistinguishable from a broken one — is that the same "honest
silence" the CHANGELOG describes?** The design argument for removing the fallback is defensible
("a robot voice mid-drill breaks the rehearsal illusion worse than a silent beat," `:1210`), and
the text is always on screen. But `speakOfficer`'s `onerror` swallows failure silently (`:1224`):
a missing file, blocked autoplay, or codec failure produce the same nothing as the mute button —
no icon state, no "audio unavailable" hint, no telemetry (by design, no analytics). The 0-missing
verification was done at build time against a line dump; at runtime the product can never know,
and neither can the user. For Omar the audio channel is primary, not garnish. What's the cheapest
visible signal (e.g. the existing sound chip flashing a struck-through speaker on `onerror`) that
distinguishes "we chose silence" from "something failed"?

**BS-2. Is the door-knock card's review claim true today — and who is the DV clinician?** `heldB`
asserts, present tense: the coaching "**is with** the attorney and DV-clinician reviewers"
(`:679`). Root's equivalent gate (`DOOR_MODULE_ENABLED=false`) makes no such claim. If both
reviewers actually have the material in hand, this is the most credibility-building sentence in
the arena. If it means "we intend to send it," it is a new instance of the exact
promise-with-nothing-behind-it pattern this round existed to kill — on the card explaining why
the product doesn't ship such things. RECON: confirm both handoffs happened (names/dates in the
notebook), or soften to "held until attorney and DV-clinician review." Not counted as a golden
because the repo cannot show whether it's false — only that nothing in the repo shows it's true.

**BS-3. "Preview checkout" is honest — and it answers FG22's BS-1 in the direction of training
every early user that Amparo checkouts are fake. Is that the plan?** The label is right for today.
But the arena now *teaches*, explicitly and repeatedly, that its Pay buttons don't charge — while
still displaying real price points ($3.99/$6.99/$19/$149/$499) it has no way to accept. When
Stripe ships, the first cohort's learned reflex is "the receipt isn't real." Options worth
deciding now, not then: version the copy ("Payments arrive in v3 — this preview becomes real"),
or drop prices from surfaces that can't transact (the org modal's mailto is the only live
commerce path in the product). Also: `payEmail` is now a dead string in both banks — delete it
before some future edit re-renders it.

**BS-4. One confirm for every swan level, per session — is consent that expires on reload but
covers all content the right shape?** Two oddities pull opposite directions: `__swanOK` is a
session global, so consenting to Hard-mode traffic silently covers "Tests & cuffs" on step-out —
different scenario, arguably different trauma surface; yet it's *not* persisted, so a returning
user who consented yesterday is re-asked today (stricter than needed) while a same-session user
is never re-asked (looser than intended). And the instrument is `confirm()` — the only consent in
the product that can be accepted by an accidental Enter, styled by the browser, unreadable by the
gentle-mode design language. Root gates its swans by *unlock progression*, not consent — the two
trainers now embody two different consent philosophies. Which is the product's?

**BS-5. The crisis net can only hear users who type — the user most likely to be in trouble is
the one who freezes, and freezing is the one signal the arena already measures and still scores.**
The 988 net fires solely inside `submitFree` (`:1377`). Choice-clicks can't carry crisis language
(authored text) — that gap is fine. But the freeze-timeout path is the arena's *behavioral*
distress signal: it auto-answers "(froze — said nothing)" at −1 (`:1196`), increments heat, and
its feedback normalizes freezing without ever surfacing the crisis line — while `renderCrisis`
sits in a footer the user in a spiral never scrolls to. Repeated freezes (say, 3 in a session) are
data the arena already has. Should the third freeze swap the −1 for the gentle-mode offer + crisis
line — the same "signal, not score" logic the typed net just shipped?

---

## 5. Group read

**Would-evaluate-favorably verdict: 5 yes/conditional-yes (Dana — reversed from no, Devin, Marcus,
Wes, Luis — up from no) / 4 conditional (Nia, Rosa, Keisha, Omar) / 1 no (Tony).** The shape
change is the story: FG22 ended 3 hard noes, all on sentences that weren't true; this round two of
the three reversed on verified fixes, and the panel's remaining no is anchored to the two
fabrications the round left standing (golden #4) plus one it created or inherited ambiguously
(BS-2). Nobody's verdict worsened.

**The mechanics, said plainly.** All six claimed behavior changes exist in source and five are
real closures or better (checkout, privacy copy, state-law lines fully; door hold mechanically
complete; supervision honestly *described*). The two partials share a signature: **the fix closed
the finding's headline case and kept its structural case** — the matcher no longer praises the
poison sentence *on other turns* but still does on the turns that matter (golden #1); the swan
gate asks consent *at the door users don't use* (golden #2); supervision *says* the truth and
still drills the risk (golden #3). FG22's theme was promises shipped as UI; FG23's is fixes
verified against the sentence in the CHANGELOG rather than the behavior in the flow.

**Highest-leverage fix, this round's subject.** Golden #1's negation guard — it's the safety core
of the product's main loop, it fixes both trainers if applied at the shared shape, and it makes
the CHANGELOG's own claim true. Together with golden #2's gate relocation (one code move) the
round's two behavioral survivors close for roughly the effort of one of the six shipped items.

**Highest-leverage fix, whole product.** Unchanged since FG16: `/app`'s colour-only print
confirmation (`PrintStep.tsx:119` — carried forward, not re-verified; this round's diff touched
only `arena/index.html`).

**Who this still isn't for.** Ana (unaffected — no state-logic change this round; her federal-only
framing at `arena:1061` region carried forward), Ray (golden #5's list removal is the boundary
his entry defines, now correctly enforced — the round's cleanest closure of his file), Marisol
(payment-trail objection now moot in the best way: there is no payment to leave a trail; BS-3
holds her seat for when there is).

---

## 6. Signature

Agent A, `/amparo-loop`, standalone run. Ten personas from `.focus-group/members.md`: Dana, Devin,
Nia, Tony, Luis, Rosa, Marcus, Omar, Keisha, Wes — the FG22 panel re-empaneled deliberately,
because this round's subject is FG22's own findings and each verifier owns the finding they made.

All source citations are `arena/index.html` at HEAD (`bfa9ba9`, v2.24.0+1) unless prefixed, plus
`index.html`, `app-src/**`, `t.en.json`, verified by direct grep/read/`git show --stat`/`git log`.
`CHANGELOG.md` and `wargames/29-practice-arena-vs-modules.md` quoted where their own claims are the
subject. No live browser session (source-only, per FG19–22 precedent); the two claims that depend
on facts outside the repo (BS-2 reviewer handoff, FG22 BS-3 domain/mailbox) are flagged RECON, not
asserted. Attorney/lawyer review excluded per instruction throughout; golden #4 and BS-2 are
scoped to specific claims in shipped copy, not to the need for review.
