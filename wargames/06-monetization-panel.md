# Wargame 06 — Monetization execution panel

Date: 2026-08-03. Deliberation document. **No `index.html`, `vercel.json`, or
any other source file is edited or authorized to be edited by this document.**

**The decision is made and is not on the agenda.** The operator has decided to
charge for practice-module script packs and to rewrite the blanket "nothing you
enter leaves your phone" line. Five seats deliberate on *execution* and on what
will go wrong. One seat (§5) is explicitly adversarial by assignment, so the
strongest case against is heard once, properly, and then closed.

**No legal text, statute, or citation is generated anywhere in this document.**
Everything requiring a lawyer is collected in the attorney-flag register at the
end and is marked `ATTY` inline.

---

## 0. Ground truth — re-verified in source for this panel

Every seat below argues from this table, not from memory. Read directly out of
`index.html` (432 KB, at `60ae7bc` / `v2.7.2`) and `vercel.json`.

| Fact | Where | Consequence |
|---|---|---|
| **There is no backend. None.** No `api/`, no `functions/`, no `netlify/` directory exists in the repo. | repo root | Any entitlement mechanism is net-new server surface, not an addition to existing surface. |
| `sendPackEmail()` POSTs to `/.netlify/functions/send-pack` — **a Netlify path on a Vercel deployment** | `index.html:3525`, `vercel.json` | The one server reference in the codebase is both unimplemented *and* pointed at the wrong host. Do not treat it as a starting point. |
| `REVIEW.emailEnabled:false`, with a comment saying flip only after deploying the function | `index.html:2166` | Correct discipline, already established. Reuse this exact pattern for payments. |
| CSP: `script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com us-assets.i.posthog.com ph.amparohq.com`; `connect-src 'self' us.i.posthog.com us-assets.i.posthog.com ph.amparohq.com`; `form-action 'self'`; `frame-ancestors 'none'` | `vercel.json:9` | No Stripe host is allowed. A **same-origin** `/api/*` fetch needs **zero** CSP edits (`connect-src 'self'` already covers it). Embedded Stripe.js needs four. |
| `Permissions-Policy: … payment=() …` | `vercel.json:15` | Payment Request API is off for every origin including self. Link-out is unaffected; embedding requires reopening it. |
| `Cross-Origin-Opener-Policy: same-origin` | `vercel.json:16` | A cross-origin popup's `window.opener` is severed. **No `postMessage` callback from a Stripe tab is possible.** Any "come back and tell the app" design must use a redirect, not a popup handshake. |
| Session replay runs on **steps 0–1 only**, hard-killed at step ≥2 and never restarted; `maskAllInputs:true, maskTextInputs:true` | `srReplayGuard()` `index.html:3034`; init `:1278`, `:1286` | Step 2 is emergency contacts. **Replay is dead before name or contacts render.** The narrowed privacy claim in §2 survives this cleanly. The *disclosure* gap is real; the *contradiction* is not. |
| Browser speech transcription may leave the device; disclosed at point of use, not in About | `prx_rec_note_sr` `:1546` EN / `:1856` ES | A second existing carve-out from the blanket line. |
| `ab_privacy` **already describes an email-receipt data flow that has no implementation** — "only your name, state and email address pass through our email service" | `:1586` EN / `:1896` ES | The privacy section contains an inaccuracy *today*, before any payment ships. See §3. |
| Document photos are RAM-only — `persist()` writes a fixed field list that excludes the photo keys | `persist()` `:2977`, `loadImg()` `:3244` | The single strongest true claim the product owns. |
| Practice modules are two: `traffic` and `door`, selected by `_hubTab` | `hubTab()` `:3122` | Packaging unit that actually exists in code. |
| `EDITION="2026-C"`, `ED_REPLACE="07/2027"`; attorney sign-off is edition-locked and **empty for every state** | `:2185`, `isReviewed()` `:2186` | A paid product with zero attorney sign-offs displayed. §3 and §5 both turn on this. |
| Content differentiation: **TX / GA / NY only.** 47 states + DC show the federal floor. | `s_sub`, `s_soon` `:1587–1589` | Kills per-state SKUs as a packaging model. See §4. |
| Traffic: ~72 visitors / 30 days. One known completed funnel, ever. | UPL memo appendix | Every revenue number below is bounded by this. |
| **The v2.1.0 record**: the `$19 after launch` banner sat on the state picker, was pulled, and was *"replaced with the on-device privacy line."* | `amparo-version-history.md`, commit `1e2fd0e` | The line being removed is the artifact that replaced the failed price banner. §5 leads with this. |
| **The one real user named a price and a product split**: *"The scenarios first… then here's a script, 99 cents… your information is yours, we don't own it… the paywall is the paperwork."* Explicitly not a subscription. | `amparo-user-transcript.md:57–64` | He priced it at 99¢, put the **scenarios on the free side**, and used the privacy promise as the *sales pitch* for the paid thing. §4 and §5 both turn on this. |
| UPL memo §1 asserts: *"Free. There is no payment integration anywhere in the codebase, and none is planned pending this opinion."* §4 Q9 asks about charging *"for the printable pack only — never for the practice engine."* | `amparo-upl-engagement-memo.md` | The memo pre-authorizes asking about charging for the **pack**. Selling **practice-module** packs inverts the hypothetical it asks. `ATTY-1`. |

