import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { ensureSchema, enforceWriteLimit, getDatabase } from '@/lib/db';
import { updateBeliefSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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
  const parsed = updateBeliefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Add a short evidence note and a probability from 1–99%.' },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const db = getDatabase();
  const owned = await db
    .prepare(
      "SELECT id FROM decisions WHERE id = ? AND user_id = ? AND status = 'open'",
    )
    .bind(id, user.userId)
    .first<{ id: string }>();
  if (!owned)
    return NextResponse.json(
      { error: 'Open decision not found.' },
      { status: 404 },
    );

  const now = new Date().toISOString();
  const updateId = crypto.randomUUID();
  await db.batch([
    db
      .prepare(`INSERT INTO belief_updates (id, decision_id, user_id, probability, evidence, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(
        updateId,
        id,
        user.userId,
        parsed.data.probability,
        parsed.data.evidence,
        now,
      ),
    db
      .prepare(
        'UPDATE decisions SET probability = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      )
      .bind(parsed.data.probability, now, id, user.userId),
  ]);
  return NextResponse.json({ ok: true, id: updateId }, { status: 201 });
}
