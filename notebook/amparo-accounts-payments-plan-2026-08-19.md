# Amparo — Accounts, Payments & Trust plan (2026-08-19)

**Lens:** product strategist + monetization designer + trust/privacy designer.
**Build examined:** HEAD after v2.24.1 (`e9b0b9b`). All line references verified against
current source this session: `index.html` (6,498 lines), `arena/index.html` (1,605 lines),
`app-src/src/content/t.en.json` / `t.es.json`, `api/create-checkout-session.ts`,
`app-src/src/clerkAndConvex.ts`, `vercel.json`.

**Infra state found (not assumed):** the accounts era is already half-provisioned —
`vercel.json`'s CSP whitelists `js.stripe.com`, `api.stripe.com`,
`divine-swine-18.clerk.accounts.dev`, and `agreeable-gopher-346.convex.cloud/.site` (ws
included); `api/create-checkout-session.ts` exists (inert, nothing calls it);
`app-src/src/clerkAndConvex.ts` is a wiring pattern (not imported anywhere);
`app-src/convex/` contains only `_generated` + tsconfig — **the schema is greenfield, which
is the single biggest design lever in this plan (§4.1)**. Root already runs PostHog
(`index.html:1641–1651`, `ph()` at `:1672`) and discloses it honestly (`ab_privacy:2055`).

---

## 1. The account value proposition — what an account should give a scared person

The user is someone preparing for a police stop — possibly undocumented, possibly with a
DV history (door module), definitely not looking for another SaaS relationship. An account
is a *liability they accept* in exchange for something concrete. Rank by honest value:

### Ranked: what an account should give

1. **Purchase restoration (the #1 honest reason, and it's created by your own product).**
   The arena ships a proud "Wipe my data" control (`arena:587`) and localStorage is
   fragile (iOS 7-day ITP eviction, browser resets, new phone). The moment a $6.99 pack
   is real, a wipe or a lost phone destroys a paid entitlement. An account is the only
   honest fix: *"Your purchases survive your phone."* This is also the answer to §4.7
   (what happens to paid content on wipe). Guests get a receipt-email claim link (§2.4);
   account holders get it automatically.
2. **Pack re-print across devices — minimal field set only.** The stated reason, scoped.
   `sr_save` (`index.html:3844`) holds `{state, name, ec, ecp, ec2, ecp2, att, zip, email,
   lang, step, …}`. Sync **only** `{state, zip, lang, step, printedEdition, entitlements}`.
   That's enough to regenerate a pack skeleton on a second device in 30 seconds. Do NOT
   sync by default: `name`, emergency contacts (`ec/ecp/ec2/ecp2`), attorney number
   (`att`) — those map the user's support network (§4.1). `sr_docs` (document photos,
   `index.html:3740`) must be **structurally impossible** to sync: no Convex field, no
   upload path, ever.
3. **Progress sync between root practice and the arena.** `amparo_prx` and `amparoArena`
   already ignore each other (wargames/30 §4); the account is the clean place to unify
   them — but sync only **counts** (drills done, streak, best scores). Never typed/spoken
   answers, never per-turn history. Counts are motivation; transcripts are evidence.
4. **Org accounts (the actual business).** A $149/$499 org buyer needs an invoice, a
   receipt, a re-download of the facilitator PDF, and seat-less access for workshop
   projectors. This is where accounts carry real weight, and org staff aren't the
   at-risk population — their account risk profile is normal.
5. **Gift links, not family accounts.** The arena already has the right instinct:
   `giftDeep` (`arena:1573`) — "a gift link they open on THEIR phone — their data stays
   theirs." Family *sharing* via linked accounts would build a household graph of at-risk
   people on your server. Ship gift entitlements (buyer pays, recipient redeems a code,
   identities never linked). Defer real family accounts indefinitely.

### What would betray the product (never ship)

- **Server-side practice content.** Typed/spoken answers, freeze events, heat, per-turn
  logs. The arena's whole pitch is "mistakes here are free" (`fine`, `arena:674`).
