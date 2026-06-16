import { generateObject } from "ai"
import { getModel } from "@/lib/ai/client"
import {
  withTimeout,
  DEEPSEEK_TIMEOUT_MS,
} from "@/lib/utils/timeout"
import {
  probabilityEstimateSchema,
  type ProbabilityRequest,
  type ProbabilityEstimate,
} from "./schema"
import { InsufficientEvidenceError } from "@/lib/ai/evidence/schema"

const SYSTEM_PROMPT = `You are a cautious probabilistic forecasting analyst for FutureOS, an AI-powered forecasting platform.

Your job: Based on a structured binary forecast question and collected evidence, produce a rigorous probability estimate.

CRITICAL RULES:
1. You are NOT stating a fact. You are giving a probability estimate based on available evidence.
2. ONLY use the provided evidence. Do NOT fabricate new facts, sources, URLs, dates, or events.
3. You MAY reason about implications and patterns in the evidence, but label your assumptions clearly.
4. The probability MUST be a number between 0.00 and 1.00 (e.g., 0.64 means 64%).
5. Do NOT output probability as a string or percentage. Just the decimal number.
6. If evidence is thin or conflicting, LOWER your confidence (use LOW or MEDIUM) and explain why.
7. You MUST provide at least one counter-argument (even if evidence is mostly one-sided).
8. You MUST list your key assumptions and uncertainty factors.
9. Avoid over-confidence. Good forecasters calibrate their uncertainty.
10. Focus on the question's specific criteria, not general trends.
11. If all usable evidence is NEUTRAL (relevant background without directional support), use appropriate base rates and reasoning. Confidence MUST be LOW. Explicitly state that there is no directional supporting or opposing evidence. Do NOT default mechanically to 50%.

For each probability estimate, think about:
- What EVENTS would need to happen for a "yes" outcome?
- What EVENTS would prevent it (counter-arguments)?
- What information do you NOT have that would change your estimate?
- How might the situation evolve between now and the deadline?`

function formatEvidenceForPrompt(
  evidence: ProbabilityRequest["evidence"]
): string {
  return evidence
    .map(
      (e, i) =>
        `[${i + 1}] ${e.direction} | Cred:${e.credibility} | Rel:${e.relevance}\nTitle: ${e.title}\nSource: ${e.source} (${e.url})\nSummary: ${e.summary}\nReasoning: ${e.reasoning}`
    )
    .join("\n\n---\n\n")
}

export async function estimateProbability(
  input: ProbabilityRequest
): Promise<ProbabilityEstimate> {
  const usableEvidence = input.evidence.filter(
    (e) => e.relevance === "MEDIUM" || e.relevance === "HIGH"
  )

  if (usableEvidence.length === 0) {
    throw new InsufficientEvidenceError("NO_RELEVANT_EVIDENCE")
  }

  const allNeutral = usableEvidence.every((e) => e.direction === "NEUTRAL")

  const evidenceText = formatEvidenceForPrompt(usableEvidence)
  const limitationsText = input.limitations?.length
    ? `\nKnown Limitations:\n${input.limitations.map((l) => `- ${l}`).join("\n")}`
    : ""

  const prompt = `Forecast Question: ${input.structuredQuestion}
Domain: ${input.domain}
${input.deadlineSuggestion ? `Deadline: ${input.deadlineSuggestion}` : ""}
${input.resolutionCriteria ? `Resolution Criteria: ${input.resolutionCriteria}` : ""}

Evidence Collected:
${evidenceText}
${limitationsText}

Based on the above evidence and the forecast question, provide a probability estimate.

Output a JSON object with these exact fields:
- "probability" (number): Between 0.00 and 1.00
- "confidence" (string): LOW, MEDIUM, or HIGH
- "summary" (string): Brief probability summary
- "reasoning" (string): Detailed reasoning
- "keyDrivers" (string[]): Factors supporting YES
- "counterArguments" (string[]): Factors supporting NO
- "assumptions" (string[]): Key assumptions made
- "uncertaintyFactors" (string[]): Sources of uncertainty
- "recommendedResolutionCriteria" (string, optional)`

  const { object } = await withTimeout("deepseek", DEEPSEEK_TIMEOUT_MS, (signal) =>
    generateObject({
      model: getModel(),
      output: "no-schema",
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.3,
      abortSignal: signal,
    })
  )

  const parsed = probabilityEstimateSchema.safeParse(object)
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`AI returned invalid probability estimate: ${errors}`)
  }

  if (allNeutral) {
    const note =
      "No usable evidence directly supports or opposes the outcome. The estimate relies primarily on base rates and general reasoning."
    return {
      ...parsed.data,
      confidence: "LOW" as const,
      reasoning: parsed.data.reasoning.endsWith(note)
        ? parsed.data.reasoning
        : parsed.data.reasoning + "\n\n" + note,
    }
  }

  return parsed.data
}
