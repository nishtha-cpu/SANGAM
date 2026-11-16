import { redirect } from 'next/navigation'
import { getCurrentUser } from '@backend/auth/app-auth'
import { App } from '@frontend/components/App'

/**
 * AU-5 / AU-4: Server-side auth guard.
 * Profile page requires an authenticated learner session.
 */
export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?next=/profile')
  }

  return <App view="profile" user={user} />
}