- **Email nurture.** No drip sequences, no "you haven't practiced!" Law-change alerts are
  the one defensible email — **strictly opt-in, off by default**, and root already framed
  it that way (`i_email_ph:2081` "kept only at our email service").
- **PostHog↔Clerk identity join.** Never call `posthog.identify()` with the Clerk id.
  `ab_privacy` promises "never who you are" — one identify call makes it a lie.
- **Account-gated safety content.** Sign-in must never stand between a user and the
  scripts, the arena, the lifelines, or the free pack. Account = save/restore, nothing else.

---

## 2. Payment design

### 2.1 Which price points survive contact with reality

| SKU | Today | Verdict |
|---|---|---|
| Script Pack $3.99 (`arena:606`, `:1476`) | Formatted checklist + flashcards of content that is already free on screen | **Weakest.** Survives only as "formatting convenience." Recommend folding into Deep Pack at launch; reintroduce later only if data begs for a low tier. Two SKUs at launch is one SKU too many for a preview-trained audience (FG23 BS-3). |
| Deep Pack $6.99 (`arena:480,:607,:1477`) | Courthouse directions, family plan page, wallet card PDF, ICE addendum | **Survives — flagship digital SKU.** Real compilation labor, real artifact. One price, one product, one decision. |
| Vault Pass $19 (`mW1a`, arena bank) | Apple/Google Wallet card — **no generator exists in the repo** | **Cut.** FG23 golden #4 already named it a fabrication. Do not price vaporware; re-add when built. |
| Org Starter $149 / Chapter $499 (`arena:572–573`, strings `o1a/o2a` `:675/:680`) | Printed packs + guides, currently mailto `orgs@amparohq.com` (`arena:576`) | **Survive — this is the revenue line.** Physical goods + org budgets + no at-risk-individual data. Keep invoice-first (§2.3). |

### 2.2 Where the free/paid line is — argued precisely

**The line: rights information is free; artifacts and physical goods are paid.**
Anything a person would need to *know or say during the stop itself* — every script line,
every state rule, every crisis number, the whole arena, the basic printable pack — free
forever, no account. What's fair to charge for: *formatting, compilation, paper, and
convenience* — the professionally laid-out Deep Pack PDF, printed bulk packs, co-branding.

One correction to the current Deep Pack: the **ICE-encounter addendum's safety content**
(what to say, what not to sign) must also exist in the free tier for the states that need
it. Charging the most-scared user for the highest-stakes information is both a betrayal
and a UPL aggravator (§4.5). The paid version is the *formatted family-plan artifact*
that contains it — the knowledge itself stays free. Same rule as everything else: free =
what you need in the car; paid = the nice PDF of it.

### 2.3 Stripe mechanics — simplest correct integration for a Convex backend

**Recommendation: hosted Stripe Checkout (one-time `mode:'payment'`) + one webhook into
Convex. No PaymentIntents, no Elements, no subscriptions.**

- **Not Payment Links** for the packs: fulfillment here is a *digital unlock* (the PDF is
  generated client-side), so you need a programmatic "this session paid" signal. Payment
  Links can't carry that cleanly into Convex without the same webhook you'd write anyway.
- **Not subscriptions** for orgs: $149/$499 are one-time bulk purchases, not recurring.
  Use **Stripe Invoicing** (or a Payment Link as a stopgap) — org buyers want invoices
  for their finance process; the current mailto flow already proved that instinct right.
- **Fix `api/create-checkout-session.ts` before wiring it** (three concrete flaws):
  1. It accepts a client-supplied `priceId` (`:36`) — anyone can check out *any* price in
     the account. Replace with a server-side map: client sends `{sku:'deep'}`, server
     resolves the Price ID.
  2. `successUrl`/`cancelUrl` are unvalidated (`:37`) — validate same-origin.
  3. No fulfillment path exists. Add `checkout.session.completed` webhook → Convex
     `entitlements` mutation. Convex HTTP actions (`convex.site` is already in the CSP)
     are the natural webhook receiver — one system owns entitlements.
