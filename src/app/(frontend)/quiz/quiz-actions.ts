
'use server'

/**
 * SANGAM — Compatibility Re-export Layer
 * Original: src/app/(frontend)/quiz/quiz-actions.ts
 * Target:   src/backend/actions/quiz-actions.ts
 */
export {
  submitQuizAction,
  getLearnerQuizHistoryAction,
  type QuizEvaluationResult,
  type QuizAttemptRecord,
} from '@/backend/actions/quiz-actions'