---

## 1. Payments / fintech engineer

*Brief: Payment Links vs Checkout vs Elements for a static single-file PWA with
no backend. Minimum server surface to sell a per-state pack and issue a bearer
token. Is serverless enough? What breaks offline?*

### The three options, scored against this codebase specifically

| | Payment Link | Checkout Session (API-created) | Payment Element |
|---|---|---|---|
| Server code required | **none** | one function to create the session | one function + client SDK mount |
| CSP edits to `vercel.json` | **none** | none (same-origin `/api/*`) | `script-src` + `frame-src` + `connect-src` |
| `Permissions-Policy` change | none | none | must reopen `payment=()` for wallets |
| Stripe.js executes on Amparo's origin | **never** | never | **on mount, before a card is typed** |
| Price/product editable without a deploy | yes, in dashboard | yes | yes |
| Can it be bypassed by a determined user | yes | yes | yes |

**Recommendation: Payment Link.** Not as a compromise — as the correct answer.
Two of these facts are decisive and neither is about convenience:

1. **Elements executes third-party script on Amparo's origin and phones home
   on mount.** For most products that is a non-issue. For this one it is a
   network call, from a rights-and-immigration-adjacent tool, on a device
   belonging to someone who chose it for exactly that reason — and it happens
   whether or not they proceed. The positioning doc already reached this
   conclusion independently. It holds.
2. **The existing CSP and `Permissions-Policy` are a shipped security posture,
   not an accident.** Link-out costs zero header edits. A same-origin
   `/api/*` fetch also costs zero header edits, because `connect-src 'self'`
   already permits it. That is a genuinely useful finding: **the entire
   recommended design fits inside the current headers untouched.** Embedding
   is the only option that requires reopening a capability the project
   deliberately closed.

`form-action 'self'` is worth naming so nobody trips over it: it blocks a plain
`<form method="POST" action="https://checkout.stripe.com/…">`. It does **not**
block `<a href>` or `window.open` — those are navigations, not form submissions.
So a Payment Link works today, as-is, with no header change. A form-post
checkout would not.

### Minimum server surface — a ladder, stop at the first rung that holds

**Rung A — zero server.** Payment Link → Stripe's confirmation redirect to
`https://amparohq.com/?pack=door` → the app reads the param and sets a
`localStorage` flag. No function, no database, no secret, no CSP change. Ships
in an afternoon.

- Cost: trivially bypassable. Anyone can type the URL.
- **This is not obviously the wrong answer.** The pack content already ships
  inside `index.html` — it is in the client on every visit, free, right now.
  What is being "protected" is a file the product's own mission says should
  reach anyone who needs it, at a price of a few dollars, at roughly one sale
  per month. Rung A converts the purchase from an enforcement problem into an
  honesty ask, which is a register this product already speaks in.
- Real defect, and the reason not to stop here: **Stripe's redirect is not
  guaranteed to complete.** Mobile Safari, an installed PWA, a killed tab, a
  slow network — the user pays and lands nowhere. Then the only recovery is a
  human emailing the operator. At one sale a month that is survivable; it is
  also exactly the failure that turns a $3 sale into a chargeback.

**Rung B — one function, no database.** The recommended build.

```
/api/claim?session_id={CHECKOUT_SESSION_ID}
  → stripe.checkout.sessions.retrieve(session_id)   [restricted read-only key]
  → assert payment_status === 'paid'
  → return HMAC(secret, product|edition)            [deterministic, no storage]
```

- **No webhook.** The success redirect carries `{CHECKOUT_SESSION_ID}`; the
  function verifies against Stripe directly. This removes webhook signature
  handling, replay-window logic, and the async race where the webhook lands
  after the redirect.
- **No database.** The entitlement is a signed string, not a stored row. It
  cannot be revoked — accept that; at this volume revocation is theatre — and
  in exchange **there is no server-side record of any purchase existing at
  all.** That is strictly more private than wargame 05's five-column table and
  strictly less code. Wargame 05's row schema is correct if a DB is needed; the
  finding here is that one isn't.
- **Secrets: one restricted Stripe key scoped read-only to Checkout Sessions,
  plus one HMAC secret.** Both in Vercel env vars. Never in the repo, never in
  `index.html`. Rotating the HMAC secret invalidates every issued token —
  document that before it surprises someone.
- **Idempotent by construction**: the same `session_id` always returns the same
  token, so the Stripe receipt link is a permanent recovery path with no state
  on Amparo's side.
- Still bypassable by anyone who reads the client. Everything is. Do not spend
  another line of code on that.

**Rung C — webhook + stored rows.** Needed only if refunds must revoke access,
or if sales must be counted somewhere other than the Stripe dashboard. Neither
is true today. **Do not build this.** If it is built anyway: webhook signature
verification via the signing secret is mandatory and non-negotiable — without
it, anyone who finds the endpoint can POST a fake `checkout.session.completed`
and mint tokens forever.

Skipped: webhook, database, subscription logic, customer portal, receipt email.
Add the webhook when a refund must actually revoke something.

### Is serverless enough?

