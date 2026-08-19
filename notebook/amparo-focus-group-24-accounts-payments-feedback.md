# Focus group 24 — accounts, payments, and an error-reporting SDK

**Loop step 7. 2026-08-19, post-v2.26.0.** Follows `amparo-focus-group-23-p0-round.md`
(FG23) and `wargames/31-paywall-meets-ladder.md` (landed this round — its findings are
referenced, never restated).

**Central question this round:** does an account, a payment, and an error-reporting SDK
belong in a product whose users may be undocumented, on supervision, or fleeing an abuser?

**Method.** Every claim below was checked against source this session: root `index.html`
(6,552), `arena/index.html` (1,664), `app-src/src/**`, `app-src/convex/**`, `vercel.json`
(113), `tools/sentry-entry.js` (129), and — where the answer depended on vendor behaviour
rather than our code — the installed `@sentry/browser@10.70.0` build under
`app-src/node_modules`. Claims that cannot be settled from the repo are marked **RECON**
and are not counted as findings. Generic "needs attorney review" is excluded per standing
instruction; new UPL-adjacent facts in source are in scope.

**Two personas added this round** (proposed for `.focus-group/members.md`; the brief names
two cohorts the roster never had):

- **Priya, 33** — NJ, leaving a controlling partner. Shares a family phone plan and an
  Apple ID with him; he sees card statements and app-store receipts. Wants: nothing with
  her name on it, no email, no charge. Says yes when: the product leaves no artifact he
  can find.
- **Darnell, 29** — GA, on parole 14 months. The user `A.sup` was built for. Wants: to
  know which of these lines will get him violated. Distrusts: anything that writes down
  that he is on supervision. Budget: has $7; will not spend it on a product that just
  told him its coaching may be dangerous for him.

---

## 0. FG23's five goldens, re-checked against current source

| FG23 golden | Status now | Evidence |
|---|---|---|
| #1 Matcher scores "yes officer, go ahead and search, I consent" as correct | **CLOSED** | Matcher v3, `arena/index.html:1463–1481` — quoted-span keywords, apostrophe strip, `NEG` polarity guard, `max(2, ceil(n/2))` threshold. Independently re-verified in `wargames/31` §1. |
| #2 Swan consent gate guards one of three doors | **CLOSED, one new leak** | Gate moved into `renderArena()` `:1152–1159`. The new leak (`__swanAsk` written before the `confirm()`) is `wargames/31` §1 item 7's — not re-counted here. |
| #3 Supervision mode drills and scores the exact lines its banner warns about | **STILL OPEN** | `A.sup` has exactly three readers in 1,664 lines: the banner toggle `:1167`, the two setters `:1612–1613`, the print-card append `:1620`. Zero interaction with scoring, with the completion modal's key-phrase list, or — new this round — with the purchase surface. See golden #5. |
| #4 Fabricated $19 Vault Pass and "vetted attorney — free case review" | **CLOSED** | `grep -n "mW1a\|mW2a\|Vault Pass\|vetted"` over `arena/index.html` returns nothing. |
| #5 Footer attributes the officer's voice to the browser's speech engine | **CLOSED — and ES is now the honest one** | EN `fine` `:674` and ES `fine` `:679` both carry the pre-recorded-audio sentence; the plan's flagged ES divergence is fixed. But EN `:674` acquired a *different* falsehood — see golden #1. |

Three of five closed. The two that remain are the same thing said twice: the product knows
which of its users are most at risk and does nothing differently for them.

---

## 1. Ten persona reactions

### 🧑 Luis, 27 — TX, DACA, reads every privacy claim literally

He opens the arena footer, taps Privacy, and reads `p1` (`arena:675`): *"The pack builder
at amparohq.com offers an optional free account for saving your pack's text."* Good — that
sentence is new, and it is true. Then he scrolls two lines up to the fine print he has read
a dozen times, `fine` (`:674`): *"Everything stays on this device — no account, no upload."*

Two sentences, one screen, opposite claims. He does what he always does with a
contradiction: assumes the older, more flattering one is the marketing, the newer one is
the truth, and that there is a third thing nobody wrote down.

Then he goes to amparohq.com to check. The banner (`index.html:1699`) tells him an optional
account exists. He opens About → Your privacy (`:2063`) and reads *"Amparo keeps no
accounts and no database of who you are."* Same file. 364 lines apart.

**Verdict: no — and worse than a no.** He now treats every privacy sentence in the product
as unverified. He was the panel's biggest reversal in FG23; this round he reverses back,
and the reason is not the account. It is that the product describes itself two ways.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything asking for accounts

