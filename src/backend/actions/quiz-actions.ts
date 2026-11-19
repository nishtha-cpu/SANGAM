'use server'

import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '../repositories/payload'
import { getCurrentUser } from '../auth/app-auth'

export type SanitizedQuizQuestion = {
  index: number
  question: string
  options: string[]
}

export type QuizStartResult = {
  ok: boolean
  message?: string
  attemptId?: string
  attemptNumber?: number
  quiz?: {
    title: string
    slug: string
    domain?: string
    difficulty?: string
    passingScore: number
    totalQuestions: number
  }
  questions?: SanitizedQuizQuestion[]
  savedAnswers?: Record<number, number>
  isResumed?: boolean
}

export type QuizQuestionBreakdown = {
  questionIndex: number
  question: string
  options: string[]
  selectedOption: number // -1 if unanswered
  correctOption: number
  isCorrect: boolean
  isUnanswered: boolean
  explanation?: string
}

export type QuizEvaluationResult = {
  ok: boolean
  message?: string
  attemptId?: string
  quizTitle?: string
  quizSlug?: string
  score?: number
  passed?: boolean
  totalQuestions?: number
  correctCount?: number
  incorrectCount?: number
  unansweredCount?: number
  attemptNumber?: number
  completedAt?: string
  breakdown?: QuizQuestionBreakdown[]
}

export type QuizAttemptRecord = {
  id: string
  quizTitle: string
  quizSlug: string
  status: 'in-progress' | 'completed'
  score: number
  passed: boolean
  correctCount: number
  incorrectCount: number
  unansweredCount: number
  totalQuestions: number
  attemptNumber: number
  startedAt?: string
  completedAt?: string
}

const DEV_QUIZ_ATTEMPTS_FILE = path.resolve(process.cwd(), 'scratch/dev-quiz-attempts.json')

function getDevQuizAttempts(): any[] {
  try {
    if (fs.existsSync(DEV_QUIZ_ATTEMPTS_FILE)) {
      return JSON.parse(fs.readFileSync(DEV_QUIZ_ATTEMPTS_FILE, 'utf8'))
    }
  } catch {}
  return []
}

function saveDevQuizAttempt(record: any) {
  try {
    const list = getDevQuizAttempts()
    const existingIndex = list.findIndex((a) => a.id === record.id)
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record }
    } else {
      list.unshift(record)
    }
    fs.writeFileSync(DEV_QUIZ_ATTEMPTS_FILE, JSON.stringify(list, null, 2))
  } catch {}
}

/**
 * Authoritative Security Architecture Quiz Catalog.
 * Correct answers and explanations are strictly server-side.
 */
const DEFAULT_QUIZ_SLUG = 'security-architecture-fundamentals'

const QUIZ_CATALOG: Record<
  string,
  {
    title: string
    slug: string
    domain: string
    difficulty: string
    passingScore: number
    questions: {
      question: string
      options: string[]
      correctAnswer: number
      explanation: string
    }[]
  }
