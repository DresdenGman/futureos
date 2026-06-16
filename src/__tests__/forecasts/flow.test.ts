import { describe, it, expect } from "vitest"
import {
  canEstimateProbability,
  canSaveForecast,
} from "@/lib/forecasts/flow"

describe("canEstimateProbability", () => {
  it("returns true when evidence is present", () => {
    expect(
      canEstimateProbability({
        evidence: [],
        searchSummary: "",
        limitations: [],
      })
    ).toBe(true)
  })

  it("returns false when evidence is null (422 error)", () => {
    expect(canEstimateProbability(null)).toBe(false)
  })
})

describe("canSaveForecast", () => {
  it("returns true when estimate is present", () => {
    expect(
      canSaveForecast({
        probability: 0.5,
        confidence: "LOW",
        summary: "",
        reasoning: "",
        keyDrivers: [],
        counterArguments: [],
        assumptions: [],
        uncertaintyFactors: [],
      })
    ).toBe(true)
  })

  it("returns false when estimate is null (422 error)", () => {
    expect(canSaveForecast(null)).toBe(false)
  })
})