She never reaches the account: it lives on `/app`, behind the print step
(`PrintStep.tsx:129`), and she uses the root builder. So the account is not her problem —
the *feedback link* is. `fb_reach` in Spanish (`index.html:2311`): *"Díganoslo — puede ser
anónimo."* Tell us — it can be anonymous.

Her son asks what "anonymous" means on the internet and she says *no saben quién eres*.
That is not what the code does. See golden #4: an "anonymous" submission still carries the
page URL, the referrer, the user agent and her IP to a US company, because the scrubbing
function this product wrote does not run on feedback events.

The words she would have accepted are *sin nombre* — without a name. "Anónimo" is a larger
promise than the transport can keep, and she is precisely the person who would rely on it.

**Verdict: conditional — and she would not have written to us had she understood the
sentence correctly, which means the honest version costs real feedback. Say it anyway.**

### 🧑 Priya, 33 — leaving a controlling partner, shares a phone plan and an Apple ID

She reads the Deep Pack card, decides $6.99 is worth it, taps Pay. Stripe's hosted page
opens. She stops — the card is on the shared account, and *"AMPARO"* on a statement is a
question she would have to answer.

She backs out. Correct instinct, and the product earns credit here: the generic product
name (`stripe.ts:17`, `'Amparo Deep Pack'`) means the plan's §4.2 advice was actually taken.

Had she paid: `success_url` returns her to `/arena/?checkout=success` (`stripe.ts:79`) and
**nothing in the repo reads that parameter.** She would be back on the practice page with no
download, no unlock, no receipt inside the product — just a line on the shared statement and
a Stripe email to whichever address she typed.

The gift button is the feature designed for exactly her situation, and it cannot take money
(`arena:1633` — `wargames/31` §2e; not re-counted).

**Verdict: no.** The one purchase path she could safely use is dead, and the one that works
leaves the only artifact she cannot afford.

### 🧑 Darnell, 29 — GA, on parole, the `A.sup` user

He answers the supervision question honestly — *yes* — because the modal makes a real
argument for why it matters (`supB`, `:677`). The amber banner appears (`:1167`) and it is
genuinely good copy: *never refuse a search your conditions require.*

Then the left rail keeps showing him **"⭐ [Georgia] Deep Pack — $6.99"** (`:480`,
state-personalised at `:1080`) all session, on every screen, including the ones where the
banner is telling him the standard coaching may violate him.

He reads that as: *this thing just told me its advice could send me back, and it is still
selling me the advice.* He is not wrong. `A.sup` is a persisted boolean the product already
checks at render time; suppressing purchase for that cohort is one condition.

He also notices the completion modal still lists refusal lines under "KEY PHRASES TO
MASTER" with no supervision caveat — FG23 golden #3, verified still open above.

**Verdict: no.** He is the sharpest ethical edge in the build and the only persona whose
objection is about what the product *does*, not what it *says*.

### 🧑 Marisol, 29 — NY, green-card holder, night shifts

Legally secure, and still the clearest voice on why the payment-trail objection is not
confined to undocumented users. Her read: *"You can delete your Convex thing. You can't
delete Stripe. And nobody has to serve you at all."*

Correct, and the plan already knew it (§4.2). What she wants is for the product to say it
on the checkout modal, next to the price, in the voice it uses for everything else. Today
the modal says `payDemo` — *"Secure checkout by Stripe — Amparo never sees your card
details"* (`:677`) — true, and an answer to a question she did not ask. The question she
did ask has no sentence anywhere in the product.

**Verdict: conditional-yes on the account, no on the purchase until the record sentence
exists.** She would tip $3 tomorrow if the tip button said what a tip leaves behind.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD

She avoids the arena: pack builder, print, leave. Accounts and payments do not touch her —
the feedback widget does, and she is the one who would use it, because she has something to
say about the simulation that nobody asked her.

She taps Send feedback in the root footer (`index.html:1710`), writes three paragraphs about
what a stop actually feels like, leaves name and email blank, and gets *"Thank you — this
goes straight to Michael."* (`sentry-entry.js:39`).

Her question is the one nobody has asked: **what happens next?** No acknowledgement window,
no "we read these weekly", no triage. And if what she wrote had been a disclosure of present
danger — hers or someone else's — the crisis net would not have fired. `PRX_CRISIS`
(`arena:687`) is checked in `submitFree` only (`:1377`); the feedback textarea is a different
surface, on a different page, inside a vendor's dialog. See BS-5.

**Verdict: conditional.** The reach-a-human path is real and the right call. It simply is
not wired to a human in any way the user can see.

### 🧑 Keisha, 34 — Atlanta, rideshare, thirty seconds between fares

She does not read any of this. She would tap "Save my pack across devices" without opening
`acct_why`, because she has lost two phones in three years and that button is aimed directly
at her.

