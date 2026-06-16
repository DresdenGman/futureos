import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock tavily search
vi.mock("@/lib/search/tavily", () => ({
  tavilySearch: vi.fn(),
}))

// Mock AI SDK generateObject
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}))

// Mock AI client
vi.mock("@/lib/ai/client", () => ({
  getModel: vi.fn(() => "mock-model"),
}))

import { tavilySearch } from "@/lib/search/tavily"
import { generateObject } from "ai"
import { gatherEvidence } from "@/lib/ai/evidence/gather-evidence"

const mockTavilySearch = vi.mocked(tavilySearch)
const mockGenerateObject = vi.mocked(generateObject)

const mockSearchResults = [
  {
    title: "OpenAI plans major release in 2026",
    url: "https://techcrunch.com/openai-2026",
    content: "Sources close to OpenAI say a major model release is planned.",
    score: 0.9,
    published_date: "2026-05-15",
  },
  {
    title: "AI industry slows down",
    url: "https://example.com/ai-slowdown",
    content: "Recent trends show AI development slowing.",
    score: 0.7,
  },
]

const validEvidenceResult = {
  evidence: [
    {
      title: "OpenAI plans major release in 2026",
      url: "https://techcrunch.com/openai-2026",
      source: "techcrunch.com",
      publishedDate: "2026-05-15",
      summary: "Sources indicate a major model release in 2026.",
      direction: "SUPPORT" as const,
      credibility: "HIGH" as const,
      relevance: "HIGH" as const,
      reasoning: "Directly addresses the forecast question about model releases.",
    },
    {
      title: "AI industry slows down",
      url: "https://example.com/ai-slowdown",
      source: "example.com",
      summary: "Recent trends show AI development slowing.",
      direction: "OPPOSE" as const,
      credibility: "MEDIUM" as const,
      relevance: "MEDIUM" as const,
      reasoning: "Industry-wide slowdown could delay releases.",
    },
  ],
  searchSummary: "Two relevant results found covering opposing views.",
  limitations: ["Limited number of results", "Mixed credibility"],
}

describe("gatherEvidence", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns evidence for valid input", async () => {
    mockTavilySearch.mockResolvedValueOnce(mockSearchResults)
    mockGenerateObject.mockResolvedValueOnce({
      object: validEvidenceResult,
    } as never)

    const result = await gatherEvidence({
      structuredQuestion:
        "Will OpenAI release a new flagship AI model before December 31, 2026?",
      domain: "technology",
      deadlineSuggestion: "2026-12-31",
      resolutionCriteria: "Official announcement on openai.com/blog",
    })

    expect(result.evidence).toHaveLength(2)
    expect(result.evidence[0].direction).toBe("SUPPORT")
    expect(result.evidence[1].direction).toBe("OPPOSE")
    expect(result.searchSummary).toBeTruthy()
    expect(result.limitations.length).toBeGreaterThan(0)
    expect(mockTavilySearch).toHaveBeenCalledTimes(1)
  })

  it("calls AI with search results", async () => {
    mockTavilySearch.mockResolvedValueOnce(mockSearchResults)
    mockGenerateObject.mockResolvedValueOnce({
      object: { ...validEvidenceResult, evidence: [validEvidenceResult.evidence[0]] },
    } as never)

    await gatherEvidence({
      structuredQuestion: "Will something happen?",
      domain: "technology",
    })

    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<string, unknown>
    expect(callArgs.prompt).toContain("Will something happen?")
    expect(callArgs.temperature).toBe(0.3)
  })

  it("throws when Tavily fails", async () => {
    mockTavilySearch.mockRejectedValueOnce(new Error("Tavily API error"))

    await expect(
      gatherEvidence({
        structuredQuestion: "Will something happen?",
        domain: "technology",
      })
    ).rejects.toThrow("Tavily API error")
  })

  it("throws when AI fails", async () => {
    mockTavilySearch.mockResolvedValueOnce(mockSearchResults)
    mockGenerateObject.mockRejectedValueOnce(new Error("AI service error"))

    await expect(
      gatherEvidence({
        structuredQuestion: "Will something happen?",
        domain: "technology",
      })
    ).rejects.toThrow("AI service error")
  })

  it("handles empty search results gracefully", async () => {
    mockTavilySearch.mockResolvedValueOnce([])
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        evidence: [],
        searchSummary: "No relevant search results found.",
        limitations: ["Search returned zero results", "Cannot provide evidence"],
      },
    } as never)

    await expect(
      gatherEvidence({
        structuredQuestion: "Will something happen?",
        domain: "technology",
      })
    ).rejects.toThrow("AI returned invalid evidence")
  })

  it("passes AbortSignal to Tavily fetch via signal param", async () => {
    mockTavilySearch.mockResolvedValueOnce(mockSearchResults)
    mockGenerateObject.mockResolvedValueOnce({
      object: validEvidenceResult,
    } as never)

    await gatherEvidence({
      structuredQuestion: "Will something happen?",
      domain: "technology",
    })

    expect(mockTavilySearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(AbortSignal)
    )
  })

  it("passes AbortSignal to generateObject for DeepSeek analysis", async () => {
    mockTavilySearch.mockResolvedValueOnce(mockSearchResults)
    mockGenerateObject.mockResolvedValueOnce({
      object: validEvidenceResult,
    } as never)

    await gatherEvidence({
      structuredQuestion: "Will something happen?",
      domain: "technology",
    })

    const callArgs = mockGenerateObject.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(callArgs.abortSignal).toBeInstanceOf(AbortSignal)
  })
})
