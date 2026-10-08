const test = require('node:test');
const assert = require('node:assert');
const { weightedScore, average, diffSnapshots, pickRoundRobin, dueDate, isOverdue } = require('../src/services/review.service');

test('weighted score respects weights and max scores', () => {
  const criteria = [{ id: 1, max_score: 5, weight: 1 }, { id: 2, max_score: 10, weight: 3 }];
  assert.strictEqual(weightedScore({ 1: 5, 2: 5 }, criteria), 62.5); // (1*1 + 0.5*3)/4
  assert.strictEqual(weightedScore({ 1: 9 }, criteria), 100); // clamps to max, only scored criteria count
  assert.strictEqual(weightedScore({}, criteria), null);
});

test('average ignores missing values', () => {
  assert.strictEqual(average([80, null, 70]), 75);
  assert.strictEqual(average([]), null);
});

test('diff lists only changed, added and removed answers', () => {
  const v1 = { sections: [{ title: 'A', fields: [{ id: 1, label: 'Q1', value: 'old' }, { id: 2, label: 'Q2', value: 'same' }, { id: 3, label: 'Q3', value: 'gone' }] }] };
  const v2 = { sections: [{ title: 'A', fields: [{ id: 1, label: 'Q1', value: 'new' }, { id: 2, label: 'Q2', value: 'same ' }, { id: 4, label: 'Q4', value: ['x'] }] }] };
  const d = diffSnapshots(v1, v2);
  assert.deepStrictEqual(d.map((c) => [c.id, c.kind]).sort(), [['1', 'changed'], ['3', 'removed'], ['4', 'added']]);
});

test('round-robin picks the lightest workload first', () => {
  const people = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.deepStrictEqual(pickRoundRobin(people, { 1: 4, 2: 0, 3: 1 }, 2).map((p) => p.id), [2, 3]);
  assert.deepStrictEqual(pickRoundRobin(people, {}, 1, [1]).map((p) => p.id), [2]);
});

test('due dates and overdue flags', () => {
  assert.strictEqual(dueDate(7, new Date('2026-10-01T00:00:00Z')), '2026-10-08');
  assert.strictEqual(isOverdue({ status: 'assigned', due_at: '2026-10-01' }, '2026-10-02'), true);
  assert.strictEqual(isOverdue({ status: 'completed', due_at: '2026-10-01' }, '2026-10-02'), false);
  assert.strictEqual(isOverdue({ status: 'assigned', due_at: '2026-10-05' }, '2026-10-02'), false);
});
