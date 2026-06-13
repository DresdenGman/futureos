import { describe, it, expect } from "vitest"
import { evidenceRequestSchema, evidenceItemSchema, evidenceResultSchema } from "@/lib/ai/evidence/schema"

describe("evidenceRequestSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = evidenceRequestSchema.safeParse({
      structuredQuestion: "Will OpenAI release GPT-5 before 2027?",
      domain: "technology",
      deadlineSuggestion: "2026-12-31",
      resolutionCriteria: "Official announcement on openai.com/blog",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid input with only required fields", () => {
    const result = evidenceRequestSchema.safeParse({
      structuredQuestion: "Will something happen?",
      domain: "finance",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty structuredQuestion", () => {
    const result = evidenceRequestSchema.safeParse({
      structuredQuestion: "",
      domain: "technology",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be empty")
    }
  })

  it("rejects empty domain", () => {
    const result = evidenceRequestSchema.safeParse({
      structuredQuestion: "Will something happen?",
      domain: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be empty")
    }
  })

  it("rejects missing structuredQuestion", () => {
    const result = evidenceRequestSchema.safeParse({
      domain: "technology",
    })
    expect(result.success).toBe(false)
  })
})

describe("evidenceItemSchema", () => {
  const validItem = {
    title: "OpenAI hints at 2026 release",
    url: "https://example.com/news/openai-2026",
    source: "example.com",
    publishedDate: "2026-05-01",
    summary: "OpenAI executives hinted at a major release.",
    direction: "SUPPORT" as const,
    credibility: "HIGH" as const,
    relevance: "HIGH" as const,
    reasoning: "Directly mentions upcoming release timeline.",
  }

  it("accepts valid evidence item", () => {
    const result = evidenceItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it("rejects invalid URL", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      url: "not-a-valid-url",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("URL")
    }
  })

  it("rejects invalid direction", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      direction: "INVALID_DIRECTION",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid credibility", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      credibility: "EXTREME",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid relevance", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      relevance: "NONE",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty title", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      title: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty summary", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      summary: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty reasoning", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      reasoning: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects summary over 500 chars", () => {
    const result = evidenceItemSchema.safeParse({
      ...validItem,
      summary: "A".repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe("evidenceResultSchema", () => {
  it("accepts valid result", () => {
    const result = evidenceResultSchema.safeParse({
      evidence: [
        {
          title: "Test evidence",
          url: "https://example.com",
          source: "example.com",
          summary: "A test summary.",
          direction: "SUPPORT",
          credibility: "HIGH",
          relevance: "HIGH",
          reasoning: "This is relevant because...",
        },
      ],
      searchSummary: "Search returned results.",
      limitations: ["Limited date range"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty evidence array", () => {
    const result = evidenceResultSchema.safeParse({
      evidence: [],
      searchSummary: "Nothing found.",
      limitations: ["No results"],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty searchSummary", () => {
    const result = evidenceResultSchema.safeParse({
      evidence: [
        {
          title: "Test",
          url: "https://example.com",
          source: "example.com",
          summary: "Summary.",
          direction: "NEUTRAL",
          credibility: "MEDIUM",
          relevance: "MEDIUM",
          reasoning: "Reason.",
        },
      ],
      searchSummary: "",
      limitations: [],
    })
    expect(result.success).toBe(false)
  })

  it("does not accept a probability field", () => {
    const result = evidenceResultSchema.safeParse({
      evidence: [
        {
          title: "Test",
          url: "https://example.com",
          source: "example.com",
          summary: "Summary.",
          direction: "NEUTRAL",
          credibility: "MEDIUM",
          relevance: "MEDIUM",
          reasoning: "Reason.",
        },
      ],
      searchSummary: "Search results.",
      limitations: [],
      probability: 0.75, // should be rejected/ignored
    })
    // Zod should strip the unknown field but still pass
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>).probability).toBeUndefined()
    }
  })
})