Yes, and one function is enough. Vercel functions live at `/api/*` on the same
origin, which means: no CSP edit, no CORS, no preflight, no new host in
`connect-src`. The single-file architecture is preserved — `index.html` gains a
`fetch('/api/claim…')` and nothing else.

### What breaks offline — the part most likely to be shipped wrong

`sw.js` precaches the shell network-first with cache fallback, so the app runs
offline today. Three specific breakages, in order of how bad they are:

1. **Re-verifying entitlement on every load.** If the app calls `/api/claim` or
   any check at startup, a paying customer on the subway sees a locked product.
   That is the worst outcome available: you took money and made the app worse
   than the free version. **Rule: verify exactly once, at claim time, write the
   result to `localStorage`, and never phone home again.** The verification is
   an event, not a state.
2. **Purchase itself requires network.** Unavoidable and fine — but the failure
   must be legible. Luis is on prepaid data on an older Android; Keisha is
   between fares. If the Stripe tab fails to load, the app must not be left
   showing a spinner or a dead "unlocking…" state. Prefer a plain link the user
   taps knowingly over any in-app async flow that can hang.
3. **Installed-PWA redirect loss.** In an installed standalone PWA — which this
   product actively encourages via `manifest.webmanifest` — an external
   navigation can hand off to the system browser and never come back into the
   PWA context. The user pays in Safari; the PWA still shows locked. Combined
   with `COOP: same-origin` severing `window.opener`, **there is no callback
   path.** Mitigations, in order: (a) make the token recoverable from the
   Stripe receipt link, (b) provide a visible manual "I already bought this"
   entry field, (c) test the installed-PWA path on real iOS and real Android
   before ship, not after. This is the single most likely mechanical bug in the
   whole feature and it will not appear in desktop testing.

### One check worth writing

The HMAC verify path is a money/security branch, so it gets one runnable check —
a small `test_claim.mjs` asserting: valid session → token; `payment_status`
anything but `paid` → no token; tampered token → reject; wrong-edition token →
reject. Four asserts, no framework. Anything more is scaffolding.

---

## 2. Privacy engineer

*Brief: the blanket promise is going. What is the strongest TRUE claim that
survives? Exact replacement in EN and ES. What must About disclose that it
doesn't today?*

### First, correct a fear that is not warranted

I expected to find that replay contaminated the contacts screen. It does not.
`srReplayGuard()` stops recording at step ≥2 and sets `srReplayDead` so it never
restarts; step 2 is emergency contacts. **Recording is dead before the name and
contacts screen ever renders, and photos are RAM-only.** So the narrowed claim
below is not a hedge — it is literally, mechanically true, and it is *more*
defensible than the sentence being replaced.

### The strongest true claim that survives

The current line makes four assertions. Three of them are still true; one is not.

