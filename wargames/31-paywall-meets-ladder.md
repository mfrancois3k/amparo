# 31 — The Paywall Meets the Practice Ladder

**Loop step 8 design review — game / level / instructional designer, plus a monetization-designer
lens this round. 2026-08-19, post-v2.26.0.**
Follows `wargames/29-practice-arena-vs-modules.md` and `wargames/30-post-p0-design-state.md`.
Structure and mechanics only. Every content slot follows the `TODO_ATTORNEY` convention from
`wargames/03-door-module-design.md` — no officer dialogue, no legal copy is authored here.
Line numbers verified against current source: `arena/index.html` (1664 lines), root `index.html`
(6552), `app-src/convex/stripe.ts` (113), `app-src/convex/http.ts`. Unverified claims are marked.

---

## 1. wargames/30's open items, re-checked against current source

| # | Item (wargames/30 §2–§3) | Status now | Evidence |
|---|---|---|---|
| 1 | Streak accrues on page-open | **STILL OPEN** | IIFE `arena/index.html:1049–1053` still increments `A.streak.n` at load, before any drill. Root earns it at run completion (`prx.streak` written in the run-completion checkpoint). Unchanged. |
| 2 | Readiness ignores answer quality | **STILL OPEN (denominator half fixed)** | `:1112` and `readyPct()` `:1539` are both `Object.keys(A.done).length/TOTAL*70 + min(streak,6)*5`. Still counts **keys, not values** — `A.done[id]` is written on any completion at any score (`:1378` keeps best, but the readiness term never reads it). A 0-point run on every level + a 6-day page-open streak still prints high on the share card (`:1554`). |
| 3 | Pressure copy says 10s, code gives 6 | **LANDED** | Bank now reads `mPressure:'⚡ Replay under pressure — a shorter clock on every line'` (`:676`) / ES twin (`:681`) — no number, so it can't be wrong. Math unchanged: `baseT=(A.lvl===3?5:7)+(A.pressure?-1:0)` `:1206`. **Residual:** the static HTML fallback at `:617` still reads "10 seconds per line". `applyLang()` runs unconditionally at init (`:1661`), so it is overwritten in practice — but this is the exact shape of the v2.25.0 `pilotBanner` bug the v2.26.0 changelog documents. One-line hygiene fix. |
| 4 | Heat penalizes neutral `p:0` choices | **NOT FIXED — the fix is a no-op** | `:1351` now reads `if(p<1&&!good) A.heat=…` with a comment citing wargames/30. But `grep -c "p:0,g:1"` = **0** and `grep -c "p:0,g:0"` = **13**. Every neutral choice is `g:0`, so all 13 still add heat via the choice path `:1214` (`answer(c.t,c.p,c.f,c.g,c.nx)`). Free-text paraphrase misses also still add heat (`:1481` passes `good=0`), as does a freeze-timeout (`:1209` passes `0`). The only beat the guard actually exempts is the action-only free-text fallback (`:1475`, `good=1`). |
| 5 | Decks verbatim on replay | **STILL OPEN** | `grep -c "v:\["` = 0 variant arrays in SCEN; `grep -c "branch:true"` = 1. Every replay of every arena level is word-for-word identical. Replay variety is still only pressure mode + heat. |
| 6 | Root curveball date-only seed | **STILL OPEN (5th flagging)** | `index.html:5145`: `seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate()`; `:5146–5147` pick the curveball and its splice position from that same seed. Same-day replays get the identical curveball at the identical deck slot. `seed+runs` remains the one-line fix. |
| 7 | The swan gate | **LANDED, one new leak** | Relocated into `renderArena()` `:1152–1159` — fires on sidebar picks, "practice another", daily drill and reloads. Consent is per `sit:lvl` in `window.__swanAsk`, page-scoped, so a reload re-asks. Declining sets `A.lvl=0` and execution falls straight through to `renderTabs()`/`cur()`, which correctly render level 1. **New leak:** `__swanAsk[_sk]=1` is set *before* the `confirm()` (`:1156` precedes `:1157`), so a user who **declines** is marked as asked — one more tap on that level walks straight in with no gate. Moving the write into the accept branch is a one-line fix. Also still a native `confirm()`; wargames/30 §3a's in-page-interstitial recommendation was not taken. |
| 8 | Two trainers (`amparo_prx` vs `amparoArena`) | **STILL FULLY OPEN** | Root/app never read `amparoArena` (`index.html:3685` is a comment only). Arena never reads `amparo_prx` (`grep -c` = 0). Nothing shipped. See §4. |

