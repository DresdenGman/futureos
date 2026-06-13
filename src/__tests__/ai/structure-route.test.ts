import { describe, it, expect, vi, beforeEach } from "vitest"

const mockStructureQuestion = vi.fn()

vi.mock("@/lib/ai/structure/structure-question", () => ({
  structureQuestion: (...args: unknown[]) => mockStructureQuestion(...args),
}))

import { POST } from "@/app/api/ai/structure/route"

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/structure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  originalQuestion: "Will Bitcoin reach $100K by end of 2026?",
  domain: "finance",
}

const validResult = {
  structuredQuestion: "Will the price of Bitcoin exceed $100,000 USD at any point before December 31, 2026?",
  forecastType: "BINARY" as const,
  deadlineSuggestion: "2026-12-31",
  resolutionCriteria: "Bitcoin price reaches $100,000 USD on any major exchange.",
  requiredClarifications: [] as string[],
  isForecastable: true,
}

describe("POST /api/ai/structure", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStructureQuestion.mockResolvedValue(validResult)
  })

  it("returns 400 for empty body", async () => {
    const req = new Request("http://localhost/api/ai/structure", {
      method: "POST",
      body: "",
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Invalid JSON")
  })

  it("returns 400 for missing question", async () => {
    const req = buildRequest({ originalQuestion: "", domain: "finance" })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Validation error")
  })

  it("returns success for valid input", async () => {
    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.isForecastable).toBe(true)
    expect(mockStructureQuestion).toHaveBeenCalledWith({
      originalQuestion: validBody.originalQuestion,
      domain: validBody.domain,
    })
  })

  it("returns 503 when DeepSeek key is missing", async () => {
    mockStructureQuestion.mockRejectedValue(
      new Error("DEEPSEEK_API_KEY is not configured.")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.success).toBe(false)
    expect(body.error).toContain("DEEPSEEK_API_KEY")
  })

  it("returns safe 500 for AI errors", async () => {
    mockStructureQuestion.mockRejectedValue(
      new Error("Rate limit exceeded")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
    expect(body.error).not.toContain("Rate limit")
  })

  it("returns safe 500 for DeepSeek 401 error", async () => {
    mockStructureQuestion.mockRejectedValue(
      new Error("401 Unauthorized")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
    expect(body.error).not.toContain("401")
  })

  it("returns safe 500 for network timeout", async () => {
    mockStructureQuestion.mockRejectedValue(
      new Error("Connection timed out")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
  })
})
