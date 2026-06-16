import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the AI SDK generateObject
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}))

// Mock the model getter from client
vi.mock("@/lib/ai/client", () => ({
  getModel: vi.fn(() => "mock-model"),
}))

import { generateObject } from "ai"
import { structureQuestion } from "@/lib/ai/structure/structure-question"

const mockGenerateObject = vi.mocked(generateObject)

const validResult = {
  structuredQuestion:
    "Will OpenAI release a new flagship AI model before December 31, 2026?",
  forecastType: "BINARY" as const,
  deadlineSuggestion: "2026-12-31",
  resolutionCriteria:
    "Official announcement from OpenAI via blog post, press release, or API documentation confirming the release of a new flagship model.",
  requiredClarifications: [] as string[],
  isForecastable: true,
  notForecastableReason: undefined,
}

describe("structureQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns structured question for valid forecastable input", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validResult,
    } as never)

    const result = await structureQuestion({
      originalQuestion:
        "Will OpenAI release a new flagship model before 2027?",
      domain: "technology",
    })

    expect(result.isForecastable).toBe(true)
    expect(result.structuredQuestion).toBe(validResult.structuredQuestion)
    expect(result.forecastType).toBe("BINARY")
    expect(result.deadlineSuggestion).toBe("2026-12-31")
    expect(mockGenerateObject).toHaveBeenCalledTimes(1)
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("OpenAI"),
        temperature: 0.3,
      })
    )
  })

  it("returns structured result for non-forecastable input", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        ...validResult,
        structuredQuestion: "Placeholder: not forecastable",
        isForecastable: false,
        notForecastableReason:
          "'Amazing' is subjective and cannot be verified.",
      },
    } as never)

    const result = await structureQuestion({
      originalQuestion: "Will AI become amazing?",
      domain: "technology",
    })

    expect(result.isForecastable).toBe(false)
    expect(result.notForecastableReason).toContain("subjective")
  })

  it("handles question without time range by suggesting deadline", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        ...validResult,
        requiredClarifications: [
          "What specific Bitcoin price threshold defines 'going up'?",
        ],
      },
    } as never)

    const result = await structureQuestion({
      originalQuestion: "Will Bitcoin go up?",
      domain: "finance",
    })

    expect(result.isForecastable).toBe(true)
    expect(result.requiredClarifications.length).toBeGreaterThan(0)
  })

  it("passes domain to the AI prompt", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validResult,
    } as never)

    await structureQuestion({
      originalQuestion: "Will some event happen?",
      domain: "geopolitics",
    })

    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("geopolitics"),
      })
    )
  })

  it("throws when generateObject fails", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("AI service error"))

    await expect(
      structureQuestion({
        originalQuestion: "Will something happen?",
        domain: "technology",
      })
    ).rejects.toThrow("AI service error")
  })

  it("passes AbortSignal to generateObject for timeout", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: validResult,
    } as never)

    await structureQuestion({
      originalQuestion: "Will something happen?",
      domain: "technology",
    })

    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(callArgs.abortSignal).toBeInstanceOf(AbortSignal)
  })
})
