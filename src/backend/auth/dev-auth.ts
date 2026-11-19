import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const DEV_AUTH_SECRET =
  process.env.DEV_AUTH_SECRET || 'sangam-dev-hmac-secret-2026-auth-fallback-only'
const DEV_USERS_FILE = path.resolve(process.cwd(), 'scratch/dev-users.json')

export type DevUser = {
  id: string
  name: string
  email: string
  hash: string
  salt: string
  role: 'learner'
  termsAcceptedAt: string
  createdAt: string
  isActive?: boolean
}

export type DevSessionUser = {
  id: string
  email: string
  name: string
  role: 'learner'
  collection: 'users'
  termsAcceptedAt?: string
}

export function getDevUsers(): DevUser[] {
  try {
    if (fs.existsSync(DEV_USERS_FILE)) {
      const content = fs.readFileSync(DEV_USERS_FILE, 'utf8')
      return JSON.parse(content)
    }
  } catch {
    // If reading fails, fall back to empty
  }
  return []
}

export function updateDevUser(
  idOrEmail: string,
  updates: { name?: string; isActive?: boolean }
): { ok: boolean; user?: DevSessionUser; message?: string } {
  const users = getDevUsers()
  const normalizedKey = idOrEmail.toLowerCase().trim()
  const userIndex = users.findIndex(
    (u) => u.id === idOrEmail || u.email.toLowerCase() === normalizedKey
  )

  if (userIndex === -1) {
    return { ok: false, message: 'User record not found in local store.' }
  }

  if (updates.name !== undefined) {
    const trimmed = updates.name.trim()
    if (trimmed.length < 2 || trimmed.length > 80) {
      return { ok: false, message: 'Name must be between 2 and 80 characters.' }
    }
    users[userIndex].name = trimmed
  }

  if (updates.isActive !== undefined) {
    users[userIndex].isActive = updates.isActive
  }

  saveDevUsers(users)

  const updated = users[userIndex]
  return {
    ok: true,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: updated.termsAcceptedAt,
    },
  }
}

function saveDevUsers(users: DevUser[]): void {
  try {
    const dir = path.dirname(DEV_USERS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DEV_USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
  } catch (err) {
    console.error('[dev-auth] Failed to persist local user:', err)
  }
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPassword(password, salt)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
}

export function signDevToken(user: DevSessionUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: user.termsAcceptedAt,
      exp: Math.floor(Date.now() / 1000) + 8 * 3600, // 8 hours
    }),
  ).toString('base64url')

  const signature = crypto
    .createHmac('sha256', DEV_AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}

export function verifyDevToken(token: string): DevSessionUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts
    const expected = crypto
      .createHmac('sha256', DEV_AUTH_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null
    if (data.collection !== 'users') return null

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: data.termsAcceptedAt,
    }
  } catch {
    return null
  }
}

export function registerDevUser(data: {
  name: string
  email: string
  password: string
}): { ok: boolean; user?: DevSessionUser; message?: string } {
  const users = getDevUsers()
  const normalizedEmail = data.email.toLowerCase().trim()

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return {
      ok: false,
      message: 'An account with this email may already be registered. Try logging in.',
    }
  }

  const { hash, salt } = hashPassword(data.password)
  const now = new Date().toISOString()
  const newUser: DevUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: normalizedEmail,
    hash,
    salt,
    role: 'learner',
    termsAcceptedAt: now,
    createdAt: now,
  }

  users.push(newUser)
  saveDevUsers(users)

  return {
    ok: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: now,
    },
  }
}

export function authenticateDevUser(
  email: string,
  password: string,
): { ok: boolean; user?: DevSessionUser; message?: string } {
  const users = getDevUsers()
  const normalizedEmail = email.toLowerCase().trim()
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (!user || !verifyPassword(password, user.hash, user.salt)) {
    return { ok: false, message: 'Incorrect email or password.' }
  }

  if (user.isActive === false) {
    return { ok: false, message: 'Your account has been deactivated. Please contact support.' }
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: user.termsAcceptedAt,
    },
  }
}

/**
 * Find or create a learner authenticated via Google OAuth (Module 3).
 */
export function findOrCreateGoogleDevUser(data: {
  googleId: string
  email: string
  name: string
}): { ok: boolean; user: DevSessionUser } {
  const users = getDevUsers()
  const normalizedEmail = data.email.toLowerCase().trim()
  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  const now = new Date().toISOString()
  if (user) {
    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'learner',
        collection: 'users',
        termsAcceptedAt: user.termsAcceptedAt,
      },
    }
  }

  const { hash, salt } = hashPassword(crypto.randomBytes(32).toString('hex'))
  const newUser: DevUser = {
    id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    hash,
    salt,
    role: 'learner',
    termsAcceptedAt: now,
    createdAt: now,
  }

  users.push(newUser)
  saveDevUsers(users)

  return {
    ok: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'learner',
      collection: 'users',
      termsAcceptedAt: now,
    },
  }
}