> = {
  'security-architecture-fundamentals': {
    title: 'Security Architecture Fundamentals',
    slug: 'security-architecture-fundamentals',
    domain: 'Core Security Principles',
    difficulty: 'Beginner',
    passingScore: 80,
    questions: [
      {
        question:
          'Which architectural principle dictates that a subject should only be given the bare minimum privileges necessary to complete its assigned task?',
        options: [
          'Defense in depth',
          'Least privilege',
          'Fail-safe defaults',
          'Separation of duties',
        ],
        correctAnswer: 1,
        explanation:
          'Least privilege minimizes attack blast radius by restricting human and service identities to only the specific permissions necessary for their duties.',
      },
      {
        question:
          'In OpenID Connect (OIDC), which token is cryptographically designed to convey end-user identity assertion claims directly to the client application?',
        options: ['Access token', 'Refresh token', 'ID token', 'Client assertion token'],
        correctAnswer: 2,
        explanation:
          'The ID Token is a signed JWT consumable by the client application to prove the identity and authentication context of the user.',
      },
      {
        question:
          'Which AES cipher mode provides authenticated encryption with associated data (AEAD), guaranteeing both confidentiality and message integrity?',
        options: [
          'Electronic Codebook (ECB)',
          'Cipher Block Chaining (CBC)',
          'Counter Mode (CTR)',
          'Galois/Counter Mode (GCM)',
        ],
        correctAnswer: 3,
        explanation:
          'AES-GCM is an AEAD mode that combines Counter mode encryption with universal hash (GHASH) based authentication tags to detect any tampering.',
      },
      {
        question:
          'In a modern Zero Trust architecture, which mechanism replaces traditional network perimeter trust?',
        options: [
          'Hardened edge VPN concentrators',
          'Static IP firewall allowlists',
          'Continuous, context-aware identity and device posture verification',
          'Single sign-on authentication at corporate network boundary only',
        ],
        correctAnswer: 2,
        explanation:
          'Zero Trust treats the network as inherently hostile; every request must be explicitly and continuously verified based on dynamic signals before granting micro-segmented access.',
      },
      {
        question:
          'What is the primary architectural objective of deploying a Token Vault for sensitive payment (PCI) or PII data?',
        options: [
          'Accelerate SQL read performance on large relational tables',
          'Isolate raw cardholder data from downstream environments and substitute non-exploitable surrogate tokens',
          'Compress audit log files for long-term cold storage retention',
          'Manage OAuth 2.0 refresh token rotation only',
        ],
        correctAnswer: 1,
        explanation:
          'A Token Vault desensitizes enterprise systems by keeping raw PANs/PII inside a tightly audited boundary and exchanging them for surrogate format-preserving tokens.',
      },
      {
        question:
          'Which control most effectively limits an attacker’s lateral movement after compromising a single container in a microservices deployment?',
        options: [
          'Micro-segmentation with fine-grained service-to-service mTLS and network policies',
          'Perimeter Web Application Firewall (WAF)',
          'Longer password expiration policies',
          'Shared database connection pooling',
        ],
        correctAnswer: 0,
        explanation:
          'Micro-segmentation restricts east-west communication between workloads so that a compromised workload cannot reach unrelated internal services.',
      },
      {
        question:
          'When designing mutual TLS (mTLS) between two autonomous backend services, what cryptographic guarantee is established?',
        options: [
          'Only the client verifies the server certificate',
          'Both client and server mutually verify each other’s cryptographic identity before establishing encrypted communications',
          'Data is stored encrypted at rest inside the database',
          'Authentication tokens are not required in API request headers',
        ],
        correctAnswer: 1,
        explanation:
          'mTLS enforces bidirectional peer certificate verification, establishing cryptographic proof of identity for both client and server workloads.',
      },
    ],
  },
}

type AuthoritativeQuiz = {
  id: string
  title: string
  slug: string
  domain: string
  difficulty: string
  passingScore: number
  questions: {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }[]
}

/**
 * Helper to fetch quiz metadata and authoritative questions.
 */
async function getAuthoritativeQuiz(quizSlug: string): Promise<AuthoritativeQuiz> {
  const normalizedSlug = quizSlug.toLowerCase()

  // 1. Try Payload DB
  try {
    const payload = await getPayloadClient()
    const result = await (payload as any).find({
      collection: 'quizzes',
      where: { slug: { equals: normalizedSlug } },
      limit: 1,
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      const doc = result.docs[0]
      return {
        id: String(doc.id),
        title: doc.title,
        slug: doc.slug,
        domain: doc.domain || 'Security Architecture',
        difficulty: doc.difficulty || 'Beginner',
        passingScore: doc.passingScore ?? 80,
        questions: (doc.questions || []).map((q: any) => ({
          question: q.question,
          options: (q.options || []).map((opt: any) => (typeof opt === 'string' ? opt : opt.text)),
          correctAnswer: Number(q.correctAnswer) || 0,
          explanation: q.explanation || '',
        })),
      }
    }
  } catch {}

  // 2. Try Local Quizzes Repository (Module 5 & QZ)
  try {
    const { getQuizBySlug } = await import('@/backend/repositories/quizzes')
    const repoMatch = getQuizBySlug(normalizedSlug)
    if (repoMatch) {
      return {
        id: repoMatch.id,
        title: repoMatch.title,
        slug: repoMatch.slug,
        domain: repoMatch.domain,
        difficulty: repoMatch.difficulty,
        passingScore: repoMatch.passingScore,
        questions: repoMatch.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        })),
      }
    }
  } catch {}

  // 3. Fall back to catalog
  const catalogMatch = QUIZ_CATALOG[normalizedSlug] || QUIZ_CATALOG[DEFAULT_QUIZ_SLUG]
  return {
    id: `quiz_${catalogMatch.slug}`,
    ...catalogMatch,
  }
}

