import { internalMutation, query } from './_generated/server'
import { v } from 'convex/values'

/* Written only by the Stripe webhook (internal), read by the signed-in user. */
export const record = internalMutation({
  args: {
    userId: v.string(),
    product: v.string(),
    stripeSessionId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const dup = await ctx.db
      .query('purchases')
      .withIndex('by_session', (q) => q.eq('stripeSessionId', args.stripeSessionId))
      .unique()
    if (dup) return // webhook retries are normal; record once
    await ctx.db.insert('purchases', { ...args, createdAt: Date.now() })
  },
})

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
