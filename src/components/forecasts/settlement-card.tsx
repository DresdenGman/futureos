"use client"

import { useState } from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface SettlementCardProps {
  forecastId: string
  status: string
  outcome?: string | null
  resolvedAt?: string | null
  brierScore?: number | null
  creatorId?: string | null
  currentUserId: string | null
}

export function SettlementCard({
  forecastId,
  status,
  outcome,
  resolvedAt,
  brierScore,
  creatorId,
  currentUserId,
}: SettlementCardProps) {
  const [isSettling, setIsSettling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localOutcome, setLocalOutcome] = useState(outcome ?? null)
  const [localBrierScore, setLocalBrierScore] = useState(brierScore ?? null)
  const [localResolvedAt, setLocalResolvedAt] = useState(resolvedAt ?? null)
  const [localStatus, setLocalStatus] = useState(status)

  const isSettled = localStatus === "SETTLED"
  const isOwner = currentUserId !== null && creatorId === currentUserId
  const isAnonymous = !creatorId
  const canSettle = !isSettled && (isOwner || isAnonymous)

  async function handleSettle(outcome: "YES" | "NO") {
    const label = outcome === "YES" ? "occurred" : "not occurred"
    if (!window.confirm(`Mark this forecast as "${label}"? This cannot be undone.`)) {
      return
    }

    setIsSettling(true)
    setError(null)

    try {
      const res = await fetch(`/api/forecasts/${forecastId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to settle forecast")
        return
      }
      setLocalOutcome(json.data.outcome)
      setLocalBrierScore(json.data.brierScore)
      setLocalResolvedAt(json.data.resolvedAt)
      setLocalStatus("SETTLED")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsSettling(false)
    }
  }

  // Settled: show result
  if (isSettled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Settlement</CardTitle>
            <Badge variant="secondary">SETTLED</Badge>
          </div>
          <CardDescription>This forecast has been settled.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Outcome
              </h3>
              <div className="flex items-center gap-2">
                {localOutcome === "YES" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {localOutcome === "YES" ? "Occurred" : "Did Not Occur"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Resolved At
              </h3>
              <p className="text-sm">
                {localResolvedAt
                  ? new Date(localResolvedAt).toISOString().split("T")[0]
                  : "—"}
              </p>
            </div>
          </div>

          {localBrierScore != null && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Brier Score
                </h3>
                <span className="text-lg font-bold tabular-nums">
                  {localBrierScore.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {localBrierScore < 0.1
                  ? "Excellent calibration — the prediction was highly accurate."
                  : localBrierScore < 0.25
                    ? "Good calibration — better than random guessing."
                    : localBrierScore < 0.5
                      ? "Fair calibration — some room for improvement."
                      : "Poor calibration — the prediction was far from the outcome."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Not settled: permission-based UI
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settle Forecast</CardTitle>
        <CardDescription>
          {canSettle
            ? "Has this event occurred? Mark the final outcome."
            : !currentUserId
              ? "Sign in as the creator to settle this forecast."
              : "Only the creator can settle this forecast."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {canSettle && (
          <div className="flex gap-3">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => handleSettle("YES")}
              disabled={isSettling}
            >
              {isSettling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Occurred
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleSettle("NO")}
              disabled={isSettling}
            >
              {isSettling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Not Occurred
            </Button>
          </div>
        )}

        {isAnonymous && !isSettled && (
          <p className="text-xs text-muted-foreground text-center">
            This is an anonymous forecast. Anyone with the link can settle it.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
