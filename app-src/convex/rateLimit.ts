import { internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { decide } from './lib/rateLimit.ts'

/* One row per (scope, client). The decision is lib/rateLimit.ts (pure,
 * tested); this mutation only reads and writes the row. Rows hold a key, a
 * window start and a count: no request content, nothing to leak. */
export const hit = internalMutation({
  args: { key: v.string(), limit: v.number(), windowMs: v.number() },
  handler: async (ctx, { key, limit, windowMs }) => {
    const now = Date.now()
    const row = await ctx.db.query('rateLimits').withIndex('by_key', (q) => q.eq('key', key)).unique()
    const { allowed, next } = decide(row ? { windowStart: row.windowStart, count: row.count } : null, now, limit, windowMs)
    if (!row) await ctx.db.insert('rateLimits', { key, ...next })
    else if (allowed) await ctx.db.patch(row._id, next)
    return allowed
  },
})
