import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from './products.ts'
import { planFromEvent } from './plan.ts'
import { MAX_ATTEMPTS, backoffMs, classify, nextState, type OrderState } from './queue.ts'
import { gelatoOrder, lobPostcard, parseProviderResponse } from './providers.ts'
import { commitPlan, type CommitDb } from './commit.ts'
import { runDispatch, type DispatchDeps, type OrderRecord } from './dispatch.ts'

const session = (over: Record<string, unknown> = {}) => ({
  id: 'cs_test_123',
  amount_total: 1999,
  client_reference_id: null,
  metadata: { product: 'armor', userId: 'user_1', state: 'TX', lang: 'es' },
  ...over,
})
const completed = (obj: unknown, id = 'evt_1') => ({ id, type: 'checkout.session.completed', data: { object: obj } })

/* ---------- products ---------- */
test('price table: ladder present, held product still held, physical flag only on armor', () => {
  assert.equal(PRODUCTS.master.usd, 999)
  assert.equal(PRODUCTS.armor.usd, 1999)
  assert.equal(PRODUCTS.armor.physical, true)
  assert.equal(PRODUCTS.deep.held, true)
  assert.equal(PRODUCTS.script.usd, 399)
  assert.ok(Object.values(PRODUCTS).filter((p) => p.physical).length === 1)
})

/* ---------- plan ---------- */
test('plan: non-checkout events are ignored', () => {
  const p = planFromEvent({ id: 'evt', type: 'payment_intent.succeeded', data: { object: {} } }, PRODUCTS)
  assert.equal(p.kind, 'ignored')
})

test('plan: digital product records a purchase and no order', () => {
  const p = planFromEvent(completed(session({ metadata: { product: 'master', userId: 'u' }, amount_total: 999 })), PRODUCTS)
  assert.equal(p.kind, 'fulfill')
  if (p.kind !== 'fulfill') return
  assert.deepEqual(p.purchase, { userId: 'u', product: 'master', stripeSessionId: 'cs_test_123', amount: 999 })
  assert.equal(p.order, null)
  assert.equal(p.held, false)
})

test('plan: physical product queues an order carrying validated state and lang', () => {
  const p = planFromEvent(completed(session()), PRODUCTS)
  if (p.kind !== 'fulfill') assert.fail('expected fulfill')
  assert.deepEqual(p.order, { product: 'armor', stripeSessionId: 'cs_test_123', state: 'TX', lang: 'es' })
})

test('plan: bad state or lang metadata falls back to US / en, never throws', () => {
  const p = planFromEvent(completed(session({ metadata: { product: 'armor', state: 'texas', lang: 'fr' } })), PRODUCTS)
  if (p.kind !== 'fulfill') assert.fail('expected fulfill')
  assert.equal(p.order?.state, 'US')
  assert.equal(p.order?.lang, 'en')
  assert.equal(p.purchase.userId, 'unknown')
})

test('plan: held product is recorded (money is real) but never queued', () => {
  const p = planFromEvent(completed(session({ metadata: { product: 'deep' } })), PRODUCTS)
  if (p.kind !== 'fulfill') assert.fail('expected fulfill')
  assert.equal(p.held, true)
  assert.equal(p.order, null)
  assert.equal(p.purchase.product, 'deep')
})

test('plan: unknown product is recorded as unknown with no order; missing session id is ignored', () => {
  const p = planFromEvent(completed(session({ metadata: { product: 'gold-plated' } })), PRODUCTS)
  if (p.kind !== 'fulfill') assert.fail('expected fulfill')
  assert.equal(p.purchase.product, 'gold-plated')
  assert.equal(p.order, null)
  assert.equal(planFromEvent(completed({}), PRODUCTS).kind, 'ignored')
})

/* ---------- queue ---------- */
test('backoff doubles from 30s and caps at 6h', () => {
  assert.equal(backoffMs(0), 30_000)
  assert.equal(backoffMs(1), 60_000)
  assert.equal(backoffMs(4), 480_000)
  assert.equal(backoffMs(20), 6 * 60 * 60 * 1000)
  assert.equal(backoffMs(-3), 30_000)
})

