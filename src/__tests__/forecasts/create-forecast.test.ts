import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Prisma
const mockTransaction = vi.fn()
const mockCreate = vi.fn()
const mockCreateMany = vi.fn()
const mockFindUnique = vi.fn()

vi.mock("@/lib/db", () => ({
  default: {
    domain: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    forecast: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    evidence: {
      createMany: (...args: unknown[]) => mockCreateMany(...args),
    },
    probabilityHistory: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    $transaction: (fn: unknown) => mockTransaction(fn),
  },
}))

// Ensure AI and search are NOT called
vi.mock("ai", () => ({
  generateObject: vi.fn(() => {
    throw new Error("AI should not be called during save")
  }),
}))

vi.mock("@/lib/search/tavily", () => ({
  tavilySearch: vi.fn(() => {
    throw new Error("Tavily should not be called during save")
  }),
}))

import { createForecast } from "@/lib/forecasts/create-forecast"

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
  evidence: [
    {
      title: "Test",
      url: "https://example.com",
      source: "example.com",
      summary: "Summary.",
      direction: "SUPPORT" as const,
      credibility: "HIGH" as const,
      relevance: "HIGH" as const,
      reasoning: "Reason.",
    },
  ],
}

describe("createForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default successful mock
    mockFindUnique.mockResolvedValue({ id: "dom-1", slug: "technology" })
    mockTransaction.mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
        return fn({
          forecast: { create: mockCreate },
          evidence: { createMany: mockCreateMany },
          probabilityHistory: { create: mockCreate },
        })
      }
    )
    mockCreate.mockResolvedValue({ id: "fc-1" })
    mockCreateMany.mockResolvedValue({ count: 1 })
  })

  it("returns forecast id on success", async () => {
    const result = await createForecast(validInput, "user-1")
    expect(result.id).toBe("fc-1")
  })

  it("throws when domain not found", async () => {
    mockFindUnique.mockResolvedValue(null)

    await expect(createForecast(validInput, "user-1")).rejects.toThrow(
      "not found"
    )
  })

  it("uses transaction for atomic writes", async () => {
    await createForecast(validInput, "user-1")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it("allows anonymous save (userId null)", async () => {
    const result = await createForecast(validInput, null)
    expect(result.id).toBe("fc-1")
  })

  it("creates forecast with correct data", async () => {
    await createForecast(validInput, "user-1")

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: validInput.structuredQuestion,
          type: "BINARY",
          status: "DRAFT",
          currentProbability: 0.64,
          creatorId: "user-1",
        }),
      })
    )
  })

  it("creates evidence for each item", async () => {
    const inputWithTwoEvidence = {
      ...validInput,
      evidence: [
        ...validInput.evidence,
        {
          title: "Test 2",
          url: "https://example2.com",
          source: "example2.com",
          summary: "Summary 2.",
          direction: "OPPOSE" as const,
          credibility: "MEDIUM" as const,
          relevance: "MEDIUM" as const,
          reasoning: "Reason 2.",
        },
      ],
    }

    await createForecast(inputWithTwoEvidence, "user-1")

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ title: "Test" }),
          expect.objectContaining({ title: "Test 2" }),
        ]),
      })
    )
  })

  it("creates probability history record", async () => {
    await createForecast(validInput, "user-1")

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          probability: 0.64,
          reason: expect.stringContaining("MEDIUM"),
        }),
      })
    )
  })

  it("filters out LOW relevance evidence, keeps MEDIUM", async () => {
    const input = {
      ...validInput,
      evidence: [
        {
          title: "LOW item",
          url: "https://low.com",
          source: "low.com",
          summary: "Low.",
          direction: "NEUTRAL" as const,
          credibility: "LOW" as const,
          relevance: "LOW" as const,
          reasoning: "Not relevant.",
        },
        {
          title: "MEDIUM item",
          url: "https://medium.com",
          source: "medium.com",
          summary: "Medium.",
          direction: "NEUTRAL" as const,
          credibility: "MEDIUM" as const,
          relevance: "MEDIUM" as const,
          reasoning: "Relevant background.",
        },
      ],
    }

    await createForecast(input, "user-1")

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.arrayContaining([
          expect.objectContaining({ title: "LOW item" }),
        ]),
      })
    )
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ title: "MEDIUM item" }),
        ]),
      })
    )
  })

  it("filters out LOW, keeps HIGH in mixed evidence", async () => {
    const input = {
      ...validInput,
      evidence: [
        {
          title: "LOW item",
          url: "https://low.com",
          source: "low.com",
          summary: "Low.",
          direction: "NEUTRAL" as const,
          credibility: "LOW" as const,
          relevance: "LOW" as const,
          reasoning: "Not relevant.",
        },
        {
          title: "HIGH item",
          url: "https://high.com",
          source: "high.com",
          summary: "High.",
          direction: "SUPPORT" as const,
          credibility: "HIGH" as const,
          relevance: "HIGH" as const,
          reasoning: "Very relevant.",
        },
      ],
    }

    await createForecast(input, "user-1")

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.arrayContaining([
          expect.objectContaining({ title: "LOW item" }),
        ]),
      })
    )
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ title: "HIGH item" }),
        ]),
      })
    )
  })

  it("keeps both MEDIUM and HIGH evidence", async () => {
    const input = {
      ...validInput,
      evidence: [
        {
          title: "MEDIUM item",
          url: "https://medium.com",
          source: "medium.com",
          summary: "Medium.",
          direction: "NEUTRAL" as const,
          credibility: "MEDIUM" as const,
          relevance: "MEDIUM" as const,
          reasoning: "Relevant.",
        },
        {
          title: "HIGH item",
          url: "https://high.com",
          source: "high.com",
          summary: "High.",
          direction: "SUPPORT" as const,
          credibility: "HIGH" as const,
          relevance: "HIGH" as const,
          reasoning: "Very relevant.",
        },
      ],
    }

    await createForecast(input, "user-1")

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ title: "MEDIUM item" }),
          expect.objectContaining({ title: "HIGH item" }),
        ]),
      })
    )
  })
})
