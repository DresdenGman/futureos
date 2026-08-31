import type { Decision } from '@/lib/types';

export function decisionScore(
  probability: number,
  expectedValue: number,
  reversibility: number,
) {
  const scaledValue = Math.min(1, Math.log10(Math.max(10, expectedValue)) / 6);
  return Math.round(
    probability * 0.58 + scaledValue * 100 * 0.24 + reversibility * 0.18,
  );
}

export function brierScore(decisions: Decision[]): number | null {
  const resolved = decisions.filter(
    (decision) => decision.status === 'resolved' && decision.outcome !== null,
  );
  if (!resolved.length) return null;
  return (
    resolved.reduce((sum, decision) => {
      const forecast = decision.probability / 100;
      const outcome = decision.outcome ? 1 : 0;
      return sum + (forecast - outcome) ** 2;
    }, 0) / resolved.length
  );
}

export function calibrationScore(decisions: Decision[]): number | null {
  const score = brierScore(decisions);
  return score === null ? null : Math.max(0, Math.round((1 - score) * 100));
}
