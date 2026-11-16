'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@/app/(frontend)/components/icons'
import { moveReviewStatusAction, type ReviewStatus } from '@admin-panel/reviews/review-actions'

export interface ReviewRow {
  id: string | number
  title: string
  status: ReviewStatus
  score?: number | null
  learnerName: string
  learnerEmail: string
  caseStudyTitle?: string | null
  patternsCount: number
  hasDiagram: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewsListClientProps {
  initialReviews: ReviewRow[]
  telemetryAvailable: boolean
}

export function ReviewsListClient({ initialReviews, telemetryAvailable }: ReviewsListClientProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews)
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [actionMessage, setActionMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // Status counts
  const counts = {
    all: reviews.length,
    submitted: reviews.filter((r) => r.status === 'submitted').length,
    inReview: reviews.filter((r) => r.status === 'in-review').length,
    reviewed: reviews.filter((r) => r.status === 'reviewed').length,
    flagged: reviews.filter((r) => r.status === 'flagged').length,
  }

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = r.learnerName.toLowerCase().includes(q)
      const matchEmail = r.learnerEmail.toLowerCase().includes(q)
      const matchTitle = r.title.toLowerCase().includes(q)
      const matchCase = (r.caseStudyTitle || '').toLowerCase().includes(q)
      return matchName || matchEmail || matchTitle || matchCase
    }
    return true
  })

  const handleQuickStatusChange = (reviewId: string | number, newStatus: ReviewStatus) => {
    setActionMessage(null)
    startTransition(async () => {
      const result = await moveReviewStatusAction(reviewId, newStatus)
      if (result.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        )
        setActionMessage({ text: result.message, ok: true })
        router.refresh()
      } else {
        setActionMessage({ text: result.message, ok: false })
      }
    })
  }

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Submitted
          </span>
        )
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
            <span className="size-1.5 rounded-full bg-sky-400" />
            In Review
          </span>
        )
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Reviewed
          </span>
        )
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
            <span className="size-1.5 rounded-full bg-rose-400" />
            Flagged
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-medium transition ${
            actionMessage.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            Student Review Evaluation
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Assess learner architecture diagrams, assign scores, and provide instructor feedback.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learner, title, case..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon name="search" className="size-3.5" />
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span>All Submissions</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setFilter('submitted')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            filter === 'submitted'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="size-1.5 rounded-full bg-amber-400" />
          <span>Pending Evaluation</span>
          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
            {counts.submitted}
          </span>
        </button>

        <button
          onClick={() => setFilter('in-review')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            filter === 'in-review'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="size-1.5 rounded-full bg-sky-400" />
          <span>In Review</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
            {counts.inReview}
          </span>
        </button>

        <button
          onClick={() => setFilter('reviewed')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            filter === 'reviewed'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span>Reviewed</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
            {counts.reviewed}
          </span>
        </button>

        {counts.flagged > 0 && (
          <button
            onClick={() => setFilter('flagged')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              filter === 'flagged'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span>Flagged</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
              {counts.flagged}
            </span>
          </button>
        )}
      </div>

      {/* Reviews Table / Card Grid */}
      {filteredReviews.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Learner</th>
                  <th className="px-5 py-3.5">Submission & Case Study</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="transition hover:bg-white/[0.02]">
                    {/* Learner Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 font-bold text-emerald-300 text-xs">
                          {r.learnerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{r.learnerName}</p>
                          <p className="text-[11px] text-slate-400">{r.learnerEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Submission Title & Case Study */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{r.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{r.caseStudyTitle || 'Independent Architecture'}</span>
                        {r.patternsCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400/80">
                              {r.patternsCount} security {r.patternsCount === 1 ? 'pattern' : 'patterns'}
                            </span>
                          </>
                        )}
                        {r.hasDiagram && (
                          <>
                            <span>•</span>
                            <span className="text-sky-400/80">Canvas diagram attached</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(r.status)}</td>

                    {/* Score */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {typeof r.score === 'number' ? (
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={`text-sm ${
                              r.score >= 80
                                ? 'text-emerald-300'
                                : r.score >= 60
                                ? 'text-amber-300'
                                : 'text-rose-300'
                            }`}
                          >
                            {r.score}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Unscored</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'submitted' && (
                          <button
                            onClick={() => handleQuickStatusChange(r.id, 'in-review')}
                            disabled={isPending}
                            className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 disabled:opacity-50"
                          >
                            Start Review
                          </button>
                        )}

                        <Link
                          href={`/admin-dashboard/reviews/${r.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-400/20 transition"
                        >
                          <span>Evaluate</span>
                          <Icon name="arrow" className="size-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/5 text-slate-400">
            <Icon name="spark" className="size-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-white">No Review Submissions Found</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
            {search
              ? `No student reviews matched the query "${search}". Try adjusting your filters or search terms.`
              : filter !== 'all'
              ? `There are currently no reviews in the "${filter}" stage.`
              : 'When learners create and submit architecture diagrams for evaluation, they will be listed here for instructor grading.'}
          </p>

          {(search || filter !== 'all') && (
            <button
              onClick={() => {
                setSearch('')
                setFilter('all')
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Reset Filters
            </button>
          )}

          {!telemetryAvailable && (
            <div className="mt-6 mx-auto max-w-md rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/80">
              Note: The database engine is running in standalone local dev mode. Review submissions
              persisted in the cloud PostgreSQL database will populate automatically once connected.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
