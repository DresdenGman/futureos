import { z } from 'zod';

import { DELETE_ALL_DATA_PHRASE } from './data-deletion-contract.ts';

export { DELETE_ALL_DATA_PHRASE } from './data-deletion-contract.ts';

export const deleteDecisionRequestSchema = z
  .object({
    confirmation: z.string().trim().min(1).max(120),
  })
  .strict();

export const deleteAllDataRequestSchema = z
  .object({
    confirmation: z.literal(DELETE_ALL_DATA_PHRASE),
  })
  .strict();

export function isSameOriginDestructiveRequest(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export async function deleteOwnedDecision(
  db: D1Database,
  userId: string,
  decisionId: string,
  confirmation: string,
) {
  const owned = await db
    .prepare('SELECT title FROM decisions WHERE id = ? AND user_id = ?')
    .bind(decisionId, userId)
    .first<{ title: string }>();

  if (!owned) return { status: 'not_found' as const };
  if (confirmation !== owned.title)
    return { status: 'confirmation_mismatch' as const };

  const results = await db.batch([
    db
      .prepare(
        'DELETE FROM belief_updates WHERE decision_id = ? AND user_id = ?',
      )
      .bind(decisionId, userId),
    db
      .prepare('DELETE FROM decisions WHERE id = ? AND user_id = ?')
      .bind(decisionId, userId),
  ]);

  const decisionChanges = Number(results[1]?.meta.changes ?? 0);
  if (!decisionChanges) return { status: 'not_found' as const };

  return {
    status: 'deleted' as const,
    deletedDecisions: decisionChanges,
    deletedUpdates: Number(results[0]?.meta.changes ?? 0),
  };
}

export async function deleteAllOwnedDecisionData(
  db: D1Database,
  userId: string,
) {
  const results = await db.batch([
    db.prepare('DELETE FROM belief_updates WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM decisions WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM request_limits WHERE user_id = ?').bind(userId),
  ]);

  return {
    deletedUpdates: Number(results[0]?.meta.changes ?? 0),
    deletedDecisions: Number(results[1]?.meta.changes ?? 0),
  };
}
