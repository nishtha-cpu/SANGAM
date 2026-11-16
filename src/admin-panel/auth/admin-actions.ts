'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE } from './admin-auth'
import {
  authenticateDevAdmin,
  signAdminDevToken,
} from './admin-dev-auth'

export type AdminAuthState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Set the dedicated admin session cookie with strict security attributes.
 */
async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    priority: 'high',
  })
}

/**
 * Clear the admin session cookie on logout.
 */
async function clearAdminSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

/**
 * Administrator login action.
 *
 * Security Requirements:
 * - Authenticates ONLY against the 'admins' collection.
 * - Rejects any learner credentials or unauthorized roles.
 * - Sets the isolated 'admin-session' HttpOnly cookie.
 * - Never creates dummy credentials or falls back to learner auth.
 */
export async function adminLoginAction(
  _previous: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')
  const fieldErrors: Record<string, string> = {}

  if (!emailPattern.test(email)) {
    fieldErrors.email = 'Enter a valid administrator email address.'
  }
  if (!password) {
    fieldErrors.password = 'Administrator password is required.'
  }
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors }
  }

  try {
    const payload = await getPayload({ config })

    // Authenticate ONLY against the 'admins' collection.
    // Learner accounts (in 'users') are rejected by Payload's login handler.
    const result = await payload.login({
      collection: 'admins',
      data: { email, password },
      overrideAccess: false,
    })

    if (!result.token || result.user?.collection !== 'admins') {
      return {
        ok: false,
        message: 'Invalid administrator credentials or unauthorized role.',
      }
    }

    await setAdminSessionCookie(result.token)
    return { ok: true, message: 'Administrator login successful.' }
  } catch (err: unknown) {
    // Detailed security logging in development only
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[admin-actions] Admin login failed:',
        err instanceof Error ? err.message : String(err),
      )
    }

    // In local development when live Payload Cloud database is offline:
    if (process.env.NODE_ENV !== 'production') {
      const devAuth = authenticateDevAdmin(email, password)
      if (devAuth.ok && devAuth.admin) {
        const token = signAdminDevToken(devAuth.admin)
        await setAdminSessionCookie(token)
        return { ok: true, message: 'Administrator login successful.' }
      }
    }

    return {
      ok: false,
      message:
        'Invalid administrator credentials. Note: Learner accounts are not authorized here. If you have not provisioned the initial administrator yet, run the secure admin provisioning CLI.',
    }
  }
}

/**
 * Administrator logout action.
 */
export async function adminLogoutAction(): Promise<AdminAuthState> {
  await clearAdminSessionCookie()
  return { ok: true, message: 'Administrator signed out successfully.' }
}
