import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindUnique = vi.fn()
const mockUpdateMany = vi.fn()

vi.mock("@/lib/db", () => ({
  default: {
    forecast: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}))

vi.mock("ai", () => ({
  generateObject: vi.fn(() => {
    throw new Error("AI should not be called during settlement")
  }),
}))

vi.mock("@/lib/search/tavily", () => ({
  tavilySearch: vi.fn(() => {
    throw new Error("Tavily should not be called during settlement")
  }),
}))

import {
  settleForecast,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/forecasts/settle/settle-forecast"

const mockForecast = {
  id: "fc-1",
  status: "DRAFT",
  currentProbability: 0.64,
  type: "BINARY",
  creatorId: "user-a",
  outcome: null,
}

const mockAnonForecast = {
  ...mockForecast,
  creatorId: null,
}

describe("settleForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(mockForecast)
    mockUpdateMany.mockResolvedValue({ count: 1 })
  })

  it("settles forecast and returns result when creator matches", async () => {
    const result = await settleForecast("fc-1", "YES", "user-a")
    expect(result.id).toBe("fc-1")
    expect(result.status).toBe("SETTLED")
    expect(result.outcome).toBe("YES")
    expect(result.brierScore).toBe(0.1296)
  })

  it("calculates correct brierScore for NO", async () => {
    const result = await settleForecast("fc-1", "NO", "user-a")
    expect(result.brierScore).toBe(0.4096)
  })

  it("allows settlement when creatorId matches currentUserId", async () => {
    await expect(
      settleForecast("fc-1", "YES", "user-a")
    ).resolves.toBeDefined()
  })

  it("throws UnauthorizedError when creatorId exists and currentUserId is null", async () => {
    await expect(settleForecast("fc-1", "YES", null)).rejects.toThrow(
      UnauthorizedError
    )
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it("throws ForbiddenError when creatorId exists and currentUserId differs", async () => {
    await expect(settleForecast("fc-1", "YES", "user-b")).rejects.toThrow(
      ForbiddenError
    )
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it("allows settlement of anonymous forecast without user", async () => {
    mockFindUnique.mockResolvedValue(mockAnonForecast)
    const result = await settleForecast("fc-1", "YES", null)
    expect(result.status).toBe("SETTLED")
  })

  it("allows settlement of anonymous forecast with any user", async () => {
    mockFindUnique.mockResolvedValue(mockAnonForecast)
    const result = await settleForecast("fc-1", "NO", "user-b")
    expect(result.status).toBe("SETTLED")
  })

  it("throws when forecast not found", async () => {
    mockFindUnique.mockResolvedValue(null)
    await expect(
      settleForecast("fc-missing", "YES", "user-a")
    ).rejects.toThrow("not found")
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it("throws when already settled (initial read)", async () => {
    mockFindUnique.mockResolvedValue({ ...mockForecast, status: "SETTLED" })
    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "already been settled"
    )
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it("uses updateMany with DRAFT + outcome:null condition", async () => {
    await settleForecast("fc-1", "YES", "user-a")
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "fc-1", status: "DRAFT", outcome: null },
      data: expect.objectContaining({
        status: "SETTLED",
        outcome: "YES",
        brierScore: expect.any(Number),
        settlementResult: true,
      }),
    })
  })

  it("sets settlementResult false for NO", async () => {
    await settleForecast("fc-1", "NO", "user-a")
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "fc-1", status: "DRAFT", outcome: null },
      data: expect.objectContaining({ settlementResult: false }),
    })
  })

  it("throws when no probability available", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockForecast,
      currentProbability: null,
    })
    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "no probability"
    )
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it("throws already-settled when updateMany returns count 0", async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 })
    // Mock re-read after race loss
    mockFindUnique
      .mockResolvedValueOnce(mockForecast) // initial read
      .mockResolvedValueOnce({ ...mockForecast, status: "SETTLED", outcome: "YES" }) // re-read

    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "already been settled"
    )
  })

  it("throws not-found when updateMany count=0 and record deleted", async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 })
    mockFindUnique
      .mockResolvedValueOnce(mockForecast) // initial read
      .mockResolvedValueOnce(null) // re-read: gone

    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "not found"
    )
  })

  // ── concurrent race tests ──

  it("YES + YES race: exactly one succeeds", async () => {
    // First call will get count=1, second will get count=0
    let callCount = 0
    mockUpdateMany.mockImplementation(() => {
      callCount++
      return Promise.resolve({ count: callCount === 1 ? 1 : 0 })
    })
    // Re-read for loser returns settled
    mockFindUnique
      .mockResolvedValueOnce(mockForecast)
      .mockResolvedValueOnce({ ...mockForecast, status: "SETTLED", outcome: "YES" })

    const results = await Promise.allSettled([
      settleForecast("fc-1", "YES", "user-a"),
      settleForecast("fc-1", "YES", "user-a"),
    ])

    const fulfilled = results.filter((r) => r.status === "fulfilled")
    const rejected = results.filter((r) => r.status === "rejected")

    expect(fulfilled.length).toBe(1)
    expect(rejected.length).toBe(1)
    expect((fulfilled[0] as PromiseFulfilledResult<unknown>).value).toMatchObject({
      status: "SETTLED",
      outcome: "YES",
    })

    const rejectedErr = (rejected[0] as PromiseRejectedResult).reason
    expect(rejectedErr.message).toContain("already been settled")
  })

  it("YES + NO race: exactly one succeeds, no overwrite", async () => {
    let callCount = 0
    mockUpdateMany.mockImplementation(() => {
      callCount++
      return Promise.resolve({ count: callCount === 1 ? 1 : 0 })
    })
    // For the first call: ensures initial read passes
    mockFindUnique
      .mockResolvedValueOnce(mockForecast) // winner initial
      .mockResolvedValueOnce(mockForecast) // loser initial
      .mockResolvedValueOnce({ ...mockForecast, status: "SETTLED", outcome: "YES" }) // loser re-read

    const results = await Promise.allSettled([
      settleForecast("fc-1", "YES", "user-a"),
      settleForecast("fc-1", "NO", "user-a"),
    ])

    const fulfilled = results.filter((r) => r.status === "fulfilled")
    const rejected = results.filter((r) => r.status === "rejected")

    expect(fulfilled.length).toBe(1)
    expect(rejected.length).toBe(1)

    const rejectedErr = (rejected[0] as PromiseRejectedResult).reason
    expect(rejectedErr.message).toContain("already been settled")
  })
})
