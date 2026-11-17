'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@frontend/layouts/Header'
import { Footer } from '@frontend/layouts/Footer'
import { Icon } from '@frontend/components/icons'
import { featureLinks, pricingTiers } from '@frontend/data/curriculum'
import {
  getPublicMarketingContentAction,
  type TestimonialItem,
  type PromoCardItem,
} from '@/backend/actions/marketing-actions'

export function HomeView() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [promoCards, setPromoCards] = useState<PromoCardItem[]>([])

  useEffect(() => {
    getPublicMarketingContentAction()
      .then((res) => {
        setTestimonials(res.testimonials)
        setPromoCards(res.promoCards)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(31,211,147,.12),transparent_27%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,.11),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 opacity-40" />

        {/* Hero Section */}
        <section className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-4xl">
            <p className="eyebrow mb-5">Immersive security architecture lab</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-.045em] text-white md:text-7xl">
              Security Architecture <span className="text-gradient">Next Generation</span>{' '}
              Assessment Model
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Learn security and solution architecture through practical exercises, scenario-based
              quizzes, recorded classes and AI-assisted design reviews.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="button-primary">
                Go to Dashboard <Icon name="arrow" className="size-4" />
              </Link>
              <Link href="/design-review" className="button-secondary">
                Try a Design Review
              </Link>
            </div>
          </div>

          {/* WS-4: Content Types Showcase */}
          <div className="mt-18 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureLinks.slice(1).map((f) => (
              <Link href={f.href} key={f.title} className="group card p-6">
                <span className="mb-8 grid size-10 place-items-center rounded-xl bg-white/5 text-emerald-300">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <h2 className="font-semibold text-white">{f.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{f.description}</p>
                <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300 opacity-0 transition group-hover:opacity-100">
                  Explore <Icon name="arrow" className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* WS-5 / WS-10: Dynamic Marketing & Practitioner Testimonials */}
        <section className="relative border-t border-white/8 bg-white/[0.01] py-20">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <p className="eyebrow">Enterprise Validation</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Endorsed by Security Architects
              </h2>
              <p className="mt-4 text-sm text-slate-400">
                Practitioners from fintech, cloud infrastructure, and enterprise banking use SANGAM
                to master defense-in-depth and zero-trust engineering.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <div key={t.id} className="card flex flex-col justify-between p-6">
                    <div>
                      <div className="flex gap-1 text-emerald-300 mb-4">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 italic">
                        &ldquo;{t.content}&rdquo;
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <p className="font-semibold text-sm text-white">{t.author}</p>
                      <p className="text-xs text-slate-400">
                        {t.role} · <span className="text-emerald-400">{t.company}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-xs text-slate-500">
                  Loading enterprise endorsements...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WS-2 / WS-3: Curriculum Package Tiers */}
        <section className="relative border-t border-white/8 py-20">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Tailored Curriculum</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Choose Your Architecture Learning Path
                </h2>
                <p className="mt-3 max-w-xl text-sm text-slate-400">
                  Transparent packages covering recorded masterclasses, scenario quizzes, and
                  AI-assisted design reviews.
                </p>
              </div>
              <Link href="/plans" className="button-secondary shrink-0">
                View Detailed Comparison →
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`card p-7 flex flex-col justify-between ${
                    tier.popular ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-lg">{tier.name}</h3>
                      {tier.popular && (
                        <span className="badge border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{tier.description}</p>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-xs text-slate-500 ml-1">/ {tier.validity}</span>
                    </div>
                    <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                      {tier.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/checkout?plan=${tier.name.toLowerCase()}`}
                    className={`mt-8 w-full justify-center ${
                      tier.popular ? 'button-primary' : 'button-secondary'
                    }`}
                  >
                    Select {tier.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
