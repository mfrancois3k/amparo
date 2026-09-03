# Focus group 26 — the grand audit: fifty-one states in the product, one screen nobody can reach, and two states on one screen

**Standalone run, 2026-09-03 (second pass, 11:12).** Follows
`amparo-focus-group-24-accounts-payments-feedback.md` (FG24) and
`amparo-focus-group-25-apple-design-polish.md` (FG25). Neither is re-litigated: FG24's
account/payment/feedback findings (six false "no account" strings, one-way pack upload, no
refund policy, open `/checkout`, "anonymous" feedback, supervision cohort sold to) and FG25's
motion findings (chained overlay fades, sub-44px dots, lifeline analytics event, safe-area on
overlays) are referenced only where today's change touches them. FG22's arena goldens
(supervision banner, matcher, firearm constants) are lineage, not re-counted.

**This file supersedes the 06:13 version of itself.** A first version of this report was
written at 06:13 against the same commit; between then and 11:12 the working tree changed
under both audits (the Spanish bank was regenerated in *usted*, the panic label was fixed,
`nameEs` was added, English leaks and *Detente* were removed). Every claim below was re-read
against the tree as it stood at **11:12** — where the 06:13 version's findings have already
been fixed in the working tree, §0 says so and they are **not counted**. Two structural
findings the 06:13 version missed (goldens #2 and #3) are new.

**Build under test.** `main` @ `1a46f8d` (2026-09-02, *"feat(engine): jurisdiction data
layer, idempotent Stripe fulfilment, Panic HUD, Armor card, Arena ladder"*) **plus 122
uncommitted modified files** (`git diff --stat`), of which the ones that matter here and
their mtimes: `arena/index.html` 11:09:10 (2,214 lines), `data/hud.json` and
`app-src/src/content/hud.json` 11:08:56 (identical by `diff -q`), `hud-ui.json` 11:08:56,
`tools/jurisdictions/hud.mjs` 11:08:35, `app-src/convex/lib/armorCard.ts` 11:11:06,
`app-src/src/components/panicHud/model.ts` 11:11:06, `new/index.html` 06:12:54, plus a
drafted v2.28.0 `CHANGELOG.md` entry that names this report by path. All `arena/index.html`
line numbers are from the 2,214-line file; they moved +7 mid-audit and were re-anchored.

**Method.** Direct read/grep only, no live browser (FG19–25 precedent). Read in full:
`new/index.html` (1,119), the Arena's sidebar, completion modal, ladder, checkout and state
panel regions, `app-src/src/App.tsx`, `components/panicHud/{PanicHud.tsx,PanicButton.tsx,
model.ts,panicHud.css}`, `content/hud-ui.json`, `convex/lib/{armorCard,plan,products}.ts`,
`convex/{stripe,fulfillment,schema}.ts` (targeted), `tools/jurisdictions/hud.mjs`
(templates), `hud.test.mts`, `sw.js`, `app/sw.js` (precache list), `vercel.json`,
`.vercelignore`, `new/aid.html`, `new/rehearse.html`. `data/hud.json` was queried with Node
for aggregate facts. Attorney/lawyer review is excluded as a finding per standing
instruction; it is mentioned only where a UI string makes a claim about it.

**Seating (ten, one per axis in the brief).** Spanish-first → Rosa (GA); DACA/prepaid → Luis
(TX); parent/buyer → Dana (TX); retiree → Tony (GA); non-driver → Wes (Brooklyn); teen →
Devin (TX); rideshare → Keisha (Atlanta); PTSD → Nia (NY); low vision/screen reader → Omar
(Phoenix); concealed-carry → Ray (rural GA). Marisol (NY) and Ana (AZ) do not hold §1 seats;
they read their own state's regenerated Spanish in §6.

---

## 0. What is actually new, verified — and what the working tree already fixed

| Claim in the brief | Verified | Where |
|---|---|---|
| Homepage CTAs "Enter The Arena" → `/rehearse`, "Need real-world help?" → `/aid` | TRUE | `new/index.html:368,384,432,899,969`; `vercel.json` rewrites `/rehearse`→`/arena/index.html`, `/aid`→`/new/aid.html` |
| Price line names a $9.99 Master Script + $19.99 mailed laminated card | TRUE | `new/index.html:481` (EN), `:595` (ES) |
| Arena "Your state" panel: 51-state select, provisional notice, ~9 lines with cites from `/data/hud.json`, collapsed by default on phones | TRUE | `arena/index.html:575-580`, `:2157-2211`; phone default `:2191` (`matchMedia('(min-width:861px)')`) |
| Completion modal: badge ("You survived Hard Mode" / "Clean run"), metrics line, ladder (Master pre-selected, "Add Physical Armor" +$10, US only) | TRUE | `arena/index.html:716-749`, `:816`, `:1652-1654` |
| `PAYMENTS_LIVE=false`; checkout is a preview | TRUE | `arena/index.html:1791`; button reads *"Preview checkout — $19.99"* (`:1967`) |
| `/app`: fixed "Pulled over now" button on every screen, full-screen black HUD, 30px/22px type, gold cites, provisional band, `?panic=1&state=XX` | TRUE | `App.tsx:64-66,205-210`; `PanicHud.tsx:79-106`; `panicHud.css:5,19,26-27,32` |
| `hud.json`: 51 states × ~9 bilingual lines, every state carries the notice, none attorney-reviewed | TRUE — 423 lines; 8 core ids ×51, `reason` ×4, `footage` ×11; verdicts VERIFIED 258 / UNASSESSED 117 / NULL 32 / REFUTED 8 / LIKELY 6 / CASE_LAW_ONLY 2; `review.attorney` true: **0** | Node over `data/hud.json` at 11:08 |
| Armor card 3.5×2in; state law only for attorney-reviewed states, otherwise federal lines + lifelines + notice | TRUE | `armorCard.ts:35,103-110`; `ATTORNEY_REVIEW = Object.freeze({})` in `overlays.mjs:29` |

**Fixed in the working tree between 06:13 and 11:12 — not raised below.** The HUD's UI
strings are now *usted* and the button reads *"Me está parando la policía"*
(`hud-ui.json`, `hud.mjs:334-340`); the whole `hud.json` bank was regenerated in *usted*
(Node at 11:08: residual tú verb forms **0**; *Detente* **0**, now *Deténgase*); English
inside Spanish `footage` lines is gone (7 → **0**) and `hud.test.mts:192` now asserts it;
every state carries `nameEs` (51/51; `model.ts` and `armorCard.ts:97` read it); the Arena
state panel defaults closed on phones (`:2191`); `.sideT`/`.fine`/`#spLines .c` were
darkened past 4.5:1 (`:312,:384,:409`); Arena font `src` paths were made root-absolute (they
404'd under `/rehearse`, so "Enter The Arena" served fallback fonts until today);
`new/aid.html` heading order; homepage `#deal` ARIA; `.github/workflows/tests.yml`;
`.gitattributes`. Credit where due: the Spanish fix moved fastest of anything in this series.

---

## 1. Ten persona reactions

### 🧑 Rosa, 44 — GA, Spanish-first, house cleaner, son 17 drives

The button my son would need finally says what a person says: *"Me está parando la policía"*,
and it speaks to me as *usted* (`hud-ui.json`). Then I open the Arena in Spanish and the new
box says **TU ESTADO**, *"Elige un estado"*, *"Sobreviviste"* (`arena/index.html:826-827`)
inside a page that says *"Su práctica"* and *"Dígalo"* — one screen, two ways of addressing
me. Georgia line two: hand over *"licencia, registro y seguro"*; line five: *"ningún
registro"* — same word for the paper and the search, on 102 lines across 51 states (Node).
**Where I stop:** the $19.99 card prints in one language per order (`plan.ts:48`,
`armorCard.ts` takes a single `lang`) while the $9.99 Master Script it comes with is *"en
los dos idiomas"* (`:831`) — and my son could not reach the black screen anyway, because no
page on amparohq.com links to `/app` (golden #1).

### 🧑 Luis, 27 — TX, DACA, warehouse, older Android, prepaid data

The Texas Spanish reads clean now — *"Deténgase ahora"* is stiff (I'd say *oríllese*) but it
is one register and no English (`hud.json` TX). The Arena I can reach fetches
`/data/hud.json` live (`:2157,:2203`); the root worker skips `/arena/` entirely (`sw.js:62`)
and never stores JSON (`sw.js:104` is fetch-then-cache-match with no `put`), so with no bars
the state box is simply absent — the code says so (`:2149-2154`). The surface that keeps the
lines offline is `/app` (`app/sw.js` precaches `PanicHud-Dv6vVpuu.js`), which nothing links
to and which calls itself *"Preview build"* (`App.tsx:130`). **Where I stop:** the card wants
my address at Stripe (`stripe.ts:29`) and again at the printer (`fulfillment.ts:33`); the
schema swears it never stores it (`schema.ts:52-57`) and I believe that — two companies still
hold "Amparo" next to my door. No.

### 🧑 Dana, 52 — TX suburb, the parent who would actually pay

The homepage tells me the laminated card exists: *"a mailed laminated card ($19.99)"*
(`new/index.html:481`). The Arena tells me *"Preview checkout — $19.99"* and then *"Payments
aren't live yet"* (`:1791,:1967,:1988`). The note under the checkbox promises *"your state's
own lines print on it once its attorney review is done"* (`:821`) — read plainly, *we'll send
the real one later* — and there is no later: `orders` holds no email or address
(`schema.ts:64-74`), `fulfillment.ts` exports `dispatch` and `retryOpen` only, `grep -ri
"reprint|resend|reship" app-src/convex` = 0. If Devin buys without a state picked, it ships
as a `'US'` card with no warning (`:1977` sends `state:A.state||undefined`; `plan.ts:47`
falls to `'US'`). **Where I stop:** "flaky" is a product that advertises a card it cannot
sell and implies an update it cannot send.

### 🧑 Tony, 61 — GA, retired postal worker

They named a laminated card **"Physical Armor"** (`products.ts:37`, `:733`). A card won't stop
a bad cop — I have said it every round — and now the product says it will, in the product's
own name, while the back of that card says no Georgia lawyer has read it. The Georgia lines
themselves are better than I expected: 16-11-137, 16-11-62(1), 40-8-91(f), 50-18-96, real
cites I can look up, and *"checked against the statute text"* instead of pretending. Keep
that voice. The homepage calls two prices *"the whole business model"* (`:481`); the Arena
also has a $3 tip (`:557,:2012`) and $149/$499 organisation packs (`:805`). **Where I stop:**
*"You survived Hard Mode"* for three calm answers on a faster clock (`:1652`, gated only on
`A.pressure`, set by the replay button `:1686`) — the level actually called *🏆 Hard mode*
(`:1210`, index 3) is a swan level (`:1324`) that never awards it.

### 🧑 Wes, 38 — Brooklyn, does not drive, enters sideways

The nav has three doors with three names. **Practice** → `#arena` (`new/index.html:732`),
which is the first scroll "encounter" scene, not a practice module (`:903`). **Rehearse** →
`/new/rehearse.html` (`:733`), a page titled *"Hands first. Words second."*
(`rehearse.html:211`) whose only links are `index.html` and `aid.html` (`:148-149`) — it never
leads into the Arena. **Enter The Arena** → `/rehearse` → the Arena (`vercel.json`). I reach
the HUD by typing `/app/?panic=1` because I read the comment (`App.tsx:64`). No state saved,
so it reads *"Federal baseline, any state"* and *"Pick your state"* — and there is nothing to
pick with: `PanicHud.tsx` renders a title, a Close button, the list and the notice, no
`<select>`; the strings `ui.yourState`/`ui.pickState` sit unused in the bank (grep in
`app-src/src` = JSON only). **Where I stop:** a panic screen telling me to do something it
gives me no control for.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user

The badge is the first thing on the results screen (`:719`) and I want it. I got *"You
survived Hard Mode"* on Calm with the fast clock; when I actually beat 🏆 Hard mode, nothing
(`:1324`, `:1652`). Under it, *"1 / 21 scenarios"* after one level — those are levels, not
scenarios (`metrics` `:816`; `TOTAL` sums `levels` `:1240`). The gate says my scripts aren't
tuned and offers *"Finish setup →"* (`:570`, `href="../"`), which from `/rehearse` resolves to
`/` — the scrollytelling homepage (`vercel.json`: `/` → `new/index.html`), not the builder at
`/pack`. **Where I stop:** the number makes my one finished drill look like 5%, and the button
that promises setup plays me a movie.

### 🧑 Keisha, 34 — Atlanta, rideshare, thirty seconds between fares

Finish a drill, one hand, engine running: badge, metrics, ring, path, key phrases, weakest
moment, hook, three bullets, a $9.99 row, a +$10 checkbox, a buy button, a note, a held Deep
Pack with a peek grid — **then** *"Practice another scenario"* (`:716-749`) inside a 430px
modal that scrolls (`:388`, `max-height:88vh`). The card I'd buy prints
`amparohq.com/rehearse?state=GA` (`armorCard.ts:98`); on my phone that URL opens the Arena
with the state panel **collapsed** (`:2191`) — the card's own link hides the lines behind
"Show". The black HUD has no number on it: zero `tel:` in `PanicHud.tsx`; `/aid` has 911/988
(`aid.html:150`), the card back has three lifelines (`armorCard.ts:99`). The phone-collapse
itself is the right call — thank you. **Where I stop:** at a stop the product gives me the
stop's paperwork, not the screen.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD

A gold pill reading **"Pulled over now"** is now fixed to every screen of `/app`, welcome page
included, and nothing hides it (`App.tsx:205`, no setting). I came to read a checklist and
the product keeps a panic switch under my thumb. The HUD itself is the calmest surface in the
product: black, a 120ms fade that reduced-motion removes (`panicHud.css:15`), Escape and Back
close it, focus goes back where it was (`PanicHud.tsx:33-75`). It is the non-simulated route I
asked for in FG22 — and the one nobody can find. Its last block, gold, is the provisional
notice (`css:32`, `margin-top:auto`); at 22–30px type it sits below the fold, so the sentence
that lets me calibrate arrives last. **Where I stop:** the results modal offers five next
steps and none is *find real help* — `grep /aid arena/index.html` = 0.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

The new thing is the most accessible thing in the product: `role="dialog"`,
`aria-modal="true"`, `aria-labelledby`, a real Tab trap, Escape, Back, focus restored
(`PanicHud.tsx:33-79`), `aria-haspopup="dialog"` on the trigger (`PanicButton.tsx:20`), and
`LangProvider` sets `document.documentElement.lang` (`:30`). Then the Arena: `<html
lang="en">` and nothing ever changes it (`documentElement.lang` = 0, `lang="es"` = 0 in 2,214
lines) — my reader speaks the Spanish Arena in English phonetics, while `pack.html:2535` and
`new/index.html:688` both do it right. The select is `aria-label="Your state"` in English
forever (`:577`, the only `aria-label` in the file); the Show/Hide button has no
`aria-expanded` (0); the completion and pay modals are `div.modalBg` with no `role` or
`aria-modal` (0), so the page underneath keeps reading; the pre-selected ladder row is a
`<label>` around a decorative dot and no input (`:732`). On `/app` the 56px button at
`bottom:16px` (`css:5`) sits over 40px of page padding (`shell.css:8`) — on top of *"Tell
us"* at the end of every screen. **Where I stop:** the dialog I'd trust is the one I can't
reach; the one I can reach isn't a dialog.

### 🧑 Ray, 58 — rural GA, concealed-carry permit

For the first time the product says something to me: *"No duty to disclose a firearm here,
and the officer can't detain you just to check your carry status (16-11-137)"* — posture
`inverse`, verdict `VERIFIED`, under the provisional banner (`hud.json` GA `firearm`). FG22
golden #5 flagged the Arena's firearm lists as unverified constants (`:1262-1265`, still
"kept as data, never rendered"); this one carries a cite and a verdict. All 51 states now
carry a `firearm` line, so the roster's "do not chase Ray" boundary has been crossed as data
rather than as a drill (`.focus-group/members.md`). I note it; I don't argue it. **Where I
stop:** `STATE_LINE_IDS` puts `firearm` on the card (`armorCard.ts:53`) behind the review
gate (`:103`), and zero states pass it — so the $10 buys a card that leaves off exactly the
line I would carry.

**Tally.** Zero unconditional yeses. Conditional: Tony, Dana, Ray, Keisha, Nia, Omar (each
names something genuinely good in the same breath — the Georgia cites, the HUD's a11y, the
calm black screen, the phone-first collapse, the usted Spanish). No: Rosa, Luis, Wes, Devin.
Every "no" traces to one of three roots: the HUD cannot be reached; the Arena's doors and
state do not agree with each other; a paid artifact promises more than it prints.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The headline safety feature is unreachable — and, once reached, is not yet a roadside screen

**Evidence — reachability.** `PanicButton`/`PanicHud` mount only in `app-src/src/App.tsx`
(`:205-210`), built to `/app`. `grep -rl 'href="/app|amparohq.com/app|panic=1'` over every
`*.html`/`*.xml`/`*.json` outside `app/`, `app-src/`, `node_modules/` = **0**; `panic=1`
elsewhere = the `App.tsx:64` comment, `CHANGELOG.md`, `docs/engine/PLAN.md`, this report.
`new/index.html` has no "pulled over" control (its only hits are a demo caption `:445` and a
card title `:531`). `/app` renders *"Preview build. The live app is at amparohq.com"*
(`App.tsx:130`). The comment at `App.tsx:64` says the deep link exists for *"the printed card
and the homepage link"*: the card prints `amparohq.com/rehearse?state=XX` (`armorCard.ts:98`)
and the homepage has no such link. The HUD's state comes from `/app`'s own `app_save`
(`App.tsx:54`, `storage.ts:203`), not the live builder's `sr_save`; `readRootSave()`
(`storage.ts:94`) exists and is not used here.

**Evidence — structure.** `model.ts` `ORDER = ['silence','documents','search','sign',
'passenger','firearm','recording','unmarked','reason','footage']`: the first thing a driver
reads is *"You can stay silent."* No line says hands on the wheel or phone on the dash; those
strings exist in the Arena (`safe1`–`safe5`, `:807`, e.g. *"Hands visible on the wheel — 10
and 2 — before the officer reaches you"*) and on the homepage (*"Hazards on. Engine off. Hands
at 10 and 2."*, `new/index.html:531`) and are not reused. `reason` and `footage` (*"Ask for
the body-cam footage soon…"*) render inside the same list titled *"Right now"*. No `tel:`
(0). No state picker (no `<select>`; `ui.pickState` unused). The notice is the last element
(`panicHud.css:32`, `margin-top:auto`).

**Impact.** Highest by a distance. Every persona's best moment this round — Luis's offline
chunk, Nia's calm screen, Omar's real dialog, Rosa's fixed button — is on a surface a user
cannot navigate to. The commit, the CHANGELOG draft and the plan all describe the HUD as
shipped; from the front door it does not exist.

**Cheapest fix that holds.** (a) Two links, no new code: a "Pulled over now / Me está parando
la policía" control on the Arena `.top` bar and in the homepage hero's secondary row, opening
`/app/?panic=1&state=<state>` (the Arena already knows `A.state`, `:2163-2168`); (b) the
card's practice URL (`armorCard.ts:98`) becomes the HUD deep link, or prints both; (c) in
`model.ts`, prepend a `safety` group built from the Arena's `safe2`/`safe4` (route them
through `hud.mjs` so `/app` keeps its no-authored-strings rule), split `ORDER` into `now`
and `later` with a heading, append `lifelinesFor(code)` (already written,
`fulfillment.ts:53`), add a `<select>` over `Object.keys(bank.states)` in the header, and
move the notice to a one-line chip in the kicker. Longer term the Arena already loads the
same bank (`:2157`); a fixed black `<div>` reusing its `line()` builder (`:2169-2179`) gives
the reachable surface the HUD without React.

### 2. The Arena keeps two different "your state" on one screen, and the new panel talks to neither the drills nor the printed card

**Evidence.** Two variables, two encodings, no bridge. `flowState` is a **FIPS** code read
once at load from `amparoGuidedFlow` or mapped from `sr_save` (`:1249-1259`); it drives the
sidebar label (`:1267`), the setup gate (`:1268`), the scene line (`:1368`), the
duty-to-inform/stop-and-identify warnings (`:1374-1375`) and the printed wallet card
(`:2095`). `A.state` is a **postal** code resolved from `?state=`, the arena save, or
`sr_save` (`:2163-2168`); it drives only the new panel (`:2180-2200`) and the checkout
metadata (`:1977`). Picking a state in the panel writes `A.state` and re-renders the panel
(`:2201`) — nothing else on the page changes: the label still says *"NOT SET — tap change"*,
the gate still shows, the drills still say *"Federal core rights apply"*, and the wallet
card prints without a state. `CITED = ['36','48','13']` (`:1261`) — NY, TX, GA — decides
whether the label says *"(Statute Law)"* or *"(Federal rights)"*, so for 48 states the
sidebar reads **"ARIZONA (Federal rights)"** directly above a panel listing seven verified
Arizona cites. Nothing writes back: `sel.onchange` touches `A` only; `sr_save` and
`amparoGuidedFlow` are read, never written (`grep setItem` = `LSA`, `ENT_KEY`, `sr_lastZip`
only). And the card's own deep link, `?state=XX`, lands a phone user on a **collapsed**
panel (`:2191`).

**Impact.** Ana's whole persona is this screen; Dana's `'US'` card is its purchase-side
symptom; Devin's "Finish setup" loop (golden #3) is its navigation-side symptom. The product
now holds four state stores across four surfaces (`amparoGuidedFlow`, `sr_save`,
`amparoArena.state`, `app_save`) with no owner.

**Cheapest fix that holds.** One resolver, one encoding. Derive `flowState` from `A.state`
via the inverse of `P2F` (`:1255`) inside `render()` and re-run `renderSide()`/`renderArena()`
after `sel.onchange`; replace `CITED` with `HUD.states[code]` having any `cite` — the bank
already knows; make `?state=` open the panel (`A.spOpen=true` when the URL carried a state);
print the panel's lines on the wallet card (`:2095`) instead of the three-state stub. Then
decide the store precedence once and write it in `docs/engine/PLAN.md` (BS-2).

### 3. Every door out of the Arena opens onto the wrong page — a regression from the 2026-08-28 route swap

**Evidence.** Four links in the Arena are `href="../"` — the *Setup* crumb (`:545`), *⚙
change* (`:565`), the gate's *Finish setup →* (`:570`) and *🖨 Print free glovebox pack*
(`:599`). When the Arena lived under `/arena/` beside the root pack builder, `../` was the
builder. Since `7297ed4`/`5793d81`, `/` is rewritten to `new/index.html` and the builder
moved to `/pack` (`vercel.json`: `/` → `/new/index.html`; `/pack` → `/pack.html`;
`/index.html` → 302 `/pack`). From `/rehearse` and `/arena/` alike, `../` resolves to `/`:
the scrollytelling marketing page. No JS rewrites those hrefs (grep `/pack` in the Arena =
0). The completion modal's exits are ordered badge → metrics → ring → path → recap → weakest
→ hook → `.mList` → `.ladder` → `.deep` → *Practice another* → *Replay under pressure* →
*Remind me* → *No thanks* (`:716-749`); none is *find real help* (`/aid` in the Arena = 0).
On the homepage, nav *Practice* is an in-page scene (`#arena`, `:732` → `:903`), nav
*Rehearse* is `/new/rehearse.html` (`:733`) — a different page from `/rehearse`, sharing the
word, linking only back to `index.html`/`aid.html` (`:148-149`).

**Impact.** The setup gate exists to fix golden #2's "state not set" state and sends the
user to a page that cannot set it. Keisha, Devin, Wes each hit a different door; all three
land somewhere with no state picker and no drills.

**Cheapest fix that holds.** Four `href="../"` → `href="/pack"` (one `sed`); one `/aid`
button in the completion modal above `.mList`; `mAgain`/`mPressure` moved above `.mList`;
nav *Practice* and CTA *Enter The Arena* collapse to one label and one target; either
`new/rehearse.html` links into `/rehearse` or the nav entry goes.

### 4. The paid artifacts promise more than the preview can sell and more than the card can print

**Evidence.** Homepage: *"Inside the Arena there is one optional Master Script ($9.99) and
a mailed laminated card ($19.99): that is the whole business model"* (`new/index.html:481`);
Arena: `PAYMENTS_LIVE=false` (`:1791`), *"Preview checkout — $19.99"* (`:1967`), *"Payments
aren't live yet"* (`:1988`), plus a $3 tip (`:557`) and $149/$499 organisation packs
(`:805`). Ladder note: *"Your state's own lines print on it once its attorney review is done"*
(`:821`, ES `:832`) with no reprint or notify path (`schema.ts:64-74` has no email/address by
design, `:52-57`; `fulfillment.ts` exports `dispatch`/`retryOpen`; grep `reprint|resend|
reship` = 0). Checkout sends `state:A.state||undefined` (`:1977`); `plan.ts:47` maps a
missing state to `'US'`; `ladderLabel()` (`:2000-2004`) never checks `A.state`. One `lang`
per order (`plan.ts:48`) → `armorCardHtml({lang})`, while the Master Script in the same
bundle is *"both languages"* (`:820`). Today's back face for all 51 states: state name, the
notice paragraph, up to three lifelines, *"Practice it: amparohq.com/rehearse?state=XX"*
(`armorCard.ts:109-110`); the product is *"Physical Armor"* (`products.ts:37`).

**Impact.** Dana's dispute, Rosa's two-reader household and Tony's objection to the noun are
the commercial, mission and trust versions of one gap. It becomes a support event the day
`PAYMENTS_LIVE` flips (BS-5).

**Cheapest fix that holds.** (a) Homepage price line says *"coming"* or names the preview
until live; (b) `ladNoteArmor` in present tense only; (c) `#ladArmor` disabled with CTA
*"Pick your state first"* while `!A.state`, and `/checkout` refuses `armor` without a valid
`state`; (d) `armorCardHtml` gains a bilingual back (the free pack already prints EN/ES
pairs, `pack.html:3740`) or one language per face; (e) rename to the CHANGELOG's own phrase,
*"laminated glovebox card"*.

### 5. On the one screen that sells, the small things are wrong: a badge named after a level that cannot award it, "scenarios" that are levels, a modal that is not a dialog, and Spanish that changes register mid-page

**Evidence.** `badgeHard` requires `A.pressure` (`:1652`), set only by the pressure replay
(`:1686`) of the *current* level; the level named *🏆 Hard mode* (`LVL` index 3, `:1210`) is
a swan level (`isSwanLvl`, `:1324`) where badge and metrics are hidden (`:1654`). `metrics`
says *"{d} / {t} scenarios"* (`:816`) with `t = TOTAL` = 21 **levels** (`:1240`).
`role="dialog"`/`aria-modal` in the Arena: 0; `<html lang="en">` never updated (0); the
select's `aria-label` is static English (`:577`); `spToggle` has no `aria-expanded` (0); the
base ladder row has no input (`:732`). Register: the Arena's own new strings are *tú* —
*TU ESTADO, Elige un estado, Sobreviviste, tu estado* (`:826-827,:832`) — inside a UI that
is *usted* everywhere else (Node over `UI.es`: 53 usted forms, 4 tú, all four today's); the
card face mixes *DÍGALO* with *Practica* and prints *"Portada por"* and *"Tu estado"*
(`armorCard.ts:47-51`); the bank's `documents`/`search` pair uses *registro* for both the
paper and the search on all 51 states (102 lines); 12 EN notices read *"a Alaska-licensed"*
(`hud.mjs:58`, AK AL AR AZ IA ID IL IN OH OK OR UT).

**Impact.** Devin, Tony and Omar each lose trust on this one screen for three different
reasons, and Rosa hears the product switch from addressing her to addressing her son. None
of this is expensive; all of it is on the screen where the money is asked for.

**Cheapest fix that holds.** Rename `badgeHard` → *"Clean under pressure"* / *"Sin errores
bajo presión"*; `metrics` → *drills* / *ejercicios*; `role="dialog" aria-modal="true"` plus
the 20-line focus/Escape handler from `PanicHud.tsx:33-75` on `.modalBg` open/close;
`document.documentElement.lang = A.lang` inside `applyLang()` (one line, as `pack.html:2535`
does); `sel.setAttribute('aria-label', T('spT'))` and `aria-expanded` on `spToggle` in
`render()`; `<input type="radio" checked disabled>` on the base row; the six *usted* strings
at `:826-832` and the three at `armorCard.ts:47-51`; *"registro del vehículo"* in the
`documents` template and *"revisión"* in the `search` template (`hud.mjs:152`), then
rebuild; *"an attorney licensed in ${name}"* at `hud.mjs:58`.

---

## 3. What must change in the practice modules / Arena flow (structure, not officer dialogue)

1. **One state, one encoding** (`:1249-1268`, `:2163-2206`): the panel's pick re-renders the
   sidebar label, gate, scene cites and wallet card; `CITED` retired in favour of the bank.
2. **Deep link opens the panel**: `?state=XX` sets `A.spOpen=true` so the card's URL shows
   the lines on a phone (`:2191`).
3. **Every `href="../"` → `/pack`** (`:545,:565,:570,:599`).
4. **Completion modal order** (`:716-749`): free next actions and a `/aid` button above
   `.mList`; ladder collapsed to one row until tapped.
5. **Badge and metrics vocabulary** (`:816,:1240,:1652-1654`): no badge may carry the name of
   a level it cannot be earned on; count what `TOTAL` counts.
6. **Dialog semantics on `#modal` and `#payBg`**: `role`, `aria-modal`, focus in/out, Escape;
   `html[lang]` follows `A.lang`; translated `aria-label`; `aria-expanded` on the toggle.
7. **Armor requires a state**: block the checkbox/CTA while `!A.state` (`:2000-2004`); refuse
   `armor` without `state` in `/checkout`.
8. **`ladNoteArmor` copy** (`:821,:832`): present tense only until a reprint path exists.
9. **Arena offline**: register a worker for `/arena/` or runtime-cache `/data/hud.json`
   (`sw.js:62,:104`); today the panel hides silently offline.
10. **One practice door**: nav *Practice* (`#arena`), nav *Rehearse* (`/new/rehearse.html`)
    and CTA *Enter The Arena* (`/rehearse`) become one label and one target.
11. **HUD structure** (`model.ts` `ORDER`, `PanicHud.tsx:89-106`): safety opener → state
    lines → lifelines → a separate *Later* heading for `reason`/`footage`; state select in
    the header; notice as a top chip; `padding-bottom ≥ 90px` on `.app-wrap` (`shell.css:8`)
    so the button never covers *Tell us*; a per-viewer hide for Nia.
12. **HUD reads the live pack's state**: fall back to `readRootSave()` (`storage.ts:94`) when
    `app_save` has none (`App.tsx:54`).

---

## 4. Missing features the personas expect that do not exist (each checked before claiming)

| Expected | Verified absent | Who |
|---|---|---|
| A state picker inside the Panic HUD | no `<select>` in `PanicHud.tsx`; `ui.pickState` unused (grep `app-src/src` = JSON only) | Wes, Ana |
| Any phone number in the HUD (911/988/lifeline) | `tel:` in `PanicHud.tsx` = 0; `/aid` (`aid.html:150`) and the card back (`armorCard.ts:99`) have them | Keisha, Rosa |
| A physical-safety opener in the HUD | `ORDER` starts at `silence`; Arena `safe1-5` (`:807`) and homepage `:531` not reused | Tony, Nia |
| A way into the HUD from any live page | `/app`, `panic=1` in site HTML/XML = 0 | everyone |
| A *find real help* exit from the Arena or the HUD | `/aid` in `arena/index.html` = 0; none in `PanicHud.tsx` | Nia |
| The panel's state reaching the drills, the gate and the wallet card | `sel.onchange` writes `A.state` only (`:2201`); consumers read `flowState` | Ana, Devin |
| A bilingual Armor card | one `lang` per order (`plan.ts:48`); the free pack prints pairs (`pack.html:3740`) | Rosa |
| A state gate before buying Armor | `:1977` sends `undefined`; `plan.ts:47` → `'US'` | Dana |
| Notify/reprint when a state becomes attorney-reviewed | no email/address column (`schema.ts:64-74`); grep `reprint` = 0 | Dana, Ray |
| A text-size control in the HUD | Arena has `setFs` (`:555`); HUD is px-only (`panicHud.css:19,26`) | Omar |
| A way to hide the fixed panic button | `App.tsx:205`, no setting | Nia |
| Forward the HUD's lines to family (WhatsApp/SMS) | no share in `PanicHud.tsx`; Arena share is a readiness PNG (`:2015-2030`); strategy is card-first WhatsApp (`SESSION-HANDOFF.md:79-88`) | Rosa, Marcus |
| Arena state lines offline | no SW for `/arena/` (`sw.js:62`); JSON never cached (`:104`) | Luis |
| A badge earnable on the level called Hard mode | swan level hides it (`:1324`, `:1654`) | Devin |

Not repeated from FG24 (still open there): refund policy, account deletion, purchase
suppression for `A.sup`, guest-purchase support process.

---

## 5. Blind-spot questions a top UX researcher would ask, not asked by the owner

**BS-1. The card exists because paper is safer than a phone at a stop — so what does a lit
phone with 30px type in the driver's hands look like from the officer's window?** The
Arena's own `safe2` says hands on the wheel before the officer arrives; the HUD asks the
driver to hold and read a device during the approach, with no first screen saying *phone on
the dash, hands on the wheel, then read*. Has anyone sat in a parked car at night with a
second person at the window and watched? Which artifact does the product want in the hand at
second zero — and if it is the card, is the HUD for the passenger, not the driver?

**BS-2. Which of the four state stores is "the" state, and who decided?** `amparoGuidedFlow`
(FIPS), `sr_save` (postal), `amparoArena.state` (postal), `app_save.state` — read by
different surfaces in different orders (`arena:1249-1259` vs `:2163-2168` vs `App.tsx:54`),
none written back to the others. Golden #2 is the visible symptom; the question is whether
a user who set a state anywhere should ever see "NOT SET" anywhere else, and what precedence
rule the PLAN would write down if asked.

**BS-3. From a locked phone, how many seconds is the HUD from a useful line, and does anyone
know?** Unlock → browser → a URL nobody links → chunk → button → (no state) → wizard. The
deep link was built for the printed card (`App.tsx:64`) and the card prints the Arena URL
(`armorCard.ts:98`), which opens a collapsed panel on a phone (`:2191`). The product has not
decided which door the physical artifact opens at the roadside. Measure it once against the
glovebox card, on the cheapest Android in the room.

**BS-4. Law is treated as 51 jurisdictions; Spanish is treated as one language — and the
register was decided this morning by regeneration, not by a written rule.** The bank flipped
to *usted* at 11:08; the Arena's new strings and the card are still *tú*; the homepage is
*tú* (57/13), `/aid` is *usted* (0/9). No line carries a note saying *usted, Mexican lexicon
(oríllese, ticket)* or *tú, Caribbean (párate, multa)*. Rosa in Georgia, Luis in Texas and
Marisol in New York would each correct different words in the same line (§6). Is one Spanish
acceptable, and if so, which — and where is that written so the next generator run keeps it?

**BS-5. When the first state flips `review.attorney`, what does Amparo owe the people who
already hold the pre-review card?** No email, no address, no reprint path — by design
(`schema.ts:52-57`) — and a ladder note that reads as a promise (`:821`). Has "the first
hundred Armor buyers" been thought through as a cohort before `PAYMENTS_LIVE` flips?

**BS-6. The surface users can reach loses its state lines offline; the surface they cannot
reach keeps them. Which one is the offline-first product?** `sw.js:62` excludes `/arena/`,
`:104` never caches JSON, the panel fails silently (`:2149-2154`); `/app` precaches the HUD
chunk. Luis's whole persona is this question, and the answer today is backwards.

**BS-7. The badge is the first reward attached to a police stop since the swan rule — what
does a sixteen-year-old who "survived Hard Mode" on the Calm level believe about himself
before his first real stop?** FG22 BS-5 asked what the readiness *number* should refuse to
claim; this is the *label*. Nobody has watched a teen read it.

---

## 6. Spanish residuals after this morning's regeneration — four Spanish-first readers

**Root causes first (fix once, rebuild 51):** the *registro* collision between the
`documents` and `search` templates (`hud.mjs:152` and the `documents` template); *Deténgase*
as the closing verb on `unmarked` (43 states; a car word is *oríllese* / *párese a un lado*);
the EN article at `hud.mjs:58`; the Arena's six *tú* strings (`:826-832`); the card's three
(`armorCard.ts:47-51`). Everything below is a translation of existing English, not a new
legal sentence.

| Reader | Line | Reads now (`data/hud.json` 11:08) | Fix | Why |
|---|---|---|---|---|
| Rosa — GA | `documents` | *"entregue licencia, registro y seguro"* | *"entregue la licencia, el registro del vehículo y el seguro"* | *registro* alone collides with the search line |
| Rosa — GA | `search` | *"No doy consentimiento para ningún registro."* | *"No doy consentimiento a ninguna revisión."* | *revisar* is what people say; removes the collision |
| Rosa — GA | `sign` | *"…y le permite irse (…). Negarse puede costarle esa liberación."* | *"…y hace que lo dejen ir. Si no firma, puede que no lo dejen ir."* | *liberación* reads as prison release |
| Rosa — GA | `unmarked` | *"Aquí se exigen distintivos (…). Deténgase."* | *"Aquí las patrullas deben ir identificadas (…). Oríllese de todos modos."* | *distintivos*/*Deténgase* are not car words |
| Rosa — GA | `recording` | *"la ley de escuchas aquí no lo alcanza"* | *"la ley de grabaciones aquí no lo prohíbe"* | calque of "wiretap law" |
| Rosa — GA | Arena `:826-827,:832` | *TU ESTADO / Elige / Sobreviviste / tu estado* | *SU ESTADO / Elija un estado / Sobrevivió el Modo Difícil / su estado* | the Arena speaks *usted* everywhere else |
| Luis — TX | `unmarked` | *"Que el oficial fuera identificable es una defensa ante un cargo de huida aquí, que se argumenta después (…). Deténgase ahora."* | *"Si lo acusan de huir, que el oficial no se identificara es una defensa, pero eso se pelea después, en la corte. Oríllese ahora."* | nobody parses the current sentence at 45 mph |
| Luis — TX | `documents` | *"Diga qué va a alcanzar antes de moverse."* | *"Avise qué va a sacar y de dónde antes de moverse."* | *sacar de la guantera* is the action |
| Luis — TX | Arena `ladArmorS` (`:829`) | *"…enviada por correo (solo EE. UU.)"* | add *"con su nombre y dirección en Stripe y en la imprenta"* | the sentence he needs before he taps |
| Marisol — NY | `recording` | *"(Penal Law §250.05 with §250.00(2))"* | *"(Penal Law §250.05 y §250.00(2))"* | English inside the cite |
| Marisol — NY | `search` | *"El olor a cannabis por sí solo no justifica un registro aquí"* | *"El olor a marihuana por sí solo no justifica una revisión aquí."* | *cannabis* is the statute's word, not hers |
| Marisol — NY | `sign` | *"Firme la multa si se lo piden."* | *"Firme el ticket (la citación) si se lo piden."* | *multa* is the fine, not the paper |
| Marisol — NY | Arena `ladArmorT` (`:829`) | *"Agregar Armadura Física"* | *"Agregar la tarjeta laminada"* | *armadura* is a suit of armour |
| Marisol — NY | Card (`armorCard.ts:47,48,51`) | *"Portada por"*, *"Tu estado"*, *"Practica"* beside *"DÍGALO"* | *"Portador/a:"*, *"Su estado"*, *"Practíquelo"* | *portada* is a cover page; one register per face |
| Ana — AZ | notice (EN) | *"…by a Arizona-licensed attorney"* | *"…by an attorney licensed in Arizona"* | grammar on a legal notice; 12 states (`hud.mjs:58`) |
| Ana — AZ | `silence` | *"dé su nombre completo verdadero (…). No se exige nada más"* | *"dé su nombre real y completo. No tiene que decir nada más"* | two stacked adjectives; passive-legal |
| Ana — AZ | `passenger` | *"un pasajero multado por su propia infracción"* | *"si al pasajero le ponen su propia multa"* | court language |
| Ana — AZ | sidebar (`:1267`) | **"ARIZONA (Federal rights)"** above seven verified AZ cites | one state source (golden #2) | the thing her persona exists to check, and the page contradicts itself |

Arizona is covered — eight lines, seven with verified cites — which is what Ana came to
check, and it passes. The `firearm` and `silence` lines in TX and AZ read right and need no
change.

---

## 7. Verification log

- Working tree at read time: `main` @ `1a46f8d` + 122 modified files; `arena/index.html`
  2,214 lines at 11:09:10 (grew 2,207 → 2,214 during this audit; every arena line number
  was re-anchored after the shift with a final grep at 11:12); `data/hud.json` 11:08:56;
  `hud-ui.json` 11:08:56; `hud.mjs` 11:08:35; `armorCard.ts`/`model.ts` 11:11:06;
  `new/index.html` 06:12:54.
- Node over `data/hud.json` (11:08): 51 states; 423 lines; ids `silence/documents/
  passenger/sign/search/firearm/recording/unmarked` ×51, `reason` ×4, `footage` ×11;
  verdicts VERIFIED 258, UNASSESSED 117, NULL 32, REFUTED 8, LIKELY 6, CASE_LAW_ONLY 2;
  `review.attorney` true: 0; `nameEs`: 51; ES lines with English tokens: 0 (was 7 at 06:13);
  *Detente*: 0 (was 43 states; now *Deténgase*); residual tú verb forms: 0; usted forms 523;
  lines containing *registro*: 102; EN notices with *"a"* before a vowel: 12.
- Grep-negatives (absence, not intent): `href="/app` / `amparohq.com/app` / `panic=1` in
  site HTML/XML/JSON outside `app/`, `app-src/`, `node_modules/` = 0; `role="dialog"`,
  `aria-modal`, `aria-expanded`, `serviceWorker`, `/aid`, `tel:`, `documentElement.lang`,
  `lang="es"` in `arena/index.html` = 0 each; `aria-label` in the Arena = 1 (`:577`,
  English); `/pack` in the Arena = 0; `<select>`/`tel:` in `PanicHud.tsx` = 0;
  `yourState|pickState` in `app-src/src/**/*.ts(x)` = 0; `reprint|resend|reship` in
  `app-src/convex` = 0; `pulled over|panic|ahora mismo` as a control in `new/index.html` = 0;
  hrefs in `new/rehearse.html` = `index.html`, `aid.html`; `setItem` targets in the Arena =
  `amparoArena`, entitlements, `sr_lastZip` (never `sr_save`/`amparoGuidedFlow`).
- Route facts from `vercel.json`: `/` → `/new/index.html`; `/pack` → `/pack.html`;
  `/rehearse` → `/arena/index.html`; `/aid` → `/new/aid.html`; `/index.html` → 302 `/pack`;
  `/data/*` cached 3600s at the CDN, never by the root worker. `.vercelignore` excludes
  `notebook/`, `tasks/`, `wargames/`, `LEDGER.md`, `SUCCESS.md`; `data/` deploys.
- **RECON, not asserted:** how the HUD reads on a real dark-car phone at arm's length (argued
  from CSS); Lob's rendering of the inline HTML faces at 7.2pt (rendered locally by
  `tools/render-armor-card.mjs`, never by the provider); whether `A.spOpen`'s `matchMedia`
  default behaves on a tablet rotated across 860px mid-session; whether the 06:13 version of
  this report was already consumed by `notebook/amparo-grand-audit-2026-09-03.md` (the
  CHANGELOG draft names both) — if so, its Spanish golden is now mostly closed and its two
  missing structural findings are goldens #2 and #3 here.
- Excluded per standing instruction: attorney-review as a finding. In scope and flagged: UI
  strings that describe the review ("once its attorney review is done", the notice's
  grammar), because those are copy, not review.

## 8. Signature

Ten seated personas from `.focus-group/members.md` — Rosa, Luis, Dana, Tony, Wes, Devin,
Keisha, Nia, Omar, Ray — plus Marisol and Ana reading New York and Arizona in §6. Five
goldens, twelve module items, fourteen missing features, seven blind spots, an eighteen-row
Spanish punch list with root causes in `tools/jurisdictions/hud.mjs`, `arena/index.html` and
`armorCard.ts`. Every `file:line` was opened this session against the tree as it stood
between 11:08 and 11:12 on 2026-09-03; the tree was moving, and the log above says where.
