import { redirect } from 'next/navigation'
import { getCurrentUser } from '@backend/auth/app-auth'
import { App } from '@frontend/components/App'

/**
 * AU-5 / AU-4: Server-side auth guard.
 * This is a Server Component — getCurrentUser() runs on the server and
 * verifies the JWT before any HTML is sent to the browser.
 * Client-side JS cannot bypass this check.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    // Redirect unauthenticated visitors to login.
    // The 'next' param allows the login page to redirect back after success.
    redirect('/login?next=/dashboard')
  }

  return <App view="dashboard" />
}