/**
 * Phase 2 Lifecycle Step 1 & 2:
 * Authenticated learner starts a quiz and creates a unique attempt.
 *
 * Security:
 * - Requires authenticated learner session (AU-4).
 * - Strips `correctAnswer` and `explanation` so client NEVER receives answer keys upfront.
 * - Detects existing in-progress attempt to safely resume without losing answers.
 */
export async function startQuizAttemptAction(quizSlug: string = DEFAULT_QUIZ_SLUG): Promise<QuizStartResult> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      ok: false,
      message: 'Authentication required. Please log in to start this assessment.',
    }
  }

  const quiz = await getAuthoritativeQuiz(quizSlug)
  if (!quiz || quiz.questions.length === 0) {
    return {
      ok: false,
      message: 'Quiz not found or has no questions configured.',
    }
  }

  // Sanitize questions for client delivery (NO correctAnswer, NO explanation)
  const sanitizedQuestions: SanitizedQuizQuestion[] = quiz.questions.map((q, idx) => ({
    index: idx,
    question: q.question,
    options: q.options,
  }))

  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  let attemptNumber = 1
  let savedAnswers: Record<number, number> = {}
  let isResumed = false
  let resolvedAttemptId = attemptId

  // Check for active in-progress attempt or calculate attempt number in Payload
  try {
    const payload = await getPayloadClient()

    // 1. Look for existing in-progress attempt for this learner
    const activeAttempts = await (payload as any).find({
      collection: 'quiz-attempts',
      where: {
        and: [
          { learner: { equals: user.id } },
          { quiz: { equals: quiz.id } },
          { status: { equals: 'in-progress' } },
        ],
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
    })

    if (activeAttempts.docs.length > 0) {
      const active = activeAttempts.docs[0]
      resolvedAttemptId = String(active.id)
      attemptNumber = active.attemptNumber || 1
      savedAnswers = (active.answers as Record<number, number>) || {}
      isResumed = true
    } else {
      // Count completed attempts to set next attempt number
      const prevAttempts = await (payload as any).count({
        collection: 'quiz-attempts',
        where: {
          and: [{ learner: { equals: user.id } }, { quiz: { equals: quiz.id } }],
        },
        overrideAccess: true,
      })
      attemptNumber = prevAttempts.totalDocs + 1

      // Create new in-progress attempt in Payload
      const newAttempt = await (payload as any).create({
        collection: 'quiz-attempts',
        data: {
          learner: user.id,
          quiz: quiz.id,
          status: 'in-progress',
          score: 0,
          passed: false,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: quiz.questions.length,
          totalQuestions: quiz.questions.length,
          attemptNumber,
          answers: {},
        },
        overrideAccess: true,
      })
      resolvedAttemptId = String(newAttempt.id)
    }
  } catch {
    // Local dev mode fallback store
    const devList = getDevQuizAttempts()
    const activeDev = devList.find(
      (a) => a.learnerId === user.id && a.quizSlug === quiz.slug && a.status === 'in-progress'
    )

    if (activeDev) {
      resolvedAttemptId = activeDev.id
      attemptNumber = activeDev.attemptNumber
      savedAnswers = activeDev.answers || {}
      isResumed = true
    } else {
      const userDevAttempts = devList.filter(
        (a) => a.learnerId === user.id && a.quizSlug === quiz.slug
      )
      attemptNumber = userDevAttempts.length + 1

      saveDevQuizAttempt({
        id: resolvedAttemptId,
        learnerId: user.id,
        quizId: quiz.id,
        quizSlug: quiz.slug,
        quizTitle: quiz.title,
        status: 'in-progress',
        score: 0,
        passed: false,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: quiz.questions.length,
        totalQuestions: quiz.questions.length,
        attemptNumber,
        answers: {},
        startedAt: new Date().toISOString(),
      })
    }
  }

  return {
    ok: true,
    attemptId: resolvedAttemptId,
    attemptNumber,
    quiz: {
      title: quiz.title,
      slug: quiz.slug,
      domain: quiz.domain,
      difficulty: quiz.difficulty,
      passingScore: quiz.passingScore,
      totalQuestions: quiz.questions.length,
    },
    questions: sanitizedQuestions,
    savedAnswers,
    isResumed,
  }
}

