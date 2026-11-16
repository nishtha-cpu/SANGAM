import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { verifyDevToken } from './dev-auth'

export const APP_SESSION_COOKIE = 'app-session'

/**
 * Retrieve the currently authenticated learner from the JWT stored in the
 * HttpOnly session cookie. Returns `null` when:
 *   - The cookie is absent or empty
 *   - The token is expired or invalid
 *   - The token belongs to a non-learner collection (e.g. admins)
 *
 * Intentionally does NOT throw so callers can branch on null safely.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = await getPayload({ config })
    const authHeaders = new Headers({ Authorization: `JWT ${token}` })
    const { user } = await payload.auth({ headers: authHeaders })

    // Guard: only accept tokens from the learner 'users' collection.
    // Admins must NOT gain app-learner access through this code path.
    if (!user || user.collection !== 'users') return null
    return user
  } catch {
    // When Payload / database is unreachable in local development mode,
    // verify the signed session token against local dev auth.
    const devUser = verifyDevToken(token)
    if (devUser) return devUser
    return null
  }
}
