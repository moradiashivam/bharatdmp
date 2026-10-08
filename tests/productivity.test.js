const test = require('node:test');
const assert = require('node:assert');
const p = require('../src/services/productivity.service');

const form = {
  rules: [],
  sections: [
    { id: 1, title: 'Admin', fields: [
      { id: 1, field_label: 'Name', type_code: 'short_text', is_required: 1 },
      { id: 2, field_label: 'Note', type_code: 'information', is_required: 1 },
      { id: 3, field_label: 'Summary', type_code: 'long_text', is_required: 1 } ] },
    { id: 2, title: 'Data', fields: [{ id: 4, field_label: 'Optional', type_code: 'short_text', is_required: 0 }] },
  ],
};

test('completeness counts required answers and lists blockers', () => {
  const r = p.completeness(form, { 1: 'Ana' });
  assert.strictEqual(r.total, 2);
  assert.strictEqual(r.done, 1);
  assert.strictEqual(r.percent, 50);
  assert.deepStrictEqual(r.blockers.map((b) => b.id), [3]);
  assert.strictEqual(r.sections[1].percent, 0); // optional-only section shows answered share
  assert.strictEqual(r.ready, false);
});

test('required languages count toward completeness', () => {
  const ml = { required: true, types: ['long_text'], extras: [{ id: 9, name: 'Hindi' }] };
  const r = p.completeness(form, { 1: 'Ana', 3: 'Text' }, {}, ml);
  assert.strictEqual(r.blockers.length, 1);
  assert.match(r.blockers[0].reason, /Hindi/);
  assert.ok(p.completeness(form, { 1: 'Ana', 3: 'Text' }, { 3: { 9: 'पाठ' } }, ml).ready);
});

test('clone maps by master field, then name, and flags the rest', () => {
  const src = [
    { id: 1, master_field_id: 10, type_code: 'long_text' },
    { id: 2, field_name: 'storage_12345', type_code: 'short_text' },
    { id: 3, master_field_id: 11, type_code: 'short_text' },
    { id: 4, master_field_id: 12, type_code: 'short_text' },
  ];
  const tgt = [
    { id: 21, master_field_id: 10, type_code: 'long_text' },
    { id: 22, field_name: 'storage_99999', type_code: 'short_text' },
    { id: 24, master_field_id: 12, type_code: 'number' },
  ];
  const r = p.mapClone(src, tgt, { 1: 'a', 2: 'b', 3: 'c', 4: 'd' });
  assert.deepStrictEqual(r.mapped.map((m) => [m.from.id, m.to.id]), [[1, 21], [2, 22]]);
  assert.deepStrictEqual(r.unmapped.map((f) => f.id), [3]);
  assert.deepStrictEqual(r.typeMismatch.map((m) => m.from.id), [4]);
});

test('prefill uses explicit setting, name hints, and respects none', () => {
  assert.strictEqual(p.prefillSource({ field_name: 'researcher_name' }), 'name');
  assert.strictEqual(p.prefillSource({ field_name: 'x', prefill_source: 'grant_number' }), 'grant_number');
  assert.strictEqual(p.prefillSource({ field_name: 'orcid', prefill_source: 'none' }), null);
  assert.strictEqual(p.prefillValue('orcid', {}, { orcid: ' 0000-0001 ' }), '0000-0001');
  assert.strictEqual(p.prefillValue('grant_number', {}, {}), null);
});

test('guidance links accept only http(s)', () => {
  assert.deepStrictEqual(p.parseLinks('Guide | https://a.org\njavascript:alert(1)\nhttps://b.org'),
    [{ title: 'Guide', url: 'https://a.org' }, { title: 'https://b.org', url: 'https://b.org' }]);
});
