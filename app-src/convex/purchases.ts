import { query } from './_generated/server'

/* Written only by the Stripe webhook through orders.commitEvent (one
 * transaction with the event row and any fulfilment order; see lib/commit.ts),
 * read by the signed-in user. The old per-call `record` mutation went with
 * that change: two writers to the same table is how a dedupe rule drifts. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query('purchases')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect()
  },
})