**Also verified landed since wargames/30:** `TOTAL` now excludes held situations (`:1046`), so badges reach
20/20 and readiness can pass 88% — §3b of wargames/30 closed. Matcher v3 landed as described (`:1463–1481`:
quoted-span keyword extraction, apostrophe strip before tokenizing, `NEG` polarity guard, `max(2, ceil(n/2))`
threshold, 4-char prefix forgiveness, action-only lines routed to a no-score/no-heat coach). Its remaining
design cost is item 4 above, not the matching itself.

---

## 2. The paywall meets the practice ladder

### 2a. Where the money actually lives (verified, and it is not where you'd guess)

Real Stripe Checkout is live at `arena/index.html:1503` (`CHECKOUT_URL` → the guest `/checkout` HTTP
endpoint in `app-src/convex/http.ts:39,45` → `guestCheckout` in `stripe.ts:57`), with prices held
server-side (`stripe.ts:15–19`, script 399 / deep 699 / tip 300); the client can only name a product.

The load-bearing fact for this review:

- **Root `index.html` has zero purchase surface.** `grep` for `CHECKOUT_URL|openPay|6\.99|3\.99` over
  root returns nothing. The pack builder — the place a user goes when they actually want the deliverable —
  never asks for money.
- **`createCheckout` (the authenticated action, `stripe.ts:21`) has no client caller anywhere.** `/app`
  does not call it.
- Therefore **100% of Amparo's revenue surface sits inside the practice arena**: the scenario-complete
  modal (`buyScript` `:606`, `.deep` `:607`), the always-visible sidebar card (`buyDeep` `:480`,
  `giftDeep` `:481`), and the header menu tip (`tipBtnEl` `:445`).

The paywall is bolted to the *training loop*, not to the *product*. Every design question below follows
from that one placement decision, and the cleanest structural fix to most of them is to move the primary
purchase surface to where a user has already decided they want an artifact — the pack/print step in root —
and leave the arena with, at most, one quiet link.

### 2b. Which levels should never show a purchase prompt

**Verified current rule.** `finish()` computes `swan=isSwanLvl(A.sit,A.lvl)` (`:1387`), where
`isSwanLvl = i===3 || (sitId==='step' && i>=2)` (`:1124`). On a swan it hides the score ring
(`.mRing`), `mPath`, the `.mList` feature bullets, `buyScript`, and `.deep` (`:1392–1396`), and skips
confetti + win sfx (`:1388`). Across the six situations that covers traffic:3, door:3 (held anyway),
pass:3, trap:3, last30:3, step:2, step:3 — **every swan is covered.** wargames/30 §1b's gap is closed
at the modal.

**Four leaks remain, all structural, none requiring new copy:**

1. **The decline button is upsell furniture.** `mClose` reads "No thanks — the free pack is enough"
   (`:619`, bank `:676`). It has no swan branch. On a handcuffs level where nothing was offered, the
   only way out of the modal is a sentence declining a purchase. Fix: swap `mClose`'s label to a neutral
   close on swans — the string already exists elsewhere (`payCancel`/"Cancel"), so no authoring.
2. **The sidebar never hides.** `buyDeep` ($6.99, state-personalized at `:1080` to "⭐ [State] Deep Pack")
   and `giftDeep` sit in the left rail the entire time, including behind the swan modal and during the
   run. The modal-level suppression is cosmetic while a state-personalized price tag is on screen.
