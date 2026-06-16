import { z } from "zod"

export class InsufficientEvidenceError extends Error {
  public readonly reason: "NO_SEARCH_RESULTS" | "NO_RELEVANT_EVIDENCE"

  constructor(reason: "NO_SEARCH_RESULTS" | "NO_RELEVANT_EVIDENCE") {
    const message =
      reason === "NO_SEARCH_RESULTS"
        ? "No search results were found."
        : "No sufficiently relevant evidence was found."
    super(message)
    this.name = "InsufficientEvidenceError"
    this.reason = reason
  }
}

/**
 * Input schema for the evidence gathering API.
 */
export const evidenceRequestSchema = z.object({
  structuredQuestion: z.string().min(1, "Structured question cannot be empty"),
  domain: z.string().min(1, "Domain cannot be empty"),
  deadlineSuggestion: z.string().optional(),
  resolutionCriteria: z.string().optional(),
})

export type EvidenceRequest = z.infer<typeof evidenceRequestSchema>

/**
 * Schema for a single evidence item.
 */
export const evidenceItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url("Must be a valid URL"),
  source: z.string().min(1),
  publishedDate: z.string().nullable().optional(),
  summary: z.string().min(1).max(500),
  direction: z.enum(["SUPPORT", "OPPOSE", "NEUTRAL"]),
  credibility: z.enum(["LOW", "MEDIUM", "HIGH"]),
  relevance: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reasoning: z.string().min(1),
})

export type EvidenceItem = z.infer<typeof evidenceItemSchema>

/**
 * Full evidence output schema from AI.
 */
export const evidenceResultSchema = z.object({
  evidence: z.array(evidenceItemSchema),
  searchSummary: z.string().min(1),
  limitations: z.array(z.string()),
})

export type EvidenceResult = z.infer<typeof evidenceResultSchema>

/**
 * API response envelope.
 */
export const evidenceResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: evidenceResultSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
])

export type EvidenceResponse = z.infer<typeof evidenceResponseSchema>
