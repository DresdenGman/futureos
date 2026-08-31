import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const decisions = sqliteTable(
  'decisions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    question: text('question').notNull(),
    successCriteria: text('success_criteria').notNull(),
    deadline: text('deadline').notNull(),
    selectedOption: text('selected_option').notNull(),
    expectedValue: integer('expected_value').notNull(),
    reversibility: integer('reversibility').notNull(),
    probability: integer('probability').notNull(),
    reversalTrigger: text('reversal_trigger').notNull(),
    status: text('status').notNull().default('open'),
    outcome: integer('outcome', { mode: 'boolean' }),
    outcomeNote: text('outcome_note'),
    outcomeMetric: text('outcome_metric'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_decisions_user_status').on(table.userId, table.status),
    index('idx_decisions_user_updated').on(table.userId, table.updatedAt),
  ],
);

export const beliefUpdates = sqliteTable(
  'belief_updates',
  {
    id: text('id').primaryKey(),
    decisionId: text('decision_id').notNull(),
    userId: text('user_id').notNull(),
    probability: integer('probability').notNull(),
    evidence: text('evidence').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_updates_decision_created').on(table.decisionId, table.createdAt),
    index('idx_updates_user').on(table.userId),
  ],
);

export const requestLimits = sqliteTable(
  'request_limits',
  {
    userId: text('user_id').notNull(),
    bucket: text('bucket').notNull(),
    count: integer('count').notNull().default(1),
  },
  (table) => [
    uniqueIndex('idx_request_limits_user_bucket').on(
      table.userId,
      table.bucket,
    ),
  ],
);

export const publicEvents = sqliteTable(
  'public_events',
  {
    id: text('id').primaryKey(),
    visitorKey: text('visitor_key').notNull(),
    eventName: text('event_name').notNull(),
    tool: text('tool').notNull(),
    source: text('source').notNull(),
    eventDay: text('event_day').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_public_events_unique_daily').on(
      table.visitorKey,
      table.eventName,
      table.tool,
      table.eventDay,
    ),
    index('idx_public_events_day_tool').on(table.eventDay, table.tool),
    index('idx_public_events_source').on(table.source),
  ],
);
