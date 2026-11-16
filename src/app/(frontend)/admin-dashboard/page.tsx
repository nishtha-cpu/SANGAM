import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getAdminUser } from '@admin-panel/auth/admin-auth'
import { getCurrentUser } from '@backend/auth/app-auth'
import {
  AdminDashboardView,
  type RecentReview,
  type RecentLearner,
} from '@admin-panel/dashboard/AdminDashboardView'

export const metadata = {
  title: 'Administrator Console | SANGAM Security Operations',
  description: 'Manage curriculum, monitor learner progress, and review submitted architecture designs.',
}

export default async function AdminDashboardPage() {
  // 1. Strict Server-Side Authentication & Authorization Guard
  const admin = await getAdminUser()

  if (!admin) {
    const learner = await getCurrentUser()
    if (learner) {
      // Authenticated learner detected — deny access explicitly
      redirect('/admin-login?error=learner_denied')
    }
    // Unauthenticated visitor — redirect to admin login
    redirect('/admin-login?next=/admin-dashboard')
  }

  // 2. Fetch Real Payload Telemetry & Collection Counts
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

  let recentReviews: RecentReview[] = []
  let recentLearners: RecentLearner[] = []

  try {
    const payload = await getPayload({ config })

    const [
      learnersCount,
      activeCount,
      classesCount,
      caseStudiesCount,
      quizzesCount,
      patternsCount,
      pendingReviewsCount,
      ordersCount,
      reviewsResult,
      learnersResult,
    ] = await Promise.all([
      payload.count({ collection: 'users', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload
        .count({
          collection: 'users',
          where: { termsAcceptedAt: { exists: true } },
          overrideAccess: true,
        })
        .catch(() => ({ totalDocs: 0 })),
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
      payload.count({ collection: 'orders', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload
        .find({
          collection: 'reviews',
          limit: 5,
          sort: '-createdAt',
          overrideAccess: true,
        })
        .catch(() => ({ docs: [] })),
      payload
        .find({
          collection: 'users',
          limit: 5,
          sort: '-createdAt',
          overrideAccess: true,
        })
        .catch(() => ({ docs: [] })),
    ])

    counts.learners = learnersCount.totalDocs
    counts.activeLearners = activeCount.totalDocs
    counts.classes = classesCount.totalDocs
    counts.caseStudies = caseStudiesCount.totalDocs
    counts.quizzes = quizzesCount.totalDocs
    counts.patterns = patternsCount.totalDocs
    counts.pendingReviews = pendingReviewsCount.totalDocs
    counts.orders = ordersCount.totalDocs

    recentReviews = (reviewsResult.docs || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title || 'Architecture Review Submission',
      status: doc.status || 'submitted',
      createdAt: doc.createdAt,
      score: doc.score,
    }))

    recentLearners = (learnersResult.docs || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name || 'Anonymous Learner',
      email: doc.email,
      createdAt: doc.createdAt,
    }))

    telemetryAvailable = true
  } catch {
    // Database unreachable in standalone shell without FIGMA_EID.
    // Telemetry remains 0 and clear empty states will be rendered.
    telemetryAvailable = false
  }

  return (
    <AdminDashboardView
      admin={admin}
      telemetryAvailable={telemetryAvailable}
      counts={counts}
      recentReviews={recentReviews}
      recentLearners={recentLearners}
    />
  )
}
