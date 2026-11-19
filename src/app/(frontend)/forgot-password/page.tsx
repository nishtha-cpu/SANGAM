import { Suspense } from 'react'
import { App } from '@frontend/components/App'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading form...</div>}>
      <App view="forgot" />
    </Suspense>
  )
}
