'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@frontend/components/icons'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    id: 'demo-1',
    category: 'Free Trial & Demos',
    question: 'Can I watch lectures before purchasing a subscription?',
    answer:
      'Yes, absolutely. Every single course on SANGAM features exactly one full-length Free Trial masterclass that you can stream immediately without logging in or providing credit card information.',
  },
  {
    id: 'demo-2',
    category: 'Free Trial & Demos',
    question: 'How do I access the locked lectures in a course?',
    answer:
      'After watching the free trial lecture, you can unlock all remaining lectures, architecture pattern downloads, scenario quizzes, and certification assessments by purchasing the course directly or selecting an All-Access membership plan.',
  },
  {
    id: 'curr-1',
    category: 'Curriculum & Prerequisites',
    question: 'What prerequisite background is required for SANGAM courses?',
    answer:
      'Our curriculum is tailored for software engineers, tech leads, DevOps practitioners, and aspiring security architects. Familiarity with cloud architecture concepts (such as AWS/GCP basics, microservices, and HTTP/REST APIs) is recommended.',
  },
  {
    id: 'curr-2',
    category: 'Curriculum & Prerequisites',
    question: 'Are the architecture scenarios based on real production incidents?',
    answer:
      'Yes. Our scenarios are modeled after actual anonymized post-mortems from Tier-1 tech firms, including zero-day supply chain breaches, distributed session hijacking, AWS IAM cross-account misconfigurations, and crypto-key exfiltration.',
  },
  {
    id: 'quiz-1',
    category: 'Quizzes & Certification',
    question: 'How are quizzes structured on SANGAM?',
    answer:
      'Unlike generic multiple-choice memory tests, SANGAM quizzes present an architecture blueprint and a threat actor objective. You must identify subtle design flaws, choose the optimal cryptographic primitive, or select defense-in-depth mitigations.',
  },
  {
    id: 'quiz-2',
    category: 'Quizzes & Certification',
    question: 'Do I receive a certificate upon course completion?',
    answer:
      'Yes. Passing all scenario quizzes with a score of 70% or higher and submitting the capstone design review issues a digitally verifiable Certificate of Security Architecture Competency.',
  },
  {
    id: 'ai-1',
    category: 'AI Design Reviews',
    question: 'How does the AI-assisted design review work?',
    answer:
      'You can submit architectural blueprints or problem statements via our Design Review portal. Our evaluation engine checks your design against STRIDE, OWASP Top 10, and Zero Trust perimeters, scoring defense completeness and surfacing hidden attack surfaces.',
  },
  {
    id: 'pay-1',
    category: 'Payments & Refunds',
    question: 'What payment options and currencies do you support?',
    answer:
      'We accept all major credit/debit cards (Visa, Mastercard, RuPay, Amex), UPI, Net Banking, and corporate cards via Razorpay. Transactions can be billed in INR or USD with automated tax invoice generation.',
  },
  {
    id: 'pay-2',
    category: 'Payments & Refunds',
    question: 'What is your refund policy?',
    answer:
      'We offer a 7-day money-back guarantee. If you are not satisfied with the course content, you can request a 100% refund within 7 days of purchase provided you have viewed less than 20% of the lessons and have not submitted a design review.',
  },
]

export function FaqView() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['demo-1', 'demo-2']))

  const categories = ['All', 'Free Trial & Demos', 'Curriculum & Prerequisites', 'Quizzes & Certification', 'Payments & Refunds']

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredFaqs = FAQS.filter((f) => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow">Clear Answers</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Everything you need to know about SANGAM masterclasses, free trial lectures, quizzes, and
          certifications.
        </p>

        {/* Search bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g., trial, refund, certificate)..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                : 'border border-white/5 bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.has(faq.id)
            return (
              <div
                key={faq.id}
                className="card overflow-hidden border border-white/5 bg-white/[0.02] transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-semibold text-white">{faq.question}</span>
                  <span
                    className={`grid size-6 place-items-center rounded-lg bg-white/5 text-xs text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-300 border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-sm text-slate-400 card">
            No matching questions found for &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>

      {/* Still have questions banner */}
      <div className="card p-8 text-center max-w-2xl mx-auto space-y-3">
        <h3 className="text-base font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-slate-400">
          Can&apos;t find what you&apos;re looking for? Reach out to our admissions team directly.
        </p>
        <div className="pt-2">
          <Link href="/contact" className="button-primary text-xs">
            Contact Admissions &amp; Faculty
          </Link>
        </div>
      </div>
    </div>
  )
}
