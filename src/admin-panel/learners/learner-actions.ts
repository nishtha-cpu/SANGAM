'use server'

import { getPayloadClient } from '@/backend/repositories/payload'
import { getAdminUser } from '@/admin-panel/auth/admin-auth'
import { getDevUsers } from '@/backend/auth/dev-auth'

export type LearnerDirectoryItem = {
  id: string
  name: string
  email: string
  role?: string
  enrolledPackages: string[]
  emailVerified: boolean
  isActive: boolean
  termsAcceptedAt?: string
  createdAt: string
}

/**
 * Server Action: Retrieve all registered learners for directory view (AD-10, AD-11).
 */
export async function getLearnersDirectoryAction(): Promise<LearnerDirectoryItem[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  try {
    const payload = await getPayloadClient()
    const result = await (payload as any).find({
      collection: 'users',
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      return result.docs.map((u: any) => ({
        id: String(u.id),
        name: u.name || 'Anonymous Learner',
        email: u.email,
        role: u.role || 'learner',
        enrolledPackages: Array.isArray(u.enrolledPackages) ? u.enrolledPackages : [],
        emailVerified: Boolean(u.emailVerified),
        isActive: u.isActive !== undefined ? Boolean(u.isActive) : true,
        termsAcceptedAt: u.termsAcceptedAt,
        createdAt: u.createdAt,
      }))
    }
  } catch {}

  // Local dev mode fallback: read real dev users from local store
  const devUsers = getDevUsers()
  if (devUsers.length > 0) {
    return devUsers.map((u) => ({
      id: u.id,
      name: u.name || 'Anonymous Learner',
      email: u.email,
      role: u.role || 'learner',
      enrolledPackages: ['professional'],
      emailVerified: true,
      isActive: u.isActive !== false,
      termsAcceptedAt: u.termsAcceptedAt,
      createdAt: u.createdAt,
    }))
  }

  return []
}

/**
 * Server Action: Manually assign a package to a learner (AD-12, PY-5).
 */
export async function assignPackageManuallyAction(
  learnerId: string,
  packageKey: string
): Promise<{ ok: boolean; message: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized: Administrator access required.' }
  }

  const validPackages = ['foundation', 'professional', 'enterprise']
  const normalizedKey = packageKey.toLowerCase()
  if (!validPackages.includes(normalizedKey)) {
    return { ok: false, message: 'Invalid package selection.' }
  }

  try {
    const payload = await getPayloadClient()
    const userDoc = await (payload as any).findByID({
      collection: 'users',
      id: learnerId,
      overrideAccess: true,
    })

    if (!userDoc) {
      return { ok: false, message: 'Learner record not found.' }
    }

    const currentPackages = Array.isArray(userDoc.enrolledPackages) ? userDoc.enrolledPackages : []
    if (currentPackages.includes(normalizedKey)) {
      return { ok: true, message: `Learner is already enrolled in ${normalizedKey.toUpperCase()}.` }
    }

    const updated = [...currentPackages, normalizedKey]
    await (payload as any).update({
      collection: 'users',
      id: learnerId,
      data: {
        enrolledPackages: updated,
      },
      overrideAccess: true,
    })

    return {
      ok: true,
      message: `Successfully assigned ${normalizedKey.toUpperCase()} to ${userDoc.email}.`,
    }
  } catch (err: any) {
    return { ok: false, message: err.message || 'Failed to update learner packages.' }
  }
}

/**
 * Server Action: Revoke an enrolled package from a learner (AD-12).
 */
export async function revokePackageManuallyAction(
  learnerId: string,
  packageKey: string
): Promise<{ ok: boolean; message: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized.' }
  }

  try {
    const payload = await getPayloadClient()
    const userDoc = await (payload as any).findByID({
      collection: 'users',
      id: learnerId,
      overrideAccess: true,
    })

    if (!userDoc) {
      return { ok: false, message: 'Learner record not found.' }
    }

    const currentPackages = Array.isArray(userDoc.enrolledPackages) ? userDoc.enrolledPackages : []
    const updated = currentPackages.filter((p: string) => p !== packageKey.toLowerCase())

    await (payload as any).update({
      collection: 'users',
      id: learnerId,
      data: {
        enrolledPackages: updated,
      },
      overrideAccess: true,
    })

    return {
      ok: true,
      message: `Revoked ${packageKey.toUpperCase()} from ${userDoc.email}.`,
    }
  } catch (err: any) {
    return { ok: false, message: err.message || 'Failed to revoke package.' }
  }
}

/**
 * Server Action: Toggle active status (activation/deactivation) of a learner account (Module 5).
 */
export async function toggleLearnerActiveStatusAction(
  learnerId: string,
  newActiveState: boolean
): Promise<{ ok: boolean; message: string; isActive?: boolean }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized: Administrator access required.' }
  }

  try {
    const payload = await getPayloadClient()
    await (payload as any).update({
      collection: 'users',
      id: learnerId,
      data: {
        isActive: newActiveState,
      },
      overrideAccess: true,
    })
    return {
      ok: true,
      message: `Learner account ${newActiveState ? 'activated' : 'deactivated'} successfully.`,
      isActive: newActiveState,
    }
  } catch {
    // Local dev store fallback
    const { updateDevUser } = await import('@/backend/auth/dev-auth')
    const res = updateDevUser(learnerId, { isActive: newActiveState })
    if (res.ok) {
      return {
        ok: true,
        message: `Learner account ${newActiveState ? 'activated' : 'deactivated'} successfully.`,
        isActive: newActiveState,
      }
    }
    return { ok: false, message: res.message || 'Failed to toggle account active status.' }
  }
}

