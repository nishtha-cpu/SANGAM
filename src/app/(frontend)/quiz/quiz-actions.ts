'use server'

/**
 * SANGAM — Quiz Server Actions Re-export Layer
 * Original: src/app/(frontend)/quiz/quiz-actions.ts
 * Target:   src/backend/actions/quiz-actions.ts
 */
export {
  startQuizAttemptAction,
  saveQuizDraftAnswersAction,
  submitQuizAttemptAction,
  getQuizAttemptResultAction,
  getLearnerQuizHistoryAction,
  submitQuizAction,
  type SanitizedQuizQuestion,
  type QuizStartResult,
  type QuizQuestionBreakdown,
  type QuizEvaluationResult,
  type QuizAttemptRecord,
} from '@/backend/actions/quiz-actions'
