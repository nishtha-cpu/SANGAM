'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { getAdminUser } from '@admin-panel/auth/admin-auth'
import { revalidatePath } from 'next/cache'

export type ReviewStatus = 'submitted' | 'in-review' | 'reviewed' | 'flagged'

export interface EvaluateReviewParams {
  reviewId: string | number
  status: ReviewStatus
  score?: number | null
  instructorComments?: string
}

export interface ReviewActionResult {
  ok: boolean
  message: string
}

/**
 * Server action to evaluate and grade a student review submission.
 *
 * Security Requirements:
 * - Requires authenticated administrator via getAdminUser().
 * - Rejects any learner or unauthenticated requests.
 * - Records every change in auditHistory with timestamp and admin email.
 * - Updates status, score, and instructor comments.
 */
export async function evaluateReviewAction(
  params: EvaluateReviewParams
): Promise<ReviewActionResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return {
      ok: false,
      message: 'Unauthorized: Administrator authentication required.',
    }
  }

  const { reviewId, status, score, instructorComments } = params

  if (!reviewId) {
    return { ok: false, message: 'Review ID is required.' }
  }

  const validStatuses: ReviewStatus[] = ['submitted', 'in-review', 'reviewed', 'flagged']
  if (!validStatuses.includes(status)) {
    return { ok: false, message: 'Invalid review status.' }
  }

  if (score !== undefined && score !== null) {
    if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
      return { ok: false, message: 'Score must be a number between 0 and 100.' }
    }
  }

  try {
    const payload = await getPayload({ config })

    // Find the existing review to inspect current status and auditHistory
    const existing = await payload.findByID({
      collection: 'reviews',
      id: String(reviewId),
      overrideAccess: true,
    })

    if (!existing) {
      return { ok: false, message: 'Review submission not found.' }
    }

    const previousAudit = Array.isArray(existing.auditHistory) ? existing.auditHistory : []

    // Construct clear audit action description
    const actionParts: string[] = []
    if (existing.status !== status) {
      actionParts.push(`Status changed from "${existing.status}" to "${status}"`)
    } else {
      actionParts.push(`Status confirmed as "${status}"`)
    }

    if (score !== undefined && score !== null) {
      actionParts.push(`Score set to ${score}/100`)
    }

    if (instructorComments !== undefined) {
      actionParts.push('Instructor comments updated')
    }

    const newAuditEntry = {
      timestamp: new Date().toISOString(),
      action: actionParts.join(' | ') + ` by ${admin.email}`,
      actor: admin.email,
    }

    const updateData: Record<string, any> = {
      status,
      auditHistory: [...previousAudit, newAuditEntry],
    }

    if (score !== undefined) {
      updateData.score = score
    }

    if (instructorComments !== undefined) {
      updateData.instructorComments = instructorComments
    }

    await payload.update({
      collection: 'reviews',
      id: String(reviewId),
      data: updateData,
      overrideAccess: true,
    })

    revalidatePath('/admin-dashboard/reviews')
    revalidatePath(`/admin-dashboard/reviews/${reviewId}`)
    revalidatePath('/admin-dashboard')

    return {
      ok: true,
      message: `Review successfully updated to ${status}.`,
    }
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[review-actions] Failed to update review:', err)
    }

    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : 'Failed to update review submission. Please ensure the database is reachable.',
    }
  }
}

/**
 * Quick action to advance status (e.g. from submitted to in-review).
 */
export async function moveReviewStatusAction(
  reviewId: string | number,
  status: ReviewStatus
): Promise<ReviewActionResult> {
  return evaluateReviewAction({ reviewId, status })
}
