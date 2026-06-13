import { describe, it, expect } from "vitest"
import {
  probabilityRequestSchema,
  probabilityEstimateSchema,
} from "@/lib/ai/probability/schema"

const validEvidence = [
  {
    title: "OpenAI plans major release",
    url: "https://techcrunch.com/openai-2026",
    source: "techcrunch.com",
    publishedDate: "2026-05-15",
    summary: "Sources indicate a major model release in 2026.",
    direction: "SUPPORT" as const,
    credibility: "HIGH" as const,
    relevance: "HIGH" as const,
    reasoning: "Directly addresses the forecast question.",
  },
]

const validRequest = {
  structuredQuestion:
    "Will OpenAI release a new flagship AI model before December 31, 2026?",
  domain: "technology",
  deadlineSuggestion: "2026-12-31",
  resolutionCriteria: "Official announcement on openai.com/blog",
  evidence: validEvidence,
  limitations: ["Limited date range"],
}

describe("probabilityRequestSchema", () => {
  it("accepts valid input", () => {
    const result = probabilityRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it("rejects empty structuredQuestion", () => {
    const result = probabilityRequestSchema.safeParse({
      ...validRequest,
      structuredQuestion: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty domain", () => {
    const result = probabilityRequestSchema.safeParse({
      ...validRequest,
      domain: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty evidence array", () => {
    const result = probabilityRequestSchema.safeParse({
      ...validRequest,
      evidence: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("evidence")
    }
  })

  it("accepts optional fields omitted", () => {
    const result = probabilityRequestSchema.safeParse({
      structuredQuestion: "Will it rain tomorrow?",
      domain: "technology",
      evidence: validEvidence,
    })
    expect(result.success).toBe(true)
  })
})

describe("probabilityEstimateSchema", () => {
  const validEstimate = {
    probability: 0.64,
    confidence: "MEDIUM" as const,
    summary: "Based on available evidence, the likelihood is moderate.",
    reasoning:
      "Multiple sources suggest a release timeline, though no official confirmation exists.",
    keyDrivers: [
      "Multiple news sources report active development",
      "Historical release patterns support a 2026 launch",
    ],
    counterArguments: [
      "No official announcement has been made",
      "AI safety regulations could delay release",
    ],
    assumptions: [
      "Current development pace continues",
      "No major regulatory changes occur",
    ],
    uncertaintyFactors: [
      "Lack of official confirmation",
      "Potential supply chain constraints",
    ],
    recommendedResolutionCriteria:
      "Official blog post or press release on openai.com",
  }

  it("accepts valid estimate", () => {
    const result = probabilityEstimateSchema.safeParse(validEstimate)
    expect(result.success).toBe(true)
  })

  it("rejects probability below 0", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      probability: -0.1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects probability above 1", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      probability: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it("rejects probability as string percentage", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      probability: "65%",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid confidence", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      confidence: "VERY_HIGH",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty keyDrivers", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      keyDrivers: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty counterArguments", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      counterArguments: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty assumptions", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      assumptions: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty uncertaintyFactors", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      uncertaintyFactors: [],
    })
    expect(result.success).toBe(false)
  })

  it("accepts estimate without recommendedResolutionCriteria", () => {
    const result = probabilityEstimateSchema.safeParse({
      ...validEstimate,
      recommendedResolutionCriteria: undefined,
    })
    expect(result.success).toBe(true)
  })
})
