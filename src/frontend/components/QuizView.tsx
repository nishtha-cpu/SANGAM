'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import {
  startQuizAttemptAction,
  saveQuizDraftAnswersAction,
  submitQuizAttemptAction,
  getQuizAttemptResultAction,
  getLearnerQuizHistoryAction,
  type SanitizedQuizQuestion,
  type QuizEvaluationResult,
  type QuizAttemptRecord,
} from '@/backend/actions/quiz-actions'

export interface QuizViewProps {
  results?: boolean
}

export function QuizView({ results = false }: QuizViewProps) {
  const searchParams = useSearchParams()
  const attemptIdParam = searchParams.get('attemptId')

  // Lifecycle States
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [unauthenticated, setUnauthenticated] = useState(false)

  // In-Progress Quiz State
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [attemptNumber, setAttemptNumber] = useState<number>(1)
  const [quizMeta, setQuizMeta] = useState<{
    title: string
    slug: string
    domain?: string
    difficulty?: string
    passingScore: number
    totalQuestions: number
  }>({
    title: 'Security Architecture Fundamentals',
    slug: 'security-architecture-fundamentals',
    passingScore: 80,
    totalQuestions: 7,
  })
  const [questions, setQuestions] = useState<SanitizedQuizQuestion[]>([])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isResumed, setIsResumed] = useState(false)

  // Result / Evaluation State
  const [evaluation, setEvaluation] = useState<QuizEvaluationResult | null>(null)
  const [history, setHistory] = useState<QuizAttemptRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // Async transitions
  const [isSaving, startSaving] = useTransition()
  const [isSubmitting, startSubmitting] = useTransition()

  // Initialize or fetch results
  useEffect(() => {
    let isMounted = true

    async function init() {
      setLoading(true)
      setErrorMessage(null)
      setUnauthenticated(false)

      try {
        if (results || attemptIdParam) {
          // If viewing specific results or history
          const historyRes = await getLearnerQuizHistoryAction()
          if (isMounted) setHistory(historyRes)

          if (attemptIdParam) {
            const res = await getQuizAttemptResultAction(attemptIdParam)
            if (isMounted) {
              if (res.ok) {
                setEvaluation(res)
              } else {
                setErrorMessage(res.message || 'Failed to load assessment result.')
              }
            }
          } else if (historyRes.length > 0) {
            // Load most recent completed attempt
            const latestCompleted = historyRes.find((h) => h.status === 'completed') || historyRes[0]
            const res = await getQuizAttemptResultAction(latestCompleted.id)
            if (isMounted && res.ok) {
              setEvaluation(res)
            }
          }
        } else {
          // Assessment mode: start or resume attempt
          const startRes = await startQuizAttemptAction('security-architecture-fundamentals')
          if (isMounted) {
            if (!startRes.ok) {
              if (startRes.message?.includes('Authentication')) {
                setUnauthenticated(true)
              } else {
                setErrorMessage(startRes.message || 'Failed to start quiz attempt.')
              }
            } else {
              setAttemptId(startRes.attemptId || null)
              setAttemptNumber(startRes.attemptNumber || 1)
              if (startRes.quiz) setQuizMeta(startRes.quiz)
              if (startRes.questions) setQuestions(startRes.questions)
              if (startRes.savedAnswers) setAnswers(startRes.savedAnswers)
              setIsResumed(Boolean(startRes.isResumed))

              // Also pre-fetch past attempts for history drawer
              const pastAttempts = await getLearnerQuizHistoryAction('security-architecture-fundamentals')
              if (isMounted) setHistory(pastAttempts)
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to initialize assessment.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [results, attemptIdParam])

  // Save answer selection with debounced sync
  const handleSelectOption = (optionIndex: number) => {
    if (!attemptId) return

    const newAnswers = { ...answers, [step]: optionIndex }
    setAnswers(newAnswers)

    // Sync draft answer to server safely
    startSaving(async () => {
      await saveQuizDraftAnswersAction(attemptId, newAnswers)
    })
  }

  // Clear answer for current question
  const handleClearAnswer = () => {
    if (!attemptId) return

    const newAnswers = { ...answers }
    delete newAnswers[step]
    setAnswers(newAnswers)

    startSaving(async () => {
      await saveQuizDraftAnswersAction(attemptId, newAnswers)
    })
  }

  // Answered stats calculation
  const totalCount = questions.length
  const answeredIndices = useMemo(() => Object.keys(answers).map(Number), [answers])
  const answeredCount = answeredIndices.length
  const unansweredCount = Math.max(0, totalCount - answeredCount)

  // Submit assessment handler
  const handleSubmit = () => {
    if (!attemptId) return

    startSubmitting(async () => {
      const res = await submitQuizAttemptAction({
        attemptId,
        quizSlug: quizMeta.slug,
        answers,
      })

      if (res.ok) {
        setEvaluation(res)
        setShowConfirmSubmit(false)
        // Refresh history
        const refreshedHistory = await getLearnerQuizHistoryAction(quizMeta.slug)
        setHistory(refreshedHistory)
      } else {
        setErrorMessage(res.message || 'Submission failed.')
      }
    })
  }

  // 1. Unauthenticated State
  if (unauthenticated) {
    return (
      <PageFrame title="Security Architecture Assessment" eyebrow="Authentication Required">
        <div className="mx-auto max-w-xl card p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-400/10 text-amber-300">
            <Icon name="lock" className="size-8" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-white">Learner Login Required</h2>
          <p className="mt-3 text-sm text-slate-400 leading-6">
            You must be logged in as an enrolled learner to start this assessment, record quiz attempts, and earn course credits.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/login?next=/quiz" className="button-primary justify-center">
              Sign In to Start Quiz
            </Link>
            <Link href="/signup" className="button-secondary justify-center">
              Create Learner Account
            </Link>
          </div>
        </div>
      </PageFrame>
    )
  }

  // 2. Loading State
  if (loading) {
    return (
      <PageFrame eyebrow="Security Architecture Assessment">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="card p-8 text-center animate-pulse">
            <div className="mx-auto h-6 w-48 rounded bg-white/10" />
            <div className="mx-auto mt-4 h-4 w-72 rounded bg-white/5" />
            <div className="mt-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5" />
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-500">Initializing secure quiz session...</p>
          </div>
        </div>
      </PageFrame>
    )
  }

  // 3. Error State
  if (errorMessage && !evaluation) {
    return (
      <PageFrame title="Assessment Error" eyebrow="System Notice">
        <div className="mx-auto max-w-xl card p-8 text-center border-rose-500/20">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-500/10 text-rose-300">
            <Icon name="x" className="size-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-white">Unable to Load Assessment</h2>
          <p className="mt-2 text-sm text-rose-300/80">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="button-primary mt-6 justify-center"
          >
            Retry Assessment
          </button>
        </div>
      </PageFrame>
    )
  }

  // 4. Completed Evaluation Results View
  if (evaluation) {
    const isPassing = Boolean(evaluation.passed)
    const breakdown = evaluation.breakdown || []

    return (
      <PageFrame
        title={evaluation.quizTitle || quizMeta.title}
        eyebrow={`Assessment Result · Attempt #${evaluation.attemptNumber || 1}`}
      >
        <div className="space-y-8">
          {/* Top Score Banner */}
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <section className="card p-8 text-center">
              <div
                className={`mx-auto grid size-32 place-items-center rounded-full border-8 text-4xl font-bold ${
                  isPassing
                    ? 'border-emerald-400/30 text-emerald-300'
                    : 'border-rose-400/30 text-rose-300'
                }`}
              >
                {evaluation.score}%
              </div>

              <h2 className="mt-6 text-xl font-semibold text-white">
                {isPassing ? 'Assessment Passed' : 'Assessment Incomplete'}
              </h2>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {isPassing
                  ? `Congratulations! You achieved ${evaluation.score}%, exceeding the required ${quizMeta.passingScore}% threshold.`
                  : `You scored ${evaluation.score}%. A minimum score of ${quizMeta.passingScore}% is required to earn this certificate module.`}
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setEvaluation(null)
                    setStep(0)
                    setAnswers({})
                    window.location.href = '/quiz'
                  }}
                  className="button-primary justify-center"
                >
                  {isPassing ? 'Take Assessment Again' : 'Retry Assessment'}
                </button>
                <Link href="/dashboard" className="button-secondary justify-center text-xs">
                  Return to Dashboard
                </Link>
              </div>
            </section>

            {/* Score Metrics Breakdown */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="card p-5">
                  <p className="text-2xl font-bold text-white">{evaluation.totalQuestions}</p>
                  <p className="mt-1 text-xs text-slate-400">Total Questions</p>
                </div>
                <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-2xl font-bold text-emerald-300">{evaluation.correctCount || 0}</p>
                  <p className="mt-1 text-xs text-slate-400">Correct Answers</p>
                </div>
                <div className="card p-5 border-rose-500/20 bg-rose-500/5">
                  <p className="text-2xl font-bold text-rose-300">{evaluation.incorrectCount || 0}</p>
                  <p className="mt-1 text-xs text-slate-400">Incorrect</p>
                </div>
                <div className="card p-5 border-amber-500/20 bg-amber-500/5">
                  <p className="text-2xl font-bold text-amber-300">{evaluation.unansweredCount || 0}</p>
                  <p className="mt-1 text-xs text-slate-400">Unanswered</p>
                </div>
              </div>

              {/* Previous Attempts Bar */}
              <div className="card p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Previous Attempts History (QZ-11)</h3>
                  <p className="text-xs text-slate-400">
                    You have completed {history.length} attempt{history.length !== 1 ? 's' : ''} on this assessment.
                  </p>
                </div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="button-secondary text-xs"
                >
                  {showHistory ? 'Hide History' : 'View History Table'}
                </button>
              </div>

              {showHistory && (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                        <tr>
                          <th className="p-3">Attempt</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Correct / Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.map((att) => (
                          <tr key={att.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-medium text-white">#{att.attemptNumber}</td>
                            <td className="p-3 text-slate-400">
                              {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="p-3 font-semibold text-white">{att.score}%</td>
                            <td className="p-3 text-slate-300">
                              {att.correctCount} / {att.totalQuestions}
                            </td>
                            <td className="p-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                  att.passed
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                }`}
                              >
                                {att.passed ? 'PASSED' : 'RETRY'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={async () => {
                                  const r = await getQuizAttemptResultAction(att.id)
                                  if (r.ok) setEvaluation(r)
                                }}
                                className="text-emerald-300 hover:underline"
                              >
                                View Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Question-by-Question Review with Explanations */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">
              Comprehensive Architectural Review &amp; Explanations
            </h3>

            {breakdown.map((item, i) => (
              <div
                key={i}
                className={`card p-6 border ${
                  item.isCorrect
                    ? 'border-emerald-500/20'
                    : item.isUnanswered
                      ? 'border-amber-500/20'
                      : 'border-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      item.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.isUnanswered
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.isCorrect ? (
                      <Icon name="check" className="size-4" />
                    ) : item.isUnanswered ? (
                      '—'
                    ) : (
                      <Icon name="x" className="size-4" />
                    )}
                  </span>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        Question {i + 1}: {item.question}
                      </p>
                      <span
                        className={`text-xs font-medium ${
                          item.isCorrect
                            ? 'text-emerald-300'
                            : item.isUnanswered
                              ? 'text-amber-300'
                              : 'text-rose-300'
                        }`}
                      >
                        {item.isCorrect
                          ? 'CORRECT'
                          : item.isUnanswered
                            ? 'UNANSWERED'
                            : 'INCORRECT'}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {item.options.map((opt, optIdx) => {
                        const isLearnerSelected = item.selectedOption === optIdx
                        const isTheCorrectOption = item.correctOption === optIdx

                        let style = 'border-white/5 bg-white/[0.02] text-slate-400'
                        if (isTheCorrectOption) {
                          style = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 font-medium'
                        } else if (isLearnerSelected && !item.isCorrect) {
                          style = 'border-rose-500/40 bg-rose-500/10 text-rose-200 font-medium'
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`rounded-lg border p-3 text-xs flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isTheCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-emerald-300">
                                Correct Key
                              </span>
                            )}
                            {isLearnerSelected && !isTheCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-rose-300">
                                Your Choice
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Architectural Explanation */}
                    {item.explanation && (
                      <div className="mt-3 rounded-lg border border-white/5 bg-[#071322] p-3 text-xs leading-relaxed text-slate-300">
                        <strong className="text-emerald-300">Architectural Context: </strong>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageFrame>
    )
  }

  // 5. In-Progress Assessment View
  const currentQuestion = questions[step]
  if (!currentQuestion) {
    return (
      <PageFrame eyebrow="Security Architecture Assessment">
        <div className="mx-auto max-w-xl card p-8 text-center">
          <p className="text-sm text-slate-400">No questions available in this assessment module.</p>
        </div>
      </PageFrame>
    )
  }

  const currentSelection = answers[step]

  return (
    <PageFrame eyebrow="Security Architecture Assessment">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header with Assessment Details & Attempt Badge */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{quizMeta.title}</h1>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                Attempt #{attemptNumber}
              </span>
              {isResumed && (
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Resumed
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {quizMeta.domain || 'Core Principles'} · {quizMeta.difficulty || 'Beginner'} · Pass Mark: {quizMeta.passingScore}%
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400">
              Question <strong className="text-white">{step + 1}</strong> of {totalCount}
            </span>
            <p className="text-[11px] text-slate-500">
              {answeredCount} answered · {unansweredCount} remaining
            </p>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${((step + 1) / totalCount) * 100}%` }}
          />
        </div>

        {/* Question Palette (Quick Jump Navigation) */}
        <div className="card p-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">Question Palette:</span>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined && answers[idx] !== -1
              const isCurrent = step === idx

              let paletteClass = 'border-white/10 bg-white/5 text-slate-400'
              if (isCurrent) {
                paletteClass = 'border-emerald-400 bg-emerald-400/20 text-emerald-200 ring-2 ring-emerald-400/40 font-bold'
              } else if (isAnswered) {
                paletteClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
              }

              return (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`size-7 rounded-lg border text-xs transition-all ${paletteClass}`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Current Question Card */}
        <section className="card p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-medium leading-7 text-white">
              <span className="text-emerald-400 font-bold mr-2">{step + 1}.</span>
              {currentQuestion.question}
            </h2>
            {currentSelection !== undefined && (
              <button
                onClick={handleClearAnswer}
                className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline shrink-0"
              >
                Clear choice
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((optionText, optIdx) => {
              const isSelected = currentSelection === optIdx

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full rounded-xl border p-4 text-left text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-white shadow-lg'
                      : 'border-white/8 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-7 place-items-center rounded-full border text-xs font-semibold ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-300 text-[#06111f]'
                          : 'border-white/15 bg-white/5 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-5">{optionText}</span>
                  </div>

                  {isSelected && (
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <Icon name="check" className="size-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {isSaving && (
            <p className="text-[11px] text-slate-500 animate-pulse text-right">
              Saving draft answer to session...
            </p>
          )}
        </section>

        {/* Navigation & Submit Toolbar */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="button-secondary disabled:opacity-30"
          >
            <Icon name="back" className="size-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            {step < totalCount - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="button-primary"
              >
                Next Question <Icon name="arrow" className="size-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (unansweredCount > 0) {
                    setShowConfirmSubmit(true)
                  } else {
                    handleSubmit()
                  }
                }}
                disabled={isSubmitting}
                className="button-primary bg-emerald-400 text-black hover:bg-emerald-300 font-semibold"
              >
                {isSubmitting ? 'Evaluating Assessment…' : 'Submit Final Assessment'}
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal for Unanswered Questions */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
            <div className="card max-w-md p-6 text-center space-y-4 border-amber-500/30">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-300">
                <Icon name="clock" className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Unanswered Questions Remaining</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have answered <strong className="text-white">{answeredCount}</strong> of{' '}
                <strong className="text-white">{totalCount}</strong> questions. There are{' '}
                <strong className="text-amber-300">{unansweredCount}</strong> questions without a selected answer.
                Unanswered questions will be counted as incorrect.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="button-secondary text-xs"
                >
                  Return to Questions
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="button-primary text-xs bg-amber-400 text-black hover:bg-amber-300"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Anyway'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageFrame>
  )
}
