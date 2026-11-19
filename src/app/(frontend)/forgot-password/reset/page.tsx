import { Suspense } from 'react'
import { App } from '@frontend/components/App'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading password reset...</div>}>
      <App view="reset" />
    </Suspense>
  )
}
