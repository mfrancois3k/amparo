'use node'
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import Stripe from 'stripe'
import { runDispatch, type DispatchDeps } from './lib/dispatch.ts'
import type { ShipTo } from './lib/providers.ts'
import { armorPostcardHtml, type HudFile } from './lib/armorCard.ts'
import hud from '../src/content/hud.json'
import { STATE_LEGAL_AID, BASE_LIFELINES } from '../src/content/states.json'

/* Physical fulfilment: one attempt per invocation, rescheduled by itself.
 *
 * Operator setup (Convex env, never committed):
 *   npx convex env set FULFILLMENT_PROVIDER lob        # or gelato; unset = orders wait
 *   npx convex env set LOB_API_KEY live_...            # Lob prints the inline HTML faces
 *   npx convex env set GELATO_API_KEY ...              # Gelato needs a hosted PDF instead:
 *   npx convex env set GELATO_PRODUCT_UID ...          #   the catalogue uid of the card product
 *   npx convex env set ARMOR_CARD_FILE_URL https://... #   and a public URL of the print file
 * STRIPE_SECRET_KEY is shared with stripe.ts (the shipping address is read
 * from the Checkout Session here, at send time, and nowhere else).
 *
 * Nothing in this file logs. The address and the buyer's name exist only in
 * the request body handed to the provider. */

type Addr = { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null }
type Shipping = { name?: string | null; address?: Addr | null }

/* In the installed SDK (stripe 22.x) the collected address lives at
 * collected_information.shipping_details; the billing details, which
 * Checkout always collects, are the fallback. */
function shippingFrom(session: unknown): ShipTo | null {
  const s = session as { collected_information?: { shipping_details?: Shipping | null } | null; customer_details?: Shipping | null }
  const sd = s.collected_information?.shipping_details ?? s.customer_details ?? null
  const a = sd?.address
  if (!a?.line1 || !a.city || !a.state || !a.postal_code) return null
  return {
    name: sd?.name ?? '',
    line1: a.line1,
    ...(a.line2 ? { line2: a.line2 } : {}),
    city: a.city,
    state: a.state,
    zip: a.postal_code,
    country: a.country ?? 'US',
  }
}

const HUD = hud as unknown as HudFile
const AID = STATE_LEGAL_AID as Record<string, { n: string; p: string }>
const BASE = BASE_LIFELINES as { n: string; p: string }[]

function lifelinesFor(code: string): { n: string; p: string }[] {
  const own = AID[code]
  return (own ? [own, ...BASE] : BASE).slice(0, 3).map((l) => ({ n: l.n, p: l.p }))
}

function depsFromEnv(): DispatchDeps {
  const provider = (process.env.FULFILLMENT_PROVIDER === 'lob' || process.env.FULFILLMENT_PROVIDER === 'gelato') ? process.env.FULFILLMENT_PROVIDER : 'none'
  const stripeKey = process.env.STRIPE_SECRET_KEY
  return {
    provider,
    config: {
      lobKey: process.env.LOB_API_KEY,
      gelatoKey: process.env.GELATO_API_KEY,
      gelatoProductUid: process.env.GELATO_PRODUCT_UID,
      cardFileUrl: process.env.ARMOR_CARD_FILE_URL,
    },
    getShipping: async (sessionId) => {
      if (!stripeKey) return null
      const stripe = new Stripe(stripeKey)
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      return shippingFrom(session)
    },
    /* Lob prints a 4x6 postcard from full HTML documents sized 6.25 x 4.25 in;
       the bare 3.5 x 2 in face would render as a small card on a blank sheet
       with no address zone reserved (blind-spot audit, 2026-09-03). */
    renderCard: ({ code, lang, side }) => armorPostcardHtml({ code, lang, side, hud: HUD, lifelines: code === 'US' ? BASE.slice(0, 3) : lifelinesFor(code) }),
    send: async (req) => {
      const r = await fetch(req.url, { method: req.method, headers: req.headers, body: JSON.stringify(req.body) })
      let json: unknown = null
      try { json = await r.json() } catch { /* non-JSON error body: status alone decides */ }
      return { status: r.status, json }
    },
  }
}

/* Explicit return types on both handlers: each schedules `internal.fulfillment.*`
 * from inside this module, and TypeScript refuses to infer a type that refers
 * to itself through the generated api. */
export const dispatch = internalAction({
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }): Promise<void> => {
    const order = await ctx.runQuery(internal.orders.get, { orderId })
    if (!order) return
    const res = await runDispatch(
      { ...order, id: order._id },
      depsFromEnv(),
      Date.now(),
    )
    await ctx.runMutation(internal.orders.applyOutcome, { orderId, patch: { ...res.order, provider: res.provider } })
    if (res.scheduleInMs !== null) await ctx.scheduler.runAfter(res.scheduleInMs, internal.fulfillment.dispatch, { orderId })
    /* A dead order is a paid customer who receives nothing. Nothing here can
       email yet, so this is the one place it is logged (Convex dashboard log
       stream and alerts); orders.listDead is the operator's queue. The line
       carries the order id and the provider's short message only, never a
       name or address. */
    if (res.order.status === 'dead') console.error(`fulfilment dead: order ${orderId} (${res.provider}): ${res.order.lastError ?? 'no detail'}`)
  },
})

/** Operator tool: re-dispatch everything queued or failed, e.g. after the
 * provider env vars are first set. Run from the Convex dashboard. */
export const retryOpen = internalAction({
  args: {},
  handler: async (ctx): Promise<{ scheduled: number }> => {
    const open: { _id: Id<'orders'> }[] = await ctx.runQuery(internal.orders.listOpen, {})
    for (const o of open) await ctx.scheduler.runAfter(0, internal.fulfillment.dispatch, { orderId: o._id })
    return { scheduled: open.length }
  },
})
