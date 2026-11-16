'use client'

import { useState } from 'react'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { securityPatterns } from '@frontend/data/curriculum'

export function PatternLibraryView() {
  const [query, setQuery] = useState('')

  const all = securityPatterns
    .flatMap(([category, items]) =>
      items.map((name, i) => ({
        category,
        name,
        description:
          i % 2
            ? 'A reusable control pattern for reducing identity and data exposure risk.'
            : 'A proven security architecture approach with practical implementation guidance.',
      })),
    )
    .filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <PageFrame title="Pattern Library" eyebrow="Reusable security building blocks">
      <div className="mb-7 grid gap-3 md:grid-cols-[1fr_240px]">
        <label className="relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            className="input pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search security patterns"
          />
        </label>
        <select className="input">
          <option>All categories</option>
          {securityPatterns.map((p) => (
            <option key={p[0]}>{p[0]}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {all.map((p) => (
          <article key={p.name} className="card flex flex-col p-6">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-300">
              {p.category}
            </p>
            <h2 className="mt-3 text-lg font-semibold">{p.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{p.description}</p>
            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <p>
                <strong className="text-slate-300">Purpose:</strong> Reduce attack paths and enforce
                trust boundaries.
              </p>
              <p>
                <strong className="text-slate-300">Advantage:</strong> Auditable, scalable and
                implementation-ready.
              </p>
            </div>
            <button className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-300">
              View implementation guide <Icon name="arrow" className="size-3.5" />
            </button>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}
