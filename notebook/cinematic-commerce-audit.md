# Commerce and organization readiness — 2026-09-13

Status: **ready with conditions for prelaunch information; not ready for sales.**

## Evidence inspected

- `CHANGELOG.md`, `notebook/amparo-version-history.md`, recent UX commits, and working tree.
- `arena/index.html`: existing $9.99 Master Script / $19.99 Physical Armor ladder, $149 Starter / $499 Chapter organization proposals, orgs@amparohq.com and hello@amparohq.com contact links, and client `PAYMENTS_LIVE=false`.
- `app-src/convex/lib/products.ts`: server prices in cents; physical Armor at 1999, Master at 999, Deep Pack held.
- `app-src/convex/fulfillment.ts` and `lib/providers.ts`: physical provider adapters exist. Lob uses 4x6 postcard production, now correctly supplied by `armorPostcardHtml`. No evidence establishes lamination, finished samples, production readiness, or live shipping readiness.
- No confirmed deliverable facilitator guide, co-branding system, workshop deck, physical 25/100-pack order pipeline, extra-language service, or on-site training fulfillment was found. Existing organizational copy alone is not proof of availability.
- No root `api/` directory or independent root checkout handler is present in this working tree. Static checkout reaches Convex.

## Changes

`new/organizations.html` presents free community practice, a simple participant sequence, honest scope/review language, and existing $149/$499/custom proposals. All proposed print quantities and supporting materials require confirmation; no implied booking or automatic purchase.

`new/ready-kit.html` makes physical convenience the consumer offer. Ready Kit is explicitly a working name for the existing Physical Armor proposal. $19.99 is shown as its existing preview reference, not a final orderable price. No lamination, multi-item contents, bilingual physical shipment, or shipping date is promised. Free printing and practice remain primary; the $9.99 Master is optional formatting convenience. Federal reference material is distinguished from state attorney review.

`new/commerce.css` uses ivory paper, ink, restrained gold, serif editorial headings, responsive layouts, visible focus, and at least 44px form/navigation controls. No external font, tracker, library, or media payload was introduced.

`new/commerce.js` supplies Spanish copy through the existing vanilla EN/ES object and query-string convention. English core page content exists in initial HTML. Language changes preserve typed form values. The organization form validates name, organization, email, group size, state/region, and interests; constructs a draft; and offers explicit mailto and clipboard actions. It sends no message, submits no lead, reserves nothing, and does not persist contact data. A no-JavaScript contact link and clipboard failure/manual-copy path are included.

## Payment gate

The former `PAYMENTS_LIVE=false` was only a client control. Both `createCheckout` and `guestCheckout` could still create sessions if a caller bypassed the UI and a Stripe key existed.

Server creation actions in `app-src/convex/stripe.ts` now reject unless environment `PAYMENTS_LIVE` is exactly `true`. `app-src/convex/http.ts` rejects public `/checkout` with a non-sensitive 503 before reading customer data, writing rate-limit state, or contacting Stripe when the flag is unset or different. No environment variables were changed and no payments were enabled. Existing redemption and webhook handling were deliberately preserved for prior purchases.

Operators must not enable the flag until explicit authorization, legal gates, final pricing, fulfillment, policies, and controlled test verification are satisfied. Source changes require Convex deployment to affect the live backend; a static frontend deployment alone does not deploy them.

## Verification

- `node --test tools/commerce-payment-gate.test.mts`: 7 passing handler-level tests, including absent/false/malformed flags, preservation of held products, mocked authorized session creation, and public prelaunch rejection before backend calls. No real Stripe/network request.
- `node --check new/commerce.js`: syntax check.
- `node --test tools/commerce-contact.test.mts`: 5 passing tests exercising the actual contact script: encoded reviewable draft without navigation, whitespace validation and stale-draft invalidation, Spanish/value preservation and deliberate copy, clipboard failure fallback, and translated trust-route switching.
- Public page visual/mobile/keyboard/form checks are coordinated by the parent release task; this document does not claim those checks were completed independently.

## Integration

Parent owns rewrites and sitemap: `/organizations` → `/new/organizations.html`, `/ready-kit` → `/new/ready-kit.html`. Consider a permanent `/orgs` → `/organizations` redirect for legacy links. Navigation and Arena links should preserve language.

After an external task concurrently committed organization pages and removed tracked changes in the original checkout, this work moved to the isolated `work/amparo-cinema` worktree. The server gates were restored there and all commerce tests passed again. The existing `organizations/index.html` was replaced with the validated prelaunch page, preserving native directory routing. Parent should redirect `/organizaciones` to `/organizations?lang=es` and handle duplicate `/new/organizations.html` routing. Commerce trust links use existing `/acerca/`, `/como-verificamos/`, and `/privacidad/` for Spanish.

Arena owner was informed that the old organization modal promises unsupported fulfillment and that Master/Armor CTAs should link to honest proposed availability, not imply purchases are live.

## Human actions required

1. Confirm production specification and inspect a physical sample. Reconcile postcard stock with any intended durable/laminated product before pricing or claims are finalized.
2. Complete appropriate attorney review and identify reviewed editions explicitly.
3. Approve final consumer and organization prices, fulfillment quantities, shipping process, and written policies.
4. Produce and validate actual organization materials before offering a guide, workshop deck, co-branding, or training as deliverable.
5. Verify the published contact inboxes are monitored; no delivery was tested and no email was sent.
6. Deploy server gate changes to Convex; separately authorize controlled payment tests and any future live flag.
7. Recruit an organization pilot and collect real feedback with permission; no invented testimonials or outcomes appear on these pages.