3. **The retention nudge survives.** `mHook` (`:1407–1409`) still prints "N drills done — print your
   wallet card…Come back tomorrow to make it a K-day streak" on a swan finish, and `mPressure`
   (`:617`) still offers "⚡ Replay under pressure". Streak-chasing and a *harder* replay offer are the
   two things root's "no trophy on the swan" rule exists to prevent.
4. **The headline.** `h2 data-i18n="mT"` = "Scenario complete!" (`:595`) is unbranched. Its replacement
   is a reflective one-liner and is therefore `TODO_ATTORNEY` — flagged, not written.

**Should the rule extend further? Three proposals, in confidence order.**

- **Yes — the supervision-safe cohort.** Verified: `A.sup` (`:1612`) drives exactly one thing, the
  standing banner (`:1167`) plus a print-card line (`:1620`). It has no interaction with the paywall.
  A user who has just told the product "I am on probation or parole" is, by the product's own supervision
  copy, in the group for whom the standard coaching may be actively dangerous. Selling that user a
  $6.99 pack of the same coaching, on the same screen, is the sharpest ethical edge in the build.
  Structural rule: **`A.sup === true` suppresses every purchase prompt on every surface.** One boolean,
  already persisted, already read at render time. If the pack ever gains supervision-specific content
  that argument changes — that content is `TODO_ATTORNEY` and does not exist yet.
- **Yes — the freeze-timeout finish.** A run whose last beat was the clock expiring (`:1209` injects
  `answer('(froze — said nothing)', -1, …)`) ends with the product having just told the user they
  froze. Suppress the upsell on any run containing a freeze beat. Detectable from `A.hist` without
  new state.
- **Qualified no — "any level the user failed."** Suppressing on failure sounds protective but inverts
  badly: it makes the purchase prompt a *reward for winning*, which is exactly the "buy to complete the
  set" pressure §2c warns about, and it teaches the meter that a low score means the product withdrew.
  The better version of that instinct is §2c's rule, which is about repetition rather than outcome.

### 2c. Does a paywall change the difficulty curve's meaning?

The premise in the brief — a user who fails Hard mode three times sees "$6.99 Deep Pack" most often —
**does not hold for the modal**, and it is worth saying why: every Hard mode is `i===3`, therefore a swan,
therefore already suppressed (`:1392–1396`). That is a real win from v2.24.1.

It **does** hold for the sidebar. `buyDeep` is state-personalized, gold-bordered, and permanently on
screen. A user grinding traffic:1 into the ground sees the same $6.99 tag on attempt one and attempt
twelve. Nothing in the code varies purchase-prompt frequency by outcome — which is the honest state,
but also means the *only* thing that varies with repeated failure is the user's mood.

There is also a naming mismatch worth flagging as pure level design: `trap:3` and `last30:3` are labelled
"🏆 Hard mode" (`:1032–1033`), an achievement frame with a trophy glyph, yet `isSwanLvl` silently
strips their score and any completion payload. Either they are trophy levels and should be scored, or
they are swans and should not carry a trophy in their name. The label set is arena chrome, not legal
content, so this is a free fix — but it is a fix, not a wording preference: right now the tab promises a
score the finish screen refuses to show.

**Proposed structural rule — Earned Ask.**

> A purchase prompt may fire only on a run the user *completed cleanly* (`base===max`), and at most
> once per situation per day. Every other completion shows the debrief and nothing else.

Why this shape and not a softer one:

- It is a *pure* rule — no per-user counters, no cooldown table, no "how many times has this person
  failed" state. `base===max` is already computed at `:1376`; a `sit → yyyy-mm-dd` stamp in `A` is one
  key.
- It removes the extraction gradient by construction. The product cannot ask for money more often from
  people who are struggling more, because struggling produces zero asks.
