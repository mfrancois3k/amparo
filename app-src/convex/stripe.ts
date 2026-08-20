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
const PRODUCTS: Record<string, { usd: number; name: string }> = {
  script: { usd: 399, name: 'Amparo Script Pack' },
  deep: { usd: 699, name: 'Amparo Deep Pack' },
  tip: { usd: 300, name: 'Support Amparo' },
}

export const createCheckout = action({
  args: { product: v.string() },
  handler: async (ctx, { product }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Sign in to purchase')
    const p = PRODUCTS[product]
    if (!p) throw new Error('Unknown product')
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Payments not configured yet')
    const site = process.env.SITE_URL ?? 'https://amparohq.com'
    const stripe = new Stripe(key)
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
      metadata: { product, userId: identity.subject },
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
  args: { product: v.string() },
  handler: async (_ctx, { product }) => {
    const p = PRODUCTS[product]
    if (!p) throw new Error('Unknown product')
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Payments not configured yet')
    const site = process.env.SITE_URL ?? 'https://amparohq.com'
    const stripe = new Stripe(key)
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
      metadata: { product, userId: 'guest' },
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
      if (!PRODUCTS[product]) return { ok: false as const, status: 400, error: 'unknown product' }
      return { ok: true as const, product, amount: s.amount_total ?? 0 }
    } catch {
      return { ok: false as const, status: 404, error: 'no such session' }
    }
  },
})

/* Webhook signature verification (Node runtime). Returns fulfillment data for
 * http.ts to record; never touches the DB itself. */
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
    if (event.type !== 'checkout.session.completed') return { ok: true as const, fulfill: null }
    const s = event.data.object as Stripe.Checkout.Session
    return {
      ok: true as const,
      fulfill: {
        userId: (s.metadata?.userId as string) ?? s.client_reference_id ?? 'unknown',
        product: (s.metadata?.product as string) ?? 'unknown',
        stripeSessionId: s.id,
        amount: s.amount_total ?? 0,
      },
    }
  },
})
