'use client'

import React, { useState } from 'react'
import { QuizRecord, QuizQuestionItem } from '@/backend/repositories/quizzes'

interface QuizBuilderModalProps {
  quiz?: QuizRecord | null
  onClose: () => void
  onSave: (quizData: any) => void
  isPending: boolean
}

export function QuizBuilderModal({ quiz, onClose, onSave, isPending }: QuizBuilderModalProps) {
  const [title, setTitle] = useState(quiz?.title || '')
  const [slug, setSlug] = useState(quiz?.slug || '')
  const [domain, setDomain] = useState(quiz?.domain || 'Security Architecture')
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    quiz?.difficulty || 'Intermediate'
  )
  const [durationMinutes, setDurationMinutes] = useState(quiz?.durationMinutes || 20)
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 80)
  const [attemptLimit, setAttemptLimit] = useState(quiz?.attemptLimit || 3)
  const [published, setPublished] = useState(quiz?.published !== undefined ? quiz.published : true)

  const [questions, setQuestions] = useState<QuizQuestionItem[]>(
    quiz?.questions && quiz.questions.length > 0
      ? quiz.questions
      : [
          {
            id: 'q1',
            question: '',
            options: ['', ''],
            correctAnswer: 0,
            marks: 10,
            explanation: '',
          },
        ]
  )

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        question: '',
        options: ['', ''],
        correctAnswer: 0,
        marks: 10,
        explanation: '',
      },
    ])
  }

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleQuestionChange = (idx: number, field: keyof QuizQuestionItem, value: any) => {
    const updated = [...questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setQuestions(updated)
  }

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions]
    if (updated[qIdx].options.length >= 6) return
    updated[qIdx].options.push('')
    setQuestions(updated)
  }

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions]
    if (updated[qIdx].options.length <= 2) return
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx)
    if (updated[qIdx].correctAnswer >= updated[qIdx].options.length) {
      updated[qIdx].correctAnswer = 0
    }
    setQuestions(updated)
  }

  const handleOptionTextChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions]
    updated[qIdx].options[optIdx] = val
    setQuestions(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: quiz?.id,
      title,
      slug,
      domain,
      difficulty,
      durationMinutes,
      passingScore,
      attemptLimit,
      published,
      questions,
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="card max-w-4xl w-full p-6 space-y-6 my-8 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {quiz ? 'Edit Quiz Assessment' : 'Quiz & Question Builder (AD-13, QZ-1, QZ-2)'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create scenario-based architecture assessments with instant option scoring.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Quiz Metadata */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quiz Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Identity & SAML/OIDC Assessment"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slug Identifier
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Cloud Security Architecture"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Passing Threshold (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Time Limit (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Max Attempts Allowed
            </label>
            <input
              type="number"
              min="1"
              value={attemptLimit}
              onChange={(e) => setAttemptLimit(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="quizPublished"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-4 rounded accent-emerald-400"
            />
            <label htmlFor="quizPublished" className="text-xs text-slate-300 cursor-pointer">
              Publish Quiz immediately
            </label>
          </div>
        </div>

        {/* Dynamic Question Builder */}
        <div className="border-t border-white/10 pt-5 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Assessment Questions ({questions.length})
            </h4>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="button-secondary text-xs px-3 py-1.5 border-emerald-500/40 text-emerald-300"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="card p-5 border border-white/10 bg-white/[0.02] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="badge border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-bold">
                    Question {qIdx + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Marks:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={q.marks || 10}
                        onChange={(e) =>
                          handleQuestionChange(qIdx, 'marks', Number(e.target.value))
                        }
                        className="w-14 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                      />
                    </label>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs text-rose-400 hover:text-rose-200"
                      >
                        Delete Question
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Question Prompt <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Describe the architectural scenario or vulnerability question..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Options (Select the radio button for the Correct Answer):
                    </span>
                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correctAnswer_${qIdx}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', optIdx)}
                        className="size-4 accent-emerald-400 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className={`flex-1 rounded-xl border px-3 py-1.5 text-xs text-white focus:outline-none ${
                          q.correctAnswer === optIdx
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-white/10 bg-white/5 focus:border-emerald-400'
                        }`}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="text-xs text-slate-500 hover:text-rose-400 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Explanation (Displayed to learners after submission)
                  </label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    placeholder="Provide architectural justification for the correct answer..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="button-secondary text-xs"
          >
            + Add Another Question
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="button-secondary text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="button-primary text-xs bg-emerald-400 text-slate-950 font-bold px-5"
            >
              {isPending ? 'Saving...' : 'Save Assessment Quiz'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
