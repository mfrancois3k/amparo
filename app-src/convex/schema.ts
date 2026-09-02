import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/* Accounts era, deliberately narrow (2026-08-19): an account exists for ONE
 * reason — saving your pack across devices. The schema is the privacy
 * policy, enforced structurally:
 *  - NO document photos, ever. Root/app keep those in device-local storage
 *    only (sr_docs / app 'docs' key). A licence photo on a server is
 *    subpoena/breach surface this user base cannot afford; there is no
 *    column for it, so no bug can sync it.
 *  - NO practice history, scores, streaks or arena state — rehearsal
 *    stays on-device. What you practiced is nobody's business.
 *  - Pack fields only: the same text the user prints on paper anyway.
 */
export default defineSchema({
  packs: defineTable({
    userId: v.string(), // Clerk subject (identity.subject)
    state: v.union(v.string(), v.null()),
    name: v.string(),
    ec: v.string(),
    ecp: v.string(),
    ec2: v.string(),
    ecp2: v.string(),
    att: v.string(),
    zip: v.string(),
    lang: v.union(v.literal('en'), v.literal('es')),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  purchases: defineTable({
    userId: v.string(),
    product: v.string(), // 'script' | 'master' | 'armor' | 'deep' | 'tip' | org tiers later
    stripeSessionId: v.string(),
    amount: v.number(), // cents, from Stripe, not the client
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_session', ['stripeSessionId']),

  /* Payments era, 2026-09-02. Two more tables, same posture.
   *
   * stripeEvents: one row per Stripe event id we have acted on. The webhook
   * commits the event row, the purchase and the order in ONE mutation, so a
   * redelivered event (Stripe retries for days) finds the row and does
   * nothing. Per-session dedupe on purchases/orders stays as the second lock:
   * Stripe can emit more than one event for a session.
   *
   * orders: the physical-fulfilment queue for `physical` products. Retries
   * are the Convex scheduler re-running fulfillment.dispatch with the backoff
   * from lib/queue.ts; the row is the only state.
   *
   * NO shipping address, NO name, ever. The address lives at Stripe (the
   * receipt needs it) and at the printer (the label needs it); dispatch reads
   * it from the Checkout Session at send time and never writes it here or to
   * a log. A buyer's home address next to a "know your rights at a police
   * stop" purchase is exactly the join this user base cannot afford to have
   * sitting in a database, so there is no column for it. */
  stripeEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    receivedAt: v.number(),
  }).index('by_event', ['eventId']),

  orders: defineTable({
    stripeSessionId: v.string(),
    stripeEventId: v.string(),
    product: v.string(),
    state: v.string(), // two-letter code, or 'US' for the federal-only card
    lang: v.union(v.literal('en'), v.literal('es')),
    provider: v.union(v.literal('lob'), v.literal('gelato'), v.literal('none')),
    status: v.union(v.literal('queued'), v.literal('submitted'), v.literal('failed'), v.literal('dead')),
    attempts: v.number(),
    nextAttemptAt: v.union(v.number(), v.null()),
    providerOrderId: v.union(v.string(), v.null()),
    lastError: v.union(v.string(), v.null()), // provider's short message only, never request data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_session', ['stripeSessionId'])
    .index('by_status', ['status']),
})
