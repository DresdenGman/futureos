import { z } from "zod"
import { evidenceItemSchema } from "@/lib/ai/evidence/schema"

/**
 * Input schema for the probability estimation API.
 */
export const probabilityRequestSchema = z.object({
  structuredQuestion: z.string().min(1, "Structured question cannot be empty"),
  domain: z.string().min(1, "Domain cannot be empty"),
  deadlineSuggestion: z.string().optional(),
  resolutionCriteria: z.string().optional(),
  evidence: z.array(evidenceItemSchema).min(1, "At least one evidence item is required"),
  limitations: z.array(z.string()).optional(),
})

export type ProbabilityRequest = z.infer<typeof probabilityRequestSchema>

/**
 * Output schema for the AI probability estimate.
 */
export const probabilityEstimateSchema = z.object({
  probability: z
    .number()
    .min(0, "Probability must be at least 0")
    .max(1, "Probability must be at most 1"),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  summary: z.string().min(1),
  reasoning: z.string().min(1),
  keyDrivers: z.array(z.string()).min(1, "At least one key driver required"),
  counterArguments: z
    .array(z.string())
    .min(1, "At least one counter argument required"),
  assumptions: z.array(z.string()).min(1, "At least one assumption required"),
  uncertaintyFactors: z
    .array(z.string())
    .min(1, "At least one uncertainty factor required"),
  recommendedResolutionCriteria: z.string().optional(),
})

export type ProbabilityEstimate = z.infer<typeof probabilityEstimateSchema>

/**
 * API response envelope.
 */
export const probabilityResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: probabilityEstimateSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
])

export type ProbabilityResponse = z.infer<typeof probabilityResponseSchema>
