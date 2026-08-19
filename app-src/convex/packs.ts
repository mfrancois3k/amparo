import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/* One pack per user, upserted whole. The client stays local-first: this is a
 * backup/sync of what the user already typed, never the source of truth for
 * an active session. Unauthenticated calls are an error — the free flow
 * never reaches these functions. */

const packFields = {
  state: v.union(v.string(), v.null()),
  name: v.string(),
  ec: v.string(),
  ecp: v.string(),
  ec2: v.string(),
  ecp2: v.string(),
  att: v.string(),
  zip: v.string(),
  lang: v.union(v.literal('en'), v.literal('es')),
}

export const save = mutation({
  args: packFields,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not signed in')
    const existing = await ctx.db
      .query('packs')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .unique()
    const doc = { userId: identity.subject, ...args, updatedAt: Date.now() }
    if (existing) await ctx.db.patch(existing._id, doc)
    else await ctx.db.insert('packs', doc)
    return { ok: true }
  },
})

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return await ctx.db
      .query('packs')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .unique()
  },
})

/* Delete the saved pack. FG24 golden #2: v2.25.0 shipped an upload of the
 * user's support network (name, two emergency contacts, attorney, ZIP) with
 * no way to take it back — the wipe buttons on every surface only ever
 * reached localStorage. For this user base a one-way upload is not
 * acceptable, and the privacy text now promises this button exists. */
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not signed in')
    const existing = await ctx.db
      .query('packs')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .unique()
    if (existing) await ctx.db.delete(existing._id)
    return { ok: true }
  },
})
