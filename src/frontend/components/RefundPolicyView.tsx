'use client'

import React from 'react'
import Link from 'next/link'

export function RefundPolicyView() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 text-sm leading-relaxed text-slate-300">
      {/* Policy Guarantee Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="badge border-emerald-400/40 bg-emerald-400/20 text-emerald-300 font-semibold mb-2">
            Peace of Mind Guarantee
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            7-Day 100% Money-Back Guarantee
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300">
            We want you to enroll in SANGAM with complete confidence. If our security architecture
            curriculum doesn&apos;t meet your professional standards, we will promptly refund your
            purchase.
          </p>
        </div>
        <Link href="/contact" className="button-primary text-xs shrink-0 whitespace-nowrap">
          Request a Refund
        </Link>
      </div>

      <section className="card p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">1. Eligibility Criteria</h3>
        <p className="text-xs md:text-sm text-slate-400">
          To qualify for a full refund under our 7-Day Money-Back Guarantee, your purchase must meet
          the following fair-use conditions:
        </p>
        <ul className="space-y-2 text-xs md:text-sm text-slate-300 list-disc list-inside">
          <li>
            The refund request must be submitted within exactly <strong>7 calendar days</strong> of
            the original transaction timestamp.
          </li>
          <li>
            You have accessed or streamed <strong>less than 20%</strong> of the total video course
            content across your enrolled curriculum.
          </li>
          <li>
            You have <strong>not submitted</strong> any architecture blueprints or capstone design
            reviews for instructor or AI evaluation.
          </li>
          <li>
            You have not previously claimed a refund for the same course or package.
          </li>
        </ul>
      </section>

      <section className="card p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">2. Non-Refundable Scenarios</h3>
        <p className="text-xs md:text-sm text-slate-400">
          Refunds cannot be granted under the following circumstances:
        </p>
        <ul className="space-y-2 text-xs md:text-sm text-slate-300 list-disc list-inside">
          <li>Requests submitted after the 7-calendar-day window has expired.</li>
          <li>
            Accounts that have completed more than 20% of the lessons or downloaded complete
            proprietary blueprint packages.
          </li>
          <li>
            Accounts suspended or terminated due to violations of our Terms of Service (e.g., account
            sharing, scraping, unauthorized redistribution).
          </li>
          <li>Custom enterprise contracts, team licensing agreements, or bespoke consulting engagements.</li>
        </ul>
      </section>

      <section className="card p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">3. How to Request a Refund</h3>
        <p className="text-xs md:text-sm text-slate-400">
          Requesting a refund is simple and frictionless:
        </p>
        <ol className="space-y-3 text-xs md:text-sm text-slate-300 list-decimal list-inside">
          <li>
            Send an email to{' '}
            <strong className="text-emerald-400">support@sangam.edu</strong> or use our{' '}
            <Link href="/contact" className="text-emerald-400 underline">
              Contact Form
            </Link>
            .
          </li>
          <li>
            Use the subject line: <code className="text-slate-200">Refund Request - [Your Order ID]</code>.
          </li>
          <li>
            Include your registered account email and brief feedback on how we can improve our
            learning materials.
          </li>
        </ol>
      </section>

      <section className="card p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">4. Processing &amp; Disbursement Timeline</h3>
        <p className="text-xs md:text-sm text-slate-400">
          Once your request is received and verified against your learning activity telemetry:
        </p>
        <ul className="space-y-2 text-xs md:text-sm text-slate-300 list-disc list-inside">
          <li>We approve and trigger the refund within <strong>24 business hours</strong>.</li>
          <li>
            Funds are credited back to your original payment method (Credit/Debit Card, Netbanking, or
            UPI) via Razorpay within <strong>5 to 7 business days</strong> depending on your bank.
          </li>
          <li>A credit note / refund receipt is automatically emailed to your registered address.</li>
        </ul>
      </section>
    </div>
  )
}