test('classify: 2xx ok, 408/429/5xx and transport errors retry, other 4xx dead', () => {
  for (const s of [200, 201, 204]) assert.equal(classify({ status: s }), 'ok', String(s))
  for (const s of [408, 429, 500, 502, 503, 504]) assert.equal(classify({ status: s }), 'retry', String(s))
  for (const s of [400, 401, 403, 404, 422]) assert.equal(classify({ status: s }), 'dead', String(s))
  assert.equal(classify({ error: 'ECONNRESET' }), 'retry')
})

test('nextState: transitions are immutable and give up after MAX_ATTEMPTS', () => {
  const base: OrderState = { status: 'queued', attempts: 0, nextAttemptAt: null, providerOrderId: null, lastError: null }
  const frozen = Object.freeze({ ...base })
  const ok = nextState(frozen, { kind: 'ok', providerOrderId: 'psc_1' }, 1000)
  assert.equal(ok.status, 'submitted')
  assert.equal(ok.providerOrderId, 'psc_1')
  assert.equal(frozen.status, 'queued')
  const r1 = nextState(base, { kind: 'retry', error: 'lob HTTP 503' }, 1000)
  assert.deepEqual(r1, { status: 'failed', attempts: 1, nextAttemptAt: 1000 + 30_000, providerOrderId: null, lastError: 'lob HTTP 503' })
  const r2 = nextState(r1, { kind: 'retry', error: 'lob HTTP 503' }, 5000)
  assert.equal(r2.nextAttemptAt, 5000 + 60_000)
  let o = base
  for (let i = 0; i < MAX_ATTEMPTS; i++) o = nextState(o, { kind: 'retry', error: 'x' }, 0)
  assert.equal(o.status, 'dead')
  assert.equal(o.attempts, MAX_ATTEMPTS)
  assert.match(o.lastError ?? '', /gave up/)
  const dead = nextState(base, { kind: 'dead', error: 'lob HTTP 422: to.address_zip invalid' }, 0)
  assert.equal(dead.status, 'dead')
  const un = nextState(base, { kind: 'unconfigured', error: 'fulfilment not configured' }, 0)
  assert.equal(un.status, 'queued')
  assert.equal(un.attempts, 0)
  assert.match(un.lastError ?? '', /not configured/)
})

/* ---------- providers ---------- */
const to = { name: 'Ana Pérez', line1: '1 Main St', line2: 'Apt 4', city: 'Austin', state: 'TX', zip: '78701' }

test('lob postcard request: url, basic auth, idempotency key, 4x6, address mapped, no env access', () => {
  const r = lobPostcard({ apiKey: 'test_key', to, front: '<html>F</html>', back: '<html>B</html>', description: 'Amparo Armor TX en', idempotencyKey: 'order_1' })
  assert.equal(r.url, 'https://api.lob.com/v1/postcards')
  assert.equal(r.method, 'POST')
  assert.equal(r.headers.Authorization, 'Basic ' + Buffer.from('test_key:').toString('base64'))
  assert.equal(r.headers['Idempotency-Key'], 'order_1')
  const b = r.body as Record<string, unknown>
  assert.equal(b.size, '4x6')
  assert.deepEqual(b.to, { name: 'Ana Pérez', address_line1: '1 Main St', address_line2: 'Apt 4', address_city: 'Austin', address_state: 'TX', address_zip: '78701', address_country: 'US' })
  assert.equal(b.front, '<html>F</html>')
  assert.equal(b.back, '<html>B</html>')
})

test('gelato order request: key header, reference ids, product uid, file url, address split into first/last', () => {
  const r = gelatoOrder({ apiKey: 'gk', orderReferenceId: 'order_1', customerReferenceId: 'cs_1', productUid: 'cards_uid', fileUrl: 'https://x/card.pdf', to })
  assert.equal(r.url, 'https://order.gelatoapis.com/v4/orders')
  assert.equal(r.headers['X-API-KEY'], 'gk')
  const b = r.body as { items: { productUid: string; files: { url: string }[]; quantity: number }[]; shippingAddress: Record<string, string>; orderReferenceId: string }
  assert.equal(b.orderReferenceId, 'order_1')
  assert.equal(b.items[0].productUid, 'cards_uid')
  assert.equal(b.items[0].files[0].url, 'https://x/card.pdf')
  assert.equal(b.items[0].quantity, 1)
  assert.equal(b.shippingAddress.firstName, 'Ana')
  assert.equal(b.shippingAddress.lastName, 'Pérez')
  assert.equal(b.shippingAddress.postCode, '78701')
  assert.equal(b.shippingAddress.country, 'US')
})

