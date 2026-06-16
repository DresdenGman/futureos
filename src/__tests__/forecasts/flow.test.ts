import { describe, it, expect } from "vitest"
import {
  canEstimateProbability,
  canSaveForecast,
} from "@/lib/forecasts/flow"

describe("canEstimateProbability", () => {
  it("returns true when evidence is present", () => {
    expect(canEstimateProbability({ some: "data" })).toBe(true)
  })

  it("returns false when evidence is null (422 error)", () => {
    expect(canEstimateProbability(null)).toBe(false)
  })

  it("returns false when evidence is undefined", () => {
    expect(canEstimateProbability(undefined)).toBe(false)
  })
})

describe("canSaveForecast", () => {
  it("returns true when all three are present", () => {
    expect(canSaveForecast({}, {}, {})).toBe(true)
  })

  it("returns false when estimate is null", () => {
    expect(canSaveForecast(null, { evidence: [] }, { question: "Q" })).toBe(
      false
    )
  })

  it("returns false when evidence is null", () => {
    expect(canSaveForecast({ probability: 0.5 }, null, { question: "Q" })).toBe(
      false
    )
  })

  it("returns false when structured is null", () => {
    expect(canSaveForecast({}, {}, null)).toBe(false)
  })
})
