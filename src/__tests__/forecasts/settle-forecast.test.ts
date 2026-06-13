import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Prisma
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()

vi.mock("@/lib/db", () => ({
  default: {
    forecast: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

// Ensure AI and search are NOT called
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
  status: "OPEN",
  currentProbability: 0.64,
  type: "BINARY",
  creatorId: "user-a",
}

const mockAnonForecast = {
  ...mockForecast,
  creatorId: null,
}

describe("settleForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(mockForecast)
    mockUpdate.mockResolvedValue({ ...mockForecast, status: "SETTLED" })
  })

  // Basic functioning
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

  // Permission: owner
  it("allows settlement when creatorId matches currentUserId", async () => {
    await expect(
      settleForecast("fc-1", "YES", "user-a")
    ).resolves.toBeDefined()
  })

  // Permission: unauthorized (not logged in)
  it("throws UnauthorizedError when creatorId exists and currentUserId is null", async () => {
    await expect(settleForecast("fc-1", "YES", null)).rejects.toThrow(
      UnauthorizedError
    )
    await expect(settleForecast("fc-1", "YES", null)).rejects.toThrow(
      "signed in"
    )
  })

  // Permission: forbidden (wrong user)
  it("throws ForbiddenError when creatorId exists and currentUserId differs", async () => {
    await expect(settleForecast("fc-1", "YES", "user-b")).rejects.toThrow(
      ForbiddenError
    )
    await expect(settleForecast("fc-1", "YES", "user-b")).rejects.toThrow(
      "creator"
    )
  })

  // Permission: anonymous forecast
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

  // Not found
  it("throws when forecast not found (before permission check)", async () => {
    mockFindUnique.mockResolvedValue(null)
    await expect(settleForecast("fc-missing", "YES", "user-a")).rejects.toThrow(
      "not found"
    )
  })

  // Already settled
  it("throws when already settled", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockForecast,
      status: "SETTLED",
    })
    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "already been settled"
    )
  })

  // Correct update
  it("updates forecast with correct fields", async () => {
    await settleForecast("fc-1", "YES", "user-a")
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "fc-1" },
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
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "fc-1" },
      data: expect.objectContaining({ settlementResult: false }),
    })
  })

  // No probability
  it("throws when no probability available", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockForecast,
      currentProbability: null,
    })
    await expect(settleForecast("fc-1", "YES", "user-a")).rejects.toThrow(
      "no probability"
    )
  })
})