test('parseProviderResponse: ok needs an id; retry vs dead follow classify; message truncated; address never echoed', () => {
  assert.deepEqual(parseProviderResponse('lob', 200, { id: 'psc_9' }), { kind: 'ok', providerOrderId: 'psc_9' })
  assert.equal(parseProviderResponse('lob', 200, {}).kind, 'dead')
  const r = parseProviderResponse('lob', 503, { error: { message: 'x'.repeat(500) } })
  assert.equal(r.kind, 'retry')
  assert.ok(r.kind === 'retry' && r.error.length < 160)
  const d = parseProviderResponse('gelato', 422, { message: 'shippingAddress.postCode is invalid' })
  assert.equal(d.kind, 'dead')
  assert.ok(d.kind === 'dead' && !d.error.includes('78701'))
})

/* ---------- commit (idempotency) ---------- */
function fakeDb() {
  const events = new Map<string, unknown>()
  const purchases = new Map<string, unknown>()
  const orders = new Map<string, { id: string }>()
  let n = 0
  const db: CommitDb = {
    findEvent: async (id) => events.get(id) ?? null,
    insertEvent: async (row) => { events.set(row.eventId, row) },
    findPurchaseBySession: async (s) => purchases.get(s) ?? null,
    insertPurchase: async (row) => { purchases.set(row.stripeSessionId, row) },
    findOrderBySession: async (s) => orders.get(s) ?? null,
    insertOrder: async (row) => { const id = `order_${++n}`; orders.set(row.stripeSessionId, { id }); return id },
  }
  return { db, events, purchases, orders }
}

test('commitPlan: same event twice inserts once; a second event for the same session adds no rows', async () => {
  const { db, events, purchases, orders } = fakeDb()
  const plan = planFromEvent(completed(session()), PRODUCTS)
  if (plan.kind !== 'fulfill') assert.fail('expected fulfill')
  const first = await commitPlan(db, { eventId: 'evt_1', type: 'checkout.session.completed', purchase: plan.purchase, order: plan.order }, 100)
  assert.deepEqual(first, { status: 'committed', purchaseRecorded: true, orderId: 'order_1' })
  const again = await commitPlan(db, { eventId: 'evt_1', type: 'checkout.session.completed', purchase: plan.purchase, order: plan.order }, 200)
  assert.deepEqual(again, { status: 'duplicate' })
  const other = await commitPlan(db, { eventId: 'evt_2', type: 'checkout.session.completed', purchase: plan.purchase, order: plan.order }, 300)
  assert.deepEqual(other, { status: 'committed', purchaseRecorded: false, orderId: null })
  assert.equal(events.size, 2)
  assert.equal(purchases.size, 1)
  assert.equal(orders.size, 1)
})

/* ---------- dispatch ---------- */
const order: OrderRecord = {
  id: 'order_1', stripeSessionId: 'cs_1', product: 'armor', state: 'TX', lang: 'en',
  status: 'queued', attempts: 0, nextAttemptAt: null, providerOrderId: null, lastError: null,
}
function deps(over: Partial<DispatchDeps> = {}) {
  const sent: unknown[] = []
  const inner = over.send ?? (async () => ({ status: 200, json: { id: 'psc_1' } }))
  const d: DispatchDeps = {
    provider: 'lob',
    config: { lobKey: 'k' },
    getShipping: async () => to,
    renderCard: ({ code, lang, side }) => `<card ${code} ${lang} ${side}>`,
    ...over,
    send: async (req) => { sent.push(req); return inner(req) },
  }
  return { d, sent }
}