What she would be uploading, verified: `SavePack.tsx:34` calls `save({ state, ...you, lang })`
where `you` is the whole `YouInfo` record — `{name, ec, ecp, ec2, ecp2, att, zip}`
(`youTypes.ts:6`). Her name. Her sister's name and number. Her second contact's name and
number. Her attorney's number. Her ZIP. Keyed to a Clerk identity.

She is the persona for whom the account is genuinely, correctly valuable — and the one least
likely to read the disclosure. That asymmetry is the entire argument for making the
disclosure short and the deletion easy. There is no deletion (golden #2).

**Verdict: yes on the feature** — and she is the reason it has to be built more carefully
than the people who read fine print would require.

### 🧑 Tony, 61 — GA, checks whether it does what it says

He does one thing: reads the CHANGELOG, then checks it. v2.25.0 says *"the absolute 'no
account' claims are gone everywhere."* He greps the word "account".

He finds it live in seven places (golden #1). He does not care which are static fallbacks
that `applyLang()` overwrites — his point is the changelog said *everywhere*, and this is the
third consecutive release where a string-sweep claim was broader than the sweep. v2.25.0
shipped this exact bug for `pilotBanner`; v2.26.0 fixed it and wrote a paragraph about it;
v2.26.0 shipped it again for `fine`, `p1`, `ab_privacy` and `cmp_price`.

**Verdict: no, on process rather than product.** His fix is not another sweep. It is a
check — the repo already runs `tools/extract-app-content.mjs --verify` inside `npm run
check`; a static-markup-matches-bank assertion belongs in the same place.

### 🧑 Dana, 52 — TX, the persona who would actually pay

She is the buyer. $6.99 is nothing. She taps Pay on the Deep Pack, gets a real Stripe page,
and — with the live key set — pays. Then she is returned to the practice arena with nothing
new on screen and no way to find what she bought.

She emails. The address is `hello@amparohq.com` (`arena:529`) — the mailto path whose silent
failure is the reason v2.26.0 exists.

Her verdict is short and commercially decisive: *"I paid you and you gave me a webpage I
already had."* At $6.99 she does not email twice — she disputes, which costs roughly $15 and
a dispute-rate point on an account that has processed almost nothing.

She also notes the product has no refund policy anywhere. `grep -rni "refund"` across
`index.html`, `arena/index.html` and both content banks: zero hits. Stripe requires an
accessible one.

**Verdict: no** — and hers is the only no that costs money directly.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

The feedback widget is a brand-new interactive surface on all three pages, and it is a
vendor's dialog rendered inside a shadow root. Its focus trap, label association, error
announcements and behaviour at 200% zoom are all Sentry's, not ours, and none of it is
exercised anywhere in the repo.

`enableScreenshot:false` (`sentry-entry.js:68`) removes the control most likely to ship
unlabelled, which helps. The `colorScheme:'light'` pin (`:66`) means the dialog ignores the
arena's dark mode — cosmetic for most, a contrast problem for him.

**Verdict: RECON, not a defect.** "Reachable by everyone" is untested for the one persona
for whom reachability is the whole question. One pass with a screen reader on the open dialog
settles it.

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

He will never buy and never sign in. His entire exposure is the shim, and the shim is the
best-engineered thing in this release: a healthy session downloads nothing
(`index.html:6185–6196`, `arena:1256–1267`), and `Sentry.init` runs only when something
breaks or he taps feedback (`sentry-entry.js:58–72`).

That laziness has an undocumented privacy dividend: because `init` runs at tap time, the
breadcrumb buffer is essentially empty. `breadcrumbsIntegration` is a default
(`@sentry/browser/build/npm/esm/dev/sdk.js:24`) and `beforeBreadcrumb` drops only
`ui.input` — `ui.click` crumbs, which carry DOM text, survive. On an eagerly-initialised
page, a click on "Yes — show the standing supervision warning" would sit in the buffer of
every subsequent report. It does not, because the bundle was not there yet.

**Verdict: yes.** Worth stating in a comment so nobody later "optimises" the lazy load into
an eager one.

**Group tally: 2 yes (Keisha on the feature, Marcus), 3 conditional (Rosa, Marisol, Nia),
1 RECON (Omar), 4 no (Luis, Priya, Darnell, Tony) — plus Dana's no on delivery, five noes
across four distinct roots.** Every no traces to one of two things: a sentence that is no
longer true, or a cohort the product identified and then treated identically to everyone
else.

---

## 2. Golden standard — exactly 5, ranked

### 1. The product's dedicated privacy section still says accounts do not exist — on the same page whose banner advertises the account

**Evidence.**

- `index.html:2063` (EN) and `index.html:2416` (ES), mirrored at
  `app-src/src/content/t.en.json:284` and `t.es.json:284` — `ab_privacy`: *"Amparo keeps no
  accounts and no database of who you are. Your contacts and document photos live only on
  your device… they are never uploaded, so they can't be handed over even under pressure."*
- `index.html:1699` — the banner on the same page: *"…unless you choose to save your pack to
  an optional free account."*
- `index.html:2196` / `:2547`, `t.en.json:510` / `t.es.json:510` — `cmp_price`: *"Free. No
  account, no card, no subscription — and nothing you enter leaves your phone."* Both halves
  now false.
- `arena/index.html:674` (EN bank — the string users actually see) and `:526` (static twin):
  `fine` — *"Everything stays on this device — no account, no upload."* The ES twin (`:679`)
  is correct: it claims only that *practice* stays on the device.
- `arena/index.html:584` (static `p1`) — *"No account, no server, no analytics, no
  cookies."* Overwritten by `applyLang()` at init, so cosmetic in practice — and the
  identical failure mode the v2.26.0 changelog documents for `pilotBanner`.
- `arena/index.html:447` — avatar `title`: *"Demo only — Amparo has no accounts."*

`ab_privacy` is the worst of these by a distance, because of its second clause. *"They are
never uploaded, so they can't be handed over even under pressure"* is not a privacy boast —
it is a **specific promise about what a subpoena would yield**, written for a reader who is
thinking about exactly that. For a signed-in user it is now false in precisely the direction
that matters: the contacts are on a server, and they can be handed over.

The plan (`amparo-accounts-payments-plan-2026-08-19.md` §3.2) drafted replacement strings for
all of these, EN and ES, before the code shipped. They were never applied. The v2.25.0
changelog's claim that the absolute no-account claims are *"gone everywhere"* is false in six
files.

**Impact.** Highest of the round. This is the sentence Luis, Rosa and Marisol each read
before deciding whether to trust the product, and it is the one sentence a product like this
cannot get wrong.

### 2. "Save my pack" uploads the user's entire support network — the exact fields the plan said never to sync — and nothing in the product can delete it

**Evidence.**

- `app-src/convex/schema.ts:16–29` — the `packs` table: `userId, state, name, ec, ecp, ec2,
  ecp2, att, zip, lang, updatedAt`.
- `app-src/src/screens/SavePack.tsx:34` — `await save({ state, ...you, lang })`, with
  `you = readApp<YouInfo>('you', EMPTY_INFO)` (`:33`).
- `app-src/src/screens/youTypes.ts:6` — `YouInfo = {name, ec, ecp, ec2, ecp2, att, zip}`.
- `app-src/convex/packs.ts:9–19` — `packFields` accepts all of them.

A save therefore writes: the user's name, **two emergency contacts by name and phone
number**, their attorney's number, their ZIP and state — keyed to a Clerk subject whose email
Clerk holds.

The plan was explicit (§1.2): *"Sync **only** `{state, zip, lang, step, printedEdition,
entitlements}`… Do NOT sync by default: `name`, emergency contacts (`ec/ecp/ec2/ecp2`),
attorney number (`att`) — those map the user's support network."* The schema header comment
(`schema.ts:3–13`) says *"the schema is the privacy policy"*, which is exactly the right
principle — and the policy it currently encodes is *we upload the names and phone numbers of
the two people you would call from a holding cell.*

For an undocumented user those contacts are frequently also undocumented, and they have
consented to nothing. For Priya, contact #1 may be the person hiding her.

**And there is no way back.** Verified:

- `app-src/convex/packs.ts` exports `save` and `get` only. `grep -rn "delete\|remove"
  app-src/convex/*.ts` returns nothing.
- No Clerk `user.deleted` webhook exists — `app-src/convex/http.ts` routes `/stripe` and
  `/checkout` and nothing else — so deleting the Clerk account orphans the row rather than
  erasing it.
- Both "erase everything" affordances reach local storage only: `arena/index.html:1632`
  (`localStorage.removeItem('amparoArena')`) and `app-src/src/services/storage.ts:227`.

`acct_why` (`index.html:1953`, `t.en.json:114`) does disclose *"(state, names, numbers,
ZIP)"* — more honest than it had to be. It does not disclose that the upload is one-way.

**Impact.** The largest gap in the round between what the changelog implies ("only pack text;
the schema is the privacy policy") and what the schema does. The changelog's framing is true
about photos and practice history, and silent about the field set that actually matters.

### 3. Real Stripe checkout with zero fulfilment, no refund policy, and an open unauthenticated endpoint — one operator command from taking money for nothing

**Evidence — the fulfilment gap:**

- `arena/index.html:1535–1537` — `buyScript` / `buyDeep` / `tipBtnEl` call
  `openPay(…, 'script' | 'deep' | 'tip')`.
- `arena/index.html:1516–1524` — `payNow` POSTs `{product}` to `CHECKOUT_URL` (`:1503`) and,
  on `{url}`, does `location.href = url`.
- `app-src/convex/stripe.ts:57–84` — `guestCheckout` creates a real Checkout session with
  `success_url: ${site}/arena/?checkout=success` (`:79`).
- **Nothing in the repo reads that parameter.** `grep -rn
  "checkout=success\|location.search\|URLSearchParams"` over `index.html`,
  `arena/index.html` and `app-src/src` returns exactly one hit — the `CHECKOUT_URL` constant.
- No entitlement state, no Deep Pack artifact generator, no unlock:
  `grep -rn "entitle\|unlock\|owned\|purchased"` returns only practice-level unlock logic and
  one scenario line about phone passcodes.
- `stripe.ts:78` — guest sessions carry `metadata: { product, userId: 'guest' }`, so
  `purchases.record` (`purchases.ts:5`) files every guest purchase under the literal string
  `'guest'`, while `purchases.mine` (`:24`) queries by `identity.subject`. A guest purchase is
  unretrievable by construction, and there is no lookup by email or session id anywhere.

A paying user receives a Stripe email receipt and nothing else. The only "pack" any button can
produce is `payDl` — *"Print the free pack."*

Today the account runs a test key (per the v2.25.0 changelog), so no card is actually charged.
That is not a mitigation, it is a countdown: the live swap is `npx convex env set
STRIPE_SECRET_KEY sk_live_…` — **one operator command, no code change, no review, no
deploy.** The distance between "harmless" and "charging frightened people for nothing" is a
shell command.

**Evidence — no refund policy:** `grep -rni "refund\|reembolso\|terms of\|términos"` over
`index.html`, `arena/index.html`, `t.en.json` and `t.es.json` returns zero hits. Stripe
requires an accessible refund policy; the plan (§4.4) specified refund-on-request, 30 days,
never fight a dispute. Nothing shipped.

**Evidence — the open endpoint:** `app-src/convex/http.ts:33` sets
`'Access-Control-Allow-Origin': '*'` on `/checkout`, with no authentication, no origin
allow-list and no rate limit. The inline comment reasons that the response carries only a
Stripe URL — true, and beside the point. An unauthenticated session-minting endpoint on a
low-volume Stripe account is the standard target for card-testing abuse, and the outcome is
not data loss but Stripe closing the account, taking the product's only revenue line with it.
A same-origin allow-list is one string.

**Impact.** The commercial finding and the ethics finding are the same finding: the users
least able to absorb a lost $6.99 are the ones the arena sells to hardest.

### 4. "Anonymously is fine" is a promise the code does not keep — and the scrubbing function written to keep it does not run on feedback at all

**Evidence — four links, all verified in the installed dependency:**

1. `tools/sentry-entry.js:91–101` — `beforeSend` is where every promise lives: it strips
   query and hash from `event.request.url`, deletes `cookies`, `data`, `query_string` and the
   `Referer` header, and does `delete event.user` (`:99`, commented *"never identify
   anyone"*).
2. `@sentry/core/build/esm/client.js:728–733` — `processBeforeSend` calls `beforeSend` only
   `if (isErrorEvent(processedEvent) && beforeSend)`; `:792–793` defines
   `isErrorEvent(event) { return event.type === void 0 }`.
3. `@sentry/core/build/esm/feedback.js:16` — a feedback submission is built with
   `type: "feedback"`.
4. **Therefore `beforeSend` never runs on a feedback submission.** Meanwhile
   `httpContextIntegration` is a default integration
   (`@sentry/browser/build/npm/esm/dev/sdk.js:28`) whose `preprocessEvent` attaches `request`
   to *every* event, and `getHttpRequestData`
   (`@sentry/browser/build/npm/cjs/dev/helpers.js:88–101`) fills it with `location.href`,
   `document.referrer` and `navigator.userAgent`.

So the widget copy — *"Writing anonymously is fine — leave the name and email blank"*
(`sentry-entry.js:33`, ES `:45`) — and the footer link — *"Tell us — anonymously is fine"* /
*"puede ser anónimo"* (`index.html:1953`, `:2311`; `t.en.json:112`, `t.es.json:112`) —
describe a submission that carries at minimum: the full page URL unstripped, the referrer,
the user agent string, the chosen language, a timestamp, and — at the network layer,
unavoidably — the user's IP to `o4509837098221568.ingest.us.sentry.io` (`vercel.json:9`).

Whether that IP is *retained* is an org-level Sentry dashboard setting ("Prevent Storing of
IP Addresses"), **not in this repo — RECON.** The answer changes what the copy should say,
not whether it should change.

`sendDefaultPii:false` (`:75`) is doing real work and should stay; it is simply not the
control that governs this path.

**What is genuinely well built, and should be said plainly:** errors only, no session replay
(`:8`), no tracing (`:76`), `enableScreenshot:false` (`:68`), `allowUrls` fenced to our
origins (`:79`), `ui.input` breadcrumbs dropped (`:83`), self-hosted so `script-src 'self'`
stays clean — and the lazy shim, which as a side effect keeps the breadcrumb buffer
near-empty because `Sentry.init` does not run until the tap. That last property is
load-bearing and undocumented: `ui.click` breadcrumbs are *not* dropped by
`beforeBreadcrumb`, and on an eagerly-initialised page a click on `supYes` would ride along
with every subsequent report.

**The fix is two lines and one sentence.** `beforeSendFeedback` is the hook that governs this
event type; and the copy should promise what it can deliver — *"You can leave your name and
email blank. Your message is stored by our error-reporting provider along with your browser
type and the page you were on."*

**Impact.** The widget is the right feature; v2.26.0's reasoning about the mailto failure is
sound, and the one real support request proves it. This is not an argument against shipping
it. It is an argument that the word "anonymous" belongs to a different product.

### 5. The product names its two highest-risk cohorts, then sells and stores identically for them — and never once states the consequence of an account

**Evidence — supervision.** `A.sup` is read in exactly three places in 1,664 lines: the
banner toggle (`arena:1167`), the two setters (`:1612–1613`), and the print-card append
(`:1620`). It touches neither scoring, nor the completion modal's key-phrase list, nor any
purchase surface. A user who has just told the product he is on parole keeps seeing the
state-personalised **"⭐ [State] Deep Pack — $6.99"** card in the left rail (`:480`,
personalised `:1080`) for the whole session, including while the amber banner tells him the
coaching may be dangerous for him.

**Evidence — the missing sentence.** `acct_why` (`index.html:1953`, `t.en.json:114`)
enumerates what is stored — *"(state, names, numbers, ZIP)"* — then delivers the reassuring
half: *"Document photos and practice history never leave this device — the server has no
place to put them."* `acct_scope` (`t.en.json:116`) repeats it. Nowhere in any of the three
surfaces does any string say the other half: **an account creates a record that can be
compelled.** The product is perfectly willing to say the positive version of that sentence
about local data — *"they are never uploaded, so they can't be handed over even under
pressure"* (`ab_privacy`) — which makes the silence on the uploaded half conspicuous rather
than merely incomplete.

**Evidence — supervision status is itself written down.** `A.sup` is persisted into the
`amparoArena` localStorage blob (`saveA()`, `:1612–1613`). It never leaves the device, which
is correct and should stay that way. But the product's own threat model has always been *the
phone is in someone else's hands* — and a `"sup":true` in local storage is a
criminal-justice-status disclosure readable by anyone holding an unlocked phone. See BS-4.

**Impact.** The round's structural finding rather than its loudest. The product has already
done the hard part: it *asks* the question, and it asks it well. It just does nothing with
the answer.

---

## 3. What must change in the practice modules

Distinct from `wargames/31`, which owns paywall placement, the Earned Ask rule, and the
contextual-feedback placement ranking. These are the safety and honesty items inside the
modules themselves.

1. **`fine` EN carries a false claim its Spanish twin does not.** `arena:674` — *"Everything
   stays on this device — no account, no upload"*; `:679` — *"Su práctica se queda en este
   dispositivo."* Port the ES structure to EN. Same pass: `:526` (static twin), `:584`
   (static `p1`), `:447` (avatar title).
2. **Add a static-matches-bank check to `npm run check`.** Three consecutive releases have
   shipped the same class of bug (`pilotBanner` in v2.25.0; `fine`, `p1` and the pressure copy
   in v2.26.0). `app-src/package.json:11` already chains four verifier scripts and
   `tools/extract-app-content.mjs --verify` is the precedent. Every `data-i18n` / `data-i`
   element's static text should equal its EN bank entry, or the build fails. This retires the
   whole bug class, including `wargames/31` §1 item 3.
3. **Suppress every purchase surface when `A.sup === true`.** One condition on an existing
   persisted boolean, at `:480–481` and `:606–607`. `wargames/31` §2b reached the same
   conclusion from the monetization side; this round it has a persona attached.
4. **Close FG23 golden #3's drilling half.** The completion modal still presents refusal
   lines under "KEY PHRASES TO MASTER" to supervised users with no caveat, overlaying the
   banner that contradicts them. The caveat text is coaching content → `TODO_ATTORNEY`; the
   *branch* is not, and should be built now so the string can drop in.
5. **Any contextual feedback invite must hook `beforeSendFeedback`, not `beforeSend`.**
   `wargames/31` §3's rule — attach only a beat id, never the transcript, never `A.sup`,
   never the state — is correct and currently unenforceable, because the scrub this product
   wrote does not execute on that event type (golden #4). Build the hook before the invites.
6. **Route the feedback textarea through the crisis net, or decide out loud that it is not.**
   `PRX_CRISIS` (`:687`) fires only in `submitFree` (`:1377`). The feedback dialog is a
   vendor surface with no such check. At minimum its success text should carry the 988 line.
   See BS-5.
7. **Give "Wipe my data" an honest scope line now that a server copy can exist.** `p4`
   (`:677`) correctly says the pack builder keeps a separate save. It should also say that a
   saved account pack is not on this device and is not erased by this button — which is only
   sayable once a delete exists (golden #2).

---

## 4. Blind-spot questions nobody has asked yet

**BS-1. If ICE serves Stripe or Clerk, Amparo never finds out — is silence the policy?** A
subpoena to a processor does not notify the merchant, and neither Stripe nor Clerk is obliged
to tell us. The product has no transparency commitment, no warrant canary, and no stated
practice for what happens if we *are* served. For a product whose entire pitch is "we cannot
hand over what we do not have", the corollary — *here is what we do have, and here is what we
would do if asked for it* — is a two-sentence page that would buy more trust than any feature
in the backlog. Nothing in the repo addresses it.

**BS-2. What does the Clerk sign-in screen say Amparo is, and where does that string end
up?** The sign-in modal is Clerk-hosted on `divine-swine-18.clerk.accounts.dev`
(`vercel.json:9`, `frame-src`). If the user signs in with Google, the OAuth consent screen
shows the Clerk application's display name — and that name is written permanently into the
user's Google account activity, a record on a third party's infrastructure, outside Amparo's
deletion power, created by an action the user took to *protect* themselves. That name lives in
the Clerk dashboard, not the repo. **RECON:** what is it? If it describes the subject matter,
it should become a bare "Amparo", for the same reason `stripe.ts:17` already says "Amparo Deep
Pack" and not "ICE addendum".

**BS-3. When a guest buyer says "I paid and got nothing", what is the operator supposed to
do?** Guest `purchases` rows are all keyed `'guest'` (`stripe.ts:78`); there is no email
column, no session lookup in the product, and `purchases.mine` can never return them
(`purchases.ts:24`). The only tool is the Stripe dashboard and the only inbound channel is the
mailto whose failure is the reason v2.26.0 exists. This is a support process that does not
exist for a transaction that can already happen.

**BS-4. Should the supervision answer survive the session?** `A.sup` persists in
`amparoArena` (`:1612`). The product's threat model is a phone in someone else's hands — a
parole officer, an abusive partner, a family member. A persisted `"sup":true` is a
criminal-justice-status disclosure sitting in local storage on a device that may be searched,
in a product otherwise fastidious about not writing such things down. The argument for
persisting is that re-asking every session is worse. Both are defensible; neither has been
argued.

**BS-5. The reach-a-human path has no crisis routing and no human SLA — what happens when
someone writes something that needs a human tonight?** The 988 net is wired to the practice
input only (`:1377`). The feedback box is a free-text field on a product about police
violence, offered to a population that includes DV survivors and people in acute distress,
with a success message that names a specific person — *"this goes straight to Michael"* — and
no timeframe, no fallback if Michael is asleep. The harder question, whether a one-person
project should offer an unmonitored inbound channel to this population at all, is a product
decision, not a bug.

**BS-6. Does the free path still work with every third party blocked?** The local-first outage
story is the plan's §4.9 promise and it appears to hold — root has zero Clerk or Convex
references (`grep -c` = 0), the arena's checkout failure falls back to the honest preview, and
the pack builds client-side. Nobody has run it: `connect-src` in `vercel.json:9` now names
Sentry, PostHog, Stripe, Clerk and Convex, and a user on a locked-down network or a strict
blocker exercises a path no test covers. **RECON:** one run with all five origins blocked at
the network layer, verifying the pack still prints and the arena still drills.

---

## 5. The central question, answered

**Does an account belong here?** Yes — narrowly, and not the one that shipped. Keisha's
lost-phone problem is real, and the product created it by shipping a proud "Wipe my data"
button next to fragile local storage. But the account's value is *pack restoration*, and pack
restoration does not require the field set currently synced. The plan's list —
`{state, zip, lang}` plus entitlements — regenerates a pack skeleton in thirty seconds and
maps nobody's support network. **What a subpoena to Convex yields today: a named person,
their two emergency contacts by name and number, their attorney's number, their ZIP, their
state, tied to a Clerk identity. What it should yield: a state, a ZIP, a language.** That is
the whole difference, and it is six fields in `schema.ts`.

**Does a payment belong here?** Yes — but not on the practice surface, and not before
fulfilment exists. `wargames/31` §2d established the free/paid line correctly: information
free, artifacts paid. Nothing in the current price list violates it. What violates it is that
the product can take money and deliver nothing, and that the button doing so sits in the left
rail of a training screen, where the users who see it most are the ones struggling most.
**What a subpoena to Stripe yields: cardholder name, last four, billing postcode, email, IP at
checkout, amount, timestamp and product name — permanently, under financial-records
retention, reachable without ever serving Amparo.** Generic product naming (`stripe.ts:17`)
already mitigates the worst of it; guest checkout already exists and is the correct default.
The remaining gap is that no string in the product tells the buyer any of this.

**Does an error-reporting SDK belong here?** Yes, and this is the one the panel is most
comfortable with. The scoping is genuinely good — errors only, no replay, no tracing,
lazy-loaded, self-hosted, `allowUrls`-fenced. **What a subpoena to Sentry yields about one
user: their feedback message text, whatever name and email they chose to type, the page URL
and referrer, their user agent, their language, timestamps — and their IP, subject to an org
setting not visible from this repo.** That is a defensible amount for a support channel. It is
not "anonymous", and the product should stop using the word.

**Is the trust copy honest enough?** No, and the gap is not subtle. Six files still say
accounts do not exist. The one sentence that would make the account honest — *creating an
account creates a record that could be handed over* — appears nowhere, while its mirror image
("never uploaded, so they can't be handed over even under pressure") appears in four. The
product has already proven it can write this kind of sentence well: `p3`'s voice-input
disclosure and `supB`'s supervision warning are both models of it. The account deserves the
same treatment — what we store, who holds it, what that means if someone comes asking, and a
button that deletes it.

---

## 6. Verification log

- Read: `CHANGELOG.md` v2.26.0 + v2.25.0; `notebook/amparo-accounts-payments-plan-2026-08-19.md`;
  `wargames/31-paywall-meets-ladder.md`; `.focus-group/members.md`;
  `notebook/amparo-focus-group-22-practice-arena.md` and `amparo-focus-group-23-p0-round.md`
  (goldens + blind spots).
- Source read this round: `app-src/convex/{schema,packs,purchases,stripe,http,auth.config}.ts`
  in full; `app-src/src/screens/{SavePack.tsx,youTypes.ts}`, `PrintStep.tsx:110–145`,
  `app-src/src/services/feedback.ts`, `app-src/src/clerkAndConvex.ts`; `tools/sentry-entry.js`
  in full; `vercel.json` in full; targeted regions of `index.html` and `arena/index.html`.
- Dependency verified directly rather than from memory (`@sentry/browser@10.70.0`,
  `app-src/node_modules`): `@sentry/core/build/esm/client.js:728–733, :792–793`;
  `@sentry/core/build/esm/feedback.js:16`;
  `@sentry/browser/build/npm/esm/dev/sdk.js:24, :28`;
  `@sentry/browser/build/npm/esm/dev/integrations/httpcontext.js`;
  `@sentry/browser/build/npm/cjs/dev/helpers.js:88–101`.
- Grep-negatives (absence of a thing, not proof of intent): `checkout=success` handler = 0;
  `entitle|unlock|owned|purchased` in a purchase sense = 0; `refund|reembolso|terms of` = 0;
  `delete|remove` in `app-src/convex/*.ts` = 0; `identify(` — the PostHog↔Clerk tripwire from
  plan §4.6 — = 0, **clean**; `Clerk|clerk|convex` in root `index.html` = 0; `createCheckout`
  callers = 0; `mW1a|Vault Pass|vetted` in arena = 0.
- **Unverified / RECON:** whether Sentry's org has IP storage disabled; the Clerk
  application's display name on the OAuth consent screen; screen-reader behaviour of the
  Sentry feedback dialog; whether live-mode Stripe keys are set in Convex env (operator side,
  not in repo); the free path's behaviour with all five third-party origins blocked; whether
  the door module is genuinely with reviewers (FG23 BS-2, still unresolvable from the repo).
- Excluded per standing instruction: generic attorney-review findings. In scope and flagged:
  selling state-specific scripts with no fulfilment and no refund policy is the UPL-adjacent
  fact pattern the plan's §4.5 gate was written to prevent, and that gate was not observed.

## 7. Signature

Ten personas, five goldens, seven module items, six blind spots. Every `file:line` in this
report was opened this session. Two personas (Priya, Darnell) are new and proposed for
`.focus-group/members.md`. `wargames/31`'s findings are referenced, never restated.
