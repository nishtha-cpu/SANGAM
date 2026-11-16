import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getAdminUser } from '@admin-panel/auth/admin-auth'
import { getCurrentUser } from '@backend/auth/app-auth'
import { AdminDashboardLayout } from '@admin-panel/dashboard/AdminDashboardLayout'
import { DiagramViewer } from '@admin-panel/reviews/components/DiagramViewer'
import { EvaluationForm } from '@admin-panel/reviews/components/EvaluationForm'
import { Icon } from '@/app/(frontend)/components/icons'
import type { ReviewStatus } from '@admin-panel/reviews/review-actions'

interface ReviewDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Evaluate Architecture Review | SANGAM Admin',
  description: 'Evaluate learner architecture diagrams, assign scores, and provide feedback.',
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  // 1. Strict Server-Side Authentication & Authorization Guard
  const admin = await getAdminUser()
  if (!admin) {
    const learner = await getCurrentUser()
    if (learner) {
      redirect('/admin-login?error=learner_denied')
    }
    const resolvedParams = await params
    redirect(`/admin-login?next=/admin-dashboard/reviews/${resolvedParams.id}`)
  }

  const { id } = await params

  // 2. Fetch Review Document & Platform Counts from Payload
  let reviewDoc: any = null
  let telemetryAvailable = false

  const counts = {
    learners: 0,
    activeLearners: 0,
    classes: 0,
    caseStudies: 0,
    quizzes: 0,
    patterns: 0,
    pendingReviews: 0,
    orders: 0,
  }

  try {
    const payload = await getPayload({ config })

    const [
      learnersCount,
      classesCount,
      caseStudiesCount,
      quizzesCount,
      patternsCount,
      pendingCount,
      fetchedDoc,
    ] = await Promise.all([
      payload.count({ collection: 'users', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'classes', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload
        .count({ collection: 'case-studies', overrideAccess: true })
        .catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'quizzes', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload
        .count({ collection: 'security-patterns', overrideAccess: true })
        .catch(() => ({ totalDocs: 0 })),
      payload
        .count({
          collection: 'reviews',
          where: { status: { equals: 'submitted' } },
          overrideAccess: true,
        })
        .catch(() => ({ totalDocs: 0 })),
      payload.findByID({
        collection: 'reviews',
        id,
        depth: 2,
        overrideAccess: true,
      }),
    ])

    counts.learners = learnersCount.totalDocs
    counts.classes = classesCount.totalDocs
    counts.caseStudies = caseStudiesCount.totalDocs
    counts.quizzes = quizzesCount.totalDocs
    counts.patterns = patternsCount.totalDocs
    counts.pendingReviews = pendingCount.totalDocs

    reviewDoc = fetchedDoc
    telemetryAvailable = true
  } catch {
    telemetryAvailable = false
  }

  if (!reviewDoc) {
    notFound()
  }

  // Extract learner info
  const learner = typeof reviewDoc.learner === 'object' && reviewDoc.learner !== null
    ? reviewDoc.learner
    : null
  const learnerName = learner?.name || 'Anonymous Learner'
  const learnerEmail = learner?.email || 'learner@sangam.internal'

  // Extract case study
  const caseStudy = typeof reviewDoc.caseStudy === 'object' && reviewDoc.caseStudy !== null
    ? reviewDoc.caseStudy
    : null

  // Extract selected patterns
  const patterns: any[] = Array.isArray(reviewDoc.selectedPatterns)
    ? reviewDoc.selectedPatterns.filter((p: any) => typeof p === 'object' && p !== null)
    : []

  const currentStatus: ReviewStatus = reviewDoc.status || 'submitted'
  const currentScore: number | null = typeof reviewDoc.score === 'number' ? reviewDoc.score : null
  const auditHistory = Array.isArray(reviewDoc.auditHistory) ? reviewDoc.auditHistory : []

  return (
    <AdminDashboardLayout
      admin={admin}
      telemetryAvailable={telemetryAvailable}
      counts={counts}
    >
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin-dashboard/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <Icon name="back" className="size-3.5" />
              Back to Review Queue
            </Link>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl">
              {reviewDoc.title || 'Architecture Design Review'}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Submitted for evaluation by <strong className="text-white">{learnerName}</strong> (
              {learnerEmail})
            </p>
          </div>

          {/* Status & Score Pills */}
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                currentStatus === 'reviewed'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : currentStatus === 'in-review'
                  ? 'border border-sky-500/30 bg-sky-500/10 text-sky-300'
                  : currentStatus === 'flagged'
                  ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {currentStatus === 'reviewed'
                ? 'Reviewed'
                : currentStatus === 'in-review'
                ? 'In Review'
                : currentStatus === 'flagged'
                ? 'Flagged'
                : 'Pending Evaluation'}
            </span>

            {typeof currentScore === 'number' ? (
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-emerald-300">
                Score: {currentScore} / 100
              </span>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 italic">
                Unscored
              </span>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Diagram, Patterns, and AI Feedback */}
          <div className="space-y-6 min-w-0">
            {/* Architecture Diagram Viewer */}
            <DiagramViewer
              diagramData={reviewDoc.diagramData}
              title={reviewDoc.title}
            />

            {/* Selected Security Patterns */}
            <div className="card p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <Icon name="shield" className="size-3.5" />
                  </span>
                  <h2 className="text-sm font-bold text-white">Targeted Security Patterns</h2>
                </div>
                <span className="text-xs text-slate-400">
                  {patterns.length} {patterns.length === 1 ? 'Pattern' : 'Patterns'} Selected
                </span>
              </div>

              <div className="mt-4">
                {patterns.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {patterns.map((pattern: any) => (
                      <div
                        key={pattern.id}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 uppercase">
                            {pattern.category || 'Security Pattern'}
                          </span>
                        </div>
                        <h3 className="mt-2 text-xs font-bold text-white">{pattern.title}</h3>
                        {pattern.summary && (
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                            {pattern.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
                    No specific security patterns were linked to this submission.
                  </div>
                )}
              </div>
            </div>

            {/* Case Study Context (if attached) */}
            {caseStudy && (
              <div className="card p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-lg bg-purple-400/10 text-purple-300">
                      <Icon name="layers" className="size-3.5" />
                    </span>
                    <h2 className="text-sm font-bold text-white">Associated Case Study Scenario</h2>
                  </div>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase font-semibold text-purple-300">
                    {caseStudy.difficulty || 'Intermediate'}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-white">{caseStudy.title}</h3>
                  {caseStudy.scenario && (
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {caseStudy.scenario}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* AI Automated Feedback (if available) */}
            {reviewDoc.aiFeedback && (
              <div className="card p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-lg bg-sky-400/10 text-sky-300">
                      <Icon name="spark" className="size-3.5" />
                    </span>
                    <h2 className="text-sm font-bold text-white">AI Automated Pre-Screening Findings</h2>
                  </div>
                  <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-300 font-semibold">
                    Automated Analysis
                  </span>
                </div>
                <div className="mt-4 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                  {reviewDoc.aiFeedback}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Instructor Evaluation & Audit History */}
          <aside>
            <div className="sticky top-20">
              <EvaluationForm
                reviewId={reviewDoc.id}
                initialStatus={currentStatus}
                initialScore={currentScore}
                initialComments={reviewDoc.instructorComments}
                auditHistory={auditHistory}
                adminEmail={admin.email}
              />
            </div>
          </aside>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
