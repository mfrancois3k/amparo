/* Print-on-demand adapters as pure request builders and response parsers.
 * No fetch, no env, no logging: the caller supplies keys and transports.
 *
 * Lob:    POST https://api.lob.com/v1/postcards  (4x6, front/back as inline
 *         HTML, Idempotency-Key header honoured for 24h).
 * Gelato: POST https://order.gelatoapis.com/v4/orders (needs a hosted PDF
 *         URL and a product UID from the Gelato catalogue).
 *
 * Address data passes through these functions and out to the provider. It
 * is never persisted here and never part of an error string. */
import type { Outcome } from './queue.ts'
import { classify } from './queue.ts'

export type ShipTo = {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country?: string
}

export type ProviderRequest = { url: string; method: 'POST'; headers: Record<string, string>; body: unknown }
export type Provider = 'lob' | 'gelato'

export function lobPostcard(input: {
  apiKey: string
  to: ShipTo
  front: string
  back: string
  description: string
  idempotencyKey: string
}): ProviderRequest {
  const { to } = input
  return {
    url: 'https://api.lob.com/v1/postcards',
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(input.apiKey + ':'),
      'Idempotency-Key': input.idempotencyKey,
      'Content-Type': 'application/json',
    },
    body: {
      description: input.description,
      size: '4x6',
      to: {
        name: to.name,
        address_line1: to.line1,
        ...(to.line2 ? { address_line2: to.line2 } : {}),
        address_city: to.city,
        address_state: to.state,
        address_zip: to.zip,
        address_country: to.country ?? 'US',
      },
      front: input.front,
      back: input.back,
    },
  }
}

export function gelatoOrder(input: {
  apiKey: string
  orderReferenceId: string
  customerReferenceId: string
  productUid: string
  fileUrl: string
  to: ShipTo
  quantity?: number
}): ProviderRequest {
  const { to } = input
  const [firstName, ...rest] = to.name.trim().split(/\s+/)
  return {
    url: 'https://order.gelatoapis.com/v4/orders',
    method: 'POST',
    headers: { 'X-API-KEY': input.apiKey, 'Content-Type': 'application/json' },
    body: {
      orderType: 'order',
      orderReferenceId: input.orderReferenceId,
      customerReferenceId: input.customerReferenceId,
      currency: 'USD',
      items: [
        {
          itemReferenceId: `${input.orderReferenceId}-1`,
          productUid: input.productUid,
          files: [{ type: 'default', url: input.fileUrl }],
          quantity: input.quantity ?? 1,
        },
      ],
      shippingAddress: {
        firstName: firstName ?? '',
        lastName: rest.join(' ') || firstName || '',
        addressLine1: to.line1,
        ...(to.line2 ? { addressLine2: to.line2 } : {}),
        city: to.city,
        state: to.state,
        postCode: to.zip,
        country: to.country ?? 'US',
      },
    },
  }
}

const MESSAGE_MAX = 120

function providerMessage(json: unknown): string {
  if (!json || typeof json !== 'object') return ''
  const j = json as Record<string, unknown>
  const err = j.error
  const msg =
    (err && typeof err === 'object' && typeof (err as Record<string, unknown>).message === 'string' && (err as Record<string, unknown>).message) ||
    (typeof j.message === 'string' && j.message) ||
    ''
  return String(msg).slice(0, MESSAGE_MAX)
}

/** Maps an HTTP response to an outcome. Error strings carry only the
 * provider's own short message, never request data. */
export function parseProviderResponse(provider: Provider, status: number, json: unknown): Outcome {
  const c = classify({ status })
  if (c === 'ok') {
    const id = json && typeof json === 'object' && typeof (json as Record<string, unknown>).id === 'string' ? ((json as Record<string, unknown>).id as string) : ''
    if (!id) return { kind: 'dead', error: `${provider} ${status}: no order id in response` }
    return { kind: 'ok', providerOrderId: id }
  }
  const msg = providerMessage(json)
  const error = `${provider} HTTP ${status}${msg ? ': ' + msg : ''}`
  return c === 'retry' ? { kind: 'retry', error } : { kind: 'dead', error }
}
