# Amparo release audit

**Release status: READY WITH CONDITIONS.** The free practice, trust and pre-launch product experience is ready for the final website deployment check. Attorney review, physical fulfillment and live sales remain human-controlled gates. The production Convex backend has been deployed with payments closed. **The main website deployment and final commit identification are pending at this report's preparation; the release owner will append them.**

This report combines the current isolated worktree, the commerce and trust audits, and the release owner's completed test results. It does not claim that all planned products can be purchased or delivered.

## Homepage changes

The homepage keeps free practice as the main action and explains the product before presenting optional paid offers. Its opening uses a cinematic clay encounter, editorial typography, clear practice controls and a restrained motion treatment. The user’s six recovered September 1 images supplied the encounter concept: a traffic encounter, a home threshold and a composed response. The existing product, legal banks, pack builder and advanced practice tools remain in place.

The new Higgsfield traffic still is **113,796 bytes**, the doorstep still **131,182 bytes**, and the traffic clip **422,297 bytes**. The five-second clip plays once. Still-image fallback, reduced motion and a pause control keep motion secondary to usable HTML content. The door scene is an illustration of the preparation concept; it does not open the held door-practice scenario or imply attorney approval. Total new scene media is approximately **652 KB**; this is an asset measurement, not a Core Web Vitals score.