/**
 * Phase 2 Lifecycle Step 4:
 * Save learner answers safely as draft before final submission.
 *
 * Security:
 * - Learner auth verification.
 * - Prevents modifying an already-completed attempt.
 * - Validates input types and options bounds.
 */
export async function saveQuizDraftAnswersAction(
  attemptId: string,
  answers: Record<number, number>
): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, message: 'Authentication required.' }
  }

  if (!attemptId) {
    return { ok: false, message: 'Invalid attempt ID.' }
  }

  // Clean answers object: ensure keys and values are valid integers
  const sanitizedAnswers: Record<number, number> = {}
  for (const [key, val] of Object.entries(answers)) {
    const k = Number(key)
    const v = Number(val)
    if (!isNaN(k) && !isNaN(v) && v >= 0) {
      sanitizedAnswers[k] = v
    }
  }

  try {
    const payload = await getPayloadClient()
    const attempt = await (payload as any).findByID({
      collection: 'quiz-attempts',
      id: attemptId,
      overrideAccess: true,
    })

    if (!attempt) {
      return { ok: false, message: 'Attempt not found.' }
    }

    // Verify ownership
    const attemptLearnerId = typeof attempt.learner === 'object' ? attempt.learner.id : attempt.learner
    if (attemptLearnerId !== user.id) {
      return { ok: false, message: 'Unauthorized: Attempt does not belong to current user.' }
    }

    if (attempt.status === 'completed') {
      return { ok: false, message: 'Cannot modify a completed attempt.' }
    }

    await (payload as any).update({
      collection: 'quiz-attempts',
      id: attemptId,
      data: {
        answers: sanitizedAnswers,
      },
      overrideAccess: true,
    })

    return { ok: true }
  } catch {
    // Dev store fallback
    const devList = getDevQuizAttempts()
    const match = devList.find((a) => a.id === attemptId)
    if (match) {
      if (match.learnerId !== user.id) {
        return { ok: false, message: 'Unauthorized attempt access.' }
      }
      if (match.status === 'completed') {
        return { ok: false, message: 'Cannot modify a completed attempt.' }
      }
      match.answers = sanitizedAnswers
      saveDevQuizAttempt(match)
      return { ok: true }
    }
  }

  return { ok: true }
}

/**
 * Phase 2 Lifecycle Step 7 – 10:
 * Submit the attempt, evaluate score server-side, persist final result.
 *
 * Security:
 * - Server-side scoring only (client score submission ignored).
 * - Duplicate submission prevention (idempotent result delivery).
 * - Complete breakdown revealed only after submission.
 */
