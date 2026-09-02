'use node'
import { action, internalAction } from './_generated/server'
import { v } from 'convex/values'
import Stripe from 'stripe'

/* Real Stripe Checkout. Requires two Convex env vars the OPERATOR sets (never
 * committed):
 *   npx convex env set STRIPE_SECRET_KEY sk_live_...
 *   npx convex env set SITE_URL https://amparohq.com
 * Until STRIPE_SECRET_KEY exists this action throws and the UI keeps its
 * honest "preview" checkout — no fake success paths.
 *
 * Prices are defined HERE, server-side, in cents. The client sends a product
 * id, never an amount. */
/* The price table (and the `held` / `physical` rules) live in lib/products.ts
 * so the default-runtime HTTP router can read them without this file's
 * stripe import. Read that file's comment before adding a product. */
import { PRODUCTS } from './lib/products.ts'

/* `state` and `lang` ride along in Checkout metadata so the webhook can queue
 * the right Physical Armor card. Validated here; a bad value is dropped, never
 * echoed. Physical products make Stripe collect a US shipping address, which
 * is read back at fulfilment time and never stored by us (see schema.ts). */
const STATE = /^[A-Z]{2}$/
function checkoutExtras(p: (typeof PRODUCTS)[string], state?: string, lang?: string) {
  const metadata: Record<string, string> = {}
  if (state && STATE.test(state)) metadata.state = state
  if (lang === 'en' || lang === 'es') metadata.lang = lang
  const shipping = p.physical ? { shipping_address_collection: { allowed_countries: ['US' as const] } } : {}
  return { metadata, shipping }
}

export const createCheckout = action({
  args: { product: v.string(), state: v.optional(v.string()), lang: v.optional(v.string()) },
  handler: async (ctx, { product, state, lang }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Sign in to purchase')
    const p = PRODUCTS[product]
    if (!p) throw new Error('Unknown product')
    if (p.held) throw new Error('not available yet')
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Payments not configured yet')
    const site = process.env.SITE_URL ?? 'https://amparohq.com'
    const stripe = new Stripe(key)
    const extras = checkoutExtras(p, state, lang)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: p.usd,
            product_data: { name: p.name },
          },
          quantity: 1,
        },
      ],
      client_reference_id: identity.subject,
      metadata: { product, userId: identity.subject, ...extras.metadata },
      ...extras.shipping,
      success_url: `${site}/app/?checkout=success`,
      cancel_url: `${site}/app/?checkout=cancelled`,
    })
    return { url: session.url }
  },
})

/* Guest checkout — the arena (vanilla JS, no Clerk session) and signed-out
 * /app users buy without an account; the Stripe receipt email is their proof
 * of purchase, and a later sign-in can claim the session id. Same server-side
 * price table; the client only ever names a product. */
export const guestCheckout = internalAction({
  args: { product: v.string(), state: v.optional(v.string()), lang: v.optional(v.string()) },
  handler: async (_ctx, { product, state, lang }) => {
    const p = PRODUCTS[product]
    if (!p) throw new Error('Unknown product')
    if (p.held) throw new Error('not available yet')
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Payments not configured yet')
    const site = process.env.SITE_URL ?? 'https://amparohq.com'
    const stripe = new Stripe(key)
    const extras = checkoutExtras(p, state, lang)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: p.usd,
            product_data: { name: p.name },
          },
          quantity: 1,
        },
      ],
      metadata: { product, userId: 'guest', ...extras.metadata },
      ...extras.shipping,
      /* {CHECKOUT_SESSION_ID} is substituted by Stripe on redirect. A guest has
       * no account, so this id is the ONLY thing that ties the returning browser
       * to a payment — without it there is no way to deliver anything to someone
       * who checked out without signing in. */
      success_url: `${site}/arena/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/arena/?checkout=cancelled`,
    })
    return { url: session.url }
  },
})

/* Redemption for guest checkout. The browser comes back from Stripe holding a
 * session id; this asks Stripe directly whether that session is paid and what
 * it was for.
 *
 * Deliberately asks Stripe rather than trusting the redirect: the success_url
 * is just a url, and anyone can type it. The webhook remains the system of
 * record for the purchases table — this endpoint only answers "may this
 * browser unlock the thing it just paid for", which is a question the webhook
 * cannot answer in time, because the redirect usually beats the webhook.
 *
 * Returns no customer data. Only whether it is paid, and which product. */
export const verifySession = internalAction({
  args: { sessionId: v.string() },
  handler: async (_ctx, { sessionId }) => {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return { ok: false as const, status: 503, error: 'not configured' }
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { ok: false as const, status: 400, error: 'bad session id' }
    const stripe = new Stripe(key)
    try {
      const s = await stripe.checkout.sessions.retrieve(sessionId)
      if (s.payment_status !== 'paid') return { ok: false as const, status: 402, error: 'not paid' }
      const product = (s.metadata?.product as string) ?? 'unknown'
      const p = PRODUCTS[product]
      if (!p) return { ok: false as const, status: 400, error: 'unknown product' }
      /* Defence in depth. Refusing `held` at checkout CREATION only guards the
       * path that goes through this code today; it does nothing about a session
       * that already exists. /checkout is public, CORS `*`, and unauthenticated,
       * so a session for a held product can be created by anyone who reads the
       * page source — and one created before this gate deployed stays payable
       * forever, since nothing re-validates after creation.
       * The money is real either way, so the webhook still records the purchase:
       * losing the trail would make a refund harder, and a `deep` row appearing
       * while `deep` is held IS the alarm. What must not happen is granting an
       * entitlement to something undeliverable and showing the buyer nothing. */
      if (p.held) return { ok: true as const, product, held: true as const, amount: s.amount_total ?? 0 }
      return { ok: true as const, product, amount: s.amount_total ?? 0 }
    } catch {
      return { ok: false as const, status: 404, error: 'no such session' }
    }
  },
})

/* Webhook signature verification (Node runtime). Returns the verified event's
 * id, type and the session fields lib/plan.ts reads; http.ts turns that into
 * a plan and commits it. Never touches the DB itself. */
export const verifyWebhook = internalAction({
  args: { body: v.string(), sig: v.string() },
  handler: async (_ctx, { body, sig }) => {
    const key = process.env.STRIPE_SECRET_KEY
    const whsec = process.env.STRIPE_WEBHOOK_SECRET
    if (!key || !whsec) return { ok: false as const, status: 503, error: 'not configured' }
    const stripe = new Stripe(key)
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, whsec)
    } catch {
      return { ok: false as const, status: 400, error: 'bad signature' }
    }
    if (event.type !== 'checkout.session.completed') return { ok: true as const, eventId: event.id, type: event.type, session: null }
    const s = event.data.object as Stripe.Checkout.Session
    return {
      ok: true as const,
      eventId: event.id,
      type: event.type,
      session: {
        id: s.id,
        amount_total: s.amount_total ?? null,
        client_reference_id: s.client_reference_id ?? null,
        metadata: (s.metadata ?? null) as Record<string, string> | null,
      },
    }
  },
})
