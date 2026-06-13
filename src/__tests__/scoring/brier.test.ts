import { describe, it, expect } from "vitest"
import { calculateBinaryBrierScore } from "@/lib/scoring/brier"

describe("calculateBinaryBrierScore", () => {
  it("p=0.7, YES → 0.09", () => {
    expect(calculateBinaryBrierScore(0.7, "YES")).toBe(0.09)
  })

  it("p=0.7, NO → 0.49", () => {
    expect(calculateBinaryBrierScore(0.7, "NO")).toBe(0.49)
  })

  it("p=1, YES → 0 (perfect)", () => {
    expect(calculateBinaryBrierScore(1, "YES")).toBe(0)
  })

  it("p=0, NO → 0 (perfect)", () => {
    expect(calculateBinaryBrierScore(0, "NO")).toBe(0)
  })

  it("p=0, YES → 1 (worst)", () => {
    expect(calculateBinaryBrierScore(0, "YES")).toBe(1)
  })

  it("p=1, NO → 1 (worst)", () => {
    expect(calculateBinaryBrierScore(1, "NO")).toBe(1)
  })

  it("p=0.5, YES → 0.25 (random baseline)", () => {
    expect(calculateBinaryBrierScore(0.5, "YES")).toBe(0.25)
  })

  it("throws on p<0", () => {
    expect(() => calculateBinaryBrierScore(-0.1, "YES")).toThrow(
      "Probability must be between 0 and 1"
    )
  })

  it("throws on p>1", () => {
    expect(() => calculateBinaryBrierScore(1.5, "NO")).toThrow(
      "Probability must be between 0 and 1"
    )
  })

  it("returns high precision decimal", () => {
    const score = calculateBinaryBrierScore(0.333, "YES")
    // (0.333 - 1)^2 = 0.444889
    expect(score).toBe(0.444889)
  })
})
