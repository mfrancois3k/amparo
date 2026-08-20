# Prompt — enable Stripe on the Convex production deployment

Hand this whole file to the executing agent. Everything below the divider is its instruction set.

Scope note for the human (you) before you hand it over: two steps are **yours**, not the agent's —
creating the Stripe webhook endpoint (the agent has no Stripe account access) and supplying the two
secret values (an agent should not be reading credentials out of your dev deployment to copy them).
The agent does the verification, the Deep Pack fix, and the round-trip test. Those are the parts
that actually benefit from being automated.

---

# Mission

Get Amparo's Convex **production** deployment (`stoic-falcon-22`) ready to accept **test-mode**
Stripe payments, with a verified end-to-end purchase round-trip — and close the one fulfilment gap
that currently makes live payments unsafe. You are not turning payments on for real users. That is a
separate human decision and a separate flag.

# Verified starting facts — do not re-derive, do not assume otherwise

Confirmed 2026-08-20 by direct inspection. If any check below contradicts these, **stop and report**
rather than adapting silently — it means something changed.

- Prod deployment: `stoic-falcon-22`. Dev: `grandiose-armadillo-240`. The app now points at prod
  (`arena/index.html` `CHECKOUT_URL`, `app-src/.env.production`, built `app/` bundle).
- Prod env currently holds **exactly two** vars: `SITE_URL`, `CLERK_JWT_ISSUER_DOMAIN`. No Stripe.
- Dev holds four (the two above plus `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). **Do not read,
  print, copy, or migrate those values.** The webhook secret is per-endpoint and copying it would
  fail signature verification on every event anyway.
- Webhook route: `POST /stripe` (`app-src/convex/http.ts:16`). Only event consumed:
  `checkout.session.completed` (`app-src/convex/stripe.ts:135`).
- Checkout: `POST /checkout` with `{"product": "..."}`. Valid products: `script` ($3.99),
  `deep` ($6.99), `tip` ($3.00) — `app-src/convex/stripe.ts:15-18`.
- With no Stripe key, `/checkout` returns **HTTP 503 "Payments not configured yet"** for a valid
  product, and **400 "Unknown product"** for an invalid one. The arena treats 503 as its honest
  preview path.
- `PAYMENTS_LIVE=false` at `arena/index.html:1559`. This is a **separate gate** from the keys.

# The blocker you must resolve first

**Deep Pack ($6.99) is purchasable but delivers nothing.**

- `renderScriptPack` (`arena/index.html:1613`) is the only fulfilment renderer in the repo.
- It fires only for `product === 'script'` (`arena/index.html:1660`).
- `deep` is offered at `arena/index.html:1701`. `grantEntitlement` writes a localStorage flag and
  nothing else happens. There is **no Deep Pack renderer anywhere** — verify this yourself before
  acting; if one now exists, this blocker is resolved and you say so.
- The comment at `arena/index.html:1553` warns about exactly this. It is now half-stale: the Script
  Pack shipped in `606b901`, so that half is resolved. The Deep Pack half is still true.

**Pick one and say which you picked, with your reasoning:**
- **(a)** Remove `deep` from the arena's purchase menu until a deliverable exists. Smaller, safer,
  reversible. Default choice.
- **(b)** Build the Deep Pack deliverable — described at `arena/index.html:637` as "Courthouse page,
  family plan, wallet card, ICE annex". This is real content work, and **content is where this repo's
  hard rules bite**: no statute text, no legal citations, no officer dialogue authored by you. If the
  deliverable needs any of that, it is out of your scope — take (a) and flag it.

Do not proceed past this section with `deep` purchasable and undeliverable.

# Human gates — stop and ask, do not work around

1. **Creating the Stripe webhook endpoint.** You have no Stripe access. Ask the operator to create it:
   URL `https://stoic-falcon-22.convex.site/stripe`, event `checkout.session.completed`. They give you
   back nothing but a confirmation — the `whsec_` goes in via step 2.
2. **The two secret values.** Ask the operator to run these themselves, from `app-src/`:
   ```
   npx convex env set --prod STRIPE_SECRET_KEY sk_test_...
   npx convex env set --prod STRIPE_WEBHOOK_SECRET whsec_...
   ```
   **Never** ask them to paste a secret into the chat. Never echo, log, or write a secret value to a
   file. If you ever run `convex env list` without `--prod`, pipe it through a redactor — it prints
   values in cleartext.
3. **Test mode only.** If the operator supplies an `sk_live_` key, stop and confirm explicitly that
   they intend real money on a product whose Deep Pack gap you just handled. Default is `sk_test_`.
4. **Never flip `PAYMENTS_LIVE` to true.** Not part of this mission. It is the operator's call and
   its own comment says flip it only once a payer actually receives something.

# Steps

1. **Verify the starting state.** `npx convex env list --prod` shows exactly the two non-Stripe vars.
   `curl -sS -X POST https://stoic-falcon-22.convex.site/checkout -H 'Content-Type: application/json'
   -d '{"product":"script"}' -w '\nHTTP=%{http_code}\n'` returns **503 / "Payments not configured yet"**.
   *Expected:* both match. *If not:* stop and report — the world changed since this prompt was written.
2. **Resolve the Deep Pack blocker** per the section above. Commit that change on its own.
3. **Human gate 1** — operator creates the webhook.
4. **Human gate 2** — operator sets both env vars.
5. **Re-verify.** `npx convex env list --prod` now shows four vars (names only — do not print values).
   `/checkout` with `{"product":"script"}` now returns **HTTP 200** and a JSON body containing a
   `url` on `checkout.stripe.com`. *If it still 503s:* the key did not land — the operator ran the
   command against dev, or in the wrong directory. Have them re-run from `app-src/`.
6. **Round-trip test.** Open the returned Stripe URL, pay with test card `4242 4242 4242 4242`, any
   future expiry, any CVC. Confirm on return that: the redirect carries `checkout=success` and a
   `cs_`-prefixed `session_id`; `/redeem` is called and returns `ok`; `renderScriptPack` actually
   renders; and the URL is cleaned by `history.replaceState`. *Most-likely failure:* `/redeem`
   returns not-ok because the webhook never fired — check the Stripe dashboard's webhook delivery log
   for a signature-verification failure, which means `STRIPE_WEBHOOK_SECRET` does not match the
   endpoint that sent the event.
7. **Confirm the purchase recorded.** `purchases.record` inserts into the `purchases` table
   (`app-src/convex/purchases.ts:18`). Verify one row exists for the test purchase.
8. **Write it up.** Update `LEDGER.md` and `notebook/HANDOFF.md` with: what is now configured, that
   it is **test mode**, that `PAYMENTS_LIVE` is still `false` and why, and how Deep Pack was handled.
   Commit. Do not push without the operator's go-ahead.

# Definition of done

- Deep Pack is either deliverable or not purchasable — stated explicitly, with reasoning.
- Prod holds four env vars; you never saw or printed a secret value.
- `/checkout` returns 200 with a Stripe URL for `script`.
- A test purchase round-tripped: paid → `/redeem` ok → pack rendered → row in `purchases`.
- `PAYMENTS_LIVE` is still `false`.
- `LEDGER.md` + `HANDOFF.md` updated; committed, not pushed.
- Anything you could not verify is written down as unverified, not asserted. This repo has a
  documented history of agents reporting confidently wrong findings — check source yourself.
