'use client'

import React, { useState } from 'react'
import { QuizRecord } from '@/backend/repositories/quizzes'

interface QuizPreviewModalProps {
  quiz: QuizRecord
  onClose: () => void
}

export function QuizPreviewModal({ quiz, onClose }: QuizPreviewModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  const currentQ = quiz.questions[currentIdx]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto border-emerald-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">
                STUDENT PREVIEW
              </span>
              <span className="badge border-white/10 bg-white/5 text-slate-300 text-[10px]">
                {quiz.difficulty}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ⏱️ {quiz.durationMinutes} mins • Passing: {quiz.passingScore}%
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
            {quiz.questions.length}
          </span>
          <span>Marks: {currentQ?.marks || 10}</span>
        </div>

        {/* Current Question Body */}
        {currentQ ? (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h4>

            <div className="space-y-2.5">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() =>
                      setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optIdx })
                    }
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/10 text-white font-medium'
                        : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span
                      className={`grid size-5 place-items-center rounded-full border text-[10px] font-bold ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                          : 'border-white/20 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No questions in this quiz.</p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            className="button-secondary text-xs disabled:opacity-30"
          >
            ← Previous
          </button>

          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                className={`size-6 rounded text-[11px] font-semibold transition ${
                  i === currentIdx
                    ? 'bg-emerald-400 text-slate-950'
                    : selectedAnswers[i] !== undefined
                    ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentIdx >= quiz.questions.length - 1}
            onClick={() => setCurrentIdx((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
            className="button-secondary text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
