import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  ExternalServiceTimeoutError,
  createTimeoutSignal,
  withTimeout,
} from "@/lib/utils/timeout"

describe("ExternalServiceTimeoutError", () => {
  it("stores service and timeoutMs", () => {
    const err = new ExternalServiceTimeoutError("deepseek", 60_000)
    expect(err.service).toBe("deepseek")
    expect(err.timeoutMs).toBe(60_000)
    expect(err.name).toBe("ExternalServiceTimeoutError")
  })

  it("includes service and ms in message", () => {
    const err = new ExternalServiceTimeoutError("tavily", 20_000)
    expect(err.message).toContain("tavily")
    expect(err.message).toContain("20000")
  })
})

describe("createTimeoutSignal", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns an AbortSignal and a clear function", () => {
    const { signal, clear } = createTimeoutSignal(5000)
    expect(signal).toBeInstanceOf(AbortSignal)
    expect(signal.aborted).toBe(false)
    expect(typeof clear).toBe("function")
  })

  it("aborts after the specified timeout", () => {
    const { signal } = createTimeoutSignal(1000)
    expect(signal.aborted).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(signal.aborted).toBe(true)
  })

  it("clear prevents the abort", () => {
    const { signal, clear } = createTimeoutSignal(1000)
    clear()
    vi.advanceTimersByTime(1000)
    expect(signal.aborted).toBe(false)
  })
})

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the task result when it completes before timeout", async () => {
    const result = await withTimeout("deepseek", 5000, async () => "ok")
    expect(result).toBe("ok")
  })

  it("throws ExternalServiceTimeoutError when task times out", async () => {
    const task = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          // Simulate an abort-triggered rejection
          const err = new Error("The operation was aborted")
          err.name = "AbortError"
          reject(err)
        })
    )

    const promise = withTimeout("deepseek", 1000, () => task())
    vi.advanceTimersByTime(1000)

    await expect(promise).rejects.toThrow(ExternalServiceTimeoutError)
    await expect(promise).rejects.toMatchObject({
      service: "deepseek",
      timeoutMs: 1000,
    })
  })

  it("propagates non-abort errors untouched", async () => {
    const originalError = new Error("Some other failure")
    const promise = withTimeout("deepseek", 5000, async () => {
      throw originalError
    })
    await expect(promise).rejects.toBe(originalError)
  })

  it("clears the timer after successful completion", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout")

    const task = vi.fn().mockResolvedValue("done")
    await withTimeout("tavily", 20000, task)

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
