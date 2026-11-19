'use server'

import {
  getAllCourses,
  getCourseBySlug,
  type CourseItem,
  type CourseLesson,
} from '../repositories/courses'
import { getCurrentUser } from '../auth/app-auth'

export interface LessonAccessResult {
  allowed: boolean
  isTrial: boolean
  isLocked: boolean
  reason?: 'trial_allowed' | 'enrollment_allowed' | 'login_required' | 'purchase_required' | 'not_found'
  videoUrl?: string
  lastPositionSeconds?: number
}

/**
 * Public action: Retrieve all published courses for exploration (Module 4, Module 6).
 */
export async function getPublicCoursesAction(): Promise<CourseItem[]> {
  const all = getAllCourses()
  return all.filter((c) => c.published)
}

/**
 * Public action: Retrieve details for a specific course by slug.
 */
export async function getCourseDetailsAction(slug: string): Promise<CourseItem | null> {
  const course = getCourseBySlug(slug)
  if (!course || !course.published) return null
  return course
}

/**
 * Server Action: Validate lesson access rules (Module 6).
 * Invariant: Exactly one trial video is publicly playable without purchase.
 * All remaining lessons require verified paid enrollment.
 */
export async function getLessonPlaybackAccessAction(params: {
  courseSlug: string
  lessonId: string
}): Promise<LessonAccessResult> {
  const { courseSlug, lessonId } = params
  const course = getCourseBySlug(courseSlug)

  if (!course) {
    return {
      allowed: false,
      isTrial: false,
      isLocked: true,
      reason: 'not_found',
    }
  }

  const lesson = course.lessons.find((l) => l.id === lessonId)
  if (!lesson) {
    return {
      allowed: false,
      isTrial: false,
      isLocked: true,
      reason: 'not_found',
    }
  }

  // RULE 1: If marked as the free trial video, grant public access immediately
  if (lesson.isTrial) {
    return {
      allowed: true,
      isTrial: true,
      isLocked: false,
      reason: 'trial_allowed',
      videoUrl: lesson.videoUrl,
    }
  }

  // RULE 2: Premium lessons require an authenticated user with verified paid enrollment
  const user = await getCurrentUser()
  if (!user) {
    return {
      allowed: false,
      isTrial: false,
      isLocked: true,
      reason: 'login_required',
    }
  }

  // Check user subscription status / package ownership
  const hasAccess =
    (user as any).package &&
    (user as any).package !== 'none' &&
    ((user as any).subscriptionStatus === 'active' || !(user as any).subscriptionStatus)

  if (hasAccess) {
    return {
      allowed: true,
      isTrial: false,
      isLocked: false,
      reason: 'enrollment_allowed',
      videoUrl: lesson.videoUrl,
    }
  }

  return {
    allowed: false,
    isTrial: false,
    isLocked: true,
    reason: 'purchase_required',
  }
}