- It is legible as coaching: the moment you nail a scenario is the moment "take this with you on paper"
  is a genuinely useful next step rather than a consolation sale.
- It costs revenue, deliberately, and the safety framing is what buys that back. A know-your-rights
  product that only sells to people who just succeeded is a defensible sentence; one that surfaces
  hardest to people who keep failing is not.

Companion rule, same spirit, one line: **the sidebar pack card renders only after the user's first clean
completion.** Before that, the rail shows the free print link (`:479`) alone.

### 2d. Where the free/paid line belongs for a safety product

The line is not "basic vs. advanced." For a product whose failure mode is a person saying the wrong thing
during a police stop, the line is **information vs. convenience**.

**Must be free forever — non-negotiable, and all of it is free today:**

1. **Every sentence a person might need to say, and the reasons behind it.** All arena scenarios, all
   correct lines, all feedback, all levels. Practice is currently 100% free and the arena footer says so
   (`founderA`, `:675`). Nothing may ever move behind a price.
2. **The printed glovebox pack from root.** Root has no checkout at all — keep it that way. The paper
   artifact is the one that works when the phone is dead, seized, or dropped, and it is the artifact a
   person in real trouble is least able to buy.
3. **The crisis path.** `PRX_CRISIS` / the 988 lines (`:686–694`, `crisis` `:677`) must never be
   gated, delayed, interstitialled, or shown after a purchase modal.
4. **The supervision warning** (`supOn`, `:677`) — see §2b.
5. **Language parity.** EN and ES must be identically free. Every new language ships free or does not
   ship. A cheaper Spanish tier would be the single most damaging thing this product could do.
6. **The privacy and hold disclosures** (`heldB`, `p1`–`p4`) — trust copy is not a feature.

**Legitimately paid — all of it is convenience over information:**

- Formatting and portability: PDF layout, wallet-card cut lines, courthouse directions, family-plan page
  (`dS`, `:676`).
- Bulk and institutional: the Organizations tiers ($149 / $499 / Enterprise, `:675`) — an org buying 25
  printed packs is buying logistics, not rights.
- The tip ($3, `:445`). The most honest revenue line in the build, and currently the least prominent.

**The test to apply to any future paid feature:** *if a user cannot afford this, are they less likely to
say the right thing during a stop?* If yes, it is free. Every item in the current paid set fails that
test in the safe direction — which means the free/paid line is, as built, correct. The problem this
round is entirely **placement and timing**, not what is behind the price.

### 2e. Two live checkout defects found while reading (verify before shipping either fix)

1. **The gift button cannot take money.** `giftDeep.onclick` (`:1633`) calls `openPay(title, '$6.99',
   desc)` with **no fourth argument**, so `_payProduct=null` (`:1506`). The button then renders as
   "Preview checkout — $6.99" (`:1509`) and `payNow` (`:1516`) skips the Stripe branch entirely and
   lands on "Preview complete — no charge was made" (`payOkT`, `:677`) with `payOkSub` still asserting
   "Payments aren't live yet". Every other buy button passes a product (`:1535–1537`). Note the fix is
   *not* simply appending `,'deep'`: there is no gift-link fulfillment anywhere in the repo, so charging
   $6.99 for a gift the buyer cannot deliver is worse than the current dead button. Smallest honest
   diff: hide `giftDeep` until gift fulfillment exists.
2. **`payDemo` now over-claims on the fallback path.** The bank string is "Secure checkout by Stripe —
   Amparo never sees your card details" (`:677`), correct for the real path. It is also displayed on the
   preview/503 fallback and on the gift flow, where Stripe is never contacted. Same class as the
   v2.25.0/2.26.0 honesty sweeps.

---

## 3. The feedback widget as a design surface

