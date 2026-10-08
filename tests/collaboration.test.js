const test = require('node:test');
const assert = require('node:assert');
const { can, mentionedUsers, newToken, INVITABLE } = require('../src/services/collaboration.service');

test('role rules are enforced per action', () => {
  assert.ok(can('owner', 'submit') && can('owner', 'manage') && can('owner', 'edit'));
  assert.ok(can('editor', 'edit') && !can('editor', 'submit') && !can('editor', 'manage'));
  assert.ok(can('commenter', 'comment') && !can('commenter', 'edit'));
  assert.ok(can('viewer', 'view') && !can('viewer', 'comment'));
  assert.ok(!can(null, 'view') && !can('owner', 'nonsense'));
  assert.deepStrictEqual(INVITABLE, ['editor', 'commenter', 'viewer']);
});

test('@mentions match first name, full name or email', () => {
  const team = [{ id: 1, name: 'Ravi Shah', email: 'ravi@uni.edu' }, { id: 2, name: 'Anita Rao', email: 'anita@uni.edu' }, { id: 3, name: 'Bo', email: 'bo@x.org' }];
  assert.deepStrictEqual(mentionedUsers('@ravi please check', team).map((m) => m.id), [1]);
  assert.deepStrictEqual(mentionedUsers('cc @AnitaRao and @bo@x.org', team).map((m) => m.id), [2, 3]);
  assert.deepStrictEqual(mentionedUsers('no tags here', team), []);
});

test('invite tokens are long and unique', () => {
  const a = newToken(); const b = newToken();
  assert.strictEqual(a.length, 48); assert.notStrictEqual(a, b);
});
