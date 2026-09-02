import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {
  deleteAllDataRequestSchema,
  deleteAllOwnedDecisionData,
  isSameOriginDestructiveRequest,
} from '@/lib/data-deletion';
import { ensureSchema, enforceWriteLimit, getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  if (!isSameOriginDestructiveRequest(request))
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });

  await ensureSchema();
  try {
    await enforceWriteLimit(user.userId, 10);
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

  const parsed = deleteAllDataRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Type the complete confirmation phrase.' },
      { status: 400 },
    );

  const result = await deleteAllOwnedDecisionData(getDatabase(), user.userId);
  const response = NextResponse.json({ ok: true, ...result });
  response.cookies.set('fos_anon', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