- **Guest checkout stays possible** (undocumented users must never be forced through
  Clerk to pay): entitlement keyed to the Checkout Session; success page hits a
  `verify-session` endpoint to unlock locally; Stripe's receipt email carries a claim
  link to re-unlock later or attach to an account. `customer_creation: 'if_required'`,
  collect nothing beyond what Stripe requires.
- **Statement descriptor and product names: "AMPARO" / "Amparo Deep Pack".** Never put
  "ICE" or "police" in a Stripe product name or descriptor — Stripe records are
  permanent, discoverable, and outside your deletion power (§4.2).
- **Stripe Tax: enable from day 1.** Digital-goods tax registration thresholds won't
  trigger at this volume, but it's a checkbox now and a migration later.

### 2.4 Ship sequence

1. **v2.25 — honest strings first** (§3): the trust copy must change *before or with* the
   first real charge, never after. Includes killing the $19 Vault Pass and the "vetted
   attorney" divs (FG23 golden #4) — the checkout can't be the only honest thing on the modal.
2. **v2.26 — Deep Pack live**: hardened checkout endpoint + webhook + Convex
   `entitlements` table + guest claim links. Attorney review of the paid artifact is a
   **gate** for this step (§4.5), not a follow-up.
3. **v2.27 — accounts (Clerk) as restore-and-sync**: optional sign-in on /app first
   (lazy-loaded per `clerkAndConvex.ts`'s own pattern), syncing the §1.2 minimal field
   set + entitlements + progress counts. Root and arena read entitlement state; they do
   not require sign-in.
4. **v2.28 — org flow**: Stripe Invoicing behind the existing orgs modal; mailto stays as
   the fallback path.

---

## 3. Trust copy — the honest replacement wording

### 3.1 Principles

Local-first stays the default and the headline. The new sentence structure everywhere:
**what stays local (default) → what an account optionally stores (enumerated) → who
processes payments.** Never "nothing leaves your phone" unqualified again; never a
euphemism for the server either.

### 3.2 Draft replacement strings (EN + ES)

**`pilotBanner`** (root `:1692` static, `:1856` EN, `:2221` ES; `t.en.json:2`, `t.es.json:2`):
- EN: "Free. What you enter stays on your phone. An optional account can save your pack
  and purchases — you choose what syncs."
- ES: "Gratis. Lo que escribes se queda en tu teléfono. Una cuenta opcional puede guardar
  tu paquete y tus compras — tú eliges qué se sincroniza."

**`w_b4`** (root `:1862`/`:2227`; `t.*.json:17`):
- EN: "Private by default — your info stays on your phone"
- ES: "Privado por diseño — tu información se queda en tu teléfono"

**`cmp_price`** (root `:2188`/`:2539`; `t.*.json:501`):
- EN: "Free. No card, no subscription, no account required. An account is optional and
  only saves your pack and purchases."
- ES: "Gratis. Sin tarjeta, sin suscripción, sin cuenta obligatoria. La cuenta es
  opcional y solo guarda tu paquete y tus compras."

**`ab_privacy`** (root `:2055`/`:2408`; `t.en.json:275`, `t.es.json:275`) — full redraft, EN:
> "Amparo is local-first: your pack lives on your device and works with no account. Your
> document photos and your emergency contacts **never** leave your phone — there is no
> way to upload them, so they can't be handed over even under pressure. If you create an
> optional account (through Clerk), we store only: your email, your state and ZIP, your
> language, and which packs you bought — so your pack and purchases survive a lost phone.
> Payments run through Stripe; your card number never touches Amparo. Deleting your
> account erases everything we stored. We count anonymous events (like how many packs get
> printed, and in which state) to prove the tool is used — never who you are, never what
> you type."

ES twin (same structure): "Amparo funciona primero en tu dispositivo: tu paquete vive en
tu teléfono y funciona sin cuenta. Tus fotos de documentos y tus contactos de emergencia
**nunca** salen de tu teléfono — no existe forma de subirlos, así que no pueden ser
entregados ni bajo presión. Si creas una cuenta opcional (con Clerk), guardamos solo: tu
correo, tu estado y código postal, tu idioma y qué paquetes compraste — para que tu
paquete y tus compras sobrevivan un teléfono perdido. Los pagos pasan por Stripe; tu
número de tarjeta nunca toca Amparo. Borrar tu cuenta elimina todo lo que guardamos.
Contamos eventos anónimos (cuántos paquetes se imprimen y en qué estado) para demostrar
que la herramienta se usa — nunca quién eres, nunca lo que escribes."

**Arena `p1`** (static `:584`, EN bank `:675`, ES bank `:680`):
- EN: "Your answers, scores and practice history live ONLY in this browser's local
  storage. No analytics, no cookies. If you sign in (optional), only your completion
  counts and purchases sync — never what you type or say."
- ES: "Sus respuestas, puntajes e historial viven SOLO en el almacenamiento local de este
  navegador. Sin analítica, sin cookies. Si inicia sesión (opcional), solo se sincronizan
  sus conteos y compras — nunca lo que escribe o dice."
- (Drop the words "No account, no server" — they become false the day sign-in exists
  anywhere on the domain.)

**Arena `fine`** (static `:526`, EN `:674`, ES `:679`):
- EN: keep v2.24.1's corrected sentence, swap the privacy clause: "…Everything stays on
  this device unless you sign in to save purchases (optional). Officer lines are
  pre-recorded audio served with this site; voice INPUT uses your browser's speech engine
  and is never recorded by Amparo…"
- ES — **bug found this session: the ES `fine` (`:679`) still says "La voz usa el motor
  de su navegador" with no pre-recorded-audio sentence. v2.24.1's fix reached EN only.**
  Fix regardless of the accounts work: "…Las líneas del oficial son audio pregrabado
  servido con este sitio; la ENTRADA de voz usa el motor de su navegador y Amparo nunca
  la graba…"

**Payment modal strings** (arena EN `:677`, ES `:682`) when Stripe goes live:
- `payDemo` → EN: "Secure checkout by Stripe. Your card details go to Stripe — never to
  Amparo." / ES: "Pago seguro con Stripe. Los datos de su tarjeta van a Stripe — nunca a
  Amparo."
- `payOkT` → EN: "Payment complete — your pack is unlocked." / ES: "Pago completado — su
  paquete está desbloqueado."
- `payOkSub` → EN: "Your receipt is in your email from Stripe. That receipt is also your
  key: it restores this purchase on any device." / ES: "Su recibo llegará por correo de
  Stripe. Ese recibo es también su llave: restaura esta compra en cualquier dispositivo."
- `payPriv` (`:657`, banks `:677/:682`) → EN: "Your PDF is still generated on this device.
  Stripe processes the payment; Amparo stores only which pack you own." / ES twin.

### 3.3 Full inventory of strings needing update (verified line refs)

**Root `index.html`:** `:1692` (static pilot div), `:1856`/`:2221` `pilotBanner`,
`:1862`/`:2227` `w_b4`, `:2055`/`:2408` `ab_privacy`, `:2188`/`:2539` `cmp_price`,
`:2082`/ES twin `i_email_note` (stays true — reaffirm "photos and documents are never
emailed"). Comment debt: `:5334` ("Nothing is stored, nothing is uploaded") — still true
for practice; leave.

**Arena `arena/index.html`:** `:447` avatar title ("Demo only — Amparo has no accounts"),
`:475` `shareNote` (still true), `:526`+`:674`+`:679` `fine` (incl. the ES divergence
bug), `:584`+banks `p1`, `:587` `p4` (wipe copy must add: "Purchases restore from your
receipt or account after a wipe" once entitlements exist), `:626` `inF` ("your practice
never leaves this device" — still true if §1 rules hold; keep), `:657`+banks `payPriv`,
banks `payDemo`/`payOkT`/`payOkSub`/`payDl` (`:677`/`:682`), `:572–573`+banks
`o1a/o1b/o2a/o2b` (org tiers — fine as-is), dead `payEmail` string in both banks (delete,
per FG23 BS-3), `mW1a/mW1b` $19 Vault Pass + `mW2a/mW2b` "vetted attorney" (delete —
FG23 golden #4).

**`app-src` (`t.en.json`/`t.es.json`):** `:2` `pilotBanner`, `:17` `w_b4`, `:275`
`ab_privacy`, `:321` `i_email_note`, `:501` `cmp_price`. Plus `:101` `hub_arena_sub`
(v2.24.1 already dropped the carryover claim — re-verify after account sync actually
makes carryover TRUE; then the sentence can honestly return).

---

## 4. Blindspots

1. **The Convex schema is the privacy policy.** It's empty today — write it as the
   enforcement mechanism, not just storage. If the `packs` table has no field for
   documents, contacts, or names, then no future bug, breach, or subpoena can produce
   them. Schema for v2.27: `users {clerkId, state?, zip?, lang}`, `entitlements
   {userOrSession, sku, stripeSessionId, createdAt}`, `progress {userId, rootCounts,
   arenaCounts}`. Nothing else. Every field addition is a privacy-policy amendment and
   should be treated with that gravity (update `ab_privacy` in the same commit — the
   string *enumerates* the stored fields, so drift = lying).
2. **Stripe is a permanent, undeletable record — subpoena/ICE exposure lives there, not
   in Convex.** You can hard-delete Convex rows; Stripe retains transaction records
   (name, card, email, product) for years under financial regulations, and they're
   reachable by legal process against Stripe without you ever being served. Mitigation
   is *data minimization at purchase time*: generic product names ("Amparo Deep Pack",
   never "ICE addendum"), generic statement descriptor ("AMPARO"), no address collection
   beyond what card verification forces, guest checkout allowed. Say this plainly in the
   privacy copy: "Stripe keeps payment records as required by law; that's why we name
   products generically."
3. **Clerk holds sign-in emails and IP logs.** Third-party processor, US jurisdiction,
   its own legal-process surface. Offer passkeys (no password reuse) and don't require
   email verification loops beyond Clerk defaults. Accept: an account is inherently a
   record that this person uses Amparo. That's exactly why it must stay optional and why
   the free path must never degrade — the most at-risk users should rationally choose no
   account, and the product must stay whole for them.
4. **Chargebacks on a legal-info product.** At $6.99, a dispute costs ~$15 + the sale —
   never fight one. Policy: refund on request, 30 days, no questions (cost basis ≈ $0;
   goodwill and dispute-avoidance are worth more than the margin). Publish the refund
   policy on the checkout modal (Stripe also requires an accessible refund policy).
   Liberal refunds are also the honest answer to "I bought it while scared."
5. **UPL: paid changes the calculus, and your own memo is now stale.**
   `api/create-checkout-session.ts:1–7` already flags it: the unsent UPL engagement memo
   tells counsel "no payment integration anywhere in the codebase" — false since that
   file exists. Update the memo appendix **before** sending. Substantively: selling
   state-specific "what to say" scripts is a stronger UPL fact pattern than giving them
   away (consideration + specificity are aggravators in several states). Gates: attorney
   review of the *paid artifacts specifically* before v2.26; keep the
   general-information/not-legal-advice framing on the paid PDFs themselves; keep every
   rights statement also available free (§2.2's line is a legal-defense line, not just
   an ethical one). The "vetted attorney — free case review" fabricated upsell would be
   an actual referral-service claim — deleting it (FG23 golden #4) is now UPL hygiene,
   not just honesty.
6. **PostHog identity join** (§1): one `posthog.identify(clerkId)` call falsifies
   `ab_privacy`. Add a code-review tripwire (grep for `identify(` in CI or the loop's
   audit) — this is the single most likely accidental betrayal because every analytics
   tutorial tells you to do it.
7. **Paid content vs "Wipe my data" and localStorage fragility.** Decided by §1.1/§2.3:
   entitlements live server-side (Convex) keyed to session or account; the device flag is
   a cache. Wipe copy (`arena:587` `p4`) gains one sentence: purchases restore via
   receipt link or account. Without this, the first wiped paying customer is a chargeback
   and a one-star story.
8. **Ghost infrastructure: root fetches `/.netlify/functions/send-pack`
   (`index.html:4652`) on a Vercel deploy.** Correctly gated off (`emailEnabled:false`,
   `:2740`) — but when payments ship, don't resurrect it: Stripe's own receipt email
   covers the need with zero new PII surface. Delete the dead path in the payments PR.
9. **Free-tier ceilings and outages.** Convex/Clerk free tiers are fine for launch scale,
   but the *local-first architecture is the outage story*: if Convex is down, packs still
   build, arena still drills, checkout fails gracefully. Preserve that: no runtime
   dependency on Convex for any free path (lazy-load providers exactly as
   `clerkAndConvex.ts` already prescribes — that file's pattern is correct, keep it).
10. **Sales tax** — enable Stripe Tax at integration time (checkbox now vs migration
    later); digital-goods nexus won't bite at launch volume but org invoices at $499
    accumulate faster than you think.

---

## 5. Beyond payments — top 5 value adds (report backlog + this analysis)

1. **The attorney/DV-clinician review pipeline, made real and visible.** Highest-leverage
   item in the whole product: it unblocks the held door module (`HELD_SITS`, the DV
   users' content), retires the `TODO_ATTORNEY` debt, is a **hard gate for paid packs**
   (§4.5), and converts `heldB`'s present-tense claim ("is with the reviewers" — FG23
   BS-2's RECON) from risk to proof. Add a public "reviewed by" line when done — the
   biggest trust multiplier available. *Effort: small in-repo (a status page + honest
   tense); the real work is external counsel — weeks, mostly waiting.*
2. **Entitlement + restore infrastructure** (this plan's §2.3/§2.4): webhook → Convex →
   claim links. It's not just payments plumbing — it's the first user-visible account
   value and the wipe-safety fix. *Effort: 2–4 days including the checkout-endpoint
   hardening.*
3. **Collapse the arena's first run.** Keisha's stopwatch (FG22/FG23): five sequential
   gates (intro → 3-panel tutorial → supervision → safety checklist → first line) before
   any drill. Batch to two screens (one combined orientation card + one combined
   safety/supervision card), defer the tutorial to a "?" chip. The product's fastest
   surface has the slowest start; conversion to *practice* is the metric everything else
   (streaks, readiness, purchases) sits behind. *Effort: 1–2 days, strings already exist.*
4. **Two-trainers progress visibility** (wargames/30 §4's read-only cross-store display):
   root hub card shows arena counts, arena sidebar shows root counts — one file each,
   display-only, no migrations. It's also the on-ramp for account progress sync (§1.3):
   ship the local version now, the synced version rides v2.27 for free. *Effort: half a
   day.*
5. **Safety-signal polish pair:** (a) audio-failure signal — `speakOfficer`'s `onerror`
   currently swallows failure silently; flash a struck-through speaker so Omar can tell
   "we chose silence" from "something broke" (FG23 BS-1). (b) Freeze→crisis routing —
   third freeze in a session offers gentle mode + the 988 line instead of a third −1
   (FG23 BS-5: freezing is the behavioral distress signal the arena already measures).
   *Effort: 1 day combined; also fix the ES `fine` divergence (§3.2) in the same pass —
   one string.*

---

## Sequence, one line

Honest strings (v2.25) → Deep Pack + entitlements behind the attorney-review gate
(v2.26) → optional Clerk accounts with the minimal schema (v2.27) → org invoicing
(v2.28) — with the door module and the review-pipeline announcement landing whenever
counsel clears them, and the free local-first path never behind any of it.
