import { describe, it, expect } from "vitest"
import { structureRequestSchema } from "@/lib/ai/structure/schema"

describe("structureRequestSchema", () => {
  it("accepts valid input", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "Will OpenAI release GPT-5 by 2027?",
      domain: "technology",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty question", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "",
      domain: "technology",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be empty")
    }
  })

  it("rejects empty domain", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "Will something happen?",
      domain: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be empty")
    }
  })

  it("rejects question over 500 characters", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "A".repeat(501),
      domain: "technology",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("500")
    }
  })

  it("accepts question exactly at 500 characters", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "A".repeat(500),
      domain: "technology",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing question field", () => {
    const result = structureRequestSchema.safeParse({
      domain: "technology",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing domain field", () => {
    const result = structureRequestSchema.safeParse({
      originalQuestion: "Will something happen?",
    })
    expect(result.success).toBe(false)
  })
})
