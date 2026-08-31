import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {
  ensureSchema,
  getDatabase,
  mapDecision,
  type DecisionRow,
} from '@/lib/db';
import { brierScore, calibrationScore } from '@/lib/decision-math';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  await ensureSchema();
  const db = getDatabase();
  const rows = await db
    .prepare(`SELECT id, title, question, success_criteria, deadline, selected_option,
      expected_value, reversibility, probability, reversal_trigger, status, outcome,
      outcome_note, outcome_metric, created_at, updated_at
      FROM decisions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 250`)
    .bind(user.userId)
    .all<DecisionRow>();
  const decisions = rows.results.map(mapDecision);
  const updates = await db
    .prepare(
      "SELECT COUNT(*) AS count FROM belief_updates WHERE user_id = ? AND evidence != '__BASELINE__'",
    )
    .bind(user.userId)
    .first<{ count: number }>();
  const resolved = decisions.filter(
    (decision) => decision.status === 'resolved',
  ).length;
  const averageConfidence = decisions.length
    ? Math.round(
        decisions.reduce((sum, decision) => sum + decision.probability, 0) /
          decisions.length,
      )
    : 0;
  const insight = {
    total: decisions.length,
    open: decisions.length - resolved,
    resolved,
    averageConfidence,
    brierScore: brierScore(decisions),
    calibrationScore: calibrationScore(decisions),
    updateRate: decisions.length
      ? Math.round(((updates?.count ?? 0) / decisions.length) * 100)
      : 0,
    strongestHabit:
      resolved >= 3
        ? 'Clear resolution discipline'
        : 'Explicit success criteria',
    growthEdge:
      (updates?.count ?? 0) < decisions.length
        ? 'Update beliefs when material evidence arrives'
        : 'Compare against outside base rates',
  };
  return NextResponse.json({ insights: insight, decisions });
}
