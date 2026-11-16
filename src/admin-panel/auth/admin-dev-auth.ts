import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const ADMIN_DEV_SECRET =
  process.env.ADMIN_DEV_SECRET ||
  process.env.DEV_AUTH_SECRET ||
  'sangam-admin-dev-hmac-secret-isolated-2026'

const DEV_ADMINS_FILE = path.resolve(process.cwd(), 'scratch/dev-admins.json')

export interface DevAdmin {
  id: string
  email: string
  hash: string
  salt: string
  collection: 'admins'
  role: 'admin'
  createdAt: string
}

export interface DevSessionAdmin {
  id: string
  email: string
  collection: 'admins'
  role: 'admin'
}

function getDevAdmins(): DevAdmin[] {
  try {
    if (fs.existsSync(DEV_ADMINS_FILE)) {
      const content = fs.readFileSync(DEV_ADMINS_FILE, 'utf8')
      return JSON.parse(content)
    }
  } catch {
    // If reading fails or file is empty, return empty list
  }
  return []
}

function saveDevAdmins(admins: DevAdmin[]): void {
  try {
    const dir = path.dirname(DEV_ADMINS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DEV_ADMINS_FILE, JSON.stringify(admins, null, 2), 'utf8')
  } catch (err) {
    console.error('[admin-dev-auth] Failed to persist admin store:', err)
  }
}

export function isFirstAdminProvisioned(): boolean {
  return getDevAdmins().length > 0
}

export function hashAdminPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

export function verifyAdminPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashAdminPassword(password, salt)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
}

/**
 * One-time bootstrap function to provision the initial administrator.
 * Rejects if an administrator is already provisioned.
 */
export function provisionFirstAdmin({
  email,
  password,
}: {
  email: string
  password: string
}): { ok: boolean; message: string; admin?: DevSessionAdmin } {
  const admins = getDevAdmins()
  const cleanEmail = email.trim().toLowerCase()

  // Enforce one-time first admin rule
  if (admins.length > 0) {
    return {
      ok: false,
      message: 'An administrator account is already provisioned in the local environment.',
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    return { ok: false, message: 'Invalid email address format.' }
  }

  // Validate strong password complexity
  if (password.length < 10) {
    return { ok: false, message: 'Password must be at least 10 characters long.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: 'Password must include at least one uppercase letter.' }
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, message: 'Password must include at least one lowercase letter.' }
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: 'Password must include at least one digit.' }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { ok: false, message: 'Password must include at least one special symbol.' }
  }

  const { hash, salt } = hashAdminPassword(password)
  const newAdmin: DevAdmin = {
    id: `adm-${crypto.randomBytes(6).toString('hex')}`,
    email: cleanEmail,
    hash,
    salt,
    collection: 'admins',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }

  admins.push(newAdmin)
  saveDevAdmins(admins)

  return {
    ok: true,
    message: 'Initial administrator successfully provisioned.',
    admin: {
      id: newAdmin.id,
      email: newAdmin.email,
      collection: 'admins',
      role: 'admin',
    },
  }
}

/**
 * Authenticate an administrator against the local dev store.
 */
export function authenticateDevAdmin(
  email: string,
  password: string
): { ok: boolean; admin?: DevSessionAdmin; message?: string } {
  const admins = getDevAdmins()
  const cleanEmail = email.trim().toLowerCase()

  const match = admins.find((a) => a.email.toLowerCase() === cleanEmail)
  if (!match) {
    return { ok: false, message: 'Invalid administrator credentials.' }
  }

  if (!verifyAdminPassword(password, match.hash, match.salt)) {
    return { ok: false, message: 'Invalid administrator credentials.' }
  }

  return {
    ok: true,
    admin: {
      id: match.id,
      email: match.email,
      collection: 'admins',
      role: 'admin',
    },
  }
}

/**
 * Generate a cryptographically signed HMAC token for the administrator session.
 */
export function signAdminDevToken(admin: DevSessionAdmin): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      id: admin.id,
      email: admin.email,
      role: 'admin',
      collection: 'admins',
      exp: Math.floor(Date.now() / 1000) + 8 * 3600, // 8 hours
    })
  ).toString('base64url')

  const signature = crypto
    .createHmac('sha256', ADMIN_DEV_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}

/**
 * Verify administrator session token.
 * STRICTLY rejects non-admin tokens.
 */
export function verifyAdminDevToken(token: string): DevSessionAdmin | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts

    const expected = crypto
      .createHmac('sha256', ADMIN_DEV_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))

    // Expiration check
    if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // Strict collection invariant
    if (data.collection !== 'admins') {
      return null
    }

    return {
      id: String(data.id),
      email: String(data.email),
      role: 'admin',
      collection: 'admins',
    }
  } catch {
    return null
  }
}
