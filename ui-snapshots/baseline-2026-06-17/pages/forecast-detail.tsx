import { notFound } from "next/navigation"
import prisma from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth/current-user"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EvidenceCard } from "@/components/evidence/evidence-card"
import { SettlementCard } from "@/components/forecasts/settlement-card"

export const dynamic = "force-dynamic"

interface MetadataFields {
  probabilitySummary?: string
  probabilityReasoning?: string
  keyDrivers?: string[]
  counterArguments?: string[]
  assumptions?: string[]
  uncertaintyFactors?: string[]
  recommendedResolutionCriteria?: string
  limitations?: string[]
}

export default async function ForecastDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const forecast = await prisma.forecast.findUnique({
    where: { id: params.id },
    include: {
      domain: true,
      evidence: {
        orderBy: { createdAt: "asc" },
      },
      probabilityHistory: {
        orderBy: { createdAt: "asc" },
      },
      creator: {
        select: { name: true, email: true },
      },
    },
  })

  if (!forecast) {
    notFound()
  }

  const currentUserId = await getCurrentUserId()

  const metadata = (forecast.metadata ?? {}) as MetadataFields
  const pct = forecast.currentProbability
    ? Math.round(forecast.currentProbability * 100)
    : null

  const confidenceVariant: Record<string, "default" | "secondary" | "outline"> =
    { HIGH: "default", MEDIUM: "secondary", LOW: "outline" }

  return (
    <div className="flex flex-col items-center py-16">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{forecast.title}</h1>
            <Badge variant="secondary">{forecast.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{forecast.domain.name}</span>
            <span>·</span>
            <span>
              Deadline: {forecast.deadline.toISOString().split("T")[0]}
            </span>
            {forecast.creator && (
              <>
                <span>·</span>
                <span>
                  by {forecast.creator.name || forecast.creator.email}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Probability */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Probability</CardTitle>
              {forecast.aiConfidence && (
                <Badge
                  variant={
                    confidenceVariant[forecast.aiConfidence] ?? "outline"
                  }
                >
                  {forecast.aiConfidence} Confidence
                </Badge>
              )}
            </div>
            <CardDescription>
              {metadata.probabilitySummary ?? "AI-generated probability estimate"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pct !== null ? (
              <div className="flex flex-col items-center py-4">
                <span className="text-5xl font-bold tabular-nums">{pct}%</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No probability estimate available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resolution Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resolution Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{forecast.resolutionCriteria}</p>
          </CardContent>
        </Card>

        {/* Reasoning & Drivers */}
        {(metadata.probabilityReasoning ||
          (metadata.keyDrivers && metadata.keyDrivers.length > 0) ||
          (metadata.counterArguments &&
            metadata.counterArguments.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {metadata.probabilityReasoning && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Reasoning
                  </h3>
                  <p className="text-sm">{metadata.probabilityReasoning}</p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {metadata.keyDrivers &&
                  metadata.keyDrivers.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Key Drivers
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {metadata.keyDrivers.map((d, i) => (
                          <li key={i} className="text-sm">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {metadata.counterArguments &&
                  metadata.counterArguments.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Counter Arguments
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {metadata.counterArguments.map((c, i) => (
                          <li key={i} className="text-sm">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {metadata.assumptions && metadata.assumptions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Assumptions
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {metadata.assumptions.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {metadata.uncertaintyFactors &&
                  metadata.uncertaintyFactors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Uncertainty Factors
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {metadata.uncertaintyFactors.map((u, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground"
                          >
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Evidence ({forecast.evidence.length} items)
            </CardTitle>
            <CardDescription>
              Supporting and opposing evidence collected during creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forecast.evidence.length > 0 ? (
              forecast.evidence.map((item) => (
                <EvidenceCard
                  key={item.id}
                  evidence={{
                    title: item.title,
                    url: item.sourceUrl ?? "#",
                    source: item.source,
                    summary: item.summary ?? "",
                    direction: item.direction,
                    credibility: item.credibility,
                    relevance: item.relevance,
                    reasoning: "",
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No evidence recorded.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Probability History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Probability History</CardTitle>
            <CardDescription>
              Timeline of probability changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forecast.probabilityHistory.length > 0 ? (
              <ul className="space-y-3">
                {forecast.probabilityHistory.map((h) => (
                  <li key={h.id} className="flex items-start gap-3 text-sm">
                    <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                      {h.createdAt.toISOString().split("T")[0]}
                    </span>
                    <span className="font-medium tabular-nums">
                      {Math.round(h.probability * 100)}%
                    </span>
                    <span className="text-muted-foreground">{h.reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No history recorded.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Original Question */}
        {forecast.originalQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{forecast.originalQuestion}&rdquo;
              </p>
            </CardContent>
          </Card>
        )}

        {/* Limitations */}
        {metadata.limitations &&
          Array.isArray(metadata.limitations) &&
          metadata.limitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Limitations</CardTitle>
                <CardDescription>
                  Known gaps and caveats in the evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {metadata.limitations.map((lim: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {lim}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        {/* Settlement */}
        <SettlementCard
          forecastId={forecast.id}
          status={forecast.status}
          outcome={forecast.outcome}
          resolvedAt={forecast.resolvedAt?.toISOString()}
          brierScore={forecast.brierScore}
          creatorId={forecast.creatorId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
