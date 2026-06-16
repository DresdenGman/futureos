import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const mockStructureQuestion = vi.fn()
const mockGatherEvidence = vi.fn()
const mockEstimateProbability = vi.fn()

const { mockResolveCallerKey } = vi.hoisted(() => ({
  mockResolveCallerKey: vi.fn(),
}))

vi.mock("@/lib/ai/structure/structure-question", () => ({
  structureQuestion: (...args: unknown[]) => mockStructureQuestion(...args),
}))
vi.mock("@/lib/ai/evidence/gather-evidence", () => ({
  gatherEvidence: (...args: unknown[]) => mockGatherEvidence(...args),
}))
vi.mock("@/lib/ai/probability/estimate-probability", () => ({
  estimateProbability: (...args: unknown[]) =>
    mockEstimateProbability(...args),
}))
vi.mock("@/lib/utils/identity", () => ({
  resolveCallerKey: mockResolveCallerKey,
}))

import { POST as structurePost } from "@/app/api/ai/structure/route"
import { POST as evidencePost } from "@/app/api/ai/evidence/route"
import { POST as probabilityPost } from "@/app/api/ai/probability/route"
import { resetRateLimitStore } from "@/lib/utils/ratelimit"

const validStructure = {
  originalQuestion: "Will Bitcoin reach $100K by end of 2026?",
  domain: "finance",
}
const validEvidence = {
  structuredQuestion: "Will OpenAI release a new flagship AI model before December 31, 2026?",
  domain: "technology",
}
const validProbability = {
  structuredQuestion: "Will OpenAI release a new flagship AI model before December 31, 2026?",
  domain: "technology",
  evidence: [
    {
      title: "Test",
      url: "https://example.com",
      source: "example.com",
      summary: "test",
      direction: "NEUTRAL" as const,
      credibility: "MEDIUM" as const,
      relevance: "MEDIUM" as const,
      reasoning: "test",
    },
  ],
}

function buildRequest(body: unknown, url: string): Request {
  return new Request(`http://localhost${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const CALLER_KEY = "ip:shared-test"

describe("AI endpoints share rate limit quota", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimitStore()
    mockResolveCallerKey.mockResolvedValue(CALLER_KEY)
    mockStructureQuestion.mockResolvedValue({
      structuredQuestion: "Q",
      forecastType: "BINARY" as const,
      deadlineSuggestion: "2026-12-31",
      resolutionCriteria: "criteria",
      requiredClarifications: [],
      isForecastable: true,
    })
    mockGatherEvidence.mockResolvedValue({
      evidence: [],
      searchSummary: "summary",
      limitations: [],
    })
    mockEstimateProbability.mockResolvedValue({
      probability: 0.5,
      confidence: "LOW" as const,
      summary: "summary",
      reasoning: "reasoning",
      keyDrivers: ["a"],
      counterArguments: ["b"],
      assumptions: ["c"],
      uncertaintyFactors: ["d"],
    })
  })

  afterEach(() => {
    resetRateLimitStore()
  })

  it("three routes consume shared 12-point quota", async () => {
    // structure × 4 = 4 points
    for (let i = 0; i < 4; i++) {
      const res = await structurePost(buildRequest(validStructure, "/api/ai/structure"))
      expect(res.status).toBe(200)
    }

    // evidence × 3 = 6 points (weight 2 each)
    for (let i = 0; i < 3; i++) {
      const res = await evidencePost(buildRequest(validEvidence, "/api/ai/evidence"))
      expect(res.status).toBe(200)
    }

    // probability × 2 = 2 points
    for (let i = 0; i < 2; i++) {
      const res = await probabilityPost(buildRequest(validProbability, "/api/ai/probability"))
      expect(res.status).toBe(200)
    }

    // total = 4 + 6 + 2 = 12 → next request should be 429
    const res = await structurePost(buildRequest(validStructure, "/api/ai/structure"))
    expect(res.status).toBe(429)
    expect(res.headers.get("Retry-After")).toBeTruthy()
    expect(res.headers.get("Cache-Control")).toBe("no-store")

    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe("Too many AI requests. Please try again later.")
    expect(mockStructureQuestion).toHaveBeenCalledTimes(4)
  })

  it("429 does not call external service", async () => {
    // exhaust quota
    for (let i = 0; i < 12; i++) {
      await structurePost(buildRequest(validStructure, "/api/ai/structure"))
    }
    mockStructureQuestion.mockClear()

    const res = await structurePost(buildRequest(validStructure, "/api/ai/structure"))
    expect(res.status).toBe(429)
    expect(mockStructureQuestion).not.toHaveBeenCalled()
  })

  it("invalid input returns 400 and does not consume quota", async () => {
    // send 10 invalid requests
    for (let i = 0; i < 10; i++) {
      const req = buildRequest(
        { originalQuestion: "", domain: "" },
        "/api/ai/structure"
      )
      const res = await structurePost(req)
      expect(res.status).toBe(400)
    }

    // still have full 12 points
    for (let i = 0; i < 6; i++) {
      const res = await evidencePost(
        buildRequest(validEvidence, "/api/ai/evidence")
      )
      expect(res.status).toBe(200)
    }
  })

  it("invalid input on evidence does not consume quota", async () => {
    for (let i = 0; i < 5; i++) {
      const req = buildRequest(
        { structuredQuestion: "", domain: "" },
        "/api/ai/evidence"
      )
      const res = await evidencePost(req)
      expect(res.status).toBe(400)
    }
    // full quota still available
    for (let i = 0; i < 6; i++) {
      const res = await evidencePost(
        buildRequest(validEvidence, "/api/ai/evidence")
      )
      expect(res.status).toBe(200)
    }
  })

  it("invalid input on probability does not consume quota", async () => {
    for (let i = 0; i < 5; i++) {
      const req = buildRequest(
        { structuredQuestion: "", domain: "", evidence: [] },
        "/api/ai/probability"
      )
      const res = await probabilityPost(req)
      expect(res.status).toBe(400)
    }
    // full quota still available
    for (let i = 0; i < 12; i++) {
      const res = await structurePost(
        buildRequest(validStructure, "/api/ai/structure")
      )
      expect(res.status).toBe(200)
    }
  })
})
