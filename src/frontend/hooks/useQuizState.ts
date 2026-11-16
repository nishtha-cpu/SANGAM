'use client'

import { useState } from 'react'
import type { QuizQuestionItem } from '@frontend/types'

export function useQuizState(questions: QuizQuestionItem[]) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const setAnswerForCurrentStep = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[step] = optionIndex
      return next
    })
  }

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
    }
  }

  const progressPercentage = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0
  const isLastQuestion = step === questions.length - 1
  const isFirstQuestion = step === 0

  return {
    step,
    currentQuestion: questions[step],
    answers,
    currentAnswer: answers[step],
    setAnswerForCurrentStep,
    nextStep,
    prevStep,
    progressPercentage,
    isLastQuestion,
    isFirstQuestion,
  }
}