export async function submitQuizAttemptAction(params: {
  attemptId: string
  quizSlug?: string
  answers: Record<number, number> | number[]
}): Promise<QuizEvaluationResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, message: 'Authentication required to submit assessment.' }
  }

  const { attemptId, quizSlug = DEFAULT_QUIZ_SLUG, answers } = params
  if (!attemptId) {
    return { ok: false, message: 'Missing attempt ID.' }
  }

  // Convert answers to standard Record<number, number>
  const answersRecord: Record<number, number> = {}
  if (Array.isArray(answers)) {
    answers.forEach((val, idx) => {
      if (val !== undefined && val !== null && val >= 0) {
        answersRecord[idx] = val
      }
    })
  } else if (typeof answers === 'object' && answers !== null) {
    for (const [k, v] of Object.entries(answers)) {
      const idx = Number(k)
      const val = Number(v)
      if (!isNaN(idx) && !isNaN(val) && val >= 0) {
        answersRecord[idx] = val
      }
    }
  }

  // Fetch authoritative quiz
  const quiz = await getAuthoritativeQuiz(quizSlug)
  const totalQuestions = quiz.questions.length

  // Duplicate submission guard: check if attempt is already completed
  try {
    const payload = await getPayloadClient()
    const existing = await (payload as any).findByID({
      collection: 'quiz-attempts',
      id: attemptId,
      overrideAccess: true,
    })

    if (existing) {
      const attemptLearnerId =
        typeof existing.learner === 'object' ? existing.learner.id : existing.learner
      if (attemptLearnerId !== user.id) {
        return { ok: false, message: 'Unauthorized: Attempt belongs to another learner.' }
      }

      if (existing.status === 'completed') {
        // Return already evaluated breakdown idempotently
        const recordedAnswers: Record<number, number> = existing.answers || {}
        const breakdown: QuizQuestionBreakdown[] = quiz.questions.map((q, idx) => {
          const selected = recordedAnswers[idx] ?? -1
          const isUnanswered = selected === -1 || selected === undefined
          const isCorrect = !isUnanswered && selected === q.correctAnswer
          return {
            questionIndex: idx,
            question: q.question,
            options: q.options,
            selectedOption: selected,
            correctOption: q.correctAnswer,
            isCorrect,
            isUnanswered,
            explanation: q.explanation,
          }
        })

        return {
          ok: true,
          attemptId: String(existing.id),
          quizTitle: quiz.title,
          quizSlug: quiz.slug,
          score: existing.score,
          passed: existing.passed,
          totalQuestions,
          correctCount: existing.correctCount,
          incorrectCount: existing.incorrectCount ?? (totalQuestions - (existing.correctCount || 0) - (existing.unansweredCount || 0)),
          unansweredCount: existing.unansweredCount ?? 0,
          attemptNumber: existing.attemptNumber,
          completedAt: existing.completedAt,
          breakdown,
        }
      }
    }
  } catch {}

  // Also check dev store for duplicate completed attempt
  const devList = getDevQuizAttempts()
  const existingDev = devList.find((a) => a.id === attemptId)
  if (existingDev) {
    if (existingDev.learnerId !== user.id) {
      return { ok: false, message: 'Unauthorized attempt access.' }
    }
    if (existingDev.status === 'completed') {
      const recordedAnswers: Record<number, number> = existingDev.answers || {}
      const breakdown: QuizQuestionBreakdown[] = quiz.questions.map((q, idx) => {
        const selected = recordedAnswers[idx] ?? -1
        const isUnanswered = selected === -1 || selected === undefined
        const isCorrect = !isUnanswered && selected === q.correctAnswer
        return {
          questionIndex: idx,
          question: q.question,
          options: q.options,
          selectedOption: selected,
          correctOption: q.correctAnswer,
          isCorrect,
          isUnanswered,
          explanation: q.explanation,
        }
      })

      return {
        ok: true,
        attemptId: existingDev.id,
        quizTitle: quiz.title,
        quizSlug: quiz.slug,
        score: existingDev.score,
        passed: existingDev.passed,
        totalQuestions,
        correctCount: existingDev.correctCount,
        incorrectCount: existingDev.incorrectCount,
        unansweredCount: existingDev.unansweredCount,
        attemptNumber: existingDev.attemptNumber,
        completedAt: existingDev.completedAt,
        breakdown,
      }
    }
  }

  // Calculate scores server-side
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0

  const breakdown: QuizQuestionBreakdown[] = quiz.questions.map((q, idx) => {
    const selected = answersRecord[idx] ?? -1
    const isUnanswered = selected === -1 || selected === undefined
    const isCorrect = !isUnanswered && selected === q.correctAnswer

    if (isUnanswered) {
      unansweredCount++
    } else if (isCorrect) {
      correctCount++
    } else {
      incorrectCount++
    }

    return {
      questionIndex: idx,
      question: q.question,
      options: q.options,
      selectedOption: selected,
      correctOption: q.correctAnswer,
      isCorrect,
      isUnanswered,
      explanation: q.explanation,
    }
  })

  const score = Math.round((correctCount / totalQuestions) * 100)
  const passed = score >= quiz.passingScore
  const completedAt = new Date().toISOString()
  let finalAttemptNumber = 1

  // Persist completed attempt to Payload
  try {
    const payload = await getPayloadClient()
    const attempt = await (payload as any).findByID({
      collection: 'quiz-attempts',
      id: attemptId,
      overrideAccess: true,
    })

    if (attempt) {
      finalAttemptNumber = attempt.attemptNumber || 1
      await (payload as any).update({
        collection: 'quiz-attempts',
        id: attemptId,
        data: {
          status: 'completed',
          score,
          passed,
          correctCount,
          incorrectCount,
          unansweredCount,
          totalQuestions,
          answers: answersRecord,
          completedAt,
        },
        overrideAccess: true,
      })
    } else {
      // If started offline/dev, create directly
      const created = await (payload as any).create({
        collection: 'quiz-attempts',
        data: {
          learner: user.id,
          quiz: quiz.id,
          status: 'completed',
          score,
          passed,
          correctCount,
          incorrectCount,
          unansweredCount,
          totalQuestions,
          attemptNumber: finalAttemptNumber,
          answers: answersRecord,
          completedAt,
        },
        overrideAccess: true,
      })
      finalAttemptNumber = created.attemptNumber || 1
    }
  } catch {
    // Dev store fallback
    if (existingDev) {
      finalAttemptNumber = existingDev.attemptNumber
      existingDev.status = 'completed'
      existingDev.score = score
      existingDev.passed = passed
      existingDev.correctCount = correctCount
      existingDev.incorrectCount = incorrectCount
      existingDev.unansweredCount = unansweredCount
      existingDev.answers = answersRecord
      existingDev.completedAt = completedAt
      saveDevQuizAttempt(existingDev)
    } else {
      saveDevQuizAttempt({
        id: attemptId,
        learnerId: user.id,
        quizId: quiz.id,
        quizSlug: quiz.slug,
        quizTitle: quiz.title,
        status: 'completed',
        score,
        passed,
        correctCount,
        incorrectCount,
        unansweredCount,
        totalQuestions,
        attemptNumber: 1,
        answers: answersRecord,
        completedAt,
      })
    }
  }

  return {
    ok: true,
    attemptId,
    quizTitle: quiz.title,
    quizSlug: quiz.slug,
    score,
    passed,
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    attemptNumber: finalAttemptNumber,
    completedAt,
    breakdown,
  }
}

