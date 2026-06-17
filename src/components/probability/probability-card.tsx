import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ProbabilityEstimate } from "@/lib/ai/probability/schema"

const confidenceVariant: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
}

export function ProbabilityCard({
  estimate,
}: {
  estimate: ProbabilityEstimate
}) {
  const pct = Math.round(estimate.probability * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Step 3: Probability Estimate</CardTitle>
          <Badge variant={confidenceVariant[estimate.confidence]}>
            {estimate.confidence} Confidence
          </Badge>
        </div>
        <CardDescription>{estimate.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Probability Display */}
        <div className="flex flex-col items-center py-4">
          <span className="text-5xl font-bold tabular-nums">{pct}%</span>
          <span className="text-sm text-muted-foreground mt-2">
            Estimated probability
          </span>
        </div>

        <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Probability is not certainty.</strong> A {pct}% forecast
            means this outcome should happen about {pct} out of 100 times in
            similar situations.
          </p>
          <p>
            <strong>Confidence reflects evidence quality,</strong> not how
            dramatic the prediction is. Low confidence means limited or
            conflicting evidence.
          </p>
        </div>

        <Separator />

        {/* Reasoning */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Reasoning</h3>
          <p className="text-sm">{estimate.reasoning}</p>
        </div>

        <Separator />

        {/* Two-column: Key Drivers + Counter Arguments */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Key Drivers
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {estimate.keyDrivers.map((d, i) => (
                <li key={i} className="text-sm">
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Counter Arguments
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {estimate.counterArguments.map((c, i) => (
                <li key={i} className="text-sm">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Two-column: Assumptions + Uncertainty Factors */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Assumptions
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {estimate.assumptions.map((a, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Uncertainty Factors
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {estimate.uncertaintyFactors.map((u, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Resolution Criteria */}
        {estimate.recommendedResolutionCriteria && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recommended Resolution Criteria
              </h3>
              <p className="text-sm">{estimate.recommendedResolutionCriteria}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
