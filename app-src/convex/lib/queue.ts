/* Retry policy for physical fulfilment. Pure and deterministic.
 *
 * The queue itself is the Convex scheduler (durable, persisted): dispatch
 * schedules its own next attempt with the delay computed here. No extra
 * infrastructure. */

export const MAX_ATTEMPTS = 8
export const BASE_DELAY_MS = 30_000
export const MAX_DELAY_MS = 6 * 60 * 60 * 1000

/** Delay before the NEXT try, given how many attempts have already failed.
 * 30s, 1m, 2m, 4m, ... capped at 6h.
 * ponytail: no jitter; add ±20% if a provider's rate limit ever synchronises retries. */
export function backoffMs(attemptsSoFar: number): number {
  const n = Math.max(0, Math.floor(attemptsSoFar))
  return Math.min(BASE_DELAY_MS * 2 ** n, MAX_DELAY_MS)
}

export type Classification = 'ok' | 'retry' | 'dead'

/** 2xx ok; 408/429/5xx and transport errors retry; any other 4xx is our bug or
 * bad data and retrying will not fix it. */
export function classify(r: { status: number } | { error: string }): Classification {
  if ('error' in r) return 'retry'
  const s = r.status
  if (s >= 200 && s < 300) return 'ok'
  if (s === 408 || s === 429 || s >= 500) return 'retry'
  return 'dead'
}

export type OrderStatus = 'queued' | 'submitted' | 'failed' | 'dead'
export type OrderState = {
  status: OrderStatus
  attempts: number
  nextAttemptAt: number | null
  providerOrderId: string | null
  lastError: string | null
}

export type Outcome =
  | { kind: 'ok'; providerOrderId: string }
  | { kind: 'retry'; error: string }
  | { kind: 'dead'; error: string }
  | { kind: 'unconfigured'; error: string }

/** Returns a NEW state; never mutates the input. */
export function nextState(order: OrderState, outcome: Outcome, now: number): OrderState {
  switch (outcome.kind) {
    case 'ok':
      return { ...order, status: 'submitted', providerOrderId: outcome.providerOrderId, nextAttemptAt: null, lastError: null }
    case 'dead':
      return { ...order, status: 'dead', nextAttemptAt: null, lastError: outcome.error }
    case 'unconfigured':
      // Not an attempt: nothing was tried. Stays where it is for an operator.
      return { ...order, nextAttemptAt: null, lastError: outcome.error }
    case 'retry': {
      const attempts = order.attempts + 1
      if (attempts >= MAX_ATTEMPTS) {
        return { ...order, status: 'dead', attempts, nextAttemptAt: null, lastError: `gave up after ${attempts} attempts: ${outcome.error}` }
      }
      return { ...order, status: 'failed', attempts, nextAttemptAt: now + backoffMs(attempts - 1), lastError: outcome.error }
    }
  }
}