**Verified reach.** The widget is a Sentry feedback dialog, lazy-loaded on tap (`openFeedback()`,
`arena/index.html:1278–1284`, with a `mailto:` fallback if the bundle is blocked). Its **only** arena
entry point is the footer link "Send feedback" (`fbLink`, `:529`, `:1631`); root's is the equivalent
footer button (`index.html:1710`). So "on every screen" today means *in the footer of every screen* —
a user must scroll past the entire practice surface to reach it. Name and email are optional (v2.26.0).

That placement is the constraint worth designing around: the current widget can only ever catch users
motivated enough to go hunting. Every proposal below is about adding **one** contextual, dismissible
entry point, not a second widget.

**Highest-signal moments to invite feedback — ranked, structure only:**

1. **After a swan finish.** The swan modal is already stripped of score, upsell and confetti
   (`:1392–1396`), leaving a card with genuine empty space. It is also the moment where the product's
   pedagogy is most likely to have landed wrong — "there is no winning line here" either reads as honest
   or as abandonment, and nothing in the build currently distinguishes those two outcomes. One quiet
   link in the space the upsell vacated is the single highest-value addition in this document.
2. **After a run containing a freeze-timeout** (`:1209`). A freeze is the product's own diagnostic that
   the pacing beat the user. Whether that is useful stress or too much is unanswerable from telemetry
   and trivially answerable by asking. Offer it once per session, never twice.
3. **After a free-text miss that the user believes was correct.** The retry card at `:1367` already
   renders a "Say it once, out loud" input plus a no-penalty retry. Given §1 item 4 and wargames/30
   §3c's matcher findings, a "this should have counted" link on that card would be the cheapest
   possible matcher-corpus feedback channel. Structural caveat: it must submit *the user's typed line
   and the beat id*, and nothing else — see the privacy note below.
4. **On the held-door card.** The lock alert (`:1104`, `heldB`) is currently a terminal dead end: the
   user is told content is withheld and has nowhere to react. "Tell us you needed this one" turns a
   refusal into a demand signal.

**Where inviting feedback would be tone-deaf — do not instrument these:**

- **Anywhere in the crisis path.** If the 988 lines have fired (`:686–694`), the user has been routed to
  a human crisis service. Interrupting with a product survey is the worst thing in this list. Hard
  suppress for the remainder of the session.
- **Inside the supervision gate, or on any screen for `A.sup === true` users while the standing warning
  is showing** (`:1167`). Same reasoning as §2b: this cohort is being told their rights are narrower
  than the product's default coaching. That is not a moment for "how are we doing?"
- **Mid-run, at any point.** Between the officer's line and the user's answer is the one place the
  product has deliberately built time pressure. Any interruption there both breaks the rehearsal and
  makes the clock a lie.
- **On the physical-safety interstitial** (`safeT`/`safe1`–`safe5`, `:677`). It is the most
  consequential screen in the arena and should carry exactly one action.
- **Immediately after a purchase.** A "how was checkout?" prompt following a $6.99 charge on a safety
  product reads as a receipt-time upsell of goodwill. Wait for the next session.

**Two structural rules regardless of placement:**

- **At most one contextual invite per session**, in addition to the permanent footer link. Two makes the
  arena feel like it is surveying rather than training.
- **The invite must not prefill anything the user did not type.** The Sentry integration is already
  configured with `sendDefaultPii:false`, no replay, `ui.input` breadcrumbs dropped, and `event.user`
  deleted (v2.26.0). Any contextual invite that attaches practice context must attach *only* a beat id —
  never the scenario transcript, never `A.sup`, never the state. `A.sup` in particular is a
  criminal-justice-status disclosure and must never leave the device by any path.

---

## 4. Two trainers — smallest concrete next step

**Nothing has shipped.** Re-verified this round: root/app contain zero reads of `amparoArena`
(`index.html:3685` is a comment); the arena contains zero reads of `amparo_prx` (`grep -c` = 0). It
reads only `amparoGuidedFlow` (`:1056`) and `sr_save` (`:1062`) for the state handoff.

**wargames/30 §4's unverified flag is now resolved.** `amparo_prx`'s shape, read at
`index.html:5166–5184`:

