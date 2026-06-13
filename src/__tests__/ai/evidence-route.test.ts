import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGatherEvidence = vi.fn()

vi.mock("@/lib/ai/evidence/gather-evidence", () => ({
  gatherEvidence: (...args: unknown[]) => mockGatherEvidence(...args),
}))

import { POST } from "@/app/api/ai/evidence/route"

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/evidence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  structuredQuestion: "Will the price of Bitcoin exceed $100,000 USD before December 31, 2026?",
  domain: "finance",
}

const validResult = {
  evidence: [
    {
      title: "Bitcoin ETF inflows surge",
      url: "https://example.com/btc-etf",
      source: "example.com",
      summary: "Bitcoin ETF inflows reach new highs.",
      direction: "SUPPORT" as const,
      credibility: "HIGH" as const,
      relevance: "HIGH" as const,
      reasoning: "Increased institutional investment supports price growth.",
    },
  ],
  searchSummary: "One relevant result found.",
  limitations: ["Limited search results"],
}

describe("POST /api/ai/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGatherEvidence.mockResolvedValue(validResult)
  })

  it("returns 400 for empty body", async () => {
    const req = new Request("http://localhost/api/ai/evidence", {
      method: "POST",
      body: "",
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Invalid JSON")
  })

  it("returns 400 for missing fields", async () => {
    const req = buildRequest({ structuredQuestion: "", domain: "" })
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
    expect(body.data.evidence).toHaveLength(1)
  })

  it("returns 503 when Tavily key is missing", async () => {
    mockGatherEvidence.mockRejectedValue(
      new Error("TAVILY_API_KEY is not configured.")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.success).toBe(false)
    expect(body.error).toContain("TAVILY_API_KEY")
  })

  it("returns 503 when DeepSeek key is missing", async () => {
    mockGatherEvidence.mockRejectedValue(
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
    mockGatherEvidence.mockRejectedValue(
      new Error("500 Internal Server Error")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
    expect(body.error).not.toContain("500")
  })

  it("returns safe 500 for 429 rate limit", async () => {
    mockGatherEvidence.mockRejectedValue(
      new Error("429 Too Many Requests")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
  })
})
