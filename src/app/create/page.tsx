"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EvidenceCard } from "@/components/evidence/evidence-card"
import type { StructuredQuestion } from "@/lib/ai/structure/schema"
import type { EvidenceResult } from "@/lib/ai/evidence/schema"
import type { ProbabilityEstimate } from "@/lib/ai/probability/schema"
import { ProbabilityCard } from "@/components/probability/probability-card"
import { CreateStepper } from "@/components/create/create-stepper"
import { canEstimateProbability, canSaveForecast } from "@/lib/forecasts/flow"

const formSchema = z.object({
  originalQuestion: z
    .string()
    .min(1, "Please enter a question")
    .max(500, "Question must be under 500 characters"),
  domain: z.string().min(1, "Please select a domain"),
})

type FormValues = z.infer<typeof formSchema>

const DOMAINS = [
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "finance", label: "Finance" },
  { value: "geopolitics", label: "Geopolitics" },
  { value: "sports-entertainment", label: "Sports & Entertainment" },
]

export default function CreatePage() {
  // Step A: Structure
  const [structured, setStructured] = useState<StructuredQuestion | null>(null)
  const [structureError, setStructureError] = useState<string | null>(null)
  const [isStructuring, setIsStructuring] = useState(false)

  // Step B: Evidence
  const [evidence, setEvidence] = useState<EvidenceResult | null>(null)
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const [isGathering, setIsGathering] = useState(false)

  // Step C: Probability
  const [estimate, setEstimate] = useState<ProbabilityEstimate | null>(null)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

  // Save
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Compute current step
  const step = estimate
    ? 3
    : evidence
      ? 2
      : structured
        ? 1
        : 0

  const steps = [
    { label: "Structure", status: (step === 0 ? "active" : step > 0 ? "completed" : "pending") as StepStatus },
    { label: "Evidence", status: (step === 1 ? "active" : step > 1 ? "completed" : "pending") as StepStatus },
    { label: "Probability", status: (step === 2 ? "active" : step > 2 ? "completed" : "pending") as StepStatus },
    { label: "Save", status: (step === 3 ? "active" : isSaving ? "active" : "pending") as StepStatus },
  ]

  type StepStatus = "pending" | "active" | "completed"

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { originalQuestion: "", domain: "" },
  })

  // --- Step A: Structure Question ---
  async function onStructure(values: FormValues) {
    setIsStructuring(true)
    setStructureError(null)
    setStructured(null)
    setEvidence(null)
    setEvidenceError(null)

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setStructureError(json.error || "Failed to structure question")
        return
      }
      setStructured(json.data)
    } catch (err) {
      setStructureError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsStructuring(false)
    }
  }

  // --- Step B: Gather Evidence ---
  async function onGatherEvidence() {
    if (!structured) return

    setIsGathering(true)
    setEvidenceError(null)
    setEvidence(null)

    try {
      const res = await fetch("/api/ai/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuestion: structured.structuredQuestion,
          domain: form.getValues("domain"),
          deadlineSuggestion: structured.deadlineSuggestion,
          resolutionCriteria: structured.resolutionCriteria,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setEvidenceError(json.error || "Failed to gather evidence")
        return
      }
      setEvidence(json.data)
    } catch (err) {
      setEvidenceError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsGathering(false)
    }
  }

  // --- Step C: Estimate Probability ---
  async function onEstimateProbability() {
    if (!canEstimateProbability(evidence)) return

    setIsEstimating(true)
    setEstimateError(null)
    setEstimate(null)

    try {
      const res = await fetch("/api/ai/probability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuestion: structured!.structuredQuestion,
          domain: form.getValues("domain"),
          deadlineSuggestion: structured!.deadlineSuggestion,
          resolutionCriteria: structured!.resolutionCriteria,
          evidence: evidence.evidence,
          limitations: evidence.limitations,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setEstimateError(json.error || "Failed to estimate probability")
        return
      }
      setEstimate(json.data)
    } catch (err) {
      setEstimateError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsEstimating(false)
    }
  }

  // --- Save Forecast ---
  async function onSaveForecast() {
    if (!canSaveForecast(estimate) || !evidence || !structured) return

    setIsSaving(true)
    setEstimateError(null)

    try {
      const res = await fetch("/api/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuestion: structured.structuredQuestion,
          originalQuestion: form.getValues("originalQuestion"),
          domain: form.getValues("domain"),
          forecastType: "BINARY",
          deadlineSuggestion: structured.deadlineSuggestion,
          resolutionCriteria: structured.resolutionCriteria,
          probability: estimate.probability,
          confidence: estimate.confidence,
          probabilitySummary: estimate.summary,
          probabilityReasoning: estimate.reasoning,
          keyDrivers: estimate.keyDrivers,
          counterArguments: estimate.counterArguments,
          assumptions: estimate.assumptions,
          uncertaintyFactors: estimate.uncertaintyFactors,
          recommendedResolutionCriteria:
            estimate.recommendedResolutionCriteria,
          evidence: evidence.evidence.map((e) => ({
            title: e.title,
            url: e.url,
            source: e.source,
            publishedDate: e.publishedDate,
            summary: e.summary,
            direction: e.direction,
            credibility: e.credibility,
            relevance: e.relevance,
            reasoning: e.reasoning,
          })),
          limitations: evidence.limitations,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setEstimateError(json.error || "Failed to save forecast")
        return
      }
      router.push(`/forecast/${json.data.id}`)
    } catch (err) {
      setEstimateError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsSaving(false)
    }
  }

  // --- Reset to Step A ---
  async function onStartOver() {
    setStructured(null)
    setStructureError(null)
    setEvidence(null)
    setEvidenceError(null)
    setEstimate(null)
    setEstimateError(null)
  }

  return (
    <div className="flex flex-col items-center py-16">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Forecast</h1>
          <p className="text-muted-foreground">
            Describe what you want to predict. AI will structure it, then search
            for evidence.
          </p>
        </div>

        {/* Stepper */}
        <CreateStepper steps={steps} />

        {/* ======== STEP A: Structure Form ======== */}
        {!structured && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Step 1: What do you want to predict?
              </CardTitle>
              <CardDescription>
                Be as specific as you can about the event, time frame, and
                outcome.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onStructure)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="originalQuestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., "Will OpenAI release a new flagship AI model before the end of 2026?"'
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          AI will help clarify time frame and resolution
                          criteria.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DOMAINS.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Helps AI understand the context.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isStructuring}
                    className="w-full"
                  >
                    {isStructuring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Structuring...
                      </>
                    ) : (
                      "Structure Question"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Structure Error */}
        {structureError && (
          <Alert variant="destructive">
            <AlertDescription>{structureError}</AlertDescription>
          </Alert>
        )}

        {/* ======== STEP A RESULT + STEP B TRIGGER ======== */}
        {structured && !evidence && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Step 1: Structured Forecast
                </CardTitle>
                <Badge
                  variant={
                    structured.isForecastable ? "default" : "destructive"
                  }
                >
                  {structured.isForecastable
                    ? "Forecastable"
                    : "Not Forecastable"}
                </Badge>
              </div>
              <CardDescription>
                AI-structured verifiable prediction question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Structured Question
                </h3>
                <p className="text-base font-medium">
                  {structured.structuredQuestion}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Type
                  </h3>
                  <p className="text-sm">{structured.forecastType}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Suggested Deadline
                  </h3>
                  <p className="text-sm">{structured.deadlineSuggestion}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Resolution Criteria
                </h3>
                <p className="text-sm">{structured.resolutionCriteria}</p>
              </div>

              {structured.requiredClarifications.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Required Clarifications
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {structured.requiredClarifications.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {structured.isForecastable && (
                <>
                  <Separator />
                  <div className="pt-2 space-y-2">
                    <Button
                      className="w-full"
                      onClick={onGatherEvidence}
                      disabled={isGathering}
                    >
                      {isGathering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gathering Evidence...
                        </>
                      ) : (
                        "Confirm and Gather Evidence"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={onStartOver}
                    >
                      Start Over
                    </Button>
                  </div>
                </>
              )}

              {!structured.isForecastable && (
                <>
                  <Separator />
                  {structured.notForecastableReason && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Why Not Forecastable
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {structured.notForecastableReason}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onStartOver}
                    >
                      Try Again
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Try rephrasing to be more specific and verifiable.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Evidence Error */}
        {evidenceError && (
          <Alert variant="destructive">
            <AlertDescription>{evidenceError}</AlertDescription>
          </Alert>
        )}

        {/* ======== STEP B: Evidence Results ======== */}
        {evidence && (
          <div className="space-y-8">
            {/* Step 2 Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Step 2: Evidence Analysis
                </CardTitle>
                <CardDescription>{evidence.searchSummary}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Badge variant="secondary">
                  {evidence.evidence.length} evidence items
                </Badge>
                {evidence.limitations.length > 0 && (
                  <Badge variant="outline">
                    {evidence.limitations.length} limitations
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Evidence Cards */}
            <div className="space-y-4">
              {evidence.evidence.map((item, i) => (
                <EvidenceCard key={i} evidence={item} />
              ))}
            </div>

            {/* Limitations */}
            {evidence.limitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Limitations</CardTitle>
                  <CardDescription>
                    Known gaps and caveats in the evidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {evidence.limitations.map((lim, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground"
                      >
                        {lim}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Step: Probability */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <Button
                  className="w-full max-w-sm"
                  onClick={onEstimateProbability}
                  disabled={isEstimating}
                >
                  {isEstimating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Estimating Probability...
                    </>
                  ) : (
                    "Continue to Probability Estimate"
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartOver}
                  >
                    Start Over
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
    setEvidence(null)
    setEvidenceError(null)
    setEstimate(null)
    setEstimateError(null)
                    }}
                  >
                    Back to Structure
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Probability prediction and database saving coming in later
                  stages.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estimate Error */}
        {estimateError && (
          <Alert variant="destructive">
            <AlertDescription>{estimateError}</AlertDescription>
          </Alert>
        )}

        {/* ======== STEP C: Probability Estimate ======== */}
        {estimate && (
          <div className="space-y-8">
            <ProbabilityCard estimate={estimate} />

            {/* Next Step Placeholder */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <Button
                  className="w-full max-w-sm"
                  onClick={onSaveForecast}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Forecast Draft"
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartOver}
                  >
                    Start Over
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEstimate(null)
                      setEstimateError(null)
                    }}
                  >
                    Back to Evidence
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Database saving coming in Stage 5.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
