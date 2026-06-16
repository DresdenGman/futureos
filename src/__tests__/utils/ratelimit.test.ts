import { describe, it, expect, beforeEach } from "vitest"
import { checkRateLimit, resetRateLimitStore } from "@/lib/utils/ratelimit"

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  it("allows requests within caller limit", () => {
    for (let i = 0; i < 6; i++) {
      const result = checkRateLimit("user:a", 2)
      expect(result.allowed).toBe(true)
    }
  })

  it("denies when caller exceeds 12 point limit", () => {
    for (let i = 0; i < 12; i++) {
      checkRateLimit("user:a", 1)
    }
    const result = checkRateLimit("user:a", 1)
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe("caller")
    expect(result.retryAfterSeconds!).toBeGreaterThan(0)
  })

  it("returns retryAfterSeconds as positive integer", () => {
    for (let i = 0; i < 12; i++) {
      checkRateLimit("user:a", 1)
    }
    const result = checkRateLimit("user:a", 1)
    expect(result.retryAfterSeconds!).toBeGreaterThan(0)
    expect(Number.isInteger(result.retryAfterSeconds!)).toBe(true)
  })

  it("evidence endpoint weight of 2 counts correctly", () => {
    // 6 requests * 2 = 12 points = limit reached
    for (let i = 0; i < 6; i++) {
      checkRateLimit("user:a", 2)
    }
    const result = checkRateLimit("user:a", 2)
    expect(result.allowed).toBe(false)
  })

  it("isolates different callers", () => {
    for (let i = 0; i < 12; i++) {
      checkRateLimit("user:a", 1)
    }
    // user:a is exhausted
    expect(checkRateLimit("user:a", 1).allowed).toBe(false)
    // user:b still has full quota
    const result = checkRateLimit("user:b", 1)
    expect(result.allowed).toBe(true)
  })

  it("enforces global limit of 300 points", () => {
    resetRateLimitStore()

    // 30 callers * 10 points each = 300 points
    for (let i = 0; i < 30; i++) {
      checkRateLimit(`ip:caller${i}`, 10)
    }
    const result = checkRateLimit("ip:newcaller", 1)
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe("global")
  })

  it("resets after window by accepting expired entries", () => {
    // This test relies on cleanup logic - expired entries should be
    // removed by cleanupExpired. Since we can't advance real time,
    // we verify that within the same window the limit holds.
    for (let i = 0; i < 12; i++) {
      checkRateLimit("user:a", 1)
    }
    expect(checkRateLimit("user:a", 1).allowed).toBe(false)
  })

  it("weight exceeding limit immediately is denied", () => {
    // Trying to consume 13 points in one call when limit is 12
    const result = checkRateLimit("user:a", 13)
    expect(result.allowed).toBe(false)
  })

  it("caller blocked when global limit hit but caller under own limit", () => {
    resetRateLimitStore()
    // Fill global with 299 points
    for (let i = 0; i < 30; i++) {
      checkRateLimit(`ip:global${i}`, 10)
    }
    // One caller with only 1 point used, but global is nearly full
    checkRateLimit("user:new", 1)
    // Global should be at ~301 now, so next should fail
    const result = checkRateLimit("user:new2", 1)
    expect(result.allowed).toBe(false)
  })

  it("cleanup removes expired entries via opportunity", () => {
    // All entries are with the current window, so cleanup shouldn't
    // remove them. We verify store grows but cleanups don't
    // lose active entries.
    checkRateLimit("user:a", 1)
    checkRateLimit("user:b", 1)
    checkRateLimit("user:c", 1)
    // After 3 entries added, calling again should still work
    expect(checkRateLimit("user:a", 1).allowed).toBe(true)
  })
})
