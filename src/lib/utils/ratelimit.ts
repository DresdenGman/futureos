/**
 * In-memory fixed-window rate limiter for AI endpoints.
 *
 * Known limitations (single-instance Beta only):
 * - Counts reset when Render restarts.
 * - Multiple instances do not share quota.
 * - Cannot defend against large-scale distributed IP attacks.
 * - Proxy IP trustworthiness depends on the hosting platform (Render).
 */

interface WindowEntry {
  count: number
  windowStart: number
}

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const CALLER_LIMIT = 12
const GLOBAL_LIMIT = 300

const store: Map<string, WindowEntry> = new Map()

function getWindowStart(now: number): number {
  return now - (now % WINDOW_MS)
}

function cleanupExpired(now: number) {
  const windowStart = getWindowStart(now)
  for (const key of Array.from(store.keys())) {
    const entry = store.get(key)
    if (entry && entry.windowStart < windowStart) {
      store.delete(key)
    }
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds?: number
  reason?: "caller" | "global"
}

export function checkRateLimit(
  callerKey: string,
  weight: number
): RateLimitResult {
  const now = Date.now()
  const windowStart = getWindowStart(now)

  cleanupExpired(now)

  const callerEntry = store.get(callerKey)
  const currentCallerCount = callerEntry?.windowStart === windowStart ? callerEntry.count : 0

  if (currentCallerCount + weight > CALLER_LIMIT) {
    const retryAfterSeconds = Math.ceil((windowStart + WINDOW_MS - now) / 1000)
    return {
      allowed: false,
      remaining: Math.max(0, CALLER_LIMIT - currentCallerCount),
      resetAt: windowStart + WINDOW_MS,
      retryAfterSeconds,
      reason: "caller",
    }
  }

  let globalCount = 0
  for (const entry of Array.from(store.values())) {
    if (entry.windowStart === windowStart) {
      globalCount += entry.count
    }
  }

  if (globalCount + weight > GLOBAL_LIMIT) {
    const retryAfterSeconds = Math.ceil((windowStart + WINDOW_MS - now) / 1000)
    return {
      allowed: false,
      remaining: Math.max(0, GLOBAL_LIMIT - globalCount),
      resetAt: windowStart + WINDOW_MS,
      retryAfterSeconds,
      reason: "global",
    }
  }

  const newCount = currentCallerCount + weight
  store.set(callerKey, { count: newCount, windowStart })

  const newGlobalCount = globalCount + weight
  const remaining = Math.max(0, GLOBAL_LIMIT - newGlobalCount)

  return {
    allowed: true,
    remaining,
    resetAt: windowStart + WINDOW_MS,
  }
}

export function resetRateLimitStore() {
  store.clear()
}

/** Returns the current number of entries in the rate limit store. For testing only. */
export function getStoreSize(): number {
  return store.size
}

export const ENDPOINT_WEIGHTS: Record<string, number> = {
  structure: 1,
  evidence: 2,
  probability: 1,
}
