import { generateObject } from "ai"
import { getModel } from "@/lib/ai/client"
import { tavilySearch, type TavilyResult } from "@/lib/search/tavily"
import {
  evidenceResultSchema,
  type EvidenceRequest,
  type EvidenceResult,
} from "./schema"

const SYSTEM_PROMPT = `You are a rigorous evidence analyst for FutureOS, an AI-powered probabilistic forecasting platform.

Your job: Analyze search results and classify them as evidence for or against a binary prediction question.

CRITICAL RULES:
1. ONLY use the search results provided. Do NOT fabricate any information.
2. Do NOT predict the outcome. Do NOT give probabilities or conclusions.
3. Each evidence item MUST come from a provided search result URL.
4. For each result, determine:
   - direction: Does it SUPPORT the event happening, OPPOSE it, or is it NEUTRAL?
   - credibility: How trustworthy is the source? (LOW / MEDIUM / HIGH)
   - relevance: How directly related to the forecast question? (LOW / MEDIUM / HIGH)
   - reasoning: Explain WHY this evidence is relevant to the question.
5. Write a concise summary (1-3 sentences) for each piece of evidence.
6. In searchSummary, summarize what the overall search landscape looks like (evidence coverage, quality, recency).
7. In limitations, note any gaps: missing data, old information, conflicting evidence, lack of authoritative sources, etc.
8. If search results are insufficient, note this clearly in limitations. Do not invent evidence.
9. Never fabricate URLs, dates, or source names.`

function formatSearchResults(results: TavilyResult[]): string {
  return results
    .map(
      (r, i) =>
        `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nSource: ${new URL(r.url).hostname}\nDate: ${r.published_date || "unknown"}\nContent: ${r.content}`
    )
    .join("\n\n---\n\n")
}

export async function gatherEvidence(
  input: EvidenceRequest
): Promise<EvidenceResult> {
  // 1. Search
  const searchQuery = `${input.structuredQuestion} ${input.domain}`
  const searchResults = await tavilySearch(searchQuery)

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

  const { object } = await generateObject({
    model: getModel(),
    output: "no-schema",
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.3,
  })

  const parsed = evidenceResultSchema.safeParse(object)
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`AI returned invalid evidence: ${errors}`)
  }

  return parsed.data
}
