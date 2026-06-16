import { getCurrentUserId } from "@/lib/auth/current-user"

/**
 * Resolve a rate-limit caller key from the incoming request.
 *
 * Logged-in users use "user:<sessionUserId>".
 * Anonymous users use "ip:<normalized-proxy-ip>".
 * If no IP can be resolved, uses "ip:unknown".
 *
 * Never trusts client-submitted user ID from body or query.
 */

function resolveIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    const trimmed = realIp.trim()
    if (trimmed) return trimmed
  }

  return "unknown"
}

export async function resolveCallerKey(request: Request): Promise<string> {
  const userId = await getCurrentUserId()
  if (userId) {
    return `user:${userId}`
  }

  const ip = resolveIp(request)
  return `ip:${ip}`
}
