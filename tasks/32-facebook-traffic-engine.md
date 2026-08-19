WARGAME ORDER. You are not executing this mission, you are wargaming it. A cheaper executor
(Sonnet) runs the brief below later. Your job is the route it will follow.

Recon first, read-only: root `index.html` (analytics, capture, funnel surfaces), `arena/index.html`
(the only purchase surface), `app-src/convex/stripe.ts` + `http.ts` (server-side prices, PAYMENTS_LIVE),
`CHANGELOG.md` v2.26.1 (fulfilment gap), `wargames/31-paywall-meets-ladder.md` (paywall placement),
Meta's Special Ad Categories + SIEP policy, the Notion "Facebook Automation Guide", and the two
source videos' extracted playbooks.

Then fight the mission on paper, move by move, and write it to wargames/32-facebook-traffic-engine.md:

- every move states its expected observation, exactly what you should see if it worked
- every move carries its most likely failure, the cause it signals, and the counter-move
- every fork gets a trigger, if you observe X, take route B
- assumptions recon could not settle get marked RECON NEEDED with the exact check that settles it
- end with abort conditions, and the verification runs the executor must perform with what pass looks like for each

Write it so the executor can run the brief end to end without asking a single question.

=== THE MISSION BRIEF (the executor's orders, not yours) ===

Stand up Facebook as the primary traffic channel for Amparo (https://www.amparohq.com/), from zero.
Nothing is set up today: no Facebook page, no Business Manager, no ad account, no pixel, no
Conversions API, no email list, no UTM capture, no creative library.

PRODUCT REALITY (do not market past it):
- Amparo is a free, bilingual (EN/ES) traffic-stop pack: a window card that speaks for the driver,
  their documents displayed, their state's rules, and the exact words to say — designed to be printed
  and kept in the glovebox. Single-page app, root `index.html`.
- A practice arena (`arena/index.html`) drills the same scripts.
- Paid tiers exist in code only: Script Pack $3.99, Deep Pack $6.99, tip $3.00, priced server-side in
  `app-src/convex/stripe.ts`. `PAYMENTS_LIVE=false` — no entitlement is granted and no Script/Deep
  Pack artifact exists (CHANGELOG v2.26.1). THE PAID PRODUCT IS NOT SHIPPABLE. Do not run any ad,
  post, or landing page that promises a paid pack until fulfilment lands.
- Root has zero purchase surface; 100% of the revenue surface sits inside the arena
  (wargames/31 §2a). Ad traffic lands on root, which cannot transact.

CAMPAIGN GOAL (this quarter): qualified traffic to amparohq.com and completed free packs, plus an
owned email list. Revenue is explicitly out of scope until fulfilment ships.

CONSTRAINTS:
- Meta Special Ad Categories: "know your rights at a traffic stop" plausibly reads as civil-rights
  advocacy → Social Issues, Elections or Politics (SIEP). If classified SIEP: advertiser ID
  verification, a "Paid for by" disclaimer, 7-year Ad Library retention, no detailed interest
  targeting, no ZIP targeting, 15-mile minimum US radius, age locked 18–65+. The campaign must have a
  route that survives this, not a plan that assumes it away.
- Trust is the product. No scraped/reposted content, no fabricated legal claims, no officer dialogue
  authored outside the `TODO_ATTORNEY` convention (wargames/03).
- Budget: {{DAILY_BUDGET}} to start. Operator is one person plus AI workers.
- Bilingual EN/ES is a real asset — treat Spanish as a first-class ad set, not a translation.

DELIVERABLES the executor must produce:
1. Measurement spine on amparohq.com (pixel or CAPI, UTM capture, the events that matter) — before
   any spend.
2. An email capture that earns the address with the free pack.
3. Facebook page + Business Manager + ad account, set up to survive a SIEP classification.
4. A creative system: hooks, formats, and a production loop that runs weekly without the operator
   writing every asset.
5. A test → read → scale/kill ladder with explicit numeric triggers.
6. An explicit list of what the HUMAN (Michael) must do personally, because it cannot be automated:
   identity verification, payment method, page ownership, legal review, and any irreversible spend.
