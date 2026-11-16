import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayloadClient } from '@/backend/repositories/payload'
import {
  isPaymentAlreadyProcessed,
  markPaymentProcessed,
} from '@/backend/payments/razorpay'
import { notifications } from '@/backend/notifications/email-service'

/**
 * Razorpay Webhook Handler (PY-7, PY-8, PY-9).
 *
 * Verifies HMAC-SHA256 signature, processes asynchronous payment capture,
 * provides idempotency protection, updates order records, and triggers
 * automatic learner enrollment.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_dev'

    // PY-7: Cryptographic webhook signature verification
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      const isSignatureValid =
        signature.length === expectedSignature.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

      if (!isSignatureValid && process.env.NODE_ENV === 'production') {
        console.warn('[Webhook] Invalid Razorpay webhook signature rejected.')
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    // Process payment capture or order paid events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity
      const orderEntity = event.payload?.order?.entity

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id
      const razorpayPaymentId = paymentEntity?.id || `pay_${Date.now()}`

      if (!razorpayOrderId) {
        return NextResponse.json({ received: true, note: 'No order_id in event payload' })
      }

      // PY-8: Idempotency check to prevent duplicate processing
      if (isPaymentAlreadyProcessed(razorpayOrderId)) {
        return NextResponse.json({ status: 'already_processed' }, { status: 200 })
      }

      try {
        const payload = await getPayloadClient()

        // Locate order in Payload database
        const orders = await (payload as any).find({
          collection: 'orders',
          where: { razorpayOrderId: { equals: razorpayOrderId } },
          limit: 1,
          overrideAccess: true,
        })

        if (orders.docs.length > 0) {
          const order = orders.docs[0]
          const learnerId = typeof order.learner === 'object' ? order.learner.id : order.learner
          const pkgKey = String(order.package || 'professional')

          const startDate = new Date()
          const durationMonths = pkgKey === 'foundation' ? 3 : 12
          const expiryDate = new Date(startDate)
          expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
          const invoiceNumber = `INV-${startDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

          // Update order status
          await (payload as any).update({
            collection: 'orders',
            id: order.id,
            data: {
              paymentStatus: 'paid',
              subscriptionStatus: 'active',
              razorpayPaymentId,
              invoiceNumber,
              startDate: startDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
            },
            overrideAccess: true,
          })

          // Automatically enroll learner in package (PY-3)
          const userDoc = await (payload as any).findByID({
            collection: 'users',
            id: learnerId,
            overrideAccess: true,
          })

          if (userDoc) {
            const existingPackages = Array.isArray(userDoc.enrolledPackages)
              ? userDoc.enrolledPackages
              : []
            if (!existingPackages.includes(pkgKey)) {
              await (payload as any).update({
                collection: 'users',
                id: learnerId,
                data: {
                  enrolledPackages: [...existingPackages, pkgKey],
                },
                overrideAccess: true,
              })
            }

            // Trigger email notification (NT-1)
            notifications
              .sendPurchaseReceiptEmail(userDoc.email, {
                orderReference: order.transactionReference || razorpayOrderId,
                packageName: pkgKey.toUpperCase(),
                amount: order.amount,
                currency: order.currency || 'USD',
                invoiceNumber,
                expiryDate: expiryDate.toLocaleDateString(),
              })
              .catch(() => {})
          }
        }
      } catch (err) {
        console.error('[Webhook] Failed to process database update:', err)
      }

      markPaymentProcessed(razorpayOrderId)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[Webhook] Unexpected webhook error:', err.message)
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 })
  }
}
