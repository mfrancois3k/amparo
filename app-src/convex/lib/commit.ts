/* The idempotent commit of a webhook plan, written against a tiny DB
 * interface so the guarantee is testable without Convex.
 *
 * Runs inside ONE Convex mutation (orders.commitEvent), which is
 * transactional: either the event row, the purchase row and the order row
 * all land, or none do. A retried delivery of the same Stripe event sees the
 * event row and does nothing. A different event for the same session (Stripe
 * can emit more than one) still cannot double-record: purchases and orders
 * are also unique per session. */
import type { Purchase, OrderSeed } from './plan.ts'

export type CommitDb = {
  findEvent(eventId: string): Promise<unknown | null>
  insertEvent(row: { eventId: string; type: string; receivedAt: number }): Promise<void>
  findPurchaseBySession(sessionId: string): Promise<unknown | null>
  insertPurchase(row: Purchase & { createdAt: number }): Promise<void>
  findOrderBySession(sessionId: string): Promise<{ id: string } | null>
  insertOrder(row: OrderSeed & {
    stripeEventId: string
    provider: 'none'
    status: 'queued'
    attempts: 0
    nextAttemptAt: null
    providerOrderId: null
    lastError: null
    createdAt: number
    updatedAt: number
  }): Promise<string>
}

export type CommitResult =
  | { status: 'duplicate' }
  | { status: 'committed'; purchaseRecorded: boolean; orderId: string | null }

export async function commitPlan(
  db: CommitDb,
  input: { eventId: string; type: string; purchase: Purchase | null; order: OrderSeed | null },
  now: number,
): Promise<CommitResult> {
  if (await db.findEvent(input.eventId)) return { status: 'duplicate' }
  await db.insertEvent({ eventId: input.eventId, type: input.type, receivedAt: now })

  let purchaseRecorded = false
  if (input.purchase && !(await db.findPurchaseBySession(input.purchase.stripeSessionId))) {
    await db.insertPurchase({ ...input.purchase, createdAt: now })
    purchaseRecorded = true
  }

  let orderId: string | null = null
  if (input.order) {
    const existing = await db.findOrderBySession(input.order.stripeSessionId)
    orderId = existing
      ? null
      : await db.insertOrder({
          ...input.order,
          stripeEventId: input.eventId,
          provider: 'none',
          status: 'queued',
          attempts: 0,
          nextAttemptAt: null,
          providerOrderId: null,
          lastError: null,
          createdAt: now,
          updatedAt: now,
        })
  }
  return { status: 'committed', purchaseRecorded, orderId }
}