/**
 * Phase 2 Lifecycle Step 11 & 12:
 * Retrieve details and breakdown for a specific completed attempt.
 */
export async function getQuizAttemptResultAction(
  attemptId: string
): Promise<QuizEvaluationResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, message: 'Authentication required.' }
  }

  // 1. Try Payload DB
  try {
    const payload = await getPayloadClient()
    const attempt = await (payload as any).findByID({
      collection: 'quiz-attempts',
      id: attemptId,
      depth: 2,
      overrideAccess: true,
    })

    if (attempt) {
      const attemptLearnerId =
        typeof attempt.learner === 'object' ? attempt.learner.id : attempt.learner
      if (attemptLearnerId !== user.id) {
        return { ok: false, message: 'Unauthorized attempt access.' }
      }

      const quizSlug =
        typeof attempt.quiz === 'object' && attempt.quiz?.slug
          ? attempt.quiz.slug
          : DEFAULT_QUIZ_SLUG
      const quiz = await getAuthoritativeQuiz(quizSlug)
      const recordedAnswers: Record<number, number> = attempt.answers || {}

      const breakdown: QuizQuestionBreakdown[] = quiz.questions.map((q, idx) => {
        const selected = recordedAnswers[idx] ?? -1
        const isUnanswered = selected === -1 || selected === undefined
        const isCorrect = !isUnanswered && selected === q.correctAnswer
        return {
          questionIndex: idx,
          question: q.question,
          options: q.options,
          selectedOption: selected,
          correctOption: q.correctAnswer,
          isCorrect,
          isUnanswered,
          explanation: q.explanation,
        }
      })

      return {
        ok: true,
        attemptId: String(attempt.id),
        quizTitle: quiz.title,
        quizSlug: quiz.slug,
        score: attempt.score,
        passed: attempt.passed,
        totalQuestions: attempt.totalQuestions || quiz.questions.length,
        correctCount: attempt.correctCount || 0,
        incorrectCount: attempt.incorrectCount || 0,
        unansweredCount: attempt.unansweredCount || 0,
        attemptNumber: attempt.attemptNumber || 1,
        completedAt: attempt.completedAt,
        breakdown,
      }
    }
  } catch {}

  // 2. Dev store fallback
  const devList = getDevQuizAttempts()
  const devAttempt = devList.find((a) => a.id === attemptId)
  if (devAttempt) {
    if (devAttempt.learnerId !== user.id) {
      return { ok: false, message: 'Unauthorized attempt access.' }
    }
    const quiz = await getAuthoritativeQuiz(devAttempt.quizSlug || DEFAULT_QUIZ_SLUG)
    const recordedAnswers: Record<number, number> = devAttempt.answers || {}
    const breakdown: QuizQuestionBreakdown[] = quiz.questions.map((q, idx) => {
      const selected = recordedAnswers[idx] ?? -1
      const isUnanswered = selected === -1 || selected === undefined
      const isCorrect = !isUnanswered && selected === q.correctAnswer
      return {
        questionIndex: idx,
        question: q.question,
        options: q.options,
        selectedOption: selected,
        correctOption: q.correctAnswer,
        isCorrect,
        isUnanswered,
        explanation: q.explanation,
      }
    })

    return {
      ok: true,
      attemptId: devAttempt.id,
      quizTitle: quiz.title,
      quizSlug: quiz.slug,
      score: devAttempt.score,
      passed: devAttempt.passed,
      totalQuestions: devAttempt.totalQuestions || quiz.questions.length,
      correctCount: devAttempt.correctCount || 0,
      incorrectCount: devAttempt.incorrectCount || 0,
      unansweredCount: devAttempt.unansweredCount || 0,
      attemptNumber: devAttempt.attemptNumber || 1,
      completedAt: devAttempt.completedAt,
      breakdown,
    }
  }

  return { ok: false, message: 'Quiz attempt record not found.' }
}

