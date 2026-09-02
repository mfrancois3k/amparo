# Amparo engine refactor: plan (2026-09-02)

Source spec: the owner's "Principal Product Architect" brief (chat, 2026-09-02).
Everything below is scoped to what that brief asks for, corrected against what
the repo already does. Corrections are called out inline as **Reality:**.

## 1. PRD

**Problem.** The site is a cinematic landing page over a practice tool and a
printable pack. The state-law research (51 jurisdictions x 19 columns, every
cell verified against primary statute text) lives in `research/` and reaches
users only through three hand-cited states (TX, GA, NY) in the pack. The
citation-signing trap, the lying-vs-silence split, the passenger-ID rule, the
cannabis-odor case law and the unmarked-car defences are all researched and
none of them is in the product.

**Outcome.** Every surface that says something state-specific reads it from one
generated, tested data layer; every state renders under a provisional-education
notice until an attorney licensed there signs it off; the paid ladder exists
end to end (Stripe -> idempotent webhook -> print-on-demand queue) without
selling anything the review gate has not cleared.

**Non-goals.** No practice history, scores or document photos leave the device
(schema comment in `app-src/convex/schema.ts` is the privacy policy). No new
runtime dependencies. No Vercel `/api` functions: Stripe already lives in
Convex and stays there.

## 2. Legal guardrails (encoded, not prose)

Each is a data invariant with a test in `tools/jurisdictions/*.test.mts`.

| Guardrail | Where it lives | Test |
|---|---|---|
| Zero states attorney-reviewed | `review.attorney=false` on all 51; notice text required on every rendered state | `hud.test.mts` |
| Cannabis-odor case law (CO WA MI PA VT IL MA FL NJ) + statutory bars (NY MD VA MN, NJ underage) | `overlays.mjs#cannabisOdor` | IL burnt/raw asserted; MD/VA tier 0 |
| Citation-signing trap | `overlays.mjs#signPosture` | FL line never says "you can refuse"; VA line says release |
| Lying vs silence (14 states) + 3 refusal states | `overlays.mjs#speech` | PA/VA/CA cites present; OH capped at name/address/DOB |
| Five remedy tiers | `overlays.mjs#remedyTier` | WV = 4, VA/MD = 0 |
| Passenger ID | `hud.mjs#passenger` | no state's passenger line inherits the driver duty; HI firearm outlier |
| Safe stop / unmarked cars = court defence | `overlays.mjs#unmarked`, `#safeStop` | no line contains "keep driving" |

**Reality:** the brief lists 11 cannabis-odor states and omits MD and VA, which
the research has as *statutory* Tier 0 protections. The data follows the
research.

## 3. Architecture

```
research/state-matrix.md ──parse──▶ tools/jurisdictions/parse.mjs
overlays (curated from research) ─▶ tools/jurisdictions/overlays.mjs
                                        │
                                  tools/jurisdictions/hud.mjs  (compile 19 cols -> ~9 lines/state, EN+ES)
                                        │
                        tools/build-jurisdictions.mjs (writes, idempotent)
                                        │
        ┌───────────────────────────────┼──────────────────────────────┐
 data/jurisdictions.json        data/hud.json                  data/jurisdictions.schema.json
 (full 51x19, served static)    (compact, served static)       (JSON Schema 2020-12)
                                        │ copied verbatim
                              app-src/src/content/hud.json
                                        │
          ┌─────────────────────────────┼──────────────────────────────┐
  arena/index.html state panel   app-src PanicHud.tsx (React)   tools/lib/armor-card.mjs (SVG/PDF)
```

Sitemap: `/` (existing cutlist homepage, CTAs re-pointed), `/rehearse` -> the
Arena, `/aid` -> the aid portal. **Reality:** both target pages exist
(`arena/index.html`, `new/aid.html`) and use relative asset paths, so the
routes are rewrites plus root-absolute asset fixes, not new pages.

