'use client'

import React from 'react'
import Link from 'next/link'
import { Icon, type IconName } from '@frontend/components/icons'

export function AboutView() {
  const pillars: { title: string; description: string; icon: IconName }[] = [
    {
      title: 'Practitioner-First Architecture',
      description:
        'We teach security engineering as a first-class architectural discipline, not a compliance checkbox. Every model, diagram, and lesson reflects real production trade-offs.',
      icon: 'shield',
    },
    {
      title: 'Scenario-Driven Learning',
      description:
        'Instead of rote memorization, learners dissect real-world incidents, evaluate trade-offs in distributed microservices, and design defense-in-depth perimeters.',
      icon: 'layers',
    },
    {
      title: 'AI-Assisted Design Reviews',
      description:
        'Our automated review engine analyzes your system architecture diagrams against OWASP, STRIDE, and Zero Trust standards, offering instant feedback.',
      icon: 'spark',
    },
    {
      title: 'Industry Credibility',
      description:
        'Curriculum reviewed by Principal Security Architects from fintech, cloud hyper-scalers, and defense systems.',
      icon: 'check',
    },
  ]

  const leadership = [
    {
      name: 'Nishtha Sharma',
      role: 'Founder & Principal Architect',
      focus: 'Distributed Systems & Zero Trust Security',
      bio: 'Over a decade of experience designing fault-tolerant, zero-trust cloud infrastructure and leading high-assurance enterprise security transformations.',
    },
    {
      name: 'Security Architecture Council',
      role: 'Curriculum Advisory Board',
      focus: 'Threat Modeling & Cryptographic Design',
      bio: 'A peer review body consisting of active CISOs, threat intelligence leads, and cloud architects ensuring curriculum aligns with contemporary attack vectors.',
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-14 text-center max-w-4xl mx-auto">
        <p className="eyebrow mb-3">About SANGAM</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Empowering Engineers to Build <span className="text-gradient">Resilient Systems</span>
        </h1>
        <p className="mt-6 text-base md:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
          SANGAM (Security Architecture Next Generation Assessment Model) bridges the gap between
          theoretical security frameworks and production engineering reality.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses" className="button-primary">
            Explore Masterclasses <Icon name="arrow" className="size-4 ml-1" />
          </Link>
          <Link href="/contact" className="button-secondary">
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Core Values / Pillars */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow">Our Philosophy</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
            Why We Founded SANGAM
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Most security certifications focus on memorizing acronyms. SANGAM trains you to think,
            architect, and defend like a seasoned principal engineer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="card p-7 space-y-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Icon name={pillar.icon} className="size-5" />
              </span>
              <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Faculty */}
      <section className="card p-8 md:p-12">
        <div className="max-w-2xl mb-10">
          <p className="eyebrow">Faculty & Leadership</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
            Engineered by Practitioners, for Practitioners
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Our content is authored by engineers who have faced actual production breaches and built
            systems processing billions in mission-critical transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {leadership.map((leader) => (
            <div
              key={leader.name}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold text-lg border border-emerald-500/30">
                  {leader.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{leader.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium">{leader.role}</p>
                  <p className="text-[11px] text-slate-500">{leader.focus}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 pt-2 border-t border-white/5">
                {leader.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Non-Production Notice */}
      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-xs text-slate-300 leading-relaxed">
        <div className="flex items-start gap-3">
          <span className="text-amber-400 text-lg leading-none">⚠️</span>
          <div>
            <strong className="text-white">Educational Disclaimer: </strong>
            All architecture patterns, case studies, and laboratory simulations provided on SANGAM
            are strictly for educational and training purposes. Applying architectural patterns to
            production environments requires independent organizational risk assessment.
          </div>
        </div>
      </section>
    </div>
  )
}
