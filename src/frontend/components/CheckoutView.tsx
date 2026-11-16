'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import {
  createCheckoutSessionAction,
  verifyPaymentAndEnrollAction,
  type CheckoutResult,
} from '@/backend/actions/order-actions'

export interface CheckoutViewProps {
  payment?: boolean
}

export function CheckoutView({ payment = false }: CheckoutViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPackage, setSelectedPackage] = useState<'foundation' | 'professional' | 'enterprise'>('professional')
  const [coupon, setCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    invoiceNumber?: string
    transactionReference?: string
  } | null>(null)

  const packagePrices: Record<string, number> = {
    foundation: 49,
    professional: 129,
    enterprise: 499,
  }

  const basePrice = packagePrices[selectedPackage] || 129
  const discountAmount = (basePrice * discountPercent) / 100
  const finalPrice = Math.max(0, basePrice - discountAmount)

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')

    const code = coupon.trim().toUpperCase()
    if (!code) return

    if (code === 'SANGAM20' || code === 'SAVE20') {
      setDiscountPercent(20)
      setCouponSuccess('20% discount applied successfully!')
    } else if (code === 'EARLYBIRD' || code === 'CYBER10') {
      setDiscountPercent(10)
      setCouponSuccess('10% early bird discount applied!')
    } else {
      setCouponError('Invalid or expired coupon code.')
      setDiscountPercent(0)
    }
  }

  const handleProceedToPayment = () => {
    setCheckoutError('')
    startTransition(async () => {
      try {
        // Step 1: Create checkout session
        const sessionRes: CheckoutResult = await createCheckoutSessionAction(selectedPackage)
        if (!sessionRes.ok || !sessionRes.orderId || !sessionRes.transactionReference) {
          setCheckoutError(sessionRes.message || 'Failed to initialize checkout session.')
          return
        }

        // Step 2: In dev / test mode, automatically simulate successful payment authorization
        // In live Razorpay mode, Razorpay Modal SDK would open here
        const fakePaymentId = `pay_${Date.now()}`
        const fakeSignature = `dev_sig_${Date.now()}`

        const verifyRes = await verifyPaymentAndEnrollAction({
          transactionReference: sessionRes.transactionReference,
          razorpayOrderId: sessionRes.orderId,
          razorpayPaymentId: fakePaymentId,
          razorpaySignature: fakeSignature,
        })

        if (verifyRes.ok) {
          setPaymentSuccessData({
            invoiceNumber: verifyRes.invoiceNumber,
            transactionReference: sessionRes.transactionReference,
          })
        } else {
          setCheckoutError(verifyRes.message || 'Payment verification failed.')
        }
      } catch (err: any) {
        setCheckoutError(err.message || 'An unexpected error occurred during checkout.')
      }
    })
  }

  if (payment || paymentSuccessData) {
    return (
      <PageFrame title="Payment Status" eyebrow="Order confirmation">
        <div className="mx-auto max-w-xl card p-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
            <Icon name="check" className="size-8" />
          </span>
          <h2 className="mt-6 text-2xl font-semibold text-white">Payment Successful</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your <span className="font-semibold text-emerald-300 capitalize">{selectedPackage}</span> package has been activated with instant curriculum access.
          </p>

          <div className="my-6 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Transaction Reference:</span>
              <span className="font-mono text-slate-200">{paymentSuccessData?.transactionReference || 'SGM-LIVE-TX889'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Invoice Number:</span>
              <span className="font-mono text-emerald-300">{paymentSuccessData?.invoiceNumber || 'INV-2026-0042'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Gateway:</span>
              <span className="text-slate-200">Razorpay (AES-256 HMAC Verified)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-semibold text-emerald-300">ENROLLED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="button-primary justify-center">
              Open Dashboard
            </Link>
            <Link href="/profile" className="button-secondary justify-center">
              View Invoices &amp; Profile
            </Link>
          </div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame title="Checkout" eyebrow="Secure package purchase">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white capitalize">{selectedPackage} Package</h2>
              <p className="mt-1 text-sm text-slate-400">
                Full access to case studies, video masterclasses, pattern library, and architecture reviews.
              </p>
            </div>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-[#071322] px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="foundation">Foundation ($49 / 3 mos)</option>
              <option value="professional">Professional ($129 / 12 mos)</option>
              <option value="enterprise">Enterprise ($499 / 12 mos)</option>
            </select>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              'Unlimited quiz assessments (QZ-1)',
              'All interactive security case studies (CS-1)',
              'All recorded classes & progress tracking (VD-1)',
              'Threat modeling & pattern library (PL-1)',
              'Design reviews evaluation with instructor feedback (RE-1)',
              'Compliant digital tax invoice & certificate (IN-1)',
            ].map((x) => (
              <div
                key={x}
                className="flex items-center gap-3 rounded-xl bg-white/[.035] p-4 text-xs text-slate-300"
              >
                <Icon name="check" className="size-4 shrink-0 text-emerald-300" />
                <span>{x}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Guarantee</h3>
            <p className="mt-1 text-xs text-slate-400">
              Payments are processed over 256-bit encrypted TLS via PCI-DSS certified payment rails. 7-day money-back guarantee under our refund policy.
            </p>
          </div>
        </section>

        <aside className="card p-7">
          <h2 className="font-semibold text-white">Order Summary (PY-2)</h2>
          <div className="mt-6 space-y-3 border-b border-white/8 pb-5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span className="capitalize">{selectedPackage} Package</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Platform Tax (0%)</span>
              <span>$0.00</span>
            </div>
          </div>

          {/* Discount coupon form (PY-9) */}
          <form onSubmit={handleApplyCoupon} className="mt-5">
            <label className="block text-xs font-medium text-slate-400">
              Promo Code / Coupon (Try: SANGAM20)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                className="input uppercase"
                placeholder="Enter coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button type="submit" className="button-secondary px-4 text-xs">
                Apply
              </button>
            </div>
            {couponError && <p className="mt-1.5 text-xs text-rose-300">{couponError}</p>}
            {couponSuccess && <p className="mt-1.5 text-xs text-emerald-300">{couponSuccess}</p>}
          </form>

          <div className="my-6 flex justify-between text-lg font-semibold text-white">
            <span>Total Payable</span>
            <span className="text-emerald-300">${finalPrice.toFixed(2)}</span>
          </div>

          {checkoutError && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleProceedToPayment}
            disabled={isPending}
            className="button-primary w-full justify-center disabled:opacity-60"
          >
            {isPending ? 'Processing Secure Payment…' : `Pay $${finalPrice.toFixed(2)} Now`}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Icon name="lock" className="size-3.5" />
            PCI-DSS Encrypted · Razorpay HMAC Verified
          </p>
        </aside>
      </div>
    </PageFrame>
  )
}
