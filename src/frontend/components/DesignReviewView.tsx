'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@frontend/layouts/Header'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { securityPatterns } from '@frontend/data/curriculum'

export interface DesignReviewViewProps {
  results?: boolean
}

export function DesignReviewView({ results = false }: DesignReviewViewProps) {
  const [selected, setSelected] = useState<string[]>(['Multi-Factor Authentication', 'AES-256'])
  const [panel, setPanel] = useState(true)

  const toggle = (p: string) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]))

  if (results) {
    return (
      <PageFrame title="AI Review Results" eyebrow="Secure Customer Portal">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="card p-7">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold text-emerald-300">78</span>
              <span className="pb-1 text-slate-500">/ 100</span>
            </div>
            <h2 className="mt-5 font-semibold">Good foundation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The design addresses core controls but needs stronger service isolation and key
              resilience.
            </p>
            <button className="button-secondary mt-6 w-full justify-center">Download report</button>
          </aside>
          <div className="space-y-4">
            {[
              [
                'Critical',
                'Public API directly reaches the order service',
                'Introduce an API gateway and private service tier.',
              ],
              [
                'High',
                'Single-region token vault dependency',
                'Deploy the token vault across multiple availability zones.',
              ],
              [
                'Medium',
                'Administrative events lack anomaly alerts',
                'Add behavior analytics and alerting to SIEM ingestion.',
              ],
              [
                'Low',
                'Session timeout is not documented',
                'Define idle and absolute session limits.',
              ],
            ].map(([severity, title, text], i) => (
              <article key={title} className="card p-6">
                <div className="flex items-start gap-4">
                  <span className={`severity severity-${i}`}>{severity}</span>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                    <p className="mt-4 text-xs text-emerald-300">
                      Suggested pattern:{' '}
                      {i === 0
                        ? 'DMZ / Tiered Network'
                        : i === 1
                          ? 'Multi-AZ / Disaster Recovery'
                          : i === 2
                            ? 'Anomaly Detection / Alerting'
                            : 'SSO via OIDC'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageFrame>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#06101b]">
      <Header inner />
      <main className="flex flex-1 flex-col px-3 py-3 lg:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h1 className="text-lg font-semibold">Design Review</h1>
            <p className="text-xs text-slate-500">
              Sketch your architecture and select patterns to review against.
            </p>
          </div>
          <span className="badge">{selected.length} patterns selected</span>
          <button onClick={() => setPanel(!panel)} className="button-secondary py-2">
            {panel ? 'Hide panel' : 'Show panel'}
          </button>
          <button className="button-secondary py-2">Full screen</button>
          <Link href="/design-review/results" className="button-primary py-2">
            Submit for AI review
          </Link>
        </div>
        <div
          className={`grid min-h-[720px] flex-1 gap-3 ${panel ? 'lg:grid-cols-[1fr_330px]' : ''}`}
        >
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#e9edf2] text-slate-800">
            <div className="flex h-12 items-center gap-2 bg-[#1260d6] px-4 text-sm text-white">
              <span className="font-semibold">My Design</span>
              <span className="ml-4 opacity-70">File</span>
              <span className="opacity-70">Edit</span>
              <span className="opacity-70">View</span>
              <span className="opacity-70">Arrange</span>
              <span className="opacity-70">Help</span>
            </div>
            <div className="flex h-11 items-center gap-2 border-b border-slate-300 bg-white px-3">
              <button className="tool-button">↶</button>
              <button className="tool-button">↷</button>
              <button className="tool-button">
                <Icon name="layers" className="size-4" />
              </button>
              <button className="tool-button">T</button>
              <button className="tool-button">□</button>
              <button className="tool-button">→</button>
              <span className="ml-auto text-xs text-slate-500">Page 1 · 100%</span>
              <button className="tool-button">
                <Icon name="zoomOut" className="size-4" />
              </button>
              <button className="tool-button">
                <Icon name="zoomIn" className="size-4" />
              </button>
            </div>
            <div className="grid h-[calc(100%-5.75rem)] grid-cols-[155px_1fr]">
              <aside className="border-r border-slate-300 bg-[#f5f7f9] p-3">
                <input
                  className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-xs"
                  placeholder="Search shapes"
                />
                <p className="mt-5 text-xs font-semibold">General</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-10 rounded border border-slate-300 bg-white" />
                  <div className="rounded-full border border-slate-300 bg-white" />
                  <div className="h-10 border-l-2 border-slate-400" />
                  <div className="grid h-10 place-items-center text-slate-400">→</div>
                </div>
              </aside>
              <div className="diagram-grid relative overflow-hidden">
                <div className="absolute left-[12%] top-[14%] rounded-lg border-2 border-blue-500 bg-white p-4 text-center shadow-md">
                  <Icon name="user" className="mx-auto size-5 text-blue-600" />
                  <p className="mt-1 text-xs font-semibold">Customer</p>
                </div>
                <div className="absolute left-[42%] top-[14%] rounded-lg border-2 border-emerald-500 bg-white p-4 text-center shadow-md">
                  <Icon name="shield" className="mx-auto size-5 text-emerald-600" />
                  <p className="mt-1 text-xs font-semibold">Identity Provider</p>
                </div>
                <div className="absolute left-[42%] top-[48%] rounded-lg border-2 border-indigo-500 bg-white p-4 text-center shadow-md">
                  <Icon name="grid" className="mx-auto size-5 text-indigo-600" />
                  <p className="mt-1 text-xs font-semibold">API Gateway</p>
                </div>
                <div className="absolute left-[72%] top-[48%] rounded-lg border-2 border-violet-500 bg-white p-4 text-center shadow-md">
                  <Icon name="layers" className="mx-auto size-5 text-violet-600" />
                  <p className="mt-1 text-xs font-semibold">Order Service</p>
                </div>
              </div>
            </div>
          </section>
          {panel && (
            <aside className="overflow-y-auto rounded-2xl border border-white/10 bg-[#091625] p-5">
              <h2 className="font-semibold">Security patterns</h2>
              <p className="mt-1 text-xs text-slate-500">
                Select the controls your architecture should meet.
              </p>
              <div className="mt-5 space-y-5">
                {securityPatterns.map(([category, items]) => (
                  <section key={category}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">
                      {category}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {items.map((p) => (
                        <button
                          type="button"
                          onClick={() => toggle(p)}
                          key={p}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                            selected.includes(p)
                              ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                              : 'border-white/8 bg-white/[.025] text-slate-400 hover:border-white/20'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
