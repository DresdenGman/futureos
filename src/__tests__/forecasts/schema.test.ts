import { describe, it, expect } from "vitest"
import { createForecastSchema } from "@/lib/forecasts/schema"

const validEvidence = [
  {
    title: "Test evidence",
    url: "https://example.com",
    source: "example.com",
    summary: "A test summary.",
    direction: "SUPPORT" as const,
    credibility: "HIGH" as const,
    relevance: "HIGH" as const,
    reasoning: "Test reasoning.",
  },
]

const validInput = {
  structuredQuestion: "Will something happen before 2027?",
  domain: "technology",
  forecastType: "BINARY" as const,
  deadlineSuggestion: "2026-12-31",
  resolutionCriteria: "Official announcement",
  probability: 0.64,
  confidence: "MEDIUM" as const,
  probabilitySummary: "Moderate likelihood.",
  probabilityReasoning: "Based on evidence.",
  keyDrivers: ["Driver 1"],
  counterArguments: ["Counter 1"],
  assumptions: ["Assumption 1"],
  uncertaintyFactors: ["Uncertainty 1"],
  evidence: validEvidence,
}

describe("createForecastSchema", () => {
  it("accepts valid input", () => {
    const result = createForecastSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it("rejects empty structuredQuestion", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      structuredQuestion: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty domain", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      domain: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects probability below 0", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      probability: -0.1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects probability above 1", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      probability: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty evidence array", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      evidence: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty keyDrivers", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      keyDrivers: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty counterArguments", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      counterArguments: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid confidence", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      confidence: "UNKNOWN",
    })
    expect(result.success).toBe(false)
  })

  it("rejects non-BINARY type", () => {
    const result = createForecastSchema.safeParse({
      ...validInput,
      forecastType: "NUMERIC",
    })
    expect(result.success).toBe(false)
  })
})
