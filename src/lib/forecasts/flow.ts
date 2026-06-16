/**
 * Minimal flow control helpers for the create-forecast wizard.
 * These predicates mirror the inline guards in src/app/create/page.tsx
 * to enable direct testing of flow transitions without component rendering.
 */

export function canEstimateProbability(evidence: unknown): boolean {
  return evidence != null
}

export function canSaveForecast(
  estimate: unknown,
  evidence: unknown,
  structured: unknown
): boolean {
  return estimate != null && evidence != null && structured != null
}
