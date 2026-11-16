import { AdminDashboardLayout } from './AdminDashboardLayout'
import { Icon } from '@/app/(frontend)/components/icons'
import type { AdminUser } from '@admin-panel/auth/admin-auth'

export interface RecentReview {
  id: string | number
  title: string
  status: string
  createdAt: string
  score?: number | null
}

export interface RecentLearner {
  id: string | number
  name: string
  email: string
  createdAt: string
}

export interface DashboardCounts {
  learners: number
  activeLearners: number
  classes: number
  caseStudies: number
  quizzes: number
  patterns: number
  pendingReviews: number
  orders: number
}

export interface AdminDashboardViewProps {
  admin: AdminUser
  telemetryAvailable: boolean
  counts: DashboardCounts
  recentReviews: RecentReview[]
  recentLearners: RecentLearner[]
}

export function AdminDashboardView({
  admin,
  telemetryAvailable,
  counts,
  recentReviews,
  recentLearners,
}: AdminDashboardViewProps) {
  const kpis = [
    {
      title: 'Total Learners',
      value: counts.learners,
      secondary: `${counts.activeLearners} active with verified terms`,
      icon: 'user' as const,
      color: 'emerald',
    },
    {
      title: 'Pending Reviews',
      value: counts.pendingReviews,
      secondary: 'Requires instructor evaluation',
      icon: 'spark' as const,
      color: 'amber',
      highlight: counts.pendingReviews > 0,
    },
    {
      title: 'Recorded Classes',
      value: counts.classes,
      secondary: 'Published lectures & labs',
      icon: 'video' as const,
      color: 'sky',
    },
    {
      title: 'Case Studies',
      value: counts.caseStudies,
      secondary: 'Architecture scenarios',
      icon: 'layers' as const,
      color: 'purple',
    },
    {
      title: 'Assessment Quizzes',
      value: counts.quizzes,
      secondary: 'Domain knowledge tests',
      icon: 'book' as const,
      color: 'indigo',
    },
    {
      title: 'Security Patterns',
      value: counts.patterns,
      secondary: 'Zero Trust & Cloud controls',
      icon: 'shield' as const,
      color: 'teal',
    },
  ]

  return (
    <AdminDashboardLayout
      admin={admin}
      telemetryAvailable={telemetryAvailable}
      counts={counts}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a1b2d] via-[#091522] to-[#06101c] p-7 md:p-9 shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-80 rounded-full bg-amber-400/5 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-400" />
              SANGAM Command Center
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Security Operations Console
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Welcome back, <strong className="text-white">{admin.email}</strong>. Manage curriculum
              assets, track learner enrollments, and evaluate architecture design reviews across the
              organization.
            </p>
          </div>
        </div>

        {/* Database Telemetry Warning if Offline */}
        {!telemetryAvailable && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-amber-200">
            <div className="flex items-start gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-amber-500/20 font-bold text-amber-300">
                !
              </span>
              <div>
                <h2 className="text-sm font-semibold text-amber-100">
                  Figma Cloud Backend Telemetry Standalone Notice
                </h2>
                <p className="mt-1 text-xs leading-5 text-amber-300/80">
                  This Next.js development server is running in a local standalone shell without
                  direct cloud container bindings (<code className="text-amber-200">FIGMA_EID</code>).
                  All metrics below reflect real-time counts from the active Payload engine. In this
                  isolated local mode, metrics display standard empty states until connected to the
                  cloud PostgreSQL backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Metrics Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Platform Metrics & Telemetry
            </h2>
            <span className="text-xs text-slate-500">Live Payload Collection Telemetry</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <div
                key={kpi.title}
                className={`card relative overflow-hidden p-6 transition ${
                  kpi.highlight ? 'border-amber-400/40 bg-amber-400/[0.04]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                  <span className="grid size-9 place-items-center rounded-xl border border-white/5 bg-white/[0.04] text-slate-300">
                    <Icon name={kpi.icon} className="size-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight text-white">{kpi.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{kpi.secondary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Modules & Recent Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Architecture Submissions */}
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-semibold text-white">Student Review Submissions</h3>
                <p className="text-xs text-slate-400">
                  Architecture diagrams submitted by learners
                </p>
              </div>
              <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-400">
                Reviews
              </span>
            </div>

            <div className="mt-4">
              {recentReviews.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {recentReviews.map((rev) => (
                    <div key={rev.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-medium text-white">{rev.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          rev.status === 'submitted'
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                            : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-xl bg-white/5 text-slate-400">
                    <Icon name="spark" className="size-5" />
                  </div>
                  <h4 className="mt-3 text-xs font-semibold text-white">No Review Submissions Yet</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400 max-w-xs mx-auto">
                    When learners submit architecture designs for instructor grading, they will appear
                    here for evaluation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Learner Registrations */}
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-semibold text-white">Recent Learner Registrations</h3>
                <p className="text-xs text-slate-400">Platform accounts created by learners</p>
              </div>
              <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-400">
                Users
              </span>
            </div>

            <div className="mt-4">
              {recentLearners.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {recentLearners.map((lrn) => (
                    <div key={lrn.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-medium text-white">{lrn.name}</p>
                        <p className="text-[11px] text-slate-400">{lrn.email}</p>
                      </div>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                        Learner
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-xl bg-white/5 text-slate-400">
                    <Icon name="user" className="size-5" />
                  </div>
                  <h4 className="mt-3 text-xs font-semibold text-white">No Registered Learners</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400 max-w-xs mx-auto">
                    Learner accounts created via the public signup portal will be recorded here in the
                    Users collection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase 2 Architecture & Security Invariants Summary */}
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Icon name="shield" className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">
                SANGAM Phase 2 Architecture & Security Posture
              </h3>
              <p className="text-xs text-slate-400">
                Strict separation of concerns across authentication and authorization domains.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="font-semibold text-white">Admin Isolation</p>
              <p className="mt-1 leading-5 text-slate-400">
                Admin tokens originate strictly from <code className="text-slate-300">admins</code>{' '}
                collection. Learner sessions cannot access admin endpoints.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="font-semibold text-white">Curriculum Immutability</p>
              <p className="mt-1 leading-5 text-slate-400">
                Curriculum collections (<code className="text-slate-300">Classes</code>,{' '}
                <code className="text-slate-300">CaseStudies</code>,{' '}
                <code className="text-slate-300">Quizzes</code>) permit write operations solely to verified
                administrators.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="font-semibold text-white">Learner Privacy</p>
              <p className="mt-1 leading-5 text-slate-400">
                Learners can only read their own <code className="text-slate-300">Reviews</code> and{' '}
                <code className="text-slate-300">Orders</code> documents via server-side row-level access
                rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
