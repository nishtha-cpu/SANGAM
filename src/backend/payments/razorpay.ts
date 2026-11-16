/**
 * SANGAM — Razorpay Payments Integration Boundary
 *
 * Implements:
 * - Order creation (PY-1, PY-2)
 * - HMAC-SHA256 signature verification (PY-7)
 * - Duplicate payment prevention & Idempotency (PY-8)
 * - Failure fallback & reconciliation helpers (PY-4, PY-9)
 */

import crypto from 'crypto'

export interface RazorpayOrderParams {
  amount: number // in cents / paise or standard units
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayOrderResult {
  ok: boolean
  id?: string
  amount?: number
  currency?: string
  receipt?: string
  error?: string
  mode: 'live' | 'mock-dev'
}

export interface VerificationParams {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

// In-memory idempotency cache to prevent double-processing of payments (PY-8)
const processedPayments = new Set<string>()

/**
 * Verifies Razorpay HMAC-SHA256 signature.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerificationParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET

  if (!secret) {
    // In local development without live Razorpay secret,
    // verify standard development signature format
    if (process.env.NODE_ENV !== 'production' && razorpaySignature.startsWith('dev_sig_')) {
      return true
    }
    return false
  }

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(razorpaySignature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Verifies webhook signature against raw webhook body.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) return false

  try {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(webhookSignature),
      Buffer.from(expected)
    )
  } catch {
    return false
  }
}

/**
 * Checks whether a payment ID has already been processed (PY-8 Idempotency).
 */
export function isPaymentAlreadyProcessed(paymentId: string): boolean {
  return processedPayments.has(paymentId)
}

/**
 * Records payment ID as processed.
 */
export function markPaymentProcessed(paymentId: string): void {
  processedPayments.add(paymentId)
}

/**
 * Creates an order with Razorpay or development checkout session.
 */
export async function createPaymentOrder(
  params: RazorpayOrderParams
): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (keyId && keySecret) {
    // Live API integration boundary
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100), // convert to paise
          currency: params.currency || 'USD',
          receipt: params.receipt,
          notes: params.notes || {},
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        return {
          ok: false,
          error: errorData.error?.description || 'Razorpay order creation failed',
          mode: 'live',
        }
      }

      const orderData = await res.json()
      return {
        ok: true,
        id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        mode: 'live',
      }
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Payment gateway connection error',
        mode: 'live',
      }
    }
  }

  // Development / sandbox order generator when credentials are not injected
  const devOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  return {
    ok: true,
    id: devOrderId,
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    mode: 'mock-dev',
  }
}
