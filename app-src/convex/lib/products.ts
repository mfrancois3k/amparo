/* The price table. Server-side, in cents; the client only ever names a product.
 *
 * Lives in lib/ (no runtime imports) so both the Node-runtime Stripe actions
 * and the default-runtime HTTP router can read it without dragging the stripe
 * SDK into the wrong bundle.
 *
 * `held` = priced and named, but NOT yet deliverable. A held product is
 * refused server-side at checkout creation AND at redemption, which is the
 * only gate that matters: the client is not the only way to reach /checkout.
 *
 * Deep Pack is held because it promises four things and can deliver one.
 * `renderScriptPack` is the only fulfilment renderer that exists; there is no
 * Deep Pack renderer, so a buyer would get a localStorage flag and nothing
 * else. Worse, two of the four promises cannot be written safely today:
 *   - "courthouse directions" is per-state factual data that exists nowhere in
 *     this repo. Inventing it sends someone to the wrong building on a court
 *     date.
 *   - the "ICE-encounter addendum" would draw on the door-knock drill, which
 *     the arena itself gates behind `HELD_SITS={door:1}` pending attorney and
 *     DV-clinician review. Content too unreviewed to give away free must not
 *     be sold.
 * Clear `held` only when a renderer exists AND its source content has passed
 * that review.
 *
 * `physical` = the order also ships something. Checkout collects a US
 * shipping address for it and the webhook queues a fulfilment order (see
 * orders.ts / fulfillment.ts). The Armor card's state side prints state-law
 * lines only for a state whose attorney review flag is set (none today);
 * every other state gets the federal baseline, the verified lifelines and the
 * provisional notice, which is the same gate as `held` applied per state
 * (lib/armorCard.ts). */
export type Product = { usd: number; name: string; held?: true; physical?: true }

export const PRODUCTS: Record<string, Product> = {
  script: { usd: 399, name: 'Amparo Script Pack' },
  master: { usd: 999, name: 'Amparo Master Script' },
  armor: { usd: 1999, name: 'Amparo Physical Armor: laminated glovebox card + Master Script', physical: true },
  deep: { usd: 699, name: 'Amparo Deep Pack', held: true },
  tip: { usd: 300, name: 'Support Amparo' },
}
