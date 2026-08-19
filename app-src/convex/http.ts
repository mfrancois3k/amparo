import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

/* Stripe webhook — fulfillment is recorded ONLY from Stripe's signed event,
 * never from the client's success redirect. Signature verification needs the
 * Node runtime, so it lives in stripe.ts (internal action); this router runs
 * in the default runtime ("use node" is not allowed here).
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
    if (result.fulfill) await ctx.runMutation(internal.purchases.record, result.fulfill)
    return new Response('ok', { status: 200 })
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
    let product = ''
    try {
      product = String(((await request.json()) as { product?: string }).product ?? '')
    } catch {
      return new Response('bad request', { status: 400, headers: CORS })
    }
    try {
      const { url } = await ctx.runAction(internal.stripe.guestCheckout, { product })
      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'error'
      const status = msg.includes('not configured') ? 503 : msg.includes('Unknown product') ? 400 : 500
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  }),
})

export default http
