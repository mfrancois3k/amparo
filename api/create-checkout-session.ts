/* Amparo's first server-side code, ever. Everything else in this product is
 * a static file with no backend by design — see notebook/HANDOFF.md and the
 * (drafted, unsent) UPL engagement memo, which tells counsel "no payment
 * integration anywhere in the codebase." That sentence is no longer literally
 * true the moment this file exists, even inert. Flag it, don't bury it — see
 * notebook/amparo-upl-engagement-memo.md's Appendix, which needs a line added
 * before it is ever sent.
 *
 * Deliberately generic: takes a Stripe Price ID from the caller rather than
 * hardcoding one, because no pricing/product decision has been made. This is
 * plumbing for a checkout flow, not a checkout flow — nothing calls this
 * endpoint yet, and it is not linked from any UI.
 *
 * STRIPE_SECRET_KEY must never be read anywhere client-side. It only exists
 * here, in a Vercel serverless function, sourced from process.env — set
 * locally via the repo-root .env.local (gitignored) and, for the deployed
 * site, via the Vercel project's own Environment Variables (not done by this
 * commit; that is a live-infrastructure change requiring separate sign-off).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) throw new Error('STRIPE_SECRET_KEY missing — set it in .env.local for local dev, or the Vercel project env vars for deployment')
const stripe = new Stripe(secretKey)

interface CheckoutRequestBody {
  priceId: string
  successUrl: string
  cancelUrl: string
}

function isValidCheckoutBody(body: unknown): body is CheckoutRequestBody {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return typeof b.priceId === 'string' && b.priceId.startsWith('price_')
    && typeof b.successUrl === 'string' && typeof b.cancelUrl === 'string'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!isValidCheckoutBody(req.body)) {
    res.status(400).json({ error: 'Expected { priceId, successUrl, cancelUrl }' })
    return
  }
  const { priceId, successUrl, cancelUrl } = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    res.status(200).json({ url: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error creating checkout session'
    res.status(500).json({ error: message })
  }
}
