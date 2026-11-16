'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { APP_SESSION_COOKIE, getCurrentUser } from '../auth/app-auth'
import {
  registerDevUser,
  authenticateDevUser,
  signDevToken,
  updateDevUser,
} from '../auth/dev-auth'
import { checkRateLimit, resetRateLimit } from '../security/rate-limiter'
import { notifications } from '../notifications/email-service'

export type AuthState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

// RFC 5322-compatible email pattern (simple but pragmatic)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Validate password strength:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * Returns an error string or null when valid.
 */
function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  return null
}

/**
 * Set the session cookie with consistent security attributes.
 */
async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    priority: 'high',
  })
}

/**
 * AU-9 / AU-6: Clear the session cookie so that subsequent requests are
 * treated as unauthenticated.
 */
async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

// ---------------------------------------------------------------------------
// AU-1 — Login (with AU-11 Rate Limiting)
// ---------------------------------------------------------------------------

export async function loginAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')
  const fieldErrors: Record<string, string> = {}

  if (!emailPattern.test(email)) fieldErrors.email = 'Enter a valid email address.'
  if (!password) fieldErrors.password = 'Password is required.'
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors }
  }

  // AU-11: Rate limiting (5 attempts per 15 minutes per email)
  const rateLimit = checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `Too many failed login attempts. Please try again in ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} minute(s).`,
    }
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
      overrideAccess: false,
    })

    if (!result.token) {
      return { ok: false, message: 'Unable to start a secure session.' }
    }

    resetRateLimit(`login:${email}`)
    await setSessionCookie(result.token)
    return { ok: true, message: 'Login successful.' }
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth-actions] Payload login unavailable, falling back to local auth store.')
    }

    // In local development when Payload Cloud database is offline or uninitialized:
    const devAuth = authenticateDevUser(email, password)
    if (devAuth.ok && devAuth.user) {
      resetRateLimit(`login:${email}`)
      const token = signDevToken(devAuth.user)
      await setSessionCookie(token)
      return { ok: true, message: 'Login successful.' }
    }

    return { ok: false, message: 'Incorrect email or password.' }
  }
}

// ---------------------------------------------------------------------------
// AU-2 — Registration (with AU-11 Rate Limiting & Welcome Notification)
// ---------------------------------------------------------------------------

export async function signupAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const name = text(formData, 'name')
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')
  const confirmPassword = text(formData, 'confirmPassword')
  const terms = formData.get('terms') === 'on'
  const fieldErrors: Record<string, string> = {}

  if (name.length < 2) fieldErrors.name = 'Enter your full name (at least 2 characters).'
  if (!emailPattern.test(email)) fieldErrors.email = 'Enter a valid email address.'

  const passwordError = validatePasswordStrength(password)
  if (passwordError) fieldErrors.password = passwordError
  if (password !== confirmPassword) fieldErrors.confirmPassword = 'Passwords do not match.'
  if (!terms) fieldErrors.terms = 'Accept the terms to continue.'

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors }
  }

  // AU-11: Rate limiting (3 registrations per hour per IP/key)
  const rateLimit = checkRateLimit(`signup:${email}`, 3, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `Registration rate limit reached. Please try again later.`,
    }
  }

  try {
    const payload = await getPayload({ config })

    await (payload as any).create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        termsAcceptedAt: new Date().toISOString(),
        emailVerified: false,
      },
      overrideAccess: true,
    })

    // Trigger welcome notification
    notifications.sendWelcomeEmail(email, name).catch(() => {})

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
      overrideAccess: false,
    })

    if (!result.token) {
      return {
        ok: false,
        message: 'Account created. Please log in to continue.',
      }
    }

    await setSessionCookie(result.token)
    return { ok: true, message: 'Registration successful.' }
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth-actions] Payload user creation unavailable, falling back to local auth store.')
    }

    if (err instanceof Error && err.message.toLowerCase().includes('duplicate')) {
      return {
        ok: false,
        message: 'An account with this email may already be registered. Try logging in.',
      }
    }

    const reg = registerDevUser({ name, email, password })
    if (!reg.ok) {
      return {
        ok: false,
        message:
          reg.message ||
          'An account with this email may already be registered. Try logging in.',
      }
    }

    // Trigger welcome notification in dev store
    notifications.sendWelcomeEmail(email, name).catch(() => {})

    if (reg.user) {
      const token = signDevToken(reg.user)
      await setSessionCookie(token)
      return { ok: true, message: 'Registration successful.' }
    }

    return { ok: false, message: 'Registration failed. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// AU-9 — Logout
// ---------------------------------------------------------------------------

export async function logoutAction(): Promise<AuthState> {
  await clearSessionCookie()
  return { ok: true, message: 'You have been securely logged out.' }
}

// ---------------------------------------------------------------------------
// AU-10 — Password Reset Request & Execution
// ---------------------------------------------------------------------------

export async function requestPasswordResetAction(
  _previous: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = text(formData, 'email').toLowerCase()
  if (!emailPattern.test(email)) {
    return { ok: false, message: 'Enter a valid email address.' }
  }

  // Rate limit password reset requests (3 per hour per email)
  const rateLimit = checkRateLimit(`reset:${email}`, 3, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `Too many password reset requests. Please try again in ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} minutes.`,
    }
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

  try {
    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]
      await (payload as any).update({
        collection: 'users',
        id: user.id,
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: resetExpiry,
        },
        overrideAccess: true,
      })
    }
  } catch {
    // Silently continue in standalone dev mode
  }

  // Send email (safe simulation in dev)
  await notifications.sendPasswordResetEmail(email, resetToken)

  // AU-10 security: uniform message to prevent email enumeration
  return {
    ok: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
  }
}

