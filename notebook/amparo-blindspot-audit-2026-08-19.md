# Blind-spot audit #3 — the backend era (v2.25.0 + v2.26.0)

Date: 2026-08-19 · Lens: principal engineer / hostile reviewer · Scope: the first audit since
Amparo grew a server, an identity provider, a payment processor and a third-party SDK —
`app-src/convex/*` (schema, packs, purchases, stripe, http, auth.config), `tools/sentry-entry.js`
plus the built `sentry.js`, `vercel.json`, the `app/index.html` meta CSP, the three feedback
shims, and the shipped bundles in `app/assets/`.

Every claim below is backed by a source read or a command actually run in this session
(`git log --all --diff-filter=A`, `git log -S`, `git check-ignore -v`, `npx tsc --noEmit` on both
tsconfigs, greps over built bundles and over `app-src/node_modules/@sentry/*` source).
Claims I could not verify from source are marked **UNVERIFIED** inline.
Prior audit: `notebook/amparo-blindspot-audit-2026-08-18-02.md`. Design and monetization overlap
is owned by `wargames/31-paywall-meets-ladder.md` and is not re-litigated here.

---

## CRITICAL

### C1. Real Stripe Checkout takes money for a product that has no fulfillment path and no return handling

`arena/index.html:1503,1514-1526` → `app-src/convex/http.ts:44` → `stripe.ts:57`. A user taps
"Pay $6.99", is redirected to Stripe's hosted page, pays, and is returned to
`success_url: ${site}/arena/?checkout=success` (`stripe.ts:79`).

Verified by grep across `arena/index.html`, `index.html`, `app/index.html` and all of `app-src/src`:

- `checkout=success` — **0 hits.** `checkout=cancelled` — **0 hits.**
- `URLSearchParams` / `searchParams` — **0 hits.** `location.search` — **0 hits** in root and arena.
- No artifact named or generated for "Script Pack" or "Deep Pack" anywhere in the repo.

So the entire post-payment experience is: the arena reloads and looks exactly as it did before.
No thank-you, no download, no unlock, no acknowledgement that money changed hands. The only
evidence the user has is Stripe's emailed receipt for **"Amparo Deep Pack"**, a thing that does
not exist. `purchases.record` writes a row nobody reads — `purchases.mine` has **0 callers**
(grep over `app-src/src`, `index.html`, `arena/index.html`).

The only thing standing between this and taking real money from someone scared enough to buy a
rights pack is `STRIPE_SECRET_KEY` still being test-mode — which the v2.25.0 changelog describes
as "the live key swap is the last step to real revenue." It is not. Fulfillment is.

Smallest correct action, in order: (1) do not swap the live key; (2) if the buttons must stay live,
gate them on the deliverable existing; (3) at minimum, handle `?checkout=success` with an honest
"your receipt is on its way, the pack is coming — write to hello@amparohq.com" screen. A chargeback
from this cohort is not a support ticket, it is the product's reputation.

### C2. The root Privacy section still says "Amparo keeps no accounts and no database of who you are"

`index.html:2063` (EN `ab_privacy`) and `:2416` (ES twin), rendered at `:3122` inside the About
modal — the product's formal privacy disclosure.

