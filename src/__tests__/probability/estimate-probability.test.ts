import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock AI SDK generateObject
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}))

// Mock AI client
vi.mock("@/lib/ai/client", () => ({
  getModel: vi.fn(() => "mock-model"),
}))

// Ensure tavily is NOT called
vi.mock("@/lib/search/tavily", () => ({
  tavilySearch: vi.fn(() => {
    throw new Error("Tavily should not be called during probability estimation")
  }),
}))

import { generateObject } from "ai"
import { estimateProbability } from "@/lib/ai/probability/estimate-probability"
import { InsufficientEvidenceError } from "@/lib/ai/evidence/schema"

const mockGenerateObject = vi.mocked(generateObject)

const validEvidence = [
  {
    title: "OpenAI plans major release in 2026",
    url: "https://techcrunch.com/openai-2026",
    source: "techcrunch.com",
    publishedDate: "2026-05-15",
    summary: "Sources close to OpenAI say a major model release is planned.",
    direction: "SUPPORT" as const,
    credibility: "HIGH" as const,
    relevance: "HIGH" as const,
    reasoning: "Directly addresses the forecast question about model releases.",
  },
  {
    title: "AI industry slows down",
    url: "https://example.com/ai-slowdown",
    source: "example.com",
    publishedDate: "2026-04-20",
    summary: "Recent trends show AI development slowing.",
    direction: "OPPOSE" as const,
    credibility: "MEDIUM" as const,
    relevance: "MEDIUM" as const,
    reasoning: "Industry-wide slowdown could delay releases.",
  },
]

const validEstimate = {
  probability: 0.62,
  confidence: "MEDIUM" as const,
  summary: "Moderate likelihood based on mixed evidence.",
  reasoning:
    "Supporting evidence shows active development while opposing evidence indicates possible delays.",
  keyDrivers: ["Reported development activity", "Past release patterns"],
  counterArguments: ["Industry slowdown", "No official announcement"],
  assumptions: ["Current pace continues", "No regulatory disruption"],
  uncertaintyFactors: ["Lack of official confirmation", "Supply chain risks"],
  recommendedResolutionCriteria:
    "Official OpenAI blog post or press release",
}

describe("estimateProbability", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns valid probability estimate", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validEstimate,
    } as never)

    const result = await estimateProbability({
      structuredQuestion:
        "Will OpenAI release a new flagship AI model before December 31, 2026?",
      domain: "technology",
      deadlineSuggestion: "2026-12-31",
      resolutionCriteria: "Official announcement on openai.com/blog",
      evidence: validEvidence,
      limitations: ["Limited date range"],
    })

    expect(result.probability).toBe(0.62)
    expect(result.confidence).toBe("MEDIUM")
    expect(result.keyDrivers.length).toBeGreaterThan(0)
    expect(result.counterArguments.length).toBeGreaterThan(0)
    expect(result.assumptions.length).toBeGreaterThan(0)
    expect(result.uncertaintyFactors.length).toBeGreaterThan(0)
    expect(mockGenerateObject).toHaveBeenCalledTimes(1)
  })

  it("passes evidence to AI in prompt", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validEstimate,
    } as never)

    await estimateProbability({
      structuredQuestion: "Will something happen?",
      domain: "technology",
      evidence: validEvidence,
    })

    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(callArgs.prompt).toContain("Will something happen?")
    expect(callArgs.prompt).toContain("techcrunch.com")
    expect(callArgs.temperature).toBe(0.3)
  })

  it("throws when AI fails", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("AI service error"))

    await expect(
      estimateProbability({
        structuredQuestion: "Will something happen?",
        domain: "technology",
        evidence: validEvidence,
      })
    ).rejects.toThrow("AI service error")
  })

  it("returns probability as a number 0-1", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: { ...validEstimate, probability: 0.38 },
    } as never)

    const result = await estimateProbability({
      structuredQuestion: "Will something happen?",
      domain: "technology",
      evidence: validEvidence,
    })

    expect(typeof result.probability).toBe("number")
    expect(result.probability).toBeGreaterThanOrEqual(0)
    expect(result.probability).toBeLessThanOrEqual(1)
  })

  it("passes AbortSignal to generateObject for timeout", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validEstimate,
    } as never)

    await estimateProbability({
      structuredQuestion: "Will something happen?",
      domain: "technology",
      evidence: validEvidence,
    })

    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(callArgs.abortSignal).toBeInstanceOf(AbortSignal)
  })

  it("rejects when all evidence is LOW relevance", async () => {
    const allLow = [
      { ...validEvidence[0], relevance: "LOW" as const },
      { ...validEvidence[1], relevance: "LOW" as const },
    ]

    await expect(
      estimateProbability({
        structuredQuestion: "Will something happen?",
        domain: "technology",
        evidence: allLow,
      })
    ).rejects.toThrow(InsufficientEvidenceError)

    expect(mockGenerateObject).not.toHaveBeenCalled()
  })

  it("rejects empty evidence array", async () => {
    await expect(
      estimateProbability({
        structuredQuestion: "Will something happen?",
        domain: "technology",
        evidence: [],
      })
    ).rejects.toThrow(InsufficientEvidenceError)

    expect(mockGenerateObject).not.toHaveBeenCalled()
  })

  it("filters LOW and keeps MEDIUM/HIGH on mixed evidence", async () => {
    const mixed = [
      { ...validEvidence[0], relevance: "LOW" as const },
      { ...validEvidence[1], relevance: "MEDIUM" as const },
    ]
    mockGenerateObject.mockResolvedValueOnce({
      object: validEstimate,
    } as never)

    await estimateProbability({
      structuredQuestion: "Will something happen?",
      domain: "technology",
      evidence: mixed,
    })

    expect(mockGenerateObject).toHaveBeenCalledTimes(1)
    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<
      string,
      unknown
    >
    const prompt = callArgs.prompt as string
    // Only MEDIUM item should appear, LOW item filtered out
    expect(prompt).toContain("AI industry slows down")
    expect(prompt).not.toContain("OpenAI plans major release")
  })

  it("forces LOW confidence when all usable evidence is NEUTRAL", async () => {
    const allNeutral = [
      {
        ...validEvidence[0],
        direction: "NEUTRAL" as const,
        relevance: "MEDIUM" as const,
      },
      {
        ...validEvidence[1],
        direction: "NEUTRAL" as const,
        relevance: "HIGH" as const,
      },
    ]
    mockGenerateObject.mockResolvedValueOnce({
      object: { ...validEstimate, confidence: "MEDIUM" as const },
    } as never)

    const result = await estimateProbability({
      structuredQuestion: "Will something happen?",
      domain: "technology",
      evidence: allNeutral,
    })

    expect(result.confidence).toBe("LOW")
    expect(result.probability).not.toBe(0.5)
    expect(result.reasoning).toContain(
      "No usable evidence directly supports or opposes"
    )
  })
})
