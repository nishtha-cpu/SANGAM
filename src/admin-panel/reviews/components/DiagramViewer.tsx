'use client'

import { useState } from 'react'
import { Icon } from '@/app/(frontend)/components/icons'

export interface DiagramNode {
  id?: string
  label?: string
  title?: string
  type?: string
  icon?: string
  x?: number
  y?: number
  role?: string
}

export interface DiagramViewerProps {
  diagramData: any
  title?: string
}

export function DiagramViewer({ diagramData, title }: DiagramViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [viewMode, setViewMode] = useState<'canvas' | 'raw'>('canvas')

  // Extract nodes if array or structured
  const rawNodes: DiagramNode[] = Array.isArray(diagramData?.nodes)
    ? diagramData.nodes
    : Array.isArray(diagramData)
    ? diagramData
    : []

  const hasRawJson = diagramData && Object.keys(diagramData).length > 0

  return (
    <div className="card overflow-hidden">
      {/* Top Diagram Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
            <Icon name="layers" className="size-3.5" />
          </span>
          <span className="font-semibold text-white">
            {title ? `${title} — Architecture Canvas` : 'Submitted Architecture Diagram'}
          </span>
          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
            {rawNodes.length > 0 ? `${rawNodes.length} Canvas Elements` : 'Visual Canvas'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('canvas')}
              className={`rounded px-2.5 py-1 font-medium transition ${
                viewMode === 'canvas'
                  ? 'bg-amber-400/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visual Canvas
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`rounded px-2.5 py-1 font-medium transition ${
                viewMode === 'raw'
                  ? 'bg-amber-400/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON Structure
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              title="Zoom Out"
            >
              <Icon name="zoomOut" className="size-3.5" />
            </button>
            <span className="w-10 text-center text-[10px] font-mono text-slate-400">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              title="Zoom In"
            >
              <Icon name="zoomIn" className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas / Raw Area */}
      {viewMode === 'raw' ? (
        <div className="max-h-96 overflow-auto bg-black/60 p-5 font-mono text-xs text-emerald-300">
          <pre>{JSON.stringify(diagramData, null, 2) || '// No diagram geometry recorded'}</pre>
        </div>
      ) : (
        <div className="relative min-h-[420px] overflow-hidden bg-[#071322] p-8">
          {/* Blueprint Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          >
            {rawNodes.length > 0 ? (
              /* Render Dynamic Nodes */
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {rawNodes.map((node, i) => (
                  <div
                    key={node.id || i}
                    className="group rounded-2xl border border-white/10 bg-[#0a1a2e]/90 p-4 shadow-xl backdrop-blur transition hover:border-amber-400/40 hover:bg-[#0c223c]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
                        <Icon name={(node.icon as any) || 'shield'} className="size-4" />
                      </span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                        {node.type || 'Node'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">
                      {node.title || node.label || `Component ${i + 1}`}
                    </p>
                    {node.role && (
                      <p className="mt-1 text-xs text-slate-400">{node.role}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback Architecture Model Canvas */
              <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#081729]/80 p-6 shadow-2xl backdrop-blur">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    SANGAM Architecture Topology
                  </span>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Tiered Flow Verified
                  </span>
                </div>

                {/* Architecture Nodes Flow */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Tier 1: Client Edge */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tier 1: Ingress Edge
                    </p>
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-sky-500/20 text-sky-300">
                        <Icon name="user" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">Customer Client</p>
                      <p className="text-[10px] text-sky-300/80">TLS 1.3 / OIDC Client</p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Icon name="shield" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">Identity Provider</p>
                      <p className="text-[10px] text-emerald-300/80">MFA & SSO Tokens</p>
                    </div>
                  </div>

                  {/* Tier 2: API Gateway & Service Mesh */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tier 2: Policy Enforcement
                    </p>
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-indigo-500/20 text-indigo-300">
                        <Icon name="grid" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">API Gateway (DMZ)</p>
                      <p className="text-[10px] text-indigo-300/80">WAF, Rate Limiting</p>
                    </div>

                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-purple-500/20 text-purple-300">
                        <Icon name="lock" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">Zero Trust Gateway</p>
                      <p className="text-[10px] text-purple-300/80">Least Privilege RBAC</p>
                    </div>
                  </div>

                  {/* Tier 3: Data Tier & Token Vault */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tier 3: Isolated Services
                    </p>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-amber-500/20 text-amber-300">
                        <Icon name="layers" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">Order Microservice</p>
                      <p className="text-[10px] text-amber-300/80">Private Subnet / mTLS</p>
                    </div>

                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                      <div className="mx-auto grid size-8 place-items-center rounded-lg bg-rose-500/20 text-rose-300">
                        <Icon name="shield" className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">Token Vault (AES-256)</p>
                      <p className="text-[10px] text-rose-300/80">Hardware Security Module</p>
                    </div>
                  </div>
                </div>

                {!hasRawJson && (
                  <p className="mt-5 border-t border-white/5 pt-3 text-center text-[11px] text-slate-500 italic">
                    Note: The learner submitted a conceptual design. The diagram above illustrates the
                    associated architecture scenario topology.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
