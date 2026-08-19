# Amparo focus group 22 — the arena that promises coaching and delivers a banner (v2.22.14 → v2.23.1)

**Agent A of the `/amparo-loop`, run standalone.**
Build under test: HEAD `8d32f0e` (docs commit for tag **v2.23.1**; `git describe` = `v2.23.1-1-g8d32f0e`).
Round commits: `ad8934a` (v2.23.0 — Practice Arena at `/arena/`), `5be0f32` (all 198 Voicebox officer lines),
`a6c71cc` (v2.23.1 — mobile overflow fix + /app hub card). Verified by direct source read of
`arena/index.html` (1,521 lines, fully inline), `index.html`, `app-src/src/screens/practice/PracticeHub.tsx`,
`sw.js`, plus `git log`/`git describe`, `CHANGELOG.md` for the project's own claims, and a file count of
`arena/audio/` (198 MP3s confirmed on disk). No live browser session; every claim below is grep/read-confirmed
against actual file content at HEAD, not inferred from commit messages.

**Excluded by instruction, not re-reported as new:** attorney/lawyer review in any form. The arena's About modal
already self-discloses it (`arena/index.html:673`, `ab3b`: "Pending independent attorney review before launch"),
and the CHANGELOG tracks it as a known follow-up — neither is counted as a finding. UPL-adjacent risks *newly
introduced by arena copy* are in scope per the brief and appear below (golden #5).

---

## 0. What is actually new, verified

### 0.1 The surface

`/arena/index.html` — a standalone page, all inline, no external requests of any kind (`grep -n "https://\|http://"`
returns zero hits; all ten `@font-face` blocks load `fonts/f*.woff2`, confirmed `:8-97`). 6 situations × 4 levels
= 24 scenario levels (`SIT` at `:1019-1025`, `TOTAL` at `:1035`). Officer lines play from
`audio/<djb2-hash>.mp3` (`audioKey` `:1186`, `speakOfficer` `:1191-1201`), falling back to `speechSynthesis`;
`stopVoice()` is called from `answer()` (`:1250`), mic start (`:1364`), and mute (`:1481`) — the one-choke-point
claim in the CHANGELOG holds in source. Progress lives in `localStorage['amparoArena']` (`:1029,1036`). State
carryover: reads `amparoGuidedFlow` first (`:1045` — a key **no file in the repo ever writes**; repo-wide grep
finds only the arena's own read and its own wipe), then falls back to the main app's `sr_save` postal→FIPS
(`:1049-1054`). The service worker guards `/arena` out of the navigation cache (`sw.js:58-62`) — confirmed.

### 0.2 The claims this round makes about itself

CHANGELOG v2.23.0 already logs two known follow-ups: attorney review of arena copy (excluded above) and
"its checkout buttons are a visual demo, not wired to real payments." The second is *known* only in its narrow
form — golden #2 below is about what the demo affirmatively fabricates, which the CHANGELOG does not describe.
v2.23.1 itself logged the free-text matcher observation this brief asks about; golden #3 verifies the mechanism
and finds it worse than the logged observation.

---

## 1. Ten persona reactions

Selected to cover: the actual end user the arena was shaped for (Devin), the trauma/simulation axis (Nia), the
money-and-trust axis (Dana, Tony, Luis, Marcus), Spanish + mic distrust (Rosa), accessibility (Omar), the
30-second bar (Keisha), and the non-driver content the arena ships for the first time (Wes). Ana, Ray, Marisol
carried forward, not re-tested — noted in §5.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user, "would treat practice as a game; never reaches it"

The arena is, structurally, the exact thing his FG02 persona note asked for: something that "opens straight into
a scenario," gamified, with badges, streaks, a daily drill (`:1497-1512`), and a readiness ring. He'd genuinely
use it — the first Amparo surface true of him. Two catches, both verified. First, it doesn't open straight into a
scenario: first visit stacks intro modal (`:1447`) → 3-step tutorial (`:1448`, `openTut`) → supervision question
(`:1129`, fires once `A.seenTut`) → physical-safety checklist (`:1128`) before turn 1. Second, he's exactly the
user who'd discover golden #3 by accident: type something flippant containing "search," get a point and praise.
"I typed 'go ahead and search idc' and it said Good choice." The one persona the arena wins, and the matcher is
what he'd screenshot.

Redo? Yes — strongest favorable verdict of the round. The matcher is the thing that would make him mock it to
friends instead of sharing it.

### 🧑 Nia, 41 — NY, PTSD, wants the information without the simulation

The arena is 100% simulation — her non-simulated route stays the root checklist, unchanged. What she'd credit,
verified: gentle mode is real and reachable (`gentleOn` strings `:673`; `A.gentle` kills the clock `:1162-1168`,
forces `steady=true` `:1255`, blocks the tension drone `:1232`), and a crisis line with 988/Veterans Crisis Line
is rendered into the footer (`renderCrisis` `:1473`, string `crisis` `:673`) — the first Amparo surface to ship
one. What she'd flag: pressure is the *default* and gentle mode is discovered, not offered — the freeze-timeout
auto-answers "(froze — said nothing)" at **-1 point** (`:1166`) before a first-time user knows the 🕊️ button
exists. The feedback copy is compassionate ("Freezing is the default under stress — that's why we practice") but
the scoreboard still punishes the exact symptom her persona exists to represent, on turn one, by default.

Redo? Conditional — closest the product has come to her opt-in condition; the default-on clock is the remaining
gap. She would not use the arena regardless of fixes; she'd want the crisis line on the root surface too.

### 🧑 Dana, 52 — TX suburb, the completionist, "$19 is trivial, hates flaky products"

She's the panel member who would actually tap "Get this Script Pack — $3.99" (`:602`) intending to pay. What
happens, verified end to end: `openPay` (`:1372`) shows a checkout with an email field ("Email for your receipt
(optional)" `:653-654`) and a black " Pay $3.99" button (`:656,1375`). Tapping Pay charges nothing, sends
nothing, and flips to "Purchase confirmed!" (`:662`) with, if she entered her email, "Your pack is ready on this
device — **receipt sent to** dana@…" (`payOkSub`, `:673,1380-1385`) — no receipt exists or is sent; the email
goes nowhere at all. "⬇ Download your PDF pack" is `onclick="window.print()"` (`:664`), which prints the *free*
6-phrase card (`@media print` `:407-415` hides everything but `#printCard`; `buildPrintCard` `:1474-1479`) — the
same card the free "🖨 Print free glovebox pack" path offers. The 11px "Design demo — no card is charged"
footnote (`:657`) is the only tell. "I gave you my email, you told me my receipt was sent, and the 'PDF pack' is
the free card. That's not a demo, that's a rehearsal of lying to me."

Redo? No — first outright no she's given since FG16. Refer? Not until the checkout either works or stops
confirming purchases. Golden #2 is hers.

### 🧑 Tony, 61 — GA, retired postal worker, trusts community institutions, "a card won't stop a bad cop"

He'd read the completion modal's upsell list (`:596-597`): "Digital Legal Vault Pass — $19" and "**Talk to a
local traffic attorney** — vetted, state-specific — free case review, no obligation" (`mW2a/mW2b`, `:675`).
Verified: both are static `<div>`s — no id, no handler, no attorney network, no vetting process, nothing behind
the word "vetted." On the same screen, an org-pricing modal (`:561-573`) quotes $149/$499/Enterprise with only a
`mailto:orgs@amparohq.com` behind it. "You want my church to put its name on this, and the app is already
advertising a lawyer-referral service that does not exist. The NAACP chapter checks one thing before vouching:
does it do what it says. Right now the answer is printed on the screen."

Redo? No, unchanged since FG16 — but this is the first round where his objection is a specific false line in the
product rather than a general stance. He'd separately note the About modal's "Not a law firm… not funded by
police" (`ab1b`, `:673`) as exactly the right kind of sentence — sitting one modal away from the wrong kind.

### 🧑 Luis, 27 — TX, DACA, prepaid data, reads every privacy claim literally

He opens "Privacy — the honest version" (`:574-585`) and checks each line against behavior. `p1` (all data in
localStorage, no server/analytics/cookies) — **true**, verified, zero network calls in the file. `p3` (voice
input opt-in, may hit Apple/Google servers) — **true and well done**: mic requires an explicit confirm before
first use (`:1362`). `p2` — "Fonts currently load from Google Fonts (your IP is visible to Google)…" —
**false**: fonts are self-hosted (`:8-97`, `fonts/f*.woff2`; no external URL exists anywhere in the file). The
self-titled "honest version" discloses a leak that doesn't happen. Then he taps "Wipe my data": confirm text
promises "Erase **ALL** Amparo data on this device — setup, scores, streak, **everything**" (`wipeQ`, `:673`);
the handler removes exactly two keys, `amparoArena` and `amparoGuidedFlow` (`:1489`) — leaving, on the same
origin: `sr_save` (his name, emergency contacts, ZIP, email — `index.html:3844`), `sr_docs` (**photos of his
documents** — `index.html:3740`), and `amparo_prx` (root practice history, `index.html:5214`). For him
specifically — the persona whose whole threat model is "what traces stay on a device" — the wipe overpromise is
the worst finding of the round. He'd also note the Deep Pack sells an "ICE-encounter addendum" (`dS`, `:674`)
behind the fake Pay button: the most safety-critical content in the catalog, gated by theater.

Redo? No until golden #4. The one privacy screen that brags about honesty contains the round's two false claims.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts mic/camera permissions

The ES surface is real: full parallel string bank (`:678-680`), ES officer audio confirmed shipped (98 ES lines
per CHANGELOG; `audioKey('es:'+txt)` keying at `:1194`), scenario content written, not machine-echoed. The mic
double-consent (`micQ` confirm before first use, `:1362`) is exactly the behavior her persona demands — she'd
never grant it, and the arena never asks unless she taps. What she can't know, because nothing in the product
says it: the officer's voice is not "the browser's speech engine" as the footer fine print claims
(`fine`, `:672`: "Voice uses your browser's speech engine and is never recorded by Amparo") — it's 2.8MB of
pre-recorded MP3s of a **cloned real person's voice** ("Miles," named only in the CHANGELOG and repo tools;
`grep -in miles arena/index.html` returns nothing). The one sentence in the product about where the voice comes
from describes the fallback, not the thing that actually plays.

Redo? Conditional — the ES work and mic handling are the standard she asks for; the voice-provenance gap is a
trust question she'd raise the day someone at church asks "whose voice is that?"

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

The share card (`:1398-1417`) is his feature: canvas-drawn on device, 1080×1080, readiness ring, streak,
`amparohq.com` — genuinely sharp, nothing uploaded (`shareNote` claim verified: `toDataURL` + download, no
network). The family challenge uses `navigator.share`/clipboard (`:1418-1422`) — clean. He'd bounce off the
checkout without damage ("it's obviously fake, the button says demo") — the useful low bar, but note his read
and Dana's diverge purely on whether the 11px footnote gets read. Free tier is fully usable without ever seeing
a Pay button he can't afford: confirmed, every purchase surface is optional.

Redo? Yes — most favorable unconditional verdict. He'd share the card. The readiness formula
(`readyPct` `:1397`: drills×70% + streak×5, cap 100) inflates with streaks, which he'd exploit and enjoy.

### 🧑 Omar, 23 — Phoenix AZ, low vision, screen reader + 200% text

Mixed, leaning bad. Text size control exists (`fsBtn`, `body.style.zoom` `:1484-1485`) and the mobile layout was
actually fixed this round (v2.23.1 `minmax(0,1fr)`). But the core scoring mechanic from level 2 up is **watch a
moving needle and act while it's inside a visual gold zone** (`startNeedle` `:1216-1228`; `steadyCheck` `:1229`);
a right answer with "shaky" timing earns zero (`:1263`) — for a low-vision user the steadiness system is a
vision test scored as composure. Gentle mode bypasses it (`steady=true`, `:1255`) but is labeled as the
no-pressure option, not the accessible option. The arena's interactive controls are largely bare `div`/`button`
soup with no ARIA landmarks (contrast root's v2.0.0 a11y work he praised) — the officer line arrives as audio
plus text, good; the needle state changes are visual-only (`steadyState` text does update `:1226` — he'd catch
that and credit it, but the update rate is per-frame, unusable via screen reader).

Redo? No for the arena; his root verdict stands. "The main app learned my lesson two months ago. The new page
didn't inherit it."

### 🧑 Keisha, 34 — Atlanta, rideshare, "something useful in her hand inside 30 seconds"

Her stopwatch test, traced in source: first visit = intro modal → 3 tutorial steps → supervision question →
safety checklist → first officer line. Five gates before value, none skippable as a batch ("Don't show this
again" exists only for the safety card, `safeSkip`). Return visits are much better — resume bar (`:1493-1500`)
and a one-tap daily drill (`:1502-1512`) are exactly her shape. State carryover from the root app she already
used works for her (GA in `sr_save` → FIPS 13 → "GEORGIA (Statute Law)", `:1049-1061`). She'd never see it,
though: nothing about the first-run stack fits between fares.

Redo? Conditional — the daily-drill loop is the best 30-second surface the product has ever built; it's locked
behind the slowest first run the product has ever built.

### 🧑 Wes, 38 — Brooklyn, does not drive, enters sideways

The arena is the first Amparo surface with real non-driver content: the "At your door" situation (4 levels,
`:1020`, warrant-at-the-door escalation `LVLD` `:1027`) and passenger scenarios. He'd find it by tapping around,
which is his whole method. He'd also be the one to notice, reading closely, that the physical-safety checklist
gate lists situations `['traffic','pass','trap','hard','step']` (`:1128`) — `'hard'` is not a situation id (ids:
traffic, door, pass, trap, last30, step), so it's a dead entry, and `'last30'` (a traffic stop) is excluded from
the safety card while `'pass'` (sitting in a passenger seat) gets it. Same dead `'hard'` in the duty-to-inform
display gate (`:1131`). Cosmetic, but the exact kind of copy-paste seam he reports.

Redo? Yes. The door-knock content alone moves him from "the product stops being driver-shaped" (his FG02
condition) to partially served — first round that's true.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. "Supervision-safe coaching" is a banner, not coaching — the arena asks the highest-risk users it has to identify themselves, promises to adjust, then drills them on the exact lines it just told them could endanger them

**Evidence.** The supervision modal (`supB`, `:673`) tells a user on probation/parole: *"many supervision
conditions include standing consent to searches, so 'I do not consent' and 'am I free to go' can create real
risk for you. **We will adjust the coaching.**"* The Yes button is labeled "use supervision-safe coaching"
(`supYes`). `A.sup` is then read in exactly two places in the entire file: `:1130` (prepends the static `supOn`
warning string to the scene description) and `:1478` (appends the same string to the print card). Nothing else
changes — every scenario still presents "I don't consent to searches" and "Am I free to go?" as the good choices
(`c.g` flags in `SCEN`), still awards them the point, still plays "Good choice" feedback, still lists them as
"KEY PHRASES TO MASTER" in the completion recap (`:1306-1307`), still prints them on the glovebox card
(`buildPrintCard` pulls only `c.g` lines, `:1477`). The product's own stated theory of value is that drilling
builds the reflex (`tut1B`: "that's what builds the reflex"; `ab5b`: "Rehearsal under mild stress is what makes
words available") — so for a supervised user it is, by its own theory, building the reflex its own warning says
creates "real risk," with one ⚠ line of text as the entire adjustment.

**Impact.** Highest of the round because it's a safety gap for the most legally exposed users the product
serves, created by a promise the product itself makes and does not keep. Every other finding this round costs
trust; this one could cost a supervised user a violation.

**Cheapest fix that holds:** until per-scenario supervision variants exist, make the honest version of the
promise: change `supB`'s "We will adjust the coaching" / `supYes`'s "supervision-safe coaching" to what actually
happens ("we'll keep this warning on screen"), and append the `supOn` warning to the completion recap and every
`c.g` feedback line when `A.sup` — string-level changes, no new scenario content, no new legal claims.

### 2. The demo checkout doesn't just show a Pay button — it confirms purchases that didn't happen, claims a receipt was "sent" to an email it silently discarded, and labels the free print card a purchased "PDF pack"

**Evidence.** `openPay` (`:1372-1379`) renders " Pay $3.99/$6.99/$3.00" (`:1375`; entry points `:1393-1395`,
`:1490` gift). The pay screen collects an email (`:653-654`). `payNow.onclick` (`:1380-1385`) does exactly this:
read the email, show "Purchase confirmed!" (`payOkT`, `:662`) and `payOkSub(e)` — *"Your pack is ready on this
device — **receipt sent to** {email}."* (`:673`). No network call exists in the file; the email is used for that
sentence and discarded. "⬇ Download your PDF pack" is `window.print()` (`:664`), and the print stylesheet
(`:407-415`) prints `#printCard` — the same free 6-phrase card available via the free path. The only disclosure
is an 11px footnote (`:657`). The ❤️ Tip flow (`:1395`) runs the same theater: a user who believes they gave $3
gave nothing. CHANGELOG v2.23.0 discloses "checkout buttons are a visual demo, not wired to real payments" — it
does not disclose that the demo *affirmatively confirms* purchases and receipt delivery.

**Impact.** This is a legal-rights app whose entire pitch is "we don't lie to you" (a privacy modal literally
titled "the honest version"). The first money-shaped interaction any user has with it fabricates three facts: a
confirmed purchase, a sent receipt, a paid deliverable. Dana's no-verdict above; Tony's vouching objection
compounds it. It is also the first surface in Amparo's history that asks for an email inside a flow — a
data-minimal product teaching users to type their email into a fake checkout.

**Cheapest fix that holds:** keep the design demo, remove the fabrications — three string/markup changes:
"Purchase confirmed!" → "Demo complete — nothing was charged"; delete the "receipt sent to" clause (drop the
email field entirely; it serves no function); relabel `payDl` to "🖨 Print the free card." No wiring work, no
Stripe, smaller diff than what shipped.

### 3. The free-text matcher scores by keyword presence anywhere in the answer — it awards a full point and "good" feedback to the *opposite* of the taught behavior, and stamps every hit with the current turn's unrelated canned feedback

**Evidence.** `submitFree` (`:1346-1356`): a hit is `overlap>=2` words with the current turn's good choice OR
`KEY.some(k=>lower.includes(k))` where `KEY` (`:682`) is a global list including `'silent'`, `'lawyer'`,
`'consent'`, `'search'`, `'remain'`, `'glovebox'`. There is no negation or context handling. Confirmed
consequences from source: (a) the v2.23.1 QA observation — "I choose to remain silent and want a lawyer" typed
on turn 0 of `routine` ("License and registration," `:686-688`) hits `'silent'`+`'lawyer'` → full point + turn
0's canned feedback *"Announcing movement keeps hands accounted for"* — mislabeled praise for an answer that, on
this specific turn, is actually the weaker move (documents are required); (b) worse and previously unlogged —
**"yes officer, go ahead and search, I consent"** contains `'search'` and `'consent'` → hit → full point,
scored identical to the strongest line. The root practice module's own matcher does this right: per-quoted-phrase
word sets, ≥50% required, fuzzy prefix matching, visible per-word hit chips (`index.html:5390-5402`) — the
stricter, more honest matcher already exists in this repo, one directory up.

**Impact.** The arena's core loop — the thing the points, streaks, badges, and readiness score all measure — can
certify the exact behavior the product exists to train out. A user's "readiness 85%" can be built on answers a
real stop would punish.

**Cheapest fix that holds:** port root's matcher shape (per-turn good-choice words only, ≥half required, no
global KEY shortcut), and when the hit came from overlap with a *different* turn's canonical phrase, fall back to
the generic `fallback` string instead of the turn's `goodC.f`. Root's implementation is the spec; no new design
needed.

### 4. The arena's privacy surface makes two false claims in opposite directions: "Wipe my data" erases far less than "everything," and "the honest version" discloses a Google Fonts leak that no longer exists

**Evidence.** Wipe: `wipeQ` (`:673`) — "Erase ALL Amparo data on this device — setup, scores, streak,
everything?"; `p4` (`:673`) — "erases everything Amparo stored on this device, instantly and permanently."
Handler (`:1489`) removes `amparoArena` and `amparoGuidedFlow` only. Surviving on the same origin after a
"wipe": `sr_save` — name, two emergency contacts + phones, attorney, ZIP, email (`index.html:3844`); `sr_docs` —
photos of the user's documents (`index.html:3740`); `amparo_prx` — practice history (`index.html:5214`);
`amparo_muted`/`amparo_voice`. The user this promise matters most to (Luis's read) is exactly the one it fails.
Root's own `clearSave` (`index.html:3889`) is equally arena-blind — neither surface's wipe knows the other
exists. Fonts: `p2` (`:673` en, `:678` es) — "Fonts currently load from Google Fonts (your IP is visible to
Google when the page loads)" — false at HEAD: all fonts self-hosted (`:8-97`), zero external URLs in the file;
the disclosure was true of the design-tool original and never updated when `5be0f32`/`ad8934a` self-hosted the
fonts (the CHANGELOG's own headline: "fonts self-hosted (zero external requests)").

**Impact.** A privacy modal that styles itself "the honest version" contains one claim that overpromises deletion
of the most sensitive data in the product (document photos, emergency contacts) and one that asserts a leak the
build already fixed. Both directions of error erode the same asset: a scared user's ability to take Amparo's
sentences literally.

**Cheapest fix that holds:** wipe — either remove all five known Amparo keys (`amparoArena`, `amparoGuidedFlow`,
`sr_save`, `sr_docs`, `amparo_prx`, plus `amparo_muted`/`amparo_voice`) or scope the copy to "arena data";
removing the keys is one line and matches the promise already shipped. Fonts — delete or rewrite `p2` (en+es)
to the true claim, which is *better* than the disclosed one.

### 5. The arena ships two brand-new state-by-state legal-content lists — firearm duty-to-inform (11 states) and stop-and-identify (26 states) — as unverified constants, displayed as ⚠ legal guidance, in a project whose own focus-group charter explicitly refused state-by-state firearm-declaration content

**Evidence.** `arena/index.html:1057-1059`: `/* FIPS lists: firearm duty-to-inform + stop-and-identify (verify
with counsel before launch) */` — `DUTY_INFORM` (11 states incl. TX, GA, OH, NC) and `STOP_ID` (26 states).
Displayed to users at `:1131`: *"⚠ {STATE} is a duty-to-inform state: if you legally carry a firearm, tell the
officer promptly"* and `:1132`: *"⚠ {STATE} is a stop-and-identify state: if lawfully detained, you must give
your name"* — affirmative, state-specific statements of legal obligation ("you must"), in both languages.
`.focus-group/members.md:16` (Ray's entry) records the project's standing decision: *"do NOT chase him with
firearm-declaration guidance — new state-by-state legal content, refused under rule 1."* The main app carries no
equivalent lists (grep: `DUTY_INFORM` appears nowhere in `index.html` or `app-src/`). This is not the known,
excluded "arena copy needs attorney review" item — it is a *category* of content (state-by-state firearm and
identification obligations) that the project examined and refused, now shipped via the design-tool import with
its verification deferred to a code comment.

**Impact.** These two lines are the arena's only affirmative "you must" legal claims, they're wrong-costly in
both directions (telling someone they must identify in a state where they needn't, or omitting a state where
they must), and the lists entered the product without the per-statute citation discipline the root app applies
to its 3 cited states. The prior refusal wasn't an oversight to route around — it was the product's own
risk call, silently reversed.

**Cheapest fix that holds:** gate both display lines behind the same standard the rest of the product uses —
either verify the lists the way `states.json` content is verified (and cite), or suppress the two `scLine`
appends until then (two-line change at `:1131-1132`). If suppressed, nothing else in the arena depends on them.

---

## 3. What must change in the practice MODULES specifically

This round, for the first time since FG16, the answer is not "nothing." The arena **is** a practice surface, and
the product now runs two competing trainers:

| | Root practice modules | Practice Arena |
|---|---|---|
| Progress store | `amparo_prx` (`index.html:5214`) | `amparoArena` (`arena/index.html:1029`) |
| Free-text matcher | per-phrase, ≥50% words, fuzzy, per-word hit chips (`:5390-5402`) | any 2-word overlap OR one global keyword, no chips (`arena:1346-1356`) |
| Officer voice | `speechSynthesis`, user-selectable gender (`:5251`) | cloned-human MP3s, speechSynthesis fallback (`arena:1191`) |
| Completion metric | per-level done in `amparo_prx` | points + streak + "readiness %" (`arena:1397`) |
| Wipe | `clearSave` — doesn't touch arena keys (`:3889`) | `wipeLink` — doesn't touch root keys (`arena:1489`) |

Specific changes, in order:

1. **Decide which trainer is canonical, and say so in the hub.** The hub copy already tilts: `hub_arena_sub`
   calls the arena "The full training ground" (`index.html:1931-1932`, es `:2294-2295`) — implicitly demoting
   the root modules on the same screen. If the arena is the successor, the root modules' role (the lighter,
   in-flow drill) should be named; if they're peers, the copy shouldn't rank them.
2. **Fix the /app carryover copy contradiction — shipped knowingly.** `/app`'s new arena card promises "your
   state carries over" (`t.en.json:101`, es equivalent) while the comment directly above the link admits it
   doesn't: *"it reads the root app's sr_save.state as a fallback, **which /app does NOT write** — so arriving
   from /app the arena starts unset"* (`PracticeHub.tsx:174-179`). Either have /app write the postal code into
   `sr_save.state` on the way out (one line in the click handler), or cut the carryover clause from the /app
   string. A promise and its own refutation currently ship six lines apart.
3. **One progress truth, or none.** A user who finishes all 8 root levels opens the arena at readiness 0%, and
   vice versa. Cheapest honest option: don't merge stores — have each hub card show the *other* surface's
   completion ("Arena: 6/24 done") by reading the other key, read-only, same pattern the arena already uses for
   `sr_save`. Full merge is not required to stop the two numbers contradicting each other.
4. **Port the root matcher into the arena** (golden #3) — the repo already contains the correct implementation
   and its UI (hit chips), which also fixes the arena's matcher being invisible to the user.
5. **Unify the officer-voice story.** Root's officer is a browser voice with a gender toggle; the arena's is a
   cloned real human. Same product, same officer role, two voice provenances, zero in-product disclosure of the
   second (see BS-2). Whatever the answer, it should be one answer.
6. **Dead `'hard'` id in the two situation-gate lists** (`arena:1128,1131`) and `'last30'`'s exclusion from the
   safety checklist and duty-to-inform line despite being a traffic stop — one-line list fixes (Wes's read).
7. **The dead `amparoGuidedFlow` read** (`arena:1045`) — no writer exists in the repo. Either it's the seam for
   a future guided-flow page (then comment it as such) or it's leftover from the design bundle (then delete the
   read; the `sr_save` fallback is the real path).

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG21

**BS-1. What does a fake "Pay" button cost on an app for scared people — and what does it train them to do?**
Beyond golden #2's fabrications: the checkout is the first Amparo surface that ever asks for an email, and it
does so inside a flow the product knows is theater. The users this app courts (mixed-status families, payment-
trail-averse — Luis, Marisol's documented objection) are being shown that Amparo-branded checkout screens exist
and take emails. When a real Stripe flow ships later, the product will have already taught its most cautious
users either (a) Amparo checkouts are fake, don't trust the receipt, or (b) typing your email here is normal.
Which lesson is it planning to have taught? (Same question applies to the ❤️ Tip: is any accounting planned for
goodwill "donations" the demo silently absorbed?)

**BS-2. Whose voice is the officer, does the consent cover this use, and what happens when someone recognizes
it?** All 100 EN officer lines play in the cloned voice of a real person ("Miles" — named in the CHANGELOG and
Voicebox tooling, nowhere in the product). The lines are hostile-authority content: commands, threats,
manipulation ("The last 30 seconds" is literally a coercion-tactics scenario). Three unasked questions: does the
voice donor's consent extend to playing a hostile cop indefinitely in a shipped product; is there any in-product
provenance note (currently the only voice sentence, `fine` `:672`, describes the *fallback* engine — factually
wrong for the primary path); and — the UX question — does a cloned human voice, chosen for realism, change what
the simulation does to users like Nia in a way the synthetic root voice doesn't? The product A/B'd this on
nobody.

**BS-3. Does `amparohq.com` exist, and do `orgs@`/`partners@` mailboxes answer?** The product now prints
`amparohq.com` on the share card (`:1414`), the family challenge message (`famMsg`), and the print card's cut
line (`:1478`), and routes org revenue ($149/$499) and attorney partnerships through `orgs@amparohq.com` /
`partners@amparohq.com` (`:570,673`). No prior round has verified the domain resolves or the mailboxes exist.
If a church administrator emails orgs@ and gets a bounce, that's Tony's institutional-trust test failed in the
worst possible way — silently, off-product, unmeasured. RECON: one email each, before any org sees the modal.

**BS-4. Five gates before the first officer line — was the first-run stack ever timed against the product's own
30-second persona?** Intro → 3 tutorial panels → supervision question → safety checklist (Keisha's trace, §1).
Each gate is individually defensible; nobody appears to have summed them. The design's own best surface (daily
drill, resume bar) is return-visit-only. What's the measured time-to-first-drill on a cold phone, and which
gates could collapse into the first scenario itself (the safety checklist is five lines that could *be* turn 0)?

**BS-5. The readiness score is now a shareable number — what keeps it honest?** `readyPct` (`:1397`) weights
streak days (5 pts/day, up to 30) nearly as heavily as a third of all drills, and golden #3 means drill
completions themselves can be keyword-farmed. The number goes on a 1080×1080 card built for family group chats
("My readiness is at {R}%. Can you beat it?"). A gamed or inflated "readiness" percentage attached to
police-stop preparedness is a different kind of wrong than an inflated Duolingo streak — has anyone asked what
the number should refuse to claim?

---

## 5. Group read

**Would-evaluate-favorably verdict: 4 yes/conditional-yes (Devin, Marcus, Wes, Keisha — Keisha conditional on
the first-run stack) / 3 conditional with specific objections (Nia, Rosa, Omar) / 3 no (Dana, Tony, Luis — all
three on trust claims, not mechanics).** The split is new in shape: every prior round's noes were about reach or
stance; this round's noes are all about sentences in the product that are not true — a confirmed purchase that
didn't happen, a receipt that wasn't sent, an "everything" wipe that leaves document photos, an "honest version"
disclosing a fixed leak, "vetted" attorneys who don't exist, "we will adjust the coaching" that doesn't adjust.

**The mechanics, said plainly:** the arena's engineering holds up under source verification — zero external
requests, real self-hosted fonts, a correct one-choke-point voice cutoff, a real SW guard, working ES audio
keying, honest on-device share cards, a genuinely good gentle mode and crisis line. Nobody found the *game*
broken. The findings are concentrated where the design-tool import's *copy* writes checks the code doesn't cash.

**Biggest objection by theme.** FG19-21's recurring shape was "new machinery not wired to old machinery." This
round's is sharper: **promises shipped as UI with nothing behind them** — coaching that's a banner, receipts
that are string concatenation, wipes that are two keys, attorney networks that are a `<div>`. The design bundle
brought a voice; it also brought a habit of asserting things, and the assertions shipped unaudited.

**Highest-leverage fix, this round's subject specifically.** Golden #1 (supervision) for safety; golden #2's
three-string fix for trust — together under an hour of edits, and they close 3 of the round's 3 hard noes.

**Highest-leverage fix, across the whole product regardless of surface.** Unchanged from FG16-21: `/app`'s
colour-only print confirmation (`PrintStep.tsx:119` — carried forward, not re-verified this round; this round's
diff didn't touch it).

**Who this still isn't for.** Ana (arena reaches her — "ARIZONA (Federal rights)" framing at `arena:1061` is
exactly the coverage-honest framing her FG02 condition asked for; favorable, noted without full re-test), Ray
(golden #5 is *about* the boundary his entry defines, not about serving him), Marisol (her payment-trail
objection is subsumed under BS-1), Tony's grandkids/Devin overlap covered by Devin directly.

---

## 6. Signature

Agent A, `/amparo-loop`, standalone run. Ten personas from `.focus-group/members.md`: Devin, Nia, Dana, Tony,
Luis, Rosa, Marcus, Omar, Keisha, Wes — chosen for this round's actual subject (a standalone gamified practice
surface with spoken officer audio, demo commerce, and its own privacy/trust copy), spanning the end-user axis
(Devin), trauma (Nia), money/trust (Dana, Tony, Luis, Marcus), language (Rosa), accessibility (Omar), speed
(Keisha), and non-driver content (Wes).

All source citations are `arena/index.html`, `index.html`, `app-src/src/**`, and `sw.js` at HEAD (`8d32f0e`,
v2.23.1+1) verified by direct grep/read/`git log`/`git describe`, plus a filesystem count of `arena/audio/`
(198 files). `CHANGELOG.md` and `.focus-group/members.md` quoted directly where their own claims are the subject
of a finding. No live browser session this round (source-only, consistent with FG19-21 precedent); no finding
depends on unverified live behavior — BS-3 is explicitly flagged RECON. Attorney/lawyer review excluded per
instruction throughout, including as a blind spot; golden #5 is scoped to the governance reversal and the
"you must" copy, not to the need for review.