v2.25.0 shipped Clerk accounts, a Convex `packs` table keyed by `userId`, and a `purchases` table.
v2.26.0 caught the `pilotBanner` half of this exact bug and fixed it (`:1699` static markup and
`:1864` bank entry now both read "unless you choose to save your pack to an optional free
account"). It did not touch `ab_privacy`, which is the longer, more load-bearing text. Both
languages currently assert, in the privacy section of a product whose users' threat model is
subpoena and enumeration:

> "Amparo keeps no accounts and no database of who you are."

That is now false by construction. There is a Clerk user record, a Convex row keyed to it holding
name, two emergency contacts and their phone numbers, attorney, ZIP and state, and a purchases
table. The same paragraph omits Stripe entirely and still describes an email-receipt flow that is
disabled (`emailEnabled:false`, `index.html:2748`).

This is the identical failure mode v2.26.0 documented — a trust string updated in one place and not
the other — and it landed on the most consequential string in the product. Critical not because of
the code but because of who reads it.

---

## HIGH

### H1. Sentry's `beforeSend` does not run on feedback events — every privacy scrub is bypassed for exactly the payload carrying a human being's words

This is the hostile-review finding. Verified against the installed SDK source, not the docs.

`@sentry/core@10.70.0`, `build/cjs/client.js:730-736`:

```js
function processBeforeSend(client, options, event, hint) {
  const { beforeSend, ... } = options;
  if (isErrorEvent(processedEvent) && beforeSend) return beforeSend(processedEvent, hint);
```

and `:794` — `function isErrorEvent(event) { return event.type === void 0; }`

`build/cjs/feedback.js:18` constructs the feedback event with `type: "feedback"`. Therefore
`event.type !== undefined`, therefore `isErrorEvent` is false, therefore **`beforeSend` is never
called for a feedback submission.** Concretely, for the one payload containing free text a
frightened user typed:

- `delete event.user` (`sentry-entry.js:99`) **does not run**.
- `event.request.url = bareUrl(...)` (`:93`) **does not run** — the URL goes up with query and hash intact.
- `delete event.request.cookies / .data / .query_string` and the `Referer` delete (`:94-97`) **do not run**.

And the `HttpContext` integration attaches that request block to *every* event via `preprocessEvent`
(`@sentry/browser/build/npm/cjs/prod/integrations/httpcontext.js`), so the feedback envelope carries
`request.url` (full `document.location.href`), `Referer`, and `User-Agent`.

Fix is small and in the same file: add a `beforeSendFeedback` hook — the SDK emits it
(`feedback.js:24`, and the string is present in the shipped `sentry.js`) — applying the same scrub,
stripping `contexts.feedback.url` and the request block.

### H2. `beforeSend` deletes `Referer` but leaves `User-Agent` — on error events too

`sentry-entry.js:97`: `if (event.request.headers) delete event.request.headers.Referer`.
`httpcontext.js` builds `headers` from `getHttpRequestData()`, which supplies **both** `Referer`
and `User-Agent`. The `User-Agent` line is never removed. Every error event and every feedback
submission carries the full UA string (device model on Android, iOS version, browser build) — a
meaningful fingerprint component for a small user base. One more `delete`.

### H3. `/app` has no error capture at all — `armErrorReporting` is dead code

`app-src/src/services/feedback.ts:46` exports `armErrorReporting`. Grep across `app-src/src`,
`index.html`, `arena/index.html`, `app/`: **exactly one hit, the definition itself.** `main.tsx`
never calls it; `App.tsx:9,183` imports only `openFeedback`.

So the v2.26.0 claim of parity across three surfaces is half true: root and arena buffer and report
errors (`index.html:6205-6206`, `arena/index.html:1276-1277`); /app buffers nothing and reports
nothing. A React render crash on the print step — the step where the account/save feature lives,
i.e. the newest and least-exercised code in the build — produces zero telemetry. One line in
`main.tsx`. Skipped because nobody called it, not because it was decided.

---

## MEDIUM

### M1. `__sqErr` is unbounded, and the one scenario that makes it grow is the one where it can never drain

`index.html:6184-6206`, `arena/index.html:1255-1277`, `feedback.ts:47-65` — all three push
unconditionally with no cap:

```js
addEventListener('error',function(e){ window.__sqErr.push({msg:e.message,err:e.error}); sentryFlushSoon(); });
```

`sentryLoad()` memoizes its promise in `window.__sLoad`. If `/sentry.js` fails to load — offline, a
content blocker, or a filter-list rule matching a path literally named `sentry.js` (**UNVERIFIED**,
but it is exactly the shape EasyPrivacy matches, and naming the self-hosted file `sentry.js`
undercuts the reason it was self-hosted) — the promise **rejects and stays rejected**. Every
subsequent `sentryFlushSoon()` re-awaits the same rejected promise, hits `.catch(function(){})`,
and `splice(0)` never runs. Meanwhile the error listener keeps pushing, and each entry retains the
live `Error` object and therefore its closure scope.

An error firing inside a `requestAnimationFrame` or a retry loop on an offline device is unbounded
memory growth on a low-end Android phone, which is the primary target device. Fix is the lazy one:
`if(window.__sqErr.length<50)` before the push, in all three. A cap, not a queue manager.

### M2. `/checkout` is a fully public, unauthenticated, unrate-limited Node action making an outbound API call per request

`app-src/convex/http.ts:38-69`, CORS `*` (`:33`). Grep over `app-src/convex/`: **0 hits** for
`rateLimit`, `rate_limit`, `x-forwarded`. Enumerated honestly:

- **Not** a money risk. Creating a Checkout Session costs nothing at Stripe; no card is charged;
  the price table is server-side (`stripe.ts:15-19`) and the client can only name one of three
  product ids, so amount tampering is genuinely impossible.
- **It is a compute and blast-radius risk.** Each POST runs a `'use node'` action that constructs a
  Stripe client and makes a network round trip. A single laptop sustains hundreds per second. The
  operator pays Convex for function calls and action GB-seconds; a sustained flood burns the
  free/starter allowance in hours, and the *first* symptom is a bill or a quota stop that takes the
  arena's real checkout down with it.
- **Stripe-side collateral:** junk sessions accumulate in the dashboard, and Stripe's documented
  default API rate limits (100 req/s live, 25 req/s test — **UNVERIFIED against this account's
  actual limits**) mean an attacker can 429 the legitimate buyer.
- Error bodies echo `e.message` (`:61-66`); a Stripe SDK message can be more specific than intended.
  A 503 on `"not configured"` also confirms deployment state to an unauthenticated caller. Low, but
  free to fix.

**Smallest correct mitigation** (do not reach for a rate-limiter component): a fixed-window counter
keyed on `request.headers.get('x-forwarded-for')` plus the current minute in a small `rateLimit`
table, rejecting above roughly 5/min, plus a two-line `Origin` allowlist that stops the
drive-by-from-another-site case. About 15 lines, one table, no new dependency. (**UNVERIFIED:**
that Convex forwards `x-forwarded-for` to `httpAction` — check before writing the code; if it does
not, fall back to a global window, which is worse but still bounds the spend.)

### M3. Webhook records a purchase without checking `payment_status`

`stripe.ts:101-111` fulfills on `checkout.session.completed` alone. That event also fires with
`payment_status: 'unpaid'` for delayed-notification payment methods; the sessions are created with
no explicit `payment_method_types`, so whatever is enabled in the dashboard's automatic payment
methods applies. One guard:
`if (s.payment_status !== 'paid') return { ok: true as const, fulfill: null }`.
Currently harmless only because of C1 — nothing is delivered on the strength of that row.

### M4. The effective CSP on `/app` is the intersection, and the intersection is missing `frame-src`

`vercel.json:9` applies to `/(.*)`; `app/index.html:35` adds a meta CSP. A page enforces both, so
the effective policy is the intersection. Diffed by hand:

| Directive | vercel.json | /app meta | Effective on /app |
|---|---|---|---|
| `script-src` | `'self' 'unsafe-inline'` + cdnjs, posthog, ph, js.stripe, clerk | `'self'` + clerk | `'self'` + clerk — **no `unsafe-inline`** |
| `frame-src` | js.stripe, hooks.stripe, clerk | *absent* → falls back to meta `default-src 'self'` | **`'self'` — Clerk and Stripe frames blocked** |
| `worker-src` | *absent* → `default-src 'self'` | `'self' blob:` | `'self'` — blob workers blocked |
| `connect-src` | + posthog, api.stripe | sentry, clerk, convex cloud/wss/site | the meta set |

Verified benign today: `app/index.html` has exactly one `<script>` and it has a `src` (`:41`), so
losing `unsafe-inline` costs nothing. Nothing in `app-src/src` constructs a `Worker`, so
`worker-src blob:` in the meta is aspirational and its loss costs nothing.

The live risk is `frame-src`. `/app` runs Clerk's sign-in **modal**; if ClerkJS creates any iframe
at runtime (handshake, cookie sync, CAPTCHA) it is blocked in production while working in local dev
where no vercel.json header applies. **UNVERIFIED** — the shipped `SavePack` chunk contains no
`iframe` string, but ClerkJS itself is fetched at runtime from `divine-swine-18.clerk.accounts.dev`
and was not inspected. The fix is free either way: add
`frame-src 'self' https://divine-swine-18.clerk.accounts.dev` to the meta so the two policies agree.

Everything else in `vercel.json` is earned, not extra: cdnjs serves GSAP (`index.html:1182`);
posthog and ph.amparohq.com serve the analytics snippet (`:1644-1673`); js.stripe/api.stripe are the
hosted-checkout hand-off; the Sentry ingest host and both Convex hosts match the URLs actually in
the code (`grandiose-armadillo-240.convex.site` at `arena/index.html:1503`;
`grandiose-armadillo-240.convex.cloud` found inside `app/assets/SavePack-CI5ICiFz.js`). The dead
`agreeable-gopher-346` deployment is gone repo-wide. `/sentry.js` is same-origin, covered by `'self'`.

### M5. Production `/app` is running Clerk's **development** instance

`app/assets/SavePack-CI5ICiFz.js` contains `pk_test_ZGl2aW5l…` — base64 of `divine-swine-18…`, the
publishable key for `divine-swine-18.clerk.accounts.dev`, and that dev host is hardcoded in both
CSPs. Clerk development instances have user caps, weaker session semantics, open sign-up, and are
explicitly not for production traffic. Paired with the test-mode Stripe key, /app's account feature
is a demo wearing a production URL. Not a leak — publishable keys are public by design, and no
`sk_`, `whsec_` or `CLERK_SECRET` appears in any built bundle — but it is a launch blocker sitting
quietly next to C1.

### M6. Root `.env.local` holds two live secrets for consumers that no longer exist

`.env.local` contains `STRIPE_SECRET_KEY` and `CLERK_SECRET_KEY`, with a header comment saying they
are "read by Vercel serverless functions (/api/*)". There is **no `api/` directory** — commit
649f884 removed the Vercel checkout stub, and the secrets now live in Convex env
(`npx convex env set`). Two secrets sit on disk, and possibly still in the Vercel project's
environment variables, with zero consumers. Delete the file; if the values were ever set in Vercel,
remove them there too. Not a git exposure (see receipts below) — a blast-radius reduction.

### M7. Three feedback shims, three different contracts

`index.html:6184-6213`, `arena/index.html:1255-1284`, `app-src/src/services/feedback.ts`. The logic
is equivalent apart from the language source (`lang` global / `A.lang` / `getLang()`), which is
fine. The divergences that matter:

1. /app never arms error capture (H3).
2. All three share a dead-tap hole: `a && a.open(lang)` (root/arena) and `a?.open(lang)` (/app) both
   evaluate to `undefined` without throwing if the bundle loads but `window.AmparoFeedback` is
   absent — so the mailto fallback does **not** fire and the button does nothing. The fallback is
   correctly wired for the cases that matter (script `onerror` → reject → mailto; a throw inside
   `open()` → mailto), so this is the narrow case only. `if(!a) throw 0` closes it.
3. **UNVERIFIED:** whether a *blocked ingest* — bundle loads, `sentry.io` blocked by a filter list,
   a very common configuration — surfaces an error in the feedback form or silently shows
   "Thank you — this goes straight to Michael." If it is the latter, the product tells a user in
   trouble that a human received their message when nobody did. This is worth ten minutes with
   uBlock Origin on before launch, more than anything else in this section.

---

## VERIFIED CLEAN (receipts)

**Convex authorization.** `packs.save` (`packs.ts:21-35`) and `packs.get` (`:37-47`) both call
`ctx.auth.getUserIdentity()` first, reject or return null on absence, and scope *every* DB touch
through `.withIndex('by_user', q => q.eq('userId', identity.subject))`. There is no argument through
which a caller names a user — `packFields` (`:9-19`) contains no `userId`, and the write overwrites
`doc.userId` with the identity's subject at `:30`. Cross-tenant read or overwrite is structurally
impossible: no code path lets `userId` come from the client. `identity.subject` is the right key
**for one provider**; Convex's globally-unique handle is `tokenIdentifier` (issuer + subject). If a
second entry is ever added to `auth.config.ts`, `subject` alone becomes collidable — a comment at
`schema.ts:17` would earn its keep. Low, noted, not a bug today.

**Cross-Clerk-application tokens.** `applicationID: 'convex'` (`auth.config.ts:9`) is **not** the
gate, and precision matters here because the naming invites the opposite conclusion: it is checked
against the JWT `aud` claim, and `"convex"` is the default template name every Clerk + Convex
integration uses — it is not tenant-specific at all. The real gate is `domain`, which pins the `iss`
claim and the JWKS endpoint to `CLERK_JWT_ISSUER_DOMAIN`. A token minted by a different Clerk
application carries a different issuer host, so its signature is checked against the wrong JWKS and
fails. The isolation is sound; the reason it is sound is the issuer, not the `applicationID`.

**`purchases.record` is unreachable from a client.** Declared `internalMutation` (`purchases.ts:5`).
`app-src/convex/_generated/api.d.ts` types `api` as
`FilterApi<typeof fullApi, FunctionReference<any,"public">>` and puts internal references only under
`internal` — and Convex enforces visibility server-side, not merely in types, so a hand-crafted
client call is rejected at the deployment. The only caller is `http.ts:24` via
`ctx.runMutation(internal.purchases.record, …)`.

**Webhook TypeScript narrowing — the specific worry is unfounded.**
`npx tsc --noEmit -p convex/tsconfig.json` → **exit 0, no output** (also `tsconfig.app.json` →
exit 0). `verifyWebhook` returns a discriminated union with `ok: false as const` / `ok: true as
const` (`stripe.ts:93,99,101,104`), so after `if (!result.ok) return …` at `http.ts:23` the compiler
has narrowed to the two `ok:true` shapes and `result.fulfill` genuinely exists on both.
`result.error` / `result.status` exist on the false branch. No `any` is papering over it.

**Forged webhooks cannot record a purchase.** `http.ts:19-20` 400s a missing `stripe-signature`;
`stripe.ts:97` verifies via `constructEventAsync(body, sig, whsec)` on the **raw** `request.text()`
— not a re-serialized JSON object, the classic mistake, avoided; a throw returns
`{ok:false, status:400}` and http.ts returns before any DB write. A missing `STRIPE_WEBHOOK_SECRET`
fails **closed** with 503 (`:93`), not open. `amount` comes from `s.amount_total`, never the client.

**`by_session` dedupe is sound against concurrent retries.** `purchases.ts:13-18` reads the
`by_session` index inside the same mutation that inserts. Convex mutations are serializable
transactions with OCC; the index read is part of the transaction's read set, so a concurrent
duplicate insert conflicts and retries, and the retry observes the first row and returns.
`.unique()` cannot throw here because no path can create the second row.

**Secrets discipline — clean currently and historically.** Every check run this session:

- `git ls-files | grep -i env` → **empty**. Nothing env-shaped is tracked.
- `git log --all --diff-filter=A --name-only --pretty=format: | sort -u | grep -iE '(^|/)\.env'` → **empty**. No `.env*` file has ever been added on any ref.
- `git log --all -S'sk_live_'` and `-S'whsec_'` → the only hits are `stripe.ts` and `http.ts`, whose matches are the *documentation comments* telling the operator to run `npx convex env set STRIPE_SECRET_KEY sk_live_…`. No value.
- `git grep -nE 'sk_(live|test)_[A-Za-z0-9]|whsec_[A-Za-z0-9]|CLERK_SECRET_KEY\s*='` over tracked files → **empty**.
- `git check-ignore -v` → `.env.local` ignored by `.gitignore:3`; `app-src/.env.local` ignored by `app-src/.gitignore:13` (`*.local`).
- `grep -oaE 'sk_(live|test)_…|whsec_…|CLERK_SECRET[A-Z_]*' app/assets/*.js sentry.js` → **empty**.
- The only credentials in shipped bundles are the Clerk publishable key (`pk_test_…`) and the Sentry DSN, both public by design.

**Sentry privacy claims, checked one by one against `tools/sentry-entry.js` and the built `sentry.js`:**

| Claim | Verdict |
|---|---|
| No session replay | **TRUE.** `integrations: [feedback]` (`:74`) — replay is never constructed. |
| No tracing | **TRUE.** `tracesSampleRate: 0` (`:76`), no browserTracing integration. |
| `sendDefaultPii: false` | **TRUE** (`:75`). |
| `ui.input` breadcrumbs dropped | **TRUE** (`:83`), unconditional `return null`. |
| URLs stripped of query + hash | **TRUE for error events** (`:85-87` breadcrumbs, `:93` request). **FALSE for feedback events** — H1. |
| `event.user` deleted | **TRUE for error events** (`:99`). **FALSE for feedback events** — H1. |
| `allowUrls` limited to our origins | **TRUE** (`:79`), with the standard caveat that events carrying no stack frame — `captureMessage`, which the shim's `flush` uses for non-`Error` values (`:126`) — are not URL-filtered at all. |
| Screenshot disabled | **TRUE** (`:68`), correctly reasoned: a screenshot here could contain a licence photo. |
| Nothing loads eagerly | **TRUE.** All three surfaces inject `/sentry.js` on demand only. |

**No sensitive URL surface exists to leak today.** `location.hash` / `location.search`: **0 hits**
in root and arena. Nothing routes state or ZIP through the URL, so `bareUrl` is currently defensive
rather than load-bearing — which is the right time to have written it.

**Console breadcrumbs are harmless today.** Console breadcrumbs are on by default and
`beforeBreadcrumb` does not drop them. Verified: `console.log|warn|info|error` → **0 hits** in
`index.html` and `arena/index.html`; **0** `console.log` in `app/assets/index-*.js`. Nothing the app
writes to the console can reach Sentry, because the app writes nothing. This holds only as long as
nobody adds a debug log near the You step — worth a one-line comment in the entry file.

---

## What Sentry receives regardless, stated plainly

Independent of every scrub above, for any user who triggers an error or taps "Send feedback":

- **IP address.** Sentry's ingest terminates the connection and observes it. `sendDefaultPii:false`
  plus `delete event.user` mean it is not stored on the *event* — but whether it is retained
  anywhere in Sentry's pipeline is governed by the org's "Prevent Storing of IP Addresses" setting
  inside Sentry, not by anything in this repo. **UNVERIFIED — check that setting; it is a checkbox.**
- **User-Agent string.** Sent on every event (H2). Device, OS version, browser build.
- **URL path.** Query and hash are stripped on error events; the path survives, so Sentry knows
  whether the user was on `/`, `/arena/` or `/app/` — i.e. that they were using a know-your-rights
  tool. On feedback events the *full* URL survives (H1).
- **The feedback message itself**, verbatim, plus name and email if given. This is the point of the
  feature and is fine — but it means free text a frightened person wrote about their situation is
  stored on a US SaaS vendor's infrastructure.
- **Error messages and stack traces**, which for this codebase are authored strings and function
  names, not user data.
- Breadcrumbs: navigation, fetch/xhr with URLs stripped, and `ui.click` DOM-path selectors. Not
  `ui.input`.

**What a subpoena to Sentry would yield about a user of this product:** a set of feedback
submissions with their full text and any voluntarily supplied name and email, timestamps, the page
URL each was written from, the browser/OS fingerprint, and — depending on the org's IP setting — the
originating IP, which resolves to an ISP account or a mobile-carrier subscriber. That is materially
more identifying than "anonymous error telemetry," and for this user base the difference matters.

**Under-disclosure — three places, all fixable with strings:**

1. **`arena/index.html:675`, `pT` / "Privacy — the honest version".** `p1` ends "No analytics, no
   cookies here." and `p2` says "nothing loads from Google Fonts or any other third party."
   Post-v2.26.0 the arena injects `/sentry.js` on error or on tapping feedback and transmits to
   `sentry.io`. `p2` survives on a technicality — the *script* is same-origin — but `p1` reads as a
   blanket "nothing goes out," which is no longer true. Same modal, one sentence to add.
2. **`arena/index.html:529`, `founderA`:** "Free forever — your practice never leaves this device."
   Practice answers still do not. An unhandled exception's message, stack and page path do.
3. **Root `ab_privacy`** (C2) — no mention of Sentry, of Stripe, or of the accounts it now keeps.

Root's PostHog block (`index.html:1652-1673`) is, by contrast, the model to copy: `autocapture:false`,
`disable_session_recording:true`, `disable_surveys:true`, `capture_dead_clicks:false`,
`maskAllInputs`/`maskTextInputs`, `person_profiles:'identified_only'`, each with a comment saying
why. The Sentry work is in the same spirit; the disclosure just has not caught up with it.

---

## Regression sweep, v2.25.0 + v2.26.0

- **CSP fix confirmed landed.** `agreeable-gopher-346` → **0 hits** repo-wide. All three Convex hosts
  in `vercel.json:9` match `grandiose-armadillo-240`, the deployment the arena and the SavePack chunk
  actually call.
- **`pilotBanner` static-fallback fix confirmed landed.** `index.html:1699` static markup and `:1864`
  bank entry are identical. The *class* of bug is not eradicated — see C2, and wargames/31 §1 item 3
  (`arena/index.html:617` still statically reads "10 seconds per line" until `applyLang()` overwrites it).
- **Both typechecks pass** — `tsconfig.app.json` and `convex/tsconfig.json`, exit 0, no output.
- **`app-src/src/clerkAndConvex.ts:1-30`** is a 30-line doc comment that still says "not imported
  anywhere yet" and "once such a feature exists". `SavePack.tsx:14,85` imports and uses it. Cosmetic,
  but it is the file a reviewer opens first to understand the auth wiring, and it currently tells them
  the feature does not exist.
- **`stripe.ts:57` comment** promises "a later sign-in can claim the session id." No such code exists;
  `guestCheckout` hardcodes `userId: 'guest'` (`:78`), so every guest purchase lands in one
  undifferentiated bucket that nothing reads. Aspirational comment, unbuilt feature — the same shape
  as C1.
- **`createCheckout` (`stripe.ts:21`), the *authenticated* checkout action, has zero callers** —
  confirmed by grep, and independently by wargames/31 §2a. Dead code today; it is also the only
  purchase path that would attribute a purchase to a real user, which is what C1 needs.

## Fix order

1. **C1** — do not swap the live Stripe key until something is delivered; handle `?checkout=success` honestly in the meantime.
2. **C2** — rewrite `ab_privacy` EN + ES to match what v2.25.0 actually shipped.
3. **H1 + H2** — add the `beforeSendFeedback` scrub and `delete headers['User-Agent']`. Two small edits in `tools/sentry-entry.js`, then rebuild `sentry.js`.
4. **H3** — call `armErrorReporting` in `main.tsx`.
5. **M1** — cap `__sqErr` at 50 in all three shims.
6. **M4** — add `frame-src` to the `/app` meta CSP so the two policies agree; re-verify sign-in against production headers.
7. **M2** — IP fixed-window on `/checkout`; **M3** — `payment_status` guard; **M6** — delete root `.env.local`.
8. **M7 item 3** — test the feedback form with a content blocker enabled before launch.
