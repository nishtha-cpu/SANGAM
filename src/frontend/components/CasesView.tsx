'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { InfoCard } from '@frontend/components/InfoCard'
import { Empty } from '@frontend/components/Empty'
import { curriculumCases } from '@frontend/data/curriculum'

export interface CasesViewProps {
  detail?: boolean
}

export function CasesView({ detail = false }: CasesViewProps) {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('All difficulties')

  const list = curriculumCases.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) &&
      (difficulty === 'All difficulties' || c.difficulty === difficulty),
  )

  if (detail) {
    return (
      <PageFrame eyebrow="Case study · Solution Architecture">
        <div className="max-w-4xl">
          <div className="flex flex-wrap gap-2">
            <span className="badge">Intermediate</span>
            <span className="badge">Design from scratch</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Design a Secure Customer Portal
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            A retail company needs a customer-facing portal where users can view orders, manage
            payment methods and update their personal details.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <InfoCard
              title="Business requirements"
              items={[
                'Support 2 million customer accounts',
                'Integrate with the existing order platform',
                'Provide responsive web and mobile access',
                'Meet seasonal peak traffic demand',
              ]}
            />
            <InfoCard
              title="Security requirements"
              items={[
                'Customer MFA and risk-based authentication',
                'Tokenize payment card data',
                'Segment public, application and data tiers',
                'Send immutable audit events to the existing SIEM',
              ]}
            />
            <InfoCard
              title="Problem statement"
              items={[
                'Payment data crosses several trust boundaries',
                'Legacy order APIs cannot be exposed directly',
                'Customer sessions require secure recovery',
                'The architecture must remain observable',
              ]}
            />
            <InfoCard
              title="Expected architecture"
              items={[
                'Identity provider and policy enforcement',
                'API gateway and protected service tier',
                'Token vault and encrypted data stores',
                'Centralized logging and anomaly detection',
              ]}
            />
          </div>
          <Link href="/design-review" className="button-primary mt-8">
            Start designing <Icon name="arrow" className="size-4" />
          </Link>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame title="Case Studies" eyebrow="Practice with real-world scenarios">
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_210px_190px]">
        <label className="relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-11"
            placeholder="Search case studies by name or keyword"
          />
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="input"
        >
          <option>All difficulties</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select className="input">
          <option>Newest to Oldest</option>
          <option>Oldest to Newest</option>
        </select>
      </div>
      <div className="space-y-3">
        {list.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-emerald-300">
                  {c.category}
                </span>
                <span className="text-[10px] text-slate-600">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">
                  {c.difficulty}
                </span>
              </div>
              <h2 className="font-semibold">{c.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{c.description}</p>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-xs text-slate-400 group-hover:border-emerald-400/25 group-hover:text-emerald-300">
              {c.mode}
              <Icon name="chevron" className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
      {!list.length && (
        <Empty
          title="No case studies match"
          text="Clear your filters or try a different search keyword."
        />
      )}
    </PageFrame>
  )
}
