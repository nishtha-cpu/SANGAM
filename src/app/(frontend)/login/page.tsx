import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@backend/auth/app-auth'
import { App } from '@frontend/components/App'

/**
 * AU-1: Login page.
 * Already-authenticated learners are redirected to dashboard so they don't
 * see the login form unnecessarily.
 */
export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading sign in...</div>}>
      <App view="login" />
    </Suspense>
  )
}
