/* What a verified Stripe event means for us. Pure: no Stripe SDK, no DB.
 *
 * The purchase is ALWAYS recorded when a session completes, held product or
 * not: the money is real either way, and losing the trail would make a refund
 * harder. What must never happen is queueing a physical order for something
 * that cannot be delivered, or granting anything on a product we do not
 * know. */
import type { Product } from './products.ts'

export type StripeSessionLike = {
  id: string
  amount_total?: number | null
  client_reference_id?: string | null
  metadata?: Record<string, string> | null
}

export type StripeEventLike = { id: string; type: string; data: { object: unknown } }

export type Purchase = { userId: string; product: string; stripeSessionId: string; amount: number }
export type OrderSeed = { product: string; stripeSessionId: string; state: string; lang: 'en' | 'es' }

export type Plan =
  | { kind: 'ignored'; reason: string }
  | { kind: 'fulfill'; purchase: Purchase; order: OrderSeed | null; held: boolean }

const STATE = /^[A-Z]{2}$/

export function planFromEvent(event: StripeEventLike, products: Record<string, Product>): Plan {
  if (event.type !== 'checkout.session.completed') return { kind: 'ignored', reason: `event type ${event.type}` }
  const s = (event.data.object ?? {}) as StripeSessionLike
  if (typeof s.id !== 'string' || !s.id) return { kind: 'ignored', reason: 'no session id' }
  const meta = s.metadata ?? {}
  const product = typeof meta.product === 'string' && meta.product ? meta.product : 'unknown'
  const p = products[product]
  const held = !!p?.held
  const purchase: Purchase = {
    userId: (typeof meta.userId === 'string' && meta.userId) || s.client_reference_id || 'unknown',
    product,
    stripeSessionId: s.id,
    amount: typeof s.amount_total === 'number' ? s.amount_total : 0,
  }
  const order: OrderSeed | null =
    p?.physical && !held
      ? {
          product,
          stripeSessionId: s.id,
          state: typeof meta.state === 'string' && STATE.test(meta.state) ? meta.state : 'US',
          lang: meta.lang === 'es' ? 'es' : 'en',
        }
      : null
  return { kind: 'fulfill', purchase, order, held }
}
