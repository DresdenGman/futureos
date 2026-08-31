import { env } from 'cloudflare:workers';
import type { Decision } from '@/lib/types';

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error('FutureOS database is unavailable.');
  return env.DB;
}

export async function ensureSchema() {
  const db = getDatabase();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      success_criteria TEXT NOT NULL,
      deadline TEXT NOT NULL,
      selected_option TEXT NOT NULL,
      expected_value INTEGER NOT NULL,
      reversibility INTEGER NOT NULL,
      probability INTEGER NOT NULL,
      reversal_trigger TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      outcome INTEGER,
      outcome_note TEXT,
      outcome_metric TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS belief_updates (
      id TEXT PRIMARY KEY NOT NULL,
      decision_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      probability INTEGER NOT NULL,
      evidence TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS request_limits (
      user_id TEXT NOT NULL,
      bucket TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS public_events (
      id TEXT PRIMARY KEY NOT NULL,
      visitor_key TEXT NOT NULL,
      event_name TEXT NOT NULL,
      tool TEXT NOT NULL,
      source TEXT NOT NULL,
      event_day TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_decisions_user_status ON decisions(user_id, status)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_decisions_user_updated ON decisions(user_id, updated_at)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_updates_decision_created ON belief_updates(decision_id, created_at)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_updates_user ON belief_updates(user_id)',
    ),
    db.prepare(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_request_limits_user_bucket ON request_limits(user_id, bucket)',
    ),
    db.prepare(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_public_events_unique_daily ON public_events(visitor_key, event_name, tool, event_day)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_public_events_day_tool ON public_events(event_day, tool)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_public_events_source ON public_events(source)',
    ),
    db.prepare('PRAGMA optimize'),
  ]);
}

export async function enforceWriteLimit(userId: string, limit = 40) {
  const db = getDatabase();
  const bucket = new Date().toISOString().slice(0, 16);
  await db
    .prepare(`INSERT INTO request_limits (user_id, bucket, count) VALUES (?, ?, 1)
      ON CONFLICT(user_id, bucket) DO UPDATE SET count = count + 1`)
    .bind(userId, bucket)
    .run();
  const row = await db
    .prepare(
      'SELECT count FROM request_limits WHERE user_id = ? AND bucket = ?',
    )
    .bind(userId, bucket)
    .first<{ count: number }>();
  if ((row?.count ?? 0) > limit) throw new Error('RATE_LIMITED');
}

type DecisionRow = {
  id: string;
  title: string;
  question: string;
  success_criteria: string;
  deadline: string;
  selected_option: string;
  expected_value: number;
  reversibility: number;
  probability: number;
  reversal_trigger: string;
  status: 'open' | 'resolved';
  outcome: number | null;
  outcome_note: string | null;
  outcome_metric: string | null;
  created_at: string;
  updated_at: string;
};

export function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    title: row.title,
    question: row.question,
    successCriteria: row.success_criteria,
    deadline: row.deadline,
    selectedOption: row.selected_option,
    expectedValue: row.expected_value,
    reversibility: row.reversibility,
    probability: row.probability,
    reversalTrigger: row.reversal_trigger,
    status: row.status,
    outcome: row.outcome === null ? null : row.outcome === 1,
    outcomeNote: row.outcome_note,
    outcomeMetric: row.outcome_metric,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type { DecisionRow };
