import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@backend/auth/app-auth'
import { App } from '@frontend/components/App'

/**
 * AU-2: Signup page.
 * Already-authenticated learners are redirected to dashboard.
 */
export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading sign up...</div>}>
      <App view="signup" />
    </Suspense>
  )
}
