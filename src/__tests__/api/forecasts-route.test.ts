import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreateForecast = vi.fn()
const mockAuth = vi.fn()

vi.mock("@/lib/forecasts/create-forecast", () => ({
  createForecast: (...args: unknown[]) => mockCreateForecast(...args),
}))

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}))

import { POST } from "@/app/api/forecasts/route"

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/forecasts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  structuredQuestion: "Will something happen before 2027?",
  domain: "technology",
  forecastType: "BINARY",
  deadlineSuggestion: "2026-12-31",
  resolutionCriteria: "Official announcement",
  probability: 0.64,
  confidence: "MEDIUM",
  probabilitySummary: "Moderate likelihood.",
  probabilityReasoning: "Based on evidence.",
  keyDrivers: ["Driver 1"],
  counterArguments: ["Counter 1"],
  assumptions: ["Assumption 1"],
  uncertaintyFactors: ["Uncertainty 1"],
  evidence: [
    {
      title: "Test",
      url: "https://example.com",
      source: "example.com",
      summary: "Summary.",
      direction: "SUPPORT",
      credibility: "HIGH",
      relevance: "HIGH",
      reasoning: "Clear indication.",
    },
  ],
}

describe("POST /api/forecasts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(null)
    mockCreateForecast.mockResolvedValue({ id: "fc-1" })
  })

  it("returns 400 for empty body", async () => {
    const req = new Request("http://localhost/api/forecasts", {
      method: "POST",
      body: "",
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Invalid JSON")
  })

  it("returns 400 for validation errors", async () => {
    const req = buildRequest({})
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Validation error")
  })

  it("returns success with forecast id on valid save", async () => {
    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe("fc-1")
  })

  it("returns 400 when domain is not found", async () => {
    mockCreateForecast.mockRejectedValue(
      new Error('Domain "invalid-domain" not found')
    )

    const req = buildRequest({ ...validBody, domain: "invalid-domain" })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("not found")
  })

  it("returns safe 500 error when database is unreachable", async () => {
    mockCreateForecast.mockRejectedValue(
      new Error("Can't reach database server at `localhost:5432`")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe(
      "Database is currently unavailable. Please try again later."
    )
    // Must NOT leak Prisma internal details
    expect(body.error).not.toContain("localhost")
    expect(body.error).not.toContain("5432")
    expect(body.error).not.toContain("Can't reach")
    expect(body.error).not.toContain("P1001")
  })

  it("returns safe 500 error for Prisma P1001 connection error", async () => {
    const prismaError = new Error(
      "PrismaClientInitializationError: Can't reach database server at `db.example.com:5432`"
    )
    prismaError.name = "PrismaClientInitializationError"
    mockCreateForecast.mockRejectedValue(prismaError)

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe(
      "Database is currently unavailable. Please try again later."
    )
  })

  it("returns 200 even with anonymous user (userId null)", async () => {
    mockAuth.mockResolvedValue(null)
    mockCreateForecast.mockResolvedValue({ id: "fc-anon" })

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.id).toBe("fc-anon")
  })

  it("returns 422 when all evidence is LOW relevance", async () => {
    const allLow = {
      ...validBody,
      evidence: [
        {
          title: "Test",
          url: "https://example.com",
          source: "example.com",
          summary: "Summary.",
          direction: "NEUTRAL" as const,
          credibility: "MEDIUM" as const,
          relevance: "LOW" as const,
          reasoning: "Irrelevant.",
        },
        {
          title: "Test 2",
          url: "https://example2.com",
          source: "example2.com",
          summary: "Summary 2.",
          direction: "NEUTRAL" as const,
          credibility: "MEDIUM" as const,
          relevance: "LOW" as const,
          reasoning: "Also irrelevant.",
        },
      ],
    }

    const req = buildRequest(allLow)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.error).toContain("sufficiently relevant")
    expect(mockCreateForecast).not.toHaveBeenCalled()
  })

  it("allows save with MEDIUM relevance evidence", async () => {
    const withMedium = {
      ...validBody,
      evidence: [
        {
          title: "Test",
          url: "https://example.com",
          source: "example.com",
          summary: "Summary.",
          direction: "NEUTRAL" as const,
          credibility: "MEDIUM" as const,
          relevance: "MEDIUM" as const,
          reasoning: "Relevant background.",
        },
      ],
    }

    const req = buildRequest(withMedium)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.id).toBe("fc-1")
    expect(mockCreateForecast).toHaveBeenCalledTimes(1)
  })
})