| Clause | Status after monetization |
|---|---|
| "Free." | **False** for the paid pack. Must go. |
| "Nothing you enter" | **False under hostile reading** — a card number is entered, even if on Stripe's page. Must go. |
| "no account" | **True.** No accounts exist; the design has none. Keep. |
| "no upload" (of the user's own material) | **True.** Photos RAM-only; contacts local; replay dead before both. Keep, but say *what* isn't uploaded. |

The move is to **name the protected nouns instead of claiming a universal**. A
universal fails on one counterexample; a list of three concrete nouns is checkable
and holds.

**Primary, EN:**

> **No account. Your name, your contacts and your photos never leave your phone.**

**Primary, ES:**

> **Sin cuenta. Tu nombre, tus contactos y tus fotos nunca salen de tu teléfono.**

Notes on the wording, because each choice is load-bearing:

- **"photos" not "documents."** More concrete, and it is the clause with the
  strongest mechanical backing (`persist()` never writes the photo keys). It is
  also the noun a scared user actually pictures.
- **"never leave your phone"** rather than "stay on your device" — the existing
  ES corpus already uses "sale de tu teléfono," so this keeps the voice.
- **No mention of price, in either direction.** Not "free," not "$2.99," not
  "free to practice." This banner renders on the early wizard screens — the
  exact real estate where the `$19 after launch` banner did measurable damage.
  **The replacement for a privacy sentence is a privacy sentence.** Pricing
  disclosure belongs where the price is, not on the state picker. This is the
  single most important execution instruction in this section.
- **Spanish is authored, not translated — but it still needs a fluent cold
  read before ship.** Marisol's stated bar is that the Spanish reads as
  written. The existing ES corpus is independently authored (compare `ab_mission`
  EN/ES — different sentences, same point), and this draft follows that
  convention. It is still a draft by a non-native writer. `RECON`: one fluent
  reader, cold, no English shown.

**Fallback if the operator wants the word "free" retained somewhere:** put it on
the practice hub next to what is actually free, in present tense, never in future
tense, and never on the state picker. "Free for now" and "$X after launch" are
categorically banned — that construction, not the number, is what killed v2.1.0.

### What About (`ab_privacy`) must disclose that it does not today

Six items. Items 1 and 2 are pre-existing debts that become dangerous the moment
money is involved; 3–6 are new.

1. **Fix the false sentence that is already there.** `ab_privacy` says *"If you
   choose to email yourself a receipt, only your name, state and email address
   pass through our email service to deliver it."* There is no email service.
   `emailEnabled` is `false` and the endpoint points at a Netlify path on a
   Vercel deploy. **Either implement it or delete the sentence — and delete is
   the right call.** Shipping a paid product while the privacy section
   describes a data flow that does not exist is the worst available
   combination: it is the exact sentence a hostile reader quotes, and it is
   *already written*. This is a deletion, it is free, and it should happen
   whether or not payments ever ship.
2. **Disclose session replay, or delete it.** Recording on the first two
   screens, with pointer and touch movement, uploaded to a vendor, is not
   "counting anonymous events" — which is all `ab_privacy` currently claims.
   Masked inputs do not make a screen recording an event count. Two honest
   options: add one clause naming replay, its two-screen scope and the masking;
   **or delete `srReplayGuard()` entirely** and rely on the `sr_step_viewed`
   funnel, which measures the same drop-off. Deletion is better: it removes an
   exposure, removes vendor weight, and means the new privacy sentence carries
   no hidden asterisk. A narrowed claim shipping alongside an undisclosed
   recorder is a worse position than the blanket claim was.
3. **Name Stripe, and name what Stripe sees.** Card number, billing details,
   and an email address for its own receipt and fraud purposes. Amparo never
   sees the card. Say both halves — the reassurance is worthless without the
   admission.
4. **Name what Amparo's side stores.** Under Rung B: nothing. A signed string
   is returned and never recorded. If the operator later builds Rung C, this
   sentence changes to "a random token, a product code and a date — never a
   name," and it must change *in the same commit as the database*.
5. **State plainly what stays free.** Not as marketing — as a data-handling
   fact the user can verify. A user who cannot tell whether their rights card
   is behind a paywall will assume the worst.
6. **Move the mic disclosure into About.** `prx_rec_note_sr` is honest and
   correctly placed at point of use, but once About becomes the canonical
   privacy statement for a paid product, an off-device path that appears
   nowhere in it is an omission. One clause.

Register: match `prx_rec_note_sr`, which is the best sentence in the corpus for
this job — *"…may leave your device — optional; Amparo stores nothing."* Short
clauses, states the bad part first, no reassurance that isn't earned. Not a
legal disclaimer. `ATTY-4` covers whether these disclosures are *sufficient*;
this section covers whether they are *true*, which is a different and prior
question.

---

## 3. Consumer-protection / regulatory

*Brief: a US-facing app that charges money and previously advertised a privacy
guarantee. Practical, not alarmist.*

I am not a lawyer and this section generates no legal text, no statutes, and no
citations. What follows is the practical compliance surface — the artifacts a
paid consumer product is normally expected to have, and where the genuine legal
questions sit. Everything in the second category is flagged, not answered.

### The concrete artifacts, in priority order

1. **A refund policy, published, and honored without argument.** For a
   few-dollar digital good the arithmetic settles this: a Stripe dispute fee is
   an order of magnitude larger than the sale. A no-questions refund on request
   is cheaper than defending one chargeback, every time. State it in one
   sentence next to the price, not buried. This is the highest-value, lowest-cost
   item on the list.
2. **Terms of service.** Currently absent. A paid product without one leaves
   every question — what you bought, for how long, what happens at the next
   EDITION, who to contact — to be decided by whoever complains loudest. It
   also interacts with the empty attorney sign-off: the ToS is where the
   "well-sourced general information, not legal advice" framing already in
   `ab_review_pending` should be restated for a paying customer. `ATTY-2`.
3. **Disclosure of Stripe as processor** — covered in §2, item 3.
4. **Do not do recurring. At all.** Recurring billing pulls in a materially
   heavier disclosure, affirmative-consent, and cancellation regime at both
   federal and state level, and the specifics vary by state. One-time purchase
   removes that entire compliance surface rather than managing it. It also
   matches the only real user, who was explicit he would rather not gate the
   app behind recurring payment, and it matches the fundraising research's
   finding that a stored card on file is a *deeper* payment trail than a
   one-time charge — which is the exact objection Luis and Marisol raise.
   **This is a design decision that deletes a compliance category. Take it.**
   `ATTY-3` if the operator ever reconsiders.
5. **Sales tax on digital goods.** Nexus and taxability vary by state. At the
   revenue levels in §4 no economic-nexus threshold is remotely in reach, but
   "how much revenue is too little to care" is an accountant's answer, not
   mine. Flag and move on; do not buy Stripe Tax at one sale a month.
6. **Entity.** Selling in a personal name binds the operator's personal
   finances to a police-and-immigration-adjacent product. The business-structure
   memo already identified the single-member LLC as the one entity decision with
   a rationale independent of donations. **Charging money strengthens that
   rationale considerably** — it converts "publishing guidance" into "selling a
   product." `ATTY-5`, and it is the same question the UPL memo's Q12 already
   asks, so it costs nothing extra to ask.
7. **Accessibility of the purchase path.** Omar uses a screen reader at 200%
   text and already notices the a11y work. Stripe's hosted pages carry their own
   accessibility work; a hand-rolled in-app payment UI would inherit none of it
   and would need testing this project cannot currently do. One more argument
   for link-out, from a direction that has nothing to do with privacy.

### The previously-advertised guarantee — the part that actually matters

The exposure here is **not** "you started charging money." It is the pattern of
*making a broad public claim, then silently narrowing it.* The mitigations are
cheap, entirely within the operator's control, and dramatically more effective
than anything else on this list:

- **Date the change and log it.** This project already maintains `CHANGELOG.md`
  and `notebook/amparo-version-history.md` with unusual honesty, including
  recording its own reversed decisions. Use that. A changelog entry saying what
  the sentence used to say, what it says now, and why, converts a silent
  narrowing into a documented one. That distinction is the whole ballgame.
- **Narrow, do not delete.** A product that replaces a broad claim with a
  narrower true claim is telling a coherent story. A product that removes the
  privacy language entirely and adds a price on the same day is telling a
  different one. §2's replacement sentence does the first.
- **Assume the old sentence is permanent public record.** Screenshots, archive
  crawlers, and the repo's own git history all preserve it. Nothing here should
  be written as though the previous claim can be made to not have existed.
- **Never let the app be in an inconsistent state, even for an hour.** The
  window between shipping a payment path and shipping the copy fix is the
  window in which the product is making a false statement to paying customers.
  Same commit. Wargame 05 §5 already says this; it is repeated here because it
  is the one item where the compliance seat and the privacy seat agree
  completely.

State consumer-protection statutes exist in every state and their scope, private
rights of action, and treatment of a pre-change claim vary. I am not assessing
any of that. `ATTY-6`.

### Where UPL gates this — stated once, not re-argued

The UPL memo asserts in writing that no payment integration exists and none is
planned. Q9 asks whether charging *"for the printable pack only — never for the
practice engine"* would change the analysis. **The decision on the table is to
charge for practice-module script packs — which is charging for the practice
engine, the exact component the entire engagement is about.** The memo's own
hypothetical is inverted by the plan.

That is not an argument against charging. It is an observation that **the memo
must be amended before it is sent, and the amendment changes the question being
asked.** Sending the memo as written and then shipping a practice-module paywall
would mean paying $1–2K for an answer to a question the product no longer poses.
`ATTY-1`. This is the one hard gate in this document.

---

## 4. Conversion / pricing strategist

*Brief: one real user said he'd pay. ~72 visitors/month. Price, packaging,
placement — without recreating the `$19` banner failure.*

### Start with the uncomfortable part of the evidence

The operator's brief says the one real completed-funnel user said he'd pay. He
did. He also said three other things in the same breath, and all three cut
against the current plan:

> *"The scenarios first… then here's a script, 99 cents… your information is
> yours, we don't own it, we'll just give you the PDF… the paywall is the
> paperwork."*

1. **He said 99 cents.** The proposed price is roughly 4× the only price point
   any real user has ever named for this product.
2. **He put the scenarios on the free side and the paperwork on the paid side.**
   The plan sells practice-module script packs — the scenarios. His model is
   inverted by it.
3. **He used the privacy promise as the sales pitch for the paid thing.** *"Your
   information is yours, we don't own it"* is not an aside; it is the sentence
   immediately before the price. The only real customer's stated reason to buy
   *is* the claim being narrowed.

None of that reopens the decision. It does mean the pricing seat's honest
position is: **n=1, and the 1 disagrees with the packaging.** Proceeding is a
judgment call, which is allowed. Proceeding while describing it as validated by
user research is not, and that is the thing to avoid saying out loud later.

### The arithmetic, so nobody is surprised

Stripe US standard is 2.9% + $0.30 per successful charge. At small tickets the
fixed component dominates:

| Price | Stripe fee | Effective rate | Net |
|---|---|---|---|
| $0.99 | $0.33 | **33.2%** | $0.66 |
| $2.99 | $0.39 | 12.9% | $2.60 |
| $3.99 | $0.42 | 10.4% | $3.57 |
| $5.00 | $0.45 | 8.9% | $4.55 |

Volume, with the funnel constraint applied honestly: of ~72 monthly visitors,
only some fraction reach a completed practice level at all — the hub was
unreachable for most personas as recently as v2.7.0, and even after the `2160b40`
fixes the completion population is small. Call it 10–20 sessions/month that see
the ask, at a 3–8% purchase rate for a paid digital good with no institutional
backing.

**Expected: 0–2 sales/month. $0–$7 net.** That is the number. It is not a
pessimistic scenario; it is the central one.

Two consequences follow and both are actionable:

- **You cannot A/B a price at this volume.** Distinguishing $0.99 from $3.99
  conversion at ~1 sale/month takes years. Price must therefore be chosen on
  strategic grounds, not optimized. Anyone who later claims the price was
  validated will be reading noise.
- **The only thing worth learning in the first 90 days is whether *anyone*
  buys.** That argues for whatever price maximizes P(first sale), which is the
  lower one — not the revenue-maximizing one, because at these volumes there is
  no meaningful revenue to maximize.

### Recommendation

**Price: $2.99, one-time.** Reasoning, in order of weight:

- Clears the fee cliff. At 99¢ Stripe takes a third, and "a third of my rights
  app's revenue goes to a payment processor" is a bad sentence in every context
  including the operator's own head.
- Sits under Marcus's stated ~$5 ceiling, far under Rosa's $19 pain point,
  and is trivial for Dana. **It is the only price in the plausible range that
  no persona in the roster names as a barrier.** $3.99 clears Marcus too, but
  by less, and buys roughly one extra dollar per month.
- It is close enough to the real user's 99¢ to be defensible as informed by
  him rather than contradicting him.

**Packaging: one product, one price, one button.**

- **Per-state is the wrong unit and should be rejected outright.** Only TX, GA
  and NY carry differentiated content; 47 states and DC show the same federal
  floor. Selling "the Arizona pack" for real money when it is the same file as
  the Nevada pack is the kind of thing that generates one angry post and undoes
  a year of trust work. It also multiplies the SKU count by 51 for a product
  making $7 a month.
- **Per-module is honest and already exists in code** — `traffic` and `door`
  are genuinely different content, and `_hubTab` already models them. But two
  SKUs at one sale a month is still one SKU too many.
- **Ship one SKU: everything, $2.99, forever, one-time.** Fewest moving parts,
  nothing to explain, nothing to feel cheated by. Split it later if there is
  ever volume to split. There won't be for a long time.
- **One-time, never recurring.** The compliance seat, the fundraising research,
  and the only real user all independently reach this. Closed.

**Placement — this is where the money question is actually decided.**

The `$19` banner failed for a mechanism that is precisely nameable, and naming
it correctly is what allows a price to ship safely:

> It was a **future-tense** price on a **pre-trust** screen. Not a number
> problem. A tense-and-location problem.

So the rules are mechanical:

- **Never on step 0 or step 1.** The state picker is where the funnel already
  loses the most people and it is the literal screen the banner died on.
- **Never in the stepper, header, or any chrome rendered on 100% of sessions.**
- **Never during a scenario, and never on the Hard Mode level.**
- **Never in future tense.** No "free for now," no "$X after launch," no
  "support us so this can stay free." Present tense only.
- **Never visible to a user who has not completed at least one level.** If the
  practice hub shows a locked module with a price on first view, that is the
  `$19` banner with extra steps for anyone who lands on the hub cold. Gate the
  *price display* on the same signal the donation research chose: one completed
  scenario, self-selected, after value was delivered.
- **The correct primary slot is the post-level footer**, under the founder's
  signature — the one place in the product already speaking in first person,
  reached only by finishing something optional. This is the same conclusion the
  positioning doc reached for the donation ask, for the same reasons, and it
  transfers cleanly from "ask" to "price."
- **The free tier must stay genuinely complete.** State, contacts, lifelines,
  the printable rights card, both languages, and the core practice ladder stay
  free. If the free product becomes a demo, every persona finding in this repo
  needs re-running from zero and none of this analysis holds.

**Instrumentation:** one event when the price becomes visible, one on tap,
matching the existing `ph()` convention (`sr_pack_price_seen`,
`sr_pack_buy_tapped`), no amount, no identity. Read conversion off the Stripe
dashboard; never send purchase data back into PostHog. And pre-register the
guardrail metric now, before ship: **`sr_step_viewed` completion from state →
print, 60 days before vs 60 days after.** At 72/month that comparison is
underpowered and will not settle anything on its own — say so now, so that
whatever it shows later cannot be narrated into a conclusion it doesn't support.

Said once and then dropped, since the decision is made: at 72 visitors/month the
lever that changes revenue is not price, packaging, or placement. It is traffic
and the organizational endorsement. Every dollar figure above is bounded by a
number that pricing cannot move.

---

## 5. Trust / retention — adversarial seat

*Brief: argue the strongest case that this damages the product. Then say what
would have to be true for you to be wrong.*

### The case

**1. The line being removed is the thing that replaced the failed price banner.**

This is in the project's own version history and nobody has stated it in one
sentence, so here it is: in v2.1.0, commit `1e2fd0e`, the `$19 after launch`
banner was pulled from the state picker and *"replaced with the on-device
privacy line."* The proposal is to remove that replacement and reintroduce a
price. **That is a full revert of the only funnel fix in this product's history
with empirical backing, executed in both directions at once.** Whatever else is
true, the operator should know he is undoing a specific documented fix, not
making a neutral copy edit.

**2. The privacy claim is not a feature description. It is the product's answer
to its own category problem.**

Luis and Marisol both refuse a payment trail on this category of app. Marisol is
a green-card holder — legally secure — and refuses anyway, which the project's
own analysis correctly reads as *the objection is about the category, not the
buyer's status.* The privacy line is what tells them this app is not that
category. A visible price converts Amparo from "a thing someone made for me"
into "a product someone is selling to me," and the payment-trail objection
activates against the second frame regardless of whether they ever click.

**3. The specific thing being sold is the worst possible choice.**

The practice engine is (a) the single component under active UPL review, (b) the
component the UPL memo's own Q9 hypothetical deliberately excluded from the
charging question, and (c) the component the only real user said should be the
*free* hook. Selling it maximizes exposure on all three axes simultaneously. If
something must be sold, the paperwork was the answer the real user gave, and it
carries none of these three problems.

**4. Persona by persona, the damage is concentrated in exactly the people the
product exists for.**

- **Rosa** — Spanish-first, tight budget, "$19 is a real decision," says yes only
  when an institution vouches. A paid tier from a product with three empty
  attorney slots reads as *this is not for me*.
- **Tony** — his standing objection is that the claim grew while the backing
  didn't. Charging money is the largest possible claim-growth event, and
  `isReviewed()` still returns false for every state.
- **Marcus** — broke; free, gifted, or under ~$5; and critically, *he shares
  things that look sharp*. "Check this out, it's free" and "check this out, the
  good part costs money" are different messages with different forwarding rates.
  At 72 visitors/month, word-of-mouth is not a growth channel among several —
  it is close to the only one.
- **Keisha** — highest real need, lowest patience, 30-second window between
  fares. A payment step is a hard stop.
- **Luis, Marisol** — categorical refusal, unaffected by copy quality.
- **Dana** — genuinely converts. One persona out of thirteen.

**5. The trade is bad on its own arithmetic.**

Expected revenue is $0–7/month (§4). One user who closes the tab because a price
appeared — one person who does not print a rights card — costs more against the
product's own stated purpose than a year of that revenue. This is not a moral
argument dressed as an economic one; the economics genuinely do not clear the
bar, because there aren't any.

**6. The narrowed privacy sentence is better copy, and that is part of the
problem.** §2's replacement is honest, checkable, and defensible. It is also
*narrower*, and a user who saw the old line and returns to the new one has
watched the promise shrink. Nothing in the new sentence is false. Everything in
the transition is legible.

### What would have to be true for me to be wrong

Stated as falsifiable conditions, because an adversarial seat that cannot be
answered is just noise:

1. **The free product stays genuinely complete** — printable rights card,
   contacts, lifelines, both languages, and the core practice ladder all free,
   with the paid item a genuine supplement. If this holds, my case weakens
   sharply and most of §4's placement rules become sufficient protection.
2. **The price is never visible on a pre-trust screen** — not step 0, not step
   1, not chrome, not the first view of the practice hub. If price only ever
   appears after a completed level, the v2.1.0 mechanism does not reproduce and
   point 1 above loses most of its force.
3. **The privacy claim is narrowed truthfully, dated, and logged** — not
   deleted, not silently overwritten. §2 plus §3's changelog discipline.
4. **The attorney answers first**, on the amended question, and the answer does
   not flag the practice engine.
5. **Session replay is disclosed or deleted in the same commit.** A narrowed
   privacy claim shipping next to an undisclosed screen recorder is a worse
   position than the blanket claim ever was — and the one thing that would make
   my "the promise shrank" argument genuinely fatal rather than merely
   uncomfortable.
6. **The pre-registered funnel guardrail holds flat.** State → print completion,
   60 days before vs after, threshold named before ship. With the honest caveat
   that at 72/month it is underpowered — so if it holds, I was probably wrong;
   if it drops, that is suggestive, not proof; and either way the decision was
   made on judgment, which is legitimate as long as nobody relabels it as data
   afterward.

If all six hold, I am wrong and this ships without material damage. If items 1,
2, or 5 fail, I am right and the damage will not be visible in the numbers for
months.

---

## 6. Synthesis

### Where the seats agree

Unanimous, across five seats with different briefs:

- **Link out. Never embed.** Payments, privacy, compliance, and accessibility
  all reach this independently.
- **One-time, never recurring.** Payments (simplicity), compliance (removes a
  category), pricing (matches the only real user), trust (a stored card is the
  deeper trail).
- **Never on the state picker, never in future tense.** All five.
- **Copy and payment ship in the same commit.** Privacy and compliance, jointly
  and emphatically.
- **The free product must stay complete.** Pricing and trust, and it is the
  condition on which the adversarial seat agrees to be wrong.

### Where they disagree, honestly

- **Pricing says $2.99; the real user said $0.99.** Unresolved. The seat's
  recommendation stands on fee arithmetic, but the user evidence is the only
  user evidence that exists.
- **Payments says Rung A (zero server) may be sufficient; privacy prefers
  Rung B** because a signed token means no purchase record exists anywhere on
  Amparo's side. Rung B costs one function. Take Rung B.
- **Trust says sell the paperwork, not the practice engine.** That is a
  packaging question inside a decision already made, and it is the one place the
  adversarial seat's objection overlaps a live execution choice rather than the
  closed one. Worth thirty seconds of the operator's attention, no more.

### Recommended execution sequence

**Phase 0 — free, no legal exposure, do now, independent of everything else.**

1. Delete the false email-receipt sentence from `ab_privacy`, EN and ES. It
   describes a data flow that does not exist. This is a deletion and it should
   have happened already.
2. Delete `srReplayGuard()` and the replay config, or disclose replay in
   `ab_privacy` in both languages. Deletion is preferred: it removes an
   exposure and vendor weight together, and `sr_step_viewed` already measures
   the same drop-off.
3. Tell users the PDF they printed is their backup. One line. Closes most of
   the re-download need for free.

None of these depend on the monetization decision. All three make the product
more defensible whether or not a price ever ships.

**Phase 1 — blocked on `ATTY-1`. Amend the memo, then send it.**

4. Amend UPL memo §1 (the "no payment integration, none planned" assertion) and
   §4 Q9 (which asks about charging for the *pack*, not the *practice engine*).
   The plan inverts Q9's hypothetical. Sending it unamended buys an answer to
   the wrong question. **This gates everything below.**

**Phase 2 — build behind a flag, do not enable.**

5. `/api/claim` — one Vercel function, restricted read-only Stripe key, HMAC
   token, no database, no webhook. Four asserts in `test_claim.mjs`.
6. Stripe Payment Link, dashboard-configured, `$2.99`, one-time, one SKU,
   redirect to a claim URL. No CSP edit, no `Permissions-Policy` edit — verify
   that claim holds by testing before assuming it.
7. Entitlement written to `localStorage` once, at claim time. **Never
   re-verified on load.** Offline must not break for paying users.
8. Test the installed-PWA path on real iOS and real Android. This is where the
   bug will be.
9. Flag defaults off, mirroring `REVIEW.emailEnabled:false` — the pattern is
   already established at `index.html:2166` and it is the right one.

**Phase 3 — one commit, all of it, or none of it.**

**These must ship together and must not be separable:**

- The payment path enabled.
- The banner replacement, **EN and ES**, from §2.
- The `ab_privacy` additions: Stripe named, what Stripe sees, what Amparo
  stores (nothing, under Rung B), what stays free, mic disclosure moved in.
- The refund policy, published, next to the price.
- The terms of service.
- The changelog entry recording what the privacy sentence used to say, what it
  says now, and why.
- The price display gated on ≥1 completed practice level.

The window between shipping the payment and shipping the copy is the window in
which the product is lying to a paying customer. There is no acceptable
duration for that window.

**Phase 4 — after, and pre-registered before Phase 3.**

10. Watch `sr_step_viewed` state → print completion, 60 days before vs after.
    Write the threshold down now. Acknowledge in writing that it is
    underpowered at 72/month, so the result cannot later be narrated into
    whatever conclusion is convenient.

### The top 3 ways this goes wrong

**1. The UPL memo goes out unamended, or the paywall goes live before the
answer comes back.**

The memo states in writing that no payment integration exists and none is
planned, and its Q9 asks about charging for the printable pack *"never for the
practice engine."* The plan charges for the practice engine. Shipping first
means paying $1–2K for an answer to a superseded question, on the one component
the whole engagement exists to evaluate, in a circuit where the closest
precedent went against a free nonprofit doing adjacent work. This is the only
failure mode on this list that cannot be fixed by a later commit.

**2. The price becomes visible on a pre-trust screen — and v2.1.0 repeats
exactly.**

Not through a banner, because everyone now knows not to do that. Through a lock
icon with a price on the practice hub's first render. Through a module tab
labelled `$2.99`. Through a "what's included" comparison. Any of these puts a
number in front of a user who has not yet received value, which is mechanically
the same object as the `$19` banner. The counter is a single hard rule enforced
in review: **no price string may render for a user with zero completed levels**,
and it must be checked in the diff, not assumed from intent.

**3. Copy and payment ship separately — or the narrowed claim ships next to the
undisclosed recorder.**

Two versions of the same failure. Either the payment path goes live while the
banner still promises "nothing you enter leaves your phone," or the new,
narrower, honest sentence ships while `srReplayGuard()` is still uploading
screen recordings of the first two screens with no disclosure anywhere. Both
produce the same artifact: a product that made a promise, took money, and left a
false or incomplete statement standing. That artifact is far more damaging than
the $7/month is valuable, it is permanent once screenshotted, and it is entirely
avoidable by sequencing.

Honorable mention, mechanical rather than strategic: **the installed-PWA
redirect loss.** The user pays in the system browser, the PWA never learns, and
there is no callback path because `COOP: same-origin` severs `window.opener`.
It will not reproduce in desktop testing. Budget for it.

---

## Attorney-flag register

Nothing in this document is legal advice and no legal text, statute, or citation
is generated anywhere in it. These are the questions to route to counsel.

| ID | Question | Gates |
|---|---|---|
| `ATTY-1` | The UPL memo asserts no payment integration exists and none is planned; Q9 asks about charging for the printable pack *"never for the practice engine."* The plan charges for the practice engine. Amend §1 and Q9 before sending. | **Everything in Phase 2 and 3.** Hard gate. |
| `ATTY-2` | Terms of service for a paid digital good, including how the empty attorney sign-off and the "not legal advice" framing must be restated for a paying customer. | Phase 3 |
| `ATTY-3` | Only if recurring is ever reconsidered: the auto-renewal disclosure/consent/cancellation regime, federal and state. Current recommendation is to avoid the category entirely. | n/a if one-time |
| `ATTY-4` | Whether the §2 disclosures are *sufficient*, as distinct from *true*. §2 only establishes truth. | Phase 3 |
| `ATTY-5` | Entity formation now that money is involved — same question as UPL memo Q12, but the answer may change once there is revenue and a personal name on the Stripe account. | Phase 2 |
| `ATTY-6` | State consumer-protection exposure arising from narrowing a previously-advertised privacy claim on a product that now charges. Scope, private rights of action, and treatment of a pre-change claim all vary by state; not self-assessed here. | Phase 3 |

## RECON needed

- **Fluent cold read of the Spanish replacement sentence in §2.** Drafted by a
  non-native writer following the corpus convention. Marisol's bar is that it
  reads as written, not translated. One reader, no English shown.
- **Installed-PWA purchase round trip**, real iOS and real Android, before ship.
- **Confirm the claim that `/api/*` needs no CSP edit** by deploying a stub
  function and watching for a violation report — asserted from reading
  `connect-src 'self'`, not observed.
