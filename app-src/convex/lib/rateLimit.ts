/* Fixed-window rate limit, pure. The public Convex endpoints (/checkout
 * creates a Stripe Checkout Session, /redeem calls Stripe) had no limit at
 * all, so one script could burn Stripe quota and Convex action time for free
 * (blind-spot audit, 2026-09-03). A per-IP window is enough here: the
 * endpoints write nothing on a denied request and carry no customer data.
 *
 * ponytail: fixed window, not sliding; good enough for abuse control on a
 * low-traffic site. Move to a token bucket if legitimate bursts get denied. */

export type Window = { windowStart: number; count: number }

export function decide(prev: Window | null, now: number, limit: number, windowMs: number): { allowed: boolean; next: Window } {
  if (!prev || now - prev.windowStart >= windowMs) return { allowed: true, next: { windowStart: now, count: 1 } }
  if (prev.count >= limit) return { allowed: false, next: prev }
  return { allowed: true, next: { windowStart: prev.windowStart, count: prev.count + 1 } }
}

/** First hop of x-forwarded-for, or 'unknown'. Never logged, never stored
 * beyond the limiter row it keys. */
export function clientKey(forwardedFor: string | null, scope: string): string {
  const ip = (forwardedFor ?? '').split(',')[0].trim().slice(0, 64) || 'unknown'
  return `${scope}:${ip}`
}

export const LIMITS = Object.freeze({
  checkout: { limit: 10, windowMs: 60 * 60 * 1000 },
  redeem: { limit: 60, windowMs: 60 * 60 * 1000 },
})