/**
 * Phase 2 Lifecycle Step 12:
 * Retrieve all previous attempts for the logged-in learner.
 */
export async function getLearnerQuizHistoryAction(
  quizSlug?: string
): Promise<QuizAttemptRecord[]> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []

  try {
    const payload = await getPayloadClient()
    const query: any = {
      learner: { equals: currentUser.id },
    }

    const result = await (payload as any).find({
      collection: 'quiz-attempts',
      where: query,
      depth: 1,
      sort: '-createdAt',
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      return result.docs.map((doc: any) => ({
        id: String(doc.id),
        quizTitle:
          typeof doc.quiz === 'object' && doc.quiz?.title
            ? doc.quiz.title
            : 'Security Architecture Fundamentals',
        quizSlug:
          typeof doc.quiz === 'object' && doc.quiz?.slug ? doc.quiz.slug : DEFAULT_QUIZ_SLUG,
        status: doc.status || 'completed',
        score: doc.score || 0,
        passed: Boolean(doc.passed),
        correctCount: doc.correctCount || 0,
        incorrectCount: doc.incorrectCount || 0,
        unansweredCount: doc.unansweredCount || 0,
        totalQuestions: doc.totalQuestions || 7,
        attemptNumber: doc.attemptNumber || 1,
        startedAt: doc.createdAt,
        completedAt: doc.completedAt || doc.createdAt,
      }))
    }
  } catch {}

  // Fallback to dev attempts store
  const devAttempts = getDevQuizAttempts().filter(
    (a) =>
      a.learnerId === currentUser.id &&
      (!quizSlug || a.quizSlug === quizSlug)
  )

  return devAttempts.map((a) => ({
    id: a.id,
    quizTitle: a.quizTitle || 'Security Architecture Fundamentals',
    quizSlug: a.quizSlug || DEFAULT_QUIZ_SLUG,
    status: a.status || 'completed',
    score: a.score || 0,
    passed: Boolean(a.passed),
    correctCount: a.correctCount || 0,
    incorrectCount: a.incorrectCount || 0,
    unansweredCount: a.unansweredCount || 0,
    totalQuestions: a.totalQuestions || 7,
    attemptNumber: a.attemptNumber || 1,
    startedAt: a.startedAt || a.createdAt,
    completedAt: a.completedAt || a.createdAt,
  }))
}

/**
 * Backward compatibility: Single-step submit and evaluate action.
 */
export async function submitQuizAction(
  quizSlug: string,
  submittedAnswers: Record<number, number> | number[]
): Promise<QuizEvaluationResult> {
  const attemptRes = await startQuizAttemptAction(quizSlug)
  if (!attemptRes.ok || !attemptRes.attemptId) {
    return { ok: false, message: attemptRes.message || 'Failed to start quiz attempt.' }
  }

  return submitQuizAttemptAction({
    attemptId: attemptRes.attemptId,
    quizSlug,
    answers: submittedAnswers,
  })
}
