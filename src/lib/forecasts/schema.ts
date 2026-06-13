import { z } from "zod"
import { evidenceItemSchema } from "@/lib/ai/evidence/schema"

/**
 * Input schema for creating a forecast draft.
 */
export const createForecastSchema = z.object({
  structuredQuestion: z.string().min(1),
  originalQuestion: z.string().optional(),
  domain: z.string().min(1),
  forecastType: z.literal("BINARY"),
  deadlineSuggestion: z.string().min(1),
  resolutionCriteria: z.string().min(1),
  probability: z.number().min(0).max(1),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  probabilitySummary: z.string().min(1),
  probabilityReasoning: z.string().min(1),
  keyDrivers: z.array(z.string()).min(1),
  counterArguments: z.array(z.string()).min(1),
  assumptions: z.array(z.string()).min(1),
  uncertaintyFactors: z.array(z.string()).min(1),
  recommendedResolutionCriteria: z.string().optional(),
  evidence: z.array(evidenceItemSchema).min(1),
  limitations: z.array(z.string()).optional(),
})

export type CreateForecastInput = z.infer<typeof createForecastSchema>
