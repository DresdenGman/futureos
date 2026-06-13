import { z } from "zod"

/**
 * Request schema for settling a forecast.
 */
export const settleRequestSchema = z.object({
  outcome: z.enum(["YES", "NO"]),
})

export type SettleRequest = z.infer<typeof settleRequestSchema>

/**
 * Response schema for settlement result.
 */
export const settleResultSchema = z.object({
  id: z.string(),
  status: z.literal("SETTLED"),
  outcome: z.enum(["YES", "NO"]),
  resolvedAt: z.string(),
  brierScore: z.number().min(0).max(1),
})

export type SettleResult = z.infer<typeof settleResultSchema>

/**
 * API response envelope.
 */
export const settleResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: settleResultSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
])

export type SettleResponse = z.infer<typeof settleResponseSchema>
