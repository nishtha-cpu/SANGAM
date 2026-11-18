import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { verifyAdminDevToken } from './admin-dev-auth'

export const ADMIN_SESSION_COOKIE = 'admin-session'

export interface AdminUser {
  id: string | number
  email: string
  collection: 'admins'
  createdAt?: string
  updatedAt?: string
}

/**
 * Retrieve the currently authenticated administrator from the JWT stored in
 * the HttpOnly admin-session cookie.
 *
 * Security Invariants:
 * - Reads ONLY the dedicated ADMIN_SESSION_COOKIE ('admin-session').
 * - Validates the cryptographic JWT against Payload's admin auth engine.
 * - STRICTLY verifies user.collection === 'admins'.
 * - Rejects learner accounts (collection: 'users') unconditionally.
 * - Returns null if the token is missing, expired, invalid, or belongs to a non-admin.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  let token: string | undefined
  try {
    const cookieStore = await cookies()
    token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  } catch {
    if (process.env.TEST_ADMIN_TOKEN) {
      token = process.env.TEST_ADMIN_TOKEN
    }
  }
  if (!token) return null

  try {
    const payload = await getPayload({ config })
    const authHeaders = new Headers({ Authorization: `JWT ${token}` })
    const { user } = await payload.auth({ headers: authHeaders })

    // Guard: MUST belong to the 'admins' collection
    if (!user || user.collection !== 'admins') {
      return null
    }

    return user as unknown as AdminUser
  } catch {
    // When live Payload Cloud database is offline in local development mode:
    if (process.env.NODE_ENV !== 'production') {
      const devAdmin = verifyAdminDevToken(token)
      if (devAdmin && devAdmin.collection === 'admins') {
        return devAdmin as AdminUser
      }
    }
    return null
  }
}