Design references informed specific patterns: scroll composition from [21st.dev’s hero-scroll example](https://21st.dev/community/components/ui-layouts/hero-scroll-animation/default), [21st.dev’s hero discussion](https://docs.21st.dev/blog/react-hero-section-examples) and [UI Layouts sticky scroll](https://www.ui-layouts.com/components/sticky-scroll); cinematic pacing from [A Short Journey](https://www.awwwards.com/sites/a-short-journey), an Awwwards Site of the Day reference from 2016; restrained card behavior from [Hover.dev cards](https://www.hover.dev/components/cards); and public interface examples through [Mobbin MCP](https://mobbin.com/mcp). These were adapted to Amparo’s content and existing implementation. No full paid component library or private Mobbin collection was copied.

## Free versus paid, consumer offer and pricing

| Offer | Position and actual availability |
| --- | --- |
| Core practice and basic printing | Free. English/Spanish practice, rights information and resource links remain usable without purchase or an account. |
| $9.99 Master Script | Optional convenience/formatting over information already available free. It is not presented as access to additional rights. Payments remain closed. |
| $19.99 physical proposal | Ready Kit is a working name for the existing Physical Armor offer. The page explains convenience and physical preparedness, with a preview price and unavailable checkout. Final contents, durability, languages, state customization, shipping and price require confirmation. |
| Starter, about $149 | Existing organizational proposal, with quantities and materials explicitly subject to confirmation. |
| Chapter/Community, about $499 | Existing proposal, not a promise that the full workshop/co-branding package is ready to ship. |
| Enterprise | Custom inquiry; no invented automatic quote, service commitment or booking system. |

The physical provider code supports a 4×6 postcard workflow. That is not evidence of a laminated kit, an approved physical sample or operational fulfillment. The new page does not promise a protective sleeve, multiple cards, shipping date or unsupported physical contents. No subscription, artificial scarcity or fear-based purchase trigger was introduced. Optional preparedness and community distribution remain subordinate to free practice.

## Organizations and lead capture

The organizations page explains community practice, the participant sequence, proposed packages and how to ask about availability. It offers a professional contact path using existing inboxes. Name, organization, email, approximate group size, state/region and interests become a reviewable email draft. The user explicitly chooses mail or copy; form values are not submitted to a new backend or CRM and do not become a stored lead automatically.

English/Spanish switching preserves typed values. Validation and a manual-copy fallback cover incomplete forms and clipboard failure. Draft generation was tested; **no email was sent and inbox delivery was not verified**. Unsupported guide, workshop, co-branding, bulk printing, language and training benefits are proposed pending confirmation rather than sold as finished services.

## Trust, coverage and professional review

About now presents Amparo as a practice tool and distinguishes Michael Francois’s product/founder role from legal qualifications. It points to sources and methodology rather than implying that a founder’s biography establishes legal authority. Unsupported outcome language was removed.

Coverage terms distinguish nationally available federal practice, **Texas/Georgia/New York source-verified pack editions**, provisional cited Arena summaries and professional review. Source verification is not attorney review. The verification page labels its four confidence levels correctly and explains what source-change monitoring does and does not establish.

**No attorney sign-off is asserted for the current edition.** The future-review structure identifies the fields needed for a real record: reviewer, professional role, licensed jurisdiction, review date and edition. No fictitious reviewer, credentials, date or badge was populated. The supervision warning and the held door-practice gate remain intact. The legal/state content bank hashes remained unchanged during the trust edits.

Amparo complements existing rights resources and legal help by offering rehearsal. It does not replace legal-aid organizations, claim to be a law firm or promise a safe encounter or favorable legal outcome.

## Privacy fixes and analytics status

Public `/privacy/` and `/privacidad/` summaries now explain concrete behavior:

| Information | Behavior disclosed |
| --- | --- |
| Practice answers, history, scores, settings and state | Saved in the current browser/device, not included in the optional cloud pack. Another person using that browser may see the saved information. |
| Supervision answer | The question now explains its purpose and local destination before either choice is saved. Existing coaching decisions were retained. |
| Voice | Amparo does not store recordings. Opt-in browser/device speech processing may involve the provider’s servers; tapping and typing remain alternatives. |
| Optional account | No account is required for practice. Clerk sign-in and Convex pack storage are separately disclosed, including account-linked text/contact fields. Photos and Arena history are not cloud-pack fields. |
| Deletion | Arena wipe removes its setup/practice save. Separate pack/cloud deletion, downloads, printed copies and provider records are not conflated with that control. |
| Marketing analytics | PostHog bootstraps were removed from the homepage, pack and aid; Arena was already disabled. No replacement marketing tracker was added. Historical attribution already present in a browser is not retroactively erased by this release. |
| Diagnostics and feedback | Sentry remains for technical errors and user-submitted feedback. Errors may be reported automatically. The integration strips specified request/form/URL data and has no replay/tracing/screenshot integration; this is not a zero-network or absolute-anonymity claim. |
| Payments | Disabled now. Stripe is identified as the configured future processor, with future order/entitlement records distinguished from card handling. |

Marketing analytics and session recording are disabled; hosting connections, optional accounts, diagnostics and deliberate feedback still involve network requests. No complete packet-level privacy certification is claimed. Provider retention, deletion operations and sales/privacy policies need human operational review before sales.

## Advanced practice, pressure and social proof

Streaks, scores, badges, challenges, goals, pressure mode and other existing advanced tools remain secondary to the first practice flow. The prior simulated-pressure correction is preserved: the displayed pressure value is not biological heart-rate measurement. No medical/biometric claim was added by this release. Gentle Mode remains available and suitable for the initial experience.

No testimonials, customer totals, partner logos, attorney endorsements, effectiveness percentages or conversion statistics were invented. The site uses inspectable process evidence instead. Future social proof must come from real pilots, partners and permissioned statements.

## SEO, accessibility, mobile and localization

The canonical homepage remains `/`, served from `new/index.html`. The release updates canonical routing and redirects for duplicate implementation paths, adds the physical offer route and links organization/trust pages. The homepage’s meaningful content is prerendered through `tools/prerender-home.mjs` rather than depending only on an empty JavaScript shell. The generator includes the static bilingual privacy pages in the sitemap. Spanish organization navigation resolves to the same supported EN/ES experience.

Controls retain visible focus, meaningful labels, standard link/button semantics and reduced-motion support. Organization form controls use labels, validation and practical touch sizes; the fallback contact path works without a new backend. Responsive checks cover **320, 375, 390, 430, 768, 1024 and 1440 px**. The release owner reports **84 route-width checks across 12 routes with no horizontal overflow**.

New public trust content is provided as English/Spanish static page pairs through the existing generator. Commerce uses the existing vanilla bilingual/query convention. Arena copy uses its existing dictionary, and pack privacy strings were mechanically extracted into the app content files. No second translation framework was introduced.

These are practical release checks, not WCAG certification. The reported checks do not establish a full assistive-technology audit, every real-device/browser combination or universal iOS media behavior.

## Payment implementation and deployment

The old client flag alone did not prevent callers from reaching server session creation. The server now rejects checkout unless `PAYMENTS_LIVE` is exactly `true`; the public handler returns a non-sensitive 503 before reading customer data or contacting Stripe when closed. Existing redemption and webhook paths remain for prior purchases.

**The production Convex deployment succeeded.** A production `POST /checkout` with an empty `{}` body returned **503, payments not available yet**. This verifies the closed production gate, not a successful paid checkout. Physical checkout remains closed. No live flag was enabled and no real transaction occurred.

Success/cancellation/error/entitlement behavior remains subject to a controlled payment test after the legal, business and explicit authorization gates. A static website deployment does not itself deploy Convex; the backend deployment above was performed separately.

## Test results

| Check | Result |
| --- | --- |
| Automated suite | **116 tests passed**, as reported by the release owner. Includes commerce contact/payment gate and motion coverage. |
| Lint and app build | Passed. Compiled app privacy copy regenerated. |
| Inline JavaScript | Owned pack/Arena/aid scripts passed parsing after recovery; homepage changes were integrated by the release owner. |
| Content extraction | Passed, 313 top-level keys and 366 deep paths with EN/ES structure parity. Legal banks remained unchanged. |
| Generated public pages | All 113 non-sitemap generated pages current at the trust checkpoint. |
| Responsive routes | 84 checks, 12 routes × seven widths; no horizontal overflow reported. |
| Practice | Five-turn practice completed in English and Spanish. |
| Organization contact | Draft generation and deliberate copy/mail controls tested; no sending. |
| Trust routes | Six local trust/privacy routes returned 200 with server-rendered headings/canonicals. |
| Production payment gate | Convex deployed; empty-body checkout request returned 503 as intended. |

No final production website smoke pass is claimed while that deployment is pending. No live purchase, delivery, legal review, conversion lift or measured effectiveness was tested. The parent release owner supplies browser results; the trust subagent had no available browser surface and did not independently perform those checks.

## Files changed

Primary authored and generated files are grouped below; content-hashed app bundle names will change with the final build.

- Homepage/motion: `new/index.html`, `new/cinema-content.js`, `new/cinema-motion.js`, `new/cinema.css`, `new/assets/cinema-traffic-hero.webp`, `new/assets/cinema-traffic-hero.mp4`, `new/assets/cinema-doorstep.webp`, `tools/prerender-home.mjs`, `tools/cinema-motion.test.mts`.
- Commerce: `organizations/index.html`, `new/organizations.html`, `new/ready-kit.html`, `new/commerce.css`, `new/commerce.js`, `tools/commerce-contact.test.mts`, `tools/commerce-payment-gate.test.mts`.
- Trust/privacy: `tools/build-pages.mjs`, `about/index.html`, `acerca/index.html`, `how-we-verify/index.html`, `como-verificamos/index.html`, `privacy/index.html`, `privacidad/index.html`, `arena/index.html`, `pack.html`, `new/aid.html`.
- Backend: `app-src/convex/http.ts`, `app-src/convex/stripe.ts`.
- Integration/build: `vercel.json`, `sitemap.xml`, `app-src/src/content/t.en.json`, `app-src/src/content/t.es.json`, `app/index.html`, `app/sw.js`, and regenerated `app/assets/` bundles.
- Evidence: `notebook/AMPARO-CINEMA-ASSETS.md`, generation/provenance records, `notebook/cinematic-commerce-audit.md`, `notebook/cinematic-trust-audit.md`, and this release report.

Work was recovered into an isolated worktree after another task removed tracked edits in the original checkout. The recovery was verified before integration; the final commit/deployment record must identify the isolated release that actually ships.

## Human actions required

1. Obtain independent attorney review of specific editions and the relevant supervision/held-scenario behavior. Record real credentials, jurisdiction, date and edition before showing a completed review.
2. Decide the actual physical specification, inspect samples and establish production/shipping/support capacity. Reconcile postcard capabilities with any desired durable or laminated product before making claims.
3. Approve consumer and organizational pricing, actual deliverables, order terms, cancellation/refund policies and provider/privacy operations.
4. Explicitly authorize controlled payment testing and eventual live activation only after those gates. Test success, cancellation, duplicate requests, connectivity failure and restoration without assuming a preview proves payment readiness.
5. Confirm contact inbox monitoring; recruit organization pilots; obtain permission for real testimonials/partner logos and collect honest outcomes.
6. Complete the main website deployment and smoke check, then append the exact commit and production result to this report.

## Top five next business actions

1. Commission edition-specific attorney review and resolve its findings before commercial launch.
2. Produce and inspect a physical sample, settle deliverable contents and establish reliable fulfillment costs.
3. Run a small organization pilot using materials that actually exist, and learn what facilitators need before promising a full workshop package.
4. Finalize unit economics, prices, support/refund terms and the gated payment test plan.
5. Collect permissioned pilot feedback and real demand signals through monitored contact channels; use that evidence for future proof and sales decisions.

## Final deployment record

Website commit: pending release owner update.
Website deployment/smoke check: pending release owner update.
Production backend: deployed; checkout remains closed with verified 503 response.
Commercial launch: conditional; not authorized by this report.
