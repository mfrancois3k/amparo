import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { planFromEvent } from './lib/plan.ts'
import { PRODUCTS } from './lib/products.ts'
import { clientKey, LIMITS } from './lib/rateLimit.ts'

/* Per-client fixed window on the two public endpoints that spend money or
 * call Stripe (lib/rateLimit.ts). A denied request writes nothing and says
 * only "too many requests". */
const TOO_MANY = (cors: Record<string, string>) =>
  new Response(JSON.stringify({ error: 'too many requests' }), { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '3600' } })

/* Stripe webhook — fulfillment is recorded ONLY from Stripe's signed event,
 * never from the client's success redirect. Signature verification needs the
 * Node runtime, so it lives in stripe.ts (internal action); this router runs
 * in the default runtime ("use node" is not allowed here).
 *
 * Idempotent on the Stripe EVENT id: orders.commitEvent writes the event row,
 * the purchase and (for physical products) the fulfilment order in one
 * transaction, so a redelivery answers 200 and changes nothing. Returning 200
 * on a duplicate matters: a non-2xx makes Stripe keep retrying for days.
 *
 * Operator setup (after keys):
 *   npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
 * and point a Stripe webhook at  <convex-site-url>/stripe  for
 * checkout.session.completed. */
const http = httpRouter()

http.route({
  path: '/stripe',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const sig = request.headers.get('stripe-signature')
    if (!sig) return new Response('missing signature', { status: 400 })
    const body = await request.text()
    const result = await ctx.runAction(internal.stripe.verifyWebhook, { body, sig })
    if (!result.ok) return new Response(result.error, { status: result.status })
    if (!result.session) return new Response('ok', { status: 200 })
    const plan = planFromEvent({ id: result.eventId, type: result.type, data: { object: result.session } }, PRODUCTS)
    if (plan.kind !== 'fulfill') return new Response('ok', { status: 200 })
    const committed = await ctx.runMutation(internal.orders.commitEvent, {
      eventId: result.eventId,
      type: result.type,
      purchase: plan.purchase,
      order: plan.order,
    })
    return new Response(committed.status === 'duplicate' ? 'ok (duplicate)' : 'ok', { status: 200 })
  }),
})

/* Public checkout endpoint for the static surfaces (arena, root) that have no
 * Convex client. POST {product} -> {url}. 503 while STRIPE_SECRET_KEY is
 * unset, which the arena treats as "keep the honest preview". */
const CORS = {
  'Access-Control-Allow-Origin': '*', // response carries only a Stripe URL; the product name is the only input
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

http.route({
  path: '/checkout',
  method: 'OPTIONS',
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS })),
})

http.route({
  path: '/checkout',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const allowed = await ctx.runMutation(internal.rateLimit.hit, { key: clientKey(request.headers.get('x-forwarded-for'), 'checkout'), ...LIMITS.checkout })
    if (!allowed) return TOO_MANY(CORS)
    let product = ''
    let state: string | undefined
    let lang: string | undefined
    try {
      const j = (await request.json()) as { product?: string; state?: string; lang?: string }
      product = String(j.product ?? '')
      /* Optional, for the Physical Armor card. Validated again server-side in
       * stripe.ts; anything odd is dropped there rather than rejected here. */
      if (typeof j.state === 'string' && j.state.length <= 2) state = j.state
      if (typeof j.lang === 'string' && j.lang.length <= 2) lang = j.lang
    } catch {
      return new Response('bad request', { status: 400, headers: CORS })
    }
    try {
      const { url } = await ctx.runAction(internal.stripe.guestCheckout, { product, state, lang })
      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'error'
      /* The status carries the meaning; the body never echoes the thrown
         message, which for a Stripe failure can describe our configuration. */
      const [status, error] = msg.includes('not configured')
        ? [503, 'payments not configured']
        : msg.includes('Unknown product')
          ? [400, 'unknown product']
          : msg.includes('not available yet')
            ? [409, 'not available yet'] // priced but held — see PRODUCTS.held in lib/products.ts
            : [500, 'checkout failed']
      return new Response(JSON.stringify({ error }), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  }),
})

/* Guest redemption. POST {sessionId} -> {ok, product}. Called by the arena
 * when it comes back from Stripe carrying a session id.
 *
 * Rate-limiting note: the only thing an attacker can do here is ask whether a
 * session id they already possess is paid. Ids are unguessable, the response
 * carries no customer data, and nothing is written. */
http.route({
  path: '/redeem',
  method: 'OPTIONS',
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS })),
})

http.route({
  path: '/redeem',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const allowed = await ctx.runMutation(internal.rateLimit.hit, { key: clientKey(request.headers.get('x-forwarded-for'), 'redeem'), ...LIMITS.redeem })
    if (!allowed) return TOO_MANY(CORS)
    let sessionId = ''
    try {
      sessionId = String(((await request.json()) as { sessionId?: string }).sessionId ?? '')
    } catch {
      return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }
    const r = await ctx.runAction(internal.stripe.verifySession, { sessionId })
    if (!r.ok) {
      return new Response(JSON.stringify({ error: r.error }), { status: r.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }
    /* `held` rides along so the arena can say something true to someone who
     * paid for a product that cannot be delivered, instead of granting a dead
     * entitlement and rendering nothing. See PRODUCTS.held in stripe.ts. */
    return new Response(JSON.stringify({ ok: true, product: r.product, held: 'held' in r ? r.held : false }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }),
})

export default http
