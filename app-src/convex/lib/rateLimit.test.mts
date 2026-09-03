import test from 'node:test'
import assert from 'node:assert/strict'
import { decide, clientKey, LIMITS } from './rateLimit.ts'

test('decide: first hit opens a window, hits count up, the limit denies, a new window resets', () => {
  const w = 60_000
  let r = decide(null, 1000, 3, w)
  assert.deepEqual(r, { allowed: true, next: { windowStart: 1000, count: 1 } })
  r = decide(r.next, 2000, 3, w); assert.equal(r.allowed, true); assert.equal(r.next.count, 2)
  r = decide(r.next, 3000, 3, w); assert.equal(r.allowed, true); assert.equal(r.next.count, 3)
  const denied = decide(r.next, 4000, 3, w)
  assert.equal(denied.allowed, false)
  assert.deepEqual(denied.next, r.next, 'a denied hit does not advance the window')
  const fresh = decide(r.next, 1000 + w, 3, w)
  assert.deepEqual(fresh, { allowed: true, next: { windowStart: 1000 + w, count: 1 } })
})

test('decide never mutates the previous window', () => {
  const prev = Object.freeze({ windowStart: 0, count: 1 })
  const r = decide(prev, 10, 5, 1000)
  assert.equal(prev.count, 1)
  assert.equal(r.next.count, 2)
})

test('clientKey: first forwarded hop, scoped, bounded, unknown when absent', () => {
  assert.equal(clientKey('203.0.113.9, 10.0.0.1', 'checkout'), 'checkout:203.0.113.9')
  assert.equal(clientKey(null, 'redeem'), 'redeem:unknown')
  assert.equal(clientKey('', 'redeem'), 'redeem:unknown')
  assert.ok(clientKey('x'.repeat(500), 'checkout').length <= 'checkout:'.length + 64)
  assert.equal(LIMITS.checkout.limit, 10)
  assert.equal(LIMITS.redeem.limit, 60)
})
