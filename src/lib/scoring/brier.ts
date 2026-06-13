/**
 * Calculate the Brier Score for a binary forecast.
 *
 * Brier Score = (p - o)²
 * where p is the predicted probability and o is the actual outcome (1 for YES, 0 for NO).
 *
 * A lower score indicates better calibration:
 * - 0.00 = perfect prediction
 * - 1.00 = worst possible prediction
 * - 0.25 = baseline (random 50% guess)
 */
export function calculateBinaryBrierScore(
  probability: number,
  outcome: "YES" | "NO"
): number {
  if (probability < 0 || probability > 1) {
    throw new Error(
      `Probability must be between 0 and 1, got ${probability}`
    )
  }

  const actual = outcome === "YES" ? 1 : 0
  const score = (probability - actual) ** 2

  return Math.round(score * 1_000_000) / 1_000_000
}
