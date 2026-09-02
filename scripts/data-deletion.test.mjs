import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DELETE_ALL_DATA_PHRASE,
  deleteAllDataRequestSchema,
  deleteAllOwnedDecisionData,
  deleteDecisionRequestSchema,
  deleteOwnedDecision,
  isSameOriginDestructiveRequest,
} from '../lib/data-deletion.ts';

class FakeStatement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }

  async first() {
    this.database.reads.push({ sql: this.sql, args: this.args });
    return this.database.ownedTitle
      ? { title: this.database.ownedTitle }
      : null;
  }
}

class FakeDatabase {
  constructor(ownedTitle = null) {
    this.ownedTitle = ownedTitle;
    this.reads = [];
    this.batches = [];
  }

  prepare(sql) {
    return new FakeStatement(this, sql);
  }

  async batch(statements) {
    this.batches.push(
      statements.map((statement) => ({
        sql: statement.sql,
        args: statement.args,
      })),
    );
    return statements.map((statement) => ({
      meta: {
        changes: statement.sql.includes('belief_updates') ? 2 : 1,
      },
    }));
  }
}

test('deletion confirmations are strict', () => {
  assert.equal(
    deleteDecisionRequestSchema.safeParse({ confirmation: 'Roadmap' }).success,
    true,
  );
  assert.equal(
    deleteDecisionRequestSchema.safeParse({
      confirmation: 'Roadmap',
      userId: 'attacker-controlled',
    }).success,
    false,
  );
  assert.equal(
    deleteAllDataRequestSchema.safeParse({
      confirmation: DELETE_ALL_DATA_PHRASE,
    }).success,
    true,
  );
  assert.equal(
    deleteAllDataRequestSchema.safeParse({ confirmation: 'delete all' })
      .success,
    false,
  );
});

test('destructive browser requests must be same-origin', () => {
  assert.equal(
    isSameOriginDestructiveRequest(
      new Request('https://futureos.space/api/account/data', {
        headers: {
          origin: 'https://futureos.space',
          'sec-fetch-site': 'same-origin',
        },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOriginDestructiveRequest(
      new Request('https://futureos.space/api/account/data', {
        headers: { 'sec-fetch-site': 'cross-site' },
      }),
    ),
    false,
  );
  assert.equal(
    isSameOriginDestructiveRequest(
      new Request('https://futureos.space/api/account/data', {
        headers: {
          origin: 'https://example.com',
          'sec-fetch-site': 'same-origin',
        },
      }),
    ),
    false,
  );
});

test('single-record deletion requires the owned title and scopes every query', async () => {
  const database = new FakeDatabase('Launch plan');
  const mismatch = await deleteOwnedDecision(
    database,
    'user-1',
    'decision-1',
    'Wrong title',
  );
  assert.equal(mismatch.status, 'confirmation_mismatch');
  assert.equal(database.batches.length, 0);

  const result = await deleteOwnedDecision(
    database,
    'user-1',
    'decision-1',
    'Launch plan',
  );
  assert.equal(result.status, 'deleted');
  assert.deepEqual(database.reads[0].args, ['decision-1', 'user-1']);
  assert.deepEqual(database.batches[0][0].args, ['decision-1', 'user-1']);
  assert.deepEqual(database.batches[0][1].args, ['decision-1', 'user-1']);
});

test('all-data deletion scopes private tables to one authenticated user', async () => {
  const database = new FakeDatabase();
  const result = await deleteAllOwnedDecisionData(database, 'user-7');
  assert.equal(result.deletedDecisions, 1);
  assert.equal(result.deletedUpdates, 2);
  assert.equal(database.batches[0].length, 3);
  for (const statement of database.batches[0]) {
    assert.deepEqual(statement.args, ['user-7']);
    assert.equal(statement.sql.includes('public_events'), false);
  }
});
