import prisma from "@/lib/db"
import type { CreateForecastInput } from "./schema"

export async function createForecast(
  input: CreateForecastInput,
  userId: string | null
): Promise<{ id: string }> {
  console.log(
    `[forecast] Creating forecast: "${input.structuredQuestion.substring(0, 60)}..." userId=${userId ?? "anonymous"}`
  )

  const domain = await prisma.domain.findUnique({
    where: { slug: input.domain },
  })

  if (!domain) {
    throw new Error(`Domain "${input.domain}" not found`)
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create Forecast
    const forecast = await tx.forecast.create({
      data: {
        title: input.structuredQuestion,
        originalQuestion: input.originalQuestion,
        domainId: domain.id,
        type: "BINARY",
        status: "DRAFT",
        deadline: new Date(input.deadlineSuggestion),
        resolutionCriteria: input.resolutionCriteria,
        currentProbability: input.probability,
        aiConfidence: input.confidence,
        creatorId: userId,
        metadata: {
          probabilitySummary: input.probabilitySummary,
          probabilityReasoning: input.probabilityReasoning,
          keyDrivers: input.keyDrivers,
          counterArguments: input.counterArguments,
          assumptions: input.assumptions,
          uncertaintyFactors: input.uncertaintyFactors,
          recommendedResolutionCriteria: input.recommendedResolutionCriteria,
          limitations: input.limitations,
        },
      },
    })

    // 2. Create Evidence records
    if (input.evidence.length > 0) {
      await tx.evidence.createMany({
        data: input.evidence.map((e) => ({
          forecastId: forecast.id,
          title: e.title,
          summary: e.summary,
          source: e.source,
          sourceUrl: e.url,
          direction: e.direction,
          credibility: e.credibility,
          relevance: e.relevance,
        })),
      })
    }

    // 3. Create initial ProbabilityHistory
    await tx.probabilityHistory.create({
      data: {
        forecastId: forecast.id,
        probability: input.probability,
        reason: `Initial AI estimate (confidence: ${input.confidence}). ${input.probabilitySummary}`,
      },
    })

    console.log(
      `[forecast] Created forecast id=${forecast.id} with ${input.evidence.length} evidence items`
    )

    return { id: forecast.id }
  })
}
