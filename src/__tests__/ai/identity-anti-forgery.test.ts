import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockCheckRateLimit } = vi.hoisted(() => ({
  mockCheckRateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 10,
    resetAt: Date.now() + 900_000,
  })),
}))

vi.mock("@/lib/utils/ratelimit", () => ({
  checkRateLimit: mockCheckRateLimit,
  ENDPOINT_WEIGHTS: { structure: 1, evidence: 2, probability: 1 },
}))

// Mock auth so the route can resolve identity without NextAuth
vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve("real-github-id")),
}))

vi.mock("@/lib/ai/structure/structure-question", () => ({
  structureQuestion: vi.fn(() =>
    Promise.resolve({
      structuredQuestion: "Q",
      forecastType: "BINARY" as const,
      deadlineSuggestion: "2026-12-31",
      resolutionCriteria: "criteria",
      requiredClarifications: [],
      isForecastable: true,
    })
  ),
}))

import { POST } from "@/app/api/ai/structure/route"

const validBody = {
  originalQuestion: "Will Bitcoin reach $100K by end of 2026?",
  domain: "finance",
}

describe("rate limit identity cannot be forged", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 900_000,
    })
  })

  it("uses server-side resolved key (not client body)", async () => {
    const req = new Request("http://localhost/api/ai/structure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.0.55",
      },
      body: JSON.stringify({
        ...validBody,
        userId: "evil-forged-user",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    // The rate limiter was called with whatever resolveCallerKey returned
    const callArgs = mockCheckRateLimit.mock.calls[0] as unknown[] | undefined
    const calledKey = callArgs?.[0] as string | undefined
    // It must NOT contain the forged userId
    expect(calledKey).toBeDefined()
    expect(calledKey).not.toContain("evil-forged-user")
  })
})
