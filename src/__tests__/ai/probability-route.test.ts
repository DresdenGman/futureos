import { describe, it, expect, vi, beforeEach } from "vitest"

import { probabilityEstimateSchema } from "@/lib/ai/probability/schema"

const mockEstimateProbability = vi.fn()

vi.mock("@/lib/ai/probability/estimate-probability", () => ({
  estimateProbability: (...args: unknown[]) => mockEstimateProbability(...args),
}))

import { POST } from "@/app/api/ai/probability/route"

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/probability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validEvidence = [
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
]

const validBody = {
  structuredQuestion: "Will the price of Bitcoin exceed $100,000 USD before December 31, 2026?",
  domain: "finance",
  evidence: validEvidence,
}

const validResult = {
  probability: 0.62,
  confidence: "MEDIUM" as const,
  summary: "Moderate likelihood.",
  reasoning: "Mixed evidence.",
  keyDrivers: ["Institutional investment"],
  counterArguments: ["Market volatility"],
  assumptions: ["Current trend continues"],
  uncertaintyFactors: ["Regulatory changes"],
}

describe("POST /api/ai/probability", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEstimateProbability.mockResolvedValue(validResult)
  })

  it("returns 400 for empty body", async () => {
    const req = new Request("http://localhost/api/ai/probability", {
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
    const req = buildRequest({ structuredQuestion: "", domain: "", evidence: [] })
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
    expect(body.data.probability).toBe(0.62)
  })

  it("returns 503 when DeepSeek key is missing", async () => {
    mockEstimateProbability.mockRejectedValue(
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
    mockEstimateProbability.mockRejectedValue(
      new Error("Insufficient balance")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
    expect(body.error).not.toContain("Insufficient balance")
  })

  it("returns safe 500 for DeepSeek 402 payment required", async () => {
    mockEstimateProbability.mockRejectedValue(
      new Error("402 Payment Required")
    )

    const req = buildRequest(validBody)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe("AI service is temporarily unavailable. Please try again later.")
  })

  it("rejects out-of-bounds probability via Zod schema (tested at schema level)", () => {
    expect(() =>
      probabilityEstimateSchema.parse({ ...validResult, probability: 1.5 })
    ).toThrow()
    expect(() =>
      probabilityEstimateSchema.parse({ ...validResult, probability: -0.1 })
    ).toThrow()
  })
})
