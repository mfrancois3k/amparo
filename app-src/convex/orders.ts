import { internalMutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { commitPlan, type CommitDb } from './lib/commit.ts'

/* Default runtime. The commit logic itself is lib/commit.ts (pure, tested);
 * this file adapts ctx.db to it and schedules the first dispatch. One
 * mutation = one transaction, which is what makes the event-id idempotency a
 * guarantee rather than a race. */

const purchase = v.object({ userId: v.string(), product: v.string(), stripeSessionId: v.string(), amount: v.number() })
const orderSeed = v.object({ product: v.string(), stripeSessionId: v.string(), state: v.string(), lang: v.union(v.literal('en'), v.literal('es')) })

export const commitEvent = internalMutation({
  args: { eventId: v.string(), type: v.string(), purchase: v.union(purchase, v.null()), order: v.union(orderSeed, v.null()) },
  handler: async (ctx, args) => {
    const db: CommitDb = {
      findEvent: (eventId) => ctx.db.query('stripeEvents').withIndex('by_event', (q) => q.eq('eventId', eventId)).unique(),
      insertEvent: async (row) => { await ctx.db.insert('stripeEvents', row) },
      findPurchaseBySession: (s) => ctx.db.query('purchases').withIndex('by_session', (q) => q.eq('stripeSessionId', s)).unique(),
      insertPurchase: async (row) => { await ctx.db.insert('purchases', row) },
      findOrderBySession: async (s) => {
        const o = await ctx.db.query('orders').withIndex('by_session', (q) => q.eq('stripeSessionId', s)).unique()
        return o ? { id: o._id } : null
      },
      insertOrder: async (row) => ctx.db.insert('orders', row),
    }
    const result = await commitPlan(db, args, Date.now())
    if (result.status === 'committed' && result.orderId) {
      await ctx.scheduler.runAfter(0, internal.fulfillment.dispatch, { orderId: result.orderId as Id<'orders'> })
    }
    return result
  },
})

export const get = internalQuery({
  args: { orderId: v.id('orders') },
  handler: (ctx, { orderId }) => ctx.db.get(orderId),
})

/** Everything an operator might need to re-dispatch: queued (never tried,
 * or provider unconfigured at the time) and failed (waiting on a retry). */
export const listOpen = internalQuery({
  args: {},
  handler: async (ctx) => {
    const queued = await ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', 'queued')).collect()
    const failed = await ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', 'failed')).collect()
    return [...queued, ...failed]
  },
})

/** Paid, undeliverable, waiting on a person: refund, address fix, or a manual
 * print. Run from the Convex dashboard; nothing retries these automatically. */
export const listDead = internalQuery({
  args: {},
  handler: (ctx) => ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', 'dead')).collect(),
})

export const applyOutcome = internalMutation({
  args: {
    orderId: v.id('orders'),
    patch: v.object({
      status: v.union(v.literal('queued'), v.literal('submitted'), v.literal('failed'), v.literal('dead')),
      attempts: v.number(),
      nextAttemptAt: v.union(v.number(), v.null()),
      providerOrderId: v.union(v.string(), v.null()),
      lastError: v.union(v.string(), v.null()),
      provider: v.union(v.literal('lob'), v.literal('gelato'), v.literal('none')),
    }),
  },
  handler: async (ctx, { orderId, patch }) => {
    await ctx.db.patch(orderId, { ...patch, updatedAt: Date.now() })
  },
})
