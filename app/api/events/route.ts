import { NextResponse } from 'next/server';
import { ensureSchema, enforceWriteLimit, getDatabase } from '@/lib/db';
import { publicEventSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = publicEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  }

  await ensureSchema();
  const eventDay = new Date().toISOString().slice(0, 10);
  const existingAnonymousId = readAnonymousId(request.headers.get('cookie'));
  const anonymousId = existingAnonymousId ?? crypto.randomUUID();
  const visitorKey = await dailyVisitorKey(anonymousId, eventDay);

  try {
    await enforceWriteLimit(`public:${visitorKey}`, 20);
  } catch {
    return NextResponse.json({ error: 'Too many events.' }, { status: 429 });
  }

  const now = new Date().toISOString();
  await getDatabase()
    .prepare(`INSERT OR IGNORE INTO public_events (
      id, visitor_key, event_name, tool, source, event_day, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      crypto.randomUUID(),
      visitorKey,
      parsed.data.eventName,
      parsed.data.tool,
      parsed.data.source,
      eventDay,
      now,
    )
    .run();

  const response = new NextResponse(null, { status: 204 });
  if (!existingAnonymousId) {
    response.cookies.set('fos_anon', anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

function readAnonymousId(cookieHeader: string | null) {
  const value = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('fos_anon='))
    ?.slice('fos_anon='.length);
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

async function dailyVisitorKey(anonymousId: string, day: string) {
  const bytes = new TextEncoder().encode(
    `futureos-public-events-v1:${day}:${anonymousId}`,
  );
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
