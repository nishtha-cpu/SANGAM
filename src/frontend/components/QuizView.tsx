'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { quizQuestions } from '@frontend/data/curriculum'

export interface QuizViewProps {
  results?: boolean
}

export function QuizView({ results = false }: QuizViewProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  if (results) {
    return (
      <PageFrame title="Quiz Results" eyebrow="Security Architecture Fundamentals">
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <section className="card p-8 text-center">
            <div className="mx-auto grid size-32 place-items-center rounded-full border-8 border-emerald-400/20 text-4xl font-semibold text-emerald-300">
              86%
            </div>
            <h2 className="mt-6 text-xl font-semibold">Strong performance</h2>
            <p className="mt-2 text-sm text-slate-400">You answered 6 of 7 questions correctly.</p>
            <Link href="/dashboard" className="button-primary mt-7 justify-center">
              Back to dashboard
            </Link>
          </section>
          <div className="space-y-3">
            {quizQuestions.map((q, i) => (
              <div className="card p-5" key={q.q}>
                <div className="flex gap-3">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                      i === 1 ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'
                    }`}
                  >
                    <Icon name={i === 1 ? 'x' : 'check'} className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{q.q}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Correct answer: {q.options[q.correct]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageFrame>
    )
  }

  const question = quizQuestions[step]

  return (
    <PageFrame eyebrow="Security Architecture · Beginner">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Security Architecture Fundamentals</h1>
          <span className="text-xs text-slate-500">
            Question {step + 1} of {quizQuestions.length}
          </span>
        </div>
        <div className="mb-7 h-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full bg-emerald-300 transition-all"
            style={{ width: `${((step + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
        <section className="card p-6 md:p-8">
          <h2 className="text-lg font-medium leading-7">
            {step + 1}. {question.q}
          </h2>
          <div className="mt-6 space-y-3">
            {question.options.map((o, i) => (
              <button
                type="button"
                onClick={() =>
                  setAnswers((a) => {
                    const n = [...a]
                    n[step] = i
                    return n
                  })
                }
                key={o}
                className={`w-full rounded-xl border p-4 text-left text-sm transition ${
                  answers[step] === i
                    ? 'border-emerald-400/50 bg-emerald-400/8 text-white'
                    : 'border-white/8 bg-white/[.02] text-slate-400 hover:border-white/20'
                }`}
              >
                <span
                  className={`mr-3 inline-grid size-6 place-items-center rounded-full border text-[10px] ${
                    answers[step] === i
                      ? 'border-emerald-300 bg-emerald-300 text-[#06111f]'
                      : 'border-white/15'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {o}
              </button>
            ))}
          </div>
        </section>
        <div className="mt-5 flex justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="button-secondary disabled:opacity-30"
          >
            <Icon name="back" className="size-4" /> Previous
          </button>
          {step < quizQuestions.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="button-primary">
              Next question <Icon name="arrow" className="size-4" />
            </button>
          ) : (
            <Link href="/quiz/results" className="button-primary">
              Submit quiz
            </Link>
          )}
        </div>
      </div>
    </PageFrame>
  )
}
