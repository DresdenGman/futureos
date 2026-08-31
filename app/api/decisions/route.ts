import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {
  ensureSchema,
  enforceWriteLimit,
  getDatabase,
  mapDecision,
  type DecisionRow,
} from '@/lib/db';
import { createDecisionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await ensureSchema();
  const rows = await getDatabase()
    .prepare(`SELECT id, title, question, success_criteria, deadline, selected_option,
      expected_value, reversibility, probability, reversal_trigger, status, outcome,
      outcome_note, outcome_metric, created_at, updated_at
      FROM decisions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100`)
    .bind(user.userId)
    .all<DecisionRow>();

  return NextResponse.json({ decisions: rows.results.map(mapDecision) });
}

export async function POST(request: Request) {
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
  const parsed = createDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please complete every decision field.' },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const value = parsed.data;
  const db = getDatabase();
  await db.batch([
    db
      .prepare(`INSERT INTO decisions (
      id, user_id, title, question, success_criteria, deadline, selected_option,
      expected_value, reversibility, probability, reversal_trigger, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`)
      .bind(
        id,
        user.userId,
        value.title,
        value.question,
        value.successCriteria,
        value.deadline,
        value.selectedOption,
        value.expectedValue,
        value.reversibility,
        value.probability,
        value.reversalTrigger,
        now,
        now,
      ),
    db
      .prepare(`INSERT INTO belief_updates (id, decision_id, user_id, probability, evidence, created_at)
      VALUES (?, ?, ?, ?, '__BASELINE__', ?)`)
      .bind(crypto.randomUUID(), id, user.userId, value.probability, now),
  ]);

  return NextResponse.json({ id }, { status: 201 });
}
