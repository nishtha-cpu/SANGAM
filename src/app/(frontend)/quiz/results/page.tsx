import { Suspense } from 'react'
import { App } from '@frontend/components/App'

export default function QuizResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading assessment results...</div>}>
      <App view="quiz-results" />
    </Suspense>
  )
}
