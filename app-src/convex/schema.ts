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
    product: v.string(), // 'script' | 'deep' | 'tip' | org tiers later
    stripeSessionId: v.string(),
    amount: v.number(), // cents, from Stripe, not the client
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_session', ['stripeSessionId']),
})
