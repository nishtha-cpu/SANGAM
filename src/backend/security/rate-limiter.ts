/**
 * SANGAM — Authentication & Operation Rate Limiter
 * Implements an in-memory sliding window rate limiter to protect
 * authentication endpoints from brute force and credential stuffing.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

/**
 * Periodically clean up expired rate limit keys to avoid memory leaks.
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }, 60 * 1000).unref?.()
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Checks and increments rate limit counter for a specific key.
 *
 * @param key Unique key (e.g. `login:ip:127.0.0.1` or `reset:email@domain.com`)
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds (e.g. 15 * 60 * 1000 for 15 min)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    // New or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterSeconds: 0,
    }
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  record.count += 1
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfterSeconds: 0,
  }
}

/**
 * Reset rate limit key (e.g. upon successful authentication).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
