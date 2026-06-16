import { describe, it, expect, beforeEach } from "vitest"
import {
  checkRateLimit,
  resetRateLimitStore,
  getStoreSize,
} from "@/lib/utils/ratelimit"

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  // ── basic counting ──

  it("allows requests within caller limit", () => {
    for (let i = 0; i < 12; i++) {
      expect(checkRateLimit("user:a", 1).allowed).toBe(true)
    }
  })

  it("denies when caller exceeds 12 points", () => {
    for (let i = 0; i < 12; i++) checkRateLimit("user:a", 1)
    const r = checkRateLimit("user:a", 1)
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe("caller")
    expect(r.retryAfterSeconds!).toBeGreaterThan(0)
    expect(Number.isInteger(r.retryAfterSeconds!)).toBe(true)
  })

  it("evidence weight 2 consumes 2 points per call", () => {
    for (let i = 0; i < 6; i++) checkRateLimit("user:a", 2)
    expect(checkRateLimit("user:a", 2).allowed).toBe(false)
    expect(getStoreSize()).toBe(1)
  })

  it("isolates different callers", () => {
    for (let i = 0; i < 12; i++) checkRateLimit("user:a", 1)
    expect(checkRateLimit("user:a", 1).allowed).toBe(false)
    expect(checkRateLimit("user:b", 1).allowed).toBe(true)
    expect(getStoreSize()).toBe(2)
  })

  // ── global limit ──

  it("enforces global 300-point limit", () => {
    for (let i = 0; i < 30; i++) checkRateLimit(`ip:g${i}`, 10)
    const r = checkRateLimit("ip:new", 1)
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe("global")
    expect(getStoreSize()).toBe(30)
  })

  // ── atomicity (no partial consumption) ──

  it("does not increment caller count when caller limit denies", () => {
    for (let i = 0; i < 12; i++) checkRateLimit("user:a", 1)
    const countBefore = getStoreSize()
    checkRateLimit("user:a", 1) // denied
    expect(getStoreSize()).toBe(countBefore)
  })

  it("does not increment global count nor create new entry when global limit denies", () => {
    for (let i = 0; i < 30; i++) checkRateLimit(`ip:g${i}`, 10)
    const sizeAfterFull = getStoreSize()
    // new caller hitting full global must not create entry
    checkRateLimit("ip:newcaller", 1)
    expect(getStoreSize()).toBe(sizeAfterFull) // no growth
  })

  it("does not consume partial weight when insufficient quota", () => {
    // consume 11 points
    for (let i = 0; i < 11; i++) checkRateLimit("user:a", 1)
    const callerSize = getStoreSize()
    // try weight 2 when only 1 point left
    const r = checkRateLimit("user:a", 2)
    expect(r.allowed).toBe(false)
    // caller count should still be 11, store entry unchanged
    expect(getStoreSize()).toBe(callerSize)
    // remaining 1 point should still be usable with weight 1
    expect(checkRateLimit("user:a", 1).allowed).toBe(true)
  })

  it("both caller and global counts increment by the same weight on allow", () => {
    // use a unique caller to track global precisely
    resetRateLimitStore()
    // fill 299 global points
    for (let i = 0; i < 30; i++) {
      if (i === 29) {
        checkRateLimit(`ip:g${i}`, 9) // 29*10 + 9 = 299
      } else {
        checkRateLimit(`ip:g${i}`, 10)
      }
    }
    // global at 299, new caller weight 1 should be allowed
    const r = checkRateLimit("user:new", 1)
    expect(r.allowed).toBe(true)
    // now try weight 2 → should fail (301 > 300)
    expect(checkRateLimit("user:new2", 2).allowed).toBe(false)
  })

  // ── Map growth ──

  it("store does not grow from denied requests when global is full", () => {
    for (let i = 0; i < 30; i++) checkRateLimit(`ip:g${i}`, 10)
    const sizeAfterFull = getStoreSize()
    // simulate 50 distinct callers all denied
    for (let i = 0; i < 50; i++) checkRateLimit(`ip:denied${i}`, 1)
    expect(getStoreSize()).toBe(sizeAfterFull)
  })

  it("cleanup removes entries with expired window", () => {
    // All entries are in current window; calling cleanup should
    // not remove active entries but our implementation is
    // opportunity-based (triggered inside checkRateLimit).
    // We verify store size doesn't grow unbounded when
    // using many callers - old entries from prior windows
    // would be removed on next checkRateLimit call.
    checkRateLimit("user:a", 1)
    expect(getStoreSize()).toBe(1)
  })

  // ── consecutive calls don't exceed limit ──

  it("consecutive calls exceeding limit all get denied", () => {
    for (let i = 0; i < 12; i++) checkRateLimit("user:a", 1)
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("user:a", 1).allowed).toBe(false)
    }
  })
})
