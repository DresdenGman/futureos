import prisma from "@/lib/db"
import { calculateBinaryBrierScore } from "@/lib/scoring/brier"
import type { SettleResult } from "./schema"

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to perform this action.") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Only the creator can settle this forecast.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export async function settleForecast(
  forecastId: string,
  outcome: "YES" | "NO",
  currentUserId: string | null
): Promise<SettleResult> {
  console.log(
    `[settle] Settling forecast id=${forecastId} outcome=${outcome} userId=${currentUserId ?? "anonymous"}`
  )

  const forecast = await prisma.forecast.findUnique({
    where: { id: forecastId },
  })

  if (!forecast) {
    throw new Error(`Forecast "${forecastId}" not found`)
  }

  if (forecast.status === "SETTLED") {
    throw new Error(`Forecast "${forecastId}" has already been settled`)
  }

  if (forecast.currentProbability == null) {
    throw new Error(
      `Forecast "${forecastId}" has no probability to score against`
    )
  }

  // Permission check
  if (forecast.creatorId) {
    if (!currentUserId) {
      throw new UnauthorizedError(
        "You must be signed in to settle this forecast."
      )
    }
    if (currentUserId !== forecast.creatorId) {
      throw new ForbiddenError(
        "Only the creator can settle this forecast."
      )
    }
  } else {
    // Anonymous forecast: allowed for now
    console.log("[settle] Settling anonymous forecast")
  }

  const brierScore = calculateBinaryBrierScore(
    forecast.currentProbability,
    outcome
  )

  await prisma.forecast.update({
    where: { id: forecastId },
    data: {
      status: "SETTLED",
      outcome,
      resolvedAt: new Date(),
      brierScore,
      settlementResult: outcome === "YES",
    },
  })

  console.log(
    `[settle] Forecast id=${forecastId} settled: outcome=${outcome} brierScore=${brierScore}`
  )

  return {
    id: forecastId,
    status: "SETTLED",
    outcome,
    resolvedAt: new Date().toISOString(),
    brierScore,
  }
}
