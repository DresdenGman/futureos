import { generateObject } from "ai"
import { getModel } from "@/lib/ai/client"
import { tavilySearch, type TavilyResult } from "@/lib/search/tavily"
import {
  withTimeout,
  DEEPSEEK_TIMEOUT_MS,
  TAVILY_TIMEOUT_MS,
} from "@/lib/utils/timeout"
import {
  evidenceResultSchema,
  InsufficientEvidenceError,
  type EvidenceRequest,
  type EvidenceResult,
  type EvidenceItem,
} from "./schema"

const SYSTEM_PROMPT = `You are a rigorous evidence analyst for FutureOS, an AI-powered probabilistic forecasting platform.

Your job: Analyze search results and classify them as evidence for or against a binary prediction question.

CRITICAL RULES:
1. ONLY use the search results provided. Do NOT fabricate any information.
2. Do NOT predict the outcome. Do NOT give probabilities or conclusions.
3. Each evidence item MUST come from a provided search result URL.
4. Only return sources genuinely relevant to the exact forecast question and resolution criteria.
5. Omit irrelevant, duplicate, unverifiable, or generic sources that do not inform this specific forecast.
6. For each retained result, determine:
   - direction: Does it SUPPORT the event happening, OPPOSE it, or is it NEUTRAL?
   - credibility: How trustworthy is the source? (LOW / MEDIUM / HIGH)
   - relevance: How directly related to the forecast question? (LOW / MEDIUM / HIGH)
   - reasoning: Explain WHY this evidence is relevant to the question.
7. NEUTRAL means relevant background evidence that neither supports nor opposes the event.
8. NEUTRAL must NOT be used for irrelevant search results.
9. If none of the search results are sufficiently relevant, return an empty evidence array.
10. Never invent an evidence item when search results are empty.
11. Write a concise summary (1-3 sentences) for each retained piece of evidence.
12. In searchSummary, summarize what the overall search landscape looks like.
13. In limitations, note any gaps: missing data, lack of authoritative sources, etc.`

function formatSearchResults(results: TavilyResult[]): string {
  return results
    .map(
      (r, i) =>
        `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nSource: ${new URL(r.url).hostname}\nDate: ${r.published_date || "unknown"}\nContent: ${r.content}`
    )
    .join("\n\n---\n\n")
}

export function getUsableEvidence(
  evidence: EvidenceItem[]
): EvidenceItem[] {
  return evidence.filter(
    (e) => e.relevance === "MEDIUM" || e.relevance === "HIGH"
  )
}

export async function gatherEvidence(
  input: EvidenceRequest
): Promise<EvidenceResult> {
  // 1. Search (Tavily timeout)
  const searchQuery = `${input.structuredQuestion} ${input.domain}`
  const searchResults = await withTimeout("tavily", TAVILY_TIMEOUT_MS, (signal) =>
    tavilySearch(searchQuery, signal)
  )

  if (searchResults.length === 0) {
    throw new InsufficientEvidenceError("NO_SEARCH_RESULTS")
  }

  // 2. Format results for AI
  const formattedResults = formatSearchResults(searchResults)

  // 3. AI analysis
  const prompt = `Forecast Question: ${input.structuredQuestion}
Domain: ${input.domain}
${input.deadlineSuggestion ? `Deadline: ${input.deadlineSuggestion}` : ""}
${input.resolutionCriteria ? `Resolution Criteria: ${input.resolutionCriteria}` : ""}

Search Results:
${formattedResults}

Analyze each search result as evidence for or against the forecast question.

Output a JSON object with these exact fields:
- "evidence" (array of objects, each with: title (string), url (string), source (string), publishedDate (string, optional), summary (string), direction (SUPPORT/OPPOSE/NEUTRAL), credibility (LOW/MEDIUM/HIGH), relevance (LOW/MEDIUM/HIGH), reasoning (string))
- "searchSummary" (string): Overall summary of search results
- "limitations" (string[]): Gaps or limitations in the evidence`

  // 3. AI analysis (DeepSeek timeout)
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

  const parsed = evidenceResultSchema.safeParse(object)
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`AI returned invalid evidence: ${errors}`)
  }

  const usable = getUsableEvidence(parsed.data.evidence)
  if (usable.length === 0) {
    throw new InsufficientEvidenceError("NO_RELEVANT_EVIDENCE")
  }

  return {
    evidence: usable,
    searchSummary: parsed.data.searchSummary,
    limitations: parsed.data.limitations,
  }
}
