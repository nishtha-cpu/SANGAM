import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getAdminUser } from '@admin-panel/auth/admin-auth'
import { getCurrentUser } from '@backend/auth/app-auth'
import { AdminDashboardLayout } from '@admin-panel/dashboard/AdminDashboardLayout'
import { ReviewsListClient, type ReviewRow } from '@admin-panel/reviews/ReviewsListClient'

export const metadata = {
  title: 'Student Review Submissions | SANGAM Admin',
  description: 'Evaluate student architecture reviews, assign scores, and provide feedback.',
}

export default async function ReviewsManagementPage() {
  // 1. Strict Server-Side Authentication & Authorization Guard
  const admin = await getAdminUser()
  if (!admin) {
    const learner = await getCurrentUser()
    if (learner) {
      redirect('/admin-login?error=learner_denied')
    }
    redirect('/admin-login?next=/admin-dashboard/reviews')
  }

  // 2. Fetch Review Submissions & Sidebar Counts
  let telemetryAvailable = false
  let reviews: ReviewRow[] = []

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
      reviewsResult,
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
      payload.find({
        collection: 'reviews',
        depth: 2,
        sort: '-createdAt',
        overrideAccess: true,
      }),
    ])

    counts.learners = learnersCount.totalDocs
    counts.classes = classesCount.totalDocs
    counts.caseStudies = caseStudiesCount.totalDocs
    counts.quizzes = quizzesCount.totalDocs
    counts.patterns = patternsCount.totalDocs
    counts.pendingReviews = pendingCount.totalDocs

    reviews = (reviewsResult.docs || []).map((doc: any) => {
      // Extract learner name and email safely
      let learnerName = 'Anonymous Learner'
      let learnerEmail = 'Unspecified'
      if (doc.learner && typeof doc.learner === 'object') {
        learnerName = doc.learner.name || doc.learner.email || learnerName
        learnerEmail = doc.learner.email || learnerEmail
      }

      // Extract case study title
      let caseStudyTitle: string | null = null
      if (doc.caseStudy && typeof doc.caseStudy === 'object') {
        caseStudyTitle = doc.caseStudy.title || null
      }

      // Check patterns count
      const patternsCount = Array.isArray(doc.selectedPatterns) ? doc.selectedPatterns.length : 0

      // Check if diagramData has contents
      const hasDiagram = Boolean(
        doc.diagramData &&
          (Array.isArray(doc.diagramData.nodes)
            ? doc.diagramData.nodes.length > 0
            : Object.keys(doc.diagramData).length > 0)
      )

      return {
        id: doc.id,
        title: doc.title || 'Architecture Design Review',
        status: doc.status || 'submitted',
        score: doc.score,
        learnerName,
        learnerEmail,
        caseStudyTitle,
        patternsCount,
        hasDiagram,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }
    })

    telemetryAvailable = true
  } catch {
    telemetryAvailable = false
  }

  return (
    <AdminDashboardLayout
      admin={admin}
      telemetryAvailable={telemetryAvailable}
      counts={counts}
    >
      <ReviewsListClient
        initialReviews={reviews}
        telemetryAvailable={telemetryAvailable}
      />
    </AdminDashboardLayout>
  )
}
