import Link from "next/link"
import prisma from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Brain, TrendingUp, ArrowRight } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const recentForecasts = await prisma.forecast.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      domain: true,
      creator: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="flex flex-col items-center py-16 md:py-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          FutureOS
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered probabilistic forecasting platform.
          <br />
          Structure questions, gather evidence, track probabilities.
        </p>
        <div className="flex flex-col items-center gap-2 pt-4">
          <Link href="/create">
            <Button size="lg" className="text-base">
              Create a Forecast
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start with a question that has a deadline and a clear way to resolve it.
          </p>
        </div>
      </section>

      {/* Capability Cards */}
      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Search className="h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-lg">Structure Questions</CardTitle>
            <CardDescription>
              Turn vague ideas into verifiable prediction questions with clear
              resolution criteria and time bounds.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Brain className="h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-lg">Gather Evidence</CardTitle>
            <CardDescription>
              AI searches and analyzes supporting and opposing evidence from
              multiple sources, with credibility scoring.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <TrendingUp className="h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-lg">Measure Accuracy</CardTitle>
            <CardDescription>
              Settle forecasts and evaluate their accuracy with Brier Scores.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* How FutureOS Works */}
      <section className="mt-24 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-6 text-center">
          How FutureOS Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <CardTitle className="text-base">Ask</CardTitle>
              </div>
              <CardDescription>
                Start with a question that has a clear event, deadline, and
                resolution criteria.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <CardTitle className="text-base">Review</CardTitle>
              </div>
              <CardDescription>
                FutureOS searches for supporting, opposing, and neutral signals,
                then estimates a probability.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <CardTitle className="text-base">Resolve</CardTitle>
              </div>
              <CardDescription>
                Save the forecast, come back later, resolve the outcome, and
                track your accuracy.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Good vs Bad Questions */}
      <section className="mt-20 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-6 text-center">
          What Makes a Good Forecast?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Good questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="block font-medium">
                  Will OpenAI release a new flagship model before 2026-09-30?
                </span>
                <span className="text-xs text-muted-foreground">
                  Clear event, deadline, and verifiable outcome.
                </span>
              </div>
              <div className="text-sm">
                <span className="block font-medium">
                  Will Tesla announce a new low-cost EV before 2026-12-31?
                </span>
                <span className="text-xs text-muted-foreground">
                  Specific company, specific event, clear deadline.
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                Too vague
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="block font-medium">Will AI change the world?</span>
                <span className="text-xs text-muted-foreground">
                  No deadline, no clear event, impossible to verify.
                </span>
              </div>
              <div className="text-sm">
                <span className="block font-medium">Will Tesla do well?</span>
                <span className="text-xs text-muted-foreground">
                  &ldquo;Do well&rdquo; is subjective — needs measurable
                  criteria.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Forecasts */}
      <section className="mt-24 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Recent Forecasts
        </h2>

        {recentForecasts.length > 0 ? (
          <div className="space-y-3">
            {recentForecasts.map((f) => {
              const pct = f.currentProbability
                ? Math.round(f.currentProbability * 100)
                : null
              return (
                <Link key={f.id} href={`/forecast/${f.id}`}>
                  <Card className="transition-shadow hover:shadow-md cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {f.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {f.domain.name}
                          </Badge>
                          <span>·</span>
                          <span>{f.status}</span>
                          <span>·</span>
                          <span>
                            {f.creator
                              ? f.creator.name || f.creator.email
                              : "Anonymous"}
                          </span>
                          <span>·</span>
                          <span>
                            {f.createdAt.toISOString().split("T")[0]}
                          </span>
                          {f.outcome && (
                            <>
                              <span>·</span>
                              <span
                                className={
                                  f.outcome === "YES"
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {f.outcome === "YES" ? "Occurred" : "Not Occurred"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {f.brierScore != null && (
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">
                              Brier
                            </span>
                            <p className="text-sm font-bold tabular-nums">
                              {f.brierScore.toFixed(3)}
                            </p>
                          </div>
                        )}
                        {f.brierScore == null && pct !== null && (
                          <span className="text-lg font-bold tabular-nums">
                            {pct}%
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No forecasts yet"
            description="Create your first prediction to get started."
            actionLabel="Start a Forecast"
            actionHref="/create"
          />
        )}
      </section>
    </div>
  )
}
