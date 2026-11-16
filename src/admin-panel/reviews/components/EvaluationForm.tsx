'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/app/(frontend)/components/icons'
import {
  evaluateReviewAction,
  type ReviewStatus,
  type EvaluateReviewParams,
} from '@admin-panel/reviews/review-actions'

export interface AuditItem {
  timestamp?: string
  action: string
  actor: string
}

export interface EvaluationFormProps {
  reviewId: string | number
  initialStatus: ReviewStatus
  initialScore?: number | null
  initialComments?: string | null
  auditHistory?: AuditItem[]
  adminEmail: string
}

export function EvaluationForm({
  reviewId,
  initialStatus,
  initialScore,
  initialComments,
  auditHistory = [],
  adminEmail,
}: EvaluationFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<ReviewStatus>(initialStatus)
  const [score, setScore] = useState<string>(
    typeof initialScore === 'number' ? String(initialScore) : ''
  )
  const [instructorComments, setInstructorComments] = useState<string>(initialComments || '')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [history, setHistory] = useState<AuditItem[]>(auditHistory)

  const handleSubmit = (e?: React.FormEvent, overrideStatus?: ReviewStatus) => {
    if (e) e.preventDefault()
    setFeedback(null)

    const targetStatus = overrideStatus || status
    const numericScore = score !== '' ? Number(score) : null

    if (numericScore !== null && (isNaN(numericScore) || numericScore < 0 || numericScore > 100)) {
      setFeedback({ ok: false, message: 'Score must be a number between 0 and 100.' })
      return
    }

    startTransition(async () => {
      const params: EvaluateReviewParams = {
        reviewId,
        status: targetStatus,
        score: numericScore,
        instructorComments,
      }

      const res = await evaluateReviewAction(params)

      if (res.ok) {
        setStatus(targetStatus)
        setFeedback({ ok: true, message: res.message })

        // Optimistically add to audit trail
        const newEntry: AuditItem = {
          timestamp: new Date().toISOString(),
          actor: adminEmail,
          action: `Evaluation saved (Status: ${targetStatus}${
            numericScore !== null ? `, Score: ${numericScore}/100` : ''
          })`,
        }
        setHistory((prev) => [newEntry, ...prev])
        router.refresh()
      } else {
        setFeedback({ ok: false, message: res.message })
      }
    })
  }

  const insertTemplateComment = (text: string) => {
    setInstructorComments((prev) => (prev ? `${prev}\n\n${text}` : text))
  }

  const scoreNum = Number(score)
  const isScoreValid = score !== '' && !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100

  return (
    <div className="space-y-6">
      {/* Evaluation Grading Panel */}
      <div className="card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
              <Icon name="spark" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Instructor Grading & Evaluation</h2>
              <p className="text-[11px] text-slate-400">Authenticated Administrator: {adminEmail}</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
            Admins Only
          </span>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mt-4 rounded-xl border p-3.5 text-xs font-medium leading-relaxed ${
              feedback.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="mt-5 space-y-5">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Evaluation Status
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    { id: 'submitted', label: 'Submitted', color: 'amber' },
                    { id: 'in-review', label: 'In Review', color: 'sky' },
                    { id: 'reviewed', label: 'Reviewed', color: 'emerald' },
                    { id: 'flagged', label: 'Flagged', color: 'rose' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`rounded-xl border py-2.5 text-center text-xs font-semibold transition ${
                      status === opt.id
                        ? opt.color === 'emerald'
                          ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                          : opt.color === 'sky'
                          ? 'border-sky-400 bg-sky-400/20 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                          : opt.color === 'rose'
                          ? 'border-rose-400 bg-rose-400/20 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>
          </div>

          {/* Score Input & Presets */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="score-input" className="text-xs font-semibold text-slate-300">
                Architecture Score (0 - 100)
              </label>
              {isScoreValid && (
                <span
                  className={`text-xs font-bold ${
                    scoreNum >= 80
                      ? 'text-emerald-400'
                      : scoreNum >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {scoreNum >= 80 ? 'Proficient' : scoreNum >= 60 ? 'Needs Improvement' : 'Deficient'}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="relative w-32 shrink-0">
                <input
                  id="score-input"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="85"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 pr-10 text-sm font-bold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-normal">
                  /100
                </span>
              </div>

              {/* Score Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[70, 80, 85, 90, 95, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScore(String(val))}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 transition"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor Comments */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="comments-input" className="text-xs font-semibold text-slate-300">
                Instructor Comments & Recommendations
              </label>
              <span className="text-[10px] text-slate-500">Visible to learner upon review</span>
            </div>

            <textarea
              id="comments-input"
              rows={5}
              value={instructorComments}
              onChange={(e) => setInstructorComments(e.target.value)}
              placeholder="Provide constructive feedback highlighting strengths, defense-in-depth gaps, tokenization resilience, and recommended security patterns..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed"
            />

            {/* Quick Feedback Templates */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500">Insert quick feedback:</span>
              <button
                type="button"
                onClick={() =>
                  insertTemplateComment(
                    'Solid identity tier setup. Consider deploying the Token Vault across multiple availability zones to ensure disaster recovery.'
                  )
                }
                className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-slate-400 hover:text-white"
              >
                + Multi-AZ Token Vault
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTemplateComment(
                    'Ensure API Gateway enforces mTLS on upstream microservice communication to prevent lateral movement.'
                  )
                }
                className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-slate-400 hover:text-white"
              >
                + mTLS Upstream
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTemplateComment(
                    'Commendable Zero Trust segmentation. Session limits and anomaly alerting should be linked to the SIEM tier.'
                  )
                }
                className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-slate-400 hover:text-white"
              >
                + SIEM Anomaly Alerting
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              {status !== 'in-review' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit(undefined, 'in-review')}
                  className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 disabled:opacity-50"
                >
                  Mark In-Review
                </button>
              )}

              {status !== 'reviewed' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit(undefined, 'reviewed')}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Approve & Mark Reviewed
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_8px_20px_rgba(251,191,36,0.15)] transition duration-150 hover:from-amber-300 hover:to-amber-200 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <span className="size-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Icon name="check" className="size-3.5" />
                  Save Evaluation
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Audit History Timeline */}
      <div className="card p-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-white/5 text-slate-300">
              <Icon name="clock" className="size-3.5" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Administrative Audit History
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">Immutable Audit Trail</span>
        </div>

        <div className="mt-4">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  <div className="grid size-6 shrink-0 place-items-center rounded-full bg-white/5 text-amber-400 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{item.action}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">{item.actor}</span>
                      <span>•</span>
                      <span>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Recorded'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
              No previous administrative modifications recorded for this review.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