```
{ done:{levelIdx:true}, best:{levelIdx:'n/m'}, runs:{levelIdx:n},
  streak:{last:'', n:0}, miss:{ci:n} }
```

with a v1 flat-shape migration at `:5170` and a level-index migration at `:5185+`. Both halves of the
sketch are therefore wirable as written.

**Smallest next step — do one half, root side, one file, ~4 lines.**

The arena's `A` shape (`arena/index.html:1040`) is stable and already validated on load, so root reading
it is the lower-risk direction, and root's hub card that links to the arena already exists at
`index.html:3687–3691` with an unused `pr-st` slot on it (`:3690` currently holds a static subtitle).
Append one line of pure numerals to that card:

```js
// beside the existing hub_arena card render
let ar=null; try{ar=JSON.parse(localStorage.getItem('amparoArena'))}catch(e){}
const arDone=ar&&ar.done?Object.keys(ar.done).length:0;
// if arDone>0, append to the card: `${arDone} drills · ${(ar.streak&&ar.streak.n)||0}-day streak` (+es twin)
```

Counts and existing nouns only — no legal content, no `TODO_ATTORNEY` needed. **The moment any wording
implies preparedness ("you're ready for…"), that sentence becomes a `TODO_ATTORNEY` slot** per
wargames/03; readiness claims are coaching content.

Do **not** ship the arena→root half in the same change. Root's `prx` carries a migration path and a
`miss` map the arena has no analogue for; one direction at a time keeps the failure surface to a single
`try/catch`. Everything further (P1 attorney-pile convergence, P3 variant porting) stays sequenced
behind this per wargames/29 §4.

**Design caution that arrives with it:** the arena's `done` count is the same quality-blind key count as
§1 item 2. Surfacing it in root propagates a number that already overstates readiness onto a second
surface. Either fix item 2 first, or label the root line as *drills attempted*, never *drills passed*.

---

## 5. Verification log

- CHANGELOG v2.26.0 and v2.25.0 read; `notebook/amparo-accounts-payments-plan-2026-08-19.md` present
  (355 lines).
- Arena source (1664 lines): streak IIFE `:1049–1053`; `HELD_SITS`/`TOTAL` `:1045–1046`; readiness
  `:1112`/`:1539`; heat `:1351` + callers `:1209`,`:1214`,`:1475`,`:1481`; matcher v3 `:1463–1481`;
  swan `:1124`, gate `:1152–1159`, finish suppression `:1387–1396`; modal markup `:593–621`; sidebar
  pack card `:477–482`; menu tip `:445`; checkout `:1503–1537`; gift `:1633`; feedback `:1278–1284`,
  `:529`, `:1631`; supervision `:1167`, `:1612–1613`, `:1620`; `applyLang()` init `:1661`.
- Grep counts run this round: `p:0,g:0` = 13, `p:0,g:1` = 0, `v:[` = 0, `branch:true` = 1,
  `amparo_prx` in arena = 0, `amparoArena` reads in root/app = 0 (one comment).
- Root: curveball seed `:5145–5147`; `prx` shape `:5166–5184`; `PRX_UNSCORED` `:4731`; hub arena card
  `:3687–3691`; no purchase surface anywhere (`grep` for `CHECKOUT_URL|openPay|6\.99|3\.99` → empty).
- Convex: `stripe.ts` price table `:15–19`, `createCheckout` `:21` (no client caller found),
  `guestCheckout` `:57`, webhook `:88`; `http.ts` `/checkout` routes `:39,:45`.
- **Unverified:** legal accuracy of any line (attorney's job); whether live-mode Stripe keys are set in
  Convex env (operator-side, not in repo); whether the 198 audio files cover all SCEN lines; user-facing
  behaviour of the swan `confirm()` on iOS Safari (read, not run); the claim in §2c that no other
  purchase-frequency logic exists is a `grep`-negative, not an execution trace.
