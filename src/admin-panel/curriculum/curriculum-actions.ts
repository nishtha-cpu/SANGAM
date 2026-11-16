'use server'

import { getPayloadClient } from '@/backend/repositories/payload'
import { getAdminUser } from '@/admin-panel/auth/admin-auth'

export type AdminClassItem = {
  id: string
  title: string
  slug: string
  instructor: string
  duration: string
  section?: string
  status?: string
  isPremium?: boolean
  videoUrl?: string
  description?: string
  updatedAt?: string
}

export type AdminQuizItem = {
  id: string
  title: string
  slug: string
  domain?: string
  difficulty?: string
  passingScore: number
  questionCount: number
  published?: boolean
  updatedAt?: string
}

/**
 * Server Action: Retrieve all curriculum classes for administrator management (AD-1, AD-2).
 */
export async function getAdminClassesAction(): Promise<AdminClassItem[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  try {
    const payload = await getPayloadClient()
    const result = await (payload as any).find({
      collection: 'classes',
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      return result.docs.map((doc: any) => ({
        id: String(doc.id),
        title: doc.title,
        slug: doc.slug,
        instructor: doc.instructor,
        duration: doc.duration,
        section: doc.section || 'General Architecture',
        status: doc.status || 'ready',
        isPremium: Boolean(doc.isPremium),
        videoUrl: doc.videoUrl,
        description: doc.description,
        updatedAt: doc.updatedAt,
      }))
    }
  } catch {}

  // Starter catalog fallback
  return [
    {
      id: 'cls_zero_trust',
      title: 'Zero Trust Architecture in Practice',
      slug: 'zero-trust',
      instructor: 'Dr. Maya Chen',
      duration: '52 minutes',
      section: 'Identity & Access Architecture',
      status: 'ready',
      isPremium: true,
      description: 'Continuous verification, micro-segmentation, and policy enforcement points.',
    },
    {
      id: 'cls_cloud_landing',
      title: 'Designing Secure Cloud Landing Zones',
      slug: 'cloud-landing-zones',
      instructor: 'Marcus Lee',
      duration: '1h 06 min',
      section: 'Cloud Security Architecture',
      status: 'ready',
      isPremium: false,
      description: 'Build secure cloud foundations with policy, logging, and automated guardrails.',
    },
  ]
}

/**
 * Server Action: Create or update a video class (AD-1, AD-2, AD-4, AD-5).
 */
export async function createOrUpdateClassAction(params: {
  id?: string
  title: string
  slug: string
  instructor: string
  duration: string
  section?: string
  description?: string
  videoUrl?: string
  isPremium?: boolean
}): Promise<{ ok: boolean; message?: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized: Administrator access required.' }
  }

  const { id, title, slug, instructor, duration, section, description, videoUrl, isPremium } = params

  if (!title || !slug || !instructor) {
    return { ok: false, message: 'Title, slug, and instructor are required fields.' }
  }

  try {
    const payload = await getPayloadClient()
    if (id && !id.startsWith('cls_')) {
      await (payload as any).update({
        collection: 'classes',
        id,
        data: {
          title,
          slug,
          instructor,
          duration,
          section,
          description,
          videoUrl,
          isPremium: Boolean(isPremium),
        },
        overrideAccess: true,
      })
    } else {
      await (payload as any).create({
        collection: 'classes',
        data: {
          title,
          slug,
          instructor,
          duration: duration || '45 minutes',
          section: section || 'Security Architecture',
          description,
          videoUrl,
          isPremium: Boolean(isPremium),
          status: 'ready',
          published: true,
        },
        overrideAccess: true,
      })
    }
    return { ok: true, message: 'Class saved successfully.' }
  } catch (err: any) {
    return { ok: false, message: err.message || 'Failed to save class.' }
  }
}

/**
 * Server Action: Delete a video class (AD-1).
 */
export async function deleteClassAction(classId: string): Promise<{ ok: boolean; message?: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized.' }
  }

  try {
    const payload = await getPayloadClient()
    await (payload as any).delete({
      collection: 'classes',
      id: classId,
      overrideAccess: true,
    })
    return { ok: true, message: 'Class deleted successfully.' }
  } catch (err: any) {
    return { ok: false, message: err.message || 'Failed to delete class.' }
  }
}

/**
 * Server Action: Retrieve all quizzes for admin management (AD-13, QZ-1).
 */
export async function getAdminQuizzesAction(): Promise<AdminQuizItem[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  try {
    const payload = await getPayloadClient()
    const result = await (payload as any).find({
      collection: 'quizzes',
      limit: 50,
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      return result.docs.map((doc: any) => ({
        id: String(doc.id),
        title: doc.title,
        slug: doc.slug,
        domain: doc.domain || 'Security Architecture',
        difficulty: doc.difficulty || 'Beginner',
        passingScore: doc.passingScore || 80,
        questionCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
        published: Boolean(doc.published),
        updatedAt: doc.updatedAt,
      }))
    }
  } catch {}

  return [
    {
      id: 'quiz_sec_fund',
      title: 'Security Architecture Fundamentals',
      slug: 'security-architecture-fundamentals',
      domain: 'Core Principles',
      difficulty: 'Beginner',
      passingScore: 80,
      questionCount: 7,
      published: true,
    },
  ]
}

/**
 * Server Action: Create a new quiz assessment with questions (AD-13, QZ-1, QZ-2, QZ-5).
 */
export async function createQuizAssessmentAction(params: {
  title: string
  slug: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  passingScore: number
  questions: {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }[]
}): Promise<{ ok: boolean; message?: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized.' }
  }

  const { title, slug, domain, difficulty, passingScore, questions } = params

  if (!title || !slug || !questions || questions.length === 0) {
    return { ok: false, message: 'Title, slug, and at least one question are required.' }
  }

  try {
    const payload = await getPayloadClient()
    await (payload as any).create({
      collection: 'quizzes',
      data: {
        title,
        slug,
        domain,
        difficulty,
        passingScore: passingScore || 80,
        published: true,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options.map((opt) => ({ text: opt })),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        })),
      },
      overrideAccess: true,
    })

    return { ok: true, message: 'Quiz created successfully.' }
  } catch (err: any) {
    return { ok: false, message: err.message || 'Failed to create quiz.' }
  }
}