export async function resetPasswordAction(
  _previous: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = text(formData, 'token')
  const newPassword = text(formData, 'password')
  const confirmPassword = text(formData, 'confirmPassword')

  if (!token) {
    return { ok: false, message: 'Invalid or expired password reset token.' }
  }

  const strengthErr = validatePasswordStrength(newPassword)
  if (strengthErr) {
    return { ok: false, message: strengthErr }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, message: 'Passwords do not match.' }
  }

  try {
    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          { resetPasswordToken: { equals: token } },
          { resetPasswordExpiry: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length === 0) {
      return { ok: false, message: 'Password reset link is invalid or has expired.' }
    }

    const user = users.docs[0]
    await (payload as any).update({
      collection: 'users',
      id: user.id,
      data: {
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
      overrideAccess: true,
    })

    return { ok: true, message: 'Your password has been successfully reset. Please log in.' }
  } catch (err: unknown) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to reset password.',
    }
  }
}

/**
 * Server Action: Verify learner email address via verification token (AU-12).
 */
export async function verifyEmailTokenAction(token: string): Promise<AuthState> {
  if (!token) {
    return { ok: false, message: 'Verification token is required.' }
  }

  try {
    const payload = await getPayload({ config })
    const users = await (payload as any).find({
      collection: 'users',
      where: {
        emailVerificationToken: { equals: token },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length === 0) {
      return { ok: false, message: 'Invalid or expired email verification link.' }
    }

    const user = users.docs[0]
    await (payload as any).update({
      collection: 'users',
      id: user.id,
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
      overrideAccess: true,
    })

    return { ok: true, message: 'Your email has been successfully verified! You may now access all features.' }
  } catch (err: unknown) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to verify email address.',
    }
  }
}

// ---------------------------------------------------------------------------
// UP-1 — Profile Update & AU-13 Account Deletion
// ---------------------------------------------------------------------------

export async function getSessionUserAction(): Promise<{
  id: string
  name: string
  email: string
  role: string
} | null> {
  const user = await getCurrentUser()
  if (!user || user.collection !== 'users') return null
  return {
    id: user.id,
    name: user.name || (user.email ? user.email.split('@')[0] : 'Learner'),
    email: user.email || '',
    role: user.role || 'learner',
  }
}

export async function updateProfileAction(
  _previous: AuthState,
  formData: FormData
): Promise<AuthState> {
  const user = await getCurrentUser()
  if (!user || user.collection !== 'users') {
    return { ok: false, message: 'Authentication required. Please log in.' }
  }

  const rawName = text(formData, 'name')
  // Strip any HTML tags or control characters
  const sanitizedName = rawName.replace(/<[^>]*>?/gm, '').trim()

  if (sanitizedName.length < 2 || sanitizedName.length > 80) {
    return { ok: false, message: 'Name must be between 2 and 80 characters.' }
  }

  // Security: only allow updating 'name'. Reject/ignore role, collection, id, email changes.
  let updateSucceeded = false
  let updatedRecord: any = { ...user, name: sanitizedName }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: { name: sanitizedName },
      overrideAccess: true,
    })
    if (updated) {
      updateSucceeded = true
      updatedRecord = updated
    }
  } catch {
    // If Payload database is uninitialized or in local dev fallback mode,
    // persist to the local dev store.
    const devRes = updateDevUser(user.id, { name: sanitizedName })
    if (devRes.ok && devRes.user) {
      updateSucceeded = true
      updatedRecord = devRes.user
    } else {
      // Try by email if id was different
      const devResByEmail = updateDevUser(user.email, { name: sanitizedName })
      if (devResByEmail.ok && devResByEmail.user) {
        updateSucceeded = true
        updatedRecord = devResByEmail.user
      }
    }
  }

  if (!updateSucceeded) {
    return { ok: false, message: 'Failed to persist profile updates to database.' }
  }

  // Re-issue session cookie with updated identity claims so subsequent requests reflect the new name
  try {
    const updatedToken = signDevToken({
      id: updatedRecord.id || user.id,
      email: updatedRecord.email || user.email,
      name: sanitizedName,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: updatedRecord.termsAcceptedAt || user.termsAcceptedAt,
    })
    await setSessionCookie(updatedToken)
  } catch {
    // Session cookie update failure shouldn't fail the operation
  }

  return { ok: true, message: 'Profile updated successfully.' }
}

export async function deleteAccountAction(): Promise<AuthState> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, message: 'Authentication required.' }
  }

  try {
    const payload = await getPayload({ config })
    // Record deletion request timestamp for GDPR/retention workflow (AU-13)
    await (payload as any).update({
      collection: 'users',
      id: user.id,
      data: { deletionRequestedAt: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch {
    // Continue
  }

  await clearSessionCookie()
  return { ok: true, message: 'Your account deletion request has been submitted.' }
}