test('dispatch: happy path sends one lob request with both rendered sides and submits the order', async () => {
  const { d, sent } = deps()
  const r = await runDispatch(order, d, 1000)
  assert.equal(sent.length, 1)
  const body = (sent[0] as { body: { front: string; back: string } }).body
  assert.equal(body.front, '<card TX en front>')
  assert.equal(body.back, '<card TX en back>')
  assert.equal(r.order.status, 'submitted')
  assert.equal(r.order.providerOrderId, 'psc_1')
  assert.equal(r.scheduleInMs, null)
})

test('dispatch: provider 5xx schedules a retry with the backoff; transport error too', async () => {
  const { d } = deps({ send: async () => ({ status: 503, json: { error: { message: 'busy' } } }) })
  const r = await runDispatch(order, d, 1000)
  assert.equal(r.order.status, 'failed')
  assert.equal(r.order.attempts, 1)
  assert.equal(r.scheduleInMs, 30_000)
  const { d: d2 } = deps({ send: async () => { throw new Error('ECONNRESET 1 Main St') } })
  const r2 = await runDispatch(order, d2, 1000)
  assert.equal(r2.order.status, 'failed')
  assert.ok(!(r2.order.lastError ?? '').includes('Main St'), 'transport errors must not leak request data')
})

test('dispatch: provider none or missing keys never sends and leaves the order queued for an operator', async () => {
  const { d, sent } = deps({ provider: 'none' })
  const r = await runDispatch(order, d, 0)
  assert.equal(sent.length, 0)
  assert.equal(r.order.status, 'queued')
  assert.match(r.order.lastError ?? '', /not configured/)
  assert.equal(r.scheduleInMs, null)
  const { d: g, sent: gs } = deps({ provider: 'gelato', config: { gelatoKey: 'g' } })
  const rg = await runDispatch(order, g, 0)
  assert.equal(gs.length, 0)
  assert.match(rg.order.lastError ?? '', /GELATO_PRODUCT_UID/)
})

test('dispatch: no shipping address is dead, not retried; submitted orders are untouched', async () => {
  const { d, sent } = deps({ getShipping: async () => null })
  const r = await runDispatch(order, d, 0)
  assert.equal(sent.length, 0)
  assert.equal(r.order.status, 'dead')
  const done = { ...order, status: 'submitted' as const, providerOrderId: 'psc_1' }
  const { d: d2, sent: s2 } = deps()
  const r2 = await runDispatch(done, d2, 0)
  assert.equal(s2.length, 0)
  assert.equal(r2.order.status, 'submitted')
})

test('dispatch: a raw Convex document (system + audit fields) comes back as exactly the outcome fields', async () => {
  const doc = { ...order, _id: 'k123', _creationTime: 1, stripeEventId: 'evt_1', createdAt: 1, updatedAt: 1, provider: 'none' } as unknown as OrderRecord
  for (const send of [async () => ({ status: 200, json: { id: 'psc_1' } }), async () => ({ status: 503, json: null })]) {
    const { d } = deps({ send })
    const r = await runDispatch(doc, d, 1000)
    assert.deepEqual(Object.keys(r.order).sort(), ['attempts', 'lastError', 'nextAttemptAt', 'providerOrderId', 'status'])
  }
  const { d: none } = deps({ provider: 'none' })
  const r = await runDispatch(doc, none, 1000)
  assert.deepEqual(Object.keys(r.order).sort(), ['attempts', 'lastError', 'nextAttemptAt', 'providerOrderId', 'status'])
})

test('dispatch: gelato path uses the hosted file url and the order id as reference', async () => {
  const { d, sent } = deps({ provider: 'gelato', config: { gelatoKey: 'g', gelatoProductUid: 'uid', cardFileUrl: 'https://x/card.pdf' }, send: async () => ({ status: 201, json: { id: 'gel_1' } }) })
  const r = await runDispatch(order, d, 0)
  assert.equal(r.order.status, 'submitted')
  const b = (sent[0] as { body: { orderReferenceId: string; items: { files: { url: string }[] }[] } }).body
  assert.equal(b.orderReferenceId, 'order_1')
  assert.equal(b.items[0].files[0].url, 'https://x/card.pdf')
})
