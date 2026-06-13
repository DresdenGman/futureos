import { z } from "zod"

/**
 * Input schema for the question structuring API.
 */
export const structureRequestSchema = z.object({
  originalQuestion: z
    .string()
    .min(1, "Question cannot be empty")
    .max(500, "Question must be under 500 characters"),
  domain: z.string().min(1, "Domain cannot be empty"),
})

export type StructureRequest = z.infer<typeof structureRequestSchema>

/**
 * Output schema for the AI-structured forecast question.
 */
export const structuredQuestionSchema = z.object({
  structuredQuestion: z
    .string()
    .min(1)
    .describe(
      "A verifiable yes/no question with clear scope, time range, and resolution criteria"
    ),
  forecastType: z.literal("BINARY").describe("Always BINARY for MVP"),
  deadlineSuggestion: z
    .string()
    .min(1)
    .describe(
      "Suggested resolution deadline in a clear date or time range format (e.g., '2027-06-13' or 'within 6 months')"
    ),
  resolutionCriteria: z
    .string()
    .min(1)
    .describe(
      "Specific, verifiable criteria for determining whether the event occurred or not"
    ),
  requiredClarifications: z
    .array(z.string())
    .describe(
      "Questions the user needs to answer to make this prediction more precise"
    ),
  isForecastable: z
    .boolean()
    .describe("Whether the question can be turned into a verifiable forecast"),
  notForecastableReason: z
    .string()
    .optional()
    .describe(
      "If not forecastable, explain why and suggest how to rephrase"
    ),
})

export type StructuredQuestion = z.infer<typeof structuredQuestionSchema>

/**
 * Full API response envelope.
 */
export const structureResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: structuredQuestionSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
])

export type StructureResponse = z.infer<typeof structureResponseSchema>
