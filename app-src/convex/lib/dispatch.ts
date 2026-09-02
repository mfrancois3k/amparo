/* One fulfilment attempt, pure orchestration. The Convex action
 * (fulfillment.ts) supplies the transports; this decides what to send and
 * what the order becomes afterwards. */
import { backoffMs, nextState, type OrderState, type Outcome } from './queue.ts'
import { gelatoOrder, lobPostcard, parseProviderResponse, type ProviderRequest, type ShipTo } from './providers.ts'

export type CardSide = 'front' | 'back'
export type DispatchDeps = {
  provider: 'lob' | 'gelato' | 'none'
  config: { lobKey?: string; gelatoKey?: string; gelatoProductUid?: string; cardFileUrl?: string }
  getShipping: (sessionId: string) => Promise<ShipTo | null>
  renderCard: (input: { code: string; lang: 'en' | 'es'; side: CardSide }) => string
  send: (req: ProviderRequest) => Promise<{ status: number; json: unknown }>
}

export type OrderRecord = OrderState & {
  id: string
  stripeSessionId: string
  product: string
  state: string
  lang: 'en' | 'es'
}

export type DispatchResult = { order: OrderState; scheduleInMs: number | null; provider: 'lob' | 'gelato' | 'none' }

/* Whitelist, never a rest-spread: the caller hands in a raw Convex document
 * (_id, _creationTime, stripeEventId, createdAt, updatedAt and whatever is
 * added later), and the outcome goes straight into a closed validator in
 * orders.applyOutcome. A stray field there throws AFTER the provider request
 * was sent, which leaves the order looking stuck and invites a re-send. */
const strip = (o: OrderRecord): OrderState => ({
  status: o.status,
  attempts: o.attempts,
  nextAttemptAt: o.nextAttemptAt,
  providerOrderId: o.providerOrderId,
  lastError: o.lastError,
})

export async function runDispatch(order: OrderRecord, deps: DispatchDeps, now: number): Promise<DispatchResult> {
  const state = strip(order)
  if (order.status !== 'queued' && order.status !== 'failed') return { order: state, scheduleInMs: null, provider: deps.provider }

  const unconfigured = (why: string): DispatchResult => ({
    order: nextState(state, { kind: 'unconfigured', error: `fulfilment not configured: ${why}` }, now),
    scheduleInMs: null,
    provider: deps.provider,
  })
  if (deps.provider === 'none') return unconfigured('FULFILLMENT_PROVIDER unset')
  if (deps.provider === 'lob' && !deps.config.lobKey) return unconfigured('LOB_API_KEY unset')
  if (deps.provider === 'gelato' && (!deps.config.gelatoKey || !deps.config.gelatoProductUid || !deps.config.cardFileUrl)) {
    return unconfigured('GELATO_API_KEY, GELATO_PRODUCT_UID and ARMOR_CARD_FILE_URL are all required')
  }

  const to = await deps.getShipping(order.stripeSessionId)
  if (!to) {
    return { order: nextState(state, { kind: 'dead', error: 'no shipping address on session' }, now), scheduleInMs: null, provider: deps.provider }
  }

  const req: ProviderRequest =
    deps.provider === 'lob'
      ? lobPostcard({
          apiKey: deps.config.lobKey!,
          to,
          front: deps.renderCard({ code: order.state, lang: order.lang, side: 'front' }),
          back: deps.renderCard({ code: order.state, lang: order.lang, side: 'back' }),
          description: `Amparo Armor card ${order.state} ${order.lang}`,
          idempotencyKey: order.id,
        })
      : gelatoOrder({
          apiKey: deps.config.gelatoKey!,
          orderReferenceId: order.id,
          customerReferenceId: order.stripeSessionId,
          productUid: deps.config.gelatoProductUid!,
          fileUrl: deps.config.cardFileUrl!,
          to,
        })

  let outcome: Outcome
  try {
    const res = await deps.send(req)
    outcome = parseProviderResponse(deps.provider, res.status, res.json)
  } catch {
    outcome = { kind: 'retry', error: `${deps.provider}: transport error` }
  }

  const next = nextState(state, outcome, now)
  const scheduleInMs = next.status === 'failed' && next.nextAttemptAt !== null ? Math.max(0, next.nextAttemptAt - now) : null
  return { order: next, scheduleInMs, provider: deps.provider }
}

export { backoffMs }
