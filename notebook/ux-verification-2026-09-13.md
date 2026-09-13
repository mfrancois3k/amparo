# Amparo UX verification — 2026-09-13

## Changes
- new/index.html: direct bilingual practice hero, trust and review status,
  three-step explanation, concise navigation, Organizations link repair,
  language-preserving practice links, focus styles and shorter scroll sections.
- arena/index.html: setup around the existing engine, required state, existing
  available situations, default Gentle Mode, advanced tools hidden until completion,
  explicit first-session feedback/Continue, primary next-scenario action,
  accessible dialogs, input labels, microphone error recovery, mobile layout.
- tools/check-inline-scripts.mjs: reusable pre-push syntax check for all public
  entry pages. Run from repository root before every push.
- CHANGELOG.md and notebook/amparo-version-history.md: release records.
- Three untracked ship-*.cmd helpers deleted; no tracked deletion commit was needed.

## Verified
- v2.29.4 pushed as beb6756 and production /pack browser-tested.
- Dropdown and map both render; selecting Texas collapses into the selected-state
  confirmation and enables Continue. Dropdown remains ABOVE the map as implemented
  in v2.29.3, despite the handoff verification wording saying below.
- All public inline scripts parse. Mechanical /app content verification passes.
- Existing npm test suite: 90 passed; SW routing: 22 assertions passed;
  Arena deep-link checks: 16 passed.
- Real browser: homepage CTA → state → scenario → safety/supervision notices →
  all five traffic responses → completion, English and Spanish.
- First-run dashboard hidden; advanced controls reappear after completion.
- Keyboard focus wraps within the safety modal. Response and Continue controls
  use native buttons. Focus-restoration regression found and fixed during testing.
- Homepage and setup document widths checked at 320, 375, 390, 430, 768, 1024,
  1440px; no horizontal document overflow. Mobile and desktop screenshots inspected.

## Preserved and decisions
- SCEN/SIT scenario bank, substantive legal text, review gates, voice consent,
  state data, local storage keys, entitlements, payment availability and free
  download implementations retained. /app content remains mechanically sourced.
- No new analytics events. Arena had PostHog while explicitly promising no
  analytics/cookies. Its initialization is disabled pending a product decision.
  Homepage/pack analytics were not expanded. Broader legacy privacy claims should
  be reconciled with existing homepage/pack analytics and optional account behavior.
- UI changes do not imply attorney approval. No new substantive legal wording
  was authored and no legal edition bump is required for this change.
- No new dependencies; unused former hero image preload removed. Existing lower
  page visual assets remain lazy-loaded. No Lighthouse score claimed.

## Limits and next priorities
1. Professional review of existing practice/legal claims remains pending.
2. Resolve the product-wide privacy-copy/analytics decision before adding a funnel.
3. Run real-device microphone/offline and paid-fulfilment acceptance testing.
Live purchases were not made; PAYMENTS_LIVE remains false. Browser speech-service
delivery, true offline network emulation and complete WCAG audit are not certified.
