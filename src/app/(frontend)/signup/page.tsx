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

  return <App view="signup" />
}