Payments: Convex (`app-src/convex/`). Add `stripeEvents` (idempotency by event
id), `orders` (physical fulfilment queue, retried by the Convex scheduler with
backoff), provider adapters for Lob and Gelato as `'use node'` actions. Pure
decision logic in `convex/lib/` so it is testable with `node --test` and no
Convex runtime. **Reality:** the brief's "Vercel routing conflict" line is
already solved (`pack.html` + root rewrite, commit 7297ed4); nothing to do.

## 4. Pricing ladder

`master` $9.99 (digital), `armor` $19.99 (digital + laminated card, shipping
collected by Stripe Checkout, US only). Existing `script` $3.99 stays in the
table so recorded entitlements keep resolving; the Arena modal switches to the
ladder (master pre-selected, one checkbox upgrades to armor for +$10).

**The gate the brief asks for and the repo already enforces:** content that has
not passed review is not sold (`PRODUCTS.held` comment, `stripe.ts`). The
laminated card therefore prints the federal baseline, the verified lifelines
and the provisional notice for every state whose `review.attorney` is false;
state-law lines print only once that flag flips. Flipping it is a one-field
data change, not a code change.

## 5. Tests

`node --test` (Node 24, native TS type stripping, `.mts` so ESM is unambiguous;
no runner dependency). Root `npm test` runs all suites:

- `tools/jurisdictions/parse.test.mts`, `overlays.test.mts`, `hud.test.mts`, `build.test.mts`
- `app-src/convex/lib/webhook.test.mts`, `fulfillment.test.mts`, `providers.test.mts`
- `app-src/src/components/panicHud/model.test.mts`
- `tools/lib/armor-card.test.mts`

React views (`.tsx`) are type-checked by `tsc -b` and verified in the browser;
their logic lives in plain `.ts` models under test. JSX is not strippable by
Node and `tsx` is not installed; adding it is a one-line devDependency in
`app-src/` if a render test is ever wanted.

## 6. Task list

1. Data layer (parse, overlays, hud, build) with tests. Done.
2. Stripe webhook idempotency + orders queue + Lob/Gelato adapters, TDD. Done (code + tests; provider keys are operator setup).
3. Panic HUD (model + view), mounted in the React app at /app. Done.
4. Armor card generator (HTML faces, Avery duplex sheet, Lob postcard faces, CLI), Arena micro-win, ladder, state panel. Done.
5. Routes, homepage CTAs, reassemble, browser verification, review, commit, sync. Done 2026-09-02.

## 7. Delivered (2026-09-02)

| Deliverable | Where | Proof |
|---|---|---|
| 51 x 19 JSON + JSON Schema | `data/jurisdictions.json`, `data/jurisdictions.schema.json` | `tools/build-jurisdictions.test.mts` validates data against schema |
| Compact HUD bank | `data/hud.json`, `app-src/src/content/hud.json`, `hud-ui.json` | `tools/jurisdictions/hud.test.mts` (guardrail invariants) |
| Webhook idempotency + fulfilment queue + adapters | `app-src/convex/{lib/*,orders.ts,fulfillment.ts,stripe.ts,http.ts,schema.ts}` | `lib/payments.test.mts` (19), Convex tsc clean, `tools/test-fulfilment.mjs` 25/25 |
| Panic HUD | `app-src/src/components/panicHud/*`, `App.tsx` | `model.test.mts` (6), built to `/app`, browser-verified `?state=TX&panic=1` |
| Card generator | `app-src/convex/lib/armorCard.ts`, `tools/render-armor-card.mjs` | `lib/armorCard.test.mts` (7) |
| Arena state panel + ladder + micro-win | `arena/index.html` | inline scripts `node --check`, guards 16/16, browser-verified `?state=FL` |
| Routes + CTAs | `vercel.json`, `new/index.html`, `new/aid.html`, `sitemap.xml` | linkcheck, browser |

Not done, and why: no live provider account (Lob/Gelato keys and the Gelato
product UID are the operator's); `verify:content` in app-src has been broken
since eb82570 and is a separate task; the Spanish HUD strings were drafted by
the assistant and need a native reader before the card ships to anyone.
