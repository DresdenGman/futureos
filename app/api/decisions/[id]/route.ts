import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {
  ensureSchema,
  enforceWriteLimit,
  getDatabase,
  mapDecision,
  type DecisionRow,
} from '@/lib/db';
import type { BeliefUpdate } from '@/lib/types';
import { resolveDecisionSchema } from '@/lib/validation';
import {
  deleteDecisionRequestSchema,
  deleteOwnedDecision,
  isSameOriginDestructiveRequest,
} from '@/lib/data-deletion';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await ensureSchema();
  const { id } = await context.params;
  const db = getDatabase();
  const row = await db
    .prepare(`SELECT id, title, question, success_criteria, deadline, selected_option,
      expected_value, reversibility, probability, reversal_trigger, status, outcome,
      outcome_note, outcome_metric, created_at, updated_at
      FROM decisions WHERE id = ? AND user_id = ?`)
    .bind(id, user.userId)
    .first<DecisionRow>();
  if (!row)
    return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });

  const updateRows = await db
    .prepare(`SELECT id, decision_id, probability, evidence, created_at
      FROM belief_updates WHERE decision_id = ? AND user_id = ? ORDER BY created_at ASC`)
    .bind(id, user.userId)
    .all<{
      id: string;
      decision_id: string;
      probability: number;
      evidence: string;
      created_at: string;
    }>();
  const updates: BeliefUpdate[] = updateRows.results.map((update) => ({
    id: update.id,
    decisionId: update.decision_id,
    probability: update.probability,
    evidence:
      update.evidence === '__BASELINE__'
        ? 'Original forecast captured with the decision contract.'
        : update.evidence,
    createdAt: update.created_at,
    baseline: update.evidence === '__BASELINE__',
  }));

  return NextResponse.json({ decision: { ...mapDecision(row), updates } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  await ensureSchema();
  try {
    await enforceWriteLimit(user.userId);
  } catch {
    return NextResponse.json(
      { error: 'Too many changes. Please wait a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }
  const parsed = resolveDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Outcome details are incomplete.' },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const now = new Date().toISOString();
  const result = await getDatabase()
    .prepare(`UPDATE decisions SET status = 'resolved', outcome = ?, outcome_metric = ?,
      outcome_note = ?, updated_at = ? WHERE id = ? AND user_id = ? AND status = 'open'`)
    .bind(
      parsed.data.outcome ? 1 : 0,
      parsed.data.outcomeMetric,
      parsed.data.outcomeNote,
      now,
      id,
      user.userId,
    )
    .run();
  if (!result.meta.changes) {
    return NextResponse.json(
      { error: 'Open decision not found.' },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  if (!isSameOriginDestructiveRequest(request))
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });

  await ensureSchema();
  try {
    await enforceWriteLimit(user.userId, 20);
  } catch {
    return NextResponse.json(
      { error: 'Too many changes. Please wait a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const parsed = deleteDecisionRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Type the complete decision title.' },
      { status: 400 },
    );

  const { id } = await context.params;
  const result = await deleteOwnedDecision(
    getDatabase(),
    user.userId,
    id,
    parsed.data.confirmation,
  );

  if (result.status === 'not_found')
    return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });
  if (result.status === 'confirmation_mismatch')
    return NextResponse.json(
      { error: 'The confirmation title does not match.' },
      { status: 400 },
    );

  return NextResponse.json({ ok: true, ...result });
}
