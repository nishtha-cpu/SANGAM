'use server'

import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '../repositories/payload'
import { getCurrentUser } from '../auth/app-auth'

export type QuizEvaluationResult = {
  ok: boolean
  message?: string
  quizTitle?: string
  score?: number
  passed?: boolean
  totalQuestions?: number
  correctCount?: number
  attemptNumber?: number
  breakdown?: {
    question: string
    options: string[]
    selected: number
    correct: number
    isCorrect: boolean
    explanation?: string
  }[]
}

export type QuizAttemptRecord = {
  id: string
  quizTitle: string
  quizSlug: string
  score: number
  passed: boolean
  correctCount: number
  totalQuestions: number
  attemptNumber: number
  completedAt: string
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
    list.unshift(record)
    fs.writeFileSync(DEV_QUIZ_ATTEMPTS_FILE, JSON.stringify(list, null, 2))
  } catch {}
}

/**
 * Fallback questions if database has not yet been seeded with quiz documents.
 * Kept server-side so answer keys are never delivered to the client upfront.
 */
const fallbackQuizData = {
  title: 'Security Architecture Fundamentals',
  passingScore: 80,
  questions: [
    {
      question:
        'Which principle states that a user should only have the minimum access needed to perform their job?',
      options: [
        'Defense in depth',
        'Least privilege',
        'Fail-safe defaults',
        'Separation of duties',
      ],
      correctAnswer: 1,
      explanation:
        'Least privilege limits users and processes to only the access required to conduct their tasks.',
    },
    {
      question:
        'In OIDC, which token is primarily used to prove the identity of the end user to the client application?',
      options: ['Access token', 'Refresh token', 'ID token', 'Client secret'],
      correctAnswer: 2,
      explanation:
        'The ID Token is a signed JWT intended for the client to authenticate the end user.',
    },
    {
      question: 'Which AES mode provides both confidentiality and integrity?',
      options: ['ECB', 'CBC', 'CTR', 'GCM'],
      correctAnswer: 3,
      explanation:
        'GCM (Galois/Counter Mode) is an authenticated encryption mode providing both privacy and integrity.',
    },
    {
      question: 'In Zero Trust architecture, what replaces implicit perimeter trust?',
      options: [
        'VPN concentrators',
        'Static IP allowlists',
        'Continuous identity and device verification',
        'Single sign-on alone',
      ],
      correctAnswer: 2,
      explanation:
        'Zero Trust requires continuous verification of every user, device, and request regardless of network position.',
    },
    {
      question: 'What is the primary architectural purpose of a Token Vault?',
      options: [
        'Speed up database reads',
        'Isolate sensitive PAN/PII data and replace it with surrogate identifiers',
        'Encrypt log files',
        'Manage OAuth refresh tokens only',
      ],
      correctAnswer: 1,
      explanation:
        'Tokenization desensitizes downstream systems by replacing sensitive cardholder or personal data with non-exploitable surrogate tokens.',
    },
  ],
}

/**
 * Server Action: Submit and evaluate a quiz securely.
 * The answer keys are never sent to the browser during the quiz.
 * Scoring and evaluation happen entirely on the server.
 */
export async function submitQuizAction(
  quizSlug: string,
  submittedAnswers: Record<number, number> | number[],
): Promise<QuizEvaluationResult> {
  try {
    const answersArray: number[] = Array.isArray(submittedAnswers)
      ? submittedAnswers
      : Object.entries(submittedAnswers)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, val]) => Number(val))

    let questionsToEvaluate: {
      question: string
      options: string[]
      correctAnswer: number
      explanation?: string
    }[] = []
    let quizTitle = fallbackQuizData.title
    let passingScore = fallbackQuizData.passingScore
    let quizId: string | undefined

    // Attempt to load from Payload CMS with server-side access
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'quizzes',
        where: {
          slug: { equals: quizSlug },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (result.docs.length > 0) {
        const quizDoc = result.docs[0]
        quizId = String(quizDoc.id)
        quizTitle = quizDoc.title
        passingScore = quizDoc.passingScore ?? 80
        questionsToEvaluate = quizDoc.questions.map((q) => ({
          question: q.question,
          options: q.options.map((opt) => opt.text),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? undefined,
        }))
      }
    } catch {
      // If database is offline or unseeded, fall back to server-side starter set
      questionsToEvaluate = fallbackQuizData.questions
    }

    if (questionsToEvaluate.length === 0) {
      questionsToEvaluate = fallbackQuizData.questions
    }

    let correctCount = 0
    const breakdown = questionsToEvaluate.map((q, idx) => {
      const selected = answersArray[idx] ?? -1
      const isCorrect = selected === q.correctAnswer
      if (isCorrect) correctCount++

      return {
        question: q.question,
        options: q.options,
        selected,
        correct: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      }
    })

    const totalQuestions = questionsToEvaluate.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    const passed = score >= passingScore

    let attemptNumber = 1

    // Persistent storage of quiz attempt (QZ-8, QZ-11, UP-6)
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        try {
          const payload = await getPayloadClient()
          const prevAttempts = await (payload as any).count({
            collection: 'quiz-attempts',
            where: {
              and: [
                { learner: { equals: currentUser.id } },
                ...(quizId ? [{ quiz: { equals: quizId } }] : []),
              ],
            },
            overrideAccess: true,
          })
          attemptNumber = prevAttempts.totalDocs + 1

          if (quizId) {
            await (payload as any).create({
              collection: 'quiz-attempts',
              data: {
                learner: currentUser.id,
                quiz: quizId,
                score,
                passed,
                correctCount,
                totalQuestions,
                answers: answersArray,
                attemptNumber,
                completedAt: new Date().toISOString(),
              },
              overrideAccess: true,
            })
          }
        } catch {
          // Dev store fallback
          saveDevQuizAttempt({
            id: `att-${Date.now()}`,
            learnerId: currentUser.id,
            quizSlug,
            quizTitle,
            score,
            passed,
            correctCount,
            totalQuestions,
            attemptNumber,
            completedAt: new Date().toISOString(),
          })
        }
      }
    } catch {}

    return {
      ok: true,
      quizTitle,
      score,
      passed,
      totalQuestions,
      correctCount,
      attemptNumber,
      breakdown,
    }
  } catch (err: unknown) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to evaluate quiz submission.',
    }
  }
}

/**
 * Server Action: Retrieve quiz attempt history for the logged-in learner (UP-6, QZ-11).
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
        quizTitle: typeof doc.quiz === 'object' && doc.quiz?.title ? doc.quiz.title : 'Security Architecture Quiz',
        quizSlug: typeof doc.quiz === 'object' && doc.quiz?.slug ? doc.quiz.slug : 'quiz',
        score: doc.score,
        passed: doc.passed,
        correctCount: doc.correctCount || 0,
        totalQuestions: doc.totalQuestions || 5,
        attemptNumber: doc.attemptNumber || 1,
        completedAt: doc.completedAt || doc.createdAt,
      }))
    }
  } catch {}

  // Fallback to dev attempts store
  const devAttempts = getDevQuizAttempts().filter((a) => a.learnerId === currentUser.id)
  return devAttempts.map((a) => ({
    id: a.id,
    quizTitle: a.quizTitle,
    quizSlug: a.quizSlug,
    score: a.score,
    passed: a.passed,
    correctCount: a.correctCount,
    totalQuestions: a.totalQuestions,
    attemptNumber: a.attemptNumber,
    completedAt: a.completedAt,
  }))
}
