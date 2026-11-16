import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { verifyDevToken, getDevUsers } from './dev-auth'

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
    if (!user || user.collection !== 'users') {
      const devUser = verifyDevToken(token)
      if (devUser) {
        const devUsers = getDevUsers()
        const match = devUsers.find(
          (u) => u.id === devUser.id || (u.email && u.email.toLowerCase() === devUser.email.toLowerCase())
        )
        if (match?.name) {
          devUser.name = match.name
        }
        return devUser
      }
      return null
    }

    // Ensure learner's real name is present on the user object
    if (!user.name && user.id) {
      try {
        const fullDoc = await payload.findByID({
          collection: 'users',
          id: user.id,
          overrideAccess: true,
        })
        if (fullDoc && (fullDoc as any).name) {
          (user as any).name = (fullDoc as any).name
        }
      } catch {
        const devUsers = getDevUsers()
        const match = devUsers.find(
          (u) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase())
        )
        if (match?.name) {
          (user as any).name = match.name
        }
      }
    }

    return user
  } catch {
    // When Payload / database is unreachable in local development mode,
    // verify the signed session token against local dev auth.
    const devUser = verifyDevToken(token)
    if (devUser) {
      const devUsers = getDevUsers()
      const match = devUsers.find(
        (u) => u.id === devUser.id || (u.email && u.email.toLowerCase() === devUser.email.toLowerCase())
      )
      if (match?.name) {
        devUser.name = match.name
      }
      return devUser
    }
    return null
  }
}
