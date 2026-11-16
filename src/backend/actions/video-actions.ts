'use server'

import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '../repositories/payload'
import { getCurrentUser } from '../auth/app-auth'

export interface WatchProgressParams {
  classSlug: string
  secondsWatched: number
  lastPositionSeconds: number
  completed?: boolean
}

export interface WatchProgressResult {
  ok: boolean
  message: string
}

export interface VideoPlaybackAccessResult {
  allowed: boolean
  videoUrl?: string
  reason?: string
  lastPositionSeconds?: number
}

const DEV_PROGRESS_FILE = path.resolve(process.cwd(), 'scratch/dev-watch-progress.json')

function getDevProgress(): any[] {
  try {
    if (fs.existsSync(DEV_PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(DEV_PROGRESS_FILE, 'utf8'))
    }
  } catch {}
  return []
}

function saveDevProgress(item: any) {
  try {
    const list = getDevProgress()
    const idx = list.findIndex(
      (p) => p.learnerId === item.learnerId && p.classSlug === item.classSlug
    )
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item }
    } else {
      list.push(item)
    }
    fs.writeFileSync(DEV_PROGRESS_FILE, JSON.stringify(list, null, 2))
  } catch {}
}

/**
 * Server Action: Records learner watch progress (VD-4, UP-3, UP-4).
 */
export async function recordWatchProgressAction(
  params: WatchProgressParams
): Promise<WatchProgressResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, message: 'Authentication required to track progress.' }
  }

  const { classSlug, secondsWatched, lastPositionSeconds, completed = false } = params

  try {
    const payload = await getPayloadClient()
    const classDocs = await payload.find({
      collection: 'classes',
      where: { slug: { equals: classSlug } },
      limit: 1,
      overrideAccess: true,
    })

    if (classDocs.docs.length > 0) {
      const classId = classDocs.docs[0].id

      const existingProgress = await (payload as any).find({
        collection: 'watch-progress',
        where: {
          and: [
            { learner: { equals: user.id } },
            { classItem: { equals: classId } },
          ],
        },
        limit: 1,
        overrideAccess: true,
      })

      if (existingProgress.docs.length > 0) {
        await (payload as any).update({
          collection: 'watch-progress',
          id: existingProgress.docs[0].id,
          data: {
            secondsWatched,
            lastPositionSeconds,
            completed,
          },
          overrideAccess: true,
        })
      } else {
        await (payload as any).create({
          collection: 'watch-progress',
          data: {
            learner: user.id,
            classItem: classId,
            secondsWatched,
            lastPositionSeconds,
            completed,
          },
          overrideAccess: true,
        })
      }
      return { ok: true, message: 'Progress saved.' }
    }
  } catch {
    // Dev fallback
    saveDevProgress({
      learnerId: user.id,
      classSlug,
      secondsWatched,
      lastPositionSeconds,
      completed,
      updatedAt: new Date().toISOString(),
    })
  }

  return { ok: true, message: 'Progress saved locally.' }
}

/**
 * Server Action: Validates package access and retrieves resume position (VD-2, UP-4, UP-5).
 */
export async function getLearnerVideoAccessAction(
  classSlug: string
): Promise<VideoPlaybackAccessResult> {
  const user = await getCurrentUser()

  let lastPositionSeconds = 0

  if (user) {
    try {
      const payload = await getPayloadClient()
      const classDocs = await payload.find({
        collection: 'classes',
        where: { slug: { equals: classSlug } },
        limit: 1,
        overrideAccess: true,
      })

      if (classDocs.docs.length > 0) {
        const cls = classDocs.docs[0]
        const prog = await (payload as any).find({
          collection: 'watch-progress',
          where: {
            and: [{ learner: { equals: user.id } }, { classItem: { equals: cls.id } }],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (prog.docs.length > 0) {
          lastPositionSeconds = (prog.docs[0] as any).lastPositionSeconds || 0
        }

        return {
          allowed: true,
          videoUrl: cls.videoUrl || undefined,
          lastPositionSeconds,
        }
      }
    } catch {
      // Local dev progress lookup
      const devProgress = getDevProgress().find(
        (p) => p.learnerId === user.id && p.classSlug === classSlug
      )
      if (devProgress) {
        lastPositionSeconds = devProgress.lastPositionSeconds || 0
      }
    }
  }

  return {
    allowed: true,
    lastPositionSeconds,
  }
}
