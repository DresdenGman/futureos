import type { EvidenceResult } from "@/lib/ai/evidence/schema"
import type { ProbabilityEstimate } from "@/lib/ai/probability/schema"

/**
 * Flow control guards used by the create-forecast wizard.
 * These are the single source of truth for step transitions;
 * src/app/create/page.tsx imports and calls them directly.
 */

export function canEstimateProbability(
  evidence: EvidenceResult | null
): evidence is EvidenceResult {
  return evidence != null
}

export function canSaveForecast(
  estimate: ProbabilityEstimate | null
): estimate is ProbabilityEstimate {
  return estimate != null
}
