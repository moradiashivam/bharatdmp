const test = require('node:test');
const assert = require('node:assert');
const t = require('../src/services/template.service');

const form = {
  sections: [{ id: 1, title: 'A', fields: [
    { id: 10, section_id: 1, type_code: 'short_text', field_name: 'title', field_label: 'Title', is_required: 1, options: [] },
    { id: 11, section_id: 1, type_code: 'single_select', field_name: 'kind', field_label: 'Kind', is_required: 0, options: [{ option_label: 'X', option_value: 'x' }] },
  ] }],
  rules: [{ target_field_id: 11, source_field_id: 10, operator: 'is_not_empty', compare_value: null, action: 'show' }],
};
form.fields = form.sections[0].fields;

test('snapshot + pin drops deleted fields and their rules', () => {
  const snap = t.buildSnapshot(form);
  const pinned = t.pinForm(JSON.parse(JSON.stringify(snap)), [11]);
  assert.deepStrictEqual(pinned.fields.map((f) => f.id), [11]);
  assert.strictEqual(pinned.rules.length, 0);
  assert.strictEqual(t.pinForm(snap, [10, 11]).rules.length, 1);
});

test('diff reports added, changed and removed fields', () => {
  const a = t.buildSnapshot(form);
  const b = JSON.parse(JSON.stringify(a));
  b.fields[0].field_label = 'Project title';
  b.fields.splice(1, 1);
  b.fields.push({ id: 12, field_label: 'New' });
  const kinds = t.diffVersions(a, b).map((c) => c.kind).sort();
  assert.deepStrictEqual(kinds, ['added', 'changed', 'removed']);
});

test('validation rules', () => {
  assert.match(t.validateAnswer({ type_code: 'long_text', word_max: 3 }, 'one two three four'), /3 words/);
  assert.strictEqual(t.validateAnswer({ type_code: 'long_text', word_max: 3 }, 'one two three'), null);
  assert.match(t.validateAnswer({ type_code: 'number', min_value: 5 }, '2'), /at least 5/);
  assert.match(t.validateAnswer({ type_code: 'date', date_max: '2027-01-01' }, '2027-05-01'), /on or before/);
  assert.strictEqual(t.validateAnswer({ type_code: 'short_text', regex: '\\d{4}', regex_message: 'Four digits' }, '12a4'), 'Four digits');
  assert.strictEqual(t.validateAnswer({ type_code: 'short_text', regex: '\\d{4}' }, '1234'), null);
  assert.match(t.validateAnswer({ type_code: 'storage_size', max_value: 1024 }, '2 TB'), /at most 1024/);
  assert.strictEqual(t.storageToGb('512 MB'), 0.5);
  assert.strictEqual(t.validateAnswer({ type_code: 'short_text', word_max: 1 }, ''), null);
});

test('export -> import check round-trip', () => {
  const json = JSON.parse(JSON.stringify(t.exportTemplate({ name: 'Call' }, form)));
  const c = t.checkImport(json, ['short_text', 'single_select']);
  assert.ok(c.ok, c.errors.join());
  assert.strictEqual(c.summary.fields, 2);
  assert.strictEqual(c.summary.rules, 1);
  const bad = t.checkImport({ name: 'x', sections: [{ title: 'S', fields: [{ field_label: 'Q', type_code: 'nope' }] }] }, ['short_text']);
  assert.strictEqual(bad.ok, false);
  assert.strictEqual(t.checkImport(null, []).ok, false);
});
